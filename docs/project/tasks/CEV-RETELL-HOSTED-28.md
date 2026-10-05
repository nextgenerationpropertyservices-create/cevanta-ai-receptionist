# Retell hosted-path readiness and environment controls
- Task ID: CEV-RETELL-HOSTED-28.
- Owner: Phoenix owns operations/readiness implementation and evidence. Blake reviews backend route impact. Quinn reviews security/no-writer controls. Atlas reviews only if a shared contract, tenant-routing, durable receipt, or hosted architecture decision is introduced. Morgan coordinates and accepts.
- State: accepted with limitations on 2026-10-03.
- Scope: Prepare and verify the no-writer hosted-path readiness controls needed before any real provider callback or hosted callback test. This is not a deployment task. Inspect current local hosting/runtime configuration, document the exact hosted-path gates, and add repeatable checks where possible for environment safety, logging redaction, request timeout/rate-limit readiness, reverse-proxy/raw-byte assumptions, and production/default-off guard preservation. Keep the Retell route disabled in ordinary and production runtime. Do not connect Retell, Make, Twilio, Google Calendar, SMS, email, database writers, hosted callbacks, or production.
- Dependencies: AGENTS.md, MEMORY.md, context/, docs/agents/COLLABORATION.md, docs/project/PROJECT_STATUS.md, docs/project/tasks/CEV-RETELL-TRUST-24.md, docs/project/tasks/CEV-RETELL-INGRESS-25.md, docs/project/tasks/CEV-RETELL-PROXY-26.md, docs/project/tasks/CEV-RETELL-HTTP-27.md, related task25/task26/task27 handoffs, installed Next.js deployment/runtime/proxy/route-handler docs, existing CI workflow if relevant.
- Allowed files: scripts/retell-hosted-readiness.mjs; tests/retell-hosted-readiness.test.ts; docs/ops/RETELL_HOSTED_READINESS.md; docs/project/handoffs/CEV-RETELL-HOSTED-28-phoenix.md; docs/project/handoffs/CEV-RETELL-HOSTED-28-blake.md; docs/project/handoffs/CEV-RETELL-HOSTED-28-quinn.md; docs/project/handoffs/CEV-RETELL-HOSTED-28-atlas.md only if Atlas review becomes necessary; docs/project/tasks/CEV-RETELL-HOSTED-28.md and docs/project/PROJECT_STATUS.md for Morgan updates.
- Prohibited/shared files: No Retell/Make/Twilio/Google settings, webhook URLs, detected-value requests, SMS/email/calendar/database writers, live provider payloads, real secrets, environment-file edits, production build/start changes, deployment, DNS/domain changes, or screenshots/logs with private data. Do not edit route/verifier/proxy/package scripts unless Morgan creates a separate implementation task after review.
- Acceptance criteria: The task produces a concrete readiness document and, where feasible without deployment, automated checks that show: ordinary production runtime remains disabled without provider connection; local scripts use fictional values only; current repo lacks a committed hosting destination and therefore cannot claim hosted raw-byte preservation yet; no logs or docs contain real secrets/webhook URLs/customer data; any proposed hosted callback test is blocked behind explicit owner approval and a later no-writer hosted environment task; timeout/rate/read-size/logging risks are listed with exact next actions. Checks must pass or blockers must be recorded without weakening route protections.
- Required evidence: Phoenix handoff with files changed, docs/config inspected, commands/results, concrete hosted-readiness checklist, skipped/blocked checks, limitations and exact next action. Blake review must confirm backend route/guard semantics are not weakened. Quinn review must confirm no-secret/no-writer and hosted-readiness safety boundaries.
- Reviewers: Blake for backend impact; Quinn for security/readiness evidence; Atlas only if shared hosted event/durable routing contracts are proposed.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Scope CEV-RETELL-BUDGET-29 for elapsed-read, cancellation, and rate/concurrency design/tests before any hosted callback, provider connection, tenant routing, durable receipt, or booking work.


## Coordinator acceptance — 2026-10-03

Decision: ACCEPTED WITH LIMITATIONS for offline hosted-readiness preparation only.

Evidence accepted:
- Phoenix added offline inventory, readiness tests, operations readiness guide, and handoff.
- Morgan reran the inventory, syntax check, 78 focused Retell tests, typecheck, and lint for new files: all passed.
- Blake approved backend guard/readiness with limitations in `docs/project/handoffs/CEV-RETELL-HOSTED-28-blake.md`.
- Quinn passed security/no-writer readiness with limitations in `docs/project/handoffs/CEV-RETELL-HOSTED-28-quinn.md`.

Acceptance boundary:
- Approved: offline readiness inventory and documentation; production/default-off/read-size/no-console sentinels; tests that production remains disabled, development remains default-off, and fictional sensitive failure bodies are not echoed or console-logged; explicit documentation that hostedReady and providerConnectionAuthorized remain false.
- Not approved: any deployment, hosted callback, live Retell/Make connection, real secrets, hosted raw-byte preservation, elapsed-read cancellation, rate/concurrency controls, platform/APM log redaction, hosted CI/restore evidence, tenant routing, durable replay/dedupe, availability, booking, SMS/email/calendar/database writes, or production.

Next gate:
- Scope elapsed-read/cancellation and rate/concurrency design/tests for the Retell ingress before any hosted/provider work.
