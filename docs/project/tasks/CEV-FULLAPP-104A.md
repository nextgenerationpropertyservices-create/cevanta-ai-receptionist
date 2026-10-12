# CEV-FULLAPP-104A — Manual pilot billing page

- Owner: Morgan — Product Manager and Orchestrator
- Scope: Add a safe billing page for the first managed pilot offer using manual invoice/payment-link instructions only. No in-app payment collection or subscription automation.
- Dependencies: Workspace shell, Integrations page, existing dashboard navigation.
- Allowed files:
  - `src/app/workspaces/[tenantId]/billing/page.tsx`
  - `src/components/workspace-shell.tsx`
  - `tests/billing-ui.test.ts`
  - `tests/workspace-shell-ui.test.ts`
  - `docs/project/tasks/CEV-FULLAPP-104A.md`
  - `docs/project/handoffs/CEV-FULLAPP-104A-morgan.md`
  - `docs/project/PROJECT_STATUS.md`
- Acceptance criteria:
  1. Workspace top navigation includes Billing.
  2. Billing page shows the first pilot offer: $497 setup + $297/month.
  3. Billing page gives a manual Stripe payment link or invoice workflow without collecting card/payment data in the app.
  4. Billing page states no subscription automation, refunds, tax handling, payment collection, SMS/email, booking, calendar writes, or dispatch automation is enabled.
  5. Meaningful UI tests, typecheck, lint, full tests, and production build pass.
- Required reviewers: Quality review recommended before real payment implementation. No schema/shared contract change is planned.
- Evidence: Pending implementation verification.
- Result: Assigned and in progress.
