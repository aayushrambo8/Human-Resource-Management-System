# Backend Audit — HRMS Spring Boot API (read-only, Phase 1)

Date: 2026-10-28. All findings are source-verified (file paths + class/method cited). Runtime
behavior claims beyond source reading are limited to what the committed integration test asserts.

## Build & framework (backend/pom.xml)

- **Spring Boot 4.1.1** parent (Boot 4 line: `spring-boot-starter-webmvc`, Jackson 3 via
  `tools.jackson.*` imports), **Java 21**, Maven wrapper (`./mvnw`).
- Starters: webmvc, data-jpa, **security**, validation, jackson, flyway
  (`spring-boot-starter-flyway` + `flyway-database-postgresql`), actuator.
- Drivers: PostgreSQL (runtime), H2 (test). Test starters mirror each module (webmvc-test,
  security-test, data-jpa-test, flyway-test, validation-test, actuator-test).
- **No third-party JWT library** — tokens are hand-rolled HS256 in `auth/JwtService.java`
  (HMAC-SHA256 via `javax.crypto.Mac`, constant-time comparison via `MessageDigest.isEqual`).
- `HrmsBackendApplication` excludes `UserDetailsServiceAutoConfiguration` (no generated default
  password).

## Database (Flyway, `backend/src/main/resources/db/migration/`)

- `V1__initial_hrms_schema.sql`: companies, departments, employees, biometric_devices,
  biometric_raw_logs, attendance_records (+ indexes).
- `V2__seed_local_development_data.sql`: company `INST`, department `ADMIN`, employee `EMP001`
  (demo.employee@institution.local), device `BIO-001`.
- `V3__authentication_and_leave.sql`: permissions, roles, role_permissions, user_accounts,
  account_roles, refresh_tokens, auth_bootstrap_lock, leave_requests (+ 12 permissions, roles
  ADMIN/HR/EMPLOYEE with mappings — see below).
- `V4__rotate_seed_biometric_device_token.sql`: replaces the seeded device token hash with the
  `${demo_device_token_hash}` placeholder value.
- Config (`application.yml`): `ddl-auto: validate`, `open-in-view: false`, Flyway enabled with
  placeholder `demo_device_token_hash`. Postgres 18 in `docker-compose.yml`; H2 in PostgreSQL mode
  for tests (`src/test/resources/application-test.yml`).

## Configuration variables (names only — no secrets)

| Variable | Purpose | Default |
|---|---|---|
| `HRMS_DB_URL` / `HRMS_DB_USERNAME` / `HRMS_DB_PASSWORD` | datasource | localhost:5432/hrms, hrms, (required) |
| `HRMS_SERVER_PORT` | HTTP port | 8080 |
| `HRMS_CORS_ALLOWED_ORIGINS` | comma-separated allowlist | `http://localhost:5173` (stale Vite port) |
| `HRMS_JWT_SECRET` | HS256 key, **≥32 bytes enforced at startup** | (required) |
| `HRMS_BOOTSTRAP_TOKEN` | one-time admin bootstrap header secret, ≥32 bytes enforced | (required) |
| `HRMS_ACCESS_TOKEN_SECONDS` | access-token TTL | 900 (minimum 60 enforced) |
| `HRMS_DEMO_DEVICE_TOKEN_HASH` | Flyway placeholder for seeded device token | (required) |
| `hrms.biometric.token-header` | device auth header name | `X-Device-Token` |
| Actuator exposure | `health,info` | — |

## Security (`config/SecurityConfig.java`)

- Stateless sessions, **CSRF disabled**, `BCryptPasswordEncoder`, `@EnableMethodSecurity`.
- CORS: allowlist origins from config; methods GET/POST/PUT/PATCH/DELETE/OPTIONS; headers
  `Authorization, Content-Type, X-Device-Token, X-Bootstrap-Token`; maxAge 3600; no credentials.
- Filter chain: `GET /api/health` + `GET /actuator/health` public;
  `/api/auth/bootstrap|login|refresh` public; `POST /api/biometric/attendance` public
  (device-token checked in controller); **all other `/api/**` authenticated**; everything else
  **denied** (⇒ `/actuator/info` is denied).
- `auth/JwtAuthenticationFilter` (OncePerRequest servlet filter, added before
  `UsernamePasswordAuthenticationFilter`; also registered via `FilterRegistrationBean` with
  `setEnabled(false)` to prevent double execution): parses `Authorization: Bearer`, verifies via
  `JwtService.verify`, builds authorities from JWT claims — `ROLE_<code>` per role plus raw
  permission codes (`employee:read`, …).
- 401 responses: `authenticationEntryPoint` → `response.sendError(401)`; 403 from
  `AccessDeniedException` via method security.
- **The task brief states authentication "is not implemented"; this is contradicted by the source.**
  A complete custom authentication + authorization stack exists and is exercised by
  `src/test/java/com/aayush/hrms/HrmsBackendApplicationTests.java`. See
  `authentication-decisions.md`.

## Auth domain (`auth/`)

- `AuthService`: `bootstrap` (one-time per DB via `auth_bootstrap_lock` row + pessimistic write
  lock; requires `X-Bootstrap-Token`, constant-time match in `BootstrapTokenService`; creates ADMIN
  account; 409 if an account already exists), `login` (email lowercased + BCrypt match + `enabled`
  check → 401 on failure), `refresh` (SHA-256 hash lookup, expiry + revoked check, **revokes old
  token and issues a new one — rotating, single-use**, 7-day expiry), `logout` (revoke),
  `createAccount` (requires `account:write`; validates role codes → 400, optional `employeeCode`
  link → 400 if unknown; 409 duplicate email).
- `JwtService`: claims `sub`=email, `iat`, `exp`, `roles[]`, `permissions[]`; signature HS256;
  rejects `alg` ≠ HS256, expired, or malformed claims (constant-time signature compare).
- Entities: `UserAccount` (email unique, passwordHash, enabled, optional 1:1 `Employee`,
  M:N roles), `Role`, `Permission`, `RefreshToken` (unique hash, expiresAt, revokedAt),
  `BootstrapLock`.
- Seeded permissions (12): `employee:read|write`, `department:read|write`, `company:read|write`,
  `attendance:read`, `biometric:read`, `leave:read|write|review`, `account:write`.
- Seeded roles: **ADMIN** = all; **HR** = all except `company:write`, `account:write`;
  **EMPLOYEE** = `leave:write` only.

## Controllers — behavior notes

Every handler applies Jakarta Bean Validation via `@Valid` on request records; violations produce
the Boot-default 400 response (exact body shape **not source-verifiable** — see contract doc).

- `employee/EmployeeController` (`/api/employees`): list (unpaginated `findAll`), get by UUID
  (404 via `EntityNotFoundException` → ProblemDetail), create (201, trims strings, resolves
  department → 404), update (full-replace PUT; `@NotNull status`). Unique violations
  (employeeCode/email) surface as 409 via `DataIntegrityViolationException` handler. **No DELETE,
  no search/filter, no pagination.**
- `company/CompanyController` (`/api/companies`): list/create(201)/update. No GET by id.
- `company/DepartmentController` (`/api/departments`): list/create(201)/update; company FK resolved
  (404 if unknown). No GET by id.
- `attendance/AttendanceController` (`/api/attendance`): GET only, `page` (≥0) & `size`
  (clamped 1–100, default 20), ordered `punchTime` DESC via repository; returns custom
  `PageResponse`. **Read-only; no date filters, no per-employee filter, no write endpoint.**
- `biometric/BiometricLogController` (`/api/biometric/logs`): GET only, same paging; raw device log
  audit trail including `UNKNOWN_EMPLOYEE` punches.
- `biometric/BiometricAttendanceController` (`POST /api/biometric/attendance`): 202 on success;
  device looked up by `deviceCode` and must be active, `X-Device-Token` matched against the stored
  SHA-256 hash (`DeviceTokenService`) → 401 otherwise; `BiometricAttendanceService.acceptPunch`
  always stores a raw log (`ACCEPTED`/`UNKNOWN_EMPLOYEE`), creates an `AttendanceRecord` only for
  known employees; returns `{logId, attendanceRecordId, status}`. **No endpoint exists to register
  or manage devices** (device rows are DB-only).
- `leave/LeaveController` (`/api/leaves`): submit (201; 400 if end < start; 409 if the account is
  not linked to an employee), list (scope: all rows if caller holds `leave:read`, else only own
  employee's rows; unpaginated), `PATCH /{id}/decision` (400 if status PENDING, 404 unknown, 409 if
  already reviewed; records reviewer + `reviewedAt`). **No cancel/withdraw, no leave types,
  balances or quotas.**
- `auth/AuthController` (`/api/auth/*`, `/api/accounts`): see Auth domain; `logout` is **not**
  in the permitAll list, so it requires a valid JWT.
- `health/HealthController` (`GET /api/health`): `{status:"ok", product:"custom-hrms", timestamp}`.

## Error handling (`common/ApiExceptionHandler.java`)

- `EntityNotFoundException` → **404** RFC-9457 `ProblemDetail` (`detail` = message).
- `DataIntegrityViolationException` → **409** ProblemDetail ("A record with these values already
  exists").
- `ResponseStatusException` (used across auth/leave/biometric) and Bean Validation failures rely on
  the **Spring default** handling (Boot 4 produces ProblemDetail-family bodies; the exact field
  payload of validation errors was not runtime-verified this phase and is marked UNKNOWN).

## Pagination & DTO/entity mapping

- Custom `common/PageResponse<T>(content, page, size, totalElements, totalPages)` — **not** Spring's
  `Page` JSON; 0-based page index. Used by attendance and biometric logs only.
- All API shapes are hand-written summary/request records (`EmployeeSummary`, `LeaveSummary`,
  `AttendanceSummary`, `BiometricLogSummary`, `CompanySummary`, `DepartmentSummary`, …); entities
  are never serialized directly. UUID ids and `Instant`/`LocalDate` fields map to ISO-8601 JSON
  strings; enums serialize as names.
- No filtering/sorting parameters exist anywhere in the API.

## Tests

- Single end-to-end MockMvc test (`HrmsBackendApplicationTests#authenticationAndBiometricFlow`,
  H2 + `test` profile): health, CORS preflight from `localhost:5173`, 401 without token, bootstrap
  (401 without header, success, 409 on reuse), authenticated employee list, biometric punch
  (accepted/unknown-employee), log listing, refresh rotation + reuse → 401, employee create,
  department create, account create, EMPLOYEE 403 on `/api/employees`, leave submit/list/approve.
- **No unit tests, no repository tests, no security-config tests beyond the above.**

## Deployment

- `backend/Dockerfile`: multi-stage Maven 3.9 / Temurin 21 build → JRE 21 image, non-root user,
  exposes 8080.
- `docker-compose.yml`: postgres 18 (no published host port), daily backup service, backend
  (required secrets via env), **frontend image built from the now-stale Vite Dockerfile**
  (see frontend audit) published on `HRMS_HTTP_PORT` (default 8080).
