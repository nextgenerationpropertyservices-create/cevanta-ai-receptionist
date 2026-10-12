# CEV-CLIENT-COPY-111A — Client-facing workspace homepage copy

- Status: assigned
- Owner: Morgan — Product Manager and Orchestrator
- Scope: Replace the internal "next dashboard upgrades" section on the client workspace homepage with client-facing language suitable for HVAC/trade business owners, and make the ROI snapshot editable on the dashboard so clients can adjust estimator assumptions without changing provider settings or live automation.
- Dependencies: Existing workspace homepage and current front-office dashboard release.
- Allowed files:
  - `src/app/workspaces/[tenantId]/page.tsx`\n  - `src/components/roi-calculator.tsx`\n  - `src/app/globals.css`
  - `tests/dashboard-ui.test.ts`
  - `docs/project/tasks/CEV-CLIENT-COPY-111A.md`
  - `docs/project/handoffs/CEV-CLIENT-COPY-111A-morgan.md`
  - `docs/project/PROJECT_STATUS.md`
  - `MEMORY.md`
- Acceptance criteria:
  1. The section no longer says "NEXT DASHBOARD UPGRADES" or "worth the money".
  2. The replacement copy is client-facing, professional, and focused on running the front office.
  3. The three calls to action still route to technicians, calendar, and integrations.
  4. No provider secrets, real customer information, or live automation claims are added.
  5. Focused dashboard UI test, typecheck, lint, and production build pass or blocked checks are explicitly recorded.
- Required evidence: Changed files, focused test result, typecheck result, lint result, build result, limitations, rollback notes.

