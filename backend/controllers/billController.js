/**
 * Bill Generation and Billing History Controller
 */

const db = require('../config/db');
const { calculateBill } = require('../services/billingService');

const getAllBills = async (req, res, next) => {
  try {
    const { status = '', search = '', month = '', page = 1, limit = 50 } = req.query;

    let queryText = `
      SELECT b.*, c.consumer_number, c.full_name AS consumer_name, c.consumer_category,
             c.phone, c.address, m.meter_number,
             COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00) AS total_paid,
             ROUND(b.total_amount - COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00), 2) AS outstanding_balance
      FROM bills b
      JOIN consumers c ON b.consumer_id = c.consumer_id
      JOIN smart_meters m ON b.meter_id = m.meter_id
      LEFT JOIN payments p ON b.bill_id = p.bill_id
      WHERE 1=1
    `;
    const params = [];

    // Filter by consumer if logged in as CONSUMER
    if (req.user.role === 'CONSUMER') {
      params.push(req.user.user_id);
      queryText += ` AND c.user_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      queryText += ` AND b.bill_status = $${params.length}`;
    }

    if (month) {
      params.push(`${month}%`);
      queryText += ` AND b.billing_period_start::text LIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (b.bill_number ILIKE $${params.length} OR c.full_name ILIKE $${params.length} OR c.consumer_number ILIKE $${params.length} OR m.meter_number ILIKE $${params.length})`;
    }

    queryText += `
      GROUP BY b.bill_id, c.consumer_number, c.full_name, c.consumer_category, c.phone, c.address, m.meter_number
      ORDER BY b.billing_period_end DESC, b.bill_id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    params.push(parseInt(limit, 10), offset);

    const countQuery = `
      SELECT COUNT(DISTINCT b.bill_id) FROM bills b
      JOIN consumers c ON b.consumer_id = c.consumer_id
      JOIN smart_meters m ON b.meter_id = m.meter_id
      WHERE 1=1
      ${req.user.role === 'CONSUMER' ? `AND c.user_id = $1` : ''}
      ${status ? `AND b.bill_status = $${req.user.role === 'CONSUMER' ? 2 : 1}` : ''}
      ${month ? `AND b.billing_period_start::text LIKE $${(req.user.role === 'CONSUMER' ? 1 : 0) + (status ? 1 : 0) + 1}` : ''}
      ${search ? `AND (b.bill_number ILIKE $${(req.user.role === 'CONSUMER' ? 1 : 0) + (status ? 1 : 0) + (month ? 1 : 0) + 1} OR c.full_name ILIKE $${(req.user.role === 'CONSUMER' ? 1 : 0) + (status ? 1 : 0) + (month ? 1 : 0) + 1} OR c.consumer_number ILIKE $${(req.user.role === 'CONSUMER' ? 1 : 0) + (status ? 1 : 0) + (month ? 1 : 0) + 1} OR m.meter_number ILIKE $${(req.user.role === 'CONSUMER' ? 1 : 0) + (status ? 1 : 0) + (month ? 1 : 0) + 1})` : ''}
    `;
    const countParams = params.slice(0, params.length - 2); // Exclude LIMIT and OFFSET
    const countRes = await db.query(countQuery, countParams);
    const result = await db.query(queryText, params);

    res.json({
      success: true,
      bills: result.rows,
      total: parseInt(countRes.rows[0].count, 10),
    });
  } catch (err) {
    next(err);
  }
};

const getBillById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const billQuery = `
      SELECT b.*, c.consumer_number, c.full_name AS consumer_name, c.consumer_category,
             c.address, c.phone, c.email, c.user_id AS consumer_user_id, m.meter_number, m.meter_type,
             r.previous_reading, r.current_reading, r.reading_date,
             COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00) AS total_paid,
             ROUND(b.total_amount - COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00), 2) AS outstanding_balance
      FROM bills b
      JOIN consumers c ON b.consumer_id = c.consumer_id
      JOIN smart_meters m ON b.meter_id = m.meter_id
      JOIN meter_readings r ON b.reading_id = r.reading_id
      LEFT JOIN payments p ON b.bill_id = p.bill_id
      WHERE b.bill_id = $1
      GROUP BY b.bill_id, c.consumer_number, c.full_name, c.consumer_category,
               c.address, c.phone, c.email, c.user_id, m.meter_number, m.meter_type,
               r.previous_reading, r.current_reading, r.reading_date
    `;
    const result = await db.query(billQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Bill statement not found.' });
    }

    const bill = result.rows[0];

    // Check permission if logged in as CONSUMER
    if (req.user.role === 'CONSUMER' && bill.consumer_user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this billing statement.' });
    }

    // Fetch payments for this bill
    const paymentsRes = await db.query(
      `SELECT p.*, u.full_name AS recorded_by_name
       FROM payments p
       LEFT JOIN users u ON p.recorded_by = u.user_id
       WHERE p.bill_id = $1
       ORDER BY p.payment_date DESC`,
      [id]
    );

    // Calculate slab breakdown for display
    const calculation = await calculateBill(bill.consumer_category, bill.units_consumed, bill.adjustment_amount);

    res.json({
      success: true,
      bill,
      payments: paymentsRes.rows,
      slabBreakdown: calculation.slabBreakdown,
    });
  } catch (err) {
    next(err);
  }
};

const generateBill = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { reading_id, due_date, adjustment_amount = 0 } = req.body;

    await client.query('BEGIN');

    // 1. Fetch reading and consumer information
    const readingRes = await client.query(
      `SELECT r.*, m.meter_number, c.consumer_id, c.consumer_number, c.consumer_category
       FROM meter_readings r
       JOIN smart_meters m ON r.meter_id = m.meter_id
       JOIN consumers c ON m.consumer_id = c.consumer_id
       WHERE r.reading_id = $1`,
      [reading_id]
    );

    if (readingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Meter reading not found.' });
    }

    const reading = readingRes.rows[0];

    // 2. Prevent duplicate bill for the same reading
    const dupCheck = await client.query('SELECT bill_id, bill_number FROM bills WHERE reading_id = $1', [reading_id]);
    if (dupCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `A bill (${dupCheck.rows[0].bill_number}) has already been generated for this meter reading.`,
      });
    }

    // 3. Compute billing period (from previous 30 days or start of month to reading date)
    const readingDate = new Date(reading.reading_date);
    const startDate = new Date(readingDate);
    startDate.setDate(1); // 1st of that month
    const billing_period_start = startDate.toISOString().split('T')[0];
    const billing_period_end = reading.reading_date;

    // 4. Calculate bill amounts via Smart Billing Engine
    const calculation = await calculateBill(
      reading.consumer_category,
      reading.consumption_units,
      adjustment_amount
    );

    // 5. Generate formatted unique bill number: BILL-YYYYMM-CONxxxx
    const yearMonth = readingDate.toISOString().slice(0, 7).replace('-', '');
    const bill_number = `BILL-${yearMonth}-${reading.consumer_number.replace('CON-', '')}`;

    // 6. Insert Bill Record
    const insertBillText = `
      INSERT INTO bills (
        bill_number, consumer_id, meter_id, reading_id, billing_period_start, billing_period_end,
        units_consumed, energy_charge, fixed_charge, tax_amount, adjustment_amount, total_amount,
        due_date, bill_status, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Unpaid', NOW())
      RETURNING *
    `;
    const billInsertRes = await client.query(insertBillText, [
      bill_number,
      reading.consumer_id,
      reading.meter_id,
      reading.reading_id,
      billing_period_start,
      billing_period_end,
      calculation.unitsConsumed,
      calculation.energyCharge,
      calculation.fixedCharge,
      calculation.taxAmount,
      calculation.adjustmentAmount,
      calculation.totalAmount,
      due_date || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    ]);

    const createdBill = billInsertRes.rows[0];

    // 7. Audit Log
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'GENERATE_BILL', 'bills', $2, $3)`,
      [
        req.user.user_id,
        createdBill.bill_id,
        `Generated bill ${bill_number} for consumer #${reading.consumer_id}: units=${calculation.unitsConsumed}, total=₹${calculation.totalAmount}`,
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully.',
      bill: createdBill,
      calculationBreakdown: calculation,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = {
  getAllBills,
  getBillById,
  generateBill,
};
