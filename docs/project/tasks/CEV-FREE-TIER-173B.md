# CEV-FREE-TIER-173B — Free tier backend enforcement

- Status: ready after CEV-FREE-TIER-173A approval
- Owner: Blake (`backend_logic`)
- Scope: Implement the approved plan contract, tenant-scoped reads, secure provisioning default, and mutation limits for free workspaces.
- Dependencies: CEV-FREE-TIER-173A approved contract.
- Allowed files:
  - `supabase/migrations/202610310001_workspace_plans.sql`
  - `src/lib/workspace-plans.ts`
  - `src/lib/contracts.ts`
  - `src/lib/server/workspace-plan-queries.ts`
  - `src/lib/server/queries.ts`
  - `src/app/actions/workspace.ts`
  - `src/app/actions/intake.ts`
  - `src/app/actions/technician-roster.ts`
  - `tests/workspace-plans.test.ts`
  - `tests/workspace-plans-db.test.ts`
  - `tests/intake.test.ts`
  - `tests/technician-roster-actions.test.ts`
  - `scripts/test-workspace-plans-embedded.mjs`
  - `docs/project/handoffs/CEV-FREE-TIER-173B-blake.md`
- Acceptance criteria:
  - Plan state is tenant-scoped and cannot be selected or changed by an unauthorized user.
  - New self-service workspaces receive the approved free plan; existing workspaces retain the approved compatibility default.
  - Free lead and technician limits are enforced server-side and through database defense in depth where the contract requires it.
  - Limit errors are safe and actionable; no provider or billing side effects are introduced.
  - Positive, denied, cross-tenant, and limit-boundary tests pass.
- Reviewers: Atlas contract review; Quinn security review.
- Required evidence: migration tests, focused server tests, typecheck/lint/build results, handoff using the project template.

