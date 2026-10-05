# Retell infrastructure admission and hosted topology plan
- Task ID: CEV-RETELL-ADMISSION-30.
- Owner: Phoenix owns infrastructure/admission planning and operations evidence. Blake reviews backend fit. Quinn reviews abuse/security boundaries. Atlas reviews architecture if trusted identity, shared limiter state, durable receipt, or hosted topology choices become a contract. Morgan coordinates and accepts.
- State: accepted with limitations on 2026-10-03.
- Scope: Produce a no-writer infrastructure admission plan before any hosted callback or provider connection. Define the required hosted topology, trusted request identity source, edge/global request-rate and concurrency controls, safe 429/retry behavior, buffering/body/header assumptions, observability/logging redaction gates, kill switch, and exact blockers. This task is planning/readiness only; do not deploy, configure a host, register callbacks, change DNS, connect Retell/Make/Twilio/Google, or add writers.
- Dependencies: AGENTS.md, MEMORY.md, context/, docs/agents/COLLABORATION.md, docs/project/PROJECT_STATUS.md, docs/project/tasks/CEV-RETELL-HOSTED-28.md, docs/project/tasks/CEV-RETELL-BUDGET-29.md, docs/ops/RETELL_HOSTED_READINESS.md, related Retell handoffs, current CI workflow and hosting metadata inventory.
- Allowed files: docs/ops/RETELL_ADMISSION_PLAN.md; docs/ops/RETELL_HOSTED_READINESS.md if cross-linking the gate; scripts/retell-admission-readiness.mjs; tests/retell-admission-readiness.test.ts; docs/project/handoffs/CEV-RETELL-ADMISSION-30-phoenix.md; docs/project/handoffs/CEV-RETELL-ADMISSION-30-blake.md; docs/project/handoffs/CEV-RETELL-ADMISSION-30-quinn.md; docs/project/handoffs/CEV-RETELL-ADMISSION-30-atlas.md only if Atlas review becomes necessary; docs/project/tasks/CEV-RETELL-ADMISSION-30.md and docs/project/PROJECT_STATUS.md for Morgan updates.
- Prohibited/shared files: No Retell/Make/Twilio/Google settings, webhook URLs, detected-value requests, SMS/email/calendar/database writers, live provider payloads, real secrets, environment-file edits, deployment, DNS/domain changes, production activation, route/verifier/proxy changes, package script changes, tenant routing, durable storage, or hosted infrastructure mutation.
- Acceptance criteria: The plan must keep hostedReady/providerConnectionAuthorized false; identify that no committed host destination exists; specify required future owner approval for a no-writer hosted environment; define safe admission goals without inventing live limits; name blockers for trusted client identity, forwarded IP/header trust, shared limiter storage/topology, per-instance backlog limits, safe 429 body, provider retry compatibility, log redaction/retention, kill switch and recovery. Any automated check must be offline only and use fictional values. If limits cannot be selected without an actual host/provider policy, record the blocker rather than guessing.
- Required evidence: Phoenix handoff with files changed, configs/docs inspected, commands/results, admission plan summary, skipped/blocked checks, limitations and exact next action. Blake review must confirm backend fit and no route semantics are overstated. Quinn review must confirm abuse/security boundaries and no false readiness. Atlas review is required if a chosen topology/shared-state contract is proposed rather than blocked.
- Reviewers: Blake for backend fit; Quinn for abuse/security/no-writer; Atlas only for architecture/shared contracts if needed.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Scope read-only host-capability and provider-retry discovery with Phoenix and Echo before selecting any hosted topology, numeric limits, retry policy, callback, provider connection, or writer.


## Coordinator acceptance — 2026-10-03

Decision: ACCEPTED WITH LIMITATIONS for planning only.

Evidence accepted:
- Phoenix produced the no-writer infrastructure admission plan and handoff.
- Morgan reran offline inventory, 88 focused Retell tests, and typecheck: passed. Markdown ESLint was ignored by project configuration and is not counted as meaningful Markdown lint.
- Blake approved backend fit with limitations in `docs/project/handoffs/CEV-RETELL-ADMISSION-30-blake.md`.
- Quinn passed abuse/security plan review with limitations in `docs/project/handoffs/CEV-RETELL-ADMISSION-30-quinn.md`.

Acceptance boundary:
- Approved: planning requirements for trusted ingress boundary, pre-verification caps, forwarded identity trust, global/local admission, store outage behavior, safe 429/retry policy, logging, kill switch and recovery; no fake numeric limits or host choices selected; hostedReady/providerConnectionAuthorized remain false.
- Not approved: any implementation, deployment, host selection, shared limiter state, trusted identity contract, numeric limits, provider retry policy, callback registration, real provider connection, tenant routing, durable receipt, availability, booking, SMS/email/calendar/database writes, or production.

Next gate:
- Read-only discovery: Phoenix inventories candidate host/control capabilities if an authorized candidate exists; Echo verifies current provider retry policy from official/current sources; then Atlas/Quinn review any concrete topology/shared identity/state proposal.
