# CEV-M3-02 — Internal appointments and calendar

- Owner: Morgan integrates; Atlas owns schema/contracts/backend; Frontend owns UI; Quinn reviews security and tests.
- Scope: Internal job appointments, office create/reschedule/cancel, chronological calendar list with date filter; technicians see only appointments for currently assigned jobs, viewer reads workspace appointments. Explicit UTC date/time entry and display until reviewed timezone conversion is available. No external calendar, notifications, recurring events, automatic dispatch or conflict promises.
- Dependencies: Architect-approved jobs contracts and dispatch migration; hosted M2/M3 migrations for live checks.
- Allowed files: Atlas supabase/migrations/202610020004_appointments.sql, src/lib/appointments-contracts.ts, src/lib/appointments-validation.ts, src/lib/server/appointments-queries.ts, src/app/actions/appointments.ts, docs/project/handoffs/CEV-M3-02-atlas.md. Frontend src/app/workspaces/[tenantId]/calendar/**, src/components/workspace-shell.tsx after prior handoff, docs/project/handoffs/CEV-M3-02-frontend.md. Quinn tests/appointments.test.ts, supabase/tests/appointments_isolation.sql, scripts/test-appointments-embedded.mjs, docs/project/handoffs/CEV-M3-02-quinn.md. Morgan task/status/integration package.json, .github/workflows/ci.yml, scripts/test-db.mjs and existing embedded Auth fixture compatibility only.
- Prohibited/shared files: Other owners' paths, all credentials and real customer data. Unborn repository: disjoint ownership, no commit.
- Acceptance criteria: Atlas approves schema/shared contracts before dependent UI. Verified tenant membership/office writes, immutable same-tenant job link, valid bounded start/end interval, idempotent create and atomic metadata audit; direct RLS follows current job visibility and assignment changes. Permission, loading, empty, validation/error and migration readiness states. No mock success or placeholder actions. Type/lint/action tests/actual SQL/build plus honest browser/live limitations.
- Required evidence: Template handoffs, schema/contract approval, actual permission/parent/interval/identity/idempotency/audit SQL and action/query tests; hosted/JWT verification distinguished.
- State: assigned.
- Exact next action: Atlas approve and implement contract/backend; publish interface to Frontend/Quinn before dependent work.

## Integration self-check
- Implemented; Atlas source approval and Quinn quality approval recorded. Frontend handoff complete.
- pnpm check PASS exit0: type/lint, 310 tests, foundation/intake/jobs/appointments actual embedded SQL, production build.
- Calendar route included in production build. Configured anonymous workspace-module browser checks passed clean runner exit0; authenticated calendar persistence skipped without private accounts/session.
- Hosted migration 004 and real JWT/PostgREST multiuser/reassignment/browser acceptance NOT RUN. Integration passes do not accept hosted milestone criteria.
