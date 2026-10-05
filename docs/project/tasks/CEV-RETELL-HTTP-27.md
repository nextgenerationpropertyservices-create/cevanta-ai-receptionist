# Retell full local HTTP signed-request preservation gate
- Task ID: CEV-RETELL-HTTP-27.
- Owner: Phoenix owns local HTTP smoke implementation and operations evidence. Blake reviews backend route behavior. Quinn reviews security/no-writer evidence. Morgan coordinates and accepts. Echo reviews provider semantics only if provider-shaped payload questions arise.
- State: accepted with limitations on 2026-10-03.
- Scope: Create and run a repeatable no-writer local HTTP smoke check that starts the app in local development mode with a fictional Retell secret and prototype opt-in, sends a synthetic signed `call_analyzed` POST to `/api/integrations/retell`, and proves the route returns `verified_not_persisted` with `persisted:false` and `bookingCreated:false` without session cookies or provider/database side effects. This task must not connect Retell, Make, Twilio, Google Calendar, SMS, email, hosted environments, production, or real secrets.
- Dependencies: AGENTS.md, MEMORY.md, context/, docs/agents/COLLABORATION.md, docs/project/PROJECT_STATUS.md, docs/project/tasks/CEV-RETELL-TRUST-24.md, docs/project/tasks/CEV-RETELL-INGRESS-25.md, docs/project/tasks/CEV-RETELL-PROXY-26.md, related task25/task26 handoffs, installed Next.js dev-server/route-handler docs.
- Allowed files: scripts/retell-http-smoke.mjs; docs/project/handoffs/CEV-RETELL-HTTP-27-phoenix.md; docs/project/handoffs/CEV-RETELL-HTTP-27-blake.md; docs/project/handoffs/CEV-RETELL-HTTP-27-quinn.md; docs/project/tasks/CEV-RETELL-HTTP-27.md and docs/project/PROJECT_STATUS.md for Morgan updates. Do not edit route, verifier, proxy, migrations, package scripts, provider config, or app UI unless Morgan creates a separate task.
- Prohibited/shared files: No Retell/Make/Twilio/Google settings, webhook URLs, detected-value requests, SMS/email/calendar/database writers, live provider payloads, real secrets, production build/start changes, deployment, or screenshots/logs with private data.
- Acceptance criteria: The smoke script uses a fictional secret and synthetic body only; signs the exact bytes the script sends using the same documented body-plus-timestamp HMAC algorithm; starts a local development server on loopback with prototype opt-in; posts through real HTTP; receives HTTP 200 with `status:"verified_not_persisted"`, `persisted:false`, `bookingCreated:false`; confirms no `Set-Cookie`; then sends at least one altered-body or stale-signature negative request that is rejected; stops the server. Evidence must show no database/provider/calendar/SMS/email writes and no production mode. If the local server cannot start, record the exact blocker without weakening guards.
- Required evidence: Phoenix handoff with files changed, docs consulted, smoke command/results, exact fictional request properties, positive and negative outcomes, server shutdown evidence, skipped checks, limitations and next action. Blake review must confirm backend route semantics and no-writer behavior. Quinn review must confirm security/no-secret/no-writer evidence and limitations.
- Reviewers: Blake for backend route behavior; Quinn for security/no-writer evidence; Echo only if provider payload semantics are changed or claimed.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Scope hosted/reverse-proxy raw-byte preservation and environment/logging/time/rate controls before any provider callback, trusted tenant routing, durable receipt, or booking work.


## Coordinator progress — 2026-10-03

Historical blocker resolved: Phoenix completed the script and handoff; Morgan independently inspected the script and reran verification. Blake and Quinn reviews were initially blocked because Codex reported the primary usage window at 100%, then completed after the usage window cleared. See coordinator acceptance below for the final decision.

Morgan verification evidence:
- Restricted run of `node scripts/retell-http-smoke.mjs`: positive and negative HTTP checks passed, but Windows process-tree cleanup failed; this run is not accepted as clean evidence. Morgan stopped the leftover task-owned session.
- Rerun of `node scripts/retell-http-smoke.mjs` with approved Windows process permission: PASS exit 0. Valid fictional signed request returned HTTP 200 with `verified_not_persisted`, `persisted:false`, `bookingCreated:false`, and no Set-Cookie. Invalid, altered-body, and stale-signature requests returned HTTP 401 rejected with no Set-Cookie. Task-owned server stopped and loopback port was released.
- `node --check scripts/retell-http-smoke.mjs`: PASS.
- `node node_modules/eslint/bin/eslint.js scripts/retell-http-smoke.mjs`: PASS.

Acceptance boundary remains unchanged: no Retell/Make/Twilio/Google connection, no SMS/email/calendar/database writer, no hosted callback, no production, no real secrets.


## Coordinator acceptance — 2026-10-03

Decision: ACCEPTED WITH LIMITATIONS for supervised synthetic local development HTTP preservation only.

Evidence accepted:
- Phoenix implemented the loopback-only smoke script and handoff.
- Morgan inspected the script and independently reran verification. The first restricted run passed HTTP checks but failed Windows cleanup and was recorded as failed evidence; the leftover task-owned session was stopped. The approved-permission rerun passed with clean server shutdown and port release.
- Morgan script checks passed: `node --check scripts/retell-http-smoke.mjs` and script ESLint.
- Blake approved backend/no-writer behavior with limitations in `docs/project/handoffs/CEV-RETELL-HTTP-27-blake.md`.
- Quinn passed security/process review with limitations in `docs/project/handoffs/CEV-RETELL-HTTP-27-quinn.md`.

Acceptance boundary:
- Approved: supervised local development HTTP smoke using a fictional signed Retell-like payload and fictional secret; positive request returns `verified_not_persisted` with no Set-Cookie; invalid, altered-body and stale-signature requests reject; route/proxy/source evidence remains no-writer; server cleanup is proven for the approved-permission run.
- Not approved: unattended interruption cleanup, OS-level network containment, hosted reverse-proxy raw-byte preservation, live Retell compatibility, Make connection, trusted tenant routing, durable replay/dedupe, extraction/date/consent interpretation, availability, booking, SMS/email/calendar/database writes, production, or any use of real provider secrets.

Next gate:
- Before any provider callback or hosted test, separately scope hosted preservation plus environment/logging/time/rate controls, then trusted tenant routing and durable receipt contracts with required reviews.
