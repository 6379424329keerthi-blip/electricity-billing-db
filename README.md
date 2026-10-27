# Electricity Consumption & Smart Meter Billing Database
### A Full-Stack DBMS College Team Project Built with PostgreSQL (pgAdmin 4), Node.js, Express.js, and React.js

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![pgAdmin](https://img.shields.io/badge/GUI-pgAdmin%204-indigo.svg)](https://www.pgadmin.org/)
[![React](https://img.shields.io/badge/Frontend-React%2019-cyan.svg)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-20%2F20%20Passed-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-Academic-lightgrey.svg)]()

---

## ⚡ Project Overview

**Electricity Consumption and Smart Meter Billing Database** is a production-grade, database-backed web application engineered for college Database Management Systems (DBMS) internal assessment and project presentation. It replaces error-prone electromechanical meters and manual spreadsheet billing with a fully normalized relational database in **PostgreSQL (managed via pgAdmin 4)**, a robust RESTful **Node.js/Express.js** API, and an intuitive **React 19 / Vite** utility management portal.

The application models consumers across **Residential**, **Commercial**, and **Industrial** categories, automates smart meter telemetry recording, computes electricity bills using configurable **progressive tariff slabs**, generates official printable utility invoices, and processes multi-mode payment settlements inside atomic ACID transactions with row-level locking.

---

## 🏆 College Rubric Compliance (25 Marks Total)

| Rubric Assessment Criteria | Allocated Marks | Project Implementation Details |
| :--- | :---: | :--- |
| **1. Problem Identification & Requirements Analysis** | **5 Marks** | Detailed abstract, problem statement, existing vs proposed system comparison, and functional/non-functional requirements documented in [problem_statement.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/problem_statement.md) and [requirements.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/requirements.md). |
| **2. Schema Design and SQL Implementation** | **5 Marks** | 8 normalized tables in 3NF ([DATABASE_DESIGN.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/DATABASE_DESIGN.md)), foreign keys, check constraints, indexes, 2 views, stored procedures, and 17+ demonstration SQL queries in [SQL_QUERIES.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/SQL_QUERIES.md). |
| **3. Application Development & Database Connectivity** | **7 Marks** | Full-stack REST API with `pg.Pool`, parameterization, transactions, JWT authentication, bcrypt password hashing, RBAC, and responsive React frontend with Recharts analytics. |
| **4. Validation and Output** | **5 Marks** | Frontend and backend validations for readings ($Current \ge Previous$), duplicate bill prevention, overpayment rejection, and an automated 20-point test suite with 100% pass rate ([TEST_CASES.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/TEST_CASES.md)). |
| **5. Documentation and Demonstration** | **3 Marks** | Complete documentation suite in `docs/`, pgAdmin walkthrough ([PGADMIN_SETUP_AND_SAFE_RUN.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/PGADMIN_SETUP_AND_SAFE_RUN.md)), presentation speaker notes ([PRESENTATION_SPEAKER_NOTES.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/PRESENTATION_SPEAKER_NOTES.md)), and one-click launcher `run_project.bat`. |

---

## 🧭 Course Outcomes (CO1 to CO6) Coverage

- **CO1 (Relational Data Model & ER Architecture):** Conceptual ER diagram with entities, cardinalities, and relational algebra schema mapping in [ER_DIAGRAM.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/ER_DIAGRAM.md).
- **CO2 (Normalization & Integrity Constraints):** Rigorous 1NF $\to$ 2NF $\to$ 3NF proofs, data dictionary, check constraints, cascade behaviors in [DATABASE_DESIGN.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/DATABASE_DESIGN.md).
- **CO3 (Advanced SQL Formulation):** 17+ demonstration queries featuring multi-table joins, aggregations, `GROUP BY`, `HAVING`, subqueries, CTEs, and Window functions (`DENSE_RANK`) in [SQL_QUERIES.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/SQL_QUERIES.md).
- **CO4 (Transaction Management & Concurrency Control):** ACID transaction implementation in `paymentController.js` and `billController.js` with `BEGIN`, row-level locking (`SELECT ... FOR UPDATE`), and `COMMIT`/`ROLLBACK`.
- **CO5 (Application Development & Security):** React 19 UI + Express REST API + PostgreSQL connection pool. Parameterized queries prevent SQL injection, bcrypt protects passwords, and RBAC prevents unauthorized access.
- **CO6 (NoSQL & Emerging Paradigms):** Architectural comparison between Relational SQL (billing consistency) and NoSQL (IoT telemetry streaming), plus working implementation of semi-structured document storage using PostgreSQL native `JSONB` and GIN indexing in `database/nosql_telemetry_demo.sql`.

---

## 🛠️ Technology Stack

- **Database:** PostgreSQL 14+ / PostgreSQL 18 (Managed via **pgAdmin 4**)
- **Database Driver:** `pg` (node-postgres connection pool with parameterization and transactions)
- **Backend API:** Node.js 22, Express.js 4, `express-validator`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`, `morgan`
- **Frontend UI:** React 19, Vite, responsive utility CSS design system with blue & emerald accents
- **Data Visualizations:** Recharts (Monthly Consumption, Monthly Revenue, Settlement Donut, Category BarChart)
- **Icons:** Lucide React
- **Testing:** Automated 20-point test runner (`backend/test_suite.js`)

---

## 🚀 Quick Start Guide

### Option A: One-Click Launch (Windows)
Double-click the root batch script:
```cmd
run_project.bat
```
This launcher checks prerequisites, starts the backend on port 5000, starts Vite on port 5173, and opens your default web browser automatically.

### Option B: Manual Terminal Launch

#### 1. Configure Backend Environment
Edit `backend/.env`:
```ini
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=electricity_billing_db
JWT_SECRET=smart_grid_electricity_billing_jwt_super_secret_2026_ia
CLIENT_URL=http://localhost:5173
```

#### 2. Safe Database Setup & Seeding
From the `backend/` directory:
```powershell
# Step A: Safe non-destructive schema setup (IF NOT EXISTS)
npm run db:setup

# Step B: Safe demonstration data seed (safely skips if data already exists)
npm run db:seed
```

> [!TIP]
> - To overwrite existing records with pristine default seed data: `npm run db:seed -- --force`
> - To execute a complete destructive reset (drops all tables): `npm run db:reset -- --confirm`

#### 3. Start Application
```powershell
# Terminal 1: Backend Server (Port 5000)
cd backend
npm run dev

# Terminal 2: Frontend Web App (Port 5173)
cd frontend
npm run dev
```

Visit the application at:
- **Frontend Portal:** `http://localhost:5173`
- **Backend REST API Health:** `http://localhost:5000/api/health`

---

## 🔐 Demonstration User Credentials

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@smartgrid.io` | `Admin@123` | Full access: Tariffs, Smart Meters, Consumers, System Analytics, Audit Logs. |
| **Divisional Staff** | `staff@smartgrid.io` | `Staff@123` | Operations: Enter Meter Readings, Generate Bills, Record Payments, View History. |
| **Consumer (Residential)** | `rahul.sharma@example.com` | `Consumer@123` | Consumer self-service: View own meter, personal bills, self-pay with UPI, download invoices. |
| **Consumer (Commercial)** | `anand.electricals@example.com`| `Consumer@123` | View commercial tariffs, download bills, track power consumption trends. |

---

## 🧪 Automated Testing (20 / 20 Tests Passed)

To execute the automated 20-point test suite against the live API:
```powershell
cd backend
npm test
```

### Verified Test Summary:
- **TC 01–02:** Admin login authentication & invalid credentials rejection (401).
- **TC 03–05:** Consumer creation, unique account validation, and smart meter registration.
- **TC 06–08:** Sequential meter reading math ($Current - Previous$), negative consumption rejection (400), and duplicate reading date rejection (409).
- **TC 09–10:** Progressive slab calculation with fixed charge & taxes, and duplicate bill prevention (409).
- **TC 11–14:** Partial payment recording (`Partially Paid`), outstanding balance updating, overpayment rejection, and full final settlement (`Paid`).
- **TC 15–17:** Live database dashboard aggregates, unauthenticated access blocking (403), and health monitoring.
- **TC 18–20:** Consumer self-payment permissions, IDOR payment protection (403), and IDOR meter reading protection (403).

---

## 📚 Technical Documentation Index

All detailed reports and evaluation documents are located in the `docs/` folder:
1. [PROJECT_REVIEW_AND_IMPROVEMENTS.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/PROJECT_REVIEW_AND_IMPROVEMENTS.md) — Comprehensive inspection, fixed bugs, security enhancements, and rubric compliance report.
2. [PGADMIN_SETUP_AND_SAFE_RUN.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/PGADMIN_SETUP_AND_SAFE_RUN.md) — Step-by-step pgAdmin 4 connection, Query Tool, and safe execution guide.
3. [ER_DIAGRAM.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/ER_DIAGRAM.md) — Entity-Relationship model with Mermaid diagram and cardinalities.
4. [DATABASE_DESIGN.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/DATABASE_DESIGN.md) — 3NF normalization proofs, data dictionary, and Course Outcome 6 NoSQL analysis.
5. [SQL_QUERIES.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/SQL_QUERIES.md) — 17+ demonstration queries with descriptions, SQL formulations, and sample outputs.
6. [TEST_CASES.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/TEST_CASES.md) — 20-point verified testing matrix and execution logs.
7. [PRESENTATION_SPEAKER_NOTES.md](file:///c:/Users/KEERTHI/Downloads/DBMS%20IA%20PROJECT/docs/PRESENTATION_SPEAKER_NOTES.md) — Slide-by-slide speaker notes guide with top 10 probable viva questions and answers.
