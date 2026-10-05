# Retell host-capability and provider-retry discovery
- Task ID: CEV-RETELL-DISCOVERY-31.
- Owner: Phoenix owns host-capability/configuration discovery. Echo owns current provider retry/webhook policy discovery. Morgan coordinates and accepts. Blake, Quinn and Atlas review only if discovery produces a concrete implementation/topology/routing proposal.
- State: accepted with limitations on 2026-10-03.
- Scope: Perform read-only discovery needed after CEV-RETELL-ADMISSION-30. Phoenix records what can and cannot be known from the repository, CI, current hosting metadata, local config, and safe read-only app/tool state about candidate host controls. Echo verifies current Retell webhook delivery/retry/signature/timeout behavior from official/current sources only. This task must not choose a host, select numeric limits, create/link/purchase/deploy infrastructure, register callbacks, change provider settings, or add writers.
- Dependencies: AGENTS.md, MEMORY.md, context/, docs/agents/COLLABORATION.md, docs/project/PROJECT_STATUS.md, docs/project/tasks/CEV-RETELL-ADMISSION-30.md, docs/ops/RETELL_ADMISSION_PLAN.md, docs/ops/RETELL_HOSTED_READINESS.md, all accepted Retell handoffs.
- Allowed files: docs/ops/RETELL_DISCOVERY_31.md; docs/project/handoffs/CEV-RETELL-DISCOVERY-31-phoenix.md; docs/project/handoffs/CEV-RETELL-DISCOVERY-31-echo.md; docs/project/handoffs/CEV-RETELL-DISCOVERY-31-morgan.md; docs/project/tasks/CEV-RETELL-DISCOVERY-31.md and docs/project/PROJECT_STATUS.md for Morgan updates.
- Prohibited/shared files: No code, tests, route/verifier/proxy, package scripts, env files, migrations, provider settings, Make scenarios, webhook URLs, detected-value requests, host dashboards, DNS/domain settings, deployments, real secrets, live provider payloads, SMS/email/calendar/database writers, tenant routing, durable storage, or production activation.
- Acceptance criteria: Phoenix documents current host/config evidence and exact unknowns without inventing a candidate or limits. Echo documents current Retell policy with dated source links or records access blockers; official/current sources are required for retry/timeout/signature behavior. The combined discovery doc keeps hostedReady/providerConnectionAuthorized false, lists decisions still requiring owner approval, and names the next concrete task. No private URLs, secrets, customer data, transcripts or recordings appear in evidence.
- Required evidence: Phoenix handoff with files/configs inspected, commands/results, host capability findings and blockers. Echo handoff with official sources checked, policy findings, dates, source links, blockers and limitations. Morgan combines or cross-checks findings in docs/ops/RETELL_DISCOVERY_31.md if needed and records acceptance only for read-only discovery.
- Reviewers: Blake/Quinn/Atlas are not required unless discovery proposes implementation, topology, routing or shared contracts. If it does, stop and scope a reviewed task instead of accepting it here.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Scope the next no-writer gate around owner-authorized candidate host inspection or provider-policy clarification before any topology, limit, retry policy, callback, provider connection, routing, durable receipt, or writer is selected.


## Coordinator acceptance — 2026-10-03

Decision: ACCEPTED WITH LIMITATIONS for read-only discovery only.

Evidence accepted:
- Phoenix completed repository/configuration host-capability discovery in `docs/project/handoffs/CEV-RETELL-DISCOVERY-31-phoenix.md`.
- Echo completed official-source Retell retry/webhook policy discovery in `docs/project/handoffs/CEV-RETELL-DISCOVERY-31-echo.md`.
- Morgan combined findings in `docs/ops/RETELL_DISCOVERY_31.md`.

Acceptance boundary:
- Approved: repository-local host capability unknowns and official Retell policy findings; hostedReady/providerConnectionAuthorized remain false.
- Not approved: host choice, numeric limits, shared limiter, Retry-After policy, callback registration, provider connection, tenant routing, durable receipt, booking, SMS/email/calendar/database writers, deployment or production.

Next gate:
- A concrete owner-authorized nonproduction host candidate is needed for host-specific read-only capability inspection, while Echo/provider policy gaps remain blockers for retry and dedupe design.
