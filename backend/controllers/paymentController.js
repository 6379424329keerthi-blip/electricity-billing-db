/**
 * Payment Recording and Transaction Management Controller
 */

const db = require('../config/db');

const getAllPayments = async (req, res, next) => {
  try {
    const { method = '', search = '', limit = 50, page = 1 } = req.query;

    let queryText = `
      SELECT p.*, b.bill_number, b.total_amount AS bill_total, b.bill_status,
             c.consumer_number, c.full_name AS consumer_name, c.consumer_category,
             u.full_name AS recorded_by_name
      FROM payments p
      JOIN bills b ON p.bill_id = b.bill_id
      JOIN consumers c ON b.consumer_id = c.consumer_id
      LEFT JOIN users u ON p.recorded_by = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'CONSUMER') {
      params.push(req.user.user_id);
      queryText += ` AND c.user_id = $${params.length}`;
    }

    if (method) {
      params.push(method);
      queryText += ` AND p.payment_method = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (p.payment_reference ILIKE $${params.length} OR b.bill_number ILIKE $${params.length} OR c.full_name ILIKE $${params.length})`;
    }

    queryText += ` ORDER BY p.payment_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    params.push(parseInt(limit, 10), offset);

    const countQuery = `
      SELECT COUNT(*) FROM payments p
      JOIN bills b ON p.bill_id = b.bill_id
      JOIN consumers c ON b.consumer_id = c.consumer_id
      WHERE 1=1
      ${req.user.role === 'CONSUMER' ? `AND c.user_id = $1` : ''}
      ${method ? `AND p.payment_method = $${req.user.role === 'CONSUMER' ? 2 : 1}` : ''}
      ${search ? `AND (p.payment_reference ILIKE $${(req.user.role === 'CONSUMER' ? 1 : 0) + (method ? 1 : 0) + 1} OR b.bill_number ILIKE $${(req.user.role === 'CONSUMER' ? 1 : 0) + (method ? 1 : 0) + 1} OR c.full_name ILIKE $${(req.user.role === 'CONSUMER' ? 1 : 0) + (method ? 1 : 0) + 1})` : ''}
    `;
    const countParams = params.slice(0, params.length - 2); // Exclude LIMIT and OFFSET
    const countRes = await db.query(countQuery, countParams);
    const result = await db.query(queryText, params);

    res.json({
      success: true,
      payments: result.rows,
      total: parseInt(countRes.rows[0].count, 10),
    });
  } catch (err) {
    next(err);
  }
};

const recordPayment = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { bill_id, amount_paid, payment_method, payment_reference } = req.body;
    const paymentAmount = parseFloat(amount_paid);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }

    await client.query('BEGIN');

    // 1. Fetch bill details and lock row for update to prevent concurrent race conditions
    const billRes = await client.query(
      `SELECT b.*, c.consumer_number, c.full_name AS consumer_name, c.user_id AS consumer_user_id
       FROM bills b
       JOIN consumers c ON b.consumer_id = c.consumer_id
       WHERE b.bill_id = $1 FOR UPDATE`,
      [bill_id]
    );

    if (billRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Target bill not found.' });
    }

    const bill = billRes.rows[0];

    // Authorization check: If logged in as CONSUMER, only allow paying own bills
    if (req.user.role === 'CONSUMER' && bill.consumer_user_id !== req.user.user_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to record payments for another consumer\'s bill.',
      });
    }

    // 2. Calculate current paid amount
    const paidRes = await client.query(
      `SELECT COALESCE(SUM(amount_paid), 0.00) AS total_paid
       FROM payments
       WHERE bill_id = $1 AND payment_status = 'SUCCESS'`,
      [bill_id]
    );
    const alreadyPaid = parseFloat(paidRes.rows[0].total_paid);
    const billTotal = parseFloat(bill.total_amount);
    const currentOutstanding = parseFloat((billTotal - alreadyPaid).toFixed(2));

    if (currentOutstanding <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'This bill has already been settled in full. No balance outstanding.',
      });
    }

    // 3. Prevent overpayment beyond outstanding
    if (paymentAmount > currentOutstanding + 0.05) { // 0.05 tolerance for rounding
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Payment of ₹${paymentAmount} exceeds the current outstanding balance of ₹${currentOutstanding}.`,
      });
    }

    // 4. Generate unique payment reference if not supplied
    const refCode = payment_reference || `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Insert payment ledger record
    const insertPaymentText = `
      INSERT INTO payments (bill_id, payment_reference, amount_paid, payment_method, payment_date, payment_status, recorded_by)
      VALUES ($1, $2, $3, $4, NOW(), 'SUCCESS', $5)
      RETURNING *
    `;
    const paymentInsertRes = await client.query(insertPaymentText, [
      bill_id,
      refCode,
      paymentAmount,
      payment_method,
      req.user.user_id,
    ]);
    const createdPayment = paymentInsertRes.rows[0];

    // 6. Recalculate new total paid and update bill status
    const newTotalPaid = parseFloat((alreadyPaid + paymentAmount).toFixed(2));
    const newOutstanding = parseFloat((billTotal - newTotalPaid).toFixed(2));

    let newStatus = 'Partially Paid';
    if (newTotalPaid >= billTotal - 0.01) {
      newStatus = 'Paid';
    }

    await client.query(
      'UPDATE bills SET bill_status = $1 WHERE bill_id = $2',
      [newStatus, bill_id]
    );

    // 7. Audit Log
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'RECORD_PAYMENT', 'payments', $2, $3)`,
      [
        req.user.user_id,
        createdPayment.payment_id,
        `Recorded ₹${paymentAmount} payment (${payment_method}) for bill #${bill.bill_number}. Status: ${newStatus}`,
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      payment: createdPayment,
      updatedBillStatus: newStatus,
      newOutstandingBalance: Math.max(0, newOutstanding),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const getBillPayments = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Authorization check: If logged in as CONSUMER, verify consumer ownership of the bill
    if (req.user.role === 'CONSUMER') {
      const billCheck = await db.query(
        `SELECT b.bill_id FROM bills b
         JOIN consumers c ON b.consumer_id = c.consumer_id
         WHERE b.bill_id = $1 AND c.user_id = $2`,
        [id, req.user.user_id]
      );
      if (billCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view payments for this bill.',
        });
      }
    }

    const result = await db.query(
      `SELECT p.*, u.full_name AS recorded_by_name
       FROM payments p
       LEFT JOIN users u ON p.recorded_by = u.user_id
       WHERE p.bill_id = $1
       ORDER BY p.payment_date DESC`,
      [id]
    );
    res.json({ success: true, payments: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPayments,
  recordPayment,
  getBillPayments,
};
