-- =============================================================================
-- Migration V6: Seed Comprehensive Test Users, Biometric Devices & Login Accounts
-- Designed for complete end-to-end testing of physical/simulated biometric machines
-- and user login clock-in / clock-out workflows.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. INSTITUTIONAL DEPARTMENTS
-- -----------------------------------------------------------------------------
insert into departments (id, company_id, code, name, created_at, updated_at)
values
('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'ENG', 'Engineering & Technology', now(), now()),
('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'HR', 'Human Resources', now(), now()),
('22222222-2222-2222-2222-222222222225', '11111111-1111-1111-1111-111111111111', 'FIN', 'Finance & Accounting', now(), now()),
('22222222-2222-2222-2222-222222222226', '11111111-1111-1111-1111-111111111111', 'OPS', 'Campus Operations', now(), now());

-- -----------------------------------------------------------------------------
-- 2. BIOMETRIC DEVICES FOR TESTING
-- All use the standard test device token hash ('change-me-device-token')
-- -----------------------------------------------------------------------------
insert into biometric_devices (id, device_code, name, ip_address, location, token_hash, active, created_at, updated_at)
values
('44444444-4444-4444-4444-444444444445', 'BIO-GATE-A', 'Turnstile Gate Alpha', '192.168.1.51', 'North Wing Gate A', '${demo_device_token_hash}', true, now(), now()),
('44444444-4444-4444-4444-444444444446', 'BIO-TOWER-B', 'Faculty Tower Wing B1', '192.168.1.52', 'Tower B Reception', '${demo_device_token_hash}', true, now(), now()),
('44444444-4444-4444-4444-444444444447', 'BIO-LAB-C', 'Research Lab C Scanner', '192.168.1.53', 'R&D Computer Lab', '${demo_device_token_hash}', true, now(), now()),
('44444444-4444-4444-4444-444444444448', 'WEB-TERMINAL', 'Direct Web Terminal', '127.0.0.1', 'Online Portal', '${demo_device_token_hash}', true, now(), now()),
('44444444-4444-4444-4444-444444444449', 'ZK-FACELOCK-9901', 'Face & Fingerprint Kiosk', '192.168.1.100', 'Main Entrance Lobby', '${demo_device_token_hash}', true, now(), now());

-- -----------------------------------------------------------------------------
-- 3. RANDOM TEST EMPLOYEES ACROSS DEPARTMENTS
-- -----------------------------------------------------------------------------
insert into employees (id, employee_code, first_name, last_name, email, phone, department_id, joining_date, status, created_at, updated_at)
values
('33333333-3333-3333-3333-333333333334', 'EMP010', 'Marcus', 'Vance', 'marcus.vance@institution.local', '+91-98765-43210', '22222222-2222-2222-2222-222222222223', current_date - 120, 'ACTIVE', now(), now()),
('33333333-3333-3333-3333-333333333335', 'EMP011', 'Elena', 'Rostova', 'elena.rostova@institution.local', '+91-98765-43211', '22222222-2222-2222-2222-222222222224', current_date - 300, 'ACTIVE', now(), now()),
('33333333-3333-3333-3333-333333333336', 'EMP012', 'David', 'Chen', 'david.chen@institution.local', '+91-98765-43212', '22222222-2222-2222-2222-222222222224', current_date - 180, 'ACTIVE', now(), now()),
('33333333-3333-3333-3333-333333333337', 'EMP101', 'Sarah', 'Connor', 'sarah.connor@institution.local', '+91-98765-43213', '22222222-2222-2222-2222-222222222223', current_date - 240, 'ACTIVE', now(), now()),
('33333333-3333-3333-3333-333333333338', 'EMP102', 'John', 'Doe', 'john.doe@institution.local', '+91-98765-43214', '22222222-2222-2222-2222-222222222223', current_date - 90, 'ACTIVE', now(), now()),
('33333333-3333-3333-3333-333333333339', 'EMP103', 'Emily', 'Watson', 'emily.watson@institution.local', '+91-98765-43215', '22222222-2222-2222-2222-222222222226', current_date - 150, 'ACTIVE', now(), now()),
('33333333-3333-3333-3333-33333333333a', 'EMP104', 'Michael', 'Chang', 'michael.chang@institution.local', '+91-98765-43216', '22222222-2222-2222-2222-222222222225', current_date - 200, 'ACTIVE', now(), now()),
('33333333-3333-3333-3333-33333333333b', 'EMP105', 'Rachel', 'Green', 'rachel.green@institution.local', '+91-98765-43217', '22222222-2222-2222-2222-222222222225', current_date - 60, 'ACTIVE', now(), now()),
('33333333-3333-3333-3333-33333333333c', 'EMP106', 'Priya', 'Sharma', 'priya.sharma@institution.local', '+91-98765-43218', '22222222-2222-2222-2222-222222222223', current_date - 110, 'ACTIVE', now(), now());

-- -----------------------------------------------------------------------------
-- 4. BIOMETRIC CREDENTIALS (RFID CARDS & FINGERPRINT SENSORS)
-- -----------------------------------------------------------------------------
insert into employee_biometric_credentials (id, employee_id, credential_type, finger_index, card_number, template_format, template_data, template_hash, enrolled_at, active, created_at, updated_at)
values
('71000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'RFID_CARD', null, 'CARD-1001', 'RAW_HEX', 'RFID_CARD_EMP001_DATA', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', now(), true, now(), now()),
('71000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333334', 'RFID_CARD', null, 'CARD-1002', 'RAW_HEX', 'RFID_CARD_EMP002_DATA', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', now(), true, now(), now()),
('71000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333335', 'RFID_CARD', null, 'CARD-1003', 'RAW_HEX', 'RFID_CARD_EMP003_DATA', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', now(), true, now(), now()),
('71000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333336', 'RFID_CARD', null, 'CARD-1004', 'RAW_HEX', 'RFID_CARD_EMP004_DATA', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', now(), true, now(), now()),
('71000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333337', 'RFID_CARD', null, 'CARD-1005', 'RAW_HEX', 'RFID_CARD_EMP101_DATA', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', now(), true, now(), now()),
('71000000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333338', 'RFID_CARD', null, 'CARD-1006', 'RAW_HEX', 'RFID_CARD_EMP102_DATA', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', now(), true, now(), now()),
('71000000-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333339', 'RFID_CARD', null, 'CARD-1007', 'RAW_HEX', 'RFID_CARD_EMP103_DATA', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', now(), true, now(), now()),
('71000000-0000-0000-0000-000000000008', '33333333-3333-3333-3333-33333333333a', 'RFID_CARD', null, 'CARD-1008', 'RAW_HEX', 'RFID_CARD_EMP104_DATA', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', now(), true, now(), now()),
('71000000-0000-0000-0000-000000000009', '33333333-3333-3333-3333-33333333333b', 'RFID_CARD', null, 'CARD-1009', 'RAW_HEX', 'RFID_CARD_EMP105_DATA', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', now(), true, now(), now()),
('71000000-0000-0000-0000-00000000000a', '33333333-3333-3333-3333-33333333333c', 'RFID_CARD', null, 'CARD-1010', 'RAW_HEX', 'RFID_CARD_EMP106_DATA', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', now(), true, now(), now());

-- -----------------------------------------------------------------------------
-- 6. SHIFT ASSIGNMENTS (ASSIGN ALL EMPLOYEES TO STANDARD GENERAL SHIFT)
-- -----------------------------------------------------------------------------
insert into employee_shift_assignments (id, employee_id, shift_id, effective_from, effective_to, created_at, updated_at)
values
('81000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', '53000000-0000-0000-0000-000000000001', current_date - 180, null, now(), now()),
('81000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333334', '53000000-0000-0000-0000-000000000001', current_date - 180, null, now(), now()),
('81000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333335', '53000000-0000-0000-0000-000000000001', current_date - 180, null, now(), now()),
('81000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333336', '53000000-0000-0000-0000-000000000001', current_date - 180, null, now(), now()),
('81000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333337', '53000000-0000-0000-0000-000000000001', current_date - 180, null, now(), now()),
('81000000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333338', '53000000-0000-0000-0000-000000000001', current_date - 180, null, now(), now()),
('81000000-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333339', '53000000-0000-0000-0000-000000000001', current_date - 180, null, now(), now()),
('81000000-0000-0000-0000-000000000008', '33333333-3333-3333-3333-33333333333a', '53000000-0000-0000-0000-000000000001', current_date - 180, null, now(), now()),
('81000000-0000-0000-0000-000000000009', '33333333-3333-3333-3333-33333333333b', '53000000-0000-0000-0000-000000000001', current_date - 180, null, now(), now()),
('81000000-0000-0000-0000-00000000000a', '33333333-3333-3333-3333-33333333333c', '53000000-0000-0000-0000-000000000001', current_date - 180, null, now(), now());


