# Make and Retell fictional dry-run checklist

Date: 2026-10-05
Use: safe manual test plan for Retell -> Make -> office-review output.

This checklist is for a dry run with fictional data only. It must not send SMS, email, calendar invites, customer messages, production database writes, or live bookings. Do not paste webhook URLs, API keys, phone numbers you own, real customer details, transcripts, recordings, or provider secrets into this document.

## What this dry run proves

A passing dry run proves only this limited point: a fictional final analyzed-call event can reach a safe Make test path, be mapped into expected fields, avoid duplicates, and create a safe review artifact.

It does not prove hosted Cevanta callbacks, live Retell delivery, Twilio routing, Google Calendar writes, SMS/email delivery, production Supabase behavior, or production readiness.

## Safe setup rules

Use a duplicate scenario or a brand-new safe scenario in Make.

Name it with a clear label such as:

- `Cevanta Retell Dry Run - Safe Test`
- `Northstar HVAC Demo - Fictional Intake Test`

Before the first run, confirm these are disabled or replaced with safe test-only outputs:

| Risky action | Required dry-run state |
| --- | --- |
| SMS send | Disabled, removed, or replaced with a note-only module |
| Email send | Disabled, removed, or replaced with a note-only module |
| Calendar create/update | Disabled, removed, or replaced with a note-only module |
| Live CRM/customer write | Disabled unless the destination is a clearly marked fictional test area |
| Production Cevanta webhook | Not used in this dry run |
| Human transfer/live call routing | Not used in this dry run |
| Real Retell phone number | Not used unless a separate owner-approved live-call task is created |

Use Make's manual run mode. Keep the scenario off for scheduled or always-on operation until a later owner-approved live test.

## Recommended dry-run modules

Build or inspect the scenario in this order.

| Order | Make step | Expected behavior |
| --- | --- | --- |
| 1 | Webhook trigger or manual JSON input | Receives only fictional payloads during the dry run |
| 2 | Event filter | Continues only when `event` is `call_analyzed` |
| 3 | Parse/map fields | Maps caller, service, address, urgency, requested time, summary and call ID |
| 4 | Required-field check | Marks incomplete requests for office review instead of pretending they are booked |
| 5 | Duplicate check | Uses `call_id` or `source_event_id` so the same call cannot create a second output |
| 6 | Safe output | Writes only to a safe test destination such as a Make Data Store test record, test sheet, or scenario log |
| 7 | Error path | Records what was missing and stops without live side effects |

## Field map

Use the fictional payload in [MAKE_RETELL_TEST_PAYLOAD.md](MAKE_RETELL_TEST_PAYLOAD.md).

| Cevanta field | Payload source | Required? | Dry-run handling |
| --- | --- | --- | --- |
| Source event ID | `event_id` | Yes | Use for evidence and duplicate review |
| Call ID | `call.call_id` | Yes | Primary duplicate key |
| Event type | `event` | Yes | Accept `call_analyzed`; ignore other event types |
| Caller name | `call.call_analysis.custom_analysis_data.customer_name` | Preferred | If missing, mark as `Unknown caller` and send to review |
| Caller phone | `call.from_number` or custom field | Preferred | Validate shape; never use a real number in dry-run docs |
| Service type | `call.call_analysis.custom_analysis_data.service_type` | Yes for request creation | If missing, route to office review |
| Address | `call.call_analysis.custom_analysis_data.service_address` | Preferred | If missing, route to office review |
| Requested date | `call.call_analysis.custom_analysis_data.requested_date` | Optional | Never confirm an appointment from this alone |
| Requested time | `call.call_analysis.custom_analysis_data.requested_time` | Optional | Never confirm an appointment from this alone |
| Urgency | `call.call_analysis.custom_analysis_data.urgency` | Preferred | High urgency means office review or escalation note, not an automatic promise |
| Summary | `call.call_analysis.call_summary` | Preferred | Store only fictional summaries in dry-run evidence |
| Transcript | `call.transcript` | Optional | Avoid storing transcript unless needed for a fictional test note |
| Consent to text | `call.call_analysis.custom_analysis_data.consent_to_text` | Required before SMS in later live work | In dry run, record only; do not send SMS |

## Test cases

Run these with fictional payloads only. Record Make execution IDs or timestamps, but do not copy private webhook URLs or secrets into evidence.

### 1. Happy path request

Use the full fictional payload.

Expected result:

- Event passes the `call_analyzed` filter.
- Required fields map correctly.
- One safe output record is created.
- Output says `office_review_required: true`.
- No SMS, email, calendar event, live call transfer, or production app write occurs.

### 2. Duplicate call ID

Run the same payload a second time without changing `call.call_id`.

Expected result:

- Scenario detects the duplicate.
- No second lead/request output is created.
- Evidence records a duplicate/no-op result.

### 3. Missing date or time

Remove `requested_date` or `requested_time`.

Expected result:

- Scenario still captures the lead/request if core contact and service data exist.
- Scenario marks scheduling as incomplete.
- Scenario does not claim an appointment was booked.

### 4. Missing service type

Remove `service_type`.

Expected result:

- Scenario routes the item to office review.
- Scenario does not create a confirmed booking.
- Scenario records the missing field without exposing private data.

### 5. Wrong event type

Change `event` to `call_started` or `call_ended`.

Expected result:

- Scenario stops at the event filter.
- No output record is created.

### 6. Urgent or emergency language

Set urgency to `high` and include a fictional note such as `caller says no cooling and asks for same-day help`.

Expected result:

- Scenario marks the item as urgent for office review.
- Scenario does not promise emergency service, medical support, or a confirmed same-day appointment.
- Any escalation action remains a safe test note only.

### 7. Invalid phone or address

Use an invalid fictional phone or remove the service address.

Expected result:

- Scenario marks the request incomplete.
- Scenario does not send messages or calendar actions.
- Scenario keeps the record in office review status.

### 8. Out-of-order retry

Run a partial event first, then run the final analyzed event using the same `call_id`.

Expected result:

- Non-final event is ignored or recorded as no-op.
- Final analyzed event creates or updates one safe output.
- Duplicate protection still prevents two office-review requests for one call.

## Pass/fail evidence to record

Use this table for each run.

| Evidence item | Value |
| --- | --- |
| Date/time |  |
| Tester |  |
| Make scenario name |  |
| Make execution ID/time |  |
| Fictional event ID |  |
| Fictional call ID |  |
| Test case |  |
| Expected result |  |
| Actual result |  |
| Safe output destination |  |
| SMS/email/calendar disabled? |  |
| Production writes disabled? |  |
| Pass/fail |  |
| Notes/blockers |  |

## Go/no-go decision

Go to the next review step only if all of these are true:

- The safe scenario copy exists.
- All live side-effect modules are disabled or replaced with safe test-only outputs.
- Happy path creates one safe output.
- Duplicate payload does not create a second output.
- Missing information goes to office review.
- Non-final events do not create leads or bookings.
- Evidence contains no secrets, real customer data, private webhook URLs, transcripts, recordings, or credentials.

Stop if any live side effect might run, if real customer data appears, if a duplicate creates another output, or if Make claims a booking was confirmed without office review.

## Owner approval required before live testing

Ask the owner before any of these actions:

- Turning on a Make scenario for always-on operation
- Registering or changing a Retell webhook
- Routing a Twilio number to Retell
- Making a live test call
- Sending SMS or email
- Creating or updating a Google Calendar event
- Writing Retell/Make output to production Cevanta data
- Showing provider dashboards that may expose secrets or real customer information
