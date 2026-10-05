# Agent handoff

- Task ID: CEV-MAKE-17.
- Work completed: Read task and handoff requirements. Reviewed Morgan's reported receptionist graph and proposed inactive draft boundaries. Recommended isolated copy only if trigger independence and disabled execution can be established; otherwise use a fresh disconnected scaffold.
- Files changed: Only docs/project/handoffs/CEV-MAKE-17-echo.md.
- Database changes: None.
- API or contract changes: None. Workflow/input proposal below needs Atlas approval.
- Verification commands and results: Get-Content docs/project/tasks/CEV-MAKE-17.md and docs/templates/AGENT_HANDOFF.md succeeded. No browser inspection, Make execution, live/provider tests, application checks or source changes performed by Echo. Reported graph is design evidence from Morgan, not independently verified UI evidence.
- Known limitations: Saving an inactive draft establishes draft persistence only. Connections, trigger isolation, calendars, tenant mapping, duplicate behavior, consent and transfer success remain unverified. Graph contains no confirmed transfer action; urgent email does not transfer a caller.
- Risks: Cloned connections/triggers/data stores can share live resources even when schedule is off. Duplicate booking checks can race. Calendar availability and creation are separate operations; free-slot check alone does not reserve capacity. Email accepted and SMS accepted do not prove delivery. Router branches may overlap unless predicates are exclusive.
- Rollback notes: Delete only the newly identified draft after verifying its unique identity. Preserve all prior scenarios, webhook endpoints and external resources. Draft deletion does not undo external side effects, so none are authorized here.
- Exact next action: Morgan saves a uniquely named inactive draft after confirming safe copy semantics. If independent webhook/resources cannot be guaranteed, save a fresh disconnected draft and record connection gates. Atlas reviews input/routing contract; Quinn reviews isolation before any future test execution.

## Draft construction recommendation

Use the existing graph as a reference, not evidence of a functioning production configuration. A copy is preferable only when Make UI can establish a new scenario identity, inactive schedule, a new unregistered webhook, and no shared execution queue. Preserve the old scenario untouched. If the copy would retain a live/shared webhook or execution-sensitive resources and cannot safely detach them within the authorized draft, create a fresh disconnected scaffold instead. No Run once, replay, number routing, API test, message send or appointment creation during this task.

Name suggestion: Cevanta Receptionist — Isolated Draft — CEV-MAKE-17. Leave it inactive. Never point Retell/Twilio at its trigger while draft gates remain open. A disconnected scenario may be saved but must be labelled scaffold, not functional receptionist.

## Minimal graph and routing intent

1. New dedicated webhook placeholder → schema/authentication gate → trusted configuration lookup. Caller tenant metadata is never routing authority. Configuration is bound to enabled server-owned connection/agent identity. Missing or ambiguous configuration fails closed.
2. Stable operation identity/dedupe gate before side effects. Use connection + call + operation identifier, not caller phone or scenario execution ID. Separate booking/message/notification operations must have separate keys. Retrying a partially completed workflow must reuse successful external results.
3. Urgent branch → reviewed urgent-email draft action. Record notification intent separately from human acknowledgement. Emergency instructions/escalation recipient policy are not invented.
4. Booking branch → duplicate booking lookup → availability lookup → guarded booking action → confirmed-result projection. Existing booking returns its confirmed reference without creating another. Unavailable branch → unavailable-email draft action. Recheck capacity/locking or provider reservation capability before live implementation.
5. Follow-up branch → follow-up-email draft action. Confirm recipient source and consent/purpose where required; never treat missing contacts as safe defaults.
6. Optional SMS branch → explicit channel-specific consent/opt-out check → SMS draft action. Missing, withdrawn or unsuitable consent blocks sending. Registration/account eligibility remains a separate activation gate.

Morgan must inspect filters to determine whether urgent and booking branches intentionally coexist. Do not silently change reported business behavior to exclusive routing. Where two paths could send the same follow-up, assign one owner and one durable operation key. Every failure branch must preserve truthful partial outcomes.

## Transfer limitation

The reported graph includes urgent email and scheduling/messaging but no verified Retell/Twilio transfer module or tool. Do not label it transfer-capable. A later transfer integration needs an approved callable tool contract, recipient policy, attempt-specific identity, bridge/failure observations and fallback. Carrier bridge and human resolution remain separate states. The existing system's owner-reported transfer behavior cannot be inferred from this graph.

## Gates before isolated execution

- Independent webhook ID/URL and inactive status verified privately; no live Retell/Twilio registration, old queue or trigger reused.
- Dedicated fictional test tenant/configuration and dedupe store; no shared live customer or booking lookup.
- Test calendar and fictitious slots isolated from operational calendars. Test-only recipient inbox/number under authorized control, with no customer recipients or incidental forwarded addresses. Credentials remain private environment/connection configuration.
- Authenticated input and trusted tenant mapping approved by Atlas; provider signatures verified at original boundary or a separately authenticated Make delivery boundary. Raw signature cannot validate transformed JSON.
- External APIs/action modules disabled or replaced with deterministic test stubs for first test wave. Connection availability by itself does not authorize sending.
- Budget/account/number restrictions, SMS consent and registration requirements, timezones, booking capacity policy and transfer recipients resolved before their respective live steps.

## Meaningful future tests, not executed here

Reject malformed/unsigned/foreign/disabled connection input without side effects. Exercise missing configuration; empty/unavailable availability; duplicate event; concurrent same booking attempt; same call with distinct action IDs; partial booking success followed by notification failure and retry; changed payload under same identity; cancelled/withdrawn SMS consent; timezone boundaries; provider timeout; non-success creation response. Verify one confirmed booking and at most one permitted message per operation. If no atomic reservation is available, expose booking race as an unresolved acceptance limitation. Transfer tests require an actual transfer branch and isolated approved destination; email-only tests cannot satisfy transfer acceptance.

None of these tests are authorized to run during CEV-MAKE-17. Acceptance for this task is saved inactive draft plus honest gates and reviews; working/live receptionist acceptance belongs to a separately assigned task.

## 2026-10-03 continuation: minimal manually defined input structure

Morgan reports the fresh webhook has no detected structure and the existing configuration search uses client config v1 with retell_agent_id equal to module 2 call.agent_id. This mapping is reported UI evidence, not independent Echo inspection. Define the following structure manually in the inactive draft; do not send a sample to a live endpoint or use Run once to detect it.

| Path | Make field type | Draft requirement |
| --- | --- | --- |
| event | Text | Required; filter exact call_analyzed before operational branches |
| call | Collection | Required parent collection |
| call.call_id | Text | Required, nonempty; lifecycle dedupe with event and trusted connection |
| call.agent_id | Text | Required, nonempty; lookup candidate in configured agent mapping |
| call.call_analysis | Collection | Optional for structural setup; missing analysis blocks analysis-dependent branches |
| call.call_analysis.custom_analysis_data | Collection | Optional; exact children remain unknown until configured extraction/schema is inspected |

Fictional manual shape, not a signed or complete Retell delivery:

```json
{
  "event": "call_analyzed",
  "call": {
    "call_id": "call_fictional_cev_make_17",
    "agent_id": "agent_fictional_cev_make_17",
    "call_analysis": {
      "custom_analysis_data": {}
    }
  }
}
```

The three text fields are enough to expose the event filter, identity and observed config lookup. Retell documents an event/call envelope and call_analyzed analysis data. [Retell webhook specification](https://docs.retellai.com/features/webhook-overview). Its call model exposes call_analysis.custom_analysis_data; documentation examples do not establish this account's custom extraction keys. [Retell call model](https://docs.retellai.com/api-references/get-call).

Do not invent urgent, booking_requested, appointment_time, customer_email or sms_consent as actual Retell fields. Determine their exact path, configured name, data type, nullable/missing behavior and accepted values from the Retell agent extraction settings and existing module mappings. They might be under custom_analysis_data, dynamic variables, metadata or another transformed collection. Build only confirmed child fields. A generic empty collection does not expose arbitrary downstream children in Make; those children must be added explicitly after inspection.

Do not require phone numbers, email, names, transcript, recording URL or call summary merely to infer the structure. Those fields are unnecessary for this lookup and increase data exposure. If later branches need contact or appointment inputs, add only reviewed fields with fictional values and block the branch when required data is absent. Analysis call_successful is not booking confirmation or lawful SMS consent. Post-call analysis cannot initiate a live transfer in the already ended call; retain the previously recorded transfer limitation.

Agent-ID lookup is not authentication. Before any branch executes, verify original Retell bytes/signature or the separately approved authenticated relay; scope lookup to that trusted connection/account, require exactly one enabled result, and reject missing/duplicate mappings. No match must not fall through to a default customer's calendar/email settings. Do not modify shared client config v1 or insert fictional rows into a live store during this assignment. Dedupe requires durable event + call ID + trusted connection semantics, not merely this search filter.

Verification: task reread; official webhook and Get Call pages opened and inspected. Only this owned handoff changed; no API/schema/runtime/provider changes. Application and live scenario tests NOT RUN. Risks remain unresolved custom inputs, authentication provenance and shared datastore lookup. Rollback: remove this appended proposal; no external state to undo. Exact next action: Morgan manually creates only the confirmed structural fields in the inactive draft, inspects each downstream token path, and sends unknown custom keys for Atlas review before mapping operational branches.
