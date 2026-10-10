# CEV-DEMO-DASHBOARD-91A — Clean fictional demo dashboard

- Owner: Morgan — Product Manager and Orchestrator
- Scope: Add a prospect-safe dashboard demo that uses only fictional static data and does not depend on Supabase, Retell, Make, SMS, email, calendar writes, payments, quotes or dispatch.
- Dependencies: Existing Next.js app shell and global styling. Existing production dashboard remains unchanged.
- Allowed files: `src/app/demo-dashboard/page.tsx`, `src/app/globals.css`, `tests/demo-dashboard-ui.test.ts`, `docs/project/tasks/CEV-DEMO-DASHBOARD-91A.md`, `docs/project/handoffs/CEV-DEMO-DASHBOARD-91A-morgan.md`, `docs/project/PROJECT_STATUS.md`, `docs/project/OWNER_ATTENTION.md`.
- Acceptance criteria:
  1. `/demo-dashboard` renders a clear fictional HVAC demo dashboard.
  2. The page shows leads, jobs/calendar preview, setup snapshot and sales close language.
  3. The page explicitly says it is fictional and preserves the managed pilot boundary.
  4. No real customer data, provider secrets, private webhook URLs or live writes are used.
  5. A focused UI test covers the fictional boundary and demo content.
- Evidence:
  - `pnpm exec vitest run tests/demo-dashboard-ui.test.ts --configLoader native` — PASS, 1 file and 1 focused demo-dashboard test.
  - `pnpm typecheck` — PASS.
  - `pnpm lint` — PASS.
  - `pnpm build` — PASS; build output includes static route `/demo-dashboard`.
- Result: Accepted locally with limitations. The route is ready for owner review and deployment approval, but no production deployment was performed as part of this task.
