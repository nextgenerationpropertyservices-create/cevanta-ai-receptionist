# CEV-LIVE-FEATURES-113A — Full feature activation center, off by default

- Status: assigned
- Owner: Morgan — Product Manager and Orchestrator
- Scope: Build the dashboard foundation for full live features while keeping all customer-impacting actions off by default. Add a protected Go Live activation center that turns live booking, SMS, email, external calendar writes, payment collection, subscription billing, and dispatch automation into client-by-client setup tracks with prerequisites, test steps, rollback requirements, and current automation-control state. Do not implement live provider writers or external side effects in this slice.
- Dependencies: Existing workspace membership, workspace shell, automation controls, Integrations, Launch, Manual, Billing, Calendar, Jobs, Technicians, Onboarding.
- Allowed files:
  - `src/lib/client-feature-activation.ts`
  - `src/components/workspace-shell.tsx`
  - `src/app/workspaces/[tenantId]/go-live/page.tsx`
  - `src/app/workspaces/[tenantId]/go-live/loading.tsx`
  - `src/app/workspaces/[tenantId]/go-live/error.tsx`
  - `src/app/workspaces/[tenantId]/integrations/page.tsx`
  - `src/app/workspaces/[tenantId]/launch/page.tsx`
  - `src/app/workspaces/[tenantId]/manual/page.tsx`
  - `src/app/workspaces/[tenantId]/billing/page.tsx`
  - `tests/go-live-ui.test.ts`
  - `tests/workspace-shell-ui.test.ts`
  - `tests/integrations-ui.test.ts`
  - `tests/launch-ui.test.ts`
  - `tests/manual-ui.test.ts`
  - `tests/billing-ui.test.ts`
  - `docs/project/tasks/CEV-LIVE-FEATURES-113A.md`
  - `docs/project/handoffs/CEV-LIVE-FEATURES-113A-morgan.md`
  - `docs/project/PROJECT_STATUS.md`
  - `MEMORY.md`
- Acceptance criteria:
  1. Workspace navigation includes a Go Live link.
  2. `/workspaces/[tenantId]/go-live` is protected through the existing workspace membership gate.
  3. Go Live shows live booking, SMS, email, external calendar writes, payment collection, subscription billing, and dispatch automation as off-by-default client setup tracks.
  4. Each track shows provider choice, what must be configured, client approval requirement, test evidence requirement, rollback requirement, and whether activation is blocked, preparing, ready, active, or paused.
  5. Go Live clearly says the page does not send SMS/email, write external calendars, confirm bookings, collect payments, create subscriptions, or dispatch technicians.
  6. Integrations, Launch, Manual, and Billing link to the Go Live center where relevant.
  7. No provider credentials, webhook URLs, real customer data, live sends, live charges, calendar writes, booking promises, or dispatch actions are added.
  8. Focused UI tests, typecheck, lint, and production build pass or blocked checks are explicitly recorded.
- Required evidence: changed files, focused tests, typecheck, lint, build, limitations, rollback notes, exact next action.
