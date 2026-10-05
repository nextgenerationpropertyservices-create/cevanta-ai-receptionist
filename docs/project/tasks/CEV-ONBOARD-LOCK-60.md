# Onboarding configuration lock and concurrency contract

- Task ID: CEV-ONBOARD-LOCK-60.
- Owner: Atlas owns architecture/data/shared-contract planning. Morgan coordinates and accepts. Blake and Quinn review later implementation tasks; this task is design only.
- State: accepted with limitations.
- Scope: Define the lock/concurrency contract needed before settings, resume, exceptions, invitations or provider readiness can safely rely on onboarding configuration updates. Cover revision ownership, compare-and-swap expectations, request-reference replay, no-op behavior, stale-tab handling, concurrent section saves, retained history, receipt/audit/tombstone expectations, and how future UI/backend tasks must prove conflicts. Documentation only.
- Dependencies: CEV-ONBOARD-GAP-56 and CEV-ONBOARD-BACKEND-GAP-57 accepted with limitations; accepted migrations005/006 and onboarding RPC/backend evidence.
- Allowed files: docs/architecture/ONBOARDING_LOCK_CONTRACT.md; docs/project/handoffs/CEV-ONBOARD-LOCK-60-atlas.md. No other writes unless Morgan transfers ownership.
- Prohibited/shared files: No source code, migrations, SQL tests, package scripts, settings UI/action changes, provider settings, hosted database changes, credentials, external writers, production deployment or real customer data.
- Acceptance criteria: The contract gives future tasks a clear source of truth for revisions, same-request retries, stale writes, section interactions, no-op saves, allocation/replay uncertainty, and conflict messaging. It must identify required implementation evidence and where Blake/Nova/Quinn will need separate tasks. It must preserve tenant safety, RLS defense in depth and no-service-role ordinary request rules.
- Required evidence: Atlas handoff using docs/templates/AGENT_HANDOFF.md with files changed, checks/skips, limitations, risks, rollback notes and exact next action.
- Reviewers: Morgan accepts. Blake and Quinn review will be required when implementation tasks use this contract.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Use this contract to scope backend settings alignment and later UI/runtime concurrency evidence.
