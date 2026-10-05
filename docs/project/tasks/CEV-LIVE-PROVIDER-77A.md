# CEV-LIVE-PROVIDER-77A — Retell/Make/Twilio live readiness setup

Owner: Morgan — Product Manager and Orchestrator
Status: blocked on owner/provider access as of 2026-10-05

## Scope

Prepare the live-provider path for the first AI receptionist pilot using Retell, Make and the owner's existing Twilio number, while keeping unsafe side effects disabled until explicit approval and provider prerequisites are ready.

## Dependencies

- CEV-VOICE-74A Retell lead-ingestion route and hosted schema.
- CEV-SETUP-BROWSER-76A fresh workspace setup proof.
- CEV-ROLE-PRIVACY-76B role-privacy automated evidence.
- Owner-stated provider setup: Retell AI, Make.com and an individual Twilio number; Twilio business registration is not complete.

## Allowed files

- `docs/project/tasks/CEV-LIVE-PROVIDER-77A.md`
- `docs/project/handoffs/CEV-LIVE-PROVIDER-77A-morgan.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `docs/project/PROJECT_STATUS.md`
- `MEMORY.md`

## Acceptance criteria

- Identify what can be tested now versus what is blocked by provider access, secrets, registration or production approval.
- Keep SMS, email, external calendar writes, always-on Make activation and production deployment blocked unless separately approved.
- Verify the local Retell endpoint fails safely when writer prerequisites are incomplete.
- Record the exact owner actions required to continue.
- Do not store provider secrets, webhook URLs, call recordings, transcripts or real customer data.

## Evidence

- Owner confirmed they have a Twilio number as an individual account and Twilio business registration is still pending.
- Retell dashboard opened in the in-app browser on 2026-10-05, confirming the account session is accessible for inspection. Phone-number page exposed only shell/sidebar state during this pass, so routing was not verified.
- Make opened to the sign-in page on 2026-10-05, so scenario inspection or dry-run execution is blocked until owner signs in.
- `.env.local` key presence check showed `RETELL_INGRESS_PROTOTYPE`, `RETELL_INGRESS_TEST_SECRET`, `RETELL_INGRESS_LEAD_WRITER` and `RETELL_INGRESS_CONNECTION_ID` are present, but `SUPABASE_SERVICE_ROLE_KEY` is missing.
- Fictional signed local Retell-style HTTP request returned HTTP 503 with `{ status: "retryable_failure", persisted: false, bookingCreated: false }`, proving safe failure with no lead write and no booking when writer prerequisites are incomplete.

## Current provider decision

- Retell/Make dry run: next useful action after Make sign-in.
- Retell to Cevanta local HTTP writer: blocked until server-only `SUPABASE_SERVICE_ROLE_KEY` is added to `.env.local` and the dev server is restarted.
- Twilio voice routing: can be prepared for controlled test after Retell phone/SIP routing is confirmed, but is not proven yet.
- Twilio SMS: blocked for business use until the owner completes the proper A2P/Sole Proprietor or business registration path.
- Production: not approved.

## Known limitations

- No real Retell call, Make scenario run, Twilio inbound call, SMS, email, calendar write, production write or production deploy occurred in this task.
- Make is inaccessible until the owner signs in.
- The local app endpoint is not publicly reachable by Retell without a tunnel or hosted deployment, and production deployment still requires explicit approval.
- Service-role key must stay server-only and must not be pasted into chat or committed.
