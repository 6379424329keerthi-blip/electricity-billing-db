/**
 * Meter Reading Management & Smart Simulation Controller
 */

const db = require('../config/db');

const getAllReadings = async (req, res, next) => {
  try {
    const { meter_id = '', search = '', limit = 50, page = 1 } = req.query;

    let queryText = `
      SELECT r.*, m.meter_number, m.meter_type, c.consumer_id, c.consumer_number,
             c.full_name AS consumer_name, c.consumer_category,
             u.full_name AS recorded_by_name,
             (SELECT b.bill_id FROM bills b WHERE b.reading_id = r.reading_id) AS generated_bill_id
      FROM meter_readings r
      JOIN smart_meters m ON r.meter_id = m.meter_id
      JOIN consumers c ON m.consumer_id = c.consumer_id
      LEFT JOIN users u ON r.recorded_by = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'CONSUMER') {
      params.push(req.user.user_id);
      queryText += ` AND c.user_id = $${params.length}`;
    }

    if (meter_id) {
      params.push(meter_id);
      queryText += ` AND r.meter_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (m.meter_number ILIKE $${params.length} OR c.full_name ILIKE $${params.length} OR c.consumer_number ILIKE $${params.length})`;
    }

    queryText += ` ORDER BY r.reading_date DESC, r.reading_id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    params.push(parseInt(limit, 10), offset);

    const countQuery = `
      SELECT COUNT(*) FROM meter_readings r
      JOIN smart_meters m ON r.meter_id = m.meter_id
      JOIN consumers c ON m.consumer_id = c.consumer_id
      WHERE 1=1
      ${req.user.role === 'CONSUMER' ? `AND c.user_id = $1` : ''}
      ${meter_id ? `AND r.meter_id = $${req.user.role === 'CONSUMER' ? 2 : 1}` : ''}
      ${search ? `AND (m.meter_number ILIKE $${(req.user.role === 'CONSUMER' ? 1 : 0) + (meter_id ? 1 : 0) + 1} OR c.full_name ILIKE $${(req.user.role === 'CONSUMER' ? 1 : 0) + (meter_id ? 1 : 0) + 1} OR c.consumer_number ILIKE $${(req.user.role === 'CONSUMER' ? 1 : 0) + (meter_id ? 1 : 0) + 1})` : ''}
    `;
    const countParams = params.slice(0, params.length - 2); // Exclude LIMIT and OFFSET
    const countRes = await db.query(countQuery, countParams);
    const result = await db.query(queryText, params);

    res.json({
      success: true,
      readings: result.rows,
      total: parseInt(countRes.rows[0].count, 10),
    });
  } catch (err) {
    next(err);
  }
};

const createReading = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { meter_id, previous_reading, current_reading, reading_date, reading_type = 'Regular' } = req.body;

    const prev = parseFloat(previous_reading);
    const curr = parseFloat(current_reading);

    if (curr < prev) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: Current reading cannot be lower than the previous reading.',
      });
    }

    const consumption_units = parseFloat((curr - prev).toFixed(2));

    await client.query('BEGIN');

    // Check duplicate reading for same meter and date
    const dupCheck = await client.query(
      'SELECT reading_id FROM meter_readings WHERE meter_id = $1 AND reading_date = $2',
      [meter_id, reading_date]
    );

    if (dupCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `A meter reading for meter #${meter_id} on date ${reading_date} has already been recorded.`,
      });
    }

    const insertText = `
      INSERT INTO meter_readings (meter_id, previous_reading, current_reading, consumption_units, reading_date, reading_type, recorded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await client.query(insertText, [
      meter_id,
      prev,
      curr,
      consumption_units,
      reading_date,
      reading_type,
      req.user.user_id,
    ]);

    const newReading = result.rows[0];

    // Update meter last communication timestamp
    await client.query(
      'UPDATE smart_meters SET last_communication_at = NOW() WHERE meter_id = $1',
      [meter_id]
    );

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'RECORD_READING', 'meter_readings', $2, $3)`,
      [
        req.user.user_id,
        newReading.reading_id,
        `Recorded reading for meter #${meter_id}: prev=${prev}, curr=${curr}, consumed=${consumption_units} kWh`,
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Meter reading recorded successfully.',
      reading: newReading,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const getReadingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT r.*, m.meter_number, m.meter_type, c.consumer_number, c.full_name AS consumer_name,
              c.consumer_category, c.user_id AS consumer_user_id, u.full_name AS recorded_by_name
       FROM meter_readings r
       JOIN smart_meters m ON r.meter_id = m.meter_id
       JOIN consumers c ON m.consumer_id = c.consumer_id
       LEFT JOIN users u ON r.recorded_by = u.user_id
       WHERE r.reading_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Meter reading not found.' });
    }

    const reading = result.rows[0];

    // Authorization: If logged in as CONSUMER, verify ownership of reading
    if (req.user.role === 'CONSUMER' && reading.consumer_user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this meter reading.',
      });
    }

    res.json({ success: true, reading });
  } catch (err) {
    next(err);
  }
};

const getLatestMeterReading = async (req, res, next) => {
  try {
    const { meterId } = req.params;

    // Authorization: If logged in as CONSUMER, verify ownership of meter
    if (req.user.role === 'CONSUMER') {
      const meterCheck = await db.query(
        `SELECT m.meter_id FROM smart_meters m
         JOIN consumers c ON m.consumer_id = c.consumer_id
         WHERE m.meter_id = $1 AND c.user_id = $2`,
        [meterId, req.user.user_id]
      );
      if (meterCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view readings for this meter.',
        });
      }
    }

    const result = await db.query(
      `SELECT * FROM meter_readings 
       WHERE meter_id = $1 
       ORDER BY reading_date DESC, reading_id DESC 
       LIMIT 1`,
      [meterId]
    );

    res.json({
      success: true,
      latestReading: result.rows.length > 0 ? result.rows[0] : null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllReadings,
  createReading,
  getReadingById,
  getLatestMeterReading,
};
