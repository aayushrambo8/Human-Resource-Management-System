-- =============================================================================
-- Migration V5: Comprehensive Enterprise HRMS Schema
-- Covers all institutional scenarios:
-- 1. Shifts, Rosters & Daily Timesheet Summaries
-- 2. Multi-Checkpoint Biometric Infrastructure & Enrolled Templates
-- 3. Institutional Leave Types, Quotas & Balances
-- 4. Calendar, Holidays & Work Patterns
-- 5. Payroll Structures, Compensation, Runs & Itemized Payslips
-- 6. Designations, Employee Documents & Emergency Contacts
-- 7. Audit Logging, System Notifications & Organization Branding
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SHIFTS, ROSTERS & DAILY TIMESHEET SUMMARIES
-- -----------------------------------------------------------------------------

create table work_shifts (
    id uuid primary key,
    company_id uuid not null references companies(id),
    code varchar(32) not null,
    name varchar(100) not null,
    start_time time not null,
    end_time time not null,
    grace_period_minutes integer not null default 15,
    half_day_minutes integer not null default 240,
    min_full_day_minutes integer not null default 480,
    break_duration_minutes integer not null default 60,
    is_night_shift boolean not null default false,
    is_flexible boolean not null default false,
    active boolean not null default true,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    unique (company_id, code)
);

create table employee_shift_assignments (
    id uuid primary key,
    employee_id uuid not null references employees(id),
    shift_id uuid not null references work_shifts(id),
    effective_from date not null,
    effective_to date,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    constraint chk_shift_assignment_dates check (effective_to is null or effective_to >= effective_from)
);

create table daily_timesheets (
    id uuid primary key,
    employee_id uuid not null references employees(id),
    work_date date not null,
    shift_id uuid references work_shifts(id),
    first_punch_in timestamp with time zone,
    last_punch_out timestamp with time zone,
    total_work_minutes integer not null default 0,
    regular_minutes integer not null default 0,
    overtime_minutes integer not null default 0,
    break_minutes integer not null default 0,
    late_minutes integer not null default 0,
    early_exit_minutes integer not null default 0,
    status varchar(32) not null default 'ABSENT', -- PRESENT, ABSENT, HALF_DAY, ON_LEAVE, HOLIDAY, WEEK_OFF
    has_anomaly boolean not null default false,
    anomaly_reason varchar(255),
    is_manual_override boolean not null default false,
    approved_by uuid references user_accounts(id),
    remarks varchar(500),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    unique (employee_id, work_date)
);

create table attendance_regularization_requests (
    id uuid primary key,
    employee_id uuid not null references employees(id),
    work_date date not null,
    corrected_punch_in timestamp with time zone,
    corrected_punch_out timestamp with time zone,
    reason varchar(500) not null,
    status varchar(24) not null default 'PENDING', -- PENDING, APPROVED, REJECTED
    reviewed_by uuid references user_accounts(id),
    reviewed_at timestamp with time zone,
    rejection_reason varchar(500),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

-- -----------------------------------------------------------------------------
-- 2. MULTI-CHECKPOINT BIOMETRIC INFRASTRUCTURE & CREDENTIALS
-- -----------------------------------------------------------------------------

create table biometric_checkpoints (
    id uuid primary key,
    company_id uuid not null references companies(id),
    code varchar(64) not null unique,
    name varchar(120) not null,
    zone_name varchar(100) not null, -- E.g. 'Main Gate', 'Tower A Floor 3', 'R&D Kiosk'
    checkpoint_type varchar(40) not null, -- FINGERPRINT_KIOSK, FACIAL_RECOGNITION, HYBRID_KIOSK, USB_DESKTOP_SCANNER
    ip_address varchar(80),
    port integer,
    serial_number varchar(100),
    is_online boolean not null default false,
    last_heartbeat timestamp with time zone,
    active boolean not null default true,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table employee_biometric_credentials (
    id uuid primary key,
    employee_id uuid not null references employees(id),
    credential_type varchar(32) not null, -- FINGERPRINT, FACE_TEMPLATE, RFID_CARD, PIN
    finger_index integer, -- 1 to 10 for fingerprints (e.g. right thumb = 1)
    card_number varchar(64),
    template_format varchar(32) not null default 'ISO_19794_2', -- ISO, ANSI, PROPRIETARY
    template_data text not null, -- Base64 encoded or encrypted biometric representation
    template_hash varchar(64) not null, -- SHA-256 integrity hash
    enrolled_at timestamp with time zone not null,
    last_verified_at timestamp with time zone,
    active boolean not null default true,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table biometric_sync_events (
    id uuid primary key,
    checkpoint_id uuid references biometric_checkpoints(id),
    device_id uuid references biometric_devices(id),
    sync_direction varchar(16) not null, -- PULL_LOGS, PUSH_USERS, SYNC_TIME
    total_records integer not null default 0,
    successful_records integer not null default 0,
    failed_records integer not null default 0,
    status varchar(24) not null, -- SUCCESS, PARTIAL, FAILED
    error_message text,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

-- -----------------------------------------------------------------------------
-- 3. INSTITUTIONAL LEAVE TYPES, QUOTAS & BALANCES
-- -----------------------------------------------------------------------------

create table leave_types (
    id uuid primary key,
    company_id uuid not null references companies(id),
    code varchar(32) not null, -- CL, SL, PL, ML, COMP_OFF, LWP
    name varchar(80) not null,
    description varchar(255),
    annual_quota numeric(5, 2) not null default 0.00,
    is_paid boolean not null default true,
    carry_forward_allowed boolean not null default false,
    max_carry_forward_days numeric(5, 2) not null default 0.00,
    encashment_allowed boolean not null default false,
    requires_documentation boolean not null default false,
    active boolean not null default true,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    unique (company_id, code)
);

create table employee_leave_balances (
    id uuid primary key,
    employee_id uuid not null references employees(id),
    leave_type_id uuid not null references leave_types(id),
    calendar_year integer not null,
    allocated_days numeric(5, 2) not null default 0.00,
    carried_over_days numeric(5, 2) not null default 0.00,
    used_days numeric(5, 2) not null default 0.00,
    pending_days numeric(5, 2) not null default 0.00,
    remaining_days numeric(5, 2) not null default 0.00,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    unique (employee_id, leave_type_id, calendar_year)
);

create table leave_encashments (
    id uuid primary key,
    employee_id uuid not null references employees(id),
    leave_type_id uuid not null references leave_types(id),
    calendar_year integer not null,
    days_encashed numeric(5, 2) not null,
    payout_amount numeric(12, 2) not null,
    status varchar(24) not null default 'PENDING', -- PENDING, APPROVED, DISBURSED, REJECTED
    reviewed_by uuid references user_accounts(id),
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

-- -----------------------------------------------------------------------------
-- 4. CALENDAR, HOLIDAYS & WORK PATTERNS
-- -----------------------------------------------------------------------------

create table holidays (
    id uuid primary key,
    company_id uuid not null references companies(id),
    name varchar(120) not null,
    holiday_date date not null,
    holiday_type varchar(32) not null default 'NATIONAL', -- NATIONAL, REGIONAL, OPTIONAL, INSTITUTIONAL
    is_recurring boolean not null default false,
    description varchar(255),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    unique (company_id, holiday_date)
);

create table institutional_calendars (
    id uuid primary key,
    company_id uuid not null references companies(id),
    name varchar(100) not null,
    academic_year varchar(32) not null, -- E.g. '2026-2027'
    start_date date not null,
    end_date date not null,
    is_active boolean not null default true,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

-- -----------------------------------------------------------------------------
-- 5. PAYROLL STRUCTURES, COMPENSATION, RUNS & ITEMIZED PAYSLIPS
-- -----------------------------------------------------------------------------

create table salary_structures (
    id uuid primary key,
    company_id uuid not null references companies(id),
    code varchar(32) not null,
    name varchar(100) not null,
    basic_percentage numeric(5, 2) not null default 40.00,
    hra_percentage numeric(5, 2) not null default 20.00,
    da_percentage numeric(5, 2) not null default 10.00,
    pf_employee_percentage numeric(5, 2) not null default 12.00,
    pf_employer_percentage numeric(5, 2) not null default 12.00,
    esi_percentage numeric(5, 2) not null default 0.75,
    tax_scheme varchar(32) not null default 'STANDARD',
    active boolean not null default true,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    unique (company_id, code)
);

create table employee_salaries (
    id uuid primary key,
    employee_id uuid not null references employees(id),
    salary_structure_id uuid references salary_structures(id),
    annual_ctc numeric(14, 2) not null,
    monthly_gross numeric(12, 2) not null,
    basic_pay numeric(12, 2) not null,
    hra numeric(12, 2) not null default 0.00,
    da numeric(12, 2) not null default 0.00,
    conveyance_allowance numeric(12, 2) not null default 0.00,
    medical_allowance numeric(12, 2) not null default 0.00,
    special_allowance numeric(12, 2) not null default 0.00,
    pf_employee_deduction numeric(12, 2) not null default 0.00,
    pf_employer_contribution numeric(12, 2) not null default 0.00,
    professional_tax numeric(12, 2) not null default 0.00,
    bank_name varchar(120),
    bank_account_number varchar(64),
    bank_ifsc_code varchar(32),
    pan_number varchar(20),
    effective_from date not null,
    effective_to date,
    is_active boolean not null default true,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table payroll_runs (
    id uuid primary key,
    company_id uuid not null references companies(id),
    pay_period_month integer not null, -- 1 to 12
    pay_period_year integer not null,
    period_start_date date not null,
    period_end_date date not null,
    total_employees integer not null default 0,
    total_gross_payout numeric(14, 2) not null default 0.00,
    total_deductions numeric(14, 2) not null default 0.00,
    total_net_payout numeric(14, 2) not null default 0.00,
    status varchar(24) not null default 'DRAFT', -- DRAFT, CALCULATED, APPROVED, DISBURSED
    processed_by uuid references user_accounts(id),
    processed_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    unique (company_id, pay_period_month, pay_period_year)
);

create table payslips (
    id uuid primary key,
    payroll_run_id uuid not null references payroll_runs(id),
    employee_id uuid not null references employees(id),
    pay_month integer not null,
    pay_year integer not null,
    working_days numeric(5, 2) not null default 0.00,
    present_days numeric(5, 2) not null default 0.00,
    paid_leave_days numeric(5, 2) not null default 0.00,
    loss_of_pay_days numeric(5, 2) not null default 0.00,
    basic_earned numeric(12, 2) not null default 0.00,
    hra_earned numeric(12, 2) not null default 0.00,
    da_earned numeric(12, 2) not null default 0.00,
    allowances_total numeric(12, 2) not null default 0.00,
    gross_earnings numeric(12, 2) not null default 0.00,
    pf_deducted numeric(12, 2) not null default 0.00,
    tax_deducted numeric(12, 2) not null default 0.00,
    other_deductions numeric(12, 2) not null default 0.00,
    total_deductions numeric(12, 2) not null default 0.00,
    net_salary numeric(12, 2) not null default 0.00,
    payment_status varchar(24) not null default 'UNPAID', -- UNPAID, PROCESSED, PAID
    payment_transaction_id varchar(100),
    payment_date date,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    unique (payroll_run_id, employee_id)
);

-- -----------------------------------------------------------------------------
-- 6. DESIGNATIONS, EMPLOYEE DOCUMENTS & EMERGENCY CONTACTS
-- -----------------------------------------------------------------------------

create table designations (
    id uuid primary key,
    company_id uuid not null references companies(id),
    code varchar(32) not null,
    title varchar(120) not null,
    grade_level varchar(32),
    min_experience_years integer default 0,
    active boolean not null default true,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    unique (company_id, code)
);

create table employee_documents (
    id uuid primary key,
    employee_id uuid not null references employees(id),
    document_type varchar(40) not null, -- GOVT_ID, RESUME, OFFER_LETTER, EXPERIENCE_LETTER, TAX_PROOF, CERTIFICATE
    title varchar(140) not null,
    file_path varchar(255) not null,
    file_size_bytes bigint not null default 0,
    mime_type varchar(80) not null default 'application/pdf',
    verified boolean not null default false,
    verified_by uuid references user_accounts(id),
    verified_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table emergency_contacts (
    id uuid primary key,
    employee_id uuid not null references employees(id),
    contact_name varchar(120) not null,
    relationship varchar(50) not null, -- SPOUSE, PARENT, SIBLING, GUARDIAN, FRIEND
    primary_phone varchar(32) not null,
    secondary_phone varchar(32),
    address text,
    is_primary boolean not null default true,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

-- -----------------------------------------------------------------------------
-- 7. AUDIT LOGGING, SYSTEM NOTIFICATIONS & ORGANIZATION BRANDING
-- -----------------------------------------------------------------------------

create table audit_logs (
    id uuid primary key,
    account_id uuid references user_accounts(id),
    action varchar(64) not null, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, BIOMETRIC_SYNC, PUNCH_OVERRIDE
    entity_name varchar(80) not null,
    entity_id varchar(80),
    ip_address varchar(64),
    user_agent varchar(255),
    details text, -- JSON or string delta
    timestamp timestamp with time zone not null default now()
);

create table in_app_notifications (
    id uuid primary key,
    account_id uuid not null references user_accounts(id),
    title varchar(140) not null,
    message text not null,
    notification_type varchar(32) not null default 'INFO', -- INFO, WARNING, SUCCESS, ACTION_REQUIRED
    link_url varchar(255),
    is_read boolean not null default false,
    read_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table system_branding_settings (
    id uuid primary key,
    company_id uuid not null unique references companies(id),
    institution_name varchar(160) not null,
    logo_url varchar(255),
    favicon_url varchar(255),
    primary_color varchar(16) not null default '#4f46e5',
    accent_color varchar(16) not null default '#06b6d4',
    support_email varchar(180),
    contact_phone varchar(32),
    address text,
    timezone varchar(64) not null default 'Asia/Kolkata',
    date_format varchar(32) not null default 'YYYY-MM-DD',
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

-- -----------------------------------------------------------------------------
-- INDEXES FOR HIGH-THROUGHPUT RETRIEVAL & FILTERING
-- -----------------------------------------------------------------------------

create index idx_shifts_company on work_shifts(company_id);
create index idx_shift_assignments_emp on employee_shift_assignments(employee_id, effective_from);
create index idx_daily_timesheets_emp_date on daily_timesheets(employee_id, work_date);
create index idx_daily_timesheets_date_status on daily_timesheets(work_date, status);
create index idx_regularization_emp_status on attendance_regularization_requests(employee_id, status);

create index idx_checkpoints_company on biometric_checkpoints(company_id);
create index idx_credentials_emp on employee_biometric_credentials(employee_id, credential_type);
create index idx_sync_events_checkpoint on biometric_sync_events(checkpoint_id, created_at);

create index idx_leave_types_company on leave_types(company_id);
create index idx_leave_balances_emp_year on employee_leave_balances(employee_id, calendar_year);
create index idx_holidays_company_date on holidays(company_id, holiday_date);

create index idx_employee_salaries_emp on employee_salaries(employee_id, is_active);
create index idx_payroll_runs_comp_period on payroll_runs(company_id, pay_period_year, pay_period_month);
create index idx_payslips_payroll_emp on payslips(payroll_run_id, employee_id);
create index idx_payslips_emp_period on payslips(employee_id, pay_year, pay_month);

create index idx_employee_documents_emp on employee_documents(employee_id, document_type);
create index idx_audit_logs_account_time on audit_logs(account_id, timestamp);
create index idx_notifications_account on in_app_notifications(account_id, is_read, created_at);

-- -----------------------------------------------------------------------------
-- SEED FOUNDATIONAL INSTITUTION DATA (DEFAULT SHIFTS, LEAVE TYPES, CHECKPOINT)
-- -----------------------------------------------------------------------------

-- Seed default general work shift for demo company
insert into work_shifts (
    id, company_id, code, name, start_time, end_time, grace_period_minutes,
    half_day_minutes, min_full_day_minutes, break_duration_minutes, is_night_shift,
    is_flexible, active, created_at, updated_at
) values (
    '53000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'GEN_09_18',
    'Standard General Shift (09:00 - 18:00)',
    '09:00:00',
    '18:00:00',
    15,
    240,
    480,
    60,
    false,
    false,
    true,
    now(),
    now()
);

-- Seed institutional leave types
insert into leave_types (
    id, company_id, code, name, description, annual_quota, is_paid, carry_forward_allowed,
    max_carry_forward_days, encashment_allowed, requires_documentation, active, created_at, updated_at
) values
('54000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'CL', 'Casual Leave', 'Short-term casual absence', 12.00, true, false, 0.00, false, false, true, now(), now()),
('54000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'SL', 'Sick Leave', 'Medical & health-related leaves', 10.00, true, true, 5.00, false, true, true, now(), now()),
('54000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'PL', 'Privilege / Earned Leave', 'Annual planned paid vacation leaves', 18.00, true, true, 30.00, true, false, true, now(), now()),
('54000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'LWP', 'Leave Without Pay', 'Unpaid loss of pay leaves', 0.00, false, false, 0.00, false, false, true, now(), now());

-- Seed default biometric kiosk checkpoint
insert into biometric_checkpoints (
    id, company_id, code, name, zone_name, checkpoint_type, ip_address, port,
    serial_number, is_online, last_heartbeat, active, created_at, updated_at
) values (
    '55000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'CHK-MAIN-ENTRANCE',
    'Main Building Entrance Kiosk',
    'Ground Floor Reception',
    'HYBRID_KIOSK',
    '192.168.1.100',
    4370,
    'ZK-FACELOCK-9901',
    true,
    now(),
    true,
    now(),
    now()
);

-- Seed default branding settings
insert into system_branding_settings (
    id, company_id, institution_name, logo_url, favicon_url, primary_color,
    accent_color, support_email, contact_phone, address, timezone, date_format,
    created_at, updated_at
) values (
    '56000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Enterprise Institute HRMS',
    '/logo.svg',
    '/favicon.ico',
    '#4f46e5',
    '#06b6d4',
    'hr@institute.edu',
    '+91-11-23456789',
    'Institutional Campus, New Delhi, India',
    'Asia/Kolkata',
    'YYYY-MM-DD',
    now(),
    now()
);

