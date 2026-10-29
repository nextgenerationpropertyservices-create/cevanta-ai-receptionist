# CEV-INVITE-CONT-169E — Retired invitation-command test alignment

- **Owner:** Atlas (`architect_data`)
- **Status:** Accepted with limitations after CEV-INVITE-CONT-169D re-review
- **Scope:** Repair the maintained onboarding command SQL suite so it treats the old raw-token invitation acceptance RPC as revoked and relies on the dedicated continuation suite for the new invitation flow. Do not weaken grants, restore the retired path, or change application behavior.
- **Dependencies:** CEV-INVITE-CONT-169A migration and the release-blocking finding from CEV-INVITE-CONT-169D.
- **Allowed files:**
  - `supabase/tests/onboarding_commands.sql`
  - `docs/project/handoffs/CEV-INVITE-CONT-169E-atlas.md`
- **Acceptance criteria:** Maintained onboarding suite no longer expects or calls authenticated raw-token acceptance after migration 005; it positively asserts revocation; dedicated continuation coverage remains intact; aggregate database tests pass.
- **Required reviewer:** Quinn recheck under CEV-INVITE-CONT-169D.
- **Required evidence:** Focused onboarding command suite, focused continuation suite, aggregate database suite, diff/claim scan, handoff, no hosted migration, and no deploy.

