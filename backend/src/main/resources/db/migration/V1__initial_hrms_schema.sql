create table companies (
    id uuid primary key,
    code varchar(32) not null unique,
    name varchar(160) not null,
    active boolean not null default true,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table departments (
    id uuid primary key,
    company_id uuid not null references companies(id),
    code varchar(32) not null,
    name varchar(120) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    unique (company_id, code)
);

create table employees (
    id uuid primary key,
    employee_code varchar(40) not null unique,
    first_name varchar(80) not null,
    last_name varchar(80) not null,
    email varchar(180) unique,
    phone varchar(32),
    department_id uuid references departments(id),
    joining_date date,
    status varchar(32) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table biometric_devices (
    id uuid primary key,
    device_code varchar(64) not null unique,
    name varchar(120) not null,
    ip_address varchar(80),
    location varchar(120),
    token_hash varchar(64) not null,
    active boolean not null default true,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table biometric_raw_logs (
    id uuid primary key,
    device_id uuid not null references biometric_devices(id),
    employee_code varchar(40) not null,
    punch_time timestamp with time zone not null,
    direction varchar(16) not null,
    status varchar(32) not null,
    raw_payload text,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table attendance_records (
    id uuid primary key,
    employee_id uuid not null references employees(id),
    device_id uuid not null references biometric_devices(id),
    punch_time timestamp with time zone not null,
    direction varchar(16) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index idx_departments_company_id on departments(company_id);
create index idx_employees_department_id on employees(department_id);
create index idx_biometric_raw_logs_device_time on biometric_raw_logs(device_id, punch_time);
create index idx_attendance_records_employee_time on attendance_records(employee_id, punch_time);
