# Legacy settings writer retirement

- Task ID: CEV-ONBOARD-SETTINGS-65C.
- Owner: Blake owns backend/application cleanup. Morgan coordinates. Quinn reviews before Morgan acceptance. Nova review is not required unless UI files change, which is prohibited for this task.
- State: accepted with limitations.
- Scope: Remove, retire or safely block the legacy updateTenantSettings writer so tenant name/trade/timezone writes cannot bypass the accepted onboarding settings lock/replay path. Preserve other workspace actions for customers, contacts, locations and equipment. Update focused security tests to prove the legacy settings writer no longer mutates tenant settings and that other workspace actions remain unaffected.
- Dependencies: CEV-ONBOARD-SETTINGS-65A and CEV-ONBOARD-SETTINGS-65B accepted with limitations.
- Allowed files: src/app/actions/workspace.ts; tests/security.test.ts; docs/project/handoffs/CEV-ONBOARD-SETTINGS-65C-blake.md. If implementation requires validation schema, Settings UI, onboarding settings action, package scripts, migrations, SQL tests or shared contracts, stop and ask Morgan for ownership transfer.
- Prohibited/shared files: No UI changes, no onboarding action changes, no migrations, no SQL tests, no package script changes, no provider settings, no hosted database changes, no credentials, no real customer data, no external writers and no production deployment.
- Acceptance criteria: updateTenantSettings must not perform direct tenant writes or bypass onboarding receipts/replay semantics. Existing non-settings workspace actions continue their previous tests and behavior. Tests must prove dispatcher/limited settings denial and owner settings direct legacy write no longer mutates the tenants table; tests must also preserve coverage for customer/contact/location/equipment behavior. Error copy must be safe and direct users toward the Setup/Settings lock-aware path without leaking internals.
- Required evidence: Blake handoff using docs/templates/AGENT_HANDOFF.md with changed files, commands/results, skipped checks, limitations, risks, rollback notes and exact next action. Run focused security tests and broader checks appropriate to the backend change.
- Reviewers: Quinn security/cross-module review required. Morgan acceptance required after review.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Move to persisted resume UI wiring and later browser/live evidence gates.
