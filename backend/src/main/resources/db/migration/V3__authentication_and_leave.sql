create table permissions (
    id uuid primary key,
    code varchar(80) not null unique,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table roles (
    id uuid primary key,
    code varchar(40) not null unique,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table role_permissions (
    role_id uuid not null references roles(id),
    permission_id uuid not null references permissions(id),
    primary key (role_id, permission_id)
);

create table user_accounts (
    id uuid primary key,
    email varchar(180) not null unique,
    password_hash varchar(100) not null,
    enabled boolean not null default true,
    employee_id uuid unique references employees(id),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table account_roles (
    account_id uuid not null references user_accounts(id),
    role_id uuid not null references roles(id),
    primary key (account_id, role_id)
);

create table refresh_tokens (
    id uuid primary key,
    account_id uuid not null references user_accounts(id),
    token_hash varchar(64) not null unique,
    expires_at timestamp with time zone not null,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table auth_bootstrap_lock (
    id integer primary key
);
insert into auth_bootstrap_lock (id) values (1);

create table leave_requests (
    id uuid primary key,
    employee_id uuid not null references employees(id),
    start_date date not null,
    end_date date not null,
    reason varchar(1000) not null,
    status varchar(24) not null,
    reviewed_by uuid references user_accounts(id),
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    constraint chk_leave_request_dates check (end_date >= start_date)
);
create index idx_leave_requests_employee_dates on leave_requests(employee_id, start_date, end_date);

insert into permissions (id, code, created_at, updated_at) values
('51000000-0000-0000-0000-000000000001', 'employee:read', now(), now()),
('51000000-0000-0000-0000-000000000002', 'employee:write', now(), now()),
('51000000-0000-0000-0000-000000000003', 'department:read', now(), now()),
('51000000-0000-0000-0000-000000000004', 'department:write', now(), now()),
('51000000-0000-0000-0000-000000000005', 'company:read', now(), now()),
('51000000-0000-0000-0000-000000000006', 'company:write', now(), now()),
('51000000-0000-0000-0000-000000000007', 'attendance:read', now(), now()),
('51000000-0000-0000-0000-000000000008', 'biometric:read', now(), now()),
('51000000-0000-0000-0000-000000000009', 'leave:read', now(), now()),
('51000000-0000-0000-0000-000000000010', 'leave:write', now(), now()),
('51000000-0000-0000-0000-000000000011', 'account:write', now(), now()),
('51000000-0000-0000-0000-000000000012', 'leave:review', now(), now());

insert into roles (id, code, created_at, updated_at) values
('52000000-0000-0000-0000-000000000001', 'ADMIN', now(), now()),
('52000000-0000-0000-0000-000000000002', 'HR', now(), now()),
('52000000-0000-0000-0000-000000000003', 'EMPLOYEE', now(), now());

insert into role_permissions (role_id, permission_id)
select '52000000-0000-0000-0000-000000000001', id from permissions;

insert into role_permissions (role_id, permission_id)
select '52000000-0000-0000-0000-000000000002', id from permissions
where code in ('employee:read', 'employee:write', 'department:read', 'department:write',
               'company:read', 'attendance:read', 'biometric:read', 'leave:read', 'leave:write', 'leave:review');

insert into role_permissions (role_id, permission_id)
select '52000000-0000-0000-0000-000000000003', id from permissions
where code = 'leave:write';
