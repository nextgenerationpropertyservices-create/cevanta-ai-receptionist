# Retell ingress request-budget controls
- Task ID: CEV-RETELL-BUDGET-29.
- Owner: Blake owns backend design/implementation and tests. Phoenix reviews operations/infrastructure fit. Quinn reviews security and abuse resistance. Atlas reviews only if shared contracts, storage, durable receipts, or hosted architecture change. Morgan coordinates and accepts.
- State: accepted with limitations on 2026-10-03.
- Scope: Design and, where safe locally, implement no-writer request-budget controls for the Retell ingress prototype before any hosted callback or provider connection. Focus on elapsed raw-body read deadline/cancellation behavior, oversized/chunked/slow request handling, safe 4xx/5xx responses without payload echo, and local rate/concurrency design that does not depend on client cookies or provider payload trust. Keep production disabled and ordinary runtime opt-in off unless tests explicitly use fictional local opt-in.
- Dependencies: AGENTS.md, MEMORY.md, context/, docs/agents/COLLABORATION.md, docs/project/PROJECT_STATUS.md, docs/project/tasks/CEV-RETELL-INGRESS-25.md, docs/project/tasks/CEV-RETELL-PROXY-26.md, docs/project/tasks/CEV-RETELL-HTTP-27.md, docs/project/tasks/CEV-RETELL-HOSTED-28.md, related handoffs, docs/ops/RETELL_HOSTED_READINESS.md, installed Next.js route-handler/runtime docs.
- Allowed files: src/app/api/integrations/retell/route.ts; src/lib/integrations/retell-verifier.ts only if necessary for typed constants/results; tests/retell-ingress.test.ts; tests/retell-budget.test.ts; docs/ops/RETELL_HOSTED_READINESS.md if updating the checklist; docs/project/handoffs/CEV-RETELL-BUDGET-29-blake.md; docs/project/handoffs/CEV-RETELL-BUDGET-29-phoenix.md; docs/project/handoffs/CEV-RETELL-BUDGET-29-quinn.md; docs/project/handoffs/CEV-RETELL-BUDGET-29-atlas.md only if Atlas review becomes necessary; docs/project/tasks/CEV-RETELL-BUDGET-29.md and docs/project/PROJECT_STATUS.md for Morgan updates.
- Prohibited/shared files: No Retell/Make/Twilio/Google settings, webhook URLs, detected-value requests, SMS/email/calendar/database writers, live provider payloads, real secrets, environment-file edits, deployment, DNS/domain changes, production activation, tenant routing, durable storage, or broad auth/proxy changes.
- Acceptance criteria: Synthetic local tests prove slow or never-ending body reads terminate within a documented local deadline; oversized and chunked bodies fail safely without raw body/log echo; request streams are cancelled where possible; invalid/malformed signatures still reject; valid fictional fast requests still return verified_not_persisted only in local opt-in; production remains disabled before body reads; no database/provider/calendar/SMS/email writes are introduced. If distributed rate/concurrency cannot be implemented safely without hosted infrastructure, document the exact blocker and next owner instead of inventing a false local guarantee.
- Required evidence: Blake handoff with files changed, docs consulted, design/implementation notes, verification commands/results, skipped/blocked checks, limitations and exact next action. Phoenix review must confirm operations/infrastructure limits are not overstated. Quinn review must confirm abuse/security/no-writer behavior. Atlas review is required before any shared contract, storage, or hosted architecture change.
- Reviewers: Phoenix for operational fit; Quinn for abuse/security/no-writer; Atlas only if shared architecture/contracts change.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Scope CEV-RETELL-ADMISSION-30 for infrastructure admission controls, edge/global rate/concurrency policy, trusted request identity, safe 429/retry behavior, and hosted topology before any hosted callback or provider connection.


## Coordinator acceptance — 2026-10-03

Decision: ACCEPTED WITH LIMITATIONS for local no-writer read-budget controls only.

Evidence accepted:
- Blake implemented a 5000ms total raw-body read deadline, abort/cancellation handling, safe 408 timeout response, and budget tests.
- Morgan reran 88 focused Retell tests, typecheck, and lint for changed backend/test files: all passed.
- Phoenix approved operations fit with limitations in `docs/project/handoffs/CEV-RETELL-BUDGET-29-phoenix.md`.
- Quinn passed security/abuse review with limitations in `docs/project/handoffs/CEV-RETELL-BUDGET-29-quinn.md`.

Acceptance boundary:
- Approved: local app-level total body-read deadline from reader acquisition; safe timeout/abort/oversize behavior; best-effort cancellation without awaiting arbitrary source promises; fast fictional signed requests still return no-writer success in local opt-in; production/default-off guards remain before reading.
- Not approved: hosted timing SLA, edge/socket/header/pre-handler buffering limits, event-loop preemption, distributed rate/concurrency protection, trusted admission identity, real provider delivery, tenant routing, durable replay/dedupe, availability, booking, SMS/email/calendar/database writes, deployment, or production.

Next gate:
- Scope infrastructure admission controls and hosted topology: edge/global request and concurrency limits, trusted request identity, safe 429/retry policy, and hosted candidate planning before any external callback test.
