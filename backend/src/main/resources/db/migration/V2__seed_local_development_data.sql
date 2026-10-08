insert into companies (id, code, name, active, created_at, updated_at)
values (
    '11111111-1111-1111-1111-111111111111',
    'INST',
    'Institution',
    true,
    now(),
    now()
);

insert into departments (id, company_id, code, name, created_at, updated_at)
values (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'ADMIN',
    'Administration',
    now(),
    now()
);

insert into employees (
    id,
    employee_code,
    first_name,
    last_name,
    email,
    department_id,
    joining_date,
    status,
    created_at,
    updated_at
)
values (
    '33333333-3333-3333-3333-333333333333',
    'EMP001',
    'Demo',
    'Employee',
    'demo.employee@institution.local',
    '22222222-2222-2222-2222-222222222222',
    current_date,
    'ACTIVE',
    now(),
    now()
);

insert into biometric_devices (
    id,
    device_code,
    name,
    ip_address,
    location,
    token_hash,
    active,
    created_at,
    updated_at
)
values (
    '44444444-4444-4444-4444-444444444444',
    'BIO-001',
    'Main Gate Biometric',
    '192.168.1.50',
    'Main Gate',
    'e76b6359af8cbe298e362c0e179b90c627cef49db0e9aeeca55175ef799c6b37',
    true,
    now(),
    now()
);
