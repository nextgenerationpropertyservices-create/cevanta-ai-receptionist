# CEV-STATUS-158A
- Owner: Morgan (coordinator)
- Scope: Add a client-facing system-status widget to each trade workspace overview.
- Dependencies: Existing lead, job, appointment readiness query results and integrations route.
- Allowed files: `src/app/workspaces/[tenantId]/page.tsx`, `tests/dashboard-ui.test.ts`, task and handoff docs, `docs/project/PROJECT_STATUS.md`.
- Acceptance criteria:
  1. Overview clearly labels the system-status card and explains what the checks mean.
  2. Lead intake, dispatch, and calendar each show Ready or Needs attention from existing query readiness.
  3. Card links to integrations without enabling provider side effects.
  4. Existing overview widget customization remains available.
- Required evidence: focused dashboard test, full test suite, typecheck, lint, and production build.
- State: implemented.
