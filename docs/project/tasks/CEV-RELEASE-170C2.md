# CEV-RELEASE-170C2 — Hosted migration preflight

- **Owner:** Atlas (`architect_data`)
- **Status:** Assigned
- **Scope:** Read-only preflight for migration `202610260005_invitation_continuations.sql` against the confirmed Cevanta Supabase project. Check project identity, migration state, required predecessor objects/contracts, safety, and exact post-apply verification queries. Do not apply the migration.
- **Dependencies:** Accepted migration/contract reviews through CEV-INVITE-CONT-169F and CEV-RELEASE-170B5.
- **Allowed files:** `docs/project/handoffs/CEV-RELEASE-170C2-atlas.md` only.
- **Acceptance criteria:** Project identity and current migration state recorded; no destructive/unreviewed statement; prerequisites and grants/RLS/security-definer posture checked; exact apply name/query and post-apply checks approved or blocked with reason.
- **Required evidence:** Read-only project/migration/schema/advisor results, decision, limitations, rollback/repair-forward guidance, and no-apply statement.

