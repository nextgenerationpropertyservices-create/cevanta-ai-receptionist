# Development owner setup security review

Task: CEV-VERIFY-02. Reviewer: Quality and Security Agent. Date: 2026-10-02.

Review outcome: PASS for the bounded development SQL Editor provisioning flow. No actionable security finding in this change. Coordinator acceptance and hosted sign-in verification remain separate.

The script executes an anonymous transaction block, creates no public RPC or SECURITY DEFINER function, requires one Auth account with a confirmation timestamp, checks the exact fictional tenant identifier and name, refuses non-owner role promotion, and inserts an owner membership only in Demo HVAC. Repeat execution preserves the existing owner row. Error messages disclose no account identifiers or credentials. Source and test output contain only synthetic fixtures; no real emails, passwords, tokens, or customer records were used.

Reproduction: from the repository root, run `node docs/project/owner-setup-review.mjs`. It creates a fresh in-memory PGlite database, installs a minimal Auth compatibility fixture, and executes the actual foundation migration, fictional seed, and owner setup SQL. No hosted database is contacted.

Verification command exit code: 0. Seven scenarios passed:

1. One confirmed account receives exactly one Demo HVAC owner membership and no Demo Plumbing membership.
2. Repeating setup leaves exactly one membership.
3. Zero accounts raises the expected refusal and creates no membership.
4. Two accounts raises the expected refusal and creates no membership.
5. Unconfirmed account raises the expected refusal and creates no membership.
6. Existing viewer membership raises the role-promotion refusal and stays viewer.
7. Changing the expected tenant name raises the tenant-validation refusal and creates no membership.

Limitations: embedded SQL tests use an Auth compatibility fixture, not Supabase Auth/JWT/PostgREST. Hosted SQL execution, authenticated browser writes, and live tenant isolation were not executed by this reviewer. Typecheck, lint, application tests and production build were not rerun for this SQL/document-only review; application acceptance retains the existing mandatory gates. Webhooks are outside this provisioning change. The script must remain a deliberate administrator SQL Editor operation in the new development project; it chooses the sole confirmed user rather than accepting an account supplied by an untrusted request.

Rollback: the script wraps changes in a transaction, so any refusal aborts them. For an unintended successful development assignment, the project administrator must remove only the specifically verified membership; this review performed no remote change.

Next action: Coordinator integrates this review and Architect approval, then instructs the owner to run supabase/setup-development-owner.sql once in the development project's SQL Editor. Verify authenticated application access afterward.
