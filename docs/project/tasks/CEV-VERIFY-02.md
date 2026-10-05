# CEV-VERIFY-02 — Development workspace owner setup

- Owner: Product Manager and Orchestrator; Quality/Security reviews the provisioning script.
- Scope: Prepare owner-only SQL Editor script linking the sole confirmed Auth user to the fictional demo workspace; restore local preview.
- Dependencies: Owner reports creating an Auth user; reviewed foundation already applied.
- Allowed files: Coordinator owns supabase/setup-development-owner.sql, this task, docs/project/handoffs/CEV-VERIFY-02.md. Reviewer owns only docs/project/OWNER_SETUP_REVIEW.md, docs/project/owner-setup-review.mjs and docs/project/handoffs/CEV-VERIFY-02-review.md; SQL read-only for reviewer.
- Acceptance criteria: Requires exact demo tenant and exactly one confirmed Auth user; refuses ambiguous identities and role promotion; no public provisioning function, stored credentials, or printed identities; safely repeatable for existing owner membership.
- Required evidence: Independent security review and isolated SQL transaction tests; local preview connectivity if started. Remote membership execution remains with owner.
- State: Quality-reviewed; seven isolated SQL scenarios passed. Owner reports successful hosted SQL execution. Local sign-in UI and anonymous redirect verified; real authenticated workspace access remains pending.
