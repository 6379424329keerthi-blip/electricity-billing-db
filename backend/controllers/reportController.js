/**
 * Utility Reports & Data Exports Controller
 */

const db = require('../config/db');

const getMonthlyConsumptionReport = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        TO_CHAR(r.reading_date, 'YYYY-MM') AS month,
        c.consumer_category,
        COUNT(DISTINCT c.consumer_id) AS total_consumers,
        COUNT(r.reading_id) AS total_readings,
        SUM(r.consumption_units) AS total_kwh,
        ROUND(AVG(r.consumption_units), 2) AS avg_kwh,
        MAX(r.consumption_units) AS max_kwh,
        MIN(r.consumption_units) AS min_kwh
      FROM meter_readings r
      JOIN smart_meters m ON r.meter_id = m.meter_id
      JOIN consumers c ON m.consumer_id = c.consumer_id
      GROUP BY TO_CHAR(r.reading_date, 'YYYY-MM'), c.consumer_category
      ORDER BY month DESC, c.consumer_category ASC
    `);

    res.json({ success: true, report: result.rows });
  } catch (err) {
    next(err);
  }
};

const getMonthlyRevenueReport = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        TO_CHAR(b.billing_period_start, 'YYYY-MM') AS billing_month,
        COUNT(b.bill_id) AS total_bills,
        SUM(b.units_consumed) AS total_units_billed,
        SUM(b.energy_charge) AS gross_energy_charges,
        SUM(b.tax_amount) AS gross_taxes,
        SUM(b.total_amount) AS total_billed_amount,
        COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00) AS total_collected_amount,
        ROUND(
          SUM(b.total_amount) - COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00),
          2
        ) AS uncollected_balance,
        ROUND(
          (COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00) * 100.0) /
          NULLIF(SUM(b.total_amount), 0),
          2
        ) AS collection_efficiency_pct
      FROM bills b
      LEFT JOIN payments p ON b.bill_id = p.bill_id
      GROUP BY TO_CHAR(b.billing_period_start, 'YYYY-MM')
      ORDER BY billing_month DESC
    `);

    res.json({ success: true, report: result.rows });
  } catch (err) {
    next(err);
  }
};

const getOutstandingBillsReport = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        b.bill_id,
        b.bill_number,
        c.consumer_number,
        c.full_name AS consumer_name,
        c.consumer_category,
        c.phone,
        c.email,
        m.meter_number,
        b.total_amount,
        COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00) AS total_paid,
        ROUND(b.total_amount - COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00), 2) AS outstanding_amount,
        b.due_date,
        b.bill_status,
        CURRENT_DATE - b.due_date AS days_past_due
      FROM bills b
      JOIN consumers c ON b.consumer_id = c.consumer_id
      JOIN smart_meters m ON b.meter_id = m.meter_id
      LEFT JOIN payments p ON b.bill_id = p.bill_id
      WHERE b.bill_status IN ('Unpaid', 'Partially Paid', 'Overdue')
      GROUP BY b.bill_id, c.consumer_number, c.full_name, c.consumer_category, c.phone, c.email, m.meter_number
      HAVING (b.total_amount - COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00)) > 0
      ORDER BY days_past_due DESC, outstanding_amount DESC
    `);

    res.json({ success: true, report: result.rows });
  } catch (err) {
    next(err);
  }
};

const getCategoryBreakdownReport = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        c.consumer_category,
        COUNT(DISTINCT c.consumer_id) AS total_consumers,
        COUNT(DISTINCT m.meter_id) AS total_meters,
        COALESCE(SUM(r.consumption_units), 0) AS total_kwh,
        ROUND(AVG(r.consumption_units), 2) AS avg_kwh_per_reading,
        COALESCE(SUM(b.total_amount), 0) AS total_revenue
      FROM consumers c
      LEFT JOIN smart_meters m ON c.consumer_id = m.consumer_id
      LEFT JOIN meter_readings r ON m.meter_id = r.meter_id
      LEFT JOIN bills b ON c.consumer_id = b.consumer_id
      GROUP BY c.consumer_category
      ORDER BY total_revenue DESC
    `);

    res.json({ success: true, report: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMonthlyConsumptionReport,
  getMonthlyRevenueReport,
  getOutstandingBillsReport,
  getCategoryBreakdownReport,
};
