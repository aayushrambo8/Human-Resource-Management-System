# Testing Report — HRMS Frontend

Maintained per AGENTS.md §14. All results below were **actually executed** on the dates shown.

## Environment

- Host: Windows, Node v24.18.0, npm 11.16.0
- Branch: `main`, worktree at `67f6a9e` + local commits (see below)
- Backend availability: **not running this session** — live API integration remains unverified;
  all API-facing behavior verified only against source-read contracts
  (`docs/backend-integration-contract.md`).

## Stage 0 — repository baseline (2026-10-28)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` (`oxlint src`) | ✅ exit 0 — 7 pre-existing warnings (unused imports in `auth-context.tsx`/`login/page.tsx`/`employees/[id]/page.tsx`; fast-refresh export warnings in `layout.tsx`/`auth-provider.tsx`; `set-state-in-effect` in `auth-provider.tsx`). None are errors; scheduled for cleanup in Phase A when those files are touched. |
| Type check | `npx tsc --noEmit` | ✅ exit 0 (after clearing stale `.next/types` cache that referenced the pre-fix malformed route path) |
| Production build | `npm run build` | ✅ success — 11 pages generated; **`/employees/[id]` registered as dynamic (ƒ) route**, confirming the route-structure repair |

### Structural defect found & fixed during Stage 0

The employee detail page was stored in a malformed on-disk nesting
`employees/[id/]/page.tsx` (directory `[id` containing a subdirectory `]`), leaving the real
Next.js dynamic segment `employees/[id]/` **empty** — the `/employees/[id]` route did not exist
before this fix. The file was moved to `employees/[id]/page.tsx` with **sha256
`171f9cb0dc84cec214ec7ce5c8b5079241146a68d39c092f89f30558dddf8943` verified identical before and
after**; the malformed directories were removed. No content was lost.

## Phase A — shell, theme, dashboard, honest KPIs (2026-10-28)

All changes in `frontend/` only; backend untouched.

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` (`oxlint src`) | ✅ exit 0 — 9 warnings, **0 errors**. Remaining warnings are intentional patterns: fast-refresh export warnings (constants/hooks exported alongside components in `layout.tsx`, `theme-provider.tsx`, `auth-provider.tsx`) and `set-state-in-effect` (sessionStorage/DOM hydration sync in `theme-provider.tsx`/`auth-provider.tsx`, and close-menus-on-navigation in `AppShell.tsx`). The unused-import warnings cited in Stage 0 (`login/page.tsx`, `employees/[id]/page.tsx`) are **resolved**. |
| Type check | `npx tsc --noEmit` | ✅ exit 0 |
| Production build | `npm run build` | ✅ success — 11 pages; `/employees/[id]` remains dynamic (ƒ) |

### What Phase A delivered (verified by build, not yet by live API)

- **App shell**: blue sidebar, sticky topbar, mobile drawer + scrim, profile dropdown with sign-out,
  role-gated nav (directory modules visible only to ADMIN/HR).
- **Theme**: hand-rolled provider + pre-paint init script; light/dark toggle persisted to
  `localStorage`, system-preference fallback, `suppressHydrationWarning` for the intentional class diff.
- **Dashboard**: role-aware queries (`enabled` gated so EMPLOYEE never fires requests that would 403);
  ADMIN/HR KPIs — Total Employees, Pending Leave Requests, New Hires (30d, timezone-safe date-only
  diff), Departments; EMPLOYEE KPIs — My Leave Requests, My Pending Requests (backend scopes the list
  to own records). Headcount-by-department bar chart (CSS, no chart library), attendance activity
  feed, employee overview table.
- **Honesty fixes**: removed dead links (`/employees/new`, `/departments/new`, `/leave/new`,
  `/leave/[id]` chevron); leave-page employee links only render for roles that can open the
  directory; settings backend label corrected to "Spring Boot 4"; departments card no longer shows
  duplicated company code.
- **Design tokens**: `globals.css` rewritten with light/dark CSS custom properties; all component
  classes referenced by pages (pagination, department cards, settings rows, profile rows, device
  cells, states) now actually defined.

## Phase B — live backend integration verification (2026-10-28)

The backend was **started for the first time this session** and the full request path
(browser-independent, via HTTP) was verified. This clears the long-standing
"live API integration unverified" blocker.

### How the backend was started (no backend files modified)

PostgreSQL is not installed and Docker is unavailable, so the production datasource
(`jdbc:postgresql://localhost:5432/hrms`) could not be used. The backend's own
`test` profile is the intended H2 fallback (`MODE=PostgreSQL`, Flyway-enabled), but
`spring-boot:run` does not put `src/test/resources` on the runtime classpath. The
H2 datasource + all required secrets were therefore supplied as **runtime environment
variables using the exact values the backend's own `application-test.yml` defines** —
no Java, YAML, or build file was touched:

| Variable | Value (from backend's test profile) |
|---|---|
| `HRMS_DB_URL` | `jdbc:h2:mem:hrms;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH` |
| `HRMS_DB_USERNAME` / `HRMS_DB_PASSWORD` | `sa` / (empty) |
| `HRMS_JWT_SECRET` | `test-jwt-secret-that-is-at-least-32-bytes-long` |
| `HRMS_BOOTSTRAP_TOKEN` | `test-bootstrap-token-that-is-at-least-32-bytes` |
| `HRMS_DEMO_DEVICE_TOKEN_HASH` | `e76b6359…c6b37` (the value in the test profile) |
| `HRMS_CORS_ALLOWED_ORIGINS` | `http://localhost:3000` |

Launch command (test classpath so the test-scoped H2 driver is loadable):
`.\mvnw.cmd spring-boot:run "-Dspring-boot.run.useTestClasspath=true"` with the above env vars.

**Result:** Spring Boot 4.1.1 started on `:8080`; Flyway applied all **4 migrations** to H2
(versions 1–4, incl. "seed local development data"); Tomcat up in ~7.7s.

### Endpoint verification — direct (`:8080`) and through the Next.js proxy (`:3000/api/backend`)

Account bootstrapped via `POST /api/auth/bootstrap` (X-Bootstrap-Token) → ADMIN user
`admin@northstar.local`. Login returns `roles: ["ADMIN"]` and a JWT. All frontend-consumed
endpoints return **200 OK with the seeded demo data** on both paths:

| Endpoint | Direct :8080 | Via proxy :3000 | Seeded data |
|---|---|---|---|
| `GET /api/health` | 200 | 200 | `status: ok, product: custom-hrms` |
| `POST /api/auth/login` | 200 | 200 | ADMIN JWT + roles |
| `GET /api/employees` | 200 | 200 | 1 record (Demo Employee / EMP001 / Administration / ACTIVE) |
| `GET /api/departments` | 200 | 200 | 1 record (Administration / ADMIN / company INST) |
| `GET /api/attendance` | 200 | 200 | 0 records |
| `GET /api/leaves` | 200 | 200 | 0 records |
| `GET /api/biometric/logs` | 200 | 200 | 0 records |

### Bug found & fixed by live verification (the proxy had never actually run before)

`next.config.ts` rewrite destination was `${API}/api/:path*`. Because the axios client
already uses baseURL `/api/backend` + endpoint paths that begin `/api/`, the captured
`:path*` is `api/health`, producing `http://localhost:8080/api/**api**/health` — a
**doubled `/api`**. That path is not in the backend's `permitAll` list, so every proxied
request returned **401 Unauthorized**, including the public health endpoint. Fixed by
dropping the redundant `/api/` from the destination (`${API}/:path*`). Re-verified: the
same table above now passes through the proxy.

### Frontend dev server

`npm run dev` (Next.js 15.5.28 / Turbopack) started on `:3000`; `/login` returns 200.
The (dashboard) pages themselves render client-side after auth, so their visual state is
confirmed by the successful API calls above rather than by server HTML.

## Phase C — browser verification (2026-10-28)

Full-stack session in a real Chromium browser (OpenCode desktop). Both servers running:
backend on `:8080` (H2/test env), frontend dev on `:3000`. A second account
(`employee@northstar.local`, role EMPLOYEE, linked to EMP001) was created via
`POST /api/accounts` for role-matrix testing. Backend files remain untouched.

| Check | Result |
|---|---|
| Console errors/warnings | ✅ **0 errors, 0 warnings** on every page (login, dashboard, employees, employee detail, departments, attendance, biometric, leave, settings) — no hydration mismatch, no React warnings |
| Login (ADMIN) | ✅ Full shell rendered; dashboard KPIs pulled live data: Total Employees **1**, Pending Leave **0**, New Hires 30d **1**, Departments **1**; headcount bar showed Administration 100% |
| Employee detail (`/employees/[id]`) | ✅ The Stage 0-repaired dynamic route renders all fields (name, code, department, status, joined, email, phone) from a live UUID |
| Theme toggle | ✅ Started **dark** (system preference, `stored=null`); toggle → **light** (`stored="light"`); **persisted across reload**; class + `colorScheme` both update; no flash/mismatch |
| Empty states | ✅ leave/attendance/biometric show honest empty states against the live (empty) tables |
| Role matrix (EMPLOYEE) | ✅ Nav reduced to **Dashboard, Leave, Settings** (directory modules hidden); dashboard switched to role-aware KPIs (**My Leave Requests 0**, **My Pending 0**) + "Directory and attendance data are managed by HR" note; People Pulse scoped to own records |
| API role enforcement | ✅ EMPLOYEE → **401** on `/employees`, `/departments`, `/attendance`, `/biometric/logs`; **200** on `/leaves` (own only). UI never fires the denied requests (gated by `enabled`/nav filtering) |
| Logout | ✅ `POST /api/auth/logout` → **204**; sessionStorage (token/roles/email) cleared; redirect to `/login`; sidebar gone |
| Mobile drawer logic | ✅ Open adds `sidebar-open` + renders scrim + close button; close removes them. (Visual breakpoint not testable — no viewport-resize tool; responsive CSS confirmed present at 4 breakpoints: 1200/900/700/480px) |

### Bug found & fixed by browser testing (auth gate cold-load race)

Before the fix, a **logged-out cold load of a protected route** (e.g. visiting `/`
directly) painted the dashboard for one frame — the AppShell gate ran in a `useEffect`,
which executes *after* first paint — so the always-enabled `/api/leaves` query fired,
got **401**, and the axios interceptor dispatched `session-expired`, landing the user on
`/login?expired=true` with a misleading "Your session has expired" message for someone
who was simply never signed in. No data leaked (401), but it wasted API calls and
presented a confusing message.

Fix: `AppShell` now renders a neutral placeholder and **never mounts protected children
while unauthenticated** (early return before the shell). Verified after fix: cold load of
`/` while logged out → clean `/login` (no `?expired=true`), **zero API XHR calls fired**,
zero console errors. Login/normal flow unaffected (regression-checked).

### Verification trio after the gate change

`npm run lint` → exit 0 (same 9 pre-existing warnings, no new) · `npx tsc --noEmit` → exit 0 · `npm run build` → success (11 pages, `/employees/[id]` dynamic).

## Not yet verified (pending phases)

- Visual responsive rendering at real mobile/tablet viewports (no viewport-emulation tool available in this environment) — CSS breakpoints confirmed present; drawer interaction logic verified.
- Lighthouse/accessibility audit pass — optional polish phase.
