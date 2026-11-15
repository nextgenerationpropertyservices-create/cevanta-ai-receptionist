# CEV-INVITE-CONT-169F — Lock-order and owner-only continuation repair

- **Owner:** Atlas (`architect_data`)
- **Status:** Accepted with limitations after CEV-INVITE-CONT-169D re-review
- **Scope:** Repair INV-2 and INV-3 from the 169D review inside the not-yet-hosted continuation migration. Use one documented lock order for exchange and acceptance, and enforce the product's owner-only invitation contract before any continuation creation or acceptance mutation. Do not broaden the server decoder or restore old paths.
- **Dependencies:** CEV-INVITE-CONT-169D findings; owner-only issuance and server/UI contract from 169B/169C.
- **Allowed files:**
  - `supabase/migrations/202610260005_invitation_continuations.sql`
  - `supabase/tests/invitation_continuations.sql`
  - `scripts/test-invitation-continuations-embedded.mjs`
  - `docs/project/handoffs/CEV-INVITE-CONT-169F-atlas.md`
- **Acceptance criteria:** Exchange and acceptance cannot form the identified continuation/advisory lock cycle; acceptance revalidates state after locks; non-owner historical invitations fail generically before continuation creation or membership/audit/receipt/invitation mutation; owner success/replay/atomicity tests still pass; no API role gains broader access.
- **Required reviewer:** Quinn recheck under CEV-INVITE-CONT-169D.
- **Required evidence:** Focused continuation suite, maintained onboarding suite, aggregate database suite, structural lock-order assertions, owner/non-owner mutation assertions, typecheck/focused lint where relevant, handoff, and explicit note that true hosted multi-connection evidence remains required. No hosted migration or deploy.

