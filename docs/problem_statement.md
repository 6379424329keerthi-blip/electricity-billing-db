# Electricity Consumption & Smart Meter Billing Database
## Problem Identification & Requirements Analysis (Assessment Rubric — 5 Marks)

---

### 1. Abstract
Electricity distribution utilities manage critical municipal infrastructure that demands rigorous accounting, transparent billing, and accurate telemetry tracking. Traditional distribution setups suffer from manual meter recording discrepancies, billing latency, delayed payment reconciliation, and an inability for consumers to inspect their usage trends in real-time. This project, **Electricity Consumption & Smart Meter Billing Database**, delivers a normalized, relational database-backed web application built on **PostgreSQL (pgAdmin 4)**, **Node.js/Express.js**, and **React.js**. The system models consumers across Residential, Commercial, and Industrial categories, links unique smart meters, stores multi-cycle consumption readings, computes electricity charges through progressive tiered tariff slabs, generates itemized invoices, and records multi-mode payment settlements inside atomic database transactions.

---

### 2. Introduction
In modern smart grid paradigms, continuous data telemetry replaces periodic manual inspection. Electricity meters record accumulated kilowatt-hour ($\text{kWh}$) consumption. A central billing engine calculates billing liabilities according to government-regulated progressive tariff slabs:
$$\text{Consumption (kWh)} = \text{Current Reading} - \text{Previous Reading}$$
$$\text{Total Bill} = \text{Energy Charges (Tiered)} + \text{Fixed Demand Charge} + \text{Taxes / Duty} + \text{Adjustments}$$

The primary objective of this database application is to eliminate calculation errors, prevent duplicate billing periods, enforce referential integrity across consumers, meters, and bills, and provide real-time dashboard analytics derived directly from database queries.

---

### 3. Problem Statement
Traditional utility billing operations face severe operational limitations:
1. **Manual Entry Errors:** Field agents recording dial readings manually often produce clerical errors, resulting in inflated or depressed bills.
2. **Delayed Revenue Clearance:** Delays between meter reading, invoice dispatch, and payment capture degrade utility cashflow.
3. **Lack of Transparency:** Consumers lack granular insight into how tier boundaries (e.g. 0–100 kWh vs 101–300 kWh) impact unit rates.
4. **Data Redundancy & Inconsistency:** Fragmented spreadsheets cause orphan payment entries, unaccounted dues, and unbilled reading cycles.

---

### 4. Existing System vs. Proposed System

| Dimension | Existing Traditional System | Proposed Smart Billing Database System |
| :--- | :--- | :--- |
| **Data Storage** | Disjointed spreadsheets or legacy flat files | Fully normalized (3NF) relational database in PostgreSQL / pgAdmin |
| **Reading Capture** | Physical paper logbooks | Digital telemetry logging with auto-validation ($Current \ge Previous$) |
| **Billing Engine** | Manual or batch spreadsheet formulas | Progressive tiered slab algorithm executed inside database transactions |
| **Integrity Rules** | Minimal validation; prone to duplicate periods | Strict unique constraints, foreign keys, and check constraints |
| **Invoice Access** | Paper bills delivered weeks after reading | Instant web printable utility invoice with itemized charges |
| **Payment Ledger** | Manual bank receipt reconciliation | Real-time multi-mode clearing (Cash, UPI, Card, Net Banking) with balance reduction |
| **Analytics** | Static monthly summaries | Live Recharts dashboard computing KPIs directly via SQL aggregates |

---

### 5. Project Objectives
- **Relational Integrity:** Establish a normalized schema comprising 8 core tables (`users`, `consumers`, `smart_meters`, `tariff_slabs`, `meter_readings`, `bills`, `payments`, `audit_logs`).
- **Progressive Slab Billing:** Support dynamic tariff structures with configurable tier limits, rates per kWh, fixed capacity charges, and state electricity duties.
- **ACID Transactions:** Guarantee financial atomicity during bill generation and payment recording to prevent race conditions or partial balance updates.
- **Role-Based Access Control (RBAC):** Provide tailored dashboards for **Administrators**, **Staff Operators**, and **Consumers**.
- **Audit Logging:** Maintain an immutable operational log of all tariff adjustments, meter registrations, and billing actions.
