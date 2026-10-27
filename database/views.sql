-- ============================================================================
-- DATABASE VIEWS: Electricity Consumption & Smart Meter Billing
-- Target: PostgreSQL / pgAdmin 4
-- ============================================================================

-- View 1: Detailed Consumer & Smart Meter Overview
-- Joins consumers with their installed smart meter and portal login profile
CREATE OR REPLACE VIEW consumer_meter_details AS
SELECT 
    c.consumer_id,
    c.consumer_number,
    c.full_name AS consumer_name,
    c.phone,
    c.email,
    c.address,
    c.consumer_category,
    c.status AS consumer_status,
    m.meter_id,
    m.meter_number,
    m.meter_type,
    m.meter_status,
    m.installation_date,
    m.last_communication_at,
    u.user_id,
    u.role AS user_role,
    u.status AS account_status
FROM consumers c
LEFT JOIN smart_meters m ON c.consumer_id = m.consumer_id
LEFT JOIN users u ON c.user_id = u.user_id;

-- View 2: Comprehensive Bill and Payment Summary
-- Aggregates total payments made per bill, computes outstanding balance and effective status
CREATE OR REPLACE VIEW bill_payment_summary AS
SELECT 
    b.bill_id,
    b.bill_number,
    b.consumer_id,
    c.consumer_number,
    c.full_name AS consumer_name,
    c.consumer_category,
    m.meter_number,
    b.billing_period_start,
    b.billing_period_end,
    b.units_consumed,
    b.energy_charge,
    b.fixed_charge,
    b.tax_amount,
    b.adjustment_amount,
    b.total_amount,
    COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00) AS total_paid,
    ROUND(b.total_amount - COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00), 2) AS outstanding_balance,
    b.due_date,
    b.bill_status,
    b.generated_at,
    COUNT(p.payment_id) AS payment_transactions_count
FROM bills b
JOIN consumers c ON b.consumer_id = c.consumer_id
JOIN smart_meters m ON b.meter_id = m.meter_id
LEFT JOIN payments p ON b.bill_id = p.bill_id
GROUP BY 
    b.bill_id, b.bill_number, b.consumer_id, c.consumer_number, c.full_name, 
    c.consumer_category, m.meter_number, b.billing_period_start, b.billing_period_end, 
    b.units_consumed, b.energy_charge, b.fixed_charge, b.tax_amount, b.adjustment_amount, 
    b.total_amount, b.due_date, b.bill_status, b.generated_at;

-- View 3: Monthly Electricity Consumption Summary
-- Groups consumption by calendar month and consumer category for reporting
CREATE OR REPLACE VIEW monthly_consumption_summary AS
SELECT 
    TO_CHAR(r.reading_date, 'YYYY-MM') AS billing_month,
    c.consumer_category,
    COUNT(DISTINCT c.consumer_id) AS total_consumers,
    COUNT(r.reading_id) AS total_readings,
    SUM(r.consumption_units) AS total_kwh_consumed,
    ROUND(AVG(r.consumption_units), 2) AS avg_kwh_per_consumer,
    MAX(r.consumption_units) AS peak_consumption_kwh,
    MIN(r.consumption_units) AS lowest_consumption_kwh
FROM meter_readings r
JOIN smart_meters m ON r.meter_id = m.meter_id
JOIN consumers c ON m.consumer_id = c.consumer_id
GROUP BY TO_CHAR(r.reading_date, 'YYYY-MM'), c.consumer_category
ORDER BY billing_month DESC, c.consumer_category;
