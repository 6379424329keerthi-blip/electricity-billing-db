/**
 * Consumer Management Controller
 */

const db = require('../config/db');

const getAllConsumers = async (req, res, next) => {
  try {
    const { search = '', category = '', status = '', page = 1, limit = 50 } = req.query;

    // If logged in as CONSUMER, restrict to own profile
    if (req.user.role === 'CONSUMER') {
      const result = await db.query(
        `SELECT c.*, m.meter_id, m.meter_number, m.meter_type, m.meter_status
         FROM consumers c
         LEFT JOIN smart_meters m ON c.consumer_id = m.consumer_id
         WHERE c.user_id = $1`,
        [req.user.user_id]
      );
      return res.json({ success: true, consumers: result.rows, total: result.rows.length });
    }

    let queryText = `
      SELECT c.*, m.meter_id, m.meter_number, m.meter_type, m.meter_status,
             (SELECT COUNT(*) FROM bills b WHERE b.consumer_id = c.consumer_id) AS total_bills_count,
             (SELECT COALESCE(SUM(b.total_amount), 0) FROM bills b WHERE b.consumer_id = c.consumer_id) AS total_billed_amount
      FROM consumers c
      LEFT JOIN smart_meters m ON c.consumer_id = m.consumer_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (c.full_name ILIKE $${params.length} OR c.consumer_number ILIKE $${params.length} OR c.phone ILIKE $${params.length} OR c.email ILIKE $${params.length})`;
    }

    if (category) {
      params.push(category);
      queryText += ` AND c.consumer_category = $${params.length}`;
    }

    if (status) {
      params.push(status);
      queryText += ` AND c.status = $${params.length}`;
    }

    queryText += ` ORDER BY c.consumer_id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    params.push(parseInt(limit, 10), offset);

    const result = await db.query(queryText, params);

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM consumers');
    const totalRecords = parseInt(countResult.rows[0].count, 10);

    res.json({
      success: true,
      consumers: result.rows,
      total: totalRecords,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  } catch (err) {
    next(err);
  }
};

const getConsumerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify consumer permission
    if (req.user.role === 'CONSUMER' && req.user.consumer_id !== parseInt(id, 10)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this consumer profile.' });
    }

    const consumerRes = await db.query(
      `SELECT c.*, m.meter_id, m.meter_number, m.meter_type, m.meter_status, m.installation_date, m.last_communication_at,
              u.email AS portal_email, u.status AS portal_status
       FROM consumers c
       LEFT JOIN smart_meters m ON c.consumer_id = m.consumer_id
       LEFT JOIN users u ON c.user_id = u.user_id
       WHERE c.consumer_id = $1`,
      [id]
    );

    if (consumerRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Consumer not found.' });
    }

    // Fetch recent readings
    const readingsRes = await db.query(
      `SELECT r.* FROM meter_readings r
       JOIN smart_meters m ON r.meter_id = m.meter_id
       WHERE m.consumer_id = $1
       ORDER BY r.reading_date DESC LIMIT 12`,
      [id]
    );

    // Fetch recent bills
    const billsRes = await db.query(
      `SELECT b.*, 
              COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00) AS total_paid
       FROM bills b
       LEFT JOIN payments p ON b.bill_id = p.bill_id
       WHERE b.consumer_id = $1
       GROUP BY b.bill_id
       ORDER BY b.billing_period_start DESC LIMIT 12`,
      [id]
    );

    res.json({
      success: true,
      consumer: consumerRes.rows[0],
      readings: readingsRes.rows,
      bills: billsRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

const createConsumer = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { full_name, address, phone, email, consumer_category, connection_date } = req.body;

    await client.query('BEGIN');

    // Auto-generate consumer number
    const countRes = await client.query('SELECT COUNT(*) FROM consumers');
    const nextNum = 1000 + parseInt(countRes.rows[0].count, 10) + 1;
    const consumer_number = `CON-${nextNum}`;

    const insertText = `
      INSERT INTO consumers (consumer_number, full_name, address, phone, email, consumer_category, connection_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE), 'ACTIVE')
      RETURNING *
    `;
    const result = await client.query(insertText, [
      consumer_number,
      full_name.trim(),
      address.trim(),
      phone.trim(),
      email.trim(),
      consumer_category,
      connection_date || null,
    ]);

    const newConsumer = result.rows[0];

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'CREATE_CONSUMER', 'consumers', $2, $3)`,
      [req.user.user_id, newConsumer.consumer_id, `Created consumer account ${consumer_number} (${full_name})`]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Consumer created successfully.',
      consumer: newConsumer,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const updateConsumer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, address, phone, email, consumer_category, status } = req.body;

    const updateText = `
      UPDATE consumers
      SET full_name = COALESCE($1, full_name),
          address = COALESCE($2, address),
          phone = COALESCE($3, phone),
          email = COALESCE($4, email),
          consumer_category = COALESCE($5, consumer_category),
          status = COALESCE($6, status)
      WHERE consumer_id = $7
      RETURNING *
    `;
    const result = await db.query(updateText, [
      full_name,
      address,
      phone,
      email,
      consumer_category,
      status,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Consumer not found.' });
    }

    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'UPDATE_CONSUMER', 'consumers', $2, $3)`,
      [req.user.user_id, id, `Updated consumer profile #${id}`]
    );

    res.json({
      success: true,
      message: 'Consumer details updated successfully.',
      consumer: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

const deleteConsumer = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if consumer has existing bills
    const billCheck = await db.query('SELECT COUNT(*) FROM bills WHERE consumer_id = $1', [id]);
    if (parseInt(billCheck.rows[0].count, 10) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete consumer with existing billing records. Set status to DISCONNECTED instead.',
      });
    }

    // Check if meter exists
    await db.query('DELETE FROM smart_meters WHERE consumer_id = $1', [id]);
    const deleteRes = await db.query('DELETE FROM consumers WHERE consumer_id = $1 RETURNING *', [id]);

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Consumer not found.' });
    }

    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'DELETE_CONSUMER', 'consumers', $2, $3)`,
      [req.user.user_id, id, `Deleted consumer #${id}`]
    );

    res.json({
      success: true,
      message: 'Consumer deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllConsumers,
  getConsumerById,
  createConsumer,
  updateConsumer,
  deleteConsumer,
};
