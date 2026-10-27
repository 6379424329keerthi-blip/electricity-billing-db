-- ============================================================================
-- STORED FUNCTIONS & PROCEDURES: Electricity Consumption & Smart Meter Billing
-- Target: PostgreSQL / pgAdmin 4
-- ============================================================================

-- Function 1: Progressive Slab Tariff Calculation Engine
-- Computes the tiered energy charge according to active slabs for the consumer category
CREATE OR REPLACE FUNCTION fn_calculate_bill_energy_charges(
    p_category VARCHAR,
    p_units NUMERIC,
    OUT p_energy_charge NUMERIC,
    OUT p_fixed_charge NUMERIC,
    OUT p_tax_percentage NUMERIC
) AS $$
DECLARE
    r RECORD;
    remaining_units NUMERIC := p_units;
    tier_units NUMERIC := 0;
    tier_capacity NUMERIC := 0;
    computed_energy NUMERIC := 0.00;
BEGIN
    p_energy_charge := 0.00;
    p_fixed_charge := 0.00;
    p_tax_percentage := 5.00;

    -- Pick highest fixed charge and tax percentage configured for this category
    SELECT COALESCE(MAX(fixed_charge), 50.00), COALESCE(MAX(tax_percentage), 5.00)
    INTO p_fixed_charge, p_tax_percentage
    FROM tariff_slabs
    WHERE consumer_category = p_category
      AND (effective_to IS NULL OR effective_to >= CURRENT_DATE);

    -- Loop through ordered slabs
    FOR r IN 
        SELECT minimum_units, maximum_units, rate_per_unit
        FROM tariff_slabs
        WHERE consumer_category = p_category
          AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
        ORDER BY minimum_units ASC
    LOOP
        IF remaining_units > 0 THEN
            IF r.maximum_units IS NOT NULL THEN
                tier_capacity := r.maximum_units - r.minimum_units;
                IF remaining_units > tier_capacity THEN
                    tier_units := tier_capacity;
                ELSE
                    tier_units := remaining_units;
                END IF;
            ELSE
                -- Highest boundless tier
                tier_units := remaining_units;
            END IF;

            computed_energy := computed_energy + (tier_units * r.rate_per_unit);
            remaining_units := remaining_units - tier_units;
        END IF;
    END LOOP;

    p_energy_charge := ROUND(computed_energy, 2);
END;
$$ LANGUAGE plpgsql;


-- Function 2: Audit Logging Trigger Function
-- Automatically creates an audit trail entry on critical table modifications
CREATE OR REPLACE FUNCTION fn_audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
        NULL,
        TG_OP,
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.bill_id
            ELSE NEW.bill_id
        END,
        CONCAT('Automatic trigger audit for table ', TG_TABLE_NAME, ' during ', TG_OP)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
