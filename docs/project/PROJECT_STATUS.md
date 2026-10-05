# Project status

Date: 2026-10-04 (America/New_York)
Coordinator: Morgan — Product Manager and Orchestrator
Current work: Guided onboarding storage, RPCs, permanent SQL checks, backend-only actions, transport preparation, first Setup UI, anonymous browser protection, all narrowed setup storage editors, and the setup status/readiness shell are accepted with limitations. Phoenix55, Atlas56, Blake57 and Echo58 planning documents are accepted as planning only. ENV59 and LOCK60 are accepted with limitations; SETTINGS65A is accepted with limitations; SETTINGS65B is accepted with limitations; SETTINGS65C is accepted with limitations; RESUME66A is accepted with limitations; EXCEPTIONS67A is accepted with limitations; HISTORY68A is accepted with limitations; HISTORY68B is accepted with limitations; HISTORY68C is accepted with limitations; HISTORY68D is accepted with limitations after cursor fix and re-review; PILOT69A is accepted with limitations as the first-client intake package; PILOT69B is accepted with limitations as demo script and local walkthrough documentation. Credentialed browser/live HTTP gates remain open. CEV-JOURNEY-GAP-37 accepted as a gap audit; M5 final contract accepted for future implementation planning. Retell hosted/provider gates still await owner-authorized host or provider clarification. Earlier app and production gates remain open.
State: implemented portions pass integrated checks; complete product and production release NOT ACCEPTED.

## Current integration evidence

CEV-MAKE-17 prepared a separate inactive parent draft with reviewed hard blocks before the shared lead writer and SMS. Dedicated private test calendar and owner test-alert destinations configured; no parent run or real call/message/booking accepted. CEV-MAKE-18 created separate private inactive Start → Return simulation and received Architecture/Quality construction approval. CEV-MAKE-19 delivered an offline strict fictional lead/date prototype, with six grouped tests and 36 independent boundary assertions; full lint/typecheck,350 app tests and production build passed. Prototype is not integrated into Make or an operational API.

Owner explicitly approved one-hour (60-minute) appointment duration. CEV-MAKE-20 ran only the isolated two-module simulation twice with fictional input; output ID, Boolean simulation true and simulated_not_persisted status matched both times. Missing required input was rejected by the manual form. Stub left inactive; no external writers or parent edits. Quality approved this limited isolated runtime scope. Actual Retell extraction/date normalization, trusted provenance/tenant routing, availability/concurrency and durable effect deduplication remain unresolved. Production and real-call acceptance remain open.

## Delivered and integrated

- Seven specialist definitions, supported launcher, task ledger, collaboration rules and handoffs.
- Verified sign-in, memberships, five roles, tenant settings and isolated CRM foundation.
- Customer create/list/detail/edit; additional contact create/edit; service location and equipment create/edit; atomic metadata audits.
- Manual lead/service intake inbox, edit/status/priority/follow-up and retry protection.
- Jobs/dispatch, lead conversion, office scheduling/assignment, filters, current assigned-only technician reads.
- Internal job appointments/calendar, UTC entry/display, create/reschedule/cancel, current assignment-based read visibility.
- Comprehensive business blueprint: docs/business/CEVANTA_BUSINESS.md. Commercial recommendations and unresolved decisions are labelled.

## Current verification

| Check | Result |
| --- | --- |
| Full pnpm check | PASS exit0 on 2026-10-04 after guided onboarding status shell review; Quinn reported typecheck, lint, 600 Vitest tests, six embedded SQL suites and production build |
| Type checking and global lint | PASS |
| Meaningful application tests | PASS 600 after status shell review; earlier 594 included: foundation/CRM146, onboarding actions56, onboarding transport4, onboarding UI52, onboarding validation44, intake44, jobs67, appointments55, password recovery38, Retell88, hosted-readiness9, proxy13 |
| Actual embedded SQL suites | PASS foundation, intake, jobs, appointments, onboarding storage and onboarding command suites; active migrations 001-006 applied to disposable PGlite |
| Production build | PASS after final recovery copy and loopback development-origin changes; recovery, calendar, jobs, leads and CRM routes included |
| Seven role definitions | PASS native-schema validation |
| Internal architecture/quality review | APPROVED in recorded dispatch/calendar/CRM handoffs |
| Configured anonymous browser suite | PASS clean runner exit0:1 passed,3 skipped; all workspace-module redirects and390px sign-in overflow checked |
| Authenticated browser persistence/multiuser roles | Owner Jobs create/edit/reload and Calendar create/reschedule/reload PASS CEV-LIVE-15; owner foreign CRM/Jobs/Calendar unavailable without records PASS CEV-AUTO-16-owner-denial; other roles and direct JWT checks remain OPEN |
| Live Supabase JWT/PostgREST tenant/role/assignment tests | OPEN; embedded Auth compatibility does not replace live evidence |
| Hosted CI, backup restore, deployment | NOT RUN |
| Existing named specialist chat follow-up | PASS CEV-COORD-23: Atlas, Blake, Nova, Quinn, Phoenix and Echo existing chats responded with role-specific handoffs |
| Shared memory/context files | PASS: MEMORY.md and context/ added with safe non-secret project context |
| Retell/Make trust discovery | LIMITED PASS CEV-RETELL-TRUST-24: Retell post-call Call analyzed route observed, extraction field names/types recorded, Make webhook trigger observed inactive with no detected sample data; Atlas approved no-writer boundary, Quinn approved negative matrix; live booking remains blocked |
| Retell no-writer ingress prototype | LIMITED PASS CEV-RETELL-INGRESS-25: local fictional-secret `call_analyzed` verifier and route accepted with Atlas/Quinn limitations; 56 focused tests plus coordinator type/lint checks passed; Quinn also recorded full `pnpm check` PASS with 406 tests and production build; hosted/proxy path, live provider compatibility, tenant routing, durable dedupe and writers remain blocked |
| Retell machine-ingress proxy path | LIMITED PASS CEV-RETELL-PROXY-26: exact local proxy exclusion for `/api/integrations/retell` accepted with Blake/Quinn limitations; 69 focused proxy/ingress tests plus coordinator type/lint checks passed; Phoenix/Quinn recorded `pnpm check` PASS with 419 tests and production build; hosted signed delivery, real provider compatibility, durable routing/dedupe and writers remain blocked |
| Retell local signed HTTP smoke | LIMITED PASS CEV-RETELL-HTTP-27: supervised loopback-only fictional signed request smoke accepted with Blake/Quinn limitations; Morgan clean PASS required approved Windows process cleanup permission; script syntax/lint pass; live provider, hosted proxy, unattended cleanup, network containment, tenant routing, durable dedupe and writers remain blocked |
| Retell hosted-readiness preparation | LIMITED PASS CEV-RETELL-HOSTED-28: offline inventory/readiness docs/tests accepted with Blake/Quinn limitations; hostedReady and providerConnectionAuthorized remain false; 78 focused Retell tests plus coordinator type/lint passed; live provider, hosted raw-byte preservation, time/rate controls, platform logging, tenant routing, durable dedupe and writers remain blocked |
| Retell local read-budget controls | LIMITED PASS CEV-RETELL-BUDGET-29: local 5000ms total body-read deadline/cancellation behavior accepted with Phoenix/Quinn limitations; 88 focused Retell tests plus coordinator type/lint passed; hosted timing, distributed rate/concurrency, trusted admission identity, tenant routing, durable dedupe and writers remain blocked |
| Retell infrastructure admission plan | LIMITED PASS CEV-RETELL-ADMISSION-30: planning-only admission controls accepted with Blake/Quinn limitations; offline inventory and 88 focused Retell tests passed; no numeric limits, host, shared state, callback, provider connection, tenant routing, durable dedupe or writers approved |
| Retell host/provider discovery | LIMITED PASS CEV-RETELL-DISCOVERY-31: read-only discovery accepted; no committed host destination or verified infrastructure controls found; Retell official docs show 10s timeout and up to 3 retries but leave backoff/window/Retry-After/status-specific behavior unspecified; hostedReady/providerConnectionAuthorized remain false |
| Estimates and follow-up scope | LIMITED PASS CEV-M5-SCOPE-32: Atlas/Blake/Nova discovery accepted; Morgan synthesized docs/product/ESTIMATES_FOLLOWUP_SCOPE.md; recommended first slice is internal drafts plus manual follow-up; implementation blocked pending owner workflow, currency, tax, permission and acceptance decisions |

An initial configured browser test failed because its exact password label did not account for the required marker. Locator corrected; rerun passed. Native Vitest configuration loading avoids the sandbox's esbuild ancestor-path failure; global checks pass without weakening authorization.

## Development and hosted state

Private development Supabase configuration is present and ignored. Earlier table availability and anonymous access denial verified. Owner reports sign-in, customer/equipment save and M2 intake migration/create/edit persistence working. These are manual reported outcomes, distinct from automated multiuser acceptance.

Reviewed migration003 dispatch was applied once by Morgan to hosted Cevanta Development on 2026-10-02 under CEV-DB-12, after owner approval and a read-only absence check. Codex's connected in-app browser supplied an authenticated administration session, and the project matched app configuration. SQL execution succeeded. Catalog verification confirmed Jobs RLS enabled, three policies, three Jobs triggers, membership assignment cleanup present, anonymous SELECT denied and authenticated SELECT granted subject to RLS. This is schema evidence, not signed-in user-flow or multiuser isolation acceptance. Migration004 appointments was subsequently applied under CEV-DB-13 after a fresh absence check. SQL succeeded; catalog checks verified Appointments RLS enabled, three policies, two triggers and anonymous SELECT denied. Both hosted schemas are installed; authenticated workflow and multiuser acceptance remain open. Manual SQL Editor execution does not establish CLI migration history registration. Local preview is http://127.0.0.1:3000. Under CEV-AUTH-14, restricted preview network access was diagnosed as EACCES to Supabase Auth. The approved unrestricted probe returned HTTP200; preview restarted with approved network access. Owner sign-in subsequently verified in CEV-LIVE-15; owner Jobs and Calendar live persistence checks passed.

## Agent specialization and ownership

Owner requested existing separate specialist chats. Morgan sent task-ledger-scoped CEV-COORD-23 assignments to Atlas Architecture/Data, Blake Backend, Nova Frontend/UX, Quinn Quality/Security, Echo Voice/Integrations and Phoenix DevOps/Release. Each stayed in its specialty and wrote only its assigned handoff. All six responded. The combined result blocks live parent Retell/Make booking integration until a no-writer provenance, datetime, trusted live-clock, tenant-routing, dedupe, availability and confirmation contract task is completed and reviewed. Morgan owns integration and final acceptance.

Under CEV-AUTO-16, internal specialist waves subsequently completed Architect, Backend, Frontend, Voice, Quality and DevOps assignments. Their new handoffs approve local recovery implementation and operations changes, with external gates explicit. This does not imply the earlier named chats resumed.

## Remaining documented scope

- Complete authenticated multiuser/JWT tenant isolation and role tests for delivered modules.
- Jobs migration003 and appointments migration004 are installed; owner Jobs create/edit and Calendar create/reschedule persistence PASS. Complete live multiuser authorization, technician assignment visibility and remaining CRM checks.
- Complete Phoenix browser artifact/operations readiness review and mandatory hosted CI/restore gates.
- M4 provider-connected AI calls/outcomes and tracked handoffs: unimplemented in Cevanta. Owner confirms Twilio + Retell AI + working Make.com system; preserve existing workflows. Exact event mapping, access and handoff policy pending discovery.
- CEV-RETELL-TRUST-24 accepted a no-writer design boundary: Retell is configured for post-call Call analyzed extraction, with appointment request and SMS consent as Yes/No fields and appointment date/time/datetime as Text fields. The Make parent draft uses an inactive generic webhook trigger with no detected sample data.
- CEV-RETELL-INGRESS-25 accepted a local no-writer verifier prototype for fictional Retell `call_analyzed` payloads. It proves exact raw-byte signature verification and safe rejection behavior inside the local handler only.
- CEV-RETELL-PROXY-26 accepted synthetic local proxy isolation for the exact Retell machine-ingress path. The proxy no longer performs unrelated Supabase session work for that path, ordinary user routes remain protected, and request bodies are not consumed by the proxy.
- CEV-RETELL-HTTP-27 accepted a supervised local development HTTP smoke with fictional signed payloads. A valid fictional signed request returns verified_not_persisted, invalid/altered/stale requests reject, and the accepted run stopped its task-owned server.
- CEV-RETELL-HOSTED-28 accepted offline hosted-readiness preparation. The inventory and docs intentionally keep hostedReady and providerConnectionAuthorized false, confirm no committed host destination, and list required controls.
- CEV-RETELL-BUDGET-29 accepted local no-writer read-budget controls. The handler now has a 5000ms total raw-body read deadline from reader acquisition, safe timeout/abort/oversize behavior, and best-effort cancellation.
- CEV-RETELL-ADMISSION-30 accepted planning-only infrastructure admission requirements. The plan blocks fake numeric limits and requires trusted ingress identity, global/local controls, safe 429/retry behavior, logging, kill switch and recovery evidence before exposure.
- CEV-RETELL-DISCOVERY-31 accepted read-only discovery. Phoenix found no committed host destination or verified infrastructure controls from the repo/tool state. Echo found Retell official docs document a 10-second timeout and up to three retries, but backoff timing, total retry window, Retry-After handling, status-specific behavior, retry signature behavior and recovery after exhaustion remain unspecified in inspected official sources. Hosted reverse-proxy preservation, actual provider sample compatibility, edge/socket/header/pre-handler buffering, distributed rate/concurrency implementation, trusted admission identity, platform logging, unattended cleanup, network containment, tenant routing, durable replay/dedupe, date/consent interpretation, availability and booking writers remain blocked for separate tasks.
- M5 estimates/follow-up: owner approved internal drafts plus manual follow-up as the first workflow. CEV-M5-CONTRACT-33, CEV-M5-CONTRACT-FINAL-34, CEV-M5-CONTRACT-REVIEW-35 and CEV-M5-CONTRACT-CLARIFY-36 are accepted with limitations for implementation planning. No runtime M5 implementation exists yet. External sending, customer acceptance, payment, automated reminders, tax automation and revenue recovery remain blocked.
- M6 recovered revenue reporting: unimplemented; attribution definition and actual revenue source pending.
- Password recovery and authenticated self-change implemented with Architect and Quality approval; 38 meaningful recovery tests and safe browser checks pass. Real email delivery, token exchange, password change and sign-in still require trusted origin, provider template/allowlist configuration and private testing. Invitations remain unimplemented; trusted access provisioning remains current model.
- Production approval can be requested only for a concrete verified candidate after required gates pass.

CURRENT STEP: Make MCP fictional dry-run passed with limitations; duplicate retry still needs clean handling.
WHY: The official Make plugin is connected, and a separate webhook-to-Make-data-store-to-response scenario processed fictional Retell-style payloads with no live Gmail, Calendar, SMS, Twilio call or Cevanta write. Wrong-event handling stopped safely. Duplicate call IDs did not create duplicate records, but Make still logs duplicate-key execution errors.
DO THIS: add a proper duplicate branch/response in Make, then retest duplicate retry without execution errors before any live Retell/Twilio/Cevanta connection.
SUCCESS LOOKS LIKE: duplicate and non-analyzed events produce clean successful runs without creating extra review records, while valid fictional analyzed calls create exactly one safe review record.















## Estimates contract review

CEV-M5-CONTRACT-33 is accepted with limitations for design only. The first slice is non-monetary internal scope drafts plus one active manual date-only follow-up, office-only for owner/admin/dispatcher. Customer-facing delivery, priced line items, totals, tax, signatures, payments, automated reminders, provider effects and revenue recovery remain blocked.

CEV-M5-CONTRACT-FINAL-34 is assigned to Atlas to publish exact buildable contracts before any schema, backend or UI implementation.





## Full guided dashboard/onboarding requirement

The owner confirmed a required product outcome: Cevanta must support a non-technical business owner from first access through guided setup, readiness check and normal dashboard use, with real backend persistence, auth/role isolation, desktop/mobile usability and approved-scope modules for customers, leads, jobs, scheduling, AI receptionist activity, tracked handoffs, estimates, follow-ups and reporting.

This is not accepted as complete. CEV-JOURNEY-GAP-37 is assigned for a specialist gap audit and phased implementation plan. Existing external provider, production, monetary, security and release gates remain in force.












## Guided onboarding database command acceptance

CEV-ONBOARD-RPC-46 is accepted with limitations after Atlas implementation and Blake/Quinn PASS WITH LIMITATIONS reviews. Migration006 and onboarding_commands.sql are active locally. CEV-ONBOARD-COMMAND-TESTS-47 makes the command SQL suite permanent in `pnpm check`. Evidence on 2026-10-04: `pnpm check` PASS with typecheck, lint, 482 Vitest tests, embedded foundation/intake/jobs/appointments/onboarding storage SQL, embedded onboarding command SQL and production build. Remaining gates: live Supabase Auth/JWT/PostgREST, genuine concurrency, hosted migration/advisors, backend server actions, browser/session/raw-body/log redaction, invitation issuance/delivery, new account provisioning, provider readiness and production.

## Guided onboarding backend acceptance

CEV-ONBOARD-BACKEND-48 is accepted with limitations after Blake implementation and Quinn PASS WITH LIMITATIONS review. Backend actions now call the accepted RPCs through ordinary authenticated session clients, shared validators and strict result decoders. Evidence on 2026-10-04: `pnpm check` PASS with typecheck, lint, 538 Vitest tests, embedded foundation/intake/jobs/appointments/onboarding storage SQL, embedded onboarding command SQL and production build. Remaining gates include raw Server Action transport/body-limit verification, live Supabase Auth/JWT/PostgREST, genuine concurrency, hosted migration/advisors, browser/session/log redaction, UI wiring, provider readiness and production.

## Guided onboarding transport preparation

CEV-ONBOARD-TRANSPORT-49 is accepted with limitations as preparation only. Next.js Server Action body size is explicitly configured to 1 MiB, matching the installed framework default, and static/config tests cover parser and framework sentinel evidence. This does not satisfy actual rendered-action HTTP verification or the earlier raw 131072-byte onboarding boundary. Those remain open until a UI consumer exists and Quinn can test real fictional-session requests.

## Guided onboarding UI acceptance

CEV-ONBOARD-UI-50 is accepted with limitations after Nova implementation and Quinn PASS WITH LIMITATIONS review. The Setup page and navigation exist, owners/admins have a business-profile form backed by accepted server actions, and other roles get safe read-only states. Evidence on 2026-10-04: `pnpm check` PASS with typecheck, lint, 555 Vitest tests, embedded foundation/intake/jobs/appointments/onboarding storage SQL, embedded onboarding command SQL and production build. Remaining gates include fictional-session browser/runtime save/reload checks, actual Server Action HTTP oversize behavior, live Supabase Auth/JWT/PostgREST, genuine concurrency, hosted migration/advisors, provider readiness and production.

## Guided onboarding browser evidence

CEV-ONBOARD-BROWSER-51 is accepted with limitations for test delivery and anonymous browser evidence. The anonymous protected Setup route and 390px overflow check passed. Six credential/harness-dependent cases were added but skipped: owner/admin save-reload, dispatcher/technician/viewer no-controls privacy, and actual oversized rendered Server Action behavior. Disposable role credentials and a safe transport harness are still required before browser/runtime acceptance.

## Guided onboarding services and hours acceptance

CEV-ONBOARD-SETUP-52 is accepted with limitations after Nova implementation and Quinn PASS WITH LIMITATIONS review. Owner/admin Setup UI now includes services and weekly-hours editors wired to accepted backend actions. Evidence on 2026-10-04: Morgan and Quinn each ran `pnpm check` PASS with typecheck, lint, 574 Vitest tests, embedded foundation/intake/jobs/appointments/onboarding storage SQL, embedded onboarding command SQL and production build. Authenticated browser/runtime checks remain open.

## Guided onboarding request preferences and escalation acceptance

CEV-ONBOARD-SETUP-53 is accepted with limitations after Nova implementation and Quinn PASS WITH LIMITATIONS review. Owner/admin Setup UI now includes request-only booking preferences and escalation contacts wired to accepted backend actions. Evidence on 2026-10-04: Morgan and Quinn each ran `pnpm check` PASS with typecheck, lint, 594 Vitest tests, embedded foundation/intake/jobs/appointments/onboarding storage SQL, embedded onboarding command SQL and production build. Authenticated browser/runtime checks remain open.

## Coordinator update — 2026-10-04 team resume

Morgan notified Quinn, Atlas, Blake, Phoenix and Echo to continue through existing specialist chats. Quinn must resume CEV-ONBOARD-STATUS-54 review after usage reset before Morgan accepts the status shell. Atlas must resume CEV-ONBOARD-GAP-56 and finish the architecture/data gap review. Blake, Phoenix and Echo completed their assigned planning/runbook tasks and are standing by for exact follow-up assignments.

Accepted with limitations so far: onboarding storage, permanent storage/validation checks, guarded RPCs, permanent command SQL checks, backend actions, transport preparation, first Setup UI, anonymous Setup browser evidence, services/hours editors, request preferences and escalation contact editors. Current local evidence includes `pnpm check` PASS with 594 tests after SETUP53 and PASS with 600 tests after STATUS54 implementation, but STATUS54 still awaits Quinn review.

Open gates remain: authenticated browser save/reload and limited-role verification, actual rendered Server Action oversize/session/logging tests, live Supabase Auth/JWT/PostgREST, genuine multi-connection concurrency, hosted migration/advisors, invitation issuance/delivery, new account provisioning, public signup, token continuation, provider readiness and production approval.

## Guided onboarding status and planning acceptance

CEV-ONBOARD-STATUS-54 is accepted with limitations after Nova implementation and Quinn PASS WITH LIMITATIONS review. The Setup page now has a local status/readiness presentation shell, but it remains descriptive only and does not complete readiness, connect providers, create accounts, issue invitations, book live appointments or approve production. Quinn reported pnpm check PASS with typecheck, lint, 600 Vitest tests, six embedded SQL suites and production build.

CEV-ONBOARD-LIVE-PREREQ-55, CEV-ONBOARD-GAP-56, CEV-ONBOARD-BACKEND-GAP-57 and CEV-ONBOARD-VOICE-GAP-58 are accepted as planning/documentation only. They identify the next safe sequence: CEV-ONBOARD-ENV-59 for disposable environment prerequisites and CEV-ONBOARD-LOCK-60 for the configuration lock/concurrency contract. No live provider, hosted database, credential, production or external-writer action was accepted by those planning tasks.

## Guided onboarding environment and lock acceptance

CEV-ONBOARD-ENV-59 and CEV-ONBOARD-LOCK-60 are accepted with limitations as documentation/planning. ENV59 provides the no-secret prerequisite checklist for future disposable authenticated browser, JWT/PostgREST and HTTP evidence. LOCK60 provides the revision/replay/concurrency contract future settings, resume, exceptions, invitations and provider-readiness work must follow. Neither task proves live hosted behavior, provider readiness or production release.

CEV-ONBOARD-SETTINGS-65A is assigned as the next backend-only implementation slice. It is limited to a new guarded settings action and focused backend tests; UI wiring and legacy settings replacement are separate future tasks.

## Guided onboarding settings backend acceptance

CEV-ONBOARD-SETTINGS-65A is accepted with limitations after Blake implementation and Quinn PASS WITH LIMITATIONS review. A new backend-only saveOnboardingSettings action routes Settings authority fields through the accepted onboarding business-profile command and focused tests. Evidence reported by Blake and Quinn: pnpm check PASS with typecheck, lint, 627 Vitest tests, embedded SQL suites and production build. UI wiring, legacy writer retirement, browser/live/concurrency/hosted/provider/production evidence remain separate.

CEV-ONBOARD-SETTINGS-65B is assigned to Nova for UI-only wiring of the accepted settings action.

## Guided onboarding settings UI acceptance

CEV-ONBOARD-SETTINGS-65B is accepted with limitations after Nova implementation and Quinn PASS WITH LIMITATIONS review. Workspace Settings now uses the accepted lock-aware onboarding settings action for owner/admin UI saves and avoids the legacy writer when a reviewed onboarding snapshot is unavailable. Evidence reported by Nova and Quinn: pnpm check PASS with typecheck, lint, 635 Vitest tests, embedded SQL suites and production build. Browser/live/concurrency/hosted/provider/production evidence remains separate.

CEV-ONBOARD-SETTINGS-65C is assigned to Blake to retire or safely block the remaining legacy backend updateTenantSettings writer.

## Guided onboarding legacy settings writer acceptance

CEV-ONBOARD-SETTINGS-65C is accepted with limitations after Blake implementation and Quinn PASS WITH LIMITATIONS review. The legacy updateTenantSettings export now returns a safe compatibility error and no longer performs direct tenant writes, membership lookup, validation, tenants table access or cache revalidation. Evidence reported by Blake and Quinn: pnpm check PASS with typecheck, lint, 639 Vitest tests, embedded SQL suites and production build. Browser/live/concurrency/hosted/provider/production evidence remains separate.

CEV-ONBOARD-RESUME-66A is assigned to Nova for a narrow persisted Setup resume UI using the already accepted saveOnboardingProgress action.

## Guided onboarding resume UI acceptance

CEV-ONBOARD-RESUME-66A is accepted with limitations after Nova implementation, Morgan follow-up fix and Quinn PASS WITH LIMITATIONS review. Setup now has a progress-only owner/admin resume-point control using the accepted saveOnboardingProgress action. Evidence reported by Nova and Quinn: pnpm check PASS with typecheck, lint, 647 Vitest tests, embedded SQL suites and production build. Browser/live/concurrency/hosted/provider/production evidence remains separate.

CEV-ONBOARD-EXCEPTIONS-67A is accepted with limitations after Nova implementation and Quinn PASS WITH LIMITATIONS review. The Setup page now includes owner/admin date-specific local-hours exception controls using the existing accepted exception commands. Evidence reported by Nova and Quinn: pnpm check PASS with typecheck, lint, 660 Vitest tests, embedded SQL suites and production build. Browser/live/concurrency/hosted/provider/production evidence remains separate.

CEV-ONBOARD-HISTORY-68A is assigned to Atlas for documentation-only retained-history and bounded-projection design.

## Guided onboarding date-specific exception acceptance

CEV-ONBOARD-EXCEPTIONS-67A is accepted with limitations after Nova implementation and Quinn PASS WITH LIMITATIONS review. Owner/admin Setup users can prepare local-date hours exceptions through the existing accepted configuration commands, while limited roles do not see mutation controls. The accepted scope is office-hour exception editing only; it does not book appointments, sync calendars, connect providers, advance readiness or approve production. Evidence reported by Quinn: `pnpm test -- tests/onboarding-ui.test.ts` PASS with 660 Vitest tests and `pnpm check` PASS covering typecheck, lint, Vitest, embedded database suites and production build.

CEV-ONBOARD-HISTORY-68A is now assigned to Atlas as a documentation-only architecture task for retained setup history and bounded projections.

## Guided onboarding retained-history design acceptance

CEV-ONBOARD-HISTORY-68A is accepted with limitations after Atlas architecture work and Morgan review. The accepted contract separates retained setup history from bounded current editor projections for services, weekly hours, date-specific exceptions, request preferences and escalation contacts. It preserves LOCK60 config_revision/request_id replay behavior and calls for separate backend, UI and Quinn review tasks before implementation acceptance. This is design evidence only; it does not implement bounded projections or prove hosted behavior.

CEV-ONBOARD-HISTORY-68B is assigned to Blake for bounded backend setup projections. It is limited to the onboarding snapshot/read contract, focused backend/SQL tests and Blake handoff. Atlas and Quinn review are required before Morgan acceptance.

## Guided onboarding bounded projection acceptance

CEV-ONBOARD-HISTORY-68B is accepted with limitations after Blake implementation, Atlas PASS WITH LIMITATIONS review and Quinn PASS WITH LIMITATIONS review. Local normal setup snapshots now return bounded current projections instead of unbounded retained history: owner/admin services and escalation contacts are enabled-only and capped, owner/admin date exceptions are active-only, and dispatcher services are enabled-only. Retained disabled/inactive rows remain stored for audit/recovery. Evidence reported by Blake/Atlas/Quinn includes focused action tests, embedded onboarding command database checks, and Quinn-reported `pnpm check` PASS with typecheck, lint, 665 Vitest tests, embedded SQL suites and production build. Hosted Supabase, live concurrency, hosted migration/advisor, browser/runtime, provider and production gates remain open.

CEV-ONBOARD-HISTORY-68C is assigned to Atlas as a documentation-only owner history/recovery API contract task.

## Guided onboarding owner history API contract acceptance

CEV-ONBOARD-HISTORY-68C is accepted with limitations after Atlas architecture work and Morgan review. The accepted contract defines owner/admin retained history reads, safe cursors, paging, filters, item shapes, private contact constraints and one-row re-enable semantics while preserving HISTORY68A/HISTORY68B/LOCK60. This is design evidence only; no runtime history/re-enable API, UI, hosted refresh, provider behavior or production deployment is accepted.

CEV-ONBOARD-HISTORY-68D is assigned to Blake for backend-only implementation of the accepted history/re-enable APIs. Atlas and Quinn reviews are required before Morgan acceptance.

## Guided onboarding history API review blocker

CEV-ONBOARD-HISTORY-68D is not accepted. Blake's backend implementation passed local checks, but Atlas and Quinn both BLOCKED review because history cursors were plain base64 JSON without integrity protection or expiry. The accepted HISTORY68C contract requires opaque, server-protected cursors that reject tampering and expire or fail safely. Morgan returned the task to Blake for a narrow cursor protection fix and tests.

## Guided onboarding history API backend acceptance

CEV-ONBOARD-HISTORY-68D is accepted with limitations after Blake implementation, cursor fix, Atlas PASS WITH LIMITATIONS re-review and Quinn PASS WITH LIMITATIONS re-review. The accepted local backend adds owner/admin retained history listing and one-row re-enable APIs while preserving bounded normal setup snapshots. The prior cursor blocker is resolved locally by private server-side cursor records with opaque UUID tokens, actor/filter binding and expiry. Evidence reported by Blake/Atlas/Quinn includes focused history action tests, embedded onboarding command database checks and Quinn-reported `pnpm check` PASS with 702 Vitest tests and production build. Hosted Supabase, live concurrency, hosted migration/advisor, browser/RSC payload, provider and production gates remain open.

CEV-PILOT-INTAKE-69A is assigned to Morgan to create a first-client intake package and pilot readiness document.

## First-client intake package acceptance

CEV-PILOT-INTAKE-69A is accepted with limitations as documentation. The new docs/business/FIRST_CLIENT_INTAKE.md collects business profile, service area, services, hours, date exceptions, call handling, emergency/escalation rules, lead qualification, pilot booking policy, Make/Retell/Twilio/calendar readiness, fictional test data and owner approvals. The new docs/business/FIRST_CLIENT_PILOT_READINESS.md explains what can be sold now as a managed pilot, what remains manual, claims to avoid, evidence still needed, first-client fit, launch checklist and stop conditions. These docs do not prove hosted/live/provider/production readiness.

## First-client demo script acceptance

CEV-PILOT-DEMO-69B is accepted with limitations as documentation. The new docs/business/FIRST_CLIENT_DEMO_SCRIPT.md gives a plain-language managed-pilot demo script with fictional data, prohibited claims and stop rules. The new docs/project/PILOT_LOCAL_WALKTHROUGH.md gives a manual local checklist for Setup, Settings, role privacy, CRM/work management and voice/Make dry-run readiness. These docs do not prove browser, hosted, live provider or production readiness.

## Make and Retell dry-run package acceptance

CEV-MAKE-DRYRUN-69C is accepted with limitations as documentation. The new docs/ops/MAKE_RETELL_DRY_RUN_CHECKLIST.md gives a safe manual Make/Retell dry-run procedure using a duplicate or isolated scenario, disabled live side-effect modules, event filtering, required-field handling, duplicate checks, urgent-review handling and pass/fail evidence. The new docs/ops/MAKE_RETELL_TEST_PAYLOAD.md provides fictional analyzed-call style payloads and expected safe output shapes. No live provider account, webhook, SMS, email, calendar, hosted database, browser or production behavior was changed or verified.

## First-client sales packet acceptance

CEV-PILOT-SALES-69D is accepted with limitations as documentation. The new docs/business/FIRST_CLIENT_SALES_PACKET.md frames the first sellable version as a managed pilot, identifies good and poor first-client fits, gives a sales call structure and talk track, lists safe claims and prohibited claims, and defines the evidence needed before moving from sales demo to live pilot. No pricing, legal, payment, live provider, hosted database, browser, production or external-send behavior was changed or verified.

## First-client evidence tracker acceptance

CEV-PILOT-EVIDENCE-69E is accepted with limitations as documentation. The new docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md gives pass/fail tables for sales-demo readiness, local walkthrough evidence, role privacy, Make/Retell fictional dry-run evidence, owner approval gates, live-pilot go/no-go and evidence quality rules. It keeps live provider, SMS/email/calendar, hosted write and production actions blocked until explicit owner approval and later evidence. No runtime, browser, provider, database, hosted or production behavior was changed or verified.
## Local verification after first-client documentation

On 2026-10-05, Morgan ran `pnpm check` after the first-client dry-run, sales and evidence documentation updates. Result: PASS. The command completed typecheck, lint, 16 Vitest files with 702 passing tests, embedded PostgreSQL migration/RLS/role/identity/idempotency/audit suites, onboarding command embedded checks and the Next.js production build. Reported limitations remain: embedded auth fixtures do not prove live Supabase JWT/PostgREST, hosted database behavior, browser multi-user behavior, live provider behavior or production readiness.

## Supabase local password recovery redirect acceptance

CEV-AUTH-RESET-70A is accepted with limitations after Morgan updated hosted Supabase Auth URL Configuration for the Cevanta Development project. The Redirect URLs list now includes http://127.0.0.1:3000/auth/recovery, matching the local development password recovery callback used by the app. Morgan verified the URL persisted after reloading the Supabase settings page and saved screenshot evidence. Actual reset email delivery, link opening from the owner's inbox, password update submission and subsequent local sign-in remain owner-performed and unverified.

## Public auth proxy stall fix acceptance

CEV-AUTH-PROXY-70B is accepted with limitations after Morgan fixed the local password-recovery rendering stall. The proxy now skips hosted Supabase getUser() refresh for public auth entry routes (/, /sign-in, /forgot-password, /auth/callback, /auth/recovery) while protected routes and server actions retain verified-user checks. Evidence: before the fix /forgot-password waited about 25.5 seconds in proxy.ts with AuthRetryableFetchError: fetch failed; after the fix a direct local request returned 200 in about 266 ms and the dev server logged GET /forgot-password 200 in 79ms. pnpm check passed with typecheck, lint, 706 Vitest tests, embedded database suites, onboarding command checks and production build. Reset email delivery, password update and sign-in remain owner-performed and unverified.

## Password recovery callback format acceptance

CEV-AUTH-RECOVERY-70C is accepted with limitations after Morgan updated the local password recovery callback to accept both safe Supabase 	oken_hash recovery links and safe PKCE code callback links. Ambiguous, duplicated, unsafe or oversized callback values fail closed to the generic recovery error path. Evidence: pnpm check passed with typecheck, lint, 711 Vitest tests, embedded database suites, onboarding command checks and production build. Actual reset email delivery, owner link opening, password update and local sign-in remain owner-performed and unverified.

## Existing Auth user demo membership acceptance

CEV-AUTH-MEMBER-70D is accepted with limitations as hosted development access setup. Supabase invitation for jhherrick80@gmail.com failed with mail rate limit exceeded, so Morgan provisioned the existing Auth user 
extgenerationpropertyservices@gmail.com as owner of the fictional Cevanta Demo HVAC workspace. Supabase SQL Editor returned one row for tenant 10000000-0000-4000-8000-000000000001, user dea739e1-2fb9-44a3-8605-b5b7565effb5, role owner. Actual local sign-in and backend journey testing remain pending.

## Authenticated workspace access observed

On 2026-10-05, the owner reported successful local authenticated access to the Cevanta Demo HVAC workspace after CEV-AUTH-MEMBER-70D. Ambient browser context showed the app at /workspaces/10000000-0000-4000-8000-000000000001/jobs. This is owner-observed live sign-in/workspace access evidence. It does not yet prove all backend create/update flows, role matrix, tenant isolation, hosted PostgREST tests or production readiness.

## Owner job save observed

On 2026-10-05, after hosted Auth owner membership setup, the owner reported that a job saved from the local authenticated demo workspace Jobs page. This is owner-observed backend write evidence for the owner job flow. Refresh persistence, direct database verification, limited-role denial, tenant isolation and full browser evidence remain pending.

## Owner browser backend flow smoke acceptance

CEV-BACKEND-BROWSER-70E is accepted with limitations as owner-browser evidence. Morgan verified in the authenticated local browser that the Jobs page reloads and still shows Test backend job; created fictional lead AI missed call test 2026-10-05 0737; refreshed and confirmed the lead persisted; opened the lead detail; converted it into a job; opened the converted job detail; and opened the Calendar page where the converted job appeared as a selectable job for appointment creation. Screenshot evidence is saved at docs/project/backend-flow-browser-proof-2026-10-05.png. This does not prove limited-role denial, cross-tenant access, direct API bypass, hosted PostgREST/JWT negative tests, live Retell/Make/Twilio, external sends, production readiness or independent Quality review.

## Owner browser proof pass acceptance

CEV-BACKEND-PROOF-70F is accepted with limitations as browser proof. Morgan verified the signed-in owner session against hosted development Supabase: the prior job/lead/lead-to-job flow remained accepted; calendar appointment `Fictional missed-call appointment test` was saved and appeared after reload linked to the converted missed-call job; direct navigation to the second demo workspace failed safely with a generic error and exposed no second-tenant data; and the workspace switcher showed only Cevanta Demo HVAC. Setup and Settings are blocked in this hosted browser path because the onboarding snapshot is unavailable: Setup shows a safe unavailable message, and Settings shows saved profile details but blocks safe saving. `pnpm check` passed with typecheck, lint, 711 Vitest tests, embedded PostgreSQL suites, onboarding command checks and production build. This supports a managed-pilot sales demo of the CRM/work/calendar foundation only. Setup editing, role-matrix browser coverage, direct hosted PostgREST/JWT negative tests, live Retell/Make/Twilio/SMS/email/external calendar behavior, production deployment and independent Quality review remain open.

## Hosted Setup repair acceptance

CEV-SETUP-HOSTED-71A is accepted with limitations as a hosted development repair. Morgan verified the hosted development Supabase project was missing the onboarding storage objects and six public onboarding RPCs, then applied the complete existing reviewed migrations `202610020005_onboarding_setup.sql` and `202610020006_onboarding_commands.sql` through the Supabase SQL editor. Hosted catalog checks now show the six public onboarding RPCs are `security definer`, owned by `postgres`, use `search_path=""`, allow `authenticated` execute and deny `anon` execute; onboarding private helpers are not executable by anon/authenticated; and onboarding tables have RLS enabled. Browser evidence: owner Setup loads, fictional business details save and reload in a fresh Setup tab, Settings saves, and wrong-workspace Setup still fails safely. `pnpm check` passed with typecheck, lint, 711 Vitest tests, embedded PostgreSQL suites, onboarding command checks and production build. This repairs the earlier Setup/Settings blocker in hosted development only. Production deployment, provider connection, live Retell/Make/Twilio/SMS/email/external calendar behavior, lower-role browser matrix and hosted direct PostgREST/JWT bypass tests remain open.

## Self-service SaaS launch plan acceptance

CEV-SELF-SERVE-72 is accepted as planning after Blake, Echo and Phoenix read-only reviews. The current app supports an existing managed workspace in hosted development, but full self-service SaaS launch is not implemented. The launch sequence is recorded in `docs/project/SELF_SERVICE_SAAS_LAUNCH_PLAN.md`: Phase 1 verified owner signup and atomic workspace provisioning; Phase 2 team/invitation lifecycle; Phase 3 billing/entitlements; Phase 4 provider connection and receptionist activation; Phase 5 production release. `pnpm check` passed after the planning update. The recommended next implementation task is Phase 1. Billing provider/pricing, domain/hosting, sender email/domain, backup/recovery target and explicit production approval remain owner decisions.


## Self-service owner signup and workspace provisioning acceptance

CEV-SELF-SERVE-73A is accepted with limitations as Phase 1 self-service SaaS launch work. Morgan implemented `/sign-up`, Supabase Auth signup handling, a first-workspace creation form for signed-in users with no memberships, and migration `202610020007_workspace_provisioning.sql` with authenticated-only RPC `public.provision_owner_workspace(jsonb)`. The RPC uses the verified Auth identity, validates only `request_id`, `name`, `trade` and `timezone`, creates tenant and owner membership atomically, records audit/receipt evidence, safely replays duplicate submits, rejects changed request reuse, and denies anonymous/unconfirmed/deleted/existing-member users. Hosted development Supabase migration `workspace_provisioning` was applied to project `rafiksklbrfgefkypvkn`; catalog verification confirmed one public authenticated RPC, anon denied, private helper not exposed, receipt RLS enabled and no direct authenticated receipt table privilege. Browser smoke confirmed `/sign-up` renders and the existing signed-in owner still sees only the current Cevanta Demo workspace. `pnpm check` passed with typecheck, lint, 726 Vitest tests, embedded database suites, the new provisioning database suite and production build. Limitations: fresh hosted signup email confirmation and first-workspace creation with a fresh confirmed hosted Auth user remain unverified; billing, provider activation, live AI receptionist behavior, team invitations and production deployment remain separate phases.

## Fresh self-service owner browser proof

On 2026-10-05, after CEV-SELF-SERVE-73A, the owner reported that the Supabase signup confirmation link worked when opened on the local development computer, then signed in with the new account, created a workspace using their name, and confirmed the workspace pages loaded. This is owner-observed proof for fresh Auth signup confirmation, first-workspace provisioning and basic page access in local development against hosted Supabase. Remaining evidence gaps: Morgan has not independently verified the new workspace ID, Setup save/reload, CRUD persistence in that new workspace, role/tenant negative checks for the new workspace, billing, live Retell/Make/Twilio behavior or production deployment.

## Fresh self-service workspace backend flow proof

On 2026-10-05, the owner reported that the fresh self-service workspace flow worked after creating test data: fake lead creation, page refresh persistence, lead-to-job conversion, calendar appointment creation and appointment refresh persistence. This is owner-observed proof that the core backend flow works in a newly provisioned workspace. Remaining gaps: Morgan has not independently captured browser screenshots for the fresh workspace, lower-role privacy checks remain open, hosted direct JWT/PostgREST bypass checks remain open, live Retell/Make/Twilio behavior remains unverified, billing is not implemented and production deployment is not approved.

## Retell call-result to lead ingestion acceptance

CEV-VOICE-74A is accepted with limitations as the first safe live-receptionist ingestion slice. Morgan added a gated Retell lead-writer path behind `RETELL_INGRESS_LEAD_WRITER=enabled`, while preserving default no-writer verification. The route verifies raw Retell signatures before persistence, normalizes only safe analyzed-call fields into an office-review lead draft, never trusts tenant IDs from payloads, and does not store raw transcripts, recordings, signatures, webhook URLs or provider payloads. Migration `202610020008_retell_lead_ingestion.sql` adds private Retell connection mappings and private event receipts plus service-role-only RPC `public.ingest_retell_call_lead(jsonb)`, which resolves tenant ownership from server-owned connection ID and Retell agent/account ID, creates one lead, and replays duplicate provider event/call deliveries. Hosted development Supabase migration `retell_lead_ingestion` was applied to project `rafiksklbrfgefkypvkn`; catalog verification confirmed one service-role-only RPC, anon/authenticated denied, private helper not exposed, mapping/receipt RLS enabled and no direct authenticated private table access. `pnpm check` passed with typecheck, lint, 734 Vitest tests, all embedded database suites, Retell lead-ingestion SQL suite and production build. Limitations: writer mode is not configured with real secrets or mapping; no real Retell/Make/Twilio call, hosted HTTP raw-byte proof, provider sample compatibility proof, SMS/email/calendar external write, automatic booking or production deployment is accepted.

## Retell lead-ingestion hosted dry-run evidence

On 2026-10-05, Morgan prepared a fictional Retell connection mapping for the fresh self-service workspace `1cb2a226-84ef-4dcd-9976-5ce87dd3e449` using connection `49000000-0000-4000-8002-000000000001` and agent `agent_fictional_writer`. A hosted service-role RPC dry run created one fictional office-review lead from a Retell-style analyzed-call event: `Fictional AI Caller`, phone `+15550000009`, email `ai-caller@example.invalid`, high priority, with summary text only. A second delivery with the same event/call references replayed as a duplicate and did not create a second lead; database count for the dry-run caller remained one. The in-app browser UI check could not independently verify the Leads page because the browser session was no longer signed in and the route showed the generic sign-in/session error. Exact signed local HTTP writer proof remains blocked until `SUPABASE_SERVICE_ROLE_KEY` is added to `.env.local` as a server-only secret and the dev server is restarted. No real Retell/Make/Twilio call, SMS, email, external calendar write, automatic booking or production behavior is accepted.

## AI lead inbox notification acceptance

CEV-LEAD-NOTIFY-75A is accepted with limitations after the owner reported that new AI receptionist leads need a notification before launch. Morgan added a visible in-app Leads page notification for new AI receptionist leads, including a high-priority count and a direct `Review newest AI lead` link. AI-generated rows are marked `NEW AI LEAD` and source `AI receptionist`; manual leads and already-contacted AI leads do not trigger the new-lead alert. Evidence: focused tests passed, full `pnpm check` passed with 736 tests and production build, and browser proof showed the notification on the fresh workspace Leads page for `Fictional AI Caller`. Limitation: this is an in-app Leads page notification only, not browser push, SMS, email or mobile notification.

## AI lead conversion alert clearing acceptance

CEV-LEAD-CONVERT-75B is accepted with limitations after Morgan implementation and verification. Lead-to-job conversion now marks handled leads as `contacted` for unscheduled jobs or `scheduled` for scheduled jobs, so the AI receptionist alert clears after office review. The one-lead notification copy now reads correctly. Evidence on 2026-10-05: focused test command passed with 737 tests reported by the suite run; full `pnpm check` passed with typecheck, lint, 18 Vitest files / 737 tests, embedded database suites and production build. Browser proof using fictional data passed: `Fictional AI Caller` converted to a job, the lead detail changed to `contacted`, the lead inbox no longer showed the AI alert/badge for that handled lead, and the Jobs board showed the created job. External SMS/email/push notifications and real Retell provider delivery remain unverified.

## Workspace overview AI lead notice acceptance

CEV-LEAD-OVERVIEW-75C is accepted with limitations after Morgan implementation and verification. The workspace overview now checks for new AI receptionist leads and shows an in-app notice linking to the newest lead, while handled AI leads stay quiet. Leads page and overview share the same AI lead detection helper. Evidence on 2026-10-05: focused UI/job tests passed with 19 files / 739 tests reported, and full `pnpm check` passed with typecheck, lint, 19 Vitest files / 739 tests, embedded database suites and production build. This is in-app only; SMS/email/browser push and real Retell delivery remain unverified.

## Fresh workspace Setup browser proof

CEV-SETUP-BROWSER-76A is accepted with limitations as local browser proof for the fresh self-service workspace Setup path. Morgan verified the signed-in fresh workspace Setup page saved a fictional enabled service, all seven weekly-hour rows as closed, a 2026-10-06 closed-date override, request-only preferences with office-review acknowledgment, and one fictional enabled escalation contact after the built-in stale-data review step. The setup summary showed `1 services saved; 1 enabled`, `7 of 7 days saved`, `1 active date overrides saved`, request preferences saved and `1 contacts saved; 1 enabled`. No source code changed in this task. Limitations remain: production, lower-role Setup privacy, hosted direct JWT/PostgREST bypass, live Retell/Make/Twilio, SMS/email/external calendar behavior and live booking remain unverified.

## Setup role privacy automated evidence

CEV-ROLE-PRIVACY-76B is accepted with limitations as automated source evidence. Morgan ran the targeted onboarding/settings role-privacy tests on 2026-10-05; Vitest reported 19 test files / 739 tests passing. The covered paths keep dispatcher Setup read-only, keep technician/viewer Setup minimal, exclude private contact/sentinel data and deny limited-role setup mutations before RPC writes. This updates the first-client role privacy tracker as PASS WITH LIMITATIONS because separate dispatcher, technician and viewer browser sign-ins are still unproven.

## Current full local verification

On 2026-10-05, Morgan reran `pnpm check` after the latest setup and role-privacy evidence updates. Result: PASS. The command completed typecheck, lint, 19 Vitest files / 739 tests, embedded PostgreSQL migration/RLS/role/identity/idempotency/audit suites, onboarding command checks, workspace provisioning checks, Retell lead-ingestion embedded checks and the Next.js production build. Remaining limitations are unchanged: live provider behavior, external sends, hosted direct JWT/PostgREST role matrix, production deployment and live booking are not proven.

## Live provider readiness setup

CEV-LIVE-PROVIDER-77A is blocked on owner/provider access after safe preliminary checks. The owner confirmed their Twilio number is currently individual and business registration is still pending. Retell dashboard opened in the browser, but phone routing was not verified. Make opened to the sign-in page, blocking scenario inspection and dry-run execution. Local `.env.local` has the Retell prototype/writer flags and connection ID but does not have `SUPABASE_SERVICE_ROLE_KEY`; a fictional signed Retell-style request reached `/api/integrations/retell` and failed safely with `retryable_failure`, `persisted:false` and `bookingCreated:false`. No live call, SMS, email, external calendar write, Make activation, Twilio routing, production write or deployment occurred. Next required owner actions are Make sign-in and adding the server-only Supabase service-role key locally without pasting it into chat or source.

## Make safe dry-run copy

CEV-MAKE-SAFE-COPY-77B is blocked before execution after Make inspection and safe-copy setup. Morgan inspected active scenario `Cevanta Receptionist — New Draft v2` (`6495246`) without running it. It showed no current execution and 0 credits / 0 B data transfer in the last 7 days; history showed activation on 2026-10-05 at 10:15 AM. Morgan created inactive clone `Cevanta Receptionist — Safe Dry Run` (`6515596`) with a separate replacement webhook and verified it is inactive with no current execution and 0 usage. The clone still contains live side-effect modules: Gmail urgent alert, Google Calendar appointment creation, Gmail unavailable-time alert, Gmail callback email and SMS callback message. The Gmail urgent module still uses a real Gmail connection/recipient. The clone must not be run until those side effects are disabled, replaced with safe logging or guarded by explicit dry-run filters. No webhook URL, key, transcript or recording was recorded.

## Minimal safe Make dry-run plan

CEV-MAKE-MINIMAL-77C is ready for Make build as documentation. Morgan created docs/ops/MAKE_MINIMAL_SAFE_DRY_RUN.md, defining a minimal Make scenario with a new custom webhook, event filter, safe mapping and safe response/log only. Gmail, SMS, Google Calendar, Cevanta production writes, live Retell registration and Twilio routing remain blocked. No Make run or provider side effect occurred in this task.


## Twilio business verification note

Date: 2026-10-05

Safe stored facts only. Do not store EIN, IRS image, barcode, QR code, or full private notice in this repository.

- Owner provided an IRS EIN notice showing the legal EIN record name as `HEATH W HERRICK` and the trade/brand line as `CEVANTA`.
- Twilio Trust Hub rejected the primary compliance profile because the business registration number could not be verified.
- Correction path: use the IRS legal name for the legal business field and use `CEVANTA` only in DBA/trade/friendly-name fields when available.
- Business website supplied for review: https://cevanta.base44.app/
- SMS remains blocked for launch until Twilio or another provider approves the business/messaging registration.

## Retell-first launch decision

Date: 2026-10-05

Owner chose Retell-managed voice as the first launch path and may change telephony later. Twilio Trust Hub remains useful but is not blocking voice proof.

- Existing Retell agent identified from prior dashboard context: `agent_a9182cc8117ac588f68bc52a3d`.
- Retell deploy widget was opened for `Cevanta HVAC AI Receptionist`.
- SMS remains disabled until provider business/messaging compliance is approved.
- Next action: owner selects or provisions a Retell-managed number in the Retell deploy widget, then run a live voice test into the safe Make/Cevanta intake path only after the webhook routing is reviewed.

## Retell agent test gate

Date: 2026-10-05

Retell test widget opened for existing agent `agent_a9182cc8117ac588f68bc52a3d`. Before deploying to a live Retell-managed number, run a fictional HVAC caller test and verify the agent captures lead details without confirming appointments, sending SMS, creating calendar events, or promising emergency dispatch.

Pass condition: safe office-review lead capture.
Fail condition: appointment confirmation, emergency promise, payment request, lost contact data, or live side-effect claim.

## Retell agent safe behavior test

Date: 2026-10-05

Owner reported the existing Retell Cevanta agent said it would follow up about the service request and did not book anything. This passes the launch-safe behavior gate with limitations: it is owner-reported and not yet backed by transcript/exported Retell run evidence.

Next action: deploy the agent to a Retell-managed number, then run one live test call with fictional caller details.

## Retell number deployment verified

Date: 2026-10-05

Retell phone number `+1(207)407-9904` is present and inbound calls are assigned to `HVAC Receptionist Pilot v1 — Working/V3`, linked to agent `agent_a9182cc8117ac588f68bc52a3d`. Retell also displayed a low-credit warning with remaining balance around $4.92. SMS add-on remains off. Next action is one short live inbound test call with fictional caller details.

## Retell first live inbound call

Date: 2026-10-05

Owner reported the first live inbound call to Retell number `+1(207)407-9904` worked. This is owner-reported pass evidence. Next verification is to inspect Retell call history/transcript/analysis and confirm no unsafe booking/SMS/calendar claims were made.

- 2026-10-05: Owner reported the Retell inbound live test worked. Retell Call History later showed the latest inbound phone call ended successfully with a short duration, normal user hangup, neutral sentiment, and low latency. Safe evidence only: no transcript, recording, caller number, provider IDs, or private details stored. Remaining limits: Retell credits are low; SMS is not enabled; live Make/Cevanta write-through and booking still need clean duplicate handling, webhook wiring, and approval before production use.

- 2026-10-05: Make safe intake scenario duplicate handling was repaired and retested. Scenario `Cevanta Receptionist — MCP Intake Receiver` (`6515719`) now uses event routing, a direct Make data-store existence check, and separate duplicate/create paths. Fictional tests showed: new analyzed call created one review record and responded; duplicate analyzed call used duplicate response and did not run AddRecord; ignored non-analysis event responded without creating a record. Make labels these route-filtered runs as warnings, but module inspection showed zero module errors. Scenario was deactivated after testing; do not leave it always-on until Retell webhook connection and production write policy are approved.

- 2026-10-05: Added CEV-LAUNCH-78A workspace Launch readiness page. It gives a plain-language managed-pilot status, Retell/Make proof with limitations, owner-attention items, and a first-client demo path without exposing secrets or claiming production readiness. Local verification before full check: typecheck, lint, build and 739 tests passed.

- 2026-10-05: CEV-LAUNCH-78A full verification passed. `pnpm check` completed typecheck, lint, 739 tests, embedded database suites, Retell lead ingestion suite and production build; build output includes `/workspaces/[tenantId]/launch`.

- 2026-10-05: Added CEV-INTEGRATIONS-78B workspace Integrations readiness page. It shows Retell, Make, Cevanta lead intake, Twilio/SMS, Calendar, billing and production readiness without exposing secrets or enabling live side effects. Verification before full check: 741 tests, typecheck, lint and build passed; build output includes `/workspaces/[tenantId]/integrations`.

- 2026-10-05: CEV-INTEGRATIONS-78B full verification passed. `pnpm check` completed typecheck, lint, 741 tests, embedded database suites, Retell lead ingestion suite and production build; build output includes `/workspaces/[tenantId]/integrations` and `/workspaces/[tenantId]/launch`.

- 2026-10-05: Updated CEV-SALES-78C first-client sales, demo and intake docs. Materials now include Retell phone-answering proof, Make safe-intake duplicate-handling proof, Launch/Integrations demo steps, and continued gates for SMS, email, calendar writes, billing and production deployment. Documentation scan found no secret webhook URLs or accidental literal newline markers.

- 2026-10-05: Created `docs/project/OWNER_ATTENTION.md` to save decisions/actions for the owner: Retell credits, webhook activation path, production approval, first pilot boundary, SMS/email/calendar gates, Twilio registration, fresh signup proof, and pricing/package decisions.

## Pilot runbook and app packaging acceptance

CEV-PILOT-78D is accepted with limitations. The workspace now includes a Pilot runbook page and navigation link. The page gives first-client operating steps, office-review rules, no automatic booking/external-send/production claims, and clear stop rules. Evidence: focused pilot UI test passed; later full `pnpm check` passed with typecheck, lint, 22 Vitest files / 747 tests, embedded database suites, Retell lead-ingestion embedded suite and production build. This is guidance only; it does not activate live providers or external writes.

CEV-PACKAGE-79A is accepted with limitations. Cevanta now publishes an installable app manifest, icons and a safe service-worker shell so the hosted dashboard can be installed from Windows and Android browsers after production hosting is approved. Documentation is recorded in `docs/project/WINDOWS_ANDROID_PACKAGING.md`. Evidence: PWA install test passed with 4 tests; typecheck, lint and production build passed after the final change; full `pnpm check` passed with 22 files / 747 tests before the final local-install safe-context adjustment. No signed Windows `.exe`, MSIX, Android APK/AAB, app-store listing or production deployment was created. Those require owner approval for production URL, package type, publisher identity, signing and any store/developer-account costs.

## Production deployment preparation acceptance

CEV-DEPLOY-80A earlier blocked on Vercel authentication/linking after safe preparation; this was superseded by the 2026-10-05 production deployment update below. Morgan added `vercel.json`, `.vercelignore`, `docs/project/PRODUCTION_DEPLOYMENT.md` and README deployment notes. The release candidate passed `pnpm typecheck`, `pnpm lint`, `pnpm build` and full `pnpm check` with 22 Vitest files / 747 tests, embedded database suites, Retell lead-ingestion embedded suite and production build. The Vercel connector sees team `nextgenerationpropertyservices-1486's projects`, but the local repo has no Git remote and Vercel shows no linked Git projects. CLI deployment is blocked because the latest CLI login fails to resolve `@vercel/cli-auth` under the current pnpm/Node runtime, while the older CLI reports the saved token is invalid and Vercel has disabled legacy email login. No production URL was created; Supabase production redirect URLs and post-deploy browser proof remain blocked.

Local release commit `cdca042` was created on branch `main` after screenshots/local shortcut artifacts were excluded from Git. No remote URL is configured, so push/deploy remains blocked on the GitHub repository URL or exposed GitHub tools.

GitHub push completed for production release candidate: `main` is now on `https://github.com/nextgenerationpropertyservices-create/cevanta-ai-receptionist.git` from local commit `e1d75a3`. The earlier Vercel connector import blocker was superseded when the project was imported through the Vercel dashboard and deployed.

## Production deployment update — 2026-10-05

CEV-DEPLOY-80A is accepted with limitations for initial Vercel production deployment. GitHub `main` is pushed to `https://github.com/nextgenerationpropertyservices-create/cevanta-ai-receptionist.git`; Vercel project `cevanta-ai-receptionist` is live at `https://cevanta-ai-receptionist.vercel.app/`. Vercel Production env includes `APP_ORIGIN`, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; no service-role or live Retell writer secrets were added. Supabase Auth Site URL and redirect allow-list now include the production callback and recovery URLs while preserving local callback/recovery URLs. Evidence: Vercel redeploy READY from commit `e4f6235`; production `/api/health` returned HTTP200 with databaseConfigured true; production `/sign-in`, `/sign-up`, `/forgot-password` and `/auth/recovery` loaded. Remaining gates: private production signup email confirmation, password recovery email/token exchange, authenticated workspace save/reload, installable app checks, and all live Retell/Make/Twilio writer flows.

## Production launch smoke — 2026-10-05

CEV-LAUNCH-SMOKE-81A is accepted with limitations. Production `/api/health` returned HTTP200 with databaseConfigured true. Public production auth pages `/sign-in`, `/sign-up`, `/forgot-password` and `/auth/recovery` returned HTTP200. Installable app assets `/manifest.webmanifest`, `/sw.js`, `/icons/icon-192.png` and `/icons/icon-512.png` returned HTTP200. Browser check of `/sign-up` confirmed the owner-account form rendered and reported no console warnings/errors. No real signup, email delivery, password recovery token exchange, authenticated workspace persistence, install prompt or live Retell/Make/Twilio writer flow was executed.

## Production authenticated lead persistence — 2026-10-05

CEV-LAUNCH-LIVE-82A is accepted with limitations. Owner production workspace overview loaded for Heath Herrick. Authenticated production routes `/leads`, `/jobs`, `/calendar`, `/onboarding`, `/launch` and `/integrations` finished loading without console errors after wait. A clearly fictional production lead `Fictional Launch Smoke Lead 2026-10-05` was created through the UI with fictional contact/test data; the app reported `Lead saved successfully`, inbox count increased to 3, and the record remained visible after reload. This proves one hosted authenticated create/read path only. Remaining gates include customer/job/calendar persistence, edit flows, multiuser isolation, install prompt behavior, and live Retell/Make/Twilio writer flows.

## Production customer persistence — 2026-10-05

CEV-LAUNCH-LIVE-83A is accepted with limitations. The authenticated production Customers page loaded for owner Heath Herrick. A clearly fictional customer `Fictional Launch Smoke Customer 2026-10-05` was created through the UI with fictional contact/test data; the app reported `Saved successfully`, customer count changed to 1, and the record remained visible after reload. No console errors were reported. This proves one hosted authenticated customer create/read path only. Remaining gates include customer detail edit, service locations/equipment, job/calendar persistence, multiuser isolation, install prompt behavior, and live Retell/Make/Twilio writer flows.

## Production Retell ingress gate — 2026-10-05

CEV-RETELL-PROD-GATE-84A is implemented and accepted locally. The Retell endpoint no longer has an unconditional production block; production ingress still remains disabled by default and requires explicit `RETELL_INGRESS_PROTOTYPE=enabled` plus `RETELL_INGRESS_PRODUCTION=enabled`. Lead persistence still separately requires `RETELL_INGRESS_LEAD_WRITER=enabled`, a valid connection ID, a server-only service-role client and reviewed Supabase mapping. Evidence: focused Retell route/writer tests passed, `pnpm typecheck` PASS, `pnpm lint` PASS, `pnpm build` PASS, and `pnpm check` PASS with 22 Vitest files / 749 tests, all embedded DB suites and production build. Hosted env variables, tenant mapping and a signed fictional production payload remain next.

## Production Retell tenant mapping preparation — 2026-10-05

CEV-RETELL-PROD-MAP-84B is accepted with limitations. A private Supabase Retell connection mapping now routes connection ID `49000000-0000-4000-8002-000000000001` and Retell agent ID `agent_a9182cc8117ac588f68bc52a3d` to production workspace `1cb2a226-84ef-4dcd-9976-5ce87dd3e449`, enabled true. This does not enable production ingestion by itself. Vercel Retell env vars, signed production payload verification, service-role writer env, and actual Retell/Make lead creation remain next.

## Production Retell verifier-only proof — 2026-10-05

CEV-RETELL-PROD-VERIFY-84C is accepted with limitations. Vercel Production now has verifier-only Retell settings by name and was redeployed after the changes. Production `/api/health` returned HTTP200 with databaseConfigured true. An unsigned fictional Retell POST to `/api/integrations/retell` returned HTTP401 `rejected` with no persistence or booking. A signed fictional Retell POST for `call_prod_verifier_20261005_01` returned HTTP200 `verified_not_persisted` with `persisted:false` and `bookingCreated:false`. This proves hosted signature verification is active while the writer remains off. It does not yet prove live Retell dashboard webhook delivery, Make write-through, lead creation, duplicate handling in production, SMS/email/calendar writes, or booking.

## Make-to-Cevanta Retell lead bridge — 2026-10-05

CEV-MAKE-CEVANTA-BRIDGE-85A is implemented and accepted locally. Retell currently points to Make, so the app now has a separate disabled-by-default Make bridge at `/api/integrations/make/retell-lead`. It verifies a Make-specific signed raw body, accepts only a minimal Retell analyzed-call lead package, uses the existing service-role-only Retell lead-ingestion RPC, and keeps the same `call_analyzed:{call_id}` dedupe key. The route never books appointments, sends SMS/email or writes calendar events. Evidence: initial focused test found and fixed one duplicate fixture issue; after correction the focused bridge/proxy run passed, `pnpm typecheck` passed, `pnpm lint` passed, `pnpm build` passed, and full `pnpm check` passed with 23 Vitest files / 764 tests, all embedded DB suites, Retell lead-ingestion embedded suite and production build. Remaining gates: add production Vercel env values, redeploy, run a signed fictional hosted verifier-only payload, then patch/test Make before enabling live writer mode.

Hosted follow-up for CEV-MAKE-CEVANTA-BRIDGE-85A: after GitHub commit `b3f395a` reached Vercel, production `POST /api/integrations/make/retell-lead` returned HTTP404 JSON `disabled` with `persisted:false` and `bookingCreated:false`. The Make bridge is deployed and closed until production secrets and writer gates are intentionally added.

Hosted verifier follow-up for CEV-MAKE-CEVANTA-BRIDGE-85A: Vercel Production now has Make bridge verifier settings by name, with writer mode still unset. After redeploy, unsigned production POST returned HTTP401 `rejected`; signed fictional production POST for `call_make_prod_verifier_20261005_01` returned HTTP200 `verified_not_persisted` with `persisted:false` and `bookingCreated:false`. This proves the hosted Make bridge can verify signed deliveries without creating leads or bookings. The next gate is Make scenario patching and writer enablement; do not enable paid provider behavior or lead writer until explicitly safe.

## Make-to-Cevanta bridge update — 2026-10-05

CEV-MAKE-CEVANTA-BRIDGE-85A now has hosted verifier evidence and a Make canvas note. Production Cevanta accepts properly signed fictional Make bridge requests in verifier-only mode and rejects unsigned requests. Make scenario 6515719 remains inactive; note 353828 documents the exact minimal lead payload and security limits for the future HTTP bridge module. No Make module wiring was changed, no Make run was triggered, no lead writer was enabled and no booking/SMS/email/calendar effect occurred. Remaining gate: Quinn review and secure entry of the private Make bridge secret into Make before any activation or writer enablement.
