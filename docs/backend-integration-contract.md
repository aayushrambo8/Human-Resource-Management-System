# Backend Integration Contract (verified from source — Phase 1)

Every row below was read from controller source. "Verified" = path/method/DTO confirmed in code;
"Test-verified" = additionally asserted by `HrmsBackendApplicationTests`. Nothing here is inferred
from entities alone. Anything not determinable is explicitly marked UNKNOWN.

## Global conventions

- Base URL: `http://localhost:8080` (dev default; `HRMS_SERVER_PORT`). All routes under `/api/`.
- Authentication: `Authorization: Bearer <accessToken>` (HS256 JWT; claims `sub`=email, `roles[]`,
  `permissions[]`). Device ingestion uses `X-Device-Token` instead. Bootstrap adds `X-Bootstrap-Token`.
- Content type: `application/json` everywhere.
- IDs: UUID v4 strings. Timestamps: `Instant` → ISO-8601 UTC (e.g. `2026-10-08T09:15:00Z`).
  Dates: `LocalDate` → `yyyy-MM-dd`. Enums: string names.
- Pagination (2 endpoints only): request `?page=0&size=20` (page ≥ 0, size clamped 1–100);
  response `{ "content": [...], "page": 0, "size": 20, "totalElements": 0, "totalPages": 0 }`
  (`common/PageResponse`). 0-based.
- Errors: **superseded by the runtime-verified matrix in "Runtime error behavior" below**
  (Finding A — most non-advice error classes are masked to a bare 401). 404/409 from
  `ApiExceptionHandler` are RFC-9457 `ProblemDetail` (`type/title/status/detail/instance`) —
  verified at runtime 2026-10-29. Bean-validation failures and `ResponseStatusException`
  reasons do **not** reach the client (masked to 401) — previously marked UNKNOWN, now verified.
- CORS: allowlisted origins (`HRMS_CORS_ALLOWED_ORIGINS`), no credentials; allowed headers
  `Authorization, Content-Type, X-Device-Token, X-Bootstrap-Token`.

## Endpoint inventory

| # | Method | Path | Controller#method | Request DTO | Response DTO | Validation | AuthN | AuthZ | Related frontend module | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/health` | `HealthController#health` | — | `{status, product, timestamp}` (Map) | — | Public | None | Settings, dashboard banner | VERIFIED (test-verified) |
| 2 | GET | `/actuator/health` | Actuator | — | health JSON | — | Public | None | none | VERIFIED |
| 3 | POST | `/api/auth/bootstrap` | `AuthController#bootstrap` | `AuthRequest{email @Email @NotBlank ≤180, password @NotBlank 12–72 (≤72 UTF-8 bytes)}` | `TokenResponse` | `@Valid`; 401 bad/missing `X-Bootstrap-Token`; 409 if an account already exists | Public + bootstrap secret header | One-time bootstrap | none (CLI/setup script) | VERIFIED (test-verified) |
| 4 | POST | `/api/auth/login` | `AuthController#login` | `AuthRequest` | `TokenResponse{accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, email, roles[]}` | `@Valid`; 401 invalid credentials | Public | None | Login page | VERIFIED (test-verified) |
| 5 | POST | `/api/auth/refresh` | `AuthController#refresh` | `RefreshRequest{refreshToken @NotBlank}` | `TokenResponse` | 401 unknown/revoked/expired token | Public | None | axios 401 interceptor | VERIFIED (test-verified; rotation + reuse→401) |
| 6 | POST | `/api/auth/logout` | `AuthController#logout` | `RefreshRequest` | 204 no body | 401 if refresh token invalid | **Bearer required** (not in permitAll) | None beyond authN | Auth provider logout | VERIFIED |
| 7 | POST | `/api/accounts` | `AuthController#createAccount` | `CreateAccountRequest{email @Email, password 12–72, roles @NotEmpty set, employeeCode? ≤40}` | 201, empty body | 400 unknown role/employee code; 409 duplicate email | Bearer | `account:write` (ADMIN only) | none | VERIFIED (test-verified) |
| 8 | GET | `/api/employees` | `EmployeeController#listEmployees` | — | `EmployeeSummary[]` (unpaginated) | — | Bearer | `employee:read` | Employees page, dashboard | VERIFIED (test-verified) |
| 9 | GET | `/api/employees/{id}` | `EmployeeController#getEmployee` | path UUID | `EmployeeSummary` | 404 unknown id | Bearer | `employee:read` | Employee detail | VERIFIED |
| 10 | POST | `/api/employees` | `EmployeeController#createEmployee` | `EmployeeRequest{employeeCode @NotBlank ≤40, firstName/lastName @NotBlank ≤80, email @Email ≤180?, phone ≤32?, departmentId UUID?, joiningDate date?, status @NotNull}` | 201 `EmployeeSummary` | 400 validation; 404 unknown department; 409 duplicate code/email | Bearer | `employee:write` | none (no form exists yet) | VERIFIED (test-verified) |
| 11 | PUT | `/api/employees/{id}` | `EmployeeController#updateEmployee` | same as #10 (full replace) | `EmployeeSummary` | same as #10 | Bearer | `employee:write` | none | VERIFIED |
| 12 | GET | `/api/companies` | `CompanyController#list` | — | `CompanySummary{id, code, name, active}[]` | — | Bearer | `company:read` | none | VERIFIED |
| 13 | POST | `/api/companies` | `CompanyController#create` | `CompanyRequest{code @NotBlank ≤32, name @NotBlank ≤160, active?}` | 201 `CompanySummary` | 409 duplicate code | Bearer | `company:write` (ADMIN only) | none | VERIFIED |
| 14 | PUT | `/api/companies/{id}` | `CompanyController#update` | same as #13 (`active` null = preserve) | `CompanySummary` | 404 unknown id | Bearer | `company:write` | none | VERIFIED |
| 15 | GET | `/api/departments` | `DepartmentController#list` | — | `DepartmentSummary{id, companyId, companyCode, code, name}[]` | — | Bearer | `department:read` | Departments page, dashboard | VERIFIED (test-verified create) |
| 16 | POST | `/api/departments` | `DepartmentController#create` | `DepartmentRequest{companyId @NotNull, code @NotBlank ≤32, name @NotBlank ≤120}` | 201 `DepartmentSummary` | 404 unknown company; 409 duplicate (companyId, code) | Bearer | `department:write` | none | VERIFIED (test-verified) |
| 17 | PUT | `/api/departments/{id}` | `DepartmentController#update` | same as #16 | `DepartmentSummary` | 404 unknown id/company | Bearer | `department:write` | none | VERIFIED |
| 18 | GET | `/api/attendance` | `AttendanceController#list` | `?page, ?size` | `PageResponse<AttendanceSummary{id, employeeId, employeeCode, employeeName, deviceCode, punchTime, direction}>` | size clamp 1–100; page ≥ 0 | Bearer | `attendance:read` | Attendance page, dashboard | VERIFIED (test-verified) |
| 19 | GET | `/api/biometric/logs` | `BiometricLogController#list` | `?page, ?size` | `PageResponse<BiometricLogSummary{id, deviceCode, employeeCode, punchTime, direction, status, rawPayload}>` | same as #18 | Bearer | `biometric:read` | Biometric page | VERIFIED (test-verified) |
| 20 | POST | `/api/biometric/attendance` | `BiometricAttendanceController#acceptPunch` | `BiometricPunchRequest{deviceCode @NotBlank, employeeCode @NotBlank, punchTime @NotNull Instant, direction? IN/OUT/UNKNOWN, rawPayload?}` | 202 `{logId, attendanceRecordId (null if unknown employee), status: ACCEPTED/UNKNOWN_EMPLOYEE}` | 401 unknown/inactive device or bad device token | Public + per-device `X-Device-Token` (SHA-256 hash stored) | Device token only | none (device-facing) | VERIFIED (test-verified) |
| 21 | POST | `/api/leaves` | `LeaveController#submit` | `LeaveSubmission{startDate @NotNull, endDate @NotNull, reason @NotBlank ≤1000}` | 201 `LeaveSummary{id, employeeId, employeeCode, startDate, endDate, reason, status, reviewedAt}` | 400 end < start; 409 account not linked to employee | Bearer | `leave:write` | none (submit page missing) | VERIFIED (test-verified) |
| 22 | GET | `/api/leaves` | `LeaveController#list` | — | `LeaveSummary[]` (unpaginated; all if caller has `leave:read`, otherwise own only) | — | Bearer | `leave:read` **or** `leave:write` | Leave page | VERIFIED (test-verified) |
| 23 | PATCH | `/api/leaves/{id}/decision` | `LeaveController#review` | `LeaveDecision{status @NotNull LeaveStatus}` (PENDING rejected → 400) | `LeaveSummary` | 404 unknown id; 409 already reviewed | Bearer | `leave:review` (ADMIN, HR) | none (no review UI) | VERIFIED (test-verified) |

Not present anywhere in the source (confirmed absent, do not assume): DELETE endpoints of any kind,
employee/leave/attendance search or filtering, dashboard/aggregation endpoints, file upload or
download endpoints, pagination for employees/companies/departments/leaves, device management API,
password change, account listing, role management API, self-profile endpoint.

## Enumerations (exact values)

- `EmploymentStatus`: ACTIVE, INACTIVE, RESIGNED, TERMINATED
- `LeaveStatus`: PENDING, APPROVED, REJECTED
- `AttendanceDirection`: IN, OUT, UNKNOWN
- `BiometricLogStatus`: ACCEPTED, UNKNOWN_EMPLOYEE, REJECTED

## Frontend usage vs contract (verified gaps — updated 2026-10-29)

- Frontend calls: #1, #3, #4, #5, #6, #7, #8, #9, #10, #11, #15, #16, #17, #18, #19, #21, #22, #23.
  (All write paths verified live in Phase D — see testing-report.) Still unused: #2, #12, #13, #14,
  #20 (device-facing), and every endpoint listed as absent above.
- ~~`TokenResponse.roles` never used for gating~~ → **resolved**: `src/lib/permissions.ts` maps
  roles to the exact 12 permissions from `V3__authentication_and_leave.sql` and gates nav, pages,
  and action buttons (verified live for ADMIN/HR/EMPLOYEE).
- ~~Two competing URL conventions~~ → **resolved**: single same-origin convention; axios base
  `/api/backend` proxied by the Next.js server (`next.config.ts` rewrites; runtime target env
  `API_PROXY_TARGET`). Backend CORS now only matters for direct cross-origin setups
  (`NEXT_PUBLIC_API_URL`), which is documented in `frontend/.env.example`.
- Dashboard KPIs are derived client-side from #8, #15 and #18 (`totalElements`);
  **no aggregation endpoint exists** and any dashboard requirement beyond these raw lists needs
  new backend work. (Unchanged — documented gap, no numbers are invented.)

## Runtime error behavior (verified 2026-10-29 — Finding A: masked 401s)

**Finding A.** Any exception that reaches the servlet container's error dispatch is turned into a
**bare `401` with an empty body**, discarding the original status and message. Mechanism (proven
with Spring Security TRACE on a throwaway instance): unhandled exception → container forwards to
`GET /error` → `JwtAuthenticationFilter` is a `OncePerRequestFilter` and **skips ERROR dispatches**
→ request runs anonymous → `AuthorizationFilter` denies `/error` → entry point
`sendError(401)` overwrites the response. `ApiExceptionHandler` (@RestControllerAdvice) handles
only `EntityNotFoundException` and `DataIntegrityViolationException`, which are resolved inside the
DispatcherServlet and therefore pass through untouched.

Verified matrix (runtime, 2026-10-29; bodies read via `HttpClient`):

| Error class | Example | Intended | Client actually receives | Verdict |
|---|---|---|---|---|
| `EntityNotFoundException` (advice) | GET unknown employee id | 404 ProblemDetail | **404 + full ProblemDetail** (`detail: "Employee not found"`) | ✅ passes |
| `DataIntegrityViolationException` (advice) | duplicate department code | 409 ProblemDetail | **409 + full ProblemDetail** (`detail: "A record with these values already exists"`) | ✅ passes |
| Entry-point 401 (missing/expired token) | GET `/api/employees` w/o token | 401 empty | 401 empty | ✅ as designed |
| `ResponseStatusException` from services | leave end<start (400), account-not-linked (409) | 400/409 + reason | **401, empty body** | ❌ masked |
| Bean-validation `@Valid` failure | empty department code | 400 field errors | **401, empty body** | ❌ masked |
| Method-security denial (`@PreAuthorize`) | EMPLOYEE → PATCH decision / POST accounts | 403 | **401, empty body** | ❌ masked |
| Unexpected persistence/DB failure | H2 table missing (Finding B) | 500 | **401, empty body** | ❌ masked |

**Frontend impact:** genuine session expiry, permission denial, validation failure, conflict, and
infrastructure failure are indistinguishable on the wire (all `401`, empty body). The axios
interceptor therefore shows "Your session has expired" for masked errors too — a misleading message
that **cannot be fixed client-side**. Validation errors (400 field messages) never reach the client,
so forms cannot display server-side field feedback; the frontend does client-side validation
instead and surfaces a generic failure for masked-401 writes. Backend fix (owner's repo): register
`@ExceptionHandler` for `ResponseStatusException` + `MethodArgumentNotValidException` +
`AuthorizationDeniedException` in `ApiExceptionHandler`, or add a security handler for
`/error` dispatches. Documented as a gap — **no backend file was modified.**

**Finding B (operational, run-recipe only).** The H2 URL in the documented run recipe lacked
`DB_CLOSE_DELAY=-1`; after a machine sleep Hikari closed its last connection, H2 destroyed the
in-memory database, and every subsequent DB call failed (`Table "auth_bootstrap_lock" not found
(this database is empty)`) — masked to 401 by Finding A, which made the outage look like a mass
auth failure. Recovery: restart with `DB_CLOSE_DELAY=-1` appended to `HRMS_DB_URL` (environment
only; Flyway re-runs and all accounts must be re-created — V2 seeds no `user_accounts`).
The `DB_CLOSE_DELAY=-1` value is now part of the recipe in `docs/testing-report.md` §Phase D.
