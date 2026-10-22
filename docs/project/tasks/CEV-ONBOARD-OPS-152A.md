# Task CEV-ONBOARD-OPS-152A — Persisted onboarding milestones
- Owner: Morgan — Product Manager and Orchestrator
- State: reviewed and applied to hosted Supabase; application wiring remains gated by existing release checks
- Scope: Add tenant-scoped, owner/admin-controlled milestone records for payment, setup, test call, Retell mapping, Make mapping, and launch approval, with an internal Clients editor.
- Dependencies: Existing tenant memberships, managed client workspaces, audit trigger, Supabase migration workflow.
- Allowed files: `supabase/migrations/202610210001_client_onboarding_milestones.sql`, `supabase/tests/client_onboarding_milestones.sql`, `src/lib/onboarding-milestones.ts`, `src/lib/server/onboarding-milestones.ts`, `src/app/actions/onboarding-milestones.ts`, `src/app/workspaces/[tenantId]/clients/page.tsx`, `src/app/globals.css`, matching tests, this task record, matching handoff.
- Acceptance criteria: 1) milestone values are constrained and tenant-scoped; 2) RLS permits only owner/admin access; 3) internal Clients page reads and edits milestones with safe error handling when migration is unavailable; 4) saving milestones never activates a provider; 5) embedded RLS coverage exists.
- Required evidence: migration/security review, focused UI/action tests, typecheck, lint, migration test or explicit unavailable database evidence, and production build attempt.

## Review update (2026-10-21)

Coordinator review corrected two migration hardening points: the table now fails closed if it already exists instead of silently accepting a mismatched schema, and the `updated_by` foreign key has a covering index. Hosted application remains pending independent Architect/security approval.
