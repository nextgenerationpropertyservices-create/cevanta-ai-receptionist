# Owner history and re-enable API contract

- Task ID: CEV-ONBOARD-HISTORY-68C.
- Owner: Atlas owns architecture/API contract design. Morgan coordinates. Blake, Nova and Quinn consume the resulting contract only after Morgan assigns follow-up implementation/review tasks.
- State: accepted with limitations.
- Scope: Create a documentation-only exact API contract for owner/admin retained setup history and re-enable flows after HISTORY68B bounded current projections. Define the future read contracts, pagination/filter fields, result limits, row identity rules, re-enable command behavior, privacy constraints and required tests for disabled services, disabled escalation contacts and inactive date exceptions. This task must not implement the API.
- Dependencies: CEV-ONBOARD-HISTORY-68A and CEV-ONBOARD-HISTORY-68B accepted with limitations.
- Allowed files: docs/architecture/ONBOARDING_HISTORY_API_CONTRACT.md; docs/project/handoffs/CEV-ONBOARD-HISTORY-68C-atlas.md.
- Prohibited/shared files: No source code, migrations, SQL tests, UI files, backend files, package scripts, provider settings, hosted database changes, credentials, real customer data, external writers or production deployment.
- Acceptance criteria: The contract defines owner/admin history projection shape, pagination/filtering, maximum page sizes, active/tombstone semantics, private contact handling, tenant-scoped row identity, re-enable behavior for retained services/contacts/date exceptions, lock/replay interaction, safe errors for foreign/unauthorized row IDs, and exact follow-up implementation/review tasks. It must preserve HISTORY68A/HISTORY68B/LOCK60 behavior and must not claim implementation or hosted verification.
- Required evidence: Atlas handoff using docs/templates/AGENT_HANDOFF.md with changed files, commands/results or explicit docs-only skipped checks, limitations, risks, rollback notes and exact next action.
- Reviewers: Morgan acceptance required. Quinn review is required later before implementation that exposes retained private contact history or new backend contracts.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Accepted by Morgan. Backend implementation, UI, Quinn review, hosted forward refresh and production gates remain separate tasks.
