# CEV-PROJECT-AUDIT-167L — Use hardened Reactivation commands

- **Owner:** Blake (`backend_logic`)
- **Status:** Accepted with limitations after Backend repair and independent Quality review
- **Scope:** Update the existing Reactivation server actions to use the Architect-approved state-transition RPCs from CEV-PROJECT-AUDIT-167K instead of direct campaign/candidate status updates. Preserve current office roles, tenant scoping, user-visible behavior, and no-send boundaries.
- **Dependencies:** Accepted CEV-PROJECT-AUDIT-167K migration/RPC contract.
- **Allowed files:**
  - `src/app/actions/reactivation.ts`
  - focused Reactivation action tests under `tests/`
  - `docs/project/handoffs/CEV-PROJECT-AUDIT-167L-blake.md`
- **Acceptance criteria:**
  1. Campaign review transition and candidate approve/dismiss transitions use only the approved RPCs.
  2. Every action still authenticates the user, verifies tenant membership and an allowed office role before calling the RPC.
  3. Direct client-supplied tenant, role, actor, status, job, or appointment values cannot bypass the approved command contract.
  4. Errors are safe and preserve the existing no-message/no-external-calendar/no-payment/no-dispatch behavior.
  5. Focused permitted/denied/error tests, typecheck, lint, full Vitest, embedded Reactivation checks, and production build pass.
- **Required reviewer:** Quinn (`quality_security`) before acceptance or release.
- **Required evidence:** Exact RPC calls, positive/negative tests, no direct status-update search result, commands/results, limitations, and rollback instructions.

