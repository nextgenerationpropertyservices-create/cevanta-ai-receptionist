# M5 final contract replay and lock-order clarification

- Task ID: CEV-M5-CONTRACT-CLARIFY-36.
- Owner: Atlas owns contract clarification. Morgan coordinates and accepts. Blake reviews backend transaction fit. Quinn reviews security/concurrency acceptance. Nova is not required unless UI result semantics change.
- State: accepted with limitations on 2026-10-03.
- Scope: Resolve Quinn's CEV-M5-CONTRACT-REVIEW-35 clarification before implementation: specify one exact replay authorization, receipt target visibility/binding and tenant-lock/advisory-lock order for all six commands without allowing each RPC to invent a different order. This is documentation-only contract clarification.
- Dependencies: AGENTS.md, MEMORY.md, context/, docs/agents/COLLABORATION.md, docs/project/PROJECT_STATUS.md, docs/project/tasks/CEV-M5-CONTRACT-FINAL-34.md, docs/project/tasks/CEV-M5-CONTRACT-REVIEW-35.md, docs/project/handoffs/CEV-M5-CONTRACT-FINAL-34-atlas.md, docs/project/handoffs/CEV-M5-CONTRACT-REVIEW-35-blake.md and docs/project/handoffs/CEV-M5-CONTRACT-REVIEW-35-quinn.md.
- Allowed files: Atlas may write docs/project/handoffs/CEV-M5-CONTRACT-CLARIFY-36-atlas.md only. Blake may write docs/project/handoffs/CEV-M5-CONTRACT-CLARIFY-36-blake.md only. Quinn may write docs/project/handoffs/CEV-M5-CONTRACT-CLARIFY-36-quinn.md only. Morgan may update this task, docs/project/PROJECT_STATUS.md and context/NEXT_TASK.md. No other writes.
- Prohibited/shared files: No migrations, schema files, source code, UI components, tests, package scripts, provider settings, hosted database changes, SMS/email/calendar writers, external provider calls, real customer data, pricing/tax defaults, customer delivery, acceptance, e-signature, payment, financing, production deployment or service-role ordinary request design.
- Acceptance criteria: Atlas publishes one precise command transaction sequence that distinguishes replay from new work without reversing the global lock order. It must define tenant row locking, timezone validation timing, request/submission advisory locks, receipt lookup, receipt target visibility/binding for create/update/follow-up commands, current authorization before replay, stale-version/date-domain checks skipped on replay, and any differences between creation and existing-target commands. It must keep errors safe and preserve the non-monetary/internal-only scope.
- Required evidence: Atlas handoff using docs/templates/AGENT_HANDOFF.md with the exact clarified sequence, files reviewed, limits, risks, rollback notes and exact next action. Runtime checks are not required for documentation-only work, but skipped checks must be stated.
- Reviewers: Blake reviews backend transaction/replay fit; Quinn reviews security/concurrency acceptance. Morgan acceptance required before implementation tasks.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Blake and Quinn review docs/project/handoffs/CEV-M5-CONTRACT-CLARIFY-36-atlas.md and write their assigned handoffs.


## Coordinator acceptance — 2026-10-03

Decision: ACCEPTED WITH LIMITATIONS. Atlas clarified one replay authorization and lock-order sequence for all six commands. Blake and Quinn both passed the clarification with limitations.

Implementation requirement: all future M5 implementation tasks must reference both docs/project/handoffs/CEV-M5-CONTRACT-FINAL-34-atlas.md and docs/project/handoffs/CEV-M5-CONTRACT-CLARIFY-36-atlas.md. Implementers must preserve current authorization before replay, unconditional tenant lock before request advisory locks, exact receipt target binding, safe skipped/replayed domain checks, private receipt denial and no additional audit/write on replay.

Acceptance boundary: no SQL/source/runtime behavior is accepted yet. Required future evidence includes real SQL/RPC/grant/RLS checks, multi-connection concurrency tests, role/tenant negative tests, audit/receipt rollback tests, typecheck, lint, meaningful tests, production build and affected browser flows.
