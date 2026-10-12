# CEV-FULLAPP-103A — Client onboarding visibility polish

- Owner: Morgan — Product Manager and Orchestrator
- Scope: Make the client onboarding flow easier to understand and monitor by adding clearer Setup instructions for trade owners and richer intake detail visibility in the internal owner dashboard.
- Dependencies: Existing onboarding snapshot RPC, internal clients dashboard, guided setup forms, managed client tests.
- Allowed files:
  - `src/app/workspaces/[tenantId]/clients/page.tsx`
  - `src/app/workspaces/[tenantId]/onboarding/page.tsx`
  - `tests/managed-clients.test.ts`
  - `tests/onboarding-ui.test.ts`
  - `docs/project/tasks/CEV-FULLAPP-103A.md`
  - `docs/project/handoffs/CEV-FULLAPP-103A-morgan.md`
  - `docs/project/PROJECT_STATUS.md`
- Acceptance criteria:
  1. Internal owner dashboard shows a readable client intake detail summary from saved onboarding data.
  2. Missing service area / never-promise style setup gaps are visible as next-step prompts without inventing data.
  3. Client Setup page gives clearer owner-facing instructions for what to fill out and what remains disabled.
  4. No SMS, email, external calendar write, automatic booking, payment collection, or dispatch automation is enabled.
  5. Meaningful UI tests, typecheck, lint, full tests, and production build pass.
- Required reviewers: Quality review recommended before full security acceptance because this is an internal client monitoring surface. No schema/shared contract change is planned.
- Evidence: Pending implementation verification.
- Result: Assigned and in progress.
