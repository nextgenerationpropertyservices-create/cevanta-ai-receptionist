# Live owner foreign-workspace denial check

- Task ID: CEV-AUTO-16-owner-denial
- Owner: Morgan — Product Manager and Orchestrator
- State: accepted for owner browser scope only
- Scope: Use existing private owner browser session to check known fictional foreign workspace CRM, Jobs and Calendar routes. Read-only; no token extraction or database writes.
- Dependencies: Signed-in session CEV-LIVE-15 and fictional seed foreign workspace ID.
- Allowed files: This task, docs/project/handoffs/CEV-AUTO-16-owner-denial.md, docs/project/handoffs/CEV-AUTO-16-owner-denial.png, docs/project/PROJECT_STATUS.md.
- Acceptance criteria: All three foreign workspace routes render explicit unavailable/denied state without records or edit controls; return to own workspace. Report this as owner browser evidence only, not all-role/direct JWT acceptance.
- Required evidence: Current page denial text and safe screenshot, no private identities or real records recorded.
- Reviewers: Morgan; Quinn's remaining direct/all-role matrix remains separate.
- Prohibited/shared files: App/tests/schema, memberships, credentials, source customer records.
- Branch/worktree or ownership fallback: Disjoint documentation ownership, no commit.
- Evidence: All three foreign routes rendered “We couldn’t open this page.” with Try again/Sign in and no records; server membership guard denied access. Safe screenshot in matching handoff PNG. Returned to own calendar; fictional rescheduled appointment persisted after final build and server restart.
- Exact next action: Prepare direct JWT and other-role checks separately; this result does not establish those criteria.
