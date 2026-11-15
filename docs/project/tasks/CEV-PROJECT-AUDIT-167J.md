# CEV-PROJECT-AUDIT-167J — Repair onboarding milestone audit writes

- **Owner:** Atlas (`architect_data`)
- **Status:** Assigned
- **Scope:** Add a forward-only migration that replaces the incompatible generic audit trigger on `public.client_onboarding_milestones` with a table-specific audit path using the row's stable `tenant_id` as the audit entity identifier. Add regression evidence proving authorized saves and audit recording work while existing RLS and tenant boundaries remain intact.
- **Dependencies:** CEV-PROJECT-AUDIT-167H architecture review and the confirmed embedded SQLSTATE `23502` reproduction.
- **Allowed files:**
  - one new additive migration under `supabase/migrations/` dated `20261026` and named for the milestone audit repair
  - `supabase/tests/client_onboarding_milestones.sql`
  - `scripts/test-db-embedded.mjs`
  - `docs/project/handoffs/CEV-PROJECT-AUDIT-167J-atlas.md`
- **Acceptance criteria:**
  1. An authorized client-workspace owner/admin can insert and update the legacy milestone progress row without the audit trigger causing a null `audit_events.entity_id` failure.
  2. Insert and update each create the expected coarse audit event using `tenant_id` as the stable entity identifier.
  3. `audit_events.entity_id` remains non-null and no existing authorization, RLS, tenant isolation, grants, or milestone status semantics are weakened.
  4. Unauthorized, forged-actor, and cross-tenant milestone writes remain denied by existing policy/tests.
  5. The migration is additive/forward-only, has an explicit fixed search path where applicable, and contains a safe recovery note in the handoff.
  6. Embedded milestone/database tests, typecheck, lint, and relevant regression tests pass.
  7. The milestone SQL regression file is executed by the maintained `test:db:embedded` path so future `pnpm check` and hosted CI runs cannot silently skip it.
- **Required reviewer:** Quinn (`quality_security`) must independently review the migration and evidence before Morgan accepts it.
- **Required evidence:** Exact SQLSTATE reproduction being removed, positive insert/update audit assertions, negative tenant/actor assertions, migration ordering, commands/results, and confirmation that no trusted launch status or provider side effect was introduced.

