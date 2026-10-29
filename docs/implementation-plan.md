# Implementation Plan — Enterprise HRMS Frontend (post-audit, Phase 2+)

Status: **APPROVED as execution baseline (AGENTS.md, 2026-10-28). Stage 0 executed and passing;
Stage 1 (Phase A) pending gate approval.**

Design basis: the Dribbble reference screenshot (`design-reference/hrms-dashboard.png`) was never
supplied to the repository (exhaustive search, 2026-10-28). Per AGENTS.md §5 the written
specification — blue sidebar, KPI cards, analytics charts, employee table, restrained blue
branding — governs the design until the asset is provided. Token storage, proxy convention, and
timezone decisions are owner-confirmed (see `authentication-decisions.md`).

Principles: preserve the existing architecture (Next.js App Router + React Query + axios +
hand-rolled design system; Spring Boot 4 API with its verified contract), stay lightweight (no
dependency replacements, no new frameworks without a demonstrated need), and work only from
**verified** backend capabilities.

## Integration risks this plan must clear first (full list: `docs/integration-risks.md`)

Blockers: (1) middleware cookie vs sessionStorage mismatch makes every protected route redirect to
`/login`; (2) backend CORS default origin is the stale `localhost:5173`; (3) frontend Docker build
references the deleted Vite app; (16) the "auth is unimplemented" premise conflicts with the
committed, tested auth implementation; (17) the entire Next.js migration is uncommitted.

## Stage 0 — Resolve audit findings & blockers

1. Reconcile the auth premise (docs/authentication-decisions.md #1) and token-storage decision
   (#2) with stakeholders.
2. Commit the in-progress Vite→Next migration as one reviewed unit (including removing the empty
   `employees/[id` artifact directory and deciding the fate of the stale `frontend/Dockerfile` /
   nginx setup).
3. Obtain the missing design reference (`design-reference/hrms-dashboard.png`) or declare
   `globals.css` the design source of truth.
4. Fix `npm run lint` to invoke `oxlint` (no new dependency).
5. Environment contract: decide same-origin proxy (extend the Next rewrite to `/api/backend/*` and
   point axios there) **or** direct cross-origin with `HRMS_CORS_ALLOWED_ORIGINS` updated to
   include the Next origin. Recommended for the self-hosted LAN target in the root README:
   same-origin proxy (removes CORS from the browser path entirely).
   Files: `frontend/next.config.ts`, `frontend/src/lib/api-client.ts`, `.env.example`
   (names only; no secret values change).

## Stage 1 — Design tokens & application shell

1. Convert the hard-coded palette in `frontend/src/app/globals.css` to CSS custom properties
   (Tailwind v4 `@theme` + semantic variables) without changing the current visual output.
2. Port the app shell: create `frontend/src/app/(dashboard)/layout.tsx` rendering sidebar +
   topbar using the existing `.app-shell/.sidebar/.topbar` classes (CSS already exists in
   `globals.css`; the Vite `AppLayout` was never ported). Wire the session email/logout from
   `useAuth()`; add permission-aware nav gating once tokens expose roles.
3. Reusable primitives to add under `frontend/src/components/ui/` (all with the existing
   hand-rolled style): `Modal`, `FormField`, `Button` variants, `Toast`. No shadcn/Radix unless
   the team decides otherwise (see dependency note below).
4. Remove/fix dead links (`/employees/new`, `/departments/new`, `/leave/new`, `/leave/[id]`)
   as their target pages land.

## Stage 2 — Light/dark themes

1. Implement dark mode with the `class` strategy via a small theme provider (candidate:
   `next-themes`, ~1 kB — the only new runtime dependency recommended, and only if a dependency
   is acceptable; an equivalent ~30-line hand-rolled provider also works given the SSR-safe
   pattern already used in `auth-provider.tsx`).
2. Map every semantic token for both modes; add a toggle in the topbar; respect
   `prefers-color-scheme` initially.
3. Verify contrast on status badges/metric cards, which currently use fixed hex values.

## Stage 3 — First verified read-only integration (thin slice)

1. Extend `frontend/src/lib/api.ts` + `types.ts` with the verified endpoints needed by one module
   (contract: `docs/backend-integration-contract.md`) — no invented fields.
2. Harden `getErrorMessage` for the verified error families (empty-body 401, ProblemDetail 404/409)
   and confirm the validation-error shape against a running server (risk #11).
3. Render the Attendance page fully from `GET /api/attendance` (already partially built), with
   correct timezone handling per the Stage-0 decision (risk #10), pagination against the real
   `PageResponse`, and 401-expiry behavior through the existing refresh interceptor.

## Stage 4 — Complete the first module end to end

Recommended first module: **Employee directory + details** (contract VERIFIED: list/get; UI exists
and only needs polish + the missing `/employees/[id]` back-navigation and states), *or* Attendance
if read-only depth is preferred. Include: empty/error/loading states (exist), pagination decision
(document the unpaginated-list risk), role-aware rendering (hide "Add Employee" without
`employee:write`).

## Stage 5 — Expand to other verified modules

Order by contract readiness (all from `docs/hrms-module-matrix.md`):
1. **Departments** (list verified; create/update UI only if `department:write` gating is agreed).
2. **Leave management** — list page exists; add submit form (`POST /api/leaves`) and review
   actions (`PATCH /api/leaves/{id}/decision`, `leave:review`) with role gating.
3. **Employee create/edit** (`POST`/`PUT /api/employees`) behind `employee:write`.
4. **Biometric logs** page (exists; needs device-context copy only).
5. **User account creation** UI (`POST /api/accounts`, ADMIN only) as the seed of Settings.
Explicitly out of scope until backend exists: recruitment, onboarding, payroll, reports,
dashboard aggregation (module matrix #1/#6/#7/#8/#9).

## Stage 6 — Authentication & authorization completion

Per the Stage-0 decisions: align middleware + token storage; add permission-aware UI gating
(claims are already in the JWT/`TokenResponse`); bootstrap flow guidance in docs; keep the backend
security model as-is (stateless Bearer, CSRF-disabled) unless a cookie/session decision changes it.

## Stage 7 — Automated tests & production build — ✅ completed 2026-10-29

1. Frontend: adopt the built-in `next build` type-checking + `oxlint` in CI; add React Testing
   Library + Vitest only for: api-client interceptor logic (refresh rotation, single-flight),
   form validation, and one smoke test per module page (mocked `axios`). No E2E framework unless
   requested.
2. Backend: the existing MockMvc suite is the safety net for contract changes; add cases when any
   backend contract is touched (that work belongs to the backend repo).
3. Verify `npm run build && npm start` against the compose stack; repair the frontend Dockerfile
   (risk #3) and healthcheck.

## Dependency policy

Keep: Next 15 / React 19 / axios / React Query / Tailwind 4 / oxlint. No replacements justified.
Allowed additions (each optional, decided per stage): `next-themes` (or hand-rolled equivalent),
Vitest + RTL (Stage 7 only). Explicitly avoided: UI kits (shadcn/Radix), form libraries, chart
libraries, state managers — revisit only with demonstrated need.

## Proposed file changes for Phase 2 (historical — all delivered; see git log)

| File | Change |
|---|---|
| `frontend/src/middleware.ts` | align with agreed token-storage model (fix blocker #1) |
| `frontend/src/lib/api-client.ts` | base-URL convention per Stage 0; error-shape hardening |
| `frontend/src/lib/api.ts`, `types.ts` | add verified endpoints/types (contract-driven) |
| `frontend/src/app/(dashboard)/layout.tsx` | new — app shell (sidebar/topbar) |
| `frontend/src/app/globals.css` | tokenization + dark-mode variables |
| `frontend/src/components/ui/*` | theme provider/toggle, Modal, FormField primitives |
| `frontend/src/app/(dashboard)/employees/new/page.tsx` (+ leave/departments forms) | module stages |
| `frontend/package.json` | `lint` script → oxlint; (optional) test deps in Stage 7 |
| `frontend/Dockerfile`, `docker-compose.yml`, `.env.example` | Next.js build + env-name fixes |
| `backend/…` | **none** in Phase 2 unless a contract gap is approved (pagination, stats) |

## Prioritized checklist — all items completed (2026-10-29)

1. ☑ Approve audit findings; resolve auth-premise + token-storage decisions.
2. ☑ Commit the Vite→Next migration; clean the `[id` artifact; fix lint script.
3. ☑ Decide URL convention (same-origin proxy chosen) + timezone policy documented; env docs updated.
4. ☑ Design tokens + `(dashboard)` app shell layout.
5. ☑ Dark/light theme implementation + toggle (persisted, system preference, no hydration errors).
6. ☑ Verified read-only slice (attendance) with hardened error handling.
7. ☑ First module end to end (employees directory/details + create/edit write paths).
8. ☑ Expand: departments, leave (submit/review), employee create/edit, biometric logs, accounts UI —
   **all write paths browser-verified live 2026-10-29** (testing-report §D.2).
9. ☑ Permission-aware UI gating (`src/lib/permissions.ts`, verified for ADMIN/HR/EMPLOYEE);
   bootstrap ops documented (testing-report Phase B/D run recipe incl. `DB_CLOSE_DELAY=-1`).
10. ☑ Tests (Vitest 104/104 + oxlint + type-check, all exit 0) and production build/Docker repair
    (standalone build + server verified locally; Docker image build unavailable on this host —
    testing-report §D.3–D.4). `npm audit` = 2 known vulns in Next's pinned postcss, tracked, not force-fixed.

Verification evidence for every claim: `docs/testing-report.md` (§Phase D, 2026-10-29).
Backend gaps found during integration (masked-401 error handling, no aggregation/pagination
endpoints): `docs/backend-integration-contract.md` + `docs/integration-risks.md` — documented,
not patched (backend is read-only).
