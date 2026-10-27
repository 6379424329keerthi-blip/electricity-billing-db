# Demonstration SQL Queries & Analytical Formulations
## Assessment Rubric: Schema Design and SQL Implementation (5 Marks)
**Target Database Engine:** PostgreSQL 14+ / PostgreSQL 18 (pgAdmin 4 Compatible)  
**Execution Source Script:** `database/demonstration_queries.sql` & `database/nosql_telemetry_demo.sql`  

---

## 1. Overview of Evaluated SQL Concepts

The following queries satisfy university DBMS curriculum evaluation requirements across:
- Multi-table `INNER JOIN` and `LEFT JOIN`
- Aggregations (`COUNT`, `SUM`, `AVG`, `ROUND`)
- `GROUP BY` and `HAVING` filters
- Subqueries (Scalar, Nested, and Correlated)
- Common Table Expressions (CTEs)
- Window Functions (`DENSE_RANK() OVER (PARTITION BY ...)`)
- Stored Procedures and Triggers
- ACID Transactions with Row-Level Locking (`FOR UPDATE`)
- NoSQL Semi-Structured Document Queries (`JSONB` + GIN Indexing)

---

## 2. Demonstration Queries with Descriptions & Outputs

### Query 1: Multi-Table JOIN — Consumers with Registered Smart Meters
- **Purpose:** Associate each consumer profile with their physical smart meter hardware and status.
- **SQL:**
  ```sql
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
  ```
- **Sample Output:**
  | consumer_number | consumer_name | consumer_category | phone | meter_number | meter_type | meter_status | installation_date |
  | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
  | CON-1001 | Rahul Sharma | Residential | +91 98765 43210 | MTR-3001 | Digital Smart 1-Phase | ACTIVE | 2023-04-16 |
  | CON-1002 | Priya Patel | Residential | +91 98231 11223 | MTR-3002 | Digital Smart 1-Phase | ACTIVE | 2023-06-21 |
  | CON-1003 | Anand Electricals | Commercial | +91 94440 98765 | MTR-3003 | Digital Smart 3-Phase | ACTIVE | 2022-11-12 |

---

### Query 2: Multi-Table JOIN — Itemized Billing Statements with Consumer Metadata
- **Purpose:** Display generated bills with customer category, billed units, total charges, and due dates.
- **SQL:**
  ```sql
  SELECT 
      b.bill_number,
      c.consumer_number,
      c.full_name AS consumer_name,
      c.consumer_category,
      m.meter_number,
      b.units_consumed,
      b.total_amount,
      b.bill_status,
      b.due_date
  FROM bills b
  JOIN consumers c ON b.consumer_id = c.consumer_id
  JOIN smart_meters m ON b.meter_id = m.meter_id
  ORDER BY b.generated_at DESC;
  ```
- **Sample Output:**
  | bill_number | consumer_number | consumer_name | consumer_category | meter_number | units_consumed | total_amount | bill_status | due_date |
  | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
  | BILL-202610-1001 | CON-1001 | Rahul Sharma | Residential | MTR-3001 | 185.00 | ₹954.19 | Partially Paid | 2026-11-10 |
  | BILL-202610-1007 | CON-1007 | Green Valley Cold Storage | Industrial | MTR-3007 | 3200.00 | ₹33757.50 | Unpaid | 2026-11-10 |

---

### Query 3: Multi-Table JOIN — Payments with Associated Bills & Receipts
- **Purpose:** Audit incoming payment ledger receipts against billed consumers.
- **SQL:**
  ```sql
  SELECT 
      p.payment_reference,
      b.bill_number,
      c.full_name AS consumer_name,
      p.amount_paid,
      p.payment_method,
      p.payment_date,
      p.payment_status
  FROM payments p
  JOIN bills b ON p.bill_id = b.bill_id
  JOIN consumers c ON b.consumer_id = c.consumer_id
  ORDER BY p.payment_date DESC;
  ```

---

### Query 4: Aggregation with GROUP BY — Monthly Billed Revenue & Collected Cash
- **Purpose:** Calculate financial health: total revenue billed vs actual cash collected per billing month.
- **SQL:**
  ```sql
  SELECT 
      TO_CHAR(b.billing_period_start, 'YYYY-MM') AS billing_month,
      COUNT(DISTINCT b.bill_id) AS bills_count,
      ROUND(SUM(b.total_amount), 2) AS total_billed_amount,
      ROUND(COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00), 2) AS total_collected_amount,
      ROUND(SUM(b.total_amount) - COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00), 2) AS total_outstanding
  FROM bills b
  LEFT JOIN payments p ON b.bill_id = p.bill_id
  GROUP BY TO_CHAR(b.billing_period_start, 'YYYY-MM')
  ORDER BY billing_month DESC;
  ```
- **Sample Output:**
  | billing_month | bills_count | total_billed_amount | total_collected_amount | total_outstanding |
  | :--- | :--- | :--- | :--- | :--- |
  | 2026-10 | 12 | ₹50,230.50 | ₹14,800.00 | ₹35,430.50 |
  | 2026-09 | 6 | ₹28,450.00 | ₹28,450.00 | ₹0.00 |

---

### Query 5: Aggregation with GROUP BY — Energy Consumption by Consumer Category
- **Purpose:** Benchmark electricity grid demand patterns across consumer sectors.
- **SQL:**
  ```sql
  SELECT 
      c.consumer_category,
      COUNT(DISTINCT c.consumer_id) AS total_consumers,
      COUNT(r.reading_id) AS total_readings_taken,
      ROUND(SUM(r.consumption_units), 2) AS total_kwh_consumed,
      ROUND(AVG(r.consumption_units), 2) AS avg_kwh_per_reading,
      ROUND(MIN(r.consumption_units), 2) AS min_reading_kwh,
      ROUND(MAX(r.consumption_units), 2) AS peak_reading_kwh
  FROM consumers c
  JOIN smart_meters m ON c.consumer_id = m.consumer_id
  JOIN meter_readings r ON m.meter_id = r.meter_id
  GROUP BY c.consumer_category
  ORDER BY total_kwh_consumed DESC;
  ```

---

### Query 6: GROUP BY with HAVING Clause — High-Consumption Commercial & Industrial Accounts
- **Purpose:** Identify high-volume utility accounts that have consumed in excess of 500 kWh.
- **SQL:**
  ```sql
  SELECT 
      c.consumer_number,
      c.full_name,
      c.consumer_category,
      COUNT(r.reading_id) AS recorded_cycles,
      ROUND(SUM(r.consumption_units), 2) AS aggregate_consumption_kwh,
      ROUND(AVG(r.consumption_units), 2) AS avg_consumption_kwh
  FROM consumers c
  JOIN smart_meters m ON c.consumer_id = m.consumer_id
  JOIN meter_readings r ON m.meter_id = r.meter_id
  GROUP BY c.consumer_id, c.consumer_number, c.full_name, c.consumer_category
  HAVING SUM(r.consumption_units) > 500.00
  ORDER BY aggregate_consumption_kwh DESC;
  ```

---

### Query 7: Nested Subquery with `IN` — Consumers with Zero Outstanding Bills
- **Purpose:** Identify reliable consumers whose bills are 100% cleared.
- **SQL:**
  ```sql
  SELECT 
      c.consumer_number,
      c.full_name,
      c.consumer_category,
      c.phone
  FROM consumers c
  WHERE c.consumer_id NOT IN (
      SELECT DISTINCT consumer_id 
      FROM bills 
      WHERE bill_status IN ('Unpaid', 'Partially Paid', 'Overdue')
  )
  ORDER BY c.full_name ASC;
  ```

---

### Query 8: Correlated Subquery — Consumers Consuming Above Their Category Average
- **Purpose:** Detect anomalous consumption or power leakage within a category.
- **SQL:**
  ```sql
  SELECT 
      c.consumer_number,
      c.full_name,
      c.consumer_category,
      r.consumption_units,
      r.reading_date
  FROM consumers c
  JOIN smart_meters m ON c.consumer_id = m.consumer_id
  JOIN meter_readings r ON m.meter_id = r.meter_id
  WHERE r.consumption_units > (
      SELECT AVG(r2.consumption_units)
      FROM meter_readings r2
      JOIN smart_meters m2 ON r2.meter_id = m2.meter_id
      JOIN consumers c2 ON m2.consumer_id = c2.consumer_id
      WHERE c2.consumer_category = c.consumer_category
  )
  ORDER BY c.consumer_category, r.consumption_units DESC;
  ```

---

### Query 9: Window Function (`DENSE_RANK()`) — Peak Consumer in Each Category
- **Purpose:** Find the highest single consumer in Residential, Commercial, and Industrial.
- **SQL:**
  ```sql
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
  ```

---

### Query 10: ACID Transaction Demonstration — Atomic Payment Settlement
- **Purpose:** Show atomicity: registering a payment and updating bill status in one transaction.
- **SQL:**
  ```sql
  DO $$
  DECLARE
      v_bill_id INT := 3;
      v_payment_amount NUMERIC := 954.19;
      v_total_due NUMERIC;
      v_already_paid NUMERIC;
      v_new_total_paid NUMERIC;
  BEGIN
      SELECT total_amount INTO v_total_due FROM bills WHERE bill_id = v_bill_id;
      
      SELECT COALESCE(SUM(amount_paid), 0.00) INTO v_already_paid 
      FROM payments 
      WHERE bill_id = v_bill_id AND payment_status = 'SUCCESS';

      v_new_total_paid := v_already_paid + v_payment_amount;

      INSERT INTO payments (bill_id, payment_reference, amount_paid, payment_method, payment_status, recorded_by)
      VALUES (v_bill_id, CONCAT('DEMO-TXN-', EXTRACT(EPOCH FROM NOW())::BIGINT), v_payment_amount, 'UPI', 'SUCCESS', 1);

      IF v_new_total_paid >= v_total_due THEN
          UPDATE bills SET bill_status = 'Paid' WHERE bill_id = v_bill_id;
      ELSE
          UPDATE bills SET bill_status = 'Partially Paid' WHERE bill_id = v_bill_id;
      END IF;
  END $$;
  ```

---

## 3. Course Outcome 6 (CO6): NoSQL & Semi-Structured JSONB Queries

### Query 11: In-Document Extraction with `->>` Operator
- **Purpose:** Extract voltage, active power, and firmware version from raw smart meter JSON document payloads.
- **SQL:**
  ```sql
  SELECT 
      meter_number,
      recorded_at,
      (payload->'metrics'->>'voltage_rms')::NUMERIC AS voltage_v,
      (payload->'metrics'->>'active_power_kw')::NUMERIC AS power_kw,
      payload->'diagnostics'->>'firmware_version' AS firmware
  FROM meter_telemetry_documents
  ORDER BY recorded_at DESC;
  ```

### Query 12: Inverted Index GIN Document Containment with `@>`
- **Purpose:** Sub-millisecond filtering by matching embedded JSON object patterns using the GIN index.
- **SQL:**
  ```sql
  SELECT 
      meter_number,
      recorded_at,
      payload->'diagnostics'->>'ambient_temp_c' AS ambient_temp,
      payload->'alerts' AS alerts
  FROM meter_telemetry_documents
  WHERE payload @> '{"diagnostics": {"firmware_version": "v4.0.0"}}';
  ```
