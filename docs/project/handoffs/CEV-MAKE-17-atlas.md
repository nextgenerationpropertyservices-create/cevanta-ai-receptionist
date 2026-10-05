# Agent handoff

- Task ID: CEV-MAKE-17, Atlas isolated scenario architecture review.
- Decision: CONDITIONAL APPROVAL for a saved inactive graph copy only. This is not approval to create a protected webhook before the pending owner authorization, connect senders, execute, enable scheduling or activate the scenario. No live acceptance claimed.
- Work completed: Read assigned task and existing provider-independent integration contract. Reviewed Morgan's reported replacement-webhook constraint and API-key creation dialog, isolation requirements, copied destination configuration and deduplication gates. Atlas did not inspect or operate Make UI.
- Files changed: Only docs/project/handoffs/CEV-MAKE-17-atlas.md.
- Database changes: None.
- API or contract changes: None implemented. Proposed draft uses a distinct protected webhook only after owner approval, trusted tenant routing and durable event/effect idempotency before any execution.
- Verification commands and results: Get-Content task/contracts and rg project records completed; docs/integrations directory is absent. Read official Make search results confirming webhook API-key header x-make-apikey. No browser actions, external mutations, webhook requests, scenario runs or application tests performed. Typecheck/lint/test/build not applicable to this documentation-only change and NOT RUN.
- Known limitations: Actual clone, credentials, active state, connections, filter mappings, calendar IDs, recipients, webhook key enforcement and deduplication implementation are unverified. Protected webhook creation approval is pending per coordinator. Existing scenarios have not been independently inspected by Atlas.
- Risks: An inactive copy can retain production connections and destinations. Manual Run once or trigger listening can make a draft process input. A new URL or webhook API key does not authenticate a Retell/Twilio event's original provenance, prevent replay or establish tenant identity. Copied booking/message steps can cause duplicate external effects.
- Rollback notes: Leave original scenario and original webhook unchanged. If owner-approved draft resources must be removed, first verify their separate identities and that no original workflow references them; disable/remove only the new draft resources within a scoped cleanup task. Never delete shared connections, calendars, data stores or existing provider endpoints.
- Exact next action: Morgan waits for the requested protected-webhook approval, then may create the uniquely named inactive clone within that scope. Record draft isolation evidence and Echo/Quinn reviews. Keep execution and sender routing blocked until all gates below pass.

## Draft isolation requirements

1. Use a distinct scenario name and distinct webhook identity. Do not reuse, move or modify the existing trigger. Do not repoint Retell/Twilio or Make senders to the draft. Existing scenario state and connections remain unchanged.
2. Save with scheduling/activation off. Do not click Run once, determine-data-structure listening or send test requests during this assignment. Confirm saved inactive state after creation; a saved diagram alone is not evidence of functioning automation.
3. Inventory copied module types, route conditions, error handlers and reference relationships without storing payloads, keys, full webhook URLs or real recipients. Mark every inherited connection/calendar/email/SMS destination as UNVERIFIED FOR DRAFT. Keeping a reference in an inactive graph is not connecting or authorizing its use.
4. Do not publish a clone screenshot containing keys, webhook capability URLs, addresses, phone numbers or stored sample customer data. Safe evidence can show the unique scenario name, inactive state and generic graph/module labels only.

## Authentication and tenant contract

Make documents x-make-apikey for custom webhook API-key authentication: [official Webhooks documentation](https://apps.make.com/gateway). This is webhook-specific authentication; do not confuse it with the broader Make account-management API token.

After owner approval, require a new private webhook-specific key configured through secure provider settings. Never place key values in source, handoffs, scenario notes, screenshots or test fixtures. Do not copy an existing production key or expand account API scopes.

Before a run, verify missing/wrong key rejection using isolated fictional requests. Also prove the caller can supply the required header using its actual supported integration configuration. If the source cannot do that, keep the gate blocked; do not remove authentication to make delivery succeed. A separately reviewed signature-validating bridge may be needed, but it is outside this graph-copy task.

The configured trusted connection/account maps to the tenant; payload tenantId, caller phone or user metadata must never authorize routing. Provider signature verification must occur at the original trusted boundary using exact provider semantics; possession of a Make API key proves a caller knows the shared key, not that Retell/Twilio signed the original event. Keep ingress unenabled until provenance and route ownership are documented.

## Copied calendar/email/SMS gates

- Calendar: an isolated test calendar and approved connection, timezone/duration schema, conflict behavior, atomic local booking representation and retry-safe provider booking reference. Repeated delivery cannot create multiple appointments. Caller success is allowed only after confirmed booking; a queued webhook response is not booking confirmation.
- Email: a controlled fictional test recipient/sandbox, approved sender, explicit template and redaction, consent/delivery requirements and effect idempotency. No production recipient expressions or fallback addresses may be exercised.
- SMS: a test recipient/provider sandbox and approved sender, consent requirements, send outcome and retry protection. Do not test by messaging an actual customer's number.
- Every router branch and error/retry handler: inspect for inherited side effects, fallback destinations, shared data-store writes and sensitive execution logging. Sequential execution alone is not durable duplicate protection.

## Deduplication contract before execution

Persist a receipt keyed by provider + trusted connection + provider account + stable provider event ID. Associate the trusted provider call ID with one tenant-bound internal call. Receipt acceptance, call projection, lead linkage and handoff changes require one atomic transaction, with stale-event/state-transition checks. Do not acknowledge an event as applied before commit.

Use separate effect keys for each booking/email/SMS operation, including tenant, call/event and effect kind. Concurrent receipt claims must be atomic; a lookup followed by a non-atomic write is insufficient. External side effects need durable pending/confirmed/failed state and safe reconciliation after ambiguous timeout so retries do not send twice. Make queue success and HTTP 200 alone do not prove durable application or downstream completion.

Current Cevanta integration ports are explicitly design-only. Do not claim the clone supplies these guarantees merely because equivalent module names appear in its graph. The current task accepts only inactive draft preparation; a later scoped implementation and isolated positive/negative execution task must verify them.

## Minimal manual draft schema review — 2026-10-03

Decision: APPROVED for manual inactive draft schema preparation only: root `event` Text; root `call` Collection containing `call_id` Text and `agent_id` Text. No sample payload capture, network request or execution is needed or authorized for this schema step. This approval does not establish a validated public runtime contract or authenticated provider mapping.

Do not make optional analysis fields mandatory or invent sample extraction values. Leave `call_analysis` and `custom_analysis_data` pending actual Retell extraction configuration. The minimal schema omits required booking/contact inputs deliberately; downstream branches relying on them remain unverified and must not execute. Before activation, validate event names, required identifier presence/length and provider account/agent ownership against the real event contract. Neither event text nor posted agent_id is proof of provenance or tenant authority.

Coordinator reports the copied graph references `custom_analysis_data` keys Caller Name, Call Reason, Callback Phone, Service Address, HVAC Problem, Urgency and Requested Appointment Datetime. These are observed mapping labels, not approved runtime fields. Record exact source nesting, casing, types, optionality and extraction semantics after inspecting actual Retell settings; do not infer that these keys exist under the proposed minimal call collection. Unknown or absent values must prevent dependent booking/message actions rather than silently substituting production defaults.

The copied calendar expression `addHours(datetime;1)` is an inspected implementation detail, not an approved one-hour appointment policy. Execution remains gated on verified datetime format/timezone, invalid/missing-value behavior, daylight-saving handling where applicable, approved duration and conflict/retry behavior. No new duration policy is chosen by this review.

Files changed by this follow-up: only this handoff. Database/API changes: none. Verification: source-task/coordinator proposal review only; no browser, provider validation, samples, tests or network runs. Next action: Echo/Morgan manually save the minimal draft schema within authorized scope and label analysis-dependent routes blocked until actual extraction settings and runtime gates are reviewed.

## Observed Retell extraction extension review — 2026-10-03

Decision: APPROVED for optional inactive schema extension under `call.call_analysis.custom_analysis_data`, based on Morgan's reported read-only inspection of signed-in Retell Draft V3. Atlas did not independently inspect the browser. Actual event nesting, JSON types and originating agent/version still need safe payload/version verification; this is not runtime acceptance.

Add optional `call_analysis` Collection under `call`, with optional `custom_analysis_data` Collection containing the exact case-sensitive keys below. All fields remain optional with no defaults or fabricated values:

| Exact key | Draft schema type / observed extraction type |
| --- | --- |
| Caller Name | Text |
| Callback Phone | Text |
| Service Address | Text |
| Call Reason | Text |
| HVAC Problem | Text |
| Requested Appointment Datetime | Text |
| Appointment Requested | Boolean candidate / observed Yes/No |
| Follow-Up Requested | Boolean candidate / observed Yes/No |
| sms_consent | Boolean candidate / observed Yes/No |
| Urgency | Text / observed Selector |

Observed Urgency options: Emergency, Urgent, Routine, Appointment Request, Estimate Request, General Question, Unknown. Configure no implicit default. Unknown/missing options must not silently become Routine or authorize an escalation; runtime routing needs an approved urgency policy. Observed Yes/No extraction settings suggest Boolean schema candidates but do not prove serialized JSON booleans; confirm actual delivery before any run. If a real delivery uses strings, change the reviewed adapter deliberately rather than silently coercing.

Strict consent recommendation: SMS eligibility requires the actual normalized Boolean `true` for `sms_consent`, an approved message purpose/recipient and verified tenant/call mapping. Missing, null, false, strings such as `"false"`/`"true"`/`"Yes"`, numbers and unrecognized values fail closed until an explicitly reviewed provider-normalization contract exists. Do not use truthiness or an existence check. Appointment Requested and Follow-Up Requested do not imply SMS consent. A model-extracted consent Boolean alone does not establish that consent collection and allowed message purpose are verified; keep live sending gated until that workflow has evidence.

Strict datetime recommendation: missing/blank/unparseable Requested Appointment Datetime must prevent calendar creation and booking-success responses. No format example was observed, so do not guess locale, timezone, AM/PM or offset, use current time, or pass an arbitrary string directly into `addHours`. Before execution approve an unambiguous date contract (for example validated offset-bearing instant, or validated local datetime with explicit tenant timezone and daylight-saving ambiguity handling), then normalize to the calendar's required format. Reject nonexistent/ambiguous local times unless a reviewed rule resolves them. Confirm end after start, approved duration, availability and duplicate protection. One-hour copied arithmetic remains unapproved policy.

Files changed: this handoff only. Database/API changes: none. Verification: coordinator-reported Retell configuration and architecture review, no direct browser or runtime payload tests. Exact next action: manually save optional inactive schema extension; label Boolean serialization, event/version nesting, consent collection, datetime contract and downstream execution as pending. Do not send messages, book appointments, run listeners or activate the clone.

## Shared lead writer and SMS draft barriers — 2026-10-03

Decision: APPROVED as reversible barriers in the isolated inactive draft only. Morgan reports all three static test calendar references were saved/reopened and the lead module still invokes shared HVAC-UTIL-01 Create/Update Lead, passing client_id from configuration with wait-for-finish Yes. Atlas has not independently inspected these UI values. Waiting for completion does not isolate a shared writer or prove tenant ownership/idempotency.

Insert an unconditional false filter on the draft edge immediately before the shared lead subscenario. Use a literal contradiction independent of payload/configuration, such as constant `1` equals constant `0`; name it clearly as a blocked test boundary. No data expression or fallback can make it true. Do not change the shared original scenario, utility, connection or configured client identity. Keep this barrier until an independently isolated lead writer or explicitly non-persisting stub is assigned, reviewed and verified.

Add an unconditional false condition with AND semantics to the draft SMS route's existing conditions. Preserve consent validation; do not replace it or OR the barrier with other conditions. There is no authorized test number, so no SMS route may execute. Do not change production sender or recipient settings to circumvent this gate.

Before any separately authorized test, inspect every graph path: the lead filter blocks only paths passing through that edge. Ensure no sibling router, error handler, alternate invocation or earlier module can call the shared writer or reach other unisolated effects. Similarly, verify all SMS paths, including retry/error branches, are blocked. If a bypass exists, add a separately scoped barrier or keep all execution prohibited. Keep scheduling off; adding filters does not authorize Run once, listener capture or activation.

Save and reopen the isolated draft to verify literal false operands, AND composition, edge placement and unchanged original references. This is configuration evidence only. A blocked route produces no functional lead/booking/message acceptance evidence and must not return fake success. Removing a barrier later is a reviewed ownership transfer requiring the isolated writer/recipient, trusted routing, consent and idempotency gates to pass first.

Files changed: this handoff only. Database/API changes: none. Verification: proposal review only, no browser or runtime tests. Rollback: remove only draft filter additions if reverting preparation; leave the draft inactive and never enable unisolated paths. Exact next action: Morgan saves/reopens these two draft barriers and records path coverage and blocked downstream behavior; keep shared lead utility and SMS execution unavailable.
