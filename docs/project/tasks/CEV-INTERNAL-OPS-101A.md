# CEV-INTERNAL-OPS-101A — Internal owner operations dashboard

- Owner: Morgan — Product Manager and Orchestrator
- Scope: Finish the internal Cevanta owner dashboard by upgrading `/workspaces/[tenantId]/clients` from a basic managed-client list into a back-office command center for client monitoring, onboarding progress, paperwork, pilot launch readiness, payment status, integration gates, and support next actions.
- Dependencies: Existing internal workspace account type, managed-client workspace foundation, onboarding snapshot RPC, workspace shell, and safe managed-client creation action.
- Allowed files:
  - `src/app/workspaces/[tenantId]/clients/page.tsx`
  - `tests/managed-clients.test.ts`
  - `docs/project/tasks/CEV-INTERNAL-OPS-101A.md`
  - `docs/project/handoffs/CEV-INTERNAL-OPS-101A-morgan.md`
  - `docs/project/PROJECT_STATUS.md`
- Acceptance criteria:
  1. Internal owner/admin users can see a single back-office dashboard summarizing all managed client workspaces.
  2. The dashboard shows onboarding/readiness progress, paperwork status, payment/billing status, integration state, support next action, and direct links to the client workspace, setup, launch, integrations, leads, jobs, and calendar.
  3. The page makes the next client action obvious through a priority queue and readiness summary.
  4. Non-internal or non-owner/admin users still cannot see client creation or internal operations data.
  5. The page remains honest: no billing, Retell, Make, SMS/email, external calendar writes, automatic booking, payments, quotes, or dispatch automation is implied or enabled.
  6. Meaningful UI tests, typecheck, lint, and production build pass.
- Required reviewers: Quality review recommended before treating this as full security acceptance because it is an internal monitoring surface. No schema or shared contract change is planned, so Architect review is not required for this slice.
- Evidence:
  - Pending implementation verification.
- Result: Assigned and in progress.
