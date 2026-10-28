# HRMS Module Capability Matrix (Phase 1, source-verified)

Classification legend:
- **VERIFIED**: required operations exist with identifiable request/response contracts.
- **PARTIAL**: some operations exist; others the UI needs are missing or incomplete.
- **MISSING**: no corresponding backend implementation found.
- **UNKNOWN**: evidence insufficient.

Entities existing in the database are explicitly **not** treated as proof of a working capability.

## 1. Dashboard & workforce analytics — PARTIAL (client-side only)

| Needed | Backend support |
|---|---|
| Headcount / active count | Derivable from `GET /api/employees` (full list, status field) |
| Department count | Derivable from `GET /api/departments` |
| Recent activity feed | `GET /api/attendance` (paged, punchTime DESC) |
| Punch totals | `totalElements` on `GET /api/attendance` |
| Leave KPIs, trends, charts, date-range analytics | **MISSING** — no aggregation/statistics endpoint of any kind |

No `/api/dashboard` or statistics route exists. The current dashboard computes everything in the
browser from raw lists — acceptable for small datasets, will not scale.

## 2. Employee directory — PARTIAL

- VERIFIED: `GET /api/employees` (unpaginated full list), `GET /api/employees/{id}`.
- MISSING: pagination, search, filtering (department/status), sorting. For an institution with
  thousands of employees the unpaginated list is a scaling risk.

## 3. Employee details & management — PARTIAL

- VERIFIED backend: create (`POST`, 201), update (`PUT` full replace), 404/409 handling,
  validation (codes/names required, email format, status enum, department FK resolution).
- MISSING backend: DELETE/soft-delete, PATCH partial updates, per-employee related data
  (attendance history by employee, leave history by employee — leave list is scope-filtered but
  not queryable per employee id).
- MISSING frontend: the `/employees/new` form is linked but the route **does not exist**; no edit
  UI; detail page is read-only.

## 4. Attendance — PARTIAL

- VERIFIED: read-only paged list of punches (`GET /api/attendance`); write path exists only via
  device ingestion (`POST /api/biometric/attendance`) with raw-log audit trail and employee
  resolution.
- MISSING: date-range filter, employee filter, manual entry/correction endpoints, processed
  attendance-day model (explicitly listed as follow-on work in `docs/backend-plan.md`), summary
  endpoints (hours worked, present/absent counts).
- UNKNOWN: shift/business rules for day processing (documented as not yet defined).

## 5. Leave management — PARTIAL

- VERIFIED: submit (employee-scoped via linked account), list (own, or all with `leave:read`),
  review approve/reject with reviewer + timestamp, guards (400/404/409).
- MISSING: cancel/withdraw, leave types, quotas/balances/accrual, pagination/filtering, holidays,
  notifications, frontend submit/review UIs (routes `/leave/new`, `/leave/[id]` do not exist).
- UNKNOWN: business policy on overlapping requests (no overlap check in `LeaveService.submit`;
  only end ≥ start is enforced).

## 6. Recruitment — MISSING

No job posting, candidate, application, or interview entities, tables, or endpoints exist anywhere
in the backend. Nothing to integrate against.

## 7. Onboarding — MISSING

No onboarding/task/checklist entities or endpoints. The only adjacent concept is linking a user
account to an existing employee via `POST /api/accounts` (`employeeCode`).

## 8. Payroll — MISSING

No salary, compensation, contract, deduction, or payslip tables/endpoints. The V1 schema contains
no monetary columns; no currency handling exists in DTOs or configuration. Payroll is a
green-field backend domain.

## 9. Reports — MISSING

No report, export, or download endpoints (no CSV/PDF generation, no file download handling
anywhere in the backend). Reporting today would have to be built client-side from list endpoints.

## 10. Settings & user management — PARTIAL

- VERIFIED backend: one-time admin bootstrap; account creation with roles (`POST /api/accounts`,
  `account:write`); login/refresh/logout; role→permission model seeded in Flyway V3.
- MISSING backend: list/disable accounts, change password, reset password, manage roles or
  permissions, "me"/profile endpoint, audit log API.
- MISSING frontend: the Settings page shows only health/static info; there is no user
  administration UI.

## Cross-cutting summary

| Capability | Status |
|---|---|
| Authentication & role-based authorization (backend) | VERIFIED (see authentication-decisions.md) |
| Company management API | VERIFIED (list/create/update; no GET by id; unused by UI) |
| Department management API | VERIFIED (list/create/update; UI is read-only) |
| Biometric device management | MISSING via API (device rows are DB-seed only) |
| Dashboard aggregation API | MISSING (client-side derivation only) |
| File upload/download | MISSING |
