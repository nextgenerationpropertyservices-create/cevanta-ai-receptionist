# CEV-PROJECT-AUDIT-167N — Use tenant-safe job deletion command

- **Owner:** Blake (`backend_logic`), integrated by Morgan after the specialist turn hit its usage limit
- **Status:** Accepted locally with limitations; deployment and hosted proof pending
- **Scope:** Replace the impossible direct jobs-table delete in the job server action with the approved tenant-safe deletion command. Keep current authentication, office-role membership, revalidation, redirect, and safe linked-record error behavior.
- **Dependencies:** Accepted CEV-PROJECT-AUDIT-167M command contract.
- **Allowed files:**
  - `src/app/actions/jobs.ts`
  - `tests/jobs.test.ts`
  - `docs/project/handoffs/CEV-PROJECT-AUDIT-167N-blake.md`
- **Acceptance criteria:**
  1. `deleteJob` verifies the signed-in user and office-role tenant membership, validates both UUIDs, and calls only the approved RPC.
  2. The action no longer attempts direct table deletion.
  3. Success redirects and refreshes Jobs, Calendar, and Notifications as before.
  4. Missing, cross-tenant, unauthorized, already removed, and linked-record failures return safe non-secret messages without partial deletion.
  5. Focused positive/negative tests, typecheck, lint, full Vitest, jobs embedded suite, and production build pass.
- **Required reviewer:** Quinn (`quality_security`) before acceptance or release.
- **Required evidence:** RPC-call assertions, absence of direct delete calls, safe-error tests, commands/results, limitations, and rollback instructions.

