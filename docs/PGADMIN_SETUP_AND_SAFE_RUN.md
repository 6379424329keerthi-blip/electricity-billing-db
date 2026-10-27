# pgAdmin 4 Setup, Database Execution & Safe Run Guide
## Electricity Consumption & Smart Meter Billing Database
**Target System:** PostgreSQL 14+ / PostgreSQL 18 with pgAdmin 4  
**Project Workspace:** `DBMS IA PROJECT`  

---

## 1. Overview

This document provides a step-by-step guide for college evaluators and students to:
1. Connect pgAdmin 4 to the local PostgreSQL database server.
2. Inspect tables, views, stored procedures, and constraints visually.
3. Execute SQL scripts in the correct dependency order using the pgAdmin 4 Query Tool.
4. Safely initialize, seed, or reset the database from both pgAdmin and the Node.js CLI without accidentally wiping evaluation data.

---

## 2. pgAdmin 4 Connection Setup

### Step 1: Launch pgAdmin 4
1. Open the Windows Start Menu and launch **pgAdmin 4**.
2. Enter your master password if prompted by pgAdmin.

### Step 2: Register Local Server Connection
1. In the left-hand **Browser / Object Explorer** pane, right-click on **Servers** $\to$ **Register** $\to$ **Server...**.
2. Under the **General** tab:
   - **Name:** `Local PostgreSQL 18` (or any descriptive label).
3. Under the **Connection** tab:
   - **Host name/address:** `localhost` (or `127.0.0.1`)
   - **Port:** `5432`
   - **Maintenance database:** `postgres`
   - **Username:** `postgres`
   - **Password:** *(Leave blank if no password was set, or enter your postgres superuser password)*
   - Check **Save password?** for convenience.
4. Click **Save**.

### Step 3: Create the Application Database
1. In the pgAdmin tree, expand **Servers** $\to$ **Local PostgreSQL 18** $\to$ **Databases**.
2. Check if `electricity_billing_db` already exists.
3. If it does not exist:
   - Right-click on **Databases** $\to$ **Create** $\to$ **Database...**.
   - **Database:** `electricity_billing_db`
   - **Owner:** `postgres`
   - Click **Save**.

---

## 3. Safe SQL Execution in pgAdmin Query Tool

To execute scripts in pgAdmin:
1. In the Object Explorer, expand **Databases** $\to$ `electricity_billing_db`.
2. Right-click `electricity_billing_db` and select **Query Tool** (or press `Alt + Shift + Q`).
3. Open or paste SQL scripts into the Query Editor and press **F5** (or click the **Execute / Play** button).

### Execution Order & Safety Protocols

```
┌────────────────────────────────────────────────────────┐
│  STEP 1: Schema Setup (Non-Destructive)                 │
│  database/safe_schema.sql  (or database/schema.sql)    │
│  Creates: users, consumers, smart_meters, tariff_slabs,│
│           meter_readings, bills, payments, audit_logs  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  STEP 2: Database Views                                │
│  database/views.sql                                    │
│  Creates: consumer_meter_details, bill_payment_summary │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  STEP 3: Stored Functions & Procedures                 │
│  database/procedures.sql                               │
│  Creates: fn_calculate_bill_energy_charges, etc.       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  STEP 4: Demonstration Seed Data                       │
│  database/seed.sql                                     │
│  Populates: 7 users, 12 consumers/meters, 24 readings, │
│             12 bills, 9 payments                       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  STEP 5: Demonstration Evaluation Queries              │
│  database/demonstration_queries.sql                    │
│  Runs: 17+ graded evaluation queries                   │
└────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Safe vs Destructive Scripts in pgAdmin:**
> - To preserve existing live data during an evaluation, run **`database/safe_schema.sql`** instead of `schema.sql`.
> - `database/schema.sql` contains `DROP TABLE ... CASCADE` and should only be used if you intend to wipe and recreate the database from scratch.
> - `database/seed.sql` begins with `TRUNCATE TABLE ... RESTART IDENTITY CASCADE`. If you already have active demonstration records, do not re-run `seed.sql` unless you want to restore original default records.

---

## 4. Visual Verification in pgAdmin Object Explorer

Once the scripts are applied, expand `electricity_billing_db` $\to$ **Schemas** $\to$ **public**:

1. **Tables (8 primary tables):**
   - `users`
   - `consumers`
   - `smart_meters`
   - `tariff_slabs`
   - `meter_readings`
   - `bills`
   - `payments`
   - `audit_logs`
   - *(Optional CO6 demo table: `meter_telemetry_documents`)*
2. **Views (2 views):**
   - `consumer_meter_details`
   - `bill_payment_summary`
3. **Functions / Procedures:**
   - `fn_calculate_bill_energy_charges`

To view records in any table visually:
- Right-click the table name (e.g., `bills`) $\to$ **View/Edit Data** $\to$ **First 100 Rows**.

---

## 5. Command-Line Safe Workflows (CLI)

The project includes pre-configured, non-destructive Node.js CLI commands so you never accidentally erase live assessment data:

### Safe Setup (Non-Destructive)
Creates tables, indexes, views, and functions using `IF NOT EXISTS` and `CREATE OR REPLACE`. Does **NOT** delete existing records:
```powershell
cd backend
npm run db:setup
```

### Safe Seed (Preserves Existing Records)
Checks if users or consumers already exist. If data is present, skips seeding with an informational message. To force re-seeding, pass `--force`:
```powershell
cd backend
npm run db:seed
# Or to overwrite existing data:
npm run db:seed -- --force
```

### Guarded Destructive Reset (Requires `--confirm`)
Blocks execution unless the `--confirm` flag is explicitly provided:
```powershell
cd backend
# Safe execution without flag (will abort with safety message):
npm run db:reset

# Confirmed full destructive reset:
npm run db:reset -- --confirm
```

### Run 20-Point Assessment Test Suite
```powershell
cd backend
npm test
# Or:
node test_suite.js
```

---

## 6. One-Click Project Launch

A root Windows batch script is provided to start the backend and frontend simultaneously:

```cmd
run_project.bat
```
This launcher checks prerequisites, launches the backend on port 5000, launches Vite on port 5173, and opens your default web browser to:
- **Frontend Application:** `http://localhost:5173` (or production build at `http://localhost:5000`)
- **Backend API Health Check:** `http://localhost:5000/api/health`

---

## 7. Troubleshooting Common pgAdmin & PostgreSQL Issues

### Issue 1: Connection Refused / Port 5432 Not Listening
- **Cause:** PostgreSQL Windows service is stopped.
- **Fix:** Open PowerShell as Administrator and run:
  ```powershell
  Get-Service -Name "postgresql*" | Start-Service
  ```

### Issue 2: Password Authentication Failed for User "postgres"
- **Cause:** Password specified in `backend/.env` does not match the PostgreSQL service password.
- **Fix:** Update `DB_PASSWORD` in `backend/.env` with your actual PostgreSQL superuser password:
  ```ini
  DB_PASSWORD=your_actual_password
  ```

### Issue 3: Duplicate Key Error During Seed
- **Cause:** Manual sequence out of sync after manual `INSERT` operations.
- **Fix:** Run the following query in pgAdmin Query Tool to re-align auto-increment sequences:
  ```sql
  SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
  SELECT setval('consumers_consumer_id_seq', (SELECT MAX(consumer_id) FROM consumers));
  SELECT setval('smart_meters_meter_id_seq', (SELECT MAX(meter_id) FROM smart_meters));
  SELECT setval('meter_readings_reading_id_seq', (SELECT MAX(reading_id) FROM meter_readings));
  SELECT setval('bills_bill_id_seq', (SELECT MAX(bill_id) FROM bills));
  SELECT setval('payments_payment_id_seq', (SELECT MAX(payment_id) FROM payments));
  ```
