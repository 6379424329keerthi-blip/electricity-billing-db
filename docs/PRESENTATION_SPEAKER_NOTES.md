# College DBMS Project Presentation Speaker Notes & Viva Guide
## Electricity Consumption & Smart Meter Billing Database
**Audience:** External Examiner, Course Instructor, Faculty Review Committee  
**Speaker Role:** Lead Full-Stack & Database Developer (CSE Student)  
**Total Allocated Presentation Time:** 10–12 Minutes + 3 Minutes Viva Voce  

---

## Slide 1: Title, Team & Project Motivation (1 Minute)

> **Speaker Script:**  
> "Good morning, respected examiners and faculty members. Today, our team is presenting our DBMS Internal Assessment project: **Electricity Consumption and Smart Meter Billing Database**.  
> In traditional utility distribution, electromechanical meters require physical reading personnel. This manual approach suffers from three major flaws: human transcription errors, delayed billing cycles of up to 45 days, and zero transparency for consumers tracking their daily consumption.  
> Our system introduces a centralized, PostgreSQL-backed smart grid billing platform that automates sequential meter telemetry simulation, enforces progressive multi-slab tariff calculations, manages partial and full payment ledgers, and provides role-based analytical dashboards for Administrators, Field Staff, and Consumers."

---

## Slide 2: ER Modeling & Database Schema Design (2 Minutes)

> **Speaker Script:**  
> "Turning to our database architecture, we modeled our system around eight primary relational entities: `users`, `consumers`, `smart_meters`, `tariff_slabs`, `meter_readings`, `bills`, `payments`, and `audit_logs`.  
> Each entity serves a distinct lifecycle function:
> - `consumers` models the service connection profile, linked optional to `users` for web portal access.
> - `smart_meters` tracks hardware units assigned to consumers ($1:N$).
> - `meter_readings` captures transactional cumulative dial values.
> - `bills` stores itemized invoices computed from readings.
> - `payments` records individual receipt transactions ($1:N$ per bill, supporting partial payments).
> 
> We normalized our relational schema strictly to **Third Normal Form (3NF)**. We eliminated partial dependencies by separating meter hardware attributes from temporal dial readings, and eliminated transitive dependencies by factoring consumer physical addresses out of the `bills` table and dynamic tariff rates out into `tariff_slabs`."

---

## Slide 3: Smart Slab-based Billing Engine & Stored Procedures (2 Minutes)

> **Speaker Script:**  
> "A core technical challenge in utility databases is progressive tiered billing. Most utilities do not charge a flat rate; instead, rates increase across consumption brackets.  
> We implemented this logic in PostgreSQL through our stored function `fn_calculate_bill_energy_charges` and Node.js billing engine. For instance, in our Residential category:
> - The first 100 kWh are billed at ₹3.50/unit.
> - Units from 101 to 200 kWh are billed at ₹5.00/unit.
> - Units exceeding 200 kWh are billed at ₹6.50/unit.
> - A fixed connection charge and category-specific tax percentage (5% to 9%) are added.
> 
> Furthermore, database integrity constraints enforce that a current dial reading cannot be lower than the previous reading ($Current \ge Previous$), and unique constraints prevent duplicate bills from being generated for the same meter reading."

---

## Slide 4: Application Architecture & Database Connectivity (1.5 Minutes)

> **Speaker Script:**  
> "For our application tier, we used React 19 with Vite on the frontend and Node.js with Express on the backend.  
> Database connectivity is implemented using connection pooling via the PostgreSQL `pg` package. All backend database operations strictly use parameterized queries ($1, $2, ...) to prevent SQL injection vulnerabilities.  
> All financial transactions—specifically bill generation and payment recording—are wrapped in strict ACID transactions using `BEGIN`, row-level locking with `SELECT ... FOR UPDATE` to prevent race conditions during concurrent payments, and `COMMIT` or `ROLLBACK` on error."

---

## Slide 5: Security, RBAC & IDOR Prevention (1.5 Minutes)

> **Speaker Script:**  
> "Security was a primary focus during our system design:
> - Passwords are never stored in plaintext; they are hashed using bcrypt with salt rounds of 10.
> - Stateless authentication is managed via JSON Web Tokens (JWT) signed with a strong environment secret.
> - We implemented strict Role-Based Access Control: Administrators manage master tariffs, meters, and consumers; Staff record readings and issue bills; Consumers have self-service portals.
> - To prevent Insecure Direct Object References (IDOR), consumers can only access their own bills, meter readings, and payment histories. If a consumer attempts to pay another consumer's bill, the backend intercepts the request and issues a `403 Forbidden` response."

---

## Slide 6: Course Outcome 6: Relational SQL vs. NoSQL Telemetry (1.5 Minutes)

> **Speaker Script:**  
> "Under Course Outcome 6, we analyzed how emerging NoSQL paradigms integrate into modern smart grid architectures.  
> Electrical utilities operate a polyglot persistence architecture:
> - Raw IoT telemetry—such as 1-second sampled current waveforms, voltage fluctuations, and power quality alarms—is high-velocity and semi-structured. In enterprise architectures, this is handled by NoSQL document or time-series stores like MongoDB or Cassandra.
> - In contrast, billing, tariff rules, and financial ledgers require absolute ACID guarantees, which can only be safely entrusted to a relational engine like PostgreSQL.
> 
> To demonstrate this hybrid capability in our project, we implemented `meter_telemetry_documents` using PostgreSQL's native `JSONB` data type with Generalized Inverted Indexes (GIN). This allows storing polymorphic sensor events and querying inside JSON documents using `->>` extraction and `@>` containment operators with sub-millisecond execution times."

---

## Slide 7: Live Demonstration Walkthrough & Test Results (2 Minutes)

> **Speaker Script:**  
> "Now, let us walk through the live application:
> 1. We log in as Administrator (`admin@smartgrid.io`) to view the real-time PostgreSQL analytics dashboard with live revenue and consumption charts.
> 2. We demonstrate registering a new consumer and assigning an active smart meter.
> 3. We log in as Staff to simulate a meter reading, verifying that the system automatically calculates net consumption units and generates an itemized bill.
> 4. We log in as the Consumer (`rahul.sharma@example.com`), view our pending bill statement, and make a partial payment via UPI. We observe the bill status immediately update to 'Partially Paid' and verify the recalculated outstanding balance.
> 5. Finally, we execute our 20-point automated test suite (`npm test`), verifying a 100% pass rate across authentication, input validation, billing math, and IDOR access controls."

---

## Slide 8: Viva Voce Q&A — Top 10 Probable Questions & Answers

### Q1: Why did you choose PostgreSQL over MySQL or MongoDB for this project?
**Answer:**  
"Electricity billing is a financial and regulatory domain where ledger consistency and ACID compliance are non-negotiable. PostgreSQL provides strict referential integrity, check constraints, row-level locking (`FOR UPDATE`), and robust PL/pgSQL stored procedures. While MongoDB is great for raw sensor feeds, financial ledgers must not risk eventual consistency discrepancies. PostgreSQL also gives us the best of both worlds through native `JSONB` document support."

### Q2: What is the difference between 2NF and 3NF in your schema?
**Answer:**  
"2NF requires that all non-key attributes depend on the complete primary key, eliminating partial dependencies. 3NF goes further by eliminating transitive dependencies ($X \to Y \to Z$). For example, in our `bills` table, we do not store consumer address or tariff rate per unit; we only store foreign keys `consumer_id` and `meter_id`. The address depends on `consumer_id`, not `bill_id`. Factoring it out into `consumers` achieves 3NF and prevents update anomalies if a consumer moves."

### Q3: How do you prevent SQL injection in your backend?
**Answer:**  
"We never concatenate raw user input into SQL query strings. All database queries through the `pg` pool use parameterized statements with positional placeholders ($1, $2, ...). The PostgreSQL query planner treats these parameters strictly as literal values, completely neutralizing SQL injection attacks."

### Q4: How did you implement progressive multi-slab tariff calculations?
**Answer:**  
"We created a dedicated `tariff_slabs` table defining consumption tiers (`minimum_units`, `maximum_units`, `rate_per_unit`). Our billing engine iterates through the ordered slabs for the consumer's category, calculates units consumed within each tier, applies the corresponding rate, adds the category fixed charge, and computes regulatory electricity duty. This is also mirrored in our PostgreSQL stored function `fn_calculate_bill_energy_charges`."

### Q5: What happens if two staff members try to record a payment for the same bill simultaneously?
**Answer:**  
"We implemented row-level locking using `SELECT ... FOR UPDATE` inside an explicit ACID transaction (`BEGIN ... COMMIT`). The first transaction locks the bill record. The second transaction must wait until the first commits, at which point it reads the newly updated outstanding balance, preventing duplicate payments or overpayments."

### Q6: What is IDOR and how did you prevent it in your API?
**Answer:**  
"Insecure Direct Object Reference (IDOR) occurs when an API accepts an object ID without verifying that the requester owns that object. In our controllers (`paymentController`, `readingController`, `billController`), whenever `req.user.role === 'CONSUMER'`, we enforce that `bill.consumer_user_id === req.user.user_id` or join through `consumers c WHERE c.user_id = req.user.user_id`. Any attempt to access another consumer's bill or readings is rejected with `403 Forbidden`."

### Q7: How does your application calculate the outstanding balance of a bill?
**Answer:**  
"Rather than storing a static balance column that could get out of sync, the outstanding balance is dynamically derived in SQL using:  
`ROUND(b.total_amount - COALESCE(SUM(p.amount_paid) FILTER (WHERE p.payment_status = 'SUCCESS'), 0.00), 2)`.  
This ensures total consistency with our financial payments ledger."

### Q8: What is a View in PostgreSQL and why did you use one?
**Answer:**  
"A View is a virtual table defined by a stored query. We created `bill_payment_summary` and `consumer_meter_details`. Views encapsulate complex multi-table joins and payment aggregations, providing a clean abstraction for reporting without duplicating underlying table data."

### Q9: How does PostgreSQL `JSONB` differ from regular `JSON`?
**Answer:**  
"Standard `JSON` is stored as plain text, requiring re-parsing on every query. `JSONB` is stored in a decomposed binary format. While it takes slightly longer to write, reading is significantly faster and it supports Generalized Inverted Indexes (GIN), enabling sub-millisecond document key searches and containment queries."

### Q10: How did you ensure your test suite does not wipe live demonstration data?
**Answer:**  
"We decoupled our database lifecycle into non-destructive setup (`npm run db:setup`), protected seed (`npm run db:seed`), and guarded reset (`npm run db:reset -- --confirm`). Our test suite runs non-destructive tests against live endpoints and cleans up its own generated test consumer records without touching default seed accounts."
