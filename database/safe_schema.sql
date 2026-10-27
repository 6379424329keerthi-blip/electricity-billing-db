-- ============================================================================
-- SAFE DATABASE SCHEMA: Electricity Consumption & Smart Meter Billing Database
-- Target Database: PostgreSQL 14+ (Compatible with pgAdmin 4)
-- Description: Non-destructive schema definition using IF NOT EXISTS clauses.
--              Safely executed during npm run db:setup without dropping existing data.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
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
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consumers (
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
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS smart_meters (
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
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tariff_slabs (
    slab_id SERIAL PRIMARY KEY,
    consumer_category VARCHAR(20) NOT NULL CHECK (consumer_category IN ('Residential', 'Commercial', 'Industrial')),
    minimum_units NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    maximum_units NUMERIC(10, 2),
    rate_per_unit NUMERIC(10, 2) NOT NULL CHECK (rate_per_unit >= 0),
    fixed_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (fixed_charge >= 0),
    tax_percentage NUMERIC(5, 2) NOT NULL DEFAULT 5.00 CHECK (tax_percentage >= 0),
    effective_from DATE NOT NULL DEFAULT '2024-01-01',
    effective_to DATE,
    CONSTRAINT chk_units_range CHECK (maximum_units IS NULL OR maximum_units > minimum_units)
);

-- ----------------------------------------------------------------------------
-- 5. METER READINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meter_readings (
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
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bills (
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
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
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
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE & INTEGRITY INDEXES (Safe Non-Destructive)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_consumers_num ON consumers(consumer_number);
CREATE INDEX IF NOT EXISTS idx_consumers_cat ON consumers(consumer_category);
CREATE INDEX IF NOT EXISTS idx_smart_meters_num ON smart_meters(meter_number);
CREATE INDEX IF NOT EXISTS idx_smart_meters_consumer ON smart_meters(consumer_id);
CREATE INDEX IF NOT EXISTS idx_meter_readings_meter ON meter_readings(meter_id);
CREATE INDEX IF NOT EXISTS idx_meter_readings_date ON meter_readings(reading_date);
CREATE INDEX IF NOT EXISTS idx_bills_consumer ON bills(consumer_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(bill_status);
CREATE INDEX IF NOT EXISTS idx_bills_period ON bills(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_payments_bill ON payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
