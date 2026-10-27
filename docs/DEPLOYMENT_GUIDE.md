# Deployment Guide — Electricity Consumption & Smart Meter Billing Database
**Live Production & Cloud Deployment Manual for College DBMS Project**

This guide provides step-by-step instructions to deploy the entire full-stack application (PostgreSQL Database + Node.js Backend API + React Frontend) to the public internet with free hosting, SSL/HTTPS certificates, and live accessibility on smartphones, laptops, and college presentation screens.

---

## Architecture Overview for Deployment

Our application is structured to support both **Unified Full-Stack Deployment** and **Decoupled (Split) Deployment**:

```mermaid
flowchart TD
    subgraph Users["End Users (Examiners / Students / Consumers)"]
        Browser["Mobile / Desktop Web Browsers (HTTPS)"]
    end

    subgraph CloudHost["Cloud Application Host (e.g., Render / Railway)"]
        Express["Node.js / Express Server (Port 5000)"]
        SPA["Pre-compiled React 19 Frontend (Static in /dist)"]
        API["REST API Endpoints (/api/*)"]
        Express --> SPA
        Express --> API
    end

    subgraph ManagedDB["Cloud PostgreSQL Database (e.g., Render / Neon / Supabase)"]
        DB[("PostgreSQL 15-18 Instance (SSL Enabled)")]
        Tables[("3NF Relational Tables & Views")]
        DB --> Tables
    end

    Browser -->|HTTPS Request| Express
    API -->|DATABASE_URL via Connection Pool| DB
```

---

## Method 1: All-In-One Free Cloud Deployment on Render.com (Recommended)

Render provides a **free PostgreSQL Database** and a **free Node.js Web Service**. Since our Express server serves the compiled React build directly from `frontend/dist`, you can deploy the entire application on **one single free service**.

### Step 1: Push Project to GitHub

1. If you haven't pushed the project to GitHub yet, create a new repository on [GitHub](https://github.com/new) named `electricity-billing-db`.
2. Open PowerShell in your project folder (`c:\Users\KEERTHI\Downloads\DBMS IA PROJECT`):
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/electricity-billing-db.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Create a Free PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and sign up / log in with your GitHub account.
2. Click **New +** at the top right and select **PostgreSQL**.
3. Fill in the details:
   - **Name:** `electricity-billing-db`
   - **Database:** `electricity_billing_db`
   - **User:** `postgres`
   - **Region:** Choose the region nearest to you (e.g., `Singapore` or `Frankfurt`).
   - **Plan:** Select **Free**.
4. Click **Create Database**.
5. Once created (takes ~1 minute), scroll to the **Connections** section and copy the **Internal Database URL** (or **External Database URL** if deploying across different providers).
   - Format: `postgres://user:password@host/database`

---

### Step 3: Deploy the Web Service on Render

1. On the Render Dashboard, click **New +** and select **Web Service**.
2. Connect your GitHub repository: `electricity-billing-db`.
3. Configure the service settings:
   - **Name:** `electricity-smart-grid` (or any custom name)
   - **Region:** Same region as your database.
   - **Branch:** `main`
   - **Root Directory:** *(leave blank)*
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     npm run postinstall && npm run build
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
   - **Plan:** Select **Free**.

4. Scroll down to **Environment Variables** and add:

   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | *(Paste the Database URL from Step 2)* | Auto-handled with SSL |
   | `JWT_SECRET` | `smartgrid_super_secure_jwt_token_key_2026_dbms` | Required for login authentication |
   | `NODE_ENV` | `production` | Enables optimized production builds |
   | `PORT` | `10000` | Render's default port |

5. Click **Create Web Service**. Render will now automatically:
   - Install all backend and frontend dependencies.
   - Build the React production bundle into `frontend/dist/`.
   - Start the Express server on HTTPS!

---

### Step 4: Initialize and Seed Database Schema on Render

Once your Web Service is deployed and shows **Live**:
1. Click on the **Shell** tab on the left menu of your Render Web Service.
2. Run the database setup script:
   ```bash
   npm run db:setup
   ```
3. Run the database seed script to populate all 30 consumers, 30 smart meters, readings, bills, and payments:
   ```bash
   npm run db:seed -- --force
   ```
4. Done! Click your Render URL (e.g., `https://electricity-smart-grid.onrender.com`) to open your live application!

---

## Method 2: Two-Click Cloud Deployment on Railway.app

Railway offers automatic detection and fast PostgreSQL provisioning:

1. Sign in to [Railway.app](https://railway.app/) with your GitHub account.
2. Click **New Project** $\to$ **Provision PostgreSQL**.
3. In the same project canvas, click **New** $\to$ **GitHub Repo** $\to$ select `electricity-billing-db`.
4. Go to **Variables** tab on your deployed service:
   - Add reference: `DATABASE_URL = ${{Postgres.DATABASE_URL}}`
   - Add `JWT_SECRET = super_secure_jwt_secret_2026`
   - Add `NODE_ENV = production`
5. Go to **Settings** $\to$ **Build & Deploy**:
   - Build Command: `npm run postinstall && npm run build`
   - Start Command: `npm start`
6. Click **Generate Domain** under Settings to receive your free public HTTPS URL (e.g., `https://electricity-billing-production.up.railway.app`).
7. Open the Railway web terminal and execute:
   ```bash
   npm run db:setup && npm run db:seed
   ```

---

## Method 3: Instant 30-Second Public URL (Zero-Cost Live Viva Presentation)

If you are presenting to professors or evaluators inside the college lab and want them to test the website on their smartphones or laptops without setting up cloud accounts, use **LocalTunnel** or **Ngrok** to instantly route your local running PostgreSQL app to a public HTTPS URL:

### Using LocalTunnel (No account required):
1. Make sure your local app is running:
   ```powershell
   cd "c:\Users\KEERTHI\Downloads\DBMS IA PROJECT"
   .\run_project.bat
   ```
2. Open a new PowerShell terminal and run:
   ```powershell
   npx localtunnel --port 5000
   ```
3. LocalTunnel will print a public URL:
   ```text
   your url is: https://smartgrid-billing-demo.loca.lt
   ```
4. Share that link with evaluators or scan it with your phone! It routes directly to your local PostgreSQL 18 database in real time.

---

## Method 4: Decoupled Deployment (Vercel Frontend + Render Backend)

If you prefer hosting the React frontend on **Vercel** and the Node.js API on **Render/Railway**:

1. **Deploy Backend to Render/Railway** following Method 1 or 2. Note your backend URL (e.g., `https://electricity-api.onrender.com`).
2. **Deploy Frontend to Vercel**:
   - Go to [Vercel](https://vercel.com/) $\to$ **Add New Project**.
   - Select your repo, set **Root Directory** to `frontend`.
   - In Environment Variables, add:
     - `VITE_API_URL` = `https://electricity-api.onrender.com/api`
   - Click **Deploy**. Vercel will deploy the React application with global CDN caching.

---

## Post-Deployment Verification Checklist

Once deployed, verify the live installation:

- [ ] **Health Endpoint:** Visit `https://your-app-domain.com/api/health` — should return `{"status":"online"}`.
- [ ] **Admin Login:** Log in using `admin@smartgrid.io` / `Admin@123` $\to$ verify all 30 consumers and 30 meters load.
- [ ] **Staff Portal:** Log in using `staff@smartgrid.io` / `Staff@123` $\to$ test recording a meter reading.
- [ ] **Consumer Portal:** Log in using `rahul.sharma@example.com` / `Consumer@123` $\to$ test viewing personal bills and clicking "Pay Bill".
- [ ] **Mobile Responsiveness:** Open the URL on a mobile device and verify navigation drawer and table scrolls.
