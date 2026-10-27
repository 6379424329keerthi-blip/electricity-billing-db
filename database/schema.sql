-- ============================================================================
-- DATABASE SCHEMA: Electricity Consumption & Smart Meter Billing Database
-- Target Database: PostgreSQL 14+ (Compatible with pgAdmin 4)
-- Description: Normalized relational schema for managing utility consumers, 
--              smart meters, progressive tariff slabs, readings, bills, & payments.
-- ============================================================================

-- Drop tables if they exist in reverse dependency order
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS meter_readings CASCADE;
DROP TABLE IF EXISTS tariff_slabs CASCADE;
DROP TABLE IF EXISTS smart_meters CASCADE;
DROP TABLE IF EXISTS consumers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Manages login credentials, roles (ADMIN, STAFF, CONSUMER), and account status.
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'STAFF', 'CONSUMER')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. CONSUMERS TABLE
-- Stores electrical consumer accounts, categories, and contact information.
-- ----------------------------------------------------------------------------
CREATE TABLE consumers (
    consumer_id SERIAL PRIMARY KEY,
    consumer_number VARCHAR(30) NOT NULL UNIQUE,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    full_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(120) NOT NULL,
    consumer_category VARCHAR(20) NOT NULL CHECK (consumer_category IN ('Residential', 'Commercial', 'Industrial')),
    connection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DISCONNECTED'))
);

-- ----------------------------------------------------------------------------
-- 3. SMART METERS TABLE
-- Tracks smart physical meters assigned to electricity consumers.
-- ----------------------------------------------------------------------------
CREATE TABLE smart_meters (
    meter_id SERIAL PRIMARY KEY,
    meter_number VARCHAR(50) NOT NULL UNIQUE,
    consumer_id INT NOT NULL REFERENCES consumers(consumer_id) ON DELETE RESTRICT,
    installation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meter_type VARCHAR(40) NOT NULL DEFAULT 'Digital Smart 3-Phase',
    meter_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (meter_status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    last_communication_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. TARIFF SLABS TABLE
-- Configurable progressive billing slabs by consumer category and unit range.
-- ----------------------------------------------------------------------------
CREATE TABLE tariff_slabs (
    slab_id SERIAL PRIMARY KEY,
    consumer_category VARCHAR(20) NOT NULL CHECK (consumer_category IN ('Residential', 'Commercial', 'Industrial')),
    minimum_units NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    maximum_units NUMERIC(10, 2), -- NULL denotes upper boundless tier (e.g., > 300 units)
    rate_per_unit NUMERIC(10, 2) NOT NULL CHECK (rate_per_unit >= 0),
    fixed_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (fixed_charge >= 0),
    tax_percentage NUMERIC(5, 2) NOT NULL DEFAULT 5.00 CHECK (tax_percentage >= 0),
    effective_from DATE NOT NULL DEFAULT '2024-01-01',
    effective_to DATE,
    CONSTRAINT chk_units_range CHECK (maximum_units IS NULL OR maximum_units > minimum_units)
);

-- ----------------------------------------------------------------------------
-- 5. METER READINGS TABLE
-- Periodic readings recorded from smart meters. Consumption is calculated as (current - previous).
-- ----------------------------------------------------------------------------
CREATE TABLE meter_readings (
    reading_id SERIAL PRIMARY KEY,
    meter_id INT NOT NULL REFERENCES smart_meters(meter_id) ON DELETE RESTRICT,
    previous_reading NUMERIC(12, 2) NOT NULL CHECK (previous_reading >= 0),
    current_reading NUMERIC(12, 2) NOT NULL CHECK (current_reading >= 0),
    consumption_units NUMERIC(12, 2) NOT NULL CHECK (consumption_units >= 0),
    reading_date DATE NOT NULL,
    reading_type VARCHAR(20) NOT NULL DEFAULT 'Regular' CHECK (reading_type IN ('Regular', 'Simulated', 'Estimated')),
    recorded_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reading_sequence CHECK (current_reading >= previous_reading),
    CONSTRAINT chk_consumption_calc CHECK (consumption_units = (current_reading - previous_reading)),
    CONSTRAINT uq_meter_reading_date UNIQUE (meter_id, reading_date)
);

-- ----------------------------------------------------------------------------
-- 6. BILLS TABLE
-- Itemized electricity utility bills generated from confirmed meter readings.
-- ----------------------------------------------------------------------------
CREATE TABLE bills (
    bill_id SERIAL PRIMARY KEY,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    consumer_id INT NOT NULL REFERENCES consumers(consumer_id) ON DELETE RESTRICT,
    meter_id INT NOT NULL REFERENCES smart_meters(meter_id) ON DELETE RESTRICT,
    reading_id INT NOT NULL UNIQUE REFERENCES meter_readings(reading_id) ON DELETE RESTRICT,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    units_consumed NUMERIC(12, 2) NOT NULL CHECK (units_consumed >= 0),
    energy_charge NUMERIC(12, 2) NOT NULL CHECK (energy_charge >= 0),
    fixed_charge NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (fixed_charge >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    adjustment_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    due_date DATE NOT NULL,
    bill_status VARCHAR(20) NOT NULL DEFAULT 'Unpaid' CHECK (bill_status IN ('Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled')),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_period_valid CHECK (billing_period_end >= billing_period_start)
);

-- ----------------------------------------------------------------------------
-- 7. PAYMENTS TABLE
-- Records payments received towards specific bills. Supports multiple/partial payments.
-- ----------------------------------------------------------------------------
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    bill_id INT NOT NULL REFERENCES bills(bill_id) ON DELETE RESTRICT,
    payment_reference VARCHAR(60) NOT NULL UNIQUE,
    amount_paid NUMERIC(12, 2) NOT NULL CHECK (amount_paid > 0),
    payment_method VARCHAR(25) NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Card', 'Bank Transfer')),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' CHECK (payment_status IN ('SUCCESS', 'PENDING', 'FAILED')),
    recorded_by INT REFERENCES users(user_id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 8. AUDIT LOGS TABLE
-- Security and operational audit trail for compliance and tracking.
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE & INTEGRITY INDEXES
-- ============================================================================
CREATE INDEX idx_consumers_num ON consumers(consumer_number);
CREATE INDEX idx_consumers_cat ON consumers(consumer_category);
CREATE INDEX idx_smart_meters_num ON smart_meters(meter_number);
CREATE INDEX idx_smart_meters_consumer ON smart_meters(consumer_id);
CREATE INDEX idx_meter_readings_meter ON meter_readings(meter_id);
CREATE INDEX idx_meter_readings_date ON meter_readings(reading_date);
CREATE INDEX idx_bills_consumer ON bills(consumer_id);
CREATE INDEX idx_bills_status ON bills(bill_status);
CREATE INDEX idx_bills_period ON bills(billing_period_start, billing_period_end);
CREATE INDEX idx_payments_bill ON payments(bill_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
