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

## Not yet verified (pending phases)

- Runtime API integration through the `/api/backend` proxy (needs running backend + database).
- Theme behavior, responsive layouts, forms, and module states (Phase A/B/C).
- Hydration/console checks in a browser (requires browser run in a later phase).
