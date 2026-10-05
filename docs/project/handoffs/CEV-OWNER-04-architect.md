# Architect handoff

- Task ID: CEV-OWNER-04
- Work completed: Reviewed the targeted owner setup SQL and foundation constraints. Approved final source after coordinator added a row lock on the matching fictional tenant before membership checks. Exact case-insensitive, trimmed email lookup requires one confirmed account; placeholder and ambiguous/missing account fail. Existing non-owner membership is not promoted; another owner's membership is not replaced. The transaction is atomic and repeated execution for the same owner is idempotent.
- Files changed: docs/project/handoffs/CEV-OWNER-04-architect.md only. Coordinator owns the SQL file.
- Database changes: Reviewed helper inserts only one owner membership in the fictional HVAC tenant. No migration, grant, policy, public function, or RLS changes.
- API or contract changes: None.
- Verification commands and results: Read original prompt, collaboration rules, project status, assigned task, handoff template, targeted SQL, and foundation membership/tenant constraints using Get-Content and rg. Final source inspection PASS. Quality owns executable scenario tests; this review does not claim their results or hosted execution.
- Known limitations: Requires trusted development SQL Editor execution and private replacement of the email placeholder. A tenant row lock serializes this provisioning helper; independent administrator writes outside this flow remain trusted administrative operations. Hosted account selection and workspace access remain unverified here.
- Risks: The selected confirmed account receives owner privileges. Filled SQL must never be saved to source or shared logs. Use only the named fictional development tenant and the account actually used to sign in.
- Rollback notes: A failed execution rolls back all helper changes. To reverse a successful grant, a trusted administrator must remove only the exact newly inserted demo membership after verifying its tenant and user IDs; do not remove a preexisting owner membership.
- Exact next action: Coordinator collects Quality scenario evidence, then provides the placeholder SQL for private owner execution and verifies workspace access separately.
