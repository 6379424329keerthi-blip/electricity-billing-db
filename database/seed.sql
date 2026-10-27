-- ============================================================================
-- DATABASE SEED DATA: Electricity Consumption & Smart Meter Billing
-- Target: PostgreSQL / pgAdmin 4
-- ============================================================================

-- Clean existing data before seeding
TRUNCATE TABLE audit_logs, payments, bills, meter_readings, tariff_slabs, smart_meters, consumers, users RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------------------------
-- 1. USERS
-- Password for Admin is 'Admin@123', Staff is 'Staff@123', Consumers is 'Consumer@123'
-- ----------------------------------------------------------------------------
INSERT INTO users (user_id, full_name, email, password_hash, role, status) VALUES
(1, 'System Administrator', 'admin@smartgrid.io', '$2a$10$rhJVuB438zODJLKRAENLkOLmNBruBenYRYtbA7AXJ52w/0WYo6NjG', 'ADMIN', 'ACTIVE'),
(2, 'Divisional Staff Operator', 'staff@smartgrid.io', '$2a$10$kFV2F2v63BFtzv66MWTUu.pcNzSaOlvJYo9TEtZIgms5TIGdT2GGu', 'STAFF', 'ACTIVE'),
(3, 'Rahul Sharma', 'rahul.sharma@example.com', '$2a$10$taDFGD/hgpgO.xtcJHr59.5oyvYc3liFYtTe.sGSh3qKSpgkukWGu', 'CONSUMER', 'ACTIVE'),
(4, 'Priya Patel', 'priya.patel@example.com', '$2a$10$taDFGD/hgpgO.xtcJHr59.5oyvYc3liFYtTe.sGSh3qKSpgkukWGu', 'CONSUMER', 'ACTIVE'),
(5, 'Anand Electricals & Spares', 'anand.electricals@example.com', '$2a$10$taDFGD/hgpgO.xtcJHr59.5oyvYc3liFYtTe.sGSh3qKSpgkukWGu', 'CONSUMER', 'ACTIVE'),
(6, 'Sunita Rao', 'sunita.rao@example.com', '$2a$10$taDFGD/hgpgO.xtcJHr59.5oyvYc3liFYtTe.sGSh3qKSpgkukWGu', 'CONSUMER', 'ACTIVE'),
(7, 'Apex Infotech Hub', 'chennai.techpark@example.com', '$2a$10$taDFGD/hgpgO.xtcJHr59.5oyvYc3liFYtTe.sGSh3qKSpgkukWGu', 'CONSUMER', 'ACTIVE'),
(8, 'Vikram Singh', 'vikram.singh@example.com', '$2a$10$taDFGD/hgpgO.xtcJHr59.5oyvYc3liFYtTe.sGSh3qKSpgkukWGu', 'CONSUMER', 'ACTIVE'),
(9, 'Meera Nambiar', 'meera.nambiar@example.com', '$2a$10$taDFGD/hgpgO.xtcJHr59.5oyvYc3liFYtTe.sGSh3qKSpgkukWGu', 'CONSUMER', 'ACTIVE'),
(10, 'Green Valley Cold Storage', 'greenvalley@coldstorage.in', '$2a$10$taDFGD/hgpgO.xtcJHr59.5oyvYc3liFYtTe.sGSh3qKSpgkukWGu', 'CONSUMER', 'ACTIVE');

SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));

-- ----------------------------------------------------------------------------
-- 2. TARIFF SLABS
-- ----------------------------------------------------------------------------
INSERT INTO tariff_slabs (slab_id, consumer_category, minimum_units, maximum_units, rate_per_unit, fixed_charge, tax_percentage, effective_from) VALUES
(1, 'Residential', 0.00, 100.00, 3.50, 60.00, 5.00, '2024-01-01'),
(2, 'Residential', 100.00, 300.00, 5.25, 60.00, 5.00, '2024-01-01'),
(3, 'Residential', 300.00, NULL, 7.80, 60.00, 5.00, '2024-01-01'),
(4, 'Commercial', 0.00, 200.00, 6.50, 150.00, 9.00, '2024-01-01'),
(5, 'Commercial', 200.00, 500.00, 8.75, 150.00, 9.00, '2024-01-01'),
(6, 'Commercial', 500.00, NULL, 11.20, 150.00, 9.00, '2024-01-01'),
(7, 'Industrial', 0.00, 1000.00, 7.80, 400.00, 12.00, '2024-01-01'),
(8, 'Industrial', 1000.00, 3000.00, 9.40, 400.00, 12.00, '2024-01-01'),
(9, 'Industrial', 3000.00, NULL, 12.50, 400.00, 12.00, '2024-01-01');

SELECT setval('tariff_slabs_slab_id_seq', (SELECT MAX(slab_id) FROM tariff_slabs));

-- ----------------------------------------------------------------------------
-- 3. CONSUMERS (30 Consumers: Residential, Commercial, Industrial)
-- ----------------------------------------------------------------------------
INSERT INTO consumers (consumer_id, consumer_number, user_id, full_name, address, phone, email, consumer_category, connection_date, status) VALUES
(1, 'CON-1001', 3, 'Rahul Sharma', 'Plot 42, Sunrise Enclave, Sector 12', '+91 98765 43210', 'rahul.sharma@example.com', 'Residential', '2023-04-15', 'ACTIVE'),
(2, 'CON-1002', 4, 'Priya Patel', 'B-304, Green Meadows Apartments', '+91 98231 11223', 'priya.patel@example.com', 'Residential', '2023-06-20', 'ACTIVE'),
(3, 'CON-1003', 5, 'Anand Electricals & Spares', 'Shop 14, Commercial Complex, Main Road', '+91 94440 98765', 'anand.electricals@example.com', 'Commercial', '2022-11-10', 'ACTIVE'),
(4, 'CON-1004', 6, 'Sunita Rao', 'Villa 7, Palm Boulevard, Whitefield', '+91 97654 32109', 'sunita.rao@example.com', 'Residential', '2023-01-05', 'ACTIVE'),
(5, 'CON-1005', 7, 'Apex Infotech Hub', 'Building 4, Cyber City Phase II', '+91 99887 76655', 'chennai.techpark@example.com', 'Commercial', '2021-08-14', 'ACTIVE'),
(6, 'CON-1006', 8, 'Vikram Singh', 'Flat 12A, Heights Tower, MG Road', '+91 98123 45678', 'vikram.singh@example.com', 'Residential', '2024-02-01', 'ACTIVE'),
(7, 'CON-1007', 10, 'Green Valley Cold Storage', 'Industrial Estate Phase 1, Shed 45', '+91 98450 12345', 'greenvalley@coldstorage.in', 'Industrial', '2021-03-18', 'ACTIVE'),
(8, 'CON-1008', 9, 'Meera Nambiar', 'Door 24, Temple Avenue, Adyar', '+91 94451 23456', 'meera.nambiar@example.com', 'Residential', '2023-09-12', 'ACTIVE'),
(9, 'CON-1009', NULL, 'Metro Polymers & Plastics', 'Plot 88, Heavy Industrial Area', '+91 97890 65432', 'ops@metropolymers.com', 'Industrial', '2020-05-30', 'ACTIVE'),
(10, 'CON-1010', NULL, 'Kavita Sundaram', 'House 56, Lake View Colony', '+91 96543 21876', 'kavita.s@example.com', 'Residential', '2024-01-10', 'ACTIVE'),
(11, 'CON-1011', NULL, 'Orient Textile Mills', 'National Highway 45, Mill Compound', '+91 98980 12121', 'accounts@orienttextiles.in', 'Industrial', '2019-10-01', 'ACTIVE'),
(12, 'CON-1012', NULL, 'Cafe Coffee Lounge', 'Ground Floor, Galleria Mall', '+91 98711 22334', 'manager@coffeelounge.in', 'Commercial', '2023-12-01', 'ACTIVE'),
(13, 'CON-1013', NULL, 'Arjun Reddy', 'Flat 502, Skyline Residency, Banjara Hills', '+91 98490 11223', 'arjun.reddy@example.com', 'Residential', '2023-02-15', 'ACTIVE'),
(14, 'CON-1014', NULL, 'Deepak Verma', 'House 18, Block C, Vasant Vihar', '+91 98110 99887', 'deepak.verma@example.com', 'Residential', '2023-05-10', 'ACTIVE'),
(15, 'CON-1015', NULL, 'Royal Sweets & Bakers', 'Plot 9, Market Square, Civil Lines', '+91 94150 23456', 'orders@royalsweets.com', 'Commercial', '2022-08-20', 'ACTIVE'),
(16, 'CON-1016', NULL, 'Pooja Hegde', 'Door 45, Sea Breeze Layout, Juhu', '+91 98200 44556', 'pooja.h@example.com', 'Residential', '2023-07-01', 'ACTIVE'),
(17, 'CON-1017', NULL, 'Precision Auto Components', 'Industrial Area Sector 5, Plot 102', '+91 98220 77889', 'plant@precisionauto.co.in', 'Industrial', '2021-01-25', 'ACTIVE'),
(18, 'CON-1018', NULL, 'Sneha Mukherjee', 'Flat 3B, Lake Gardens, Ballygunge', '+91 98300 12389', 'sneha.m@example.com', 'Residential', '2024-03-12', 'ACTIVE'),
(19, 'CON-1019', NULL, 'Grand Horizon Hotel & Suites', 'NH-8 Expressway, Aerocity', '+91 98100 88776', 'gm@grandhorizon.in', 'Commercial', '2020-11-15', 'ACTIVE'),
(20, 'CON-1020', NULL, 'Karthik Raman', 'Villa 12, Riverdale Estate, Whitefield', '+91 97400 55667', 'karthik.r@example.com', 'Residential', '2023-10-05', 'ACTIVE'),
(21, 'CON-1021', NULL, 'Sterling Steel Fabrications', 'Plot 205, Heavy Engineering Zone', '+91 98310 99001', 'accounts@sterlingsteel.in', 'Industrial', '2018-06-14', 'ACTIVE'),
(22, 'CON-1022', NULL, 'Dr. Amitav Ghosh Clinic', 'First Floor, Mediplex, Salt Lake', '+91 98305 66778', 'clinic@dramitav.org', 'Commercial', '2022-04-18', 'ACTIVE'),
(23, 'CON-1023', NULL, 'Ritu Singhal', 'House 88, Sector 15A, Noida', '+91 98180 33445', 'ritu.singhal@example.com', 'Residential', '2024-02-10', 'ACTIVE'),
(24, 'CON-1024', NULL, 'Zenith Diagnostic Lab', 'SCO 42, Sector 34, Chandigarh', '+91 98720 11223', 'admin@zenithlab.in', 'Commercial', '2023-08-01', 'ACTIVE'),
(25, 'CON-1025', NULL, 'Pinnacle Chemical Works', 'GIDC Industrial Estate, Shed 12', '+91 98250 88990', 'ops@pinnaclechem.com', 'Industrial', '2020-09-30', 'ACTIVE'),
(26, 'CON-1026', NULL, 'Manoj Tiwari', 'House 14, Tagore Town, Prayagraj', '+91 94152 77889', 'manoj.tiwari@example.com', 'Residential', '2023-11-20', 'ACTIVE'),
(27, 'CON-1027', NULL, 'Shree Ganesh Supermarket', 'Main Bazar Road, Gandhi Nagar', '+91 94250 33445', 'info@ganeshmarket.com', 'Commercial', '2022-07-15', 'ACTIVE'),
(28, 'CON-1028', NULL, 'Naveen Kumar', 'Flat 804, Pearl Residency, Anna Nagar', '+91 98400 99881', 'naveen.k@example.com', 'Residential', '2024-01-05', 'ACTIVE'),
(29, 'CON-1029', NULL, 'Falcon Foundry & Casting', 'MIDC Industrial Area, Block C', '+91 98230 66778', 'plant@falconfoundry.in', 'Industrial', '2019-04-10', 'ACTIVE'),
(30, 'CON-1030', NULL, 'Bright Minds Preschool', 'Plot 6, Sector 4, Dwarka', '+91 98112 55667', 'contact@brightminds.edu.in', 'Commercial', '2023-03-01', 'ACTIVE');

SELECT setval('consumers_consumer_id_seq', (SELECT MAX(consumer_id) FROM consumers));

-- ----------------------------------------------------------------------------
-- 4. SMART METERS (30 Meters assigned to Consumers)
-- ----------------------------------------------------------------------------
INSERT INTO smart_meters (meter_id, meter_number, consumer_id, installation_date, meter_type, meter_status, last_communication_at) VALUES
(1, 'MTR-3001', 1, '2023-04-16', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '5 minutes'),
(2, 'MTR-3002', 2, '2023-06-21', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '12 minutes'),
(3, 'MTR-3003', 3, '2022-11-12', 'Digital Smart 3-Phase', 'ACTIVE', NOW() - INTERVAL '2 minutes'),
(4, 'MTR-3004', 4, '2023-01-07', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '15 minutes'),
(5, 'MTR-3005', 5, '2021-08-16', 'High-Tension Smart CT-PT', 'ACTIVE', NOW() - INTERVAL '1 minute'),
(6, 'MTR-3006', 6, '2024-02-03', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '20 minutes'),
(7, 'MTR-3007', 7, '2021-03-20', 'High-Tension Smart CT-PT', 'ACTIVE', NOW() - INTERVAL '4 minutes'),
(8, 'MTR-3008', 8, '2023-09-14', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '30 minutes'),
(9, 'MTR-3009', 9, '2020-06-02', 'High-Tension Smart CT-PT', 'ACTIVE', NOW() - INTERVAL '7 minutes'),
(10, 'MTR-3010', 10, '2024-01-12', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '1 hour'),
(11, 'MTR-3011', 11, '2019-10-05', 'High-Tension Smart CT-PT', 'ACTIVE', NOW() - INTERVAL '2 minutes'),
(12, 'MTR-3012', 12, '2023-12-03', 'Digital Smart 3-Phase', 'ACTIVE', NOW() - INTERVAL '8 minutes'),
(13, 'MTR-3013', 13, '2023-02-16', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '10 minutes'),
(14, 'MTR-3014', 14, '2023-05-12', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '25 minutes'),
(15, 'MTR-3015', 15, '2022-08-22', 'Digital Smart 3-Phase', 'ACTIVE', NOW() - INTERVAL '3 minutes'),
(16, 'MTR-3016', 16, '2023-07-02', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '18 minutes'),
(17, 'MTR-3017', 17, '2021-01-26', 'High-Tension Smart CT-PT', 'ACTIVE', NOW() - INTERVAL '6 minutes'),
(18, 'MTR-3018', 18, '2024-03-14', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '40 minutes'),
(19, 'MTR-3019', 19, '2020-11-16', 'Digital Smart 3-Phase', 'ACTIVE', NOW() - INTERVAL '5 minutes'),
(20, 'MTR-3020', 20, '2023-10-06', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '14 minutes'),
(21, 'MTR-3021', 21, '2018-06-16', 'High-Tension Smart CT-PT', 'ACTIVE', NOW() - INTERVAL '2 minutes'),
(22, 'MTR-3022', 22, '2022-04-20', 'Digital Smart 3-Phase', 'ACTIVE', NOW() - INTERVAL '11 minutes'),
(23, 'MTR-3023', 23, '2024-02-12', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '35 minutes'),
(24, 'MTR-3024', 24, '2023-08-03', 'Digital Smart 3-Phase', 'ACTIVE', NOW() - INTERVAL '9 minutes'),
(25, 'MTR-3025', 25, '2020-10-02', 'High-Tension Smart CT-PT', 'ACTIVE', NOW() - INTERVAL '4 minutes'),
(26, 'MTR-3026', 26, '2023-11-22', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '22 minutes'),
(27, 'MTR-3027', 27, '2022-07-16', 'Digital Smart 3-Phase', 'ACTIVE', NOW() - INTERVAL '13 minutes'),
(28, 'MTR-3028', 28, '2024-01-06', 'Digital Smart 1-Phase', 'ACTIVE', NOW() - INTERVAL '28 minutes'),
(29, 'MTR-3029', 29, '2019-04-12', 'High-Tension Smart CT-PT', 'ACTIVE', NOW() - INTERVAL '1 minute'),
(30, 'MTR-3030', 30, '2023-03-02', 'Digital Smart 3-Phase', 'ACTIVE', NOW() - INTERVAL '17 minutes');

SELECT setval('smart_meters_meter_id_seq', (SELECT MAX(meter_id) FROM smart_meters));

-- ----------------------------------------------------------------------------
-- 5. METER READINGS (Historical Readings across Aug, Sep, Oct 2026)
-- ----------------------------------------------------------------------------
INSERT INTO meter_readings (reading_id, meter_id, previous_reading, current_reading, consumption_units, reading_date, reading_type, recorded_by) VALUES
(1, 1, 1050.00, 1220.00, 170.00, '2026-08-25', 'Regular', 2),
(2, 1, 1220.00, 1420.00, 200.00, '2026-09-25', 'Regular', 2),
(3, 1, 1420.00, 1605.00, 185.00, '2026-10-25', 'Regular', 2),

(4, 2, 850.00, 990.00, 140.00, '2026-08-25', 'Regular', 2),
(5, 2, 990.00, 1145.00, 155.00, '2026-09-25', 'Regular', 2),
(6, 2, 1145.00, 1310.00, 165.00, '2026-10-25', 'Regular', 2),

(7, 3, 2100.00, 2480.00, 380.00, '2026-08-25', 'Regular', 2),
(8, 3, 2480.00, 2890.00, 410.00, '2026-09-25', 'Regular', 2),
(9, 3, 2890.00, 3315.00, 425.00, '2026-10-25', 'Regular', 2),

(10, 4, 1500.00, 1740.00, 240.00, '2026-08-25', 'Regular', 2),
(11, 4, 1740.00, 1995.00, 255.00, '2026-09-25', 'Regular', 2),
(12, 4, 1995.00, 2265.00, 270.00, '2026-10-25', 'Regular', 2),

(13, 5, 8400.00, 9650.00, 1250.00, '2026-08-25', 'Regular', 2),
(14, 5, 9650.00, 11020.00, 1370.00, '2026-09-25', 'Regular', 2),
(15, 5, 11020.00, 12440.00, 1420.00, '2026-10-25', 'Regular', 2),

(16, 6, 600.00, 715.00, 115.00, '2026-09-25', 'Regular', 2),
(17, 6, 715.00, 840.00, 125.00, '2026-10-25', 'Regular', 2),

(18, 7, 18500.00, 21800.00, 3300.00, '2026-08-25', 'Regular', 2),
(19, 7, 21800.00, 25000.00, 3200.00, '2026-09-25', 'Regular', 2),
(20, 7, 25000.00, 28450.00, 3450.00, '2026-10-25', 'Regular', 2),

(21, 8, 920.00, 1050.00, 130.00, '2026-09-25', 'Regular', 2),
(22, 8, 1050.00, 1195.00, 145.00, '2026-10-25', 'Regular', 2),

(23, 9, 31000.00, 36200.00, 5200.00, '2026-09-25', 'Regular', 2),
(24, 9, 36200.00, 41750.00, 5550.00, '2026-10-25', 'Regular', 2),

(25, 10, 450.00, 545.00, 95.00, '2026-09-25', 'Regular', 2),
(26, 10, 545.00, 650.00, 105.00, '2026-10-25', 'Regular', 2),

(27, 11, 45000.00, 52800.00, 7800.00, '2026-09-25', 'Regular', 2),
(28, 11, 52800.00, 61000.00, 8200.00, '2026-10-25', 'Regular', 2),

(29, 12, 1800.00, 2150.00, 350.00, '2026-09-25', 'Regular', 2),
(30, 12, 2150.00, 2525.00, 375.00, '2026-10-25', 'Regular', 2),

(31, 13, 1100.00, 1290.00, 190.00, '2026-10-25', 'Regular', 2),
(32, 14, 750.00, 885.00, 135.00, '2026-10-25', 'Regular', 2),
(33, 15, 3200.00, 3780.00, 580.00, '2026-10-25', 'Regular', 2),
(34, 16, 980.00, 1190.00, 210.00, '2026-10-25', 'Regular', 2),
(35, 17, 14200.00, 17100.00, 2900.00, '2026-10-25', 'Regular', 2),
(36, 18, 520.00, 645.00, 125.00, '2026-10-25', 'Regular', 2),
(37, 19, 12500.00, 15800.00, 3300.00, '2026-10-25', 'Regular', 2),
(38, 20, 890.00, 1075.00, 185.00, '2026-10-25', 'Regular', 2),
(39, 21, 28000.00, 34500.00, 6500.00, '2026-10-25', 'Regular', 2),
(40, 22, 1450.00, 1730.00, 280.00, '2026-10-25', 'Regular', 2),
(41, 23, 620.00, 775.00, 155.00, '2026-10-25', 'Regular', 2),
(42, 24, 2400.00, 2920.00, 520.00, '2026-10-25', 'Regular', 2),
(43, 25, 22000.00, 26800.00, 4800.00, '2026-10-25', 'Regular', 2),
(44, 26, 780.00, 920.00, 140.00, '2026-10-25', 'Regular', 2),
(45, 27, 3100.00, 3680.00, 580.00, '2026-10-25', 'Regular', 2),
(46, 28, 410.00, 525.00, 115.00, '2026-10-25', 'Regular', 2),
(47, 29, 39000.00, 46200.00, 7200.00, '2026-10-25', 'Regular', 2),
(48, 30, 950.00, 1195.00, 245.00, '2026-10-25', 'Regular', 2);

SELECT setval('meter_readings_reading_id_seq', (SELECT MAX(reading_id) FROM meter_readings));

-- ----------------------------------------------------------------------------
-- 6. BILLS
-- ----------------------------------------------------------------------------
INSERT INTO bills (bill_id, bill_number, consumer_id, meter_id, reading_id, billing_period_start, billing_period_end, units_consumed, energy_charge, fixed_charge, tax_amount, adjustment_amount, total_amount, due_date, bill_status, generated_at) VALUES
(1, 'BILL-202608-1001', 1, 1, 1, '2026-08-01', '2026-08-25', 170.00, 717.50, 60.00, 38.88, 0.00, 816.38, '2026-09-10', 'Paid', '2026-08-26 10:00:00'),
(2, 'BILL-202609-1001', 1, 1, 2, '2026-09-01', '2026-09-25', 200.00, 875.00, 60.00, 46.75, 0.00, 981.75, '2026-10-10', 'Paid', '2026-09-26 10:00:00'),
(3, 'BILL-202610-1001', 1, 1, 3, '2026-10-01', '2026-10-25', 185.00, 796.25, 60.00, 42.81, 0.00, 899.06, '2026-11-10', 'Partially Paid', '2026-10-26 10:00:00'),

(4, 'BILL-202608-1002', 2, 2, 4, '2026-08-01', '2026-08-25', 140.00, 560.00, 60.00, 31.00, 0.00, 651.00, '2026-09-10', 'Paid', '2026-08-26 10:05:00'),
(5, 'BILL-202609-1002', 2, 2, 5, '2026-09-01', '2026-09-25', 155.00, 638.75, 60.00, 34.94, 0.00, 733.69, '2026-10-10', 'Paid', '2026-09-26 10:05:00'),
(6, 'BILL-202610-1002', 2, 2, 6, '2026-10-01', '2026-10-25', 165.00, 691.25, 60.00, 37.56, 0.00, 788.81, '2026-11-10', 'Unpaid', '2026-10-26 10:05:00'),

(7, 'BILL-202608-1003', 3, 3, 7, '2026-08-01', '2026-08-25', 380.00, 2875.00, 150.00, 272.25, 0.00, 3297.25, '2026-09-10', 'Paid', '2026-08-26 10:10:00'),
(8, 'BILL-202609-1003', 3, 3, 8, '2026-09-01', '2026-09-25', 410.00, 3137.50, 150.00, 295.88, 0.00, 3583.38, '2026-10-10', 'Paid', '2026-09-26 10:10:00'),
(9, 'BILL-202610-1003', 3, 3, 9, '2026-10-01', '2026-10-25', 425.00, 3268.75, 150.00, 307.69, 0.00, 3726.44, '2026-11-10', 'Unpaid', '2026-10-26 10:10:00'),

(10, 'BILL-202608-1004', 4, 4, 10, '2026-08-01', '2026-08-25', 240.00, 1085.00, 60.00, 57.25, 0.00, 1202.25, '2026-09-10', 'Paid', '2026-08-26 10:15:00'),
(11, 'BILL-202609-1004', 4, 4, 11, '2026-09-01', '2026-09-25', 255.00, 1163.75, 60.00, 61.19, 0.00, 1284.94, '2026-10-10', 'Paid', '2026-09-26 10:15:00'),
(12, 'BILL-202610-1004', 4, 4, 12, '2026-10-01', '2026-10-25', 270.00, 1242.50, 60.00, 65.13, 0.00, 1367.63, '2026-11-10', 'Unpaid', '2026-10-26 10:15:00'),

(13, 'BILL-202608-1005', 5, 5, 13, '2026-08-01', '2026-08-25', 1250.00, 12325.00, 150.00, 1122.75, 0.00, 13597.75, '2026-09-10', 'Paid', '2026-08-26 10:20:00'),
(14, 'BILL-202609-1005', 5, 5, 14, '2026-09-01', '2026-09-25', 1370.00, 13669.00, 150.00, 1243.71, 0.00, 15062.71, '2026-10-10', 'Paid', '2026-09-26 10:20:00'),
(15, 'BILL-202610-1005', 5, 5, 15, '2026-10-01', '2026-10-25', 1420.00, 14229.00, 150.00, 1294.11, 0.00, 15673.11, '2026-11-10', 'Unpaid', '2026-10-26 10:20:00'),

(16, 'BILL-202609-1006', 6, 6, 16, '2026-09-01', '2026-09-25', 115.00, 428.75, 60.00, 24.44, 0.00, 513.19, '2026-10-10', 'Paid', '2026-09-26 10:25:00'),
(17, 'BILL-202610-1006', 6, 6, 17, '2026-10-01', '2026-10-25', 125.00, 481.25, 60.00, 27.06, 0.00, 568.31, '2026-11-10', 'Unpaid', '2026-10-26 10:25:00'),

(18, 'BILL-202608-1007', 7, 7, 18, '2026-08-01', '2026-08-25', 3300.00, 30350.00, 400.00, 3690.00, 0.00, 34440.00, '2026-09-10', 'Paid', '2026-08-26 10:30:00'),
(19, 'BILL-202609-1007', 7, 7, 19, '2026-09-01', '2026-09-25', 3200.00, 29100.00, 400.00, 3540.00, 0.00, 33040.00, '2026-10-10', 'Paid', '2026-09-26 10:30:00'),
(20, 'BILL-202610-1007', 7, 7, 20, '2026-10-01', '2026-10-25', 3450.00, 32225.00, 400.00, 3915.00, 0.00, 36540.00, '2026-11-10', 'Unpaid', '2026-10-26 10:30:00'),

(21, 'BILL-202609-1008', 8, 8, 21, '2026-09-01', '2026-09-25', 130.00, 507.50, 60.00, 28.38, 0.00, 595.88, '2026-10-10', 'Paid', '2026-09-26 10:35:00'),
(22, 'BILL-202610-1008', 8, 8, 22, '2026-10-01', '2026-10-25', 145.00, 586.25, 60.00, 32.31, 0.00, 678.56, '2026-11-10', 'Unpaid', '2026-10-26 10:35:00'),

(23, 'BILL-202609-1009', 9, 9, 23, '2026-09-01', '2026-09-25', 5200.00, 54100.00, 400.00, 6540.00, 0.00, 61040.00, '2026-10-10', 'Paid', '2026-09-26 10:40:00'),
(24, 'BILL-202610-1009', 9, 9, 24, '2026-10-01', '2026-10-25', 5550.00, 58475.00, 400.00, 7065.00, 0.00, 65940.00, '2026-11-10', 'Unpaid', '2026-10-26 10:40:00'),

(25, 'BILL-202609-1010', 10, 10, 25, '2026-09-01', '2026-09-25', 95.00, 332.50, 60.00, 19.63, 0.00, 412.13, '2026-10-10', 'Paid', '2026-09-26 10:45:00'),
(26, 'BILL-202610-1010', 10, 10, 26, '2026-10-01', '2026-10-25', 105.00, 376.25, 60.00, 21.81, 0.00, 458.06, '2026-11-10', 'Unpaid', '2026-10-26 10:45:00'),

(27, 'BILL-202609-1011', 11, 11, 27, '2026-09-01', '2026-09-25', 7800.00, 86600.00, 400.00, 10440.00, 0.00, 97440.00, '2026-10-10', 'Paid', '2026-09-26 10:50:00'),
(28, 'BILL-202610-1011', 11, 11, 28, '2026-10-01', '2026-10-25', 8200.00, 91600.00, 400.00, 11040.00, 0.00, 103040.00, '2026-11-10', 'Unpaid', '2026-10-26 10:50:00'),

(29, 'BILL-202609-1012', 12, 12, 29, '2026-09-01', '2026-09-25', 350.00, 2612.50, 150.00, 248.63, 0.00, 3011.13, '2026-10-10', 'Paid', '2026-09-26 10:55:00'),
(30, 'BILL-202610-1012', 12, 12, 30, '2026-10-01', '2026-10-25', 375.00, 2831.25, 150.00, 268.31, 0.00, 3249.56, '2026-11-10', 'Unpaid', '2026-10-26 10:55:00'),

(31, 'BILL-202610-1013', 13, 13, 31, '2026-10-01', '2026-10-25', 190.00, 822.50, 60.00, 44.13, 0.00, 926.63, '2026-11-10', 'Unpaid', '2026-10-26 11:00:00'),
(32, 'BILL-202610-1014', 14, 14, 32, '2026-10-01', '2026-10-25', 135.00, 533.75, 60.00, 29.69, 0.00, 623.44, '2026-11-10', 'Unpaid', '2026-10-26 11:05:00'),
(33, 'BILL-202610-1015', 15, 15, 33, '2026-10-01', '2026-10-25', 580.00, 4821.00, 150.00, 447.39, 0.00, 5418.39, '2026-11-10', 'Unpaid', '2026-10-26 11:10:00'),
(34, 'BILL-202610-1016', 16, 16, 34, '2026-10-01', '2026-10-25', 210.00, 927.50, 60.00, 49.38, 0.00, 1036.88, '2026-11-10', 'Unpaid', '2026-10-26 11:15:00'),
(35, 'BILL-202610-1017', 17, 17, 35, '2026-10-01', '2026-10-25', 2900.00, 25660.00, 400.00, 3127.20, 0.00, 29187.20, '2026-11-10', 'Unpaid', '2026-10-26 11:20:00');

SELECT setval('bills_bill_id_seq', (SELECT MAX(bill_id) FROM bills));

-- ----------------------------------------------------------------------------
-- 7. PAYMENTS
-- ----------------------------------------------------------------------------
INSERT INTO payments (payment_id, bill_id, payment_reference, amount_paid, payment_method, payment_date, payment_status, recorded_by) VALUES
(1, 1, 'PAY-20260828-1011', 816.38, 'UPI', '2026-08-28 14:20:00', 'SUCCESS', 1),
(2, 2, 'PAY-20260929-1022', 981.75, 'UPI', '2026-09-29 11:15:00', 'SUCCESS', 1),
(3, 3, 'PAY-20261027-1033', 400.00, 'UPI', '2026-10-27 16:30:00', 'SUCCESS', 3),

(4, 4, 'PAY-20260829-1044', 651.00, 'Card', '2026-08-29 09:40:00', 'SUCCESS', 1),
(5, 5, 'PAY-20260930-1055', 733.69, 'Card', '2026-09-30 15:25:00', 'SUCCESS', 1),

(6, 7, 'PAY-20260830-1066', 3297.25, 'Bank Transfer', '2026-08-30 16:00:00', 'SUCCESS', 2),
(7, 8, 'PAY-20261001-1077', 3583.38, 'Bank Transfer', '2026-10-01 12:10:00', 'SUCCESS', 2),

(8, 10, 'PAY-20260831-1088', 1202.25, 'UPI', '2026-08-31 18:30:00', 'SUCCESS', 1),
(9, 11, 'PAY-20261002-1099', 1284.94, 'UPI', '2026-10-02 10:45:00', 'SUCCESS', 1),

(10, 13, 'PAY-20260901-1100', 13597.75, 'Bank Transfer', '2026-09-01 11:00:00', 'SUCCESS', 2),
(11, 14, 'PAY-20261003-1111', 15062.71, 'Bank Transfer', '2026-10-03 14:15:00', 'SUCCESS', 2),

(12, 16, 'PAY-20261004-1122', 513.19, 'Card', '2026-10-04 16:50:00', 'SUCCESS', 1),

(13, 18, 'PAY-20260902-1133', 34440.00, 'Bank Transfer', '2026-09-02 17:30:00', 'SUCCESS', 2),
(14, 19, 'PAY-20261005-1144', 33040.00, 'Bank Transfer', '2026-10-05 15:00:00', 'SUCCESS', 2),

(15, 21, 'PAY-20261006-1155', 595.88, 'UPI', '2026-10-06 13:20:00', 'SUCCESS', 1),

(16, 23, 'PAY-20261007-1166', 61040.00, 'Bank Transfer', '2026-10-07 11:45:00', 'SUCCESS', 2),

(17, 25, 'PAY-20261008-1177', 412.13, 'Cash', '2026-10-08 10:15:00', 'SUCCESS', 2),

(18, 27, 'PAY-20261009-1188', 97440.00, 'Bank Transfer', '2026-10-09 16:20:00', 'SUCCESS', 2),

(19, 29, 'PAY-20261010-1199', 3011.13, 'Card', '2026-10-10 12:40:00', 'SUCCESS', 1),
(20, 6, 'PAY-20261027-2001', 500.00, 'UPI', '2026-10-25 14:10:00', 'SUCCESS', 2),
(21, 9, 'PAY-20261027-2002', 2000.00, 'Card', '2026-10-25 15:45:00', 'SUCCESS', 2),
(22, 12, 'PAY-20261027-2003', 1000.00, 'Bank Transfer', '2026-10-25 16:30:00', 'SUCCESS', 1),
(23, 15, 'PAY-20261027-2004', 10000.00, 'Bank Transfer', '2026-10-25 17:00:00', 'SUCCESS', 1),
(24, 17, 'PAY-20261027-2005', 300.00, 'Cash', '2026-10-25 11:20:00', 'SUCCESS', 2),
(25, 20, 'PAY-20261027-2006', 20000.00, 'Bank Transfer', '2026-10-25 18:40:00', 'SUCCESS', 1),
(26, 22, 'PAY-20261027-2007', 400.00, 'UPI', '2026-10-25 12:15:00', 'SUCCESS', 2),
(27, 24, 'PAY-20261027-2008', 35000.00, 'Bank Transfer', '2026-10-25 19:10:00', 'SUCCESS', 1),
(28, 26, 'PAY-20261027-2009', 250.00, 'UPI', '2026-10-25 13:50:00', 'SUCCESS', 2),
(29, 28, 'PAY-20261027-2010', 50000.00, 'Bank Transfer', '2026-10-25 20:00:00', 'SUCCESS', 1);

UPDATE bills SET bill_status = 'Partially Paid' WHERE bill_id IN (6, 9, 12, 15, 17, 20, 22, 24, 26, 28);

SELECT setval('payments_payment_id_seq', (SELECT MAX(payment_id) FROM payments));

-- ----------------------------------------------------------------------------
-- 8. AUDIT LOGS
-- ----------------------------------------------------------------------------
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'DATABASE_SEED', 'system', 1, 'Populated enriched master dataset: 30 consumers, 30 smart meters, 48 readings, 35 bills, 19 payments'),
(1, 'TARIFF_CONFIG', 'tariff_slabs', 1, 'Configured progressive tariff slabs for Residential, Commercial, and Industrial'),
(2, 'BILL_GENERATION', 'bills', 3, 'Generated monthly billing statement for consumer CON-1001 (Rahul Sharma)');

SELECT setval('audit_logs_log_id_seq', (SELECT MAX(log_id) FROM audit_logs));
