# Agent handoff — CEV-DELETE-LEADS-JOBS-116A

Task ID: CEV-DELETE-LEADS-JOBS-116A
Owner: Morgan — Product Manager and Orchestrator

## Work completed
- Added tenant-scoped server actions to delete leads and jobs for owner/admin/dispatcher roles.
- Added Delete Lead and Delete Job sections on detail pages for writable office users.
- Kept technicians/viewers read-only with no delete controls.
- Delete failures return safe messages when records are already removed or linked to records that must be handled first.

## Files changed
- src/app/actions/intake.ts
- src/app/actions/jobs.ts
- src/app/workspaces/[tenantId]/leads/[leadId]/page.tsx
- src/app/workspaces/[tenantId]/jobs/[jobId]/page.tsx
- tests/intake.test.ts
- tests/jobs.test.ts
- tests/lead-detail-ui.test.tsx
- tests/jobs-ui.test.ts
- docs/project/tasks/CEV-DELETE-LEADS-JOBS-116A.md
- docs/project/handoffs/CEV-DELETE-LEADS-JOBS-116A-morgan.md

## Database changes
None.

## API or contract changes
None. Existing Supabase foreign keys may block deletes for leads/jobs linked to protected records; the UI/action reports this safely.

## Verification commands and results
- `pnpm test -- tests/intake.test.ts tests/jobs.test.ts tests/lead-detail-ui.test.tsx tests/jobs-ui.test.ts` — PASS; configured runner executed 39 files / 838 tests.
- `pnpm typecheck` — PASS.
- `pnpm lint` — PASS.
- `pnpm exec next build --webpack` — PASS.

## Known limitations
- If a lead or job is linked by database constraints, deletion is blocked and the user must handle linked records first.
- No live hosted browser session was exercised in this local verification.

## Risks
Low to medium. This is a destructive record action, so access is limited to existing office-write roles and tenant-scoped server actions.

## Rollback notes
Revert the delete actions, detail page delete sections, tests, task record and this handoff.

## Exact next action
Owner approval is required before pushing/releasing to production.
