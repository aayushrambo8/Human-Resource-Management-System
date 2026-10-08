# HRMS Backend

Spring Boot backend for the custom institution HRMS.

## Run Locally

Copy `.env.example` to `.env`, replace the secret placeholders with two different
random values, and load the values into the shell used to run the backend. Generate
the secrets with:

```bash
cp .env.example .env
openssl rand -base64 48
openssl rand -base64 48
# Use the first value for HRMS_JWT_SECRET and the second for HRMS_BOOTSTRAP_TOKEN.
set -a && . ./.env && set +a
```

Both secrets are required at startup and must be kept private. Do not use placeholder
or local-development database passwords in a real deployment.

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Run the backend:

```bash
cd backend
./mvnw spring-boot:run
```

Health check:

```http
GET http://localhost:8080/api/health
```

## Authentication and Roles

The first account is created once per database through the bootstrap endpoint. Use a
long unique password; this account receives the `ADMIN` role. Bootstrap is disabled
automatically after the first account exists.

```bash
curl -X POST http://localhost:8080/api/auth/bootstrap \
  -H "X-Bootstrap-Token: $HRMS_BOOTSTRAP_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@institution.local","password":"replace-with-a-long-password"}'
```

The bootstrap endpoint requires the separate secret header shown above as well as
being one-time per database. Keep it off public networks and discard/rotate it after
initial setup. The response contains a short-lived JWT access token and a rotating
refresh token. Send the access token in the HTTP `Authorization` header with the
Bearer scheme. Login uses the same email/password JSON shape at
`POST /api/auth/login`; rotate the refresh token with `POST /api/auth/refresh` and
revoke it with `POST /api/auth/logout`.

`POST /api/accounts` creates an account and requires `account:write`. Supply role
codes `ADMIN`, `HR`, or `EMPLOYEE` and optionally link an `employeeCode`. Passwords
are BCrypt-hashed. HR has employee/company/department, attendance, biometric-log,
and leave-management permissions; employee accounts can submit and view their own
leave requests. ADMIN receives all seeded permissions.

Except for health, authentication bootstrap/login/refresh, and the device-token
protected biometric punch endpoint, `/api/**` requires a valid JWT. Controllers
also enforce the corresponding permission authorities.

## HRMS API

- `GET/POST /api/employees`; `GET/PUT /api/employees/{id}`
- `GET/POST /api/companies`; `PUT /api/companies/{id}`
- `GET/POST /api/departments`; `PUT /api/departments/{id}`
- `GET /api/attendance?page=0&size=20` (maximum page size 100)
- `GET /api/biometric/logs?page=0&size=20` (maximum page size 100)
- `POST /api/leaves`, `GET /api/leaves`, and `PATCH /api/leaves/{id}/decision`

Create/update endpoints validate input and report missing records as 404 and
conflicting unique values as 409. Leave submission requires an account linked to an
employee; HR can review pending requests.

## Biometric Test Punch

The development seed creates one device and one employee:

- Device: `BIO-001`
- Employee: `EMP001`
- Device token: `change-me-device-token`

```bash
curl -X POST http://localhost:8080/api/biometric/attendance \
  -H 'Content-Type: application/json' \
  -H 'X-Device-Token: change-me-device-token' \
  -d '{
    "deviceCode": "BIO-001",
    "employeeCode": "EMP001",
    "punchTime": "2026-10-08T09:15:00Z",
    "direction": "IN",
    "rawPayload": "manual test"
  }'
```

## Notes

Flyway applies schema changes on startup; never edit an already-applied migration.
PostgreSQL is the production database and H2 is used for automated tests. The
application has no runtime internet dependency. Biometric punches are validated
against the active device token, recorded as raw logs, and linked to attendance
records only when the employee code is known. Unknown employee punches remain in
the raw-log audit trail. Device tokens are stored as hashes.
