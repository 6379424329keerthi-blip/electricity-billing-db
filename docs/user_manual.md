# User Manual & Step-by-Step Demonstration Guide
## Electricity Consumption & Smart Meter Billing Database

---

### 1. Connecting the Database in pgAdmin 4

The application is fully configured and verified to run with **PostgreSQL** using **pgAdmin 4**.

#### Step 1.1: Open pgAdmin 4
1. Launch **pgAdmin 4** from your Windows Start Menu.
2. In the left browser tree, expand **Servers** $\to$ **PostgreSQL 18** (or your active PostgreSQL server version).
3. Under **Databases**, you will see the database:
   $$\mathbf{electricity\_billing\_db}$$
   *(If not already created, right-click Databases $\to$ Create $\to$ Database $\to$ enter `electricity_billing_db` and click Save).*

#### Step 1.2: Running Queries in pgAdmin
1. Right-click `electricity_billing_db` and click **Query Tool**.
2. Open the file `database/demonstration_queries.sql` in the Query Tool (or paste any query from `docs/sql_queries.md`).
3. Press **F5** (or click the Execute/Play button) to view the live query output.

---

### 2. Starting the Backend in VS Code

1. Open your terminal in the root project folder:
   ```powershell
   cd "c:\Users\KEERTHI\Downloads\DBMS IA PROJECT\backend"
   ```
2. *(Optional)* Seed or reset database records anytime:
   ```powershell
   npm run db:init
   ```
   *This automatically executes `schema.sql`, `views.sql`, `procedures.sql`, and `seed.sql`.*

3. Start the Express backend server:
   ```powershell
   node server.js
   ```
   *Expected output:*
   ```text
   =======================================================
    Smart Grid Billing API Server running on port 5000
    API Endpoint: http://localhost:5000/api
   =======================================================
    Database connected successfully to 'electricity_billing_db' as 'postgres'
   ```

---

### 3. Starting the Frontend in VS Code

1. Open a second terminal window in VS Code:
   ```powershell
   cd "c:\Users\KEERTHI\Downloads\DBMS IA PROJECT\frontend"
   ```
2. Start the Vite React development server:
   ```powershell
   npm run dev
   ```
3. Open your web browser and navigate to:
   $$\mathbf{http://localhost:5173}$$

---

### 4. Step-by-Step Viva Demonstration Walkthrough

#### Step 4.1: Login with Demo Switcher
1. The login screen features a **1-Click Demo Switcher** at the bottom:
   - Click **ADMIN** (`admin@smartgrid.io` / `Admin@123`) to explore the master administration portal.
   - Click **STAFF** (`staff@smartgrid.io` / `Staff@123`) to view operator workflows.
   - Click **CONSUMER** (`rahul.sharma@example.com` / `Consumer@123`) to view self-service billing.
2. Click **Sign In to Dashboard**.

#### Step 4.2: Real-time Dashboard Analytics
1. The top header shows:
   $$\text{Database: PostgreSQL: electricity\_billing\_db (Connected)}$$
2. Review the **7 Summary Cards**:
   - Total Consumers, Active Smart Meters, Total Load (kWh), Bills Generated, Total Billed, Total Collected, Outstanding Arrears.
3. Review the **4 Visual Recharts**:
   - Monthly Electricity Consumption (BarChart)
   - Monthly Revenue Billed vs Collected (BarChart)
   - Bill Settlement Pipeline (Donut/PieChart)
   - Consumption by Consumer Category (Horizontal BarChart)
4. Point out the **Anomaly Detection banner** showing consumers whose usage exceeds the city-wide average.

#### Step 4.3: Consumer Management
1. Navigate to **Consumers** via the sidebar.
2. Filter consumers by **Residential**, **Commercial**, or **Industrial**.
3. Click **Add Consumer** $\to$ enter consumer name, address, phone, category $\to$ click **Create Consumer Account**.
4. The system automatically assigns a unique sequential account number (e.g. `CON-1013`).

#### Step 4.4: Smart Meter Fleet
1. Navigate to **Smart Meters**.
2. Click **Register Smart Meter** $\to$ assign a digital smart 3-phase meter to the newly created consumer $\to$ save.
3. Observe the operational status badge (`ACTIVE`) and real-time heartbeat timestamp.

#### Step 4.5: Recording & Simulating a Reading (Formula Demonstration)
1. Navigate to **Meter Readings**.
2. Click **Record / Simulate Reading**.
3. Select your smart meter:
   - Notice the system automatically fetches the meter's previous reading!
   - Click **⚡ Auto-Simulate Typical Monthly Reading (+120 to +250 kWh)**.
   - The green preview box demonstrates the core rubric formula:
     $$\text{Consumption} = \text{Current} - \text{Previous}$$
4. Click **Save Meter Reading**.

#### Step 4.6: Progressive Slab Bill Generation
1. Navigate to **Electricity Bills**.
2. Click **Generate Bill**.
3. Select your newly recorded unbilled reading.
4. Set the payment due date and click **Generate Bill Now**.
5. The Smart Billing Engine applies progressive slabs:
   - Computes tier energy charges
   - Adds fixed capacity demand charge
   - Applies statutory electricity duty / taxes
   - Generates a unique invoice code (e.g. `BILL-202610-1013`).

#### Step 4.7: Official Printable Invoice Slip
1. In the Bills table, locate the generated bill and click **Invoice**.
2. A utility electricity bill slip appears showing:
   - Utility company branding & GSTIN
   - Consumer details & installation address
   - Meter specifications & dial reading delta
   - Itemized tiered slab charge breakdown
   - Outstanding balance & payment instructions
3. Click **Print Invoice Slip** (or press Ctrl+P) to see the clean, print-optimized document without sidebars or buttons.

#### Step 4.8: Multi-Mode Payment Recording
1. In the Bills table, click **Pay** next to an unpaid bill.
2. In the payment modal:
   - Notice the current outstanding balance is displayed.
   - Select **UPI**, **Card**, **Bank Transfer**, or **Cash**.
   - Test a partial payment (e.g., enter half the amount) $\to$ submit.
   - The bill status transitions to `Partially Paid` and the outstanding balance reduces immediately.
   - Pay the remaining balance $\to$ the bill status transitions to `Paid`.

#### Step 4.9: Reports & Security Audit Trail
1. Navigate to **Reports & Audits**.
2. Switch between:
   - **Monthly Revenue & Collection Efficiency**
   - **Monthly Consumption Summary**
   - **Outstanding & Overdue Accounts**
   - **Security Audit Trail** (displays the full log of every login, meter creation, reading entry, and payment).
