# CEV-CLIENT-OPERATOR-ACCESS-126A — Internal review access during client setup

Status: implemented
Owner: Morgan — Product Manager and Orchestrator
Scope: Keep client owners/admins in guided Setup while allowing an authorized Cevanta internal owner/admin to review a managed client workspace before setup is complete.
Dependencies: Existing memberships and `managed_client_workspaces` RLS relation.
Allowed files: `src/lib/server/client-onboarding-gate.ts`, `src/lib/server/queries.ts`, `tests/client-onboarding-gate.test.ts`, this task record, and the matching handoff.
Acceptance criteria: Internal operator access is verified through the authenticated user's internal membership and managed-client relation; unrelated client owners remain locked until Setup is complete; no provider automation is enabled.
Required evidence: focused gate/route tests, typecheck, lint, and preview verification.
