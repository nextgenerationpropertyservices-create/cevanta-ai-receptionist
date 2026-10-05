# Retained onboarding history and bounded projection contract

- Task ID: CEV-ONBOARD-HISTORY-68A.
- Owner: Atlas owns architecture/data design. Morgan coordinates. Blake, Nova and Quinn consume the resulting contract only after Morgan assigns follow-up implementation/review tasks.
- State: accepted with limitations.
- Scope: Create a documentation-only architecture contract for retained onboarding history and bounded read projections for setup services, weekly hours, date-specific hours exceptions, request preferences and escalation contacts. The contract must describe what history should be retained for audit/recovery, what the UI may show as bounded current-state projections, how config_revision/replay semantics are preserved, and what future migration or API work would be required.
- Dependencies: CEV-ONBOARD-GAP-56, CEV-ONBOARD-LOCK-60, CEV-ONBOARD-SETTINGS-65A/B/C, CEV-ONBOARD-RESUME-66A and CEV-ONBOARD-EXCEPTIONS-67A accepted with limitations.
- Allowed files: docs/architecture/ONBOARDING_HISTORY_CONTRACT.md; docs/project/handoffs/CEV-ONBOARD-HISTORY-68A-atlas.md.
- Prohibited/shared files: No source code, migrations, SQL tests, package scripts, UI files, backend files, provider settings, hosted database changes, credentials, real customer data, external writers or production deployment.
- Acceptance criteria: The document identifies current overwrite/projection limits, proposes a tenant-safe retained-history model, describes bounded projection rules for each setup area, preserves lock/replay semantics from ONBOARDING_LOCK_CONTRACT, states migration/API/UI implications, calls out privacy/security constraints, and lists clear follow-up tasks with required reviewers. It must not claim that the design is implemented or hosted-verified.
- Required evidence: Atlas handoff using docs/templates/AGENT_HANDOFF.md with changed files, commands/results or explicit docs-only skipped checks, limitations, risks, rollback notes and exact next action.
- Reviewers: Morgan acceptance required. Architect may self-author this design; Quinn review is required later before any implementation that changes migrations, shared contracts or cross-module behavior.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Accepted by Morgan. Follow-up bounded projection implementation, UI consumption and Quinn review remain separate tasks.
