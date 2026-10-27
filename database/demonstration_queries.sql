-- ============================================================================
-- 15+ DEMONSTRATION SQL QUERIES (DBMS IA EVALUATION SCRIPT)
-- Project: Electricity Consumption & Smart Meter Billing Database
-- Target: PostgreSQL / pgAdmin 4 (also compatible with ANSI SQL)
-- Purpose: Demonstrates DDL, DML, Multi-table JOINs, Aggregations,
--          GROUP BY, HAVING, Nested Subqueries, Correlated Subqueries,
--          Window Functions, and ACID Transactions.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- QUERY 1: Multi-Table JOIN - Consumers with their Registered Smart Meters
-- Purpose: Display all consumer profiles alongside their hardware meter specs.
-- ----------------------------------------------------------------------------
SELECT 
    c.consumer_number,
    c.full_name AS consumer_name,
    c.consumer_category,
    c.phone,
    m.meter_number,
    m.meter_type,
    m.meter_status,
    m.installation_date
FROM consumers c
INNER JOIN smart_meters m ON c.consumer_id = m.consumer_id
ORDER BY c.consumer_id ASC;


-- ----------------------------------------------------------------------------
-- QUERY 2: Multi-Table JOIN - Bills with Consumer Details and Meter Info
-- Purpose: Retrieve itemized billing statements with consumer metadata.
-- ----------------------------------------------------------------------------
SELECT 
    b.bill_number,
    c.consumer_number,
    c.full_name AS consumer_name,
    c.consumer_category,
    m.meter_number,
    b.billing_period_start,
    b.billing_period_end,
    b.units_consumed,
    b.total_amount,
    b.bill_status,
    b.due_date
FROM bills b
JOIN consumers c ON b.consumer_id = c.consumer_id
JOIN smart_meters m ON b.meter_id = m.meter_id
ORDER BY b.generated_at DESC;


-- ----------------------------------------------------------------------------
-- QUERY 3: Multi-Table JOIN - Payments with Associated Bills & Consumer Names
-- Purpose: Audit incoming payment receipts against billed accounts.
-- ----------------------------------------------------------------------------
SELECT 
    p.payment_reference,
    b.bill_number,
    c.full_name AS consumer_name,
    p.amount_paid,
    p.payment_method,
    p.payment_date,
    p.payment_status,
    b.total_amount AS original_bill_total
FROM payments p
JOIN bills b ON p.bill_id = b.bill_id
JOIN consumers c ON b.consumer_id = c.consumer_id
ORDER BY p.payment_date DESC;


-- ----------------------------------------------------------------------------
-- QUERY 4: Multi-Table JOIN - Meter Readings with Consumer Names & Units
-- Purpose: Review field/simulated readings linked to the end consumer.
-- ----------------------------------------------------------------------------
SELECT 
    r.reading_id,
    c.consumer_number,
    c.full_name AS consumer_name,
    m.meter_number,
    r.previous_reading,
    r.current_reading,
    r.consumption_units,
    r.reading_date,
    r.reading_type
FROM meter_readings r
JOIN smart_meters m ON r.meter_id = m.meter_id
JOIN consumers c ON m.consumer_id = c.consumer_id
ORDER BY r.reading_date DESC, r.reading_id DESC;


-- ----------------------------------------------------------------------------
-- QUERY 5: Aggregate Function - Calculate Total Monthly Electricity Consumption
-- Purpose: Track monthly load (kWh) demanded by grid participants.
-- ----------------------------------------------------------------------------
SELECT 
    TO_CHAR(reading_date, 'YYYY-MM') AS consumption_month,
    COUNT(reading_id) AS total_readings_taken,
    SUM(consumption_units) AS total_kwh_consumed,
    ROUND(AVG(consumption_units), 2) AS avg_kwh_per_reading,
    MAX(consumption_units) AS peak_reading_kwh
FROM meter_readings
GROUP BY TO_CHAR(reading_date, 'YYYY-MM')
ORDER BY consumption_month DESC;


-- ----------------------------------------------------------------------------
-- QUERY 6: Aggregate Function - Calculate Total Revenue Collected
-- Purpose: Financial reconciliation of all successfully cleared payments.
-- ----------------------------------------------------------------------------
SELECT 
    p.payment_method,
    COUNT(p.payment_id) AS transaction_count,
    SUM(p.amount_paid) AS total_amount_collected,
    ROUND(AVG(p.amount_paid), 2) AS avg_transaction_value
FROM payments p
WHERE p.payment_status = 'SUCCESS'
GROUP BY p.payment_method
ORDER BY total_amount_collected DESC;


-- ----------------------------------------------------------------------------
-- QUERY 7: Aggregate Function - Calculate Outstanding Bill Amounts
-- Purpose: Monitor utility accounts receivable and aging dues.
-- ----------------------------------------------------------------------------
SELECT 
    b.bill_status,
    COUNT(b.bill_id) AS number_of_bills,
    SUM(b.total_amount) AS total_billed_amount,
    COALESCE(SUM(p.amount_paid), 0.00) AS total_received_amount,
    ROUND(SUM(b.total_amount) - COALESCE(SUM(p.amount_paid), 0.00), 2) AS total_outstanding_due
FROM bills b
LEFT JOIN payments p ON b.bill_id = p.bill_id AND p.payment_status = 'SUCCESS'
GROUP BY b.bill_status
ORDER BY total_outstanding_due DESC;


-- ----------------------------------------------------------------------------
-- QUERY 8: Aggregate with GROUP BY & HAVING - Average Consumption by Category
-- Purpose: Categorize average usage and filter categories with high demand.
-- ----------------------------------------------------------------------------
SELECT 
    c.consumer_category,
    COUNT(DISTINCT c.consumer_id) AS consumer_count,
    ROUND(AVG(r.consumption_units), 2) AS avg_units_per_cycle,
    SUM(r.consumption_units) AS gross_units_consumed
FROM consumers c
JOIN smart_meters m ON c.consumer_id = m.consumer_id
JOIN meter_readings r ON m.meter_id = r.meter_id
GROUP BY c.consumer_category
HAVING AVG(r.consumption_units) > 100
ORDER BY avg_units_per_cycle DESC;


-- ----------------------------------------------------------------------------
-- QUERY 9: Aggregate & Subquery - Consumer with Highest Electricity Consumption
-- Purpose: Detect top grid consumer across the entire utility database.
-- ----------------------------------------------------------------------------
SELECT 
    c.consumer_number,
    c.full_name,
    c.consumer_category,
    SUM(r.consumption_units) AS total_kwh
FROM consumers c
JOIN smart_meters m ON c.consumer_id = m.consumer_id
JOIN meter_readings r ON m.meter_id = r.meter_id
GROUP BY c.consumer_id, c.consumer_number, c.full_name, c.consumer_category
ORDER BY total_kwh DESC
LIMIT 1;


-- ----------------------------------------------------------------------------
-- QUERY 10: Aggregate Function - Count Bills Grouped by Payment Status
-- Purpose: Quick executive tally of billing clearance pipeline.
-- ----------------------------------------------------------------------------
SELECT 
    bill_status,
    COUNT(*) AS total_bills,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM bills)), 2) AS percentage_of_total
FROM bills
GROUP BY bill_status
ORDER BY total_bills DESC;


-- ----------------------------------------------------------------------------
-- QUERY 11: Subquery - Consumers Whose Consumption Exceeds the Average
-- Purpose: Identify high-consumption consumers above city-wide threshold.
-- ----------------------------------------------------------------------------
SELECT 
    c.consumer_number,
    c.full_name,
    c.consumer_category,
    r.consumption_units,
    r.reading_date
FROM meter_readings r
JOIN smart_meters m ON r.meter_id = m.meter_id
JOIN consumers c ON m.consumer_id = c.consumer_id
WHERE r.consumption_units > (
    SELECT AVG(consumption_units) 
    FROM meter_readings
)
ORDER BY r.consumption_units DESC;


-- ----------------------------------------------------------------------------
-- QUERY 12: Subquery - Consumers with Bills Above the Average Bill Amount
-- Purpose: Isolate consumers generating above-average revenue.
-- ----------------------------------------------------------------------------
SELECT 
    b.bill_number,
    c.consumer_number,
    c.full_name,
    b.total_amount,
    b.bill_status
FROM bills b
JOIN consumers c ON b.consumer_id = c.consumer_id
WHERE b.total_amount > (
    SELECT AVG(total_amount) 
    FROM bills
)
ORDER BY b.total_amount DESC;


-- ----------------------------------------------------------------------------
-- QUERY 13: Subquery - Smart Meters with No Readings During a Specified Period
-- Purpose: Detect inactive, faulty, or disconnected smart meters.
-- ----------------------------------------------------------------------------
SELECT 
    m.meter_id,
    m.meter_number,
    m.meter_type,
    m.meter_status,
    c.full_name AS assigned_consumer
FROM smart_meters m
JOIN consumers c ON m.consumer_id = c.consumer_id
WHERE m.meter_id NOT IN (
    SELECT DISTINCT meter_id 
    FROM meter_readings 
    WHERE reading_date >= '2026-10-01' AND reading_date <= '2026-10-31'
);


-- ----------------------------------------------------------------------------
-- QUERY 14: Subquery - Consumers with Unpaid or Overdue Bills
-- Purpose: Produce consumer contact list for payment reminder notifications.
-- ----------------------------------------------------------------------------
SELECT 
    c.consumer_number,
    c.full_name,
    c.phone,
    c.email,
    b.bill_number,
    b.total_amount,
    b.due_date,
    b.bill_status
FROM consumers c
JOIN bills b ON c.consumer_id = b.consumer_id
WHERE b.bill_status IN ('Unpaid', 'Overdue')
  AND c.consumer_id IN (
      SELECT consumer_id 
      FROM bills 
      WHERE bill_status IN ('Unpaid', 'Overdue')
  )
ORDER BY b.due_date ASC;


-- ----------------------------------------------------------------------------
-- QUERY 15: Window Function / Correlated Subquery - Highest Consumer in Each Category
-- Purpose: Benchmark peak demand leader in Residential, Commercial, and Industrial.
-- ----------------------------------------------------------------------------
WITH RankedConsumers AS (
    SELECT 
        c.consumer_category,
        c.consumer_number,
        c.full_name,
        SUM(r.consumption_units) AS total_consumed_kwh,
        DENSE_RANK() OVER (
            PARTITION BY c.consumer_category 
            ORDER BY SUM(r.consumption_units) DESC
        ) AS rank_in_category
    FROM consumers c
    JOIN smart_meters m ON c.consumer_id = m.consumer_id
    JOIN meter_readings r ON m.meter_id = r.meter_id
    GROUP BY c.consumer_category, c.consumer_number, c.full_name
)
SELECT 
    consumer_category,
    consumer_number,
    full_name,
    total_consumed_kwh
FROM RankedConsumers
WHERE rank_in_category = 1
ORDER BY total_consumed_kwh DESC;


-- ----------------------------------------------------------------------------
-- QUERY 16: Database View Query - Querying pre-aggregated view
-- Purpose: Check the Bill Payment Summary View created during DDL.
-- ----------------------------------------------------------------------------
SELECT 
    bill_number,
    consumer_name,
    consumer_category,
    total_amount,
    total_paid,
    outstanding_balance,
    bill_status
FROM bill_payment_summary
WHERE outstanding_balance > 0
ORDER BY outstanding_balance DESC;


-- ----------------------------------------------------------------------------
-- QUERY 17: ACID Transaction Example - Recording Payment & Updating Bill Status
-- Purpose: Demonstrates atomicity when logging payment and updating receivables.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_bill_id INT := 3; -- Rahul Sharma's Unpaid Oct Bill
    v_payment_amount NUMERIC := 954.19;
    v_total_due NUMERIC;
    v_already_paid NUMERIC;
    v_new_total_paid NUMERIC;
BEGIN
    -- 1. Fetch current bill total
    SELECT total_amount INTO v_total_due FROM bills WHERE bill_id = v_bill_id;
    
    -- 2. Fetch existing successful payments
    SELECT COALESCE(SUM(amount_paid), 0.00) INTO v_already_paid 
    FROM payments 
    WHERE bill_id = v_bill_id AND payment_status = 'SUCCESS';

    v_new_total_paid := v_already_paid + v_payment_amount;

    -- 3. Insert payment ledger record
    INSERT INTO payments (bill_id, payment_reference, amount_paid, payment_method, payment_status, recorded_by)
    VALUES (v_bill_id, CONCAT('DEMO-TXN-', EXTRACT(EPOCH FROM NOW())::BIGINT), v_payment_amount, 'UPI', 'SUCCESS', 1);

    -- 4. Conditionally update bill status based on whether fully cleared
    IF v_new_total_paid >= v_total_due THEN
        UPDATE bills SET bill_status = 'Paid' WHERE bill_id = v_bill_id;
    ELSE
        UPDATE bills SET bill_status = 'Partially Paid' WHERE bill_id = v_bill_id;
    END IF;

    -- Note: In application backend, this is encapsulated in client.query('BEGIN') ... client.query('COMMIT').
END $$;
