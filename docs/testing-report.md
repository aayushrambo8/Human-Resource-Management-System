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

## Not yet verified (pending phases)

- Runtime API integration through the `/api/backend` proxy (needs running backend + database) — Phase B.
- Theme behavior, responsive layouts, and module states in a browser (hydration/console checks) — later phase.
- Forms and role-matrix verification against the live backend.
