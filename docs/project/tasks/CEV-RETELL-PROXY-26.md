# Retell machine-ingress proxy/request-path gate
- Task ID: CEV-RETELL-PROXY-26.
- Owner: Phoenix owns implementation and operations evidence. Morgan coordinates and accepts. Blake reviews backend route impact. Quinn reviews security. Atlas reviews if the request boundary becomes a shared contract decision.
- State: accepted with limitations on 2026-10-03.
- Scope: Verify or isolate the full local HTTP/proxy path for the Retell no-writer ingress route so synthetic machine webhook requests to `/api/integrations/retell` do not trigger unrelated user-auth/session refresh behavior before reaching the handler. Keep ordinary browser/user routes protected by the existing Supabase auth proxy. This task must use synthetic requests only and must not connect Retell, Make, Twilio, Google Calendar, SMS, email, or production.
- Dependencies: AGENTS.md, MEMORY.md, context/, docs/agents/COLLABORATION.md, docs/project/PROJECT_STATUS.md, docs/project/tasks/CEV-RETELL-TRUST-24.md, docs/project/tasks/CEV-RETELL-INGRESS-25.md, docs/project/handoffs/CEV-RETELL-INGRESS-25-blake.md, docs/project/handoffs/CEV-RETELL-INGRESS-25-atlas.md, docs/project/handoffs/CEV-RETELL-INGRESS-25-quinn.md, docs/project/handoffs/CEV-RETELL-INGRESS-25-morgan.md, installed Next.js proxy/middleware docs.
- Allowed files: src/proxy.ts; tests/retell-proxy-path.test.ts; docs/project/handoffs/CEV-RETELL-PROXY-26-phoenix.md; docs/project/handoffs/CEV-RETELL-PROXY-26-blake.md; docs/project/handoffs/CEV-RETELL-PROXY-26-quinn.md; docs/project/handoffs/CEV-RETELL-PROXY-26-atlas.md only if Atlas review is needed; docs/project/tasks/CEV-RETELL-PROXY-26.md and docs/project/PROJECT_STATUS.md for Morgan updates.
- Prohibited/shared files: Do not change Retell provider settings, Make scenarios, webhook URLs, Twilio, Google Calendar, SMS/email writers, database migrations, live environment values, production deployment, real webhook secrets, real call payloads, transcripts, recordings, screenshots with private data, or unrelated authentication behavior. Do not weaken user-route authorization to make this pass.
- Acceptance criteria: Synthetic tests prove `/api/integrations/retell` is excluded from Supabase auth/session proxy work before route dispatch, while at least one ordinary app route still uses the auth/session proxy when Supabase is configured. Tests must use fictional URLs/cookies only and must not need network or real Supabase. The implementation preserves raw request-body handling by avoiding body reads in the proxy. The route remains disabled by default and disabled in production. Required checks pass or are explicitly blocked.
- Required evidence: Phoenix handoff with files changed, installed Next.js docs consulted, verification commands/results, exact behavior before/after, any skipped checks, limitations and next action. Blake review must confirm backend route semantics are not weakened. Quinn review must confirm security boundaries and no broad auth bypass beyond the machine ingress route.
- Reviewers: Blake for backend route impact; Quinn for auth/session boundary and negative tests; Atlas only if the machine-ingress boundary becomes a shared architecture contract.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Scope a no-writer full-HTTP signed-request preservation task with synthetic payloads before any hosted callback, provider connection, tenant routing, durable receipt, or booking work.


## Coordinator acceptance — 2026-10-03

Decision: ACCEPTED WITH LIMITATIONS for synthetic local proxy/request-path isolation only.

Evidence accepted:
- Phoenix implemented the exact Retell ingress proxy exclusion, focused tests, and handoff.
- Phoenix corrected the stale MEMORY.md/context note in the handoff.
- Morgan reran the focused proxy plus ingress suite: 69 tests passed.
- Morgan reran local type checking and lint for the touched proxy/test files: passed with no errors.
- Blake approved backend impact with limitations in `docs/project/handoffs/CEV-RETELL-PROXY-26-blake.md`.
- Quinn passed security/quality with limitations in `docs/project/handoffs/CEV-RETELL-PROXY-26-quinn.md`.

Acceptance boundary:
- Approved: the exact local path `/api/integrations/retell` and trailing slash/query form avoid unrelated Supabase session proxy work; ordinary user/session routes and lookalike paths remain in the auth/session proxy; proxy code does not read, lock, clone, parse, or mutate request bodies; Retell ingress remains default-off and production-disabled.
- Not approved: live Retell compatibility, hosted reverse-proxy raw-byte preservation, real signed provider delivery, trusted tenant routing, durable replay/dedupe, extraction/date/consent interpretation, availability, booking, SMS/email/calendar writes, production, or any use of real provider secrets.

Next gate:
- A separate no-writer full-HTTP signed-request preservation task is required before any hosted callback or provider connection.
