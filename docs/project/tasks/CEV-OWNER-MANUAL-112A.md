# CEV-OWNER-MANUAL-112A — Client dashboard operating manual

- Status: implemented locally; awaiting owner release approval
- Owner: Morgan — Product Manager and Orchestrator
- Scope: Add a client-accessible dashboard operating manual for HVAC/trade business owners inside each workspace, and polish the Billing tab so it reads like a client-facing billing/status page instead of an internal manual checklist. The manual should explain how to use the dashboard day to day, what each section is for, daily/weekly routines, safe AI receptionist handling, billing expectations, and automation boundaries. Add it to workspace navigation.
- Dependencies: Existing workspace shell, dashboard, leads, jobs, calendar, technicians, onboarding, launch, billing, integrations, and pilot pages.
- Allowed files:
  - `src/components/workspace-shell.tsx`
  - `src/app/workspaces/[tenantId]/manual/page.tsx`
  - `src/app/workspaces/[tenantId]/manual/loading.tsx`
  - `src/app/workspaces/[tenantId]/manual/error.tsx`
  - `src/app/workspaces/[tenantId]/billing/page.tsx`
  - `tests/manual-ui.test.ts`
  - `tests/billing-ui.test.ts`
  - `tests/workspace-shell-ui.test.ts`
  - `docs/project/tasks/CEV-OWNER-MANUAL-112A.md`
  - `docs/project/handoffs/CEV-OWNER-MANUAL-112A-morgan.md`
  - `docs/project/PROJECT_STATUS.md`
  - `MEMORY.md`
- Acceptance criteria:
  1. Workspace top navigation includes a Manual link.
  2. `/workspaces/[tenantId]/manual` is protected by the existing workspace membership gate.
  3. The manual is written for HVAC/trade business owners in plain language and covers Overview, Notifications, Leads, Jobs, Technicians, Calendar, Setup, Launch, Billing, Integrations, daily routine, weekly review, AI receptionist boundaries, and stop rules.
  4. The manual links to the relevant dashboard sections.
  5. The manual does not expose secrets, provider URLs, private keys, real customer information, or claim automatic booking/SMS/email/calendar/dispatch is enabled.
  6. Billing page copy is client-facing, explains current pilot cost/status and safe payment boundaries, and avoids internal back-office instructions.
  7. Focused manual, billing, and shell tests, typecheck, lint, and production build pass or blocked checks are explicitly recorded.
- Required evidence: Changed files, focused test results, typecheck result, lint result, build result, limitations, rollback notes.
