# Testing Report — HRMS Frontend

Maintained per AGENTS.md §14. All results below were **actually executed** on the dates shown.

## Environment

- Host: Windows, Node v24.18.0, npm 11.16.0
- Branch: `main`, worktree at `67f6a9e` + local commits (see below)
- Backend availability: **running this session** on `:8080` (H2/test profile via
  runtime env vars — see Phase B); live API integration verified direct and through
  the Next.js proxy. Source-read contracts in `docs/backend-integration-contract.md`
  remain the authoritative endpoint/DTO inventory.

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
| `HRMS_DB_URL` | `jdbc:h2:mem:hrms;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1` — **`DB_CLOSE_DELAY=-1` added 2026-10-29** after Finding B (see Phase D): without it the in-memory database is destroyed when Hikari closes its last connection (e.g. after a machine sleep) and every endpoint fails until restart |
| `HRMS_DB_USERNAME` / `HRMS_DB_PASSWORD` | `sa` / (empty) |
| `HRMS_JWT_SECRET` | `test-jwt-secret-that-is-at-least-32-bytes-long` |
| `HRMS_BOOTSTRAP_TOKEN` | `test-bootstrap-token-that-is-at-least-32-bytes` |
| `HRMS_DEMO_DEVICE_TOKEN_HASH` | `e76b6359…c6b37` (64 hex chars — must be exactly ≤64, the column is `varchar(64)`; a 65-char value fails Flyway V4) |
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

## Phase B (build) — attendance module (2026-10-28)

Scope: make the attendance page honest and role-safe against the live backend, and
verify its pagination with real data. Backend untouched (only test data seeded via
the public device-punch endpoint).

### Test data seeded (no backend changes)

25 punches posted to `POST /api/biometric/attendance` with header
`X-Device-Token: change-me-device-token` (the demo device token the backend's own
test suite uses), all for `BIO-001` / `EMP001`, spread across Oct 10–14, 2026 with
alternating IN/OUT. API pagination confirmed: `page=0` → 20 items, `page=1` → 5 items,
`totalElements=25`, `totalPages=2`.

### Changes to `frontend/src/app/(dashboard)/attendance/page.tsx`

- **Role gate**: `enabled: canReadAttendance` on the query + a
  "Restricted to HR & Admin" `EmptyState` for EMPLOYEE. Before this, a direct visit
  to `/attendance` as EMPLOYEE fired a doomed request that the backend answers with
  **401** (not 403), which `getErrorMessage` maps to a misleading "session expired".
- **Honest gap note**: below the table — "Showing page N of M (X records).
  Date-range filtering is not available — the backend endpoint supports pagination
  only." (`GET /api/attendance` accepts only `?page`/`?size`; no server-side date
  filter exists, so none is faked client-side either.)

### Live browser verification (admin + employee accounts)

| Check | Result |
|---|---|
| Page 1 with seeded data | ✅ 20 rows rendered (Demo Employee / EMP001 / BIO-001 / IN-OUT badge / date / time), pagination visible, gap note reads "Showing page 1 of 2 (25 records)…" |
| Page 2 via Next button | ✅ 5 rows, note updates to "page 2 of 2", **Next disabled on last page**, Previous enabled, 0 console errors |
| EMPLOYEE direct visit to `/attendance` | ✅ "Restricted to HR & Admin" panel with explanation; **zero API calls fired** (query `enabled`-gated), 0 console errors |
| Verification trio | ✅ `npm run lint` exit 0 · `npx tsc --noEmit` exit 0 · `npm run build` success (attendance route 1.38 kB) |

### Environment note

Running `npm run build` while `npm run dev` is active corrupts the shared `.next`
directory (ENOENT on `app-build-manifest.json`, resulting 500s on every route).
Reproduced and worked around: stop the dev server → clear `.next` → restart.
Builds in this report were run with the dev server stopped.

## Accessibility audit (axe-core 4.12.0, light + dark) — 2026-10-29

Injected axe-core 4.12.0 into the live browser page (not added to project
dependencies) and swept all 9 surfaces — the 7 dashboard routes, `/login`, and the
`/employees/[id]` detail route — in **both** themes. Tag set: `wcag2a, wcag2aa,
wcag21a, wcag21aa, best-practice`.

**Final result: 0 violations, 0 incomplete on every surface in both themes**
(the sole `incomplete` is a known axe false-negative — see below).

### Real defects found and fixed (all in `frontend/src/app/globals.css` unless noted)

| # | Surface | Defect | Fix |
|---|---|---|---|
| 1 | both | `.info-row span` (descendant selector) also matched a `.status-badge` nested inside the `<strong>` value, overriding its green/amber foreground with `--text-muted` — the ACTIVE pill rendered grey (and got force-uppercased) | scoped to `.info-row > div > span` |
| 2 | light | `--text-muted` `#7c879c` = 3.3–3.6:1 on light surfaces | → `#606b82` |
| 3 | light | `--text-faint` `#9aa4b8` = 2.3–2.5:1 | → `#646f88` |
| 4 | dark | `--text-faint` `#6d7a92` = 3.34–4.21:1 | → `#8492ad` |
| 5 | light | `--success` `#12805c` = 4.37:1 on `--success-soft` (under AA at 10px) | → `#107554` |
| 6 | both | `.avatar-3` hardcoded `#3a7bb8` on a 14% tint = 3.76:1 light / 3.23:1 dark, no dark variant | tokenized to `--avatar-3-fg/bg` (`#2f6599` light, `#7db3e4` dark) |
| 7 | both | `.avatar-0` + `.topbar-avatar` accent-on-own-tint = 3.71:1 dark; 4.36:1 light after tokenizing | tokenized to `--avatar-0-fg/bg`; light fg darkened to `#1d4ed8` (5.57:1 white / 5.32 / 5.11), dark `#7fb0fb` (5.57:1) |
| 8 | both | `.btn-primary` / `.brand-mark` filled with `--accent`; dark `#3b82f6` only reaches 3.67:1 behind white text | split `--accent` (text) from `--accent-solid` (`#2563eb`, 5.17:1 behind white) for fills |
| 9 | both | brand links had a `label-content-name-mismatch` (axe concatenates raw text nodes to "NNorthstar…") | added an explicit `{' '}` whitespace node + `aria-label` with the full visible string |
| 10 | both | employees table actions `<th />` empty → `empty-table-header` | `<th><span className="sr-only">Actions</span></th>` + added the `.sr-only` utility |

### Known axe false-negative (verified manually)

`.island-link-inline` on the dashboard reports `color-contrast` **incomplete** because
axe cannot resolve the background behind a decorative gradient overlay. Computed
directly from the live DOM: the link is `#2563eb` on `#ffffff` = **5.17:1** (passes AA).
Not a real defect.

A second transient — `page-has-heading-one` on `/employees/[id]` — was a scan-timing
artifact: the `<h1>` renders only after the employee query resolves. Re-scanning after
data load shows the `<h1>` ("Demo Employee") present, 0 violations.

### Tooling notes

- axe is injected from a CDN into the page at audit time and is **not** a project
  dependency.
- A full `browser.navigate` reload discards the injected axe script, so SPA routes are
  walked by clicking `.sidebar-nav a[...]` and waiting for `aria-current="page"` to
  commit; axe is re-injected after any hard navigation.
- Screenshots were unavailable in this environment (the browser tab cannot be surfaced
  to the desktop), so visual confirmation was done by reading computed styles from the
  live DOM instead — more precise for contrast work than a screenshot.

### Verification trio after the a11y changes

`npm run lint` → exit 0 (8 pre-existing framework warnings, no new) ·
`npx tsc --noEmit` → exit 0 · `npm run build` → success (11 pages, `/employees/[id]` dynamic).

## Phase D — write paths, backend findings, automated tests, production build (2026-10-29)

Scope: finish the remaining stages — every module's write path verified live, the automated
test suite, and the Docker/production (standalone) build repair. Backend files remain untouched.

### D.1 Backend investigation — two real defects found (documented, not patched)

During write-path verification, a **total auth failure** appeared mid-session: every login
(admin included) returned bare `401` while `/api/health` stayed `ok`. Both root causes were proven:

**Finding A — unhandled errors are masked to a bare 401 (backend defect).**
Reproduced on a clean throwaway instance (`:8081`, Spring Security TRACE): `POST /api/leaves`
passes the full filter chain and `@PreAuthorize` (`Authorized method invocation … LeaveController.submit`),
the service throws, the container forwards to `GET /error`, `JwtAuthenticationFilter`
(`OncePerRequestFilter`) skips ERROR dispatches, the request runs anonymous,
`AuthorizationFilter` denies `/error`, and the entry point's `sendError(401)` overwrites the
original status with an **empty body**. Runtime matrix (bodies via `HttpClient`):

| Error class | Intended | Client receives |
|---|---|---|
| `EntityNotFoundException` (advice) | 404 ProblemDetail | ✅ 404 + full ProblemDetail |
| `DataIntegrityViolationException` (advice) | 409 ProblemDetail | ✅ 409 + full ProblemDetail |
| Entry-point 401 (no/expired token) | 401 empty | ✅ 401 empty (as designed) |
| `ResponseStatusException` (leave end<start, account-not-linked) | 400/409 + reason | ❌ 401, empty |
| Bean-validation `@Valid` failure | 400 field errors | ❌ 401, empty |
| Method-security denial (`@PreAuthorize`) | 403 | ❌ 401, empty |
| Unexpected DB/persistence failure | 500 | ❌ 401, empty |

Consequence for the frontend: masked 401s trigger the refresh-then-give-up interceptor path and a
"Your session has expired" message even when the session was fine — misleading, and **not fixable
client-side** (the wire responses are identical to genuine expiry). Owner-side fix documented in
`docs/backend-integration-contract.md` (Finding A). No backend file changed.

**Finding B — H2 in-memory database died (operational, run recipe).**
The log of the original `:8080` process proves it: `Table "auth_bootstrap_lock" not found (this
database is empty)` — the recipe's H2 URL lacked `DB_CLOSE_DELAY=-1`, the machine slept
(`HikariPool-1 - Thread starvation or clock leap detected (housekeeper delta=1h39m…)`), the last
connection closed, H2 destroyed the in-memory DB, and Flyway only runs at startup — so every table
vanished while `/api/health` (no DB check) stayed green. Recovery = restart with `DB_CLOSE_DELAY=-1`
(env-only) + re-seed (V2 seeds no `user_accounts`). Verified: bootstrap admin + `POST /api/accounts`
×2 (employee, HR) + **all three logins succeed twice in consecutive rounds**.

**Finding C — leave write path is contract-correct.** Employee-linked `POST /api/leaves` → **201**
with the full `LeaveSummary` (verified both via HTTP and in the browser).

### D.2 Write-path browser verification (Chromium, real backend :8080, dev :3000)

| Flow | Session | Result |
|---|---|---|
| Employee create (`/employees/new`) | ADMIN | ✅ 201 → redirected to directory, row **EMP903 "Browser Verified"** rendered with department/email/joining date |
| Employee edit (detail-page modal) | ADMIN | ✅ modal opens prefilled, phone `+1-555-0199` saved → **persisted** on the detail page |
| Department create | ADMIN | ✅ dialog → 201 → **BRS** card rendered |
| Department edit (rename) | ADMIN | ✅ "Browser Dept Renamed" persisted on the card |
| Account create (Settings → New account) | ADMIN | ✅ 201 with in-modal success "Account created for hr.user@northstar.local."; **new HR account logs in** |
| Sign out (account menu) | ADMIN | ✅ clean `/login`, sessionStorage cleared (0 keys) |
| Role-gated nav | EMPLOYEE | ✅ nav = **Dashboard, Leave, Settings** only |
| Directory restriction | EMPLOYEE | ✅ `/employees` shows "Restricted to HR & Admin" empty state; **no** "New employee" button |
| Leave submit (dialog) | EMPLOYEE | ✅ 201 → row **EMP001 · Dec 7–9 2026 · PENDING** rendered; copy correctly says "You are viewing your own leave requests" |
| Review controls absent | EMPLOYEE | ✅ no Approve/Reject buttons on the row (only "New request") |
| Leave approve | ADMIN | ✅ click Approve → PENDING → **APPROVED**, review buttons disappear, no error |
| Leave reject | ADMIN | ✅ second request (201 via API) → click Reject → PENDING → **REJECTED** |
| Settings gating | HR | ✅ **no "New account" button** (lacks `account:write`) |
| Directory as HR | HR | ✅ full directory + "New employee" button (has `employee:write`) |
| Full leave list as HR | HR | ✅ sees both rows incl. other employees' (has `leave:read`) |
| Login/refresh cycles | all 3 roles | ✅ all logins succeed repeatedly after recovery; interceptor silently refreshed an expired admin token mid-session |

One transient observed and not reproducible: after one sign-out→login cycle the token and roles
were stored but the login page did not auto-redirect for ~10 s (manual navigation to `/` showed a
fully working session); every subsequent login redirected normally. Not filed as a defect without
a consistent reproduction.

### D.3 Automated test suite (Stage 7)

| Check | Command | Result |
|---|---|---|
| Unit/integration tests | `npx vitest run` | ✅ **104/104 passed (6 files), exit 0** — `api-client` (interceptor refresh rotation, single-flight, session-expired dispatch), form logic, permissions, components (`Modal`, leave page) |
| Type check | `npx tsc --noEmit` | ✅ exit 0 |
| Lint | `npm run lint` (`oxlint src`) | ✅ exit 0 — 7 pre-existing warnings (fast-refresh exports in `layout.tsx`/`theme-provider.tsx`/`auth-provider.tsx`; `set-state-in-effect` in `theme-provider.tsx`/`auth-provider.tsx`/`AppShell.tsx`), **0 errors**, no new |
| Fresh install | `npm ci` | ✅ exit 0 (lockfile reproducible — also validates the Dockerfile deps stage) |
| Tests after fresh install | `npx vitest run` | ✅ 104/104 again |

Test-stack notes: Vitest 5 + RTL (devDeps, per plan Stage 7). Vite 8's oxc transformer honours
`jsx: preserve` from tsconfig, so `vitest.config.ts` sets `oxc: { jsx: { runtime: 'automatic' } }`.
The ESM-in-CJS config-loader warning printed by Vitest is cosmetic.

### D.4 Production build & Docker repair (Stage 7 item 3)

The Vite-era `frontend/Dockerfile` (index.html / vite.config.ts / nginx) was dead after the Next.js
migration. Rewritten as a **node:22-alpine multi-stage standalone** build; `next.config.ts` gains
`output: 'standalone'` and a runtime `API_PROXY_TARGET` env (proxy target needs no rebuild), plus a
second rewrite `/api/:path* → ${target}/api/:path*` so `scripts/setup-self-hosted.sh` (which
bootstraps through the frontend's host port; the backend publishes no host port) keeps working.
Also added `frontend/.dockerignore`, `frontend/public/.gitkeep`, `frontend/.env.example`;
compose frontend service now sets `API_PROXY_TARGET=http://backend:8080`, maps
`${HRMS_HTTP_PORT:-8080}:3000`, and healthchecks `wget 127.0.0.1:3000`.

**Actually executed (exit codes observed):**

| Stage | Command | Result |
|---|---|---|
| Build | `npm run build` | ✅ exit 0 — 12 pages + middleware; `/employees/[id]` dynamic (ƒ) |
| Standalone boot | `node .next/standalone/server.js` (`PORT=3100`, `API_PROXY_TARGET=http://localhost:8080`) | ✅ started, ready in 2.9 s |
| Proxy rewrite (axios convention) | `GET /api/backend/api/health` | ✅ 200 proxied health JSON |
| Proxy rewrite (setup-script convention) | `GET /api/health` | ✅ 200 proxied health JSON |
| Login through both | `POST /api/backend/api/auth/login`, `POST /api/auth/login` | ✅ 200 with real JWTs (ADMIN + HR) |
| Static assets | `GET /_next/static/css/…` | ✅ 200 after the `.next/static` copy the Dockerfile performs |
| Pages | `GET /`, `GET /login` | ✅ 200 HTML |

**Not executed:** the Docker **image build itself** — no Docker CLI/daemon on this host
(`docker` not found). Every stage the Dockerfile runs (`npm ci`, `npm run build`, the standalone
server boot, the static/public copies, the healthcheck URL) was executed locally with exit 0;
the `HEALTHCHECK`/`USER`/`EXPOSE` lines are standard node-alpine primitives.

### D.5 Dependency audit (reported honestly)

`npm audit` → **2 vulnerabilities (1 moderate, 1 high)**, exit 1. Both are in
`node_modules/next/node_modules/postcss` (Next.js's own pinned copy): XSS in CSS stringify,
sourceMappingURL arbitrary file reads (GHSA-qx2v…, GHSA-6g55…, GHSA-fxqj…, GHSA-r28c…).
They affect the **build toolchain**, not the served runtime code path. The only advisory fix is
`npm audit fix --force` → installs `next@16.4.3`, a **breaking major upgrade** — deliberately
**not** applied without approval. Not fixed; tracked in `docs/integration-risks.md`.

## Not yet verified (remaining gaps)

- Docker **image build** (no Docker on host — stages verified locally instead, see D.4).
- Visual responsive rendering at real mobile/tablet viewports (no viewport-emulation tool available
  in this environment) — CSS breakpoints confirmed present; drawer interaction logic verified.
- The transient login-redirect delay noted in D.2 (single occurrence, not reproducible).
