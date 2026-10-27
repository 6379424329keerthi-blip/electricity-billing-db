# College Internal Assessment (IA) Presentation Outline
## Electricity Consumption & Smart Meter Billing Database

---

### Presentation Plan (Total Time: 10–12 Minutes)

#### Slide 1: Title & Team Introduction (1 Minute)
- **Project Title:** Electricity Consumption & Smart Meter Billing Database
- **Course:** Database Management Systems (DBMS) Laboratory / Internal Assessment
- **Technology Stack:** PostgreSQL (pgAdmin 4), Node.js, Express.js, React.js, Vite, Recharts, Lucide React
- **Team Members:** [Student Names & Roll Numbers]

#### Slide 2: Problem Identification & Objectives (2 Minutes)
- **The Problem:** Inaccurate manual dial readings, delayed billing cycles, lack of transparency in progressive slabs, and uncoordinated payment clearance.
- **Project Objectives:**
  - Build a 3NF normalized relational database in PostgreSQL / pgAdmin.
  - Implement a progressive tiered tariff billing algorithm.
  - Ensure financial data integrity using ACID transactions.
  - Deliver role-based dashboards for Admins, Staff, and Consumers.

#### Slide 3: Relational Schema & 3NF Normalization (2 Minutes)
- **Key Tables:** `users`, `consumers`, `smart_meters`, `tariff_slabs`, `meter_readings`, `bills`, `payments`, `audit_logs`.
- **Normalization Journey:**
  - 1NF: Atomic attributes, unique primary keys, no repeating groups.
  - 2NF: No partial functional dependencies; separated consumer and meter attributes.
  - 3NF: No transitive dependencies; decoupled tariff slabs and billing calculations.

#### Slide 4: Core DBMS Features & SQL Implementation (2 Minutes)
- **DDL:** Primary keys, foreign keys (`ON DELETE RESTRICT`), check constraints, unique constraints (`UNIQUE(meter_id, reading_date)`).
- **DML & Advanced SQL:**
  - Multi-table JOINs across consumers, meters, bills, and payments.
  - Aggregations (`SUM`, `AVG`, `COUNT`, `MAX`, `GROUP BY`, `HAVING`).
  - Nested subqueries for anomaly detection (usage exceeding city average).
  - Database Views (`bill_payment_summary`, `monthly_consumption_summary`).
  - ACID Transactions for atomic payment and bill clearance.

#### Slide 5: Progressive Slab Billing Engine & Formula (1.5 Minutes)
- **Reading Delta Formula:**
  $$\text{Consumption (kWh)} = \text{Current Dial Reading} - \text{Previous Dial Reading}$$
- **Demonstration Example:**
  - Previous: $1,250\text{ kWh}$, Current: $1,430\text{ kWh} \implies 180\text{ kWh}$
  - Slab 1 ($0\dots 100$ kWh @ ₹3.50): ₹350.00
  - Slab 2 ($100\dots 300$ kWh @ ₹5.25): 80 kWh $\times$ ₹5.25 = ₹420.00
  - Energy Charge: ₹770.00 | Fixed Demand: ₹60.00 | Tax (5%): ₹41.50
  - Total Invoiced: ₹871.50

#### Slide 6: Live System Demonstration (3 Minutes)
- **Demo Step 1:** 1-Click quick login as Administrator.
- **Demo Step 2:** Real-time dashboard showing 7 KPI cards and 4 interactive Recharts.
- **Demo Step 3:** Adding a consumer and smart meter.
- **Demo Step 4:** Recording/simulating a reading with live calculation.
- **Demo Step 5:** Generating the progressive slab bill and opening the printable invoice slip.
- **Demo Step 6:** Recording a partial and full UPI payment $\to$ observing status update to `Paid`.

#### Slide 7: Validation, Results & Conclusion (1.5 Minutes)
- **Automated Test Results:** 17 / 17 Test cases passed (verified via automated test runner).
- **Key Takeaways:** Fully functioning, production-ready, database-backed web application satisfying all 5 college assessment criteria.
- **Q&A:** Ready for examiner questions on SQL queries, normalization, and transaction handling.
