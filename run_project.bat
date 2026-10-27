@echo off
title Electricity Consumption & Smart Meter Billing Launcher
color 0b

echo ====================================================================
echo  ELECTRICITY CONSUMPTION & SMART METER BILLING DATABASE LAUNCHER
echo  DBMS College Team Project
echo ====================================================================
echo.

:: 1. Check PostgreSQL service status
echo [*] Checking PostgreSQL service...
sc query postgresql-x64-18 | find "RUNNING" >nul
if %ERRORLEVEL% equ 0 (
    echo [OK] PostgreSQL 18 service is running.
) else (
    echo [INFO] Attempting to start PostgreSQL service...
    net start postgresql-x64-18 >nul 2>&1
)

:: 2. Launch Backend Express API & Web App (Port 5000)
echo [*] Starting Backend Server on http://localhost:5000...
start "SmartGrid Backend API & Web App (Port 5000)" cmd /k "cd /d %~dp0backend && node server.js"

:: 3. Launch Frontend Vite Dev Server (Port 5173)
echo [*] Starting Frontend Vite Server on http://localhost:5173...
start "SmartGrid Frontend Vite Server (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

:: 4. Wait 2 seconds and launch browser
timeout /t 2 /nobreak >nul
echo [*] Launching browser to http://localhost:5000...
start http://localhost:5000

echo.
echo ====================================================================
echo  Application is now running!
echo  - Unified App & API: http://localhost:5000
echo  - Vite Dev Server:   http://localhost:5173
echo.
echo  Demo Credentials:
echo  - Admin:    admin@smartgrid.io    / Admin@123
echo  - Staff:    staff@smartgrid.io    / Staff@123
echo  - Consumer: rahul.sharma@example.com / Consumer@123
echo ====================================================================
echo.
pause
