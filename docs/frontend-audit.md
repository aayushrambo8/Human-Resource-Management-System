# Frontend Audit — HRMS (read-only, Phase 1)

Date: 2026-10-28. Inspected working tree at commit `67f6a9e` plus uncommitted changes.

## Critical context: in-progress Vite → Next.js migration

`git status` shows the previous Vite application was **deleted** (uncommitted: `index.html`,
`vite.config.ts`, `nginx.conf`, `src/main.tsx`, `src/api/*`, `src/features/*`, `src/layouts/AppLayout.tsx`,
etc.) and replaced by a **Next.js App Router** application (currently **untracked**: `src/app/*`,
`src/lib/*`, `next.config.ts`, `postcss.config.mjs`, `src/middleware.ts`). All findings below describe
the **current working tree** (the Next.js app), not the deleted Vite app. The migration is **not
committed** and some infrastructure files still reference the old Vite build (see Risks).

## Versions (package.json declared → package-lock resolved)

| Dependency | Declared | Resolved |
|---|---|---|
| next | ^15.2.0 | 15.5.28 |
| react / react-dom | ^19.2.8 | 19.3.0 |
| axios | ^1.20.0 | 1.20.0 |
| @tanstack/react-query (+devtools) | ^5.104.1 / ^5.104.4 | 5.104.4 / 5.104.4 |
| tailwindcss + @tailwindcss/postcss | ^4.3.3 | 4.3.3 (Tailwind **v4**, CSS-first config) |
| typescript | ~6.0.2 | 6.0.3 |
| oxlint | ^1.81.0 | 1.87.0 |
| postcss | ^8.5.0 | 8.5.29 |
| @types/node / @types/react / @types/react-dom | ^24.13.3 / ^19.2.18 / ^19.2.7 | 24.19.1 / 19.3.0 / 19.3.0 |

- Package manager evidence: `package-lock.json` (lockfileVersion 3) → **npm**. Audit host runs
  Node v24.18.0 / npm 11.16.0 (environment-specific; `package.json` declares no `engines` field).
- Router: **App Router** only (`src/app/`), route groups `(auth)` and `(dashboard)`. No Pages Router.
- TypeScript: strict mode, `noEmit`, path alias `@/* → ./src/*` (`frontend/tsconfig.json`).
- No form/validation library (no react-hook-form/zod/yup). No chart library. No table library.
- No ESLint dependency or config exists, yet `package.json` defines `"lint": "next lint"` → the lint
  script is currently **non-functional**. The linter actually configured is **oxlint**
  (`.oxlintrc.json`, react + typescript plugins).
- No test framework, no test script, no type-check script (`tsc --noEmit` usable ad hoc).

## Route structure (all `src/app/`)

| Route | File | Notes |
|---|---|---|
| `/login` | `(auth)/login/page.tsx` | client component; uses `useAuth().login` |
| `/` (dashboard) | `(dashboard)/page.tsx` | KPIs computed client-side from employees/departments/attendance/health |
| `/attendance` | `(dashboard)/attendance/page.tsx` | paged table via `Pagination` |
| `/biometric` | `(dashboard)/biometric/page.tsx` | paged table |
| `/departments` | `(dashboard)/departments/page.tsx` | card grid, read-only |
| `/employees` | `(dashboard)/employees/page.tsx` | table, read-only |
| `/employees/[id]` | `(dashboard)/employees/[id]/page.tsx` | detail view (read-only) |
| `/leave` | `(dashboard)/leave/page.tsx` | table, read-only |
| `/settings` | `(dashboard)/settings/page.tsx` | health display + static info |

- Root layout: `src/app/layout.tsx` — Inter font, metadata "Northstar Institute HRMS", wraps children
  in `QueryProvider` + `ClientAuthProvider`.
- **No `(dashboard)/layout.tsx` exists.** The Vite app's `AppLayout` (sidebar/topbar) was not ported;
  the shell CSS (`.app-shell`, `.sidebar`, `.topbar`) exists in `globals.css` but nothing renders it.
- **Dead links verified**: `/employees/new`, `/departments/new`, `/leave/new`, `/leave/[id]` are linked
  from pages but no such route files exist.
- Filesystem artifact: an **empty directory** `frontend/src/app/(dashboard)/employees/[id` (no closing
  bracket) exists beside the real `[id]` folder. Harmless to Next routing at first glance but risky for
  Windows tooling; should be removed in Phase 2.
- **Design reference missing**: `design-reference/hrms-dashboard.png` referenced by the audit brief does
  **not exist** in the repository (glob returned nothing). The current "Northstar" theme in
  `globals.css` is the de facto design source.

## Theme / dark mode / design system

- `globals.css` = `@import "tailwindcss"` (v4) + ~970 lines of **hand-written plain CSS** using
  hard-coded light-theme hex colors (background `#f5f6f4`, accent green `#2d5a42`, Georgia serif
  display headings, Inter body).
- **No CSS custom properties, no `.dark` class/attribute strategy, no `next-themes`, no media-query
  dark block. Dark mode: NOT implemented.**
- **No shadcn/ui**: no `components.json`, no Radix/CLI dependencies. `src/components/ui/` contains
  three hand-rolled components: `Icon.tsx` (22 inline SVG icons), `Pagination.tsx` (backend-shaped
  0-based paging), `States.tsx` (Loading/Error/Empty).

## API client, types, data fetching

- `src/lib/api-client.ts`: axios instance, `baseURL = NEXT_PUBLIC_API_URL || 'http://localhost:8080'`,
  15 s timeout. Tokens stored in **sessionStorage** (`hrms.accessToken`, `hrms.refreshToken`); request
  interceptor adds `Authorization: Bearer`; response interceptor performs single-flight refresh-token
  rotation on 401 (`POST /api/auth/refresh`), dispatches `hrms:session-expired` on failure;
  `getErrorMessage()` maps network/401/403 and ProblemDetail `detail`.
- `src/lib/api.ts`: typed functions — `authApi.login/logout`, `healthApi.get`, `employeeApi.list/get`,
  `departmentApi.list`, `attendanceApi.list(page,size)`, `biometricApi.list(page,size)`,
  `leaveApi.list`. **Read-only except authentication; no create/update/submit/review calls exist.**
- `src/lib/types.ts`: `Employee`, `Department`, `AttendanceRecord`, `BiometricLog`, `LeaveRequest`,
  `PageResponse<T>`, `TokenResponse`, `HealthResponse`. Field-by-field comparison against backend
  summary records found them **aligned** (enum literal unions are loose `| string` where applicable).
- `src/lib/query-provider.ts`: React Query with staleTime 5 min, retry 1, no refetch on focus,
  devtools in development.
- `src/lib/auth-context.tsx` + `auth-provider.tsx`: client auth context (email, isAuthenticated,
  login, logout), hydration-guarded, `useRequireAuth` helper (currently unused by pages).
- `src/middleware.ts`: route guard — public path `/login`; treats cookie `hrms.accessToken`/`hrms.refreshToken`
  **or** an `Authorization` header as session proof; redirects to `/login?redirect=…` otherwise.
  **Verified mismatch: tokens are only ever written to sessionStorage (client-side) and never set as
  cookies, so the middleware can never observe a session. See Integration Risks — this blocks every
  protected route.**

## Reusable building blocks for HRMS

`Icon`, `Pagination`, `States`, `api-client` (refresh logic), `api.ts`, `types.ts`, `format.ts`
(`formatDate`/`formatTime`/`initials`), auth context/provider, query provider, and the complete
`globals.css` component classes (islands/cards, data-table, badges, metric cards, buttons, forms,
alerts, state panels, responsive breakpoints, reduced-motion support). All pages are small client
components following one consistent pattern — cheap to extend.

## Scripts

| Script | Command | Status |
|---|---|---|
| dev | `next dev --turbopack` | works (unverified at runtime this phase) |
| build | `next build` | not executed this phase (read-only) |
| start | `next start` | — |
| lint | `next lint` | **broken**: no ESLint dependency/config present |

## Deployment files (stale — reference deleted Vite app)

- `frontend/Dockerfile` (committed, unchanged) still builds the **Vite** app
  (`COPY index.html vite.config.ts …`, `npm run build`, nginx serving `/app/dist`) and
  `frontend/nginx.conf` was **deleted** → `docker build ./frontend` and the `frontend` service in
  `docker-compose.yml` (which passes `VITE_API_BASE_URL`) are **broken against the current tree**.
- `frontend/.env.example` still says `VITE_API_BASE_URL=http://localhost:8080`; the Next.js app reads
  `NEXT_PUBLIC_API_URL` (and `next.config.ts` has an unused-by-client rewrite
  `/api/backend/:path* → ${NEXT_PUBLIC_API_URL||http://localhost:8080}/api/:path*`).
