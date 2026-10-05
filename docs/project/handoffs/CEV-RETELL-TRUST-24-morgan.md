# Morgan trust-discovery handoff

- Task ID: CEV-RETELL-TRUST-24.
- Work completed: Continued the no-writer discovery after Echo's documentation handoff. Used authenticated read-only browser inspection of the Retell agent editor and inactive Make parent scenario. No calls were run, no scenario was activated, no provider settings were saved, no webhook value was copied into files, and no private payload or call history was inspected.
- Files changed: docs/project/tasks/CEV-RETELL-TRUST-24.md; docs/project/handoffs/CEV-RETELL-TRUST-24-morgan.md.
- Database changes: None.
- API or contract changes: None. Findings below are evidence for Atlas and Quinn review, not an approved implementation contract.
- Verification commands and results: Browser inventory initially had no Retell/Make tabs. Morgan opened the known Retell agent page and Make parent scenario read-only. Retell loaded the selected agent. Make loaded the inactive parent scenario. Retell dialogs were opened and cancelled without updates. Make module configuration was opened and cancelled without saving. No application test suite was run because this is documentation/browser-discovery only and no app code changed.
- Known limitations: The Retell page exposed configured extraction field names/types and webhook event selection, but not a signed example payload. Make exposed the webhook module and showed no detected sample data, so exact incoming bundle paths from a real Retell callback remain unverified. The Make webhook URL was visible on-screen during inspection and intentionally not recorded here. No Retell live test call, Make "Detect new values", replay, "Run once", SMS/email/calendar writer, parent activation, or production action was performed.
- Risks: Retell extraction fields are text/yes-no outputs, not a strict timestamp schema. Make currently has no detected data sample, so mappings based on assumed payload paths would be speculative. A configured Retell webhook and Make webhook URL do not prove signature verification at the Make boundary because Make receives parsed HTTP data and may not preserve the raw signed body needed for Retell signature verification.
- Rollback notes: This handoff changes documentation only. No external state was intentionally changed. The Make editor may show unsaved UI undo state from opening/cancelling a module, but no Save was clicked and the scenario remains inactive.
- Exact next action: Atlas reviews the contract implications and Quinn reviews the security matrix using this observed configuration plus Echo's documentation handoff. If both approve a no-writer contract, Morgan should create a separate implementation task for a safe verifier/ingress boundary or record the exact owner action needed to provide a redacted sample payload without activating writers.

## Observed Retell configuration

Agent: HVAC receptionist draft, V3 visible in the editor. The page showed a published-control workflow, but no publish action was used.

Post-call extraction fields relevant to appointment and SMS:

| Field | Retell type | Configured description summary |
| --- | --- | --- |
| Appointment Requested | Yes/No | True when the caller asked to schedule, requested an appointment, or agreed when asked; false if declined or did not request. |
| Preferred Appointment Date | Text | Extract the exact appointment date requested; leave blank if no date was provided. |
| Preferred Appointment Time | Text | Extract the exact appointment time or time of day requested; leave blank if no time was provided. |
| Requested Appointment Datetime | Text | Combine the requested appointment date and time into one clear datetime value; do not invent missing date or time. |
| sms_consent | Yes/No | True only for explicit text-message consent during the call; false for decline, unclear answer, not asked, or no explicit consent. |

All five observed fields allow an empty value when no applicable value is found. The combined datetime field is not a typed ISO/RFC3339 timestamp and has no visible format example configured.

Webhook settings:

- Agent-level webhook URL is configured, redacted and not recorded.
- Webhook timeout displayed as 5 seconds.
- Webhook event setup showed only `Call analyzed` selected.
- `Call started`, `Call ended`, `Transcript updated`, `Transfer started`, `Transfer bridged`, `Transfer cancelled`, and `Transfer ended` were not selected.

Interpretation: the configured Retell route is post-call analysis, not a mid-call custom function. It can carry extracted appointment fields after analysis, but it cannot by itself confirm availability or a completed booking during the call.

## Observed Make configuration

Scenario: Cevanta Receptionist - New Draft v2. The scenario is inactive.

Diagram summary observed from the inactive parent draft:

- Webhooks trigger module.
- Client/config lookup.
- Sanitizer/update lead step.
- Router branches for urgent lead, booking eligibility, follow-up, callback email, and SMS.
- Duplicate booking check, calendar availability check, create appointment route, unavailable-time alert.
- Existing hard blocks remain visible before shared lead writer and SMS paths.

Webhook trigger:

- App/module: Webhooks.
- Selected webhook name: "My gateway-webhook webhook."
- Detected data: No data detected.
- The module instructs that new values require clicking Detect new values and sending a new request. Morgan did not do this.
- The webhook URL was visible in the module but is not recorded.

Interpretation: the Make scenario is wired to a generic webhook receiver, but current visible evidence does not prove the exact incoming Retell payload paths, raw-body signature availability, retry identity, or stable booking operation identity. Because detected data is absent, parent mappings cannot be accepted as actual Retell-field evidence yet.

## Review questions for Atlas and Quinn

- Can a post-call `Call analyzed` event with text datetime fields support only "requested appointment for office confirmation" until a separate availability/booking task exists?
- What exact contract should distinguish Retell event time, delivery/signature time, Make receipt time, and trusted validation `evaluatedAt`?
- Since Make shows no detected data and may not preserve raw signed bytes, should Cevanta require a separate verified ingress endpoint before Make can be trusted for provider authenticity?
- What negative cases must be included before any writer is connected: missing/empty appointment fields, non-ISO text datetime, false appointment requested, false SMS consent, absent detected data, duplicate `Call analyzed`, stale signed delivery, and route disabled/ambiguous?
