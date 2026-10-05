# M5 final internal scope-draft contract

- Task ID: CEV-M5-CONTRACT-FINAL-34.
- Owner: Atlas owns final schema/shared-contract specification. Morgan coordinates and accepts. Blake, Nova and Quinn review after Atlas handoff before implementation.
- State: accepted with limitations on 2026-10-03.
- Scope: Finalize exact buildable contracts for the approved non-monetary first M5 slice: internal office scope drafts plus one active manual date-only follow-up. This is contract specification only. Include exact table fields, field limits, relationship constraints, indexes, RLS/grants, RPC/function ownership rules, read/list/detail projections, command input/result shapes, replay/idempotency behavior and retention, audit visibility, date/timezone behavior, lock order and required implementation test plan.
- Dependencies: AGENTS.md, MEMORY.md, context/, docs/agents/COLLABORATION.md, docs/project/PROJECT_STATUS.md, docs/product/ESTIMATES_FOLLOWUP_SCOPE.md, docs/project/tasks/CEV-M5-SCOPE-32.md, docs/project/tasks/CEV-M5-CONTRACT-33.md, and handoffs for CEV-M5-SCOPE-32 and CEV-M5-CONTRACT-33.
- Allowed files: docs/project/handoffs/CEV-M5-CONTRACT-FINAL-34-atlas.md only for Atlas. Morgan may update this task, docs/project/PROJECT_STATUS.md and context/NEXT_TASK.md. Reviewers will receive separate review handoff paths after Atlas completes.
- Prohibited/shared files: No migrations, schema files, source code, UI components, tests, package scripts, provider settings, hosted database changes, SMS/email/calendar writers, external provider calls, real customer data, pricing/tax defaults, customer delivery, acceptance, e-signature, payment, financing, production deployment or service-role ordinary request design.
- Recorded coordinator decisions: non-monetary internal scope drafts only; required customer anchor; optional same-customer job/location; office roles owner/admin/dispatcher only; technician/viewer/anonymous/removed/demoted users denied; one active date-only manual follow-up; no assignee; completed/cancelled follow-ups immutable; no external send/accept/payment/reminder/provider effects; monetary estimates remain blocked.
- Acceptance criteria: Atlas publishes a precise contract that implementation agents can follow without guessing. It must resolve the gaps from Blake, Nova and Quinn reviews: exact read shapes, command/result schemas, replay/idempotency and retention, function owner/grants/search_path, audit visibility, safe error categories, timezone/date rules, lock order, one-active follow-up enforcement, and SQL/backend/UI/security evidence needed for acceptance. It must keep monetary and external customer-facing features blocked.
- Required evidence: Atlas handoff using docs/templates/AGENT_HANDOFF.md with files reviewed, final contracts, unresolved blockers if any, risks, rollback notes and exact next action. No runtime checks are required for contract-only work, but skipped checks must be stated.
- Reviewers: Blake for backend command/transaction/replay fit; Nova for UI/read/conflict/date fit; Quinn for security/cross-module isolation/privacy/concurrency review. Morgan acceptance required before implementation tasks.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Atlas finalizes the exact buildable contract in docs/project/handoffs/CEV-M5-CONTRACT-FINAL-34-atlas.md. Morgan then assigns Blake, Nova and Quinn reviews.

## Coordinator acceptance — 2026-10-03

Decision: ACCEPTED WITH LIMITATIONS for final contract specification, including the CEV-M5-CONTRACT-CLARIFY-36 replay and lock-order clarification.

Evidence accepted: Atlas final contract; Blake, Nova and Quinn review35 handoffs; Atlas clarification36; Blake and Quinn clarification36 reviews.

Acceptance boundary: implementation may be scoped next, but no migration, SQL, source code, UI, hosted database change, provider connection, production deployment or external effect is accepted by this documentation task. Actual implementation requires disjoint tasks, Atlas migration/shared-type review, Quinn security/concurrency evidence and full checks.
