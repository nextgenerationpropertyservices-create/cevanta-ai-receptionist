# Retell no-writer verified ingress prototype
- Task ID: CEV-RETELL-INGRESS-25.
- Owner: Blake owns backend implementation. Morgan coordinates and accepts. Atlas and Quinn review. Echo and Phoenix provide specialty review if assigned.
- State: accepted with limitations on 2026-10-03.
- Scope: Implement a local no-writer Retell post-call `call_analyzed` ingress prototype that verifies signatures against exact raw request bytes using test-only secrets, validates the minimum event envelope, normalizes only safe non-PII metadata needed for downstream review, and returns a safe response without writing to the database, Make, calendar, SMS, email, or any provider. This task must not connect the parent Make scenario.
- Dependencies: AGENTS.md, MEMORY.md, context/, docs/agents/COLLABORATION.md, docs/project/PROJECT_STATUS.md, docs/project/tasks/CEV-RETELL-TRUST-24.md, docs/project/handoffs/CEV-RETELL-TRUST-24-echo.md, docs/project/handoffs/CEV-RETELL-TRUST-24-morgan.md, docs/project/handoffs/CEV-RETELL-TRUST-24-atlas.md, docs/project/handoffs/CEV-RETELL-TRUST-24-quinn.md, official Retell signature documentation, installed Next.js route-handler docs.
- Allowed files: src/lib/integrations/contracts.ts if Atlas-approved compatibility changes are necessary; src/lib/integrations/retell-verifier.ts; src/app/api/integrations/retell/route.ts; tests/retell-ingress.test.ts; docs/project/handoffs/CEV-RETELL-INGRESS-25-blake.md; docs/project/handoffs/CEV-RETELL-INGRESS-25-atlas.md; docs/project/handoffs/CEV-RETELL-INGRESS-25-quinn.md; docs/project/handoffs/CEV-RETELL-INGRESS-25-echo.md; docs/project/handoffs/CEV-RETELL-INGRESS-25-phoenix.md.
- Prohibited/shared files: No migrations, database writes, Make/Retell/Twilio/Google provider settings, live calls, webhook URL changes, detected-value requests, SMS/email/calendar writes, production deployment, real secrets, real call payloads, transcripts, recordings, screenshots with private data, or logs containing raw request bodies.
- Acceptance criteria: The prototype verifies the original raw body and Retell signature with a fictional test secret in tests; rejects missing, malformed, stale, future and altered signatures; rejects unsupported event kinds, malformed JSON, oversized bodies, missing required call identity, missing configured secret and non-POST methods; never logs raw body, transcript, recording, phone number, address, webhook URL, or secret; returns a no-writer normalized result that clearly says no booking was created. Tests use fictional payloads only. No parent Make or booking acceptance is inferred.
- Required evidence: Blake handoff with files changed, implementation notes, official documentation consulted, verification commands/results, explicit skipped checks, limitations and next action. Quinn security review is required before Morgan accepts security-sensitive behavior. Atlas review is required for any shared contract changes.
- Reviewers: Atlas for event/contract compatibility and version/routing semantics if contracts change; Quinn for signature, replay, PII/logging and negative tests; Phoenix for environment/logging notes if route is intended for future hosting; Echo for provider semantics.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Scope CEV-RETELL-PROXY-26 to verify or isolate the full HTTP/proxy path for machine webhook traffic before any hosted callback, provider connection, durable receipt, or booking work.


## Coordinator acceptance — 2026-10-03

Decision: ACCEPTED WITH LIMITATIONS for a local, disabled-by-default, no-writer Retell `call_analyzed` ingress prototype only.

Evidence accepted:
- Blake implemented the verifier, route, focused tests, and handoff.
- Morgan reran the focused ingress suite: 56 tests passed.
- Morgan reran local type checking and lint for the touched files: passed with no errors.
- Atlas approved architecture with limitations in `docs/project/handoffs/CEV-RETELL-INGRESS-25-atlas.md`.
- Quinn passed security/quality with limitations in `docs/project/handoffs/CEV-RETELL-INGRESS-25-quinn.md`.

Acceptance boundary:
- Approved: exact raw-body signature verification, freshness checks, minimum event validation, safe no-writer response, no raw payload logging in inspected modules, default-off guard, and production-disabled guard.
- Not approved: live Retell compatibility, Make connection, hosted callback path, tenant routing, durable replay/dedupe, extraction/date/consent interpretation, availability, booking, SMS/email/calendar writes, production, or any use of real provider secrets.

Next gate:
- Full request-path/proxy behavior must be reviewed under a separate task before any hosted or provider-connected ingress test.
