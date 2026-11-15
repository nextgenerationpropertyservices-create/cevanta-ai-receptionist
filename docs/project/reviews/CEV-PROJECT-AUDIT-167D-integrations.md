# CEV-PROJECT-AUDIT-167D — Voice and integration readiness review

Date: 2026-10-26  
Reviewer: Echo (AI Voice and Integrations)  
Review type: Read-only source, test, migration, and project-evidence audit

## Decision

Cevanta can support a narrowly scoped first managed pilot today: a Retell call can travel through the existing Make intake path, become one tenant-scoped dashboard lead, and wait for office review. That path has strong signature checking, trusted tenant mapping, and database duplicate protection. Project records also contain one controlled production writer test and one live Retell call proof for the original internal pilot workspace.

Cevanta is not yet a full live automation platform. Customer email, SMS, external calendar writes, automatic booking, subscription billing, and automatic dispatch are not implemented end to end. The dashboard controls for those features record intent and evidence; they do not make the provider action work.

The smallest safe offer is therefore **AI receptionist call capture into an office-review lead inbox**, with all messages, booking promises, external calendar writes, payments, and dispatch decisions kept manual.

## Status key

- **Working** — implemented in Cevanta with relevant automated evidence. This does not automatically prove a current third-party account is connected.
- **Guarded** — the working core exists, but it is disabled by default, manual, approval-gated, or still needs client-specific provider proof.
- **Design-only** — screens, controls, contracts, or preparation records exist, but no live side-effect implementation exists.
- **Unverified** — code exists, but the required hosted/provider proof was not available in this review.

## Readiness matrix

| Area | Classification | What is real now | What is not yet proven or built |
|---|---|---|---|
| Retell voice-to-lead intake | **Guarded** | Exact raw-body HMAC verification, freshness checking, strict payload validation, a five-second interruptible read budget, separate production/writer gates, private tenant mapping, and transactional lead deduplication are implemented. See `src/app/api/integrations/retell/route.ts`, `src/lib/integrations/retell-verifier.ts`, and `supabase/migrations/202610020008_retell_lead_ingestion.sql`. | Mapping health proves that a database route is active; it does not poll Retell, confirm the phone number assignment, check credits, or prove the current agent is answering. Global rate/concurrency admission is not implemented. Each client still needs a fictional end-to-end call. |
| Make lead-intake bridge | **Guarded** | The bridge is disabled by default, accepts a small allowlisted call-analysis package, authenticates with timestamped HMAC or a server secret, routes through the same trusted mapping, and reuses the same event/call deduplication. Historical project evidence records a production lead creation and duplicate replay. See `src/app/api/integrations/make/retell-lead/route.ts` and `docs/project/PROJECT_STATUS.md:573-587`. | There is no live Make execution/status feed in Cevanta. Static bearer authentication has no freshness window. A stalled request-body read can exceed the intended five-second deadline. Unmapped events are acknowledged with HTTP 202 and are not stored for operator recovery. |
| Make Gmail/Google Calendar authorization | **Unverified** | An owner/admin-gated server action can ask Make to create a private credential authorization link without exposing the management token. See `src/lib/server/make-management.ts` and `src/app/actions/make-authorization.ts`. | The request ID is not stored against the workspace, status is not polled, an authorized connection is not mapped to a scenario from Cevanta, and the provider call has no timeout or idempotency key. The hosted Make API call remains unverified in the recorded handoff. The truthful-status work now tells operators to confirm completion in Make (`integrations/page.tsx:174`). |
| Onboarding-to-Sheet sync | **Guarded** | The Make webhook URL stays server-side, the request has a five-second timeout, and the payload includes a stable workspace/config-revision `sync_key`. See `src/app/actions/onboarding.ts:73-128`. | Cevanta has no durable send receipt, retry queue, or delivery-status record. The one-time marker is browser `localStorage`, so another browser can send again. The Make endpoint is trusted by its secret URL rather than a signed request. HTTP success is treated as “sent” without proving a Sheet row exists. Several payload fields are blank or generic instead of authoritative setup data. |
| Office email notification | **Design-only** | Lead ingestion can atomically prepare one private `prepared_not_sent` office-email outbox row when the email gate has approval, evidence, and rollback notes. The unique key prevents duplicate outbox rows. See `supabase/migrations/202610120004_office_email_notification_outbox.sql`. | There is no email sender worker, verified sender/domain flow, delivery webhook, retry worker, dead-letter path, or dashboard delivery status. No email is sent. |
| Customer email follow-up | **Design-only** | Approval controls and provider guidance exist. | No customer-email sender, template execution, consent policy enforcement, delivery tracking, reply handling, or suppression handling exists. |
| SMS | **Design-only** | Approval controls and Twilio/provider guidance exist. | No SMS sender or inbound reply handler exists. Business/A2P registration, consent, opt-out handling, delivery callbacks, retry policy, and tenant-visible status remain required. |
| Internal Cevanta calendar | **Working** | Authorized office roles can create and update tenant-scoped in-app appointments linked to jobs. Duplicate-sensitive appointment creation uses a submission ID. See `src/app/actions/appointments.ts` and the calendar tests. | This does not write Google Calendar or another external calendar and does not confirm an appointment to a caller. |
| External calendar writes | **Design-only** | An approval gate and Make credential-request option exist. | There is no external event writer, external event ID mapping, conflict check, timezone reconciliation, retry/deduplication, update/cancel sync, or recovery path. |
| Request-only booking | **Working** | The app can save request preferences and office staff can manually create an in-app appointment after review. The UI clearly says saved preferences do not reserve a time. | Availability is not offered to the caller and no caller-facing confirmation is sent automatically. |
| Automatic booking | **Design-only** | A gated capability and safe launch guidance exist. | There is no availability engine, concurrency hold, confirmed external write, caller confirmation result, cancellation recovery, or provider-backed test proof. |
| One-time/manual Stripe payment links | **Unverified** | A server action validates the internal operator, managed-client relationship, amount, Stripe URL, and uses idempotency keys when creating a product, price, and hosted payment link. See `src/app/actions/stripe-payment-links.ts`. | Recorded handoff evidence says Stripe test/live proof was not run. There is no focused server-action test, provider timeout, persisted request/payment status, payment webhook, receipt, refund, tax, or failed-payment workflow. The operator still confirms payment manually in Stripe. |
| Subscription billing | **Design-only** | A capability gate and billing guidance exist. | No subscription creation, webhook reconciliation, dunning, cancellation, refund, tax, receipt, or client billing portal exists. |
| Manual dispatch | **Working** | Office users can create jobs, assign eligible technicians, and change assignments. The dashboard explicitly keeps office confirmation in the loop. See `src/app/actions/jobs.ts` and `src/app/workspaces/[tenantId]/jobs/dispatch-board.tsx`. | It does not contact technicians or customers automatically and does not prove real-world availability. |
| Automatic dispatch | **Design-only** | A gated capability and suggestion UI exist. | No autonomous assignment, technician notification/acceptance, routing provider, rollback execution, or confirmed dispatch outcome exists. |
| Seasonal reactivation / quote follow-up add-ons | **Guarded** | Cevanta can prepare and approve internal reactivation drafts and create an internal visit after approval. | No live email/SMS, weather trigger, external calendar write, or autonomous conversation exists. These should not be sold as active outreach yet. |

## Trust and reliability assessment

### Webhook verification

- **Retell: strong local implementation.** `verifyRetellPrototype` checks the exact raw bytes, HMAC-SHA256 signature, canonical timestamp, five-minute freshness window, strict UTF-8, event type, call ID, agent ID, and an allowlisted lead shape (`src/lib/integrations/retell-verifier.ts:82-123`). The route is disabled by default and has separate production and writer gates (`src/app/api/integrations/retell/route.ts:25-32`).
- **Make bridge: mixed.** Timestamped HMAC has a freshness window, but the static Bearer fallback does not (`src/app/api/integrations/make/retell-lead/route.ts:119-132`). A leaked shared secret could submit new fictional call IDs until the secret is rotated, although trusted route mapping limits which agent IDs can produce a tenant lead.
- **Onboarding Sheet sync: weak provider authentication.** It posts to a secret Make hook URL without a second signature/header (`src/app/actions/onboarding.ts:84-125`).
- **Make management and Stripe:** tokens remain server-only and provider errors are redacted. This review found no source-stored production credentials.

### Tenant mapping

- **Lead intake is strong.** The request cannot select a tenant. The database resolves an enabled `(connection_id, provider_account_id)` mapping from server configuration and rejects absent mappings (`supabase/migrations/202610020008_retell_lead_ingestion.sql:87-88`). Mapping registration prevents the same provider agent from silently moving to a different tenant (`supabase/migrations/202610200001_retell_mapping_rpc.sql:24-41`).
- **Make authorization is incomplete.** The generated request is not persisted with the tenant, so Cevanta cannot later prove that a returned Make authorization belongs to the correct workspace.
- **Optional provider actions have no tenant mapping yet** because their live adapters do not exist.

### Deduplication and atomicity

- **Lead creation is strong.** Unique constraints cover both provider event ID and provider call ID; an advisory transaction lock plus unique-violation recovery returns the existing lead (`supabase/migrations/202610020008_retell_lead_ingestion.sql:29-40,89-104`). Lead, receipt, and eligible office-email outbox preparation occur in one database transaction.
- **Email outbox preparation is duplicate-safe** by `(tenant_id, lead_id, channel, reason)`.
- **Onboarding Sheet sync is only conventionally duplicate-safe.** Cevanta sends a `sync_key`, but the app does not enforce uniqueness on the receiver and stores no durable receipt.
- **Stripe creation is idempotent only for one generated request ID.** A new request ID intentionally creates new Stripe objects and another link.

### Retries and time budgets

- Database/provider persistence failures return HTTP 503, allowing an upstream retry, and the database deduplication makes a successful replay safe.
- **High-risk gap:** an unmapped event returns HTTP 202 with no lead and no durable failure record (`retell/route.ts:56`; `make/retell-lead/route.ts:186`). Upstream systems may treat that as final success, so an otherwise valid call can disappear from the dashboard.
- The direct Retell route correctly interrupts a never-ending read with a timer race (`retell/route.ts:91-106`). The Make route checks elapsed time only before `await reader.read()` (`make/retell-lead/route.ts:140-148`), so a stalled stream can hang past the stated deadline.
- The Make management API client and Stripe client do not set request timeouts. Neither has an application retry queue.
- The email outbox has no sender worker, so its `prepared_not_sent` records cannot progress.

### Failure recovery

- Retell mapping can be paused reversibly without deleting the provider agent or changing the phone number.
- Automation controls require requested state, owner approval, text evidence, and a rollback note before a user can label a capability active (`src/lib/automation-controls.ts:99-116`). These are readiness records, not executable provider rollback controls.
- There is no integration-attempt ledger, failed-event inbox, dead-letter queue, or “retry this delivery” operator action. Rejected/unmapped deliveries are not surfaced in the Needs Attention queue.
- No implemented provider adapter can undo an external email, SMS, calendar, payment, or dispatch action because those writers do not yet exist.

### Operator status visibility, including CEV-PROJECT-AUDIT-167E

The current truthful-status changes materially improve the Launch and Integrations pages:

- Retell status is now workspace-specific and combines the private mapping state with saved workspace evidence.
- Make status comes from the selected workspace’s saved milestone instead of reusing a global dry-run claim.
- Verified labels explicitly say they are operator records, not live provider telemetry (`integrations/page.tsx:16-27`; `launch/page.tsx:12-27`).
- The Make authorization section now admits that request tracking is not built and tells the operator to confirm in Make (`integrations/page.tsx:174`).
- A role that cannot read route health now sees “status unavailable,” not a false “server setup needed” diagnosis (`launch/page.tsx:66`).
- Production deployment and client activation are described as separate concerns.

Remaining status risks:

1. `client_onboarding_milestones` is a manually editable evidence register, not provider telemetry. Any owner/admin member of the client tenant can save Retell/Make/test/launch values through the current action and RLS policy (`src/app/actions/onboarding-milestones.ts:12-28`; `supabase/migrations/202610210001_client_onboarding_milestones.sql:19-34`). The Launch page now says operator verification is still required, but an internal-operator-only evidence boundary is not enforced.
2. `buildProvisioningReadiness` still hard-codes the test-call and activation gates to `blocked` (`src/lib/provisioning-readiness.ts:101-113`) even when a saved milestone says a test passed. This is safe but can be confusing; it needs an Architect-reviewed shared readiness contract before changing.
3. Retell “active” means an enabled database mapping, not a live provider health check. Make “verified” means a saved milestone, not current scenario telemetry.
4. Automation controls can display “Active” after a user supplies the required fields, but Cevanta does not verify the named provider path. The surrounding UI warns about this; the label alone must not be used as proof.
5. Stripe payment status is manual, Make credential authorization status is not stored, and email/SMS/calendar delivery status does not exist.

## Highest-priority findings

### P1 — Valid calls can be silently absent after an unmapped route

Both ingestion routes return HTTP 202 for `unmapped_tenant` and store no failed receipt. This can prevent provider retry and gives the operator no durable record to recover after the mapping is fixed. This is the most important reliability gap before scaling beyond a carefully watched first client.

**Safe fix direction:** Architect-review a tenant-safe integration-attempt/failure ledger. Record only non-sensitive references and failure codes. Decide an explicit retry response policy for mapping failures, add an operator attention item, and provide a bounded replay process after mapping repair.

### P1 — Optional automations are product controls, not working services

Email, SMS, external calendar writes, automatic booking, subscription billing, and automatic dispatch have no complete provider adapters. They must remain off and must not be sold as live. The office-email outbox is preparation only.

### P1 — Make client authorization is not a complete connection workflow

Cevanta creates a link but does not store the request, poll its status, associate the resulting connections with a scenario, or verify that the intended client authorized them. Operators must still open Make and verify manually.

### P2 — Make ingress and management calls need bounded transport behavior

The Make webhook reader can hang during a stalled read, and the Make management request has no timeout. Add the same interruptible read pattern used by the Retell route, then add a bounded timeout and safe retry/idempotency policy to the management client.

### P2 — Evidence records need a trusted operator boundary

Provider/test/launch milestones are protected by tenant membership, but they are not restricted to the internal Cevanta operator. Before they drive stronger launch decisions, separate client acknowledgements from Cevanta-verified evidence and keep an audit trail of who verified what.

### P2 — Sheet sync is convenient but not operationally durable

Move from browser-local “sent” memory to a tenant-scoped server receipt/outbox with attempt count, last result, and safe retry. Sign the request or use a dedicated authenticated receiver. Only show “delivered” after a durable receiver acknowledgement.

### P2 — Stripe link generation needs provider proof and lifecycle tracking

Add focused positive/negative action tests, a fetch timeout, a fictional Stripe test-mode run, and stored payment-request status. Do not add subscriptions until webhook reconciliation, cancellation, dunning, refunds, receipts, taxes, and support ownership are designed.

### P3 — Test gaps remain around mapping and provider management

The Retell provisioning test directly exercises pause only; register and health action branches lack direct unit coverage. Make management tests do not cover timeout, malformed body, repeated request, or tenant persistence because persistence does not exist yet. The Make ingress tests do not cover a never-ending request body.

## Smallest safe repeatable first-client setup

Do not require Gmail, Google Calendar, SMS, or Stripe automation for the starter pilot. Use only the proven call-to-lead path.

1. **Create the client workspace and private invitation.** Have the client confirm their account and complete Setup.
2. **Review required setup.** Confirm business identity, office contact, at least one enabled service, real weekly hours, office-review/never-promise rules, and an escalation contact. Keep automatic booking language out of the prompt.
3. **Collect the setup fee manually.** Use an approved invoice or a Stripe-hosted link only after a test-mode proof. Confirm payment in Stripe; do not rely on Cevanta payment status.
4. **Create a separate Retell agent and number for the client.** Use the approved setup details, office-review language, and an explicit no-booking/no-transfer fallback unless that exact capability is separately proven.
5. **Map the Retell Agent ID from the client Integrations page.** Confirm the route shows active. Never paste a provider key or webhook URL into client fields.
6. **Use one narrow Make intake scenario.** It should accept the analyzed call, send the minimal signed/bearer payload to Cevanta, and return a safe acknowledgement. Disable Gmail, SMS, Google Calendar, payment, booking, and dispatch modules.
7. **Run one fictional end-to-end call.** Confirm the correct client workspace receives exactly one lead with a usable caller name/phone and summary. Replay the same call ID and confirm no second lead appears.
8. **Test the stop path.** Pause the mapping and confirm the operator knows how to stop intake. Record the call reference, Make execution reference, resulting lead, duplicate result, reviewer, date, and rollback steps without storing secrets or real customer data.
9. **Record milestones as evidence only.** A Cevanta operator should review the proof before marking Retell, Make, test call, or launch milestones. Leave every optional automation control off.
10. **Launch only the office-review scope.** Monitor the first live calls in Retell, Make, and Cevanta. If a call does not create a lead, pause the route and investigate before taking more calls.

### Stop conditions

Do not launch when any of these is true:

- the Retell route is unmapped, paused, unavailable, or belongs to another client;
- one fictional call does not create exactly one correct lead;
- a duplicate call creates a second lead;
- Make still contains active Gmail, SMS, calendar, booking, payment, or dispatch modules for this starter flow;
- the agent promises a booking, transfer, price, payment, or dispatch result that the office did not confirm;
- rollback steps have not been written and tested.

## Recommended build order after the first managed pilot

1. **Integration attempt/failure ledger and attention queue** — include safe failure code, provider, tenant route, event reference, attempt count, last attempt, and replay/resolve state. Requires Architect review and Quality security review.
2. **Fix Make transport bounds** — interrupt stalled reads, honor request abort, and add tests matching `retell-budget.test.ts`.
3. **Persist Make credential requests per tenant** — store request ID/status safely, poll or consume a provider callback, and map the approved connections without exposing credentials.
4. **Separate client acknowledgement from Cevanta verification** — make provider/test/launch proof internal-operator-controlled or cryptographically/provider-derived.
5. **Office email sender first** — consume the existing outbox with idempotent delivery keys, bounded retries, delivery callbacks, dead-letter handling, verified sender configuration, and operator status.
6. **External calendar writer second** — write only office-confirmed appointments; persist external event IDs; handle conflicts, timezone, update/cancel, retry, and rollback.
7. **SMS after registration** — finish business/A2P registration, consent and opt-out policy, delivery callbacks, reply routing, suppression, and audit evidence before a real send.
8. **Automatic booking and dispatch last** — require live availability, concurrency protection, confirmed outcome, human fallback, and tested reversal. Do not infer readiness from a dashboard switch.
9. **Subscription billing after payment lifecycle design** — add reconciliation webhooks, cancellations, dunning, refunds, receipts, taxes, and support procedures.

## Evidence run for this review

- `pnpm exec vitest run --configLoader native tests/launch-ui.test.ts tests/integrations-ui.test.ts tests/retell-ingress.test.ts tests/retell-budget.test.ts tests/retell-lead-writer.test.ts tests/make-retell-lead-ingress.test.ts tests/retell-provisioning.test.ts tests/make-management.test.ts tests/automation-controls.test.ts` — **PASS**, 9 files / 108 tests.
- `pnpm test:retell:lead:db` — **PASS**, including tenant mapping, duplicate handling, authorization assertions, gated office-email outbox preparation, and atomic rollback checks. The script correctly states that live provider signatures, hosted JWT/PostgREST, and real Retell delivery remain separate evidence.
- Static search found no Twilio SMS sender, SendGrid/customer-email sender, Google Calendar event writer, subscription creation, or automatic dispatch adapter in `src/`.
- Read-only inspection covered the ingress routes, provider clients/actions, automation gates, current CEV-PROJECT-AUDIT-167E Launch/Integrations changes, relevant migrations, focused tests, and recorded historical provider evidence.

## Review limitations

- No Retell, Make, Twilio, Google, Stripe, Vercel, Supabase-hosted, email, SMS, calendar, or billing account was opened or changed.
- No current provider health, secret validity, phone-number assignment, Make scenario state, Stripe mode, Twilio registration, sender/domain verification, or client authorization was independently checked.
- Historical live proof in `PROJECT_STATUS.md` applies to the recorded workspace and date; it is not proof that a new client is ready today.
- Full `pnpm check`, browser E2E, hosted JWT/PostgREST, live-provider, typecheck, lint, and production build were not run by this read-only review. The focused tests and embedded Retell database suite above passed.
