# M5 internal estimates contract and schema design
- Task ID: CEV-M5-CONTRACT-33.
- Owner: Atlas owns schema/contract design. Morgan coordinates and accepts. Blake, Nova and Quinn review after Atlas handoff before implementation.
- State: accepted with limitations on 2026-10-03.
- Scope: Design the database/schema and shared contract plan for the approved first M5 slice: internal office-managed estimate drafts plus manual follow-up only. Include tenant-safe estimate aggregate, draft lifecycle, manual follow-up, parent relationships, revision/optimistic conflict model, audit boundary, RLS/grant approach, exact blockers for monetary/tax rules, and migration/test plan. This is design only unless Morgan later scopes implementation.
- Dependencies: AGENTS.md, MEMORY.md, context/, docs/agents/COLLABORATION.md, docs/project/PROJECT_STATUS.md, docs/product/ESTIMATES_FOLLOWUP_SCOPE.md, docs/project/tasks/CEV-M5-SCOPE-32.md, Atlas/Blake/Nova M5 scope handoffs, existing CRM/jobs/intake/calendar schema and RLS evidence.
- Allowed files: docs/product/ESTIMATES_FOLLOWUP_SCOPE.md if adding a contract section; docs/project/handoffs/CEV-M5-CONTRACT-33-atlas.md; docs/project/tasks/CEV-M5-CONTRACT-33.md and docs/project/PROJECT_STATUS.md for Morgan updates.
- Prohibited/shared files: No migrations, schema files, code, UI, tests, provider settings, SMS/email/calendar writers, real customer data, pricing/tax defaults, external sending, customer acceptance, e-signature, payment, financing, production deployment, or service-role ordinary request design.
- Acceptance criteria: Atlas produces a concrete contract design for internal drafts/manual follow-up only, with tenant-safe parent chains, role/RLS strategy, revision/audit/idempotency design, manual follow-up due-date semantics, and a migration/test plan. The design must explicitly leave currency, tax, external delivery, customer acceptance, automated reminders and revenue recovery blocked. It must not invent defaults.
- Required evidence: Atlas handoff with files reviewed, proposed tables/contracts, relationship invariants, RLS/grant strategy, audit/idempotency boundaries, migration/test plan, blockers, risks, rollback notes and exact next action.
- Reviewers: Blake for backend command fit after Atlas handoff; Nova for UX contract fit; Quinn for security/cross-module review before implementation. Atlas handoff is not acceptance.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: CEV-M5-CONTRACT-FINAL-34 is assigned to Atlas to publish exact buildable contracts before implementation.

## Coordinator acceptance — 2026-10-03

Decision: ACCEPTED WITH LIMITATIONS for design only.

Evidence accepted: Atlas produced the schema/contract plan; Blake approved backend command fit with limitations; Nova approved UX contract fit with limitations; Quinn passed security design boundaries with limitations.

Recorded implementation choices for the first slice:
- Build internal scope drafts, not priced estimates. Store title and bounded scope description only; do not store prices, totals, tax, payment, signatures, delivery, acceptance, or revenue recovery.
- Require a known customer anchor. Optional job and location links must match that customer and tenant. Lead-only and equipment links are deferred.
- Office roles only: owner, admin, and dispatcher may read and use approved draft/follow-up commands. Technician, viewer, anonymous, removed members, and demoted members may not read or mutate draft/follow-up content.
- Manual follow-up is date-only office work. Store `due_on` as a date, derive due/overdue from trusted workspace date/timezone, create no automated reminder, and do not write calendar/SMS/email/provider outcomes.
- Enforce one active scheduled follow-up per draft. No assignee in the first slice. Completed/cancelled follow-ups are immutable history.
- Use private replay/idempotency evidence or an equivalent reviewed guarantee before implementation. Browser clients must not read raw receipts, payload digests, private notes, or audit payloads.

Boundaries: no schema, source, UI, provider, hosted database, production, or external effect is accepted by this task. Monetary estimates remain blocked until currency, quantity/unit, precision, rounding, discount, tax, legal terms, delivery and acceptance rules are separately decided and reviewed.

Next gate: CEV-M5-CONTRACT-FINAL-34 asks Atlas to finalize the buildable contract details that reviewers identified as missing: exact read shapes, command/result schemas, receipt/replay retention, function owner/grants, audit visibility, lock order, date behavior, and implementation test plan.

