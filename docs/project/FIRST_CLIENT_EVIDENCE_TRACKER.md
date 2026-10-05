# First-client evidence tracker and go/no-go checklist

Date: 2026-10-05
Use: record readiness before a first-client sales demo, dry run, or live pilot.

This tracker is for evidence, not secrets. Do not paste API keys, webhook URLs, provider signatures, real customer records, call recordings, private screenshots, calendar IDs, or real transcripts here. Use fictional test data unless a later owner-approved live pilot task explicitly allows otherwise.

## Current readiness summary

| Area | Status | Evidence link or note | Next safe action |
| --- | --- | --- | --- |
| First-client intake doc | Ready as documentation | `docs/business/FIRST_CLIENT_INTAKE.md` | Complete for the chosen prospect |
| Demo script | Ready as documentation | `docs/business/FIRST_CLIENT_DEMO_SCRIPT.md` | Use only fictional data |
| Local walkthrough checklist | Ready as documentation | `docs/project/PILOT_LOCAL_WALKTHROUGH.md` | Run before demo |
| Make/Retell dry-run checklist | Ready as documentation | `docs/ops/MAKE_RETELL_DRY_RUN_CHECKLIST.md` | Run in safe scenario only |
| Sales packet | Ready as documentation | `docs/business/FIRST_CLIENT_SALES_PACKET.md` | Use managed-pilot language |
| Managed pilot launch walkthrough | Ready as documentation | `docs/business/PILOT_LAUNCH_WALKTHROUGH.md` | Use as the step-by-step launch path before client commitment |
| Live provider readiness | Blocked | 2026-10-05: Retell dashboard opens; Make requires sign-in; Twilio number exists as individual but SMS/business rollout waits for registration; local Retell writer fails safely until server-only Supabase key is configured. | Sign in to Make, add server-only local service key, then rerun signed Retell HTTP writer test. |
| Production deployment | PASS WITH LIMITATIONS | 2026-10-05: Vercel production app exists at https://cevanta-ai-receptionist.vercel.app/; production lead/customer persistence smokes accepted with limitations. Provider writers, billing, role-browser matrix, backup/restore and live pilot gates remain open. | Sell only as managed pilot after owner-approved boundary. |

## Sales demo go/no-go

Go for a managed-pilot sales demo only when the required rows are pass.

| Check | Required for sales demo? | Result | Evidence note |
| --- | --- | --- | --- |
| Demo uses fictional data only | Yes |  |  |
| No secrets or provider settings visible | Yes |  |  |
| Managed-pilot language used | Yes |  |  |
| Prohibited claims avoided | Yes |  |  |
| Local app opens for demo path | Recommended |  |  |
| Setup/onboarding can be shown | Recommended |  |  |
| CRM/work/calendar foundation can be shown honestly | Recommended |  |  |
| Make/Retell described as dry-run pending unless evidence exists | Yes |  |  |
| Prospect understands office review remains required | Yes |  |  |

Sales demo decision:

- Result:
- Date:
- Owner/operator:
- Next action:

## Local walkthrough evidence

Use this after running `docs/project/PILOT_LOCAL_WALKTHROUGH.md`.

| Area | Expected result | Result | Evidence note |
| --- | --- | --- | --- |
| Local full check | `pnpm check` completes | PASS | 2026-10-05: latest run passed typecheck, lint, 19 Vitest files with 739 tests, embedded database suites, Retell lead-ingestion embedded suite and production build. This does not prove live/provider/production behavior. |
| Supabase Auth recovery redirect | Local reset callback is allowed in Supabase | PASS WITH LIMITATIONS | 2026-10-05: `http://127.0.0.1:3000/auth/recovery` added and verified in hosted Supabase Redirect URLs. Email delivery/password update/sign-in still owner-unverified. |
| Public auth page rendering | Forgot-password opens without hosted Auth proxy stall | PASS | 2026-10-05: proxy public-route fix verified; `/forgot-password` returned 200 in about 266 ms, dev server logged 79 ms, and `pnpm check` passed with 706 tests/build. |
| Password recovery callback formats | Recovery route accepts safe `token_hash` and PKCE `code` callbacks | PASS WITH LIMITATIONS | 2026-10-05: callback fix verified; `pnpm check` passed with 711 tests/build. Real email delivery/password update/sign-in still owner-unverified. |
| Existing Auth user demo membership | Business email has owner access to demo workspace | PASS WITH LIMITATIONS | 2026-10-05: Supabase SQL returned tenant/user/role owner row. Actual local sign-in/backend journey still pending. |
| Authenticated workspace access | Owner reached demo workspace route locally | PASS WITH LIMITATIONS | 2026-10-05: owner reported “ok im in”; browser context showed `/workspaces/10000000-0000-4000-8000-000000000001/jobs`. Backend create/update flows still need testing. |
| Owner job save | Owner reported a job saved from the Jobs page | PASS WITH LIMITATIONS | 2026-10-05: owner reported “ok job saved.” Refresh persistence and role/tenant negative checks still pending. |
| Owner browser backend flow smoke | Job persistence, lead creation, lead detail, lead-to-job conversion and calendar page checked | PASS WITH LIMITATIONS | 2026-10-05: browser test passed with fictional data; proof screenshot saved. Live provider path still pending. |
| Owner browser proof pass | Calendar appointment persistence and wrong-workspace denial checked | PASS WITH LIMITATIONS | 2026-10-05: saved appointment `Fictional missed-call appointment test` appeared after reload; wrong workspace route failed safely without exposing second-tenant data. Setup/Settings remain blocked. |
| Local app starts | App opens locally | PASS | 2026-10-05: local app is running at `http://127.0.0.1:3000` and authenticated workspace routes load. |
| Owner/admin sign-in | Workspace loads | PASS WITH LIMITATIONS | 2026-10-05: signed-in owner session loaded Cevanta Demo HVAC. Real reset-email delivery remains unverified. |
| Setup business profile | Saves and reloads with fictional data | PASS WITH LIMITATIONS | 2026-10-05: hosted onboarding migrations were applied to development; Setup loaded, saved fictional contact details and reloaded them in a fresh tab. Production and lower-role browser matrix remain unproven. |
| Services | Service can be saved/reviewed | PASS WITH LIMITATIONS | 2026-10-05: Morgan verified in the signed-in fresh workspace Setup page that a fictional enabled service saved and the summary showed `1 services saved; 1 enabled`. |
| Weekly hours | Hours can be saved/reviewed | PASS WITH LIMITATIONS | 2026-10-05: Morgan verified all seven weekly-hour rows saved as closed in the fresh workspace; summary showed `7 of 7 days saved`. This proves safe storage, not bookable availability. |
| Date exceptions | Exceptions can be added/removed safely | PASS WITH LIMITATIONS | 2026-10-05: Morgan verified a fictional closed-date override for 2026-10-06 saved and reloaded; summary showed `1 active date overrides saved`. Remove-path proof remains unrun. |
| Request preferences | Office-review preferences save | PASS WITH LIMITATIONS | 2026-10-05: Morgan verified request-only preferences saved in the fresh workspace: 60-minute notice, 15-minute before/after buffers, 14-day horizon, office-review note and acknowledgment. Live booking remains disabled. |
| Escalation contacts | Owner/admin-only contact data stays private | PASS WITH LIMITATIONS | 2026-10-05: Morgan verified one fictional enabled escalation contact saved in the fresh workspace after the built-in review step. Owner/admin save path works; lower-role privacy remains unproven. |
| Settings | Uses accepted onboarding-safe path | PASS WITH LIMITATIONS | 2026-10-05: Settings rendered editable form and saved successfully after hosted Setup repair. Production and lower-role browser matrix remain unproven. |
| Customers/leads/jobs/calendar foundation | Can be shown without live-provider claims | PASS WITH LIMITATIONS | 2026-10-05: fictional job, lead, lead-to-job conversion and calendar appointment persistence proved in owner browser. |

Local walkthrough decision:

- Result: PASS WITH LIMITATIONS for managed-pilot demo foundation, fresh workspace setup storage and hosted development Setup/Settings editing.
- Date: 2026-10-05
- Owner/operator: Morgan
- Blockers: Live provider behavior, self-service signup/provisioning, billing, production deployment and lower-role browser matrix are not proven.
- Next action: Build self-service launch tasks for signup/provisioning, billing, provider onboarding, production release and live provider proof.

## Role privacy evidence

Use fictional users/accounts only.

| Role | Expected result | Result | Evidence note |
| --- | --- | --- | --- |
| Owner/admin | Can access setup controls | PASS WITH LIMITATIONS | 2026-10-05: Owner browser path proved Setup editors save in fresh workspace; automated onboarding UI/action/settings tests passed with 739 total tests. Separate admin browser account not exercised. |
| Dispatcher | No owner-only mutation/private history controls | PASS WITH LIMITATIONS | 2026-10-05: Automated onboarding UI/action/settings tests passed and cover dispatcher read-only operations summary, denied setup mutations and private contact/sentinel exclusion. Browser dispatcher account not exercised. |
| Technician | No owner-only setup/private history controls | PASS WITH LIMITATIONS | 2026-10-05: Automated onboarding UI/action/settings tests passed and cover technician minimal access, no owner status/editor links and denied setup mutations. Browser technician account not exercised. |
| Viewer | No owner-only setup/private history controls | PASS WITH LIMITATIONS | 2026-10-05: Automated onboarding UI/action/settings tests passed and cover viewer minimal access, no owner status/editor links, rejected sensitive extra keys and denied setup mutations. Browser viewer account not exercised. |

Role privacy decision:

- Result: PASS WITH LIMITATIONS from automated source tests; browser checks with separate limited-role accounts remain open.
- Date: 2026-10-05
- Blockers: No disposable dispatcher, technician or viewer browser credentials are currently configured for hosted development.
- Next action: Create or invite disposable limited-role test users in hosted development, then run browser privacy checks before live pilot.

## Make/Retell fictional dry-run evidence

Use `docs/ops/MAKE_RETELL_DRY_RUN_CHECKLIST.md` and `docs/ops/MAKE_RETELL_TEST_PAYLOAD.md`.

| Test case | Expected result | Result | Make run/evidence note |
| --- | --- | --- | --- |
| Safe scenario copy exists | Live side-effect modules disabled or replaced | PASS WITH LIMITATIONS | 2026-10-05: inactive Make dry-run copy `Cevanta Receptionist — Safe Dry Run` still contains Gmail, Calendar and SMS modules and must not be run. Separate Make MCP scenario `Cevanta Receptionist — MCP Intake Receiver` (`6515719`) was created instead with only webhook intake and safe webhook response modules. |
| Fictional payload learning | Make captures the fictional Retell-style shape without running live side effects | PASS WITH LIMITATIONS | 2026-10-05: Sent one fictional `call_analyzed` payload to the Make MCP intake receiver. Make accepted it, learning mode switched off, data structure shows `event`, `event_id`, `created_at`, and `call`, queue count stayed 0, and execution history stayed empty. This proves webhook payload learning only, not an active workflow run. |
| Happy path `call_analyzed` | One safe office-review output | PASS WITH LIMITATIONS | 2026-10-05: Added Make data store `Cevanta MCP Intake Review Log`, activated the scenario for one fictional request, received HTTP 200, then deactivated it. Make execution `8b70fb6a305f406b8fc20586bc3bca97` succeeded with three operations: webhook intake, data-store add and webhook response. Data store shows one record. This proves Make-side fictional dry-run only, not live Retell/Twilio/Cevanta behavior. |
| Duplicate call ID | No duplicate output | PARTIAL PASS WITH BUG | 2026-10-05: Added call-ID keying to the Make data-store add step. Duplicate fictional calls did not increase the review-log record count beyond one record per call ID, but Make still records a duplicate-key execution error instead of a clean duplicate skip. Needs a proper duplicate branch/response before live use. |
| Missing date/time | Office review; no confirmed appointment |  |  |
| Missing service type | Incomplete/review state; no booking |  |  |
| Wrong event type | Filter stops; no output | PASS WITH LIMITATIONS | 2026-10-05: Sent fictional `call_started` event while scenario was briefly active. Make execution succeeded with one operation only and review-log record count did not increase. This proves the non-analyzed event did not create a review record. |
| Urgent language | Urgent office review; no emergency promise |  |  |
| Invalid phone/address | Incomplete/review state; no live side effect |  |  |
| Out-of-order retry | Final event creates/updates one safe output only |  |  |

Make/Retell dry-run decision:

- Result: MAKE-SIDE FICTIONAL DRY-RUN PASSED WITH LIMITATIONS; duplicate protection prevents duplicate records but still logs duplicate-key errors, so do not activate as an always-on scenario yet.
- Date: 2026-10-05
- Scenario name: `Cevanta Receptionist — MCP Intake Receiver` (`6515719`)
- Fictional call IDs used: `call_live_local_fictional_001_*` for local Retell endpoint safe-failure proof.
- Blockers: Duplicate/retry handling needs a clean branch/response instead of duplicate-key errors; missing local `SUPABASE_SERVICE_ROLE_KEY`; no public Retell webhook URL/tunnel or approved production deployment; Twilio SMS/business rollout awaits registration.
- Next action: Add a proper duplicate branch/response in Make, then retest duplicate retry without execution errors before any live Retell/Twilio/Cevanta connection.

## Owner approval gates

These must be explicit before the action happens.

| Action | Approval status | Approval evidence | Notes |
| --- | --- | --- | --- |
| Make scenario always-on activation | Not approved |  | Scenario remains inactive; do not activate if it can consume operations or process live calls without explicit owner approval. |
| Retell webhook registration/change | Partially completed with limitations | 2026-10-05: Retell is pointed to Make for call analysis flow; Cevanta verifier endpoints exist. | Do not change to writer/live client behavior without approval. |
| Twilio phone routing to Retell | Not approved |  |  |
| Live test call | Not approved |  |  |
| SMS send | Not approved |  |  |
| Email send | Not approved |  |  |
| Google Calendar create/update | Not approved |  |  |
| Production Cevanta write from Make/Retell | Not approved |  | Make/Retell production endpoints are verifier-only; writer env remains gated. |
| Production deployment | Approved/completed with limitations | 2026-10-05: Owner connected GitHub/Vercel and production app is live. | Does not approve paid credits, billing, Make always-on activation, provider writers, SMS/email/calendar writes or live client commitments. |

## Live pilot go/no-go

Do not mark live pilot ready unless every required row is pass or explicitly accepted as a limitation by the owner.

| Gate | Required result | Result | Notes |
| --- | --- | --- | --- |
| Intake complete | Services, hours, rules, reviewer and escalation policy recorded |  |  |
| Sales expectations aligned | Client accepts managed pilot and office review |  |  |
| Local walkthrough | Critical demo path passes with fictional data |  |  |
| Role privacy | Limited roles do not expose owner-only/private setup controls |  |  |
| Make/Retell dry run | Safe scenario passes all required dry-run cases |  |  |
| Duplicate protection | Duplicate call ID creates no second output |  |  |
| Side effects disabled | SMS/email/calendar/live writes off unless separately approved |  |  |
| Owner approval for next live action | Explicit approval recorded |  |  |
| Rollback/stop path known | Operator knows how to pause scenario/provider route |  |  |

Live pilot decision:

- Result:
- Date:
- Approved next action:
- Remaining blockers:
- Stop/rollback path:

## Evidence quality rules

Good evidence:

- fictional call ID or event ID
- date/time of run
- scenario name
- pass/fail result
- screenshot only if it contains no secrets and no real customer data
- short note explaining actual result

Bad evidence:

- webhook URL
- API key or token
- provider signature/header value
- real customer name, phone, address or transcript
- recording link
- private dashboard screenshot showing secrets
- unverified claim like "it works" with no run note

## Next safe action menu

Pick one only when the previous evidence supports it:

1. Run the local walkthrough with fictional data.
2. Run the Make/Retell dry run in a safe duplicate scenario.
3. Ask Echo to review provider-specific setup after dry-run evidence exists.
4. Ask Quinn to review dry-run evidence before any live side effect.
5. Ask the owner for explicit approval for one live action, with the exact action and rollback path.









## Self-service launch evidence

| Area | Expected result | Result | Evidence note |
| --- | --- | --- | --- |
| Self-service owner signup | Owner account form exists and uses safe Supabase Auth handling | PASS WITH LIMITATIONS | 2026-10-05: `/sign-up` renders locally; app tests cover safe signup success/error handling. Fresh email confirmation not yet verified. |
| First-workspace provisioning | New confirmed owner with no memberships can create first workspace through reviewed RPC | PASS WITH LIMITATIONS | 2026-10-05: embedded SQL and app tests passed; hosted migration applied and catalog grants verified. Fresh hosted browser account creation remains unverified. |

## Fresh self-service browser evidence

| Area | Expected result | Result | Evidence note |
| --- | --- | --- | --- |
| Fresh owner confirmation link | Confirmation opens on local app computer | PASS WITH LIMITATIONS | 2026-10-05: owner reported the email link worked after opening it on the same computer as the local app. |
| Fresh self-service workspace | New confirmed owner can create workspace and load workspace pages | PASS WITH LIMITATIONS | 2026-10-05: owner reported signing in, creating workspace using their name, and workspace pages loaded. Morgan has not yet independently checked CRUD persistence in that new workspace. |

## Fresh self-service backend flow evidence

| Area | Expected result | Result | Evidence note |
| --- | --- | --- | --- |
| Fresh workspace fake lead | Create and reload fake lead | PASS WITH LIMITATIONS | 2026-10-05: owner reported it worked in newly provisioned workspace. |
| Fresh workspace lead-to-job | Convert fake lead to job | PASS WITH LIMITATIONS | 2026-10-05: owner reported it worked in newly provisioned workspace. |
| Fresh workspace calendar appointment | Create and reload fake appointment for converted job | PASS WITH LIMITATIONS | 2026-10-05: owner reported it worked in newly provisioned workspace. |

## Retell lead ingestion evidence

| Area | Expected result | Result | Evidence note |
| --- | --- | --- | --- |
| Retell signed payload verifier | Rejects bad signatures and malformed/unsupported events before persistence | PASS WITH LIMITATIONS | 2026-10-05: focused Retell tests and full check passed. Real Retell delivery remains unverified. |
| Retell call to lead writer | Gated writer can create or replay one office-review lead through trusted tenant mapping | PASS WITH LIMITATIONS | 2026-10-05: embedded SQL and app tests passed; hosted schema/grants verified. Local writer env/mapping and signed fictional HTTP dry run remain next. |
| Provider side effects | No SMS/email/calendar/live booking before approval | PASS | 2026-10-05: route returns `bookingCreated:false`; implementation creates leads only. |

## Retell hosted dry-run evidence

| Area | Expected result | Result | Evidence note |
| --- | --- | --- | --- |
| Hosted Retell mapping | Fictional Retell connection routes to fresh workspace | PASS WITH LIMITATIONS | 2026-10-05: mapping inserted for fresh workspace with fictional connection and agent IDs. |
| Hosted RPC dry run | One Retell-style event creates one office-review lead | PASS WITH LIMITATIONS | 2026-10-05: hosted RPC returned applied for fictional AI caller lead. This bypassed local HTTP because service-role env is not configured locally. |
| Duplicate Retell delivery | Duplicate event/call creates no second lead | PASS | 2026-10-05: duplicate replay left dry-run lead count at one. |
| UI lead visibility | Lead appears in Leads page | PASS WITH LIMITATIONS | 2026-10-05: signed-in browser later showed `Fictional AI Caller` in the Leads inbox as an AI receptionist source. |
| Signed local HTTP writer | Signed payload hits local route and creates lead | BLOCKED | 2026-10-05: fictional signed local request reached the route but returned safe `retryable_failure`, `persisted:false`, `bookingCreated:false` because `SUPABASE_SERVICE_ROLE_KEY` is missing from `.env.local`; requires server-only key and dev server restart. |

## AI lead notification evidence

| Area | Expected result | Result | Evidence note |
| --- | --- | --- | --- |
| AI lead in-app notification | New AI receptionist leads visibly alert office staff | PASS WITH LIMITATIONS | 2026-10-05: Leads page showed `New AI receptionist lead waiting`, high-priority count, review link and `NEW AI LEAD` row badge for `Fictional AI Caller`. In-app only; no SMS/email/push. |
| AI lead browser visibility | Lead appears in Leads page for signed-in owner | PASS WITH LIMITATIONS | 2026-10-05: signed-in browser showed `Fictional AI Caller` in the Leads inbox as an AI receptionist source. |
| AI lead conversion clears alert | Turning reviewed AI lead into a job clears the in-app new-lead alert | PASS WITH LIMITATIONS | 2026-10-05: Morgan converted fictional AI lead to a job; lead became `contacted`, inbox alert/badge cleared, and the job appeared on the dispatch board. |
| Workspace overview AI alert | New AI receptionist leads are visible before opening the Leads page | PASS WITH LIMITATIONS | 2026-10-05: automated dashboard render test confirms overview alert and newest-lead link; full check passed. In-app only. |










## Telephony provider cost/compliance comparison

Date: 2026-10-05

Do not store EIN, IRS notice image, barcodes, QR codes, or private tax identifiers in this tracker.

| Provider path | Current launch status | Compliance note | Cost note |
| --- | --- | --- | --- |
| Twilio | Blocked for SMS/business profile; voice may still be usable for controlled tests | Trust Hub rejected because business registration number could not be verified. Use IRS legal name, DBA Cevanta, and approved profile before SMS/A2P. | Existing account balance is not launch readiness. Costs depend on Twilio voice/SMS rates and compliance fees. |
| Retell-managed number | Recommended fallback for fastest voice proof | Still avoid SMS until business registration is clean. | Retell public pricing shows AI voice agents around $0.07-$0.31/min and Retell phone numbers around $2/month. |
| Plivo + Retell SIP | Strong fallback for voice | SMS still requires 10DLC/A2P compliance. | Plivo public US voice pricing shows local number $0.50/month, local inbound $0.0055/min, local outbound $0.0115/min, SIP calls $0.0033/min. |
| Telnyx + Retell SIP | Strong fallback for voice/SIP | SMS still requires 10DLC/A2P compliance. | Telnyx public pricing shows numbers from $1/month, voice API from $0.002/min plus SIP trunking, and SIP trunking from $0.0032/min. |
| Vapi platform switch | Larger stack change, not first fallback | Would replace Retell or require rebuild decisions. | Vapi public pricing shows usage-only at $0.05/min hosting plus model/voice/transcriber costs; example 1,000 minutes estimate is $82-$129/month. |

## Retell-first launch path evidence

Date: 2026-10-05

| Item | Status | Evidence note | Next action |
| --- | --- | --- | --- |
| Retell-first decision | Selected | Owner chose to use Retell first and change later if desired. | Use Retell-managed number for fastest voice proof. |
| Existing Retell agent | Ready to deploy | Deploy widget opened for `Cevanta HVAC AI Receptionist` / `agent_a9182cc8117ac588f68bc52a3d`. | Owner selects/provisions a Retell phone number in the widget. |
| Twilio dependency | Deferred | Twilio business verification can continue later; it no longer blocks initial Retell voice proof. | Fix Twilio only when ready for SMS/trusted caller setup. |
| SMS | Off | SMS remains blocked until business/messaging compliance is approved. | Do not enable SMS in Retell/Make/Cevanta yet. |

| Retell agent safe behavior test | Agent captures service request without confirming booking | PASS WITH LIMITATIONS | 2026-10-05: Owner reported the Retell agent said it would follow up about the service request and did not book anything. Need Retell transcript/run evidence and live number test before live client. |

| Retell phone number deployment | Inbound number assigned to Cevanta agent | PASS WITH LIMITATIONS | 2026-10-05: Retell number `+1(207)407-9904` shows inbound call agent `HVAC Receptionist Pilot v1 — Working/V3`. Retell showed low-credit warning around $4.92 remaining. SMS add-on remains off. Next: short live test call. |

| Retell first live inbound call | Number answers with Cevanta agent | PASS WITH LIMITATIONS | 2026-10-05: Owner reported the live call to `+1(207)407-9904` worked. Need Retell call history/transcript/analysis review before using as first-client proof. |

- 2026-10-05: Owner reported the Retell inbound live test worked. Retell Call History later showed the latest inbound phone call ended successfully with a short duration, normal user hangup, neutral sentiment, and low latency. Safe evidence only: no transcript, recording, caller number, provider IDs, or private details stored. Remaining limits: Retell credits are low; SMS is not enabled; live Make/Cevanta write-through and booking still need clean duplicate handling, webhook wiring, and approval before production use.

- 2026-10-05: Make safe intake scenario duplicate handling was repaired and retested. Scenario `Cevanta Receptionist — MCP Intake Receiver` (`6515719`) now uses event routing, a direct Make data-store existence check, and separate duplicate/create paths. Fictional tests showed: new analyzed call created one review record and responded; duplicate analyzed call used duplicate response and did not run AddRecord; ignored non-analysis event responded without creating a record. Make labels these route-filtered runs as warnings, but module inspection showed zero module errors. Scenario was deactivated after testing; do not leave it always-on until Retell webhook connection and production write policy are approved.

- 2026-10-05: Added CEV-LAUNCH-78A workspace Launch readiness page. It gives a plain-language managed-pilot status, Retell/Make proof with limitations, owner-attention items, and a first-client demo path without exposing secrets or claiming production readiness. Local verification before full check: typecheck, lint, build and 739 tests passed.

- 2026-10-05: CEV-LAUNCH-78A full verification passed. `pnpm check` completed typecheck, lint, 739 tests, embedded database suites, Retell lead ingestion suite and production build; build output includes `/workspaces/[tenantId]/launch`.

- 2026-10-05: Added CEV-INTEGRATIONS-78B workspace Integrations readiness page. It shows Retell, Make, Cevanta lead intake, Twilio/SMS, Calendar, billing and production readiness without exposing secrets or enabling live side effects. Verification before full check: 741 tests, typecheck, lint and build passed; build output includes `/workspaces/[tenantId]/integrations`.

- 2026-10-05: CEV-INTEGRATIONS-78B full verification passed. `pnpm check` completed typecheck, lint, 741 tests, embedded database suites, Retell lead ingestion suite and production build; build output includes `/workspaces/[tenantId]/integrations` and `/workspaces/[tenantId]/launch`.

- 2026-10-05: Updated CEV-SALES-78C first-client sales, demo and intake docs. Materials now include Retell phone-answering proof, Make safe-intake duplicate-handling proof, Launch/Integrations demo steps, and continued gates for SMS, email, calendar writes, billing and production deployment. Documentation scan found no secret webhook URLs or accidental literal newline markers.

- 2026-10-05: Created `docs/project/OWNER_ATTENTION.md` to save decisions/actions for the owner: Retell credits, webhook activation path, production approval, first pilot boundary, SMS/email/calendar gates, Twilio registration, fresh signup proof, and pricing/package decisions.

## Installable app packaging evidence

| Area | Status | Evidence note | Next safe action |
| --- | --- | --- | --- |
| Workspace Pilot runbook | PASS WITH LIMITATIONS | 2026-10-05: CEV-PILOT-78D added protected Pilot runbook page, sidebar link and Launch link. Full `pnpm check` later passed with 22 files / 747 tests and production build. | Use for managed-pilot operating steps after live path approval. |
| Windows install support | READY TO TEST | 2026-10-05: Hosted manifest is reachable and hosted service worker returns HTTP 200 at the production URL. Browser install can be tested in Edge/Chrome. | Test Edge/Chrome install manually; signed installer remains a later decision. |
| Android install support | READY TO TEST | 2026-10-05: Hosted manifest/icons and service worker are available from the production URL. Android Chrome install can be tested. | Test Android Chrome add-to-home/install manually; Play Store package remains a later decision. |
| Signed Windows `.exe` | NOT CREATED | Requires package choice, production URL, packaging dependencies, signing decision and owner approval. | Decide if a real installer is needed after first hosted pilot. |
| Android APK/AAB or Play Store | NOT CREATED | Requires production URL, Android package identity, signing key, store assets/account and owner approval. | Prefer Chrome install first; revisit store packaging later. |

## Production deploy evidence

| Area | Status | Evidence note | Next safe action |
| --- | --- | --- | --- |
| Vercel config | READY | 2026-10-05: `vercel.json` and `.vercelignore` added for Next.js production deployment. | Link project or repair CLI auth. |
| Local release checks | PASS | 2026-10-05: `pnpm check` passed with typecheck, lint, 22 files / 747 tests, embedded DB suites, Retell lead-ingestion and production build. | Use this as the current release-candidate evidence. |
| Vercel production URL | PASS WITH LIMITATIONS | 2026-10-05: GitHub repo connected and Vercel production URL is https://cevanta-ai-receptionist.vercel.app/. | Continue only no-cost checks unless owner approves paid/provider actions. |
| Supabase production redirects | PASS WITH LIMITATIONS | 2026-10-05: Production origin and auth callback/recovery URLs configured for Vercel and local support. | Keep testing confirmation/recovery emails with private owner-approved inboxes only. |
| Installable Windows/Android app | READY TO TEST | HTTPS production URL exists and app shell is ready. | Test browser install on Windows/Android before promising app-store style installers. |






