# Authentication & Authorization — Findings and Decisions Required

## Premise correction (important)

The Phase 1 brief states that "authentication is not implemented yet" and instructs us not to
assume JWT/sessions/roles exist. Source inspection **contradicts this premise**: both repositories
contain a complete, committed authentication stack that is covered by an integration test. This
document reports the verified reality; stakeholders must reconcile the brief with the codebase
before Phase 2 planning.

### Verified backend findings (file references in `backend/src/main/java/com/aayush/hrms/`)

- Spring Security **is installed** (`pom.xml` → `spring-boot-starter-security`).
- A security filter chain **exists**: `config/SecurityConfig.java` — stateless sessions, CSRF
  disabled, CORS allowlist, `BCryptPasswordEncoder`, `@EnableMethodSecurity`.
- Requests are **not** public by default: only `GET /api/health`, `GET /actuator/health`,
  `POST /api/auth/bootstrap|login|refresh`, and device-token-protected
  `POST /api/biometric/attendance` are permitted; **all other `/api/**` requires a valid JWT**;
  everything else is denied.
- Authentication code exists and is substantial: `auth/JwtService` (hand-rolled HS256, no external
  JWT library), `auth/JwtAuthenticationFilter`, `auth/AuthService` (BCrypt login, one-time
  bootstrap guarded by `X-Bootstrap-Token` + DB lock row, rotating single-use refresh tokens
  stored as SHA-256 hashes with 7-day expiry), `auth/UserAccount`, `auth/Role`,
  `auth/Permission`, `auth/RefreshToken`.
- Authorization: per-endpoint `@PreAuthorize("hasAuthority('…')")` on every business controller
  method; 12 permissions and 3 seeded roles (ADMIN = all; HR = all but `company:write` /
  `account:write`; EMPLOYEE = `leave:write`) in Flyway `V3`.
- CORS and CSRF settings already exist (CORS allowlist from `HRMS_CORS_ALLOWED_ORIGINS`,
  default `http://localhost:5173`; CSRF disabled — appropriate for stateless Bearer-token auth).
- `HrmsBackendApplicationTests` verifies 401/403 behavior end to end.
- Documentation already describes the flow: `backend/README.md`, `docs/backend-plan.md`.

### Verified frontend findings

- `src/app/(auth)/login/page.tsx` (login form), `src/lib/auth-provider.tsx` (context, session
  expiry handling), `src/lib/api-client.ts` (Bearer injection + refresh rotation),
  `src/middleware.ts` (route protection).
- **Defect**: `middleware.ts` detects sessions from **cookies** (`hrms.accessToken`,
  `hrms.refreshToken`), but `api-client.ts` stores tokens **only in sessionStorage** and never sets
  cookies. The middleware can therefore never see a session, so it will redirect every
  post-login page load back to `/login`. This must be fixed before any authenticated UI work.

## Authentication vs authorization (definitions used here)

- **Authentication** = proving who the caller is (email + password → JWT access token + refresh
  token). Implemented and VERIFIED in the backend.
- **Authorization** = what the authenticated caller may do (permissions such as `employee:write`).
  Implemented and VERIFIED in the backend (JWT claims → Spring authorities → `@PreAuthorize`).
  The frontend performs **no** authorization-aware UI gating today (roles are stored in the token
  response but unused).

## Decisions recorded (2026-10-28, owner-confirmed)

1. **Token storage / route protection**: sessionStorage + client-side gating. `middleware.ts`
   no longer performs cookie-based redirects (redirect-loop blocker resolved); the `(dashboard)`
   layout will gate client-side; the Spring Boot API remains the sole enforcement point.
2. **API proxy convention**: same-origin proxy. axios defaults to `/api/backend`, forwarded by the
   existing `next.config.ts` rewrite to the backend `/api/:path*`. No backend CORS change needed.
3. **Date/timezone policy**: display timestamps in browser-local time; parse `yyyy-MM-dd`
   date-only strings as calendar dates without timezone shifting. Original instants preserved.
4. **Design basis**: `design-reference/hrms-dashboard.png` was never supplied (verified by
   exhaustive search). Per AGENTS.md §5 the written design specification (blue sidebar, KPI cards,
   analytics charts, employee table, restrained blue branding) is adopted as the design source
   of truth until the screenshot is provided.

## Historical context (decisions above were previously open)

These are open product/security decisions — **no default is assumed here**:

1. **Reconcile the premise.** Accept the existing backend auth as the foundation (recommended:
   it is tested and documented), or explicitly commission a replacement. Replacing it would also
   invalidate the committed integration test and README.
2. **Token transport & storage (frontend).** The current mismatch must be resolved:
   - (a) Keep tokens client-side only (sessionStorage) and rewrite the middleware check to rely on
     client-side gating (middleware becomes advisory, real enforcement stays server-side), or
   - (b) Set the tokens in cookies (e.g. `HttpOnly; Secure; SameSite` refresh cookie + short-lived
     access cookie) so middleware can gate server-side. Cookie storage interacts with the CSRF
     posture (currently disabled) and requires backend cookie-handling work, or
   - (c) Move to server-side sessions entirely (larger backend change; contradicts current stateless
     design). Decision affects XSS exposure, CSRF surface, and tab-scoped logout semantics.
3. **CORS origin.** Decide the canonical dev origin for the Next.js app (`http://localhost:3000`)
   and production origin(s); the backend default (`http://localhost:5173`) is stale and must be
   updated via `HRMS_CORS_ALLOWED_ORIGINS` in Phase 2 (config change, not made in this phase).
4. **Bootstrap operational flow.** Who runs the one-time bootstrap, how `HRMS_BOOTSTRAP_TOKEN` is
   handled and rotated, and whether an in-app first-run screen is desired (currently CLI/curl only).
5. **Role model.** Confirm ADMIN/HR/EMPLOYEE and their permission sets are the intended product
   roles; there is currently **no API to manage roles** — any change requires a migration.
6. **Password policy.** Backend enforces only 12–72 bytes (bcrypt limit). Decide composition rules,
   rotation, lockout/throttling (explicitly listed as missing in `docs/backend-plan.md`).
7. **Account lifecycle.** Decide on disable/enable, password reset, and "revoke all sessions"
   (refresh-token mass revocation) requirements — none exist yet.
8. **JWT library.** Decide whether to keep the hand-rolled HS256 implementation (constant-time
   compares, alg pinning, minimal) or adopt a maintained library (jjwt/nimbus). This is a
   maintenance/audit preference, not a demonstrated defect.
9. **Employee self-service scope.** EMPLOYEE holds only `leave:write`; decide whether employees may
   read their own profile/attendance (would need new scoped endpoints, not just permissions).
