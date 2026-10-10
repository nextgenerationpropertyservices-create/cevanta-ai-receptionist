# Task CEV-PILOT-LIVE-90A — Managed pilot live-readiness control

Owner: Morgan — Product Manager and Orchestrator
State: accepted with limitations

## Scope

Prepare the next safe step toward a live managed Cevanta HVAC receptionist pilot after Retell V9 was published. Record current provider state, verify the Retell/Make/Cevanta lead bridge checks, and define the exact gates before live lead creation is enabled.

## Dependencies

- AGENTS.md development contract.
- docs/project/PROJECT_STATUS.md.
- CEV-MAKE-CEVANTA-BRIDGE-85A bridge evidence.
- Retell phone number assigned to the current published pilot agent.
- Owner instruction to continue completing the pilot to fully live.

## Allowed files

- docs/project/tasks/CEV-PILOT-LIVE-90A.md
- docs/project/handoffs/CEV-PILOT-LIVE-90A-morgan.md
- docs/project/PROJECT_STATUS.md
- docs/project/OWNER_ATTENTION.md
- src/app/api/integrations/make/retell-lead/route.ts
- tests/make-retell-lead-ingress.test.ts

## Out of scope

- No secrets, webhook URLs, call recordings, transcripts, private customer information, or provider tokens.
- No SMS, email, calendar, payment, quote, dispatch, or automatic booking enablement.
- No lead-writer production switch without a clear owner-facing action gate.
- No paid Retell/Twilio/Make plan changes.

## Acceptance criteria

- Retell V9 production behavior is recorded without private payloads.
- The current bridge mode and missing live-writer gate are clear.
- Focused automated checks for Make/Retell lead ingress and writer behavior pass or failures are recorded.
- The next owner action is written in CURRENT STEP / WHY / DO THIS / SUCCESS LOOKS LIKE format.

## Evidence required

- Focused test command and result.
- Any external/provider behavior must be marked as owner-observed or provider-dashboard evidence, not local proof.

## Acceptance update — 2026-10-10

Accepted with limitations after the controlled live writer proof. The live Make scenario created exactly one fictional office-review lead in the production Cevanta workspace and a duplicate replay did not create a second lead. SMS, email, calendar writes, payments, quotes, dispatch and automatic booking remain disabled and out of scope.

Evidence:
- Commit `6f5e7fd` fixed optional Make bridge fields so missing email/phone values are omitted before the database writer.
- Vercel production deployment `24eLd4eoR6hWA5diqj6z1AKi5W6J` for commit `6f5e7fd` reached Ready on 2026-10-10 at 8:06 AM EDT.
- Make execution `8453565e1334497aaddebb50ad7e074b` returned HTTP200 from Cevanta with `status: lead_created`, `persisted: true`, `bookingCreated: false`.
- Supabase confirmed one fictional lead for call reference `call_live_writer_fictional_20261010_080652` in workspace `1cb2a226-84ef-4dcd-9976-5ce87dd3e449`.
- Duplicate replay execution `d012955ba93f49349be6c5180abde06d` returned the duplicate acknowledgement and Supabase still showed exactly one matching lead.
