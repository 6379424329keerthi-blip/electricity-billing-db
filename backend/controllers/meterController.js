/**
 * Smart Meter Management Controller
 */

const db = require('../config/db');

const getAllMeters = async (req, res, next) => {
  try {
    const { status = '', search = '' } = req.query;

    let queryText = `
      SELECT m.*, c.consumer_number, c.full_name AS consumer_name, c.consumer_category, c.address,
             (SELECT COUNT(*) FROM meter_readings r WHERE r.meter_id = m.meter_id) AS total_readings_count,
             (SELECT current_reading FROM meter_readings r WHERE r.meter_id = m.meter_id ORDER BY reading_date DESC LIMIT 1) AS last_recorded_reading
      FROM smart_meters m
      JOIN consumers c ON m.consumer_id = c.consumer_id
      WHERE 1=1
    `;
    const params = [];

    // Filter by consumer if logged in as consumer
    if (req.user.role === 'CONSUMER') {
      params.push(req.user.user_id);
      queryText += ` AND c.user_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      queryText += ` AND m.meter_status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (m.meter_number ILIKE $${params.length} OR c.full_name ILIKE $${params.length} OR c.consumer_number ILIKE $${params.length})`;
    }

    queryText += ` ORDER BY m.meter_id DESC`;

    const result = await db.query(queryText, params);
    res.json({ success: true, meters: result.rows });
  } catch (err) {
    next(err);
  }
};

const createMeter = async (req, res, next) => {
  try {
    const { meter_number, consumer_id, installation_date, meter_type, meter_status } = req.body;

    // Check if meter_number exists
    const checkRes = await db.query('SELECT meter_id FROM smart_meters WHERE meter_number = $1', [meter_number.trim()]);
    if (checkRes.rows.length > 0) {
      return res.status(409).json({ success: false, message: `Meter number '${meter_number}' is already registered.` });
    }

    // Check consumer exists
    const consCheck = await db.query('SELECT consumer_id FROM consumers WHERE consumer_id = $1', [consumer_id]);
    if (consCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Specified consumer does not exist.' });
    }

    const insertText = `
      INSERT INTO smart_meters (meter_number, consumer_id, installation_date, meter_type, meter_status, last_communication_at)
      VALUES ($1, $2, COALESCE($3, CURRENT_DATE), COALESCE($4, 'Digital Smart 3-Phase'), COALESCE($5, 'ACTIVE'), NOW())
      RETURNING *
    `;
    const result = await db.query(insertText, [
      meter_number.trim(),
      consumer_id,
      installation_date || null,
      meter_type || 'Digital Smart 3-Phase',
      meter_status || 'ACTIVE',
    ]);

    const newMeter = result.rows[0];

    // Audit log
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'REGISTER_METER', 'smart_meters', $2, $3)`,
      [req.user.user_id, newMeter.meter_id, `Registered smart meter ${meter_number} for consumer #${consumer_id}`]
    );

    res.status(201).json({
      success: true,
      message: 'Smart meter registered successfully.',
      meter: newMeter,
    });
  } catch (err) {
    next(err);
  }
};

const updateMeter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { meter_status, meter_type } = req.body;

    const updateText = `
      UPDATE smart_meters
      SET meter_status = COALESCE($1, meter_status),
          meter_type = COALESCE($2, meter_type),
          last_communication_at = NOW()
      WHERE meter_id = $3
      RETURNING *
    `;
    const result = await db.query(updateText, [meter_status, meter_type, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Smart meter not found.' });
    }

    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'UPDATE_METER', 'smart_meters', $2, $3)`,
      [req.user.user_id, id, `Updated smart meter #${id} status: ${meter_status}`]
    );

    res.json({
      success: true,
      message: 'Smart meter updated successfully.',
      meter: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

const getMeterReadings = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Authorization: If logged in as CONSUMER, verify ownership of meter
    if (req.user.role === 'CONSUMER') {
      const ownerCheck = await db.query(
        `SELECT m.meter_id FROM smart_meters m
         JOIN consumers c ON m.consumer_id = c.consumer_id
         WHERE m.meter_id = $1 AND c.user_id = $2`,
        [id, req.user.user_id]
      );
      if (ownerCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view readings for this meter.',
        });
      }
    }

    const result = await db.query(
      `SELECT r.*, u.full_name AS recorded_by_name
       FROM meter_readings r
       LEFT JOIN users u ON r.recorded_by = u.user_id
       WHERE r.meter_id = $1
       ORDER BY r.reading_date DESC`,
      [id]
    );

    res.json({ success: true, readings: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllMeters,
  createMeter,
  updateMeter,
  getMeterReadings,
};
