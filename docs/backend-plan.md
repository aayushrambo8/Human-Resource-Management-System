# Backend Plan

This backend uses Horilla as the functional reference, but not as implementation code.

## Stack

- Spring Boot
- Java 21
- PostgreSQL
- Flyway migrations
- Spring Data JPA
- Spring Security

## Implemented Backend Slice

- Company and department APIs
- Employee CRUD and validation
- BCrypt password storage, one-time administrator bootstrap, JWT access tokens,
  hashed rotating refresh tokens, and permission-based endpoint access
- Seeded `ADMIN`, `HR`, and `EMPLOYEE` roles and permissions
- Leave request submission and HR review
- Paginated attendance and biometric raw-log APIs
- Biometric device registration model and token-validated punch ingestion

The JWT signing secret and initial-account bootstrap token are mandatory
environment values. Bootstrap also requires the secret header and is limited to
the first account in the database. PostgreSQL's Compose port is bound to localhost;
the backend can still be run on a LAN host while its database remains local.
The self-hosted Compose setup rotates the seeded biometric device token using a
generated per-install token hash and displays the raw token once for device setup.

## Biometric Punch Contract

Endpoint:

```http
POST /api/biometric/attendance
X-Device-Token: change-me-device-token
Content-Type: application/json
```

Payload:

```json
{
  "deviceCode": "BIO-001",
  "employeeCode": "EMP001",
  "punchTime": "2026-10-08T09:15:00Z",
  "direction": "IN",
  "rawPayload": "optional original device payload"
}
```

Raw logs are stored before attendance records are generated. Known employee punches
also create attendance records; unknown employee punches remain in the raw-log audit
trail. This keeps ingestion auditable and lets attendance processing rules evolve.

## Follow-on Work

- Define attendance-day processing rules (shift assignment, duplicate punches,
  overnight shifts, holidays, and corrections).
- Add account-administration policies, including account disablement and revoking
  all sessions on password/role changes.
- Add deployment operations: TLS termination on the LAN edge, backups and restore
  drills, secret rotation, and login throttling/monitoring.
- Add integration tests covering CRUD permissions, refresh-token rotation, leave
  review, and unknown biometric employees.
