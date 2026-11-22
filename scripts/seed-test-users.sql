-- =============================================================================
-- Standalone Seed Script: Test Biometric Users, Credentials & User Accounts
-- Password for all test users: 'Password@123'
-- BCrypt Hash: '$2a$10$qfEvUsVDsR7uFOF5atV0ZutFGklPQ1JVlT5/krGHiaZvXEeh7WKXq'
-- =============================================================================

-- Seed User Accounts
insert into user_accounts (id, email, password_hash, enabled, employee_id, created_at, updated_at)
values
('61000000-0000-0000-0000-000000000001', 'admin@northstar.edu', '$2a$10$qfEvUsVDsR7uFOF5atV0ZutFGklPQ1JVlT5/krGHiaZvXEeh7WKXq', true, '33333333-3333-3333-3333-333333333333', now(), now()),
('61000000-0000-0000-0000-000000000002', 'marcus.vance@institution.local', '$2a$10$qfEvUsVDsR7uFOF5atV0ZutFGklPQ1JVlT5/krGHiaZvXEeh7WKXq', true, '33333333-3333-3333-3333-333333333334', now(), now()),
('61000000-0000-0000-0000-000000000003', 'hr@northstar.edu', '$2a$10$qfEvUsVDsR7uFOF5atV0ZutFGklPQ1JVlT5/krGHiaZvXEeh7WKXq', true, '33333333-3333-3333-3333-333333333335', now(), now()),
('61000000-0000-0000-0000-000000000004', 'david.chen@institution.local', '$2a$10$qfEvUsVDsR7uFOF5atV0ZutFGklPQ1JVlT5/krGHiaZvXEeh7WKXq', true, '33333333-3333-3333-3333-333333333336', now(), now()),
('61000000-0000-0000-0000-000000000005', 'sarah.connor@institution.local', '$2a$10$qfEvUsVDsR7uFOF5atV0ZutFGklPQ1JVlT5/krGHiaZvXEeh7WKXq', true, '33333333-3333-3333-3333-333333333337', now(), now()),
('61000000-0000-0000-0000-000000000006', 'john.doe@institution.local', '$2a$10$qfEvUsVDsR7uFOF5atV0ZutFGklPQ1JVlT5/krGHiaZvXEeh7WKXq', true, '33333333-3333-3333-3333-333333333338', now(), now()),
('61000000-0000-0000-0000-000000000007', 'emily.watson@institution.local', '$2a$10$qfEvUsVDsR7uFOF5atV0ZutFGklPQ1JVlT5/krGHiaZvXEeh7WKXq', true, '33333333-3333-3333-3333-333333333339', now(), now()),
('61000000-0000-0000-0000-000000000008', 'michael.chang@institution.local', '$2a$10$qfEvUsVDsR7uFOF5atV0ZutFGklPQ1JVlT5/krGHiaZvXEeh7WKXq', true, '33333333-3333-3333-3333-33333333333a', now(), now()),
('61000000-0000-0000-0000-000000000009', 'rachel.green@institution.local', '$2a$10$qfEvUsVDsR7uFOF5atV0ZutFGklPQ1JVlT5/krGHiaZvXEeh7WKXq', true, '33333333-3333-3333-3333-33333333333b', now(), now()),
('61000000-0000-0000-0000-000000000010', 'priya.sharma@institution.local', '$2a$10$qfEvUsVDsR7uFOF5atV0ZutFGklPQ1JVlT5/krGHiaZvXEeh7WKXq', true, '33333333-3333-3333-3333-33333333333c', now(), now()),
('61000000-0000-0000-0000-000000000011', 'user@northstar.edu', '$2a$10$qfEvUsVDsR7uFOF5atV0ZutFGklPQ1JVlT5/krGHiaZvXEeh7WKXq', true, '33333333-3333-3333-3333-333333333337', now(), now())
on conflict (email) do nothing;

-- Assign Roles
insert into account_roles (account_id, role_id)
values
-- Admins
('61000000-0000-0000-0000-000000000001', '52000000-0000-0000-0000-000000000001'),
('61000000-0000-0000-0000-000000000002', '52000000-0000-0000-0000-000000000001'),
-- HR
('61000000-0000-0000-0000-000000000003', '52000000-0000-0000-0000-000000000002'),
('61000000-0000-0000-0000-000000000004', '52000000-0000-0000-0000-000000000002'),
-- Employees
('61000000-0000-0000-0000-000000000005', '52000000-0000-0000-0000-000000000003'),
('61000000-0000-0000-0000-000000000006', '52000000-0000-0000-0000-000000000003'),
('61000000-0000-0000-0000-000000000007', '52000000-0000-0000-0000-000000000003'),
('61000000-0000-0000-0000-000000000008', '52000000-0000-0000-0000-000000000003'),
('61000000-0000-0000-0000-000000000009', '52000000-0000-0000-0000-000000000003'),
('61000000-0000-0000-0000-000000000010', '52000000-0000-0000-0000-000000000003'),
('61000000-0000-0000-0000-000000000011', '52000000-0000-0000-0000-000000000003')
on conflict do nothing;
