-- ============================================================================
-- COURSE OUTCOME 6 (CO6) DEMONSTRATION: SEMI-STRUCTURED NoSQL / JSONB STORAGE
-- Project: Electricity Consumption & Smart Meter Billing Database
-- Target Database: PostgreSQL 14+ (pgAdmin 4)
-- Purpose: Demonstrates how modern hybrid databases handle semi-structured NoSQL
--          document payloads (IoT telemetry, device diagnostics, dynamic sensor events)
--          alongside relational ACID billing tables.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create IoT Telemetry Document Collection Table
-- Stores raw, polymorphic JSON documents emitted by smart meters every 15 minutes.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meter_telemetry_documents (
    telemetry_id SERIAL PRIMARY KEY,
    meter_number VARCHAR(50) NOT NULL REFERENCES smart_meters(meter_number) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payload JSONB NOT NULL
);

-- ----------------------------------------------------------------------------
-- 2. Create GIN Index for High-Performance NoSQL Document Key Lookups
-- Generalized Inverted Index (GIN) allows sub-millisecond querying inside JSONB.
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_telemetry_payload_gin ON meter_telemetry_documents USING GIN (payload);

-- ----------------------------------------------------------------------------
-- 3. Insert Diverse Semi-Structured Telemetry Payloads
-- Demonstrates document schema flexibility (some records have power_quality, others have alarms)
-- ----------------------------------------------------------------------------
INSERT INTO meter_telemetry_documents (meter_number, recorded_at, payload) VALUES
(
    'MTR-3001',
    NOW() - INTERVAL '30 minutes',
    '{
        "sampling_interval_sec": 900,
        "metrics": {
            "voltage_rms": 230.4,
            "current_rms": 4.82,
            "power_factor": 0.98,
            "frequency_hz": 50.02,
            "active_power_kw": 1.09
        },
        "diagnostics": {
            "battery_health_pct": 98,
            "signal_rssi_dbm": -68,
            "firmware_version": "v3.4.1"
        },
        "alerts": []
    }'::jsonb
),
(
    'MTR-3003',
    NOW() - INTERVAL '25 minutes',
    '{
        "sampling_interval_sec": 900,
        "metrics": {
            "voltage_rms": 415.2,
            "current_rms": 18.6,
            "power_factor": 0.89,
            "frequency_hz": 49.95,
            "active_power_kw": 6.88
        },
        "diagnostics": {
            "ambient_temp_c": 38.5,
            "signal_rssi_dbm": -74,
            "firmware_version": "v3.4.1"
        },
        "alerts": [
            {"code": "VOLT_SAG", "severity": "WARNING", "detail": "Phase 2 voltage dropped 4% below nominal"}
        ]
    }'::jsonb
),
(
    'MTR-3005',
    NOW() - INTERVAL '15 minutes',
    '{
        "sampling_interval_sec": 900,
        "metrics": {
            "voltage_rms": 418.0,
            "current_rms": 34.2,
            "power_factor": 0.96,
            "frequency_hz": 50.01,
            "active_power_kw": 13.72
        },
        "diagnostics": {
            "ambient_temp_c": 42.1,
            "signal_rssi_dbm": -55,
            "firmware_version": "v4.0.0"
        },
        "alerts": [
            {"code": "PEAK_DEMAND_WARNING", "severity": "HIGH", "detail": "Exceeded 85% contracted maximum demand"}
        ]
    }'::jsonb
);

-- ----------------------------------------------------------------------------
-- 4. NoSQL QUERY A: Document Field Extraction using the ->> Operator
-- Query active power and power factor directly out of JSONB document
-- ----------------------------------------------------------------------------
SELECT 
    meter_number,
    recorded_at,
    (payload->'metrics'->>'voltage_rms')::NUMERIC AS voltage,
    (payload->'metrics'->>'active_power_kw')::NUMERIC AS power_kw,
    (payload->'metrics'->>'power_factor')::NUMERIC AS power_factor,
    payload->'diagnostics'->>'firmware_version' AS firmware
FROM meter_telemetry_documents
ORDER BY recorded_at DESC;

-- ----------------------------------------------------------------------------
-- 5. NoSQL QUERY B: Document Containment Query using @> Operator (Uses GIN Index)
-- Retrieve meters experiencing high ambient temperature (> 40C) or specific firmware
-- ----------------------------------------------------------------------------
SELECT 
    meter_number,
    recorded_at,
    payload->'diagnostics'->>'ambient_temp_c' AS temp_c,
    payload->'alerts' AS alerts
FROM meter_telemetry_documents
WHERE payload @> '{"diagnostics": {"firmware_version": "v4.0.0"}}';

-- ----------------------------------------------------------------------------
-- 6. NoSQL QUERY C: Unnesting Nested JSON Array Elements
-- Filter documents that contain any alert condition
-- ----------------------------------------------------------------------------
SELECT 
    t.meter_number,
    t.recorded_at,
    alert->>'code' AS alert_code,
    alert->>'severity' AS alert_severity,
    alert->>'detail' AS alert_detail
FROM meter_telemetry_documents t,
LATERAL jsonb_array_elements(t.payload->'alerts') AS alert
WHERE jsonb_array_length(t.payload->'alerts') > 0;
