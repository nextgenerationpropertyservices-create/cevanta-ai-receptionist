# CEV-EMPTY-159A
- Owner: Morgan (coordinator)
- Scope: Make overview empty states actionable with direct links to the next office task.
- Dependencies: Existing overview routes and Empty component.
- Allowed files: `src/app/workspaces/[tenantId]/page.tsx`, `tests/dashboard-ui.test.ts`, task and handoff docs, `docs/project/PROJECT_STATUS.md`.
- Acceptance criteria:
  1. Empty queue links to the lead inbox.
  2. Empty field-team state links to technician setup.
  3. Empty calendar state links to the calendar.
  4. No provider or database side effects are added.
- Required evidence: focused dashboard test, full test suite, typecheck, lint, and production build.
- State: implemented.
