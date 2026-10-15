# Client onboarding access gate — CEV-CLIENT-ONBOARDING-GATE-123A

- Task ID: CEV-CLIENT-ONBOARDING-GATE-123A
- Owner: Morgan (coordinator)
- Scope: Keep client owner/admin workspaces in Setup until required business intake is complete; preserve unrestricted access for Cevanta internal workspaces and preserve limited-role authorization.
- Dependencies: Existing onboarding snapshot contract/RPC and managed client workspace account type.
- Allowed files: `src/lib/server/client-onboarding-gate.ts`, `src/lib/server/queries.ts`, `src/app/workspaces/[tenantId]/layout.tsx`, `src/app/workspaces/[tenantId]/onboarding/page.tsx`, `tests/client-onboarding-gate.test.ts`, this task file, and the matching handoff.
- Acceptance criteria:
  1. A client owner/admin with incomplete required setup is redirected to Setup when opening dashboard modules.
  2. The Setup route remains reachable and explains what is still required.
  3. A completed client setup is allowed through.
  4. Internal workspaces and non-owner/admin limited roles are not blocked by this client gate.
  5. Gate evaluation is derived from the verified tenant snapshot and never trusts a client-supplied tenant or readiness flag.
- Evidence: focused gate tests plus typecheck, lint, application tests, and production build result.
- Reviewers: Quinn review is required because this changes protected route access; Morgan owns acceptance.
