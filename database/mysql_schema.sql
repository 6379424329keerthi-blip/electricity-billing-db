-- ============================================================================
-- DATABASE SCHEMA: Electricity Consumption & Smart Meter Billing (MySQL / MariaDB)
-- Target: MySQL 8.0+ / MySQL Workbench
-- ============================================================================

CREATE DATABASE IF NOT EXISTS electricity_billing_db;
USE electricity_billing_db;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS meter_readings;
DROP TABLE IF EXISTS tariff_slabs;
DROP TABLE IF EXISTS smart_meters;
DROP TABLE IF EXISTS consumers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STAFF', 'CONSUMER') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE consumers (
    consumer_id INT AUTO_INCREMENT PRIMARY KEY,
    consumer_number VARCHAR(30) NOT NULL UNIQUE,
    user_id INT NULL,
    full_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(120) NOT NULL,
    consumer_category ENUM('Residential', 'Commercial', 'Industrial') NOT NULL,
    connection_date DATE NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'DISCONNECTED') NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE smart_meters (
    meter_id INT AUTO_INCREMENT PRIMARY KEY,
    meter_number VARCHAR(50) NOT NULL UNIQUE,
    consumer_id INT NOT NULL,
    installation_date DATE NOT NULL,
    meter_type VARCHAR(40) NOT NULL DEFAULT 'Digital Smart 3-Phase',
    meter_status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
    last_communication_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (consumer_id) REFERENCES consumers(consumer_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE tariff_slabs (
    slab_id INT AUTO_INCREMENT PRIMARY KEY,
    consumer_category ENUM('Residential', 'Commercial', 'Industrial') NOT NULL,
    minimum_units DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    maximum_units DECIMAL(10, 2) NULL,
    rate_per_unit DECIMAL(10, 2) NOT NULL,
    fixed_charge DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tax_percentage DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
    effective_from DATE NOT NULL,
    effective_to DATE NULL
) ENGINE=InnoDB;

CREATE TABLE meter_readings (
    reading_id INT AUTO_INCREMENT PRIMARY KEY,
    meter_id INT NOT NULL,
    previous_reading DECIMAL(12, 2) NOT NULL,
    current_reading DECIMAL(12, 2) NOT NULL,
    consumption_units DECIMAL(12, 2) NOT NULL,
    reading_date DATE NOT NULL,
    reading_type ENUM('Regular', 'Simulated', 'Estimated') NOT NULL DEFAULT 'Regular',
    recorded_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meter_id) REFERENCES smart_meters(meter_id) ON DELETE RESTRICT,
    FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY uq_meter_reading_date (meter_id, reading_date)
) ENGINE=InnoDB;

CREATE TABLE bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    consumer_id INT NOT NULL,
    meter_id INT NOT NULL,
    reading_id INT NOT NULL UNIQUE,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    units_consumed DECIMAL(12, 2) NOT NULL,
    energy_charge DECIMAL(12, 2) NOT NULL,
    fixed_charge DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    adjustment_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    bill_status ENUM('Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled') NOT NULL DEFAULT 'Unpaid',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consumer_id) REFERENCES consumers(consumer_id) ON DELETE RESTRICT,
    FOREIGN KEY (meter_id) REFERENCES smart_meters(meter_id) ON DELETE RESTRICT,
    FOREIGN KEY (reading_id) REFERENCES meter_readings(reading_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    payment_reference VARCHAR(60) NOT NULL UNIQUE,
    amount_paid DECIMAL(12, 2) NOT NULL,
    payment_method ENUM('Cash', 'UPI', 'Card', 'Bank Transfer') NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('SUCCESS', 'PENDING', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
    recorded_by INT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE RESTRICT,
    FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    details TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;
