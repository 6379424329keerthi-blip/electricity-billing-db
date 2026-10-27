/**
 * Dashboard Analytics & Summary Controller
 * Computes all metrics strictly from actual PostgreSQL database records.
 */

const db = require('../config/db');

const getDashboardSummary = async (req, res, next) => {
  try {
    const isConsumer = req.user.role === 'CONSUMER';
    const consumerFilter = isConsumer ? 'WHERE c.user_id = $1' : '';
    const consumerParam = isConsumer ? [req.user.user_id] : [];

    // 1. Metric Cards
    const consumersCountQuery = isConsumer
      ? 'SELECT 1 AS total_consumers'
      : 'SELECT COUNT(*) AS total_consumers FROM consumers WHERE status = \'ACTIVE\'';

    const metersCountQuery = isConsumer
      ? `SELECT COUNT(*) AS active_meters FROM smart_meters m JOIN consumers c ON m.consumer_id = c.consumer_id WHERE c.user_id = $1 AND m.meter_status = 'ACTIVE'`
      : 'SELECT COUNT(*) AS active_meters FROM smart_meters WHERE meter_status = \'ACTIVE\'';

    const consumptionQuery = isConsumer
      ? `SELECT COALESCE(SUM(r.consumption_units), 0) AS total_kwh FROM meter_readings r JOIN smart_meters m ON r.meter_id = m.meter_id JOIN consumers c ON m.consumer_id = c.consumer_id WHERE c.user_id = $1`
      : 'SELECT COALESCE(SUM(consumption_units), 0) AS total_kwh FROM meter_readings';

    const billsMetricsQuery = isConsumer
      ? `SELECT COUNT(b.bill_id) AS total_bills,
                COALESCE(SUM(b.total_amount), 0) AS total_billed,
                COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0) AS total_collected
         FROM bills b
         JOIN consumers c ON b.consumer_id = c.consumer_id
         LEFT JOIN payments p ON b.bill_id = p.bill_id
         WHERE c.user_id = $1`
      : `SELECT COUNT(b.bill_id) AS total_bills,
                COALESCE(SUM(b.total_amount), 0) AS total_billed,
                COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0) AS total_collected
         FROM bills b
         LEFT JOIN payments p ON b.bill_id = p.bill_id`;

    const [consRes, meterRes, kwhRes, billMetricsRes] = await Promise.all([
      db.query(consumersCountQuery),
      db.query(metersCountQuery, consumerParam),
      db.query(consumptionQuery, consumerParam),
      db.query(billsMetricsQuery, consumerParam),
    ]);

    const totalBilled = parseFloat(billMetricsRes.rows[0].total_billed || 0);
    const totalCollected = parseFloat(billMetricsRes.rows[0].total_collected || 0);
    const outstanding = parseFloat((totalBilled - totalCollected).toFixed(2));

    // 2. Chart 1: Monthly Electricity Consumption (Last 6 Months)
    const monthlyConsumptionQuery = isConsumer
      ? `SELECT TO_CHAR(r.reading_date, 'Mon YYYY') AS month_label,
                TO_CHAR(r.reading_date, 'YYYY-MM') AS sort_key,
                SUM(r.consumption_units) AS kwh
         FROM meter_readings r
         JOIN smart_meters m ON r.meter_id = m.meter_id
         JOIN consumers c ON m.consumer_id = c.consumer_id
         WHERE c.user_id = $1
         GROUP BY TO_CHAR(r.reading_date, 'Mon YYYY'), TO_CHAR(r.reading_date, 'YYYY-MM')
         ORDER BY sort_key ASC`
      : `SELECT TO_CHAR(r.reading_date, 'Mon YYYY') AS month_label,
                TO_CHAR(r.reading_date, 'YYYY-MM') AS sort_key,
                SUM(r.consumption_units) AS kwh
         FROM meter_readings r
         GROUP BY TO_CHAR(r.reading_date, 'Mon YYYY'), TO_CHAR(r.reading_date, 'YYYY-MM')
         ORDER BY sort_key ASC`;

    // 3. Chart 2: Monthly Billing Revenue (Billed vs Collected)
    const monthlyRevenueQuery = isConsumer
      ? `SELECT TO_CHAR(b.billing_period_start, 'Mon YYYY') AS month_label,
                TO_CHAR(b.billing_period_start, 'YYYY-MM') AS sort_key,
                SUM(b.total_amount) AS billed_amount,
                COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0) AS collected_amount
         FROM bills b
         JOIN consumers c ON b.consumer_id = c.consumer_id
         LEFT JOIN payments p ON b.bill_id = p.bill_id
         WHERE c.user_id = $1
         GROUP BY TO_CHAR(b.billing_period_start, 'Mon YYYY'), TO_CHAR(b.billing_period_start, 'YYYY-MM')
         ORDER BY sort_key ASC`
      : `SELECT TO_CHAR(b.billing_period_start, 'Mon YYYY') AS month_label,
                TO_CHAR(b.billing_period_start, 'YYYY-MM') AS sort_key,
                SUM(b.total_amount) AS billed_amount,
                COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0) AS collected_amount
         FROM bills b
         LEFT JOIN payments p ON b.bill_id = p.bill_id
         GROUP BY TO_CHAR(b.billing_period_start, 'Mon YYYY'), TO_CHAR(b.billing_period_start, 'YYYY-MM')
         ORDER BY sort_key ASC`;

    // 4. Chart 3: Paid vs Unpaid Bills Breakdown
    const billsStatusQuery = isConsumer
      ? `SELECT b.bill_status, COUNT(*) AS count, SUM(b.total_amount) AS amount
         FROM bills b
         JOIN consumers c ON b.consumer_id = c.consumer_id
         WHERE c.user_id = $1
         GROUP BY b.bill_status`
      : `SELECT bill_status, COUNT(*) AS count, SUM(total_amount) AS amount
         FROM bills
         GROUP BY bill_status`;

    // 5. Chart 4: Consumption by Consumer Category
    const categoryConsumptionQuery = isConsumer
      ? `SELECT c.consumer_category, SUM(r.consumption_units) AS kwh
         FROM meter_readings r
         JOIN smart_meters m ON r.meter_id = m.meter_id
         JOIN consumers c ON m.consumer_id = c.consumer_id
         WHERE c.user_id = $1
         GROUP BY c.consumer_category`
      : `SELECT c.consumer_category, SUM(r.consumption_units) AS kwh
         FROM meter_readings r
         JOIN smart_meters m ON r.meter_id = m.meter_id
         JOIN consumers c ON m.consumer_id = c.consumer_id
         GROUP BY c.consumer_category
         ORDER BY kwh DESC`;

    // 6. Recent Lists
    const recentReadingsQuery = isConsumer
      ? `SELECT r.*, m.meter_number, c.full_name AS consumer_name
         FROM meter_readings r
         JOIN smart_meters m ON r.meter_id = m.meter_id
         JOIN consumers c ON m.consumer_id = c.consumer_id
         WHERE c.user_id = $1
         ORDER BY r.reading_date DESC LIMIT 5`
      : `SELECT r.*, m.meter_number, c.full_name AS consumer_name
         FROM meter_readings r
         JOIN smart_meters m ON r.meter_id = m.meter_id
         JOIN consumers c ON m.consumer_id = c.consumer_id
         ORDER BY r.reading_date DESC LIMIT 5`;

    const recentBillsQuery = isConsumer
      ? `SELECT b.*, c.full_name AS consumer_name, m.meter_number
         FROM bills b
         JOIN consumers c ON b.consumer_id = c.consumer_id
         JOIN smart_meters m ON b.meter_id = m.meter_id
         WHERE c.user_id = $1
         ORDER BY b.billing_period_end DESC LIMIT 5`
      : `SELECT b.*, c.full_name AS consumer_name, m.meter_number
         FROM bills b
         JOIN consumers c ON b.consumer_id = c.consumer_id
         JOIN smart_meters m ON b.meter_id = m.meter_id
         ORDER BY b.billing_period_end DESC LIMIT 5`;

    // 7. Consumers with Unusually High Consumption (Subquery)
    const highConsumptionQuery = `
      SELECT c.consumer_number, c.full_name, c.consumer_category, m.meter_number,
             r.consumption_units, r.reading_date
      FROM meter_readings r
      JOIN smart_meters m ON r.meter_id = m.meter_id
      JOIN consumers c ON m.consumer_id = c.consumer_id
      WHERE r.consumption_units > (SELECT AVG(consumption_units) FROM meter_readings)
      ORDER BY r.consumption_units DESC
      LIMIT 5
    `;

    const [
      monthlyConsRes,
      monthlyRevRes,
      billStatusRes,
      catConsRes,
      recentReadingsRes,
      recentBillsRes,
      highConsRes,
    ] = await Promise.all([
      db.query(monthlyConsumptionQuery, consumerParam),
      db.query(monthlyRevenueQuery, consumerParam),
      db.query(billsStatusQuery, consumerParam),
      db.query(categoryConsumptionQuery, consumerParam),
      db.query(recentReadingsQuery, consumerParam),
      db.query(recentBillsQuery, consumerParam),
      db.query(highConsumptionQuery),
    ]);

    res.json({
      success: true,
      summary: {
        totalConsumers: parseInt(consRes.rows[0].total_consumers, 10),
        activeSmartMeters: parseInt(meterRes.rows[0].active_meters, 10),
        totalElectricityKwh: parseFloat(kwhRes.rows[0].total_kwh || 0),
        totalBillsGenerated: parseInt(billMetricsRes.rows[0].total_bills || 0, 10),
        totalBilledAmount: totalBilled,
        totalAmountCollected: totalCollected,
        outstandingPayments: Math.max(0, outstanding),
      },
      charts: {
        monthlyConsumption: monthlyConsRes.rows.map((row) => ({
          name: row.month_label,
          kwh: parseFloat(row.kwh),
        })),
        monthlyRevenue: monthlyRevRes.rows.map((row) => ({
          name: row.month_label,
          billed: parseFloat(row.billed_amount),
          collected: parseFloat(row.collected_amount),
        })),
        billsByStatus: billStatusRes.rows.map((row) => ({
          name: row.bill_status,
          value: parseInt(row.count, 10),
          amount: parseFloat(row.amount),
        })),
        consumptionByCategory: catConsRes.rows.map((row) => ({
          name: row.consumer_category,
          kwh: parseFloat(row.kwh),
        })),
      },
      recentReadings: recentReadingsRes.rows,
      recentBills: recentBillsRes.rows,
      highConsumptionAlerts: highConsRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardSummary,
};
