# Cevanta memory

Date: 2026-10-03, America/New_York.
Coordinator: Morgan, Product Manager and Orchestrator.

This file is the shared memory bridge for Cevanta agents. It stores project facts that are safe to keep in the repository. Do not add credentials, webhook URLs, calendar IDs, provider account IDs, phone numbers, private inboxes, real customer information, transcripts, recordings, or screenshots containing private data.

## Owner intent

The owner wants Cevanta built as a multi-tenant CRM and AI voice receptionist business. Morgan coordinates the work, uses the existing named specialist chats, gives them clear ownership, verifies their handoffs, and only brings the owner in for material business decisions, live access, production activation, purchases, or irreversible actions.

The owner uses Twilio, Retell AI, Make.com and Google Calendar. Existing Make/Retell workflows must be preserved unless a task explicitly authorizes a separate safe draft or read-only inspection.

The owner approved one-hour appointments for the current appointment-validation work.

## Safety rules to remember

- Never store secrets or real customer information in source, fixtures, logs, screenshots, task files, handoffs, or this memory file.
- Do not connect live booking, SMS, email, calls, production deployment, or external writes without explicit scoped authorization and verified evidence.
- Keep Retell/Make parent workflows inactive or blocked until provenance, tenant routing, trusted time, dedupe, availability, confirmation, failure handling, and reviewer approval are complete.
- Ordinary app requests require verified user and tenant membership. Do not use service-role access for ordinary app paths.
- Architect review is required for shared contracts and migrations. Quality review is required for security-sensitive and cross-module work.

## Current accepted evidence

- Secure multi-tenant app foundation, CRM, manual intake, jobs/dispatch, internal appointments/calendar, password recovery support, and recovery work have recorded local evidence.
- Hosted migrations 003 and 004 were applied once through manual SQL Editor with catalog checks. Do not rerun them blindly.
- Owner sign-in, fictional Jobs create/edit/reload, and Calendar create/reschedule/reload were manually verified. Remaining live multiuser/JWT/PostgREST role coverage is open.
- CEV-MAKE-22 accepted only an isolated inactive Make appointment validator simulation with fictional inputs. It validated typed Return output and one-hour intervals. It did not prove real Retell payloads, tenant routing, live time, booking availability, calendar writes, or caller confirmation.
- CEV-COORD-23 reconnected all six existing specialist chats and collected readiness handoffs. The combined result blocks live Retell/Make booking integration until the no-writer trust/provenance contract work is complete.

## Active blockers

- Actual Retell event payload, date extraction format, intent fields, event version, retry identity and provenance are unverified.
- Trusted live evaluation time is not integrated; the accepted Make validator used a fixed simulation clock.
- Tenant routing from provider account or connection to Cevanta tenant is not implemented or reviewed.
- Durable dedupe, idempotency, booking operation identity, availability/conflict policy and failure recovery are not implemented.
- Operator-facing review/confirmation UI for call outcomes and uncertain bookings is not contracted.
- Hosted CI, restore drill, full live role/JWT checks and production release gates remain open.

## Existing specialist chats

- Atlas - Architecture & Data: shared contracts, schemas, tenant routing and architecture review.
- Blake - Backend & Application Logic: secure server workflows, authorization, idempotency, persistence.
- Nova - Frontend & UX: operator screens, call outcome review and booking/failure status experience.
- Quinn - Quality & Security: security acceptance, tenant isolation, replay, failure and PII checks.
- Phoenix - DevOps & Release: CI, release gates, environment separation, logging, restore and rollback.
- Echo - AI Voice & Integrations: Retell, Twilio, Make, provider payloads, event provenance and integration boundaries.

## Next safest task

Create and run a no-writer Retell/Make provenance, datetime, trusted-clock and tenant-routing contract task before any parent scenario connection or booking writer. Echo should own actual provider-format discovery; Atlas should approve the trust/routing contract; Quinn should approve the security acceptance matrix; Blake, Phoenix and Nova should review their specialty implications.

## M5 estimates and follow-up

Owner approved internal office-managed drafts plus manual follow-up as the first workflow. Morgan accepted the reviewed design as a non-monetary internal scope-draft slice: required customer anchor, optional same-customer job/location, owner/admin/dispatcher access only, technician/viewer/anonymous/removed/demoted denial, one active date-only manual follow-up, no assignee, immutable completed/cancelled follow-up history. Prices, totals, tax, sending, customer acceptance, signatures, payments, automated reminders, provider writers and revenue recovery remain blocked.

Current M5 state: final contract and replay/lock clarification are accepted with limitations for implementation planning. No runtime M5 behavior exists yet. Future implementation tasks must reference CEV-M5-CONTRACT-FINAL-34 and CEV-M5-CONTRACT-CLARIFY-36, then pass Atlas and Quinn evidence gates before acceptance.

## Required full client journey outcome

The owner confirmed that Cevanta must deliver a fully functional frontend dashboard connected to a working backend, with simple guided onboarding for non-technical business owners. Required modules include authenticated dashboard persistence, role permissions, client data isolation, customers, leads, jobs, scheduling, AI receptionist activity, tracked handoffs, estimates, follow-ups and reporting within their approved scope.

Guided onboarding must cover first access through account creation or invitation, business details, services, hours, timezone, integrations, booking rules and escalation contacts. Setup must show progress, missing requirements, helpful errors and a readiness check. Clients must be able to complete ordinary setup and use the dashboard without editing code or configuration files. Desktop and mobile usability are required.

This is a required outcome, not a claim that it already exists. Preserve all current gates: no production deployment, live provider activation, external messages/calls/calendar writers, priced estimate assumptions, payments, revenue claims or weakened authorization without separate approval and evidence. Complete acceptance requires verification of the journey from a new client's first access through onboarding to a usable dashboard.


Current guided journey task: CEV-ONBOARD-38. Atlas is assigned to design invitation-based first access, setup data contracts, saved progress and backend-derived readiness before implementation. CEV-JOURNEY-GAP-37 is accepted as a gap audit only; it does not mean the journey is complete.

## Guided onboarding database commands

CEV-ONBOARD-RPC-46 and CEV-ONBOARD-COMMAND-TESTS-47 are accepted with limitations. `pnpm check` now includes onboarding storage and command SQL embedded suites. Remaining gates are live Auth/JWT/PostgREST, genuine concurrency, hosted migration/advisors, backend server actions, UI and provider/production readiness.

- 2026-10-05: Owner flagged launch blocker: AI receptionist leads need an in-app notification before launch. Fixed in CEV-LEAD-NOTIFY-75A with Leads page alert and NEW AI LEAD row badge. Keep as launch gate; external notifications are still not enabled.

- 2026-10-05: Fixed follow-up AI lead launch bug in CEV-LEAD-CONVERT-75B. When office staff converts an AI lead to a job, the lead is marked contacted or scheduled so the in-app AI alert clears. Browser proof used fictional `Fictional AI Caller` data only. External notifications and real Retell delivery remain blocked until separately approved and verified.

- 2026-10-05: Added CEV-LEAD-OVERVIEW-75C so new AI receptionist leads are visible from the workspace overview as well as the Leads page. Detection is shared in `src/lib/ai-lead-notifications.ts`. External notifications are still not enabled.

- 2026-10-05: CEV-SETUP-BROWSER-76A verified the fresh self-service workspace Setup browser path with fictional data. Services, weekly hours, a date-specific closed override, request preferences and one enabled escalation contact saved. This supports managed-pilot demo setup proof only; lower-role privacy, production and live provider behavior remain blocked.

- 2026-10-05: CEV-ROLE-PRIVACY-76B refreshed automated Setup role-privacy evidence. Targeted onboarding/settings tests passed with 739 tests reported. Mark role privacy PASS WITH LIMITATIONS only; disposable limited-role browser sign-ins are still needed before live pilot.

- 2026-10-05: Full `pnpm check` passed after setup proof and role-privacy tracker updates: typecheck, lint, 739 app tests, embedded DB suites, Retell lead-ingestion embedded suite and production build. Live provider, external sends, hosted direct JWT/PostgREST role matrix and production remain unproven.

- 2026-10-05: CEV-LIVE-PROVIDER-77A started live-provider readiness. Owner has a Twilio number as an individual; business registration is pending. Retell dashboard opens, Make requires sign-in, and local Retell writer is blocked by missing server-only `SUPABASE_SERVICE_ROLE_KEY`. Fictional signed local Retell request failed safely with no persistence or booking.

- 2026-10-05: CEV-MAKE-SAFE-COPY-77B created inactive Make clone `Cevanta Receptionist — Safe Dry Run` (`6515596`) with a replacement webhook. Do not run it yet: Gmail, Calendar and SMS modules remain present. Original Make scenario was not changed.

- 2026-10-05: CEV-MAKE-MINIMAL-77C created docs/ops/MAKE_MINIMAL_SAFE_DRY_RUN.md. Next safe Make action is a new minimal inactive scenario: Webhook -> event filter -> safe response/log only. Do not run the full cloned scenario until Gmail, Calendar and SMS modules are neutralized.

- 2026-10-05: CEV-MAKE-MCP-77D confirmed the official Make plugin/MCP connection and created separate scenario `Cevanta Receptionist — MCP Intake Receiver` (`6515719`) with webhook intake, a Make-only data-store review log and a safe webhook response. Fictional payload learning and a Make-side happy-path dry run passed. Wrong-event handling stopped safely. Duplicate call IDs did not create duplicate review records, but Make still logs duplicate-key execution errors and needs a clean duplicate branch/response before live use. Do not store the webhook URL. Do not connect live sends, bookings or Cevanta production writes until clean retry handling, tenant routing, dedupe and quality review are complete.


## Twilio business verification facts

Date: 2026-10-05.

Owner provided an IRS EIN notice for Cevanta verification. Do not store the EIN, full IRS notice, barcode, QR code, or image in project files.

Safe facts for Twilio Trust Hub:
- Legal EIN record name shown on the IRS notice: `HEATH W HERRICK`.
- Trade/brand name shown below the legal name: `CEVANTA`.
- Business type for Twilio profile should remain consistent with the IRS record, likely sole proprietorship unless owner has separate entity documentation.
- Name control is known from the IRS notice but should be entered only in Twilio/Persona as needed, not stored in project files.
- Twilio rejection reason observed on 2026-10-05: business registration number failed verification; Twilio requested legal company name and EIN exactly as found in tax records.
- Website owner provided for Twilio profile: https://cevanta.base44.app/
- Twilio profile should not use `CEVANTA` as legal business name unless Twilio provides a separate DBA/trade-name field. Use `CEVANTA` only as brand/DBA/friendly name when available.
- For current launch planning, keep SMS disabled until business verification and A2P/10DLC or equivalent messaging compliance is approved.

## Retell-first launch path

Date: 2026-10-05.

Owner chose to use Retell first and change telephony later if desired. Twilio remains optional later, but it is no longer blocking the first voice proof.

Current Retell direction:
- Use existing Retell agent `agent_a9182cc8117ac588f68bc52a3d` for Cevanta HVAC AI receptionist proof.
- Prefer Retell-managed number for fastest voice test/launch if available.
- Keep Make.com as automation layer; current Make MCP intake receiver remains the safe dry-run proof path.
- Keep SMS disabled until business verification and messaging compliance are approved with Twilio, Retell/Telnyx/Plivo, or another provider.
- Do not connect production Cevanta writes, live SMS, or calendar booking until tenant routing, dedupe/retry handling, and quality review are complete.

## Retell live-client readiness next step

Date: 2026-10-05.

Next best step after choosing Retell-first launch path: test existing Retell agent `agent_a9182cc8117ac588f68bc52a3d` before deploying to a live Retell-managed number.

Safe test script:
1. Caller says they need HVAC help because AC is not cooling.
2. Caller gives fictional name, phone, address and preferred appointment window.
3. Agent should collect details, summarize the request, avoid confirming a booking, and make clear the office will review/follow up.
4. Agent should treat emergency or no-heat/no-cooling urgent language as office-review/urgent handoff, not a guaranteed dispatch.
5. No SMS, calendar booking or production Cevanta write should be claimed during this test.

Pass condition: Retell agent captures lead details and uses safe office-review language.
Fail condition: agent confirms an appointment, promises emergency service, asks for payment, mishandles basic HVAC intake, or loses caller contact details.

- 2026-10-05: Owner reported Retell agent test passed with launch-safe behavior. Agent said it would follow up about the service request and did not book anything. Treat as owner-reported evidence only; next step is Retell-managed number deployment and one live test call.

- 2026-10-05: Retell phone number deployment verified. Number `+1(207)407-9904` is present in Retell and inbound call agent shows `HVAC Receptionist Pilot v1 — Working/V3` linked to agent `agent_a9182cc8117ac588f68bc52a3d`. Retell page also showed low credits warning with remaining balance around $4.92, so first live test should be short. SMS add-on remains off.

- 2026-10-05: Owner reported first live Retell inbound call to `+1(207)407-9904` worked. Treat as owner-reported pass until call history/transcript is inspected. Next verification: Retell call history should show the call and transcript/analysis; then connect or compare it to safe Make/Cevanta intake evidence.

- 2026-10-05: Owner reported the Retell inbound live test worked. Retell Call History later showed the latest inbound phone call ended successfully with a short duration, normal user hangup, neutral sentiment, and low latency. Safe evidence only: no transcript, recording, caller number, provider IDs, or private details stored. Remaining limits: Retell credits are low; SMS is not enabled; live Make/Cevanta write-through and booking still need clean duplicate handling, webhook wiring, and approval before production use.

- 2026-10-05: Make safe intake scenario duplicate handling was repaired and retested. Scenario `Cevanta Receptionist — MCP Intake Receiver` (`6515719`) now uses event routing, a direct Make data-store existence check, and separate duplicate/create paths. Fictional tests showed: new analyzed call created one review record and responded; duplicate analyzed call used duplicate response and did not run AddRecord; ignored non-analysis event responded without creating a record. Make labels these route-filtered runs as warnings, but module inspection showed zero module errors. Scenario was deactivated after testing; do not leave it always-on until Retell webhook connection and production write policy are approved.

- 2026-10-05: Added CEV-LAUNCH-78A workspace Launch readiness page. It gives a plain-language managed-pilot status, Retell/Make proof with limitations, owner-attention items, and a first-client demo path without exposing secrets or claiming production readiness. Local verification before full check: typecheck, lint, build and 739 tests passed.

- 2026-10-05: CEV-LAUNCH-78A full verification passed. `pnpm check` completed typecheck, lint, 739 tests, embedded database suites, Retell lead ingestion suite and production build; build output includes `/workspaces/[tenantId]/launch`.

- 2026-10-05: Added CEV-INTEGRATIONS-78B workspace Integrations readiness page. It shows Retell, Make, Cevanta lead intake, Twilio/SMS, Calendar, billing and production readiness without exposing secrets or enabling live side effects. Verification before full check: 741 tests, typecheck, lint and build passed; build output includes `/workspaces/[tenantId]/integrations`.

- 2026-10-05: CEV-INTEGRATIONS-78B full verification passed. `pnpm check` completed typecheck, lint, 741 tests, embedded database suites, Retell lead ingestion suite and production build; build output includes `/workspaces/[tenantId]/integrations` and `/workspaces/[tenantId]/launch`.

- 2026-10-05: Updated CEV-SALES-78C first-client sales, demo and intake docs. Materials now include Retell phone-answering proof, Make safe-intake duplicate-handling proof, Launch/Integrations demo steps, and continued gates for SMS, email, calendar writes, billing and production deployment. Documentation scan found no secret webhook URLs or accidental literal newline markers.

- 2026-10-05: Created `docs/project/OWNER_ATTENTION.md` to save decisions/actions for the owner: Retell credits, webhook activation path, production approval, first pilot boundary, SMS/email/calendar gates, Twilio registration, fresh signup proof, and pricing/package decisions.

## Pilot runbook and installable app shell

Date: 2026-10-05.

CEV-PILOT-78D added the protected workspace Pilot runbook page. It gives safe first-client pilot operating steps and stop rules, while keeping automatic booking, external sends/writes and production claims off until separately approved.

CEV-PACKAGE-79A added installable-app support for the hosted Cevanta dashboard: manifest, icons, service-worker registration and a service worker that avoids private workspace/API/Auth route caching. This prepares Windows and Android browser install after an approved HTTPS deployment. It does not create a signed Windows `.exe`, MSIX, Android APK/AAB, store listing or production deployment. Those remain owner-approval decisions.

Latest verification for this slice: focused installable-app test passed with 4 tests; typecheck, lint and production build passed after the final change; full `pnpm check` passed with 22 files / 747 tests before the final local safe-context service-worker adjustment.

## Production deployment blocker

Date: 2026-10-05.

Cevanta production deployment is prepared but not deployed. Local release checks pass. Vercel is connected through the app plugin, but there is no linked Git project and this folder has no Git remote. Local Vercel CLI login is blocked by an invalid saved token and current CLI auth package resolution failure under the local pnpm/Node runtime.

Safe unblock options:
1. Fix Vercel CLI login on this Windows machine.
2. Push this project to a GitHub/GitLab/Bitbucket repo and connect it to Vercel.
3. Add a valid Vercel token securely as a local environment variable, without pasting it into chat or source.

Do not enable Retell production writer, SMS/email/calendar external writes, billing or public client onboarding until the production URL, Supabase Auth redirects and post-deploy checks pass.

Local release commit prepared: `cdca042` on `main`. It is not pushed because no GitHub remote URL is configured in this checkout.
