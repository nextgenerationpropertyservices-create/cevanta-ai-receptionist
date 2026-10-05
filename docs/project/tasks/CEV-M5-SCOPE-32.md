# M5 estimates and follow-up scope discovery
- Task ID: CEV-M5-SCOPE-32.
- Owner: Morgan owns product scope and final synthesis. Atlas reviews data/contracts. Blake reviews backend workflow/security. Nova reviews UX flow. Quinn reviews if security-sensitive implementation is proposed. Morgan coordinates and accepts.
- State: accepted with limitations on 2026-10-03.
- Scope: Define the M5 estimates and follow-up workflow without implementation. Identify the minimum safe product scope, data model candidates, authorization boundaries, UI states, backend commands, audit needs, idempotency/follow-up behavior and owner decisions. Do not invent currency, tax, payment, delivery, e-signature, financing, automated messaging or legal terms. This is scope discovery only; no schema, code, UI or provider changes.
- Dependencies: AGENTS.md, MEMORY.md, context/, docs/agents/COLLABORATION.md, docs/project/PROJECT_STATUS.md, docs/business/CEVANTA_BUSINESS.md, existing CRM/jobs/calendar/intake task evidence and product prompts.
- Allowed files: docs/product/ESTIMATES_FOLLOWUP_SCOPE.md; docs/project/handoffs/CEV-M5-SCOPE-32-atlas.md; docs/project/handoffs/CEV-M5-SCOPE-32-blake.md; docs/project/handoffs/CEV-M5-SCOPE-32-nova.md; docs/project/handoffs/CEV-M5-SCOPE-32-quinn.md only if Quinn review becomes necessary; docs/project/handoffs/CEV-M5-SCOPE-32-morgan.md; docs/project/tasks/CEV-M5-SCOPE-32.md and docs/project/PROJECT_STATUS.md for Morgan updates.
- Prohibited/shared files: No code, migrations, database schema, UI components, package scripts, provider settings, SMS/email/calendar writers, real customer data, price/tax/legal assumptions, production deployment or external messages.
- Acceptance criteria: Specialist handoffs identify data/contracts, backend/security boundaries and UX flow/state needs. Morgan produces a scope document that labels confirmed requirements, assumptions, non-goals and owner decisions. It must keep implementation blocked until material business decisions are resolved and reviewed. No unapproved commercial terms or provider behavior may be presented as fact.
- Required evidence: Atlas, Blake and Nova handoffs with findings and blockers; Morgan synthesis document and handoff; PROJECT_STATUS update. Commands are optional unless files are edited beyond documentation, but all evidence must be fictional and non-sensitive.
- Reviewers: Atlas, Blake and Nova required for this scope task. Quinn required later before implementation or if security-sensitive follow-up automation is proposed.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Owner must choose the first estimates workflow. Recommended: internal drafts and manual follow-up first. After that, scope Atlas contract/schema task before implementation.


## Coordinator acceptance — 2026-10-03

Decision: ACCEPTED WITH LIMITATIONS for scope discovery only.

Evidence accepted: Atlas, Blake and Nova handoffs completed; Morgan synthesized docs/product/ESTIMATES_FOLLOWUP_SCOPE.md.

Acceptance boundary: approved requirements discovery and recommended first slice only. No implementation, schema, UI, delivery, acceptance, tax, payment, automated messaging, provider connection or writer is accepted.

Next gate: owner chooses first workflow, then Atlas schema/contracts task can be scoped.

