# Make minimal safe dry-run scenario

Date: 2026-10-05
Owner: Morgan — Product Manager and Orchestrator
Status: ready to build in Make; do not connect live Retell or Twilio yet.

## Purpose

Create a tiny Make scenario that proves the AI receptionist payload shape and routing logic without sending email, SMS, calendar writes, calls or production writes.

Use this instead of running `Cevanta Receptionist — Safe Dry Run` until its Gmail, Google Calendar and SMS modules are disabled, replaced or guarded.

## Scenario name

`Cevanta Receptionist — Minimal Safe Dry Run`

## Required modules

1. **Custom webhook**
   - New webhook only for this scenario.
   - Treat the webhook URL as secret-like.
   - Do not paste the webhook URL into project docs or chat.

2. **Filter: analyzed call only**
   - Continue only when the incoming payload says the event is `call_analyzed`.
   - Stop safely for `call_started`, `call_ended`, missing event or unknown event.

3. **Validation / mapping**
   - Extract only safe fields needed for office review:
     - fictional call ID
     - caller name
     - callback phone
     - service/problem summary
     - urgency
     - appointment requested yes/no
     - preferred date/time if present
   - Never treat a requested appointment as confirmed.
   - Never create calendar events in this scenario.

4. **Safe response or safe log only**
   - Return or record a small safe result:
     - `office_review_required: true`
     - `booking_confirmed: false`
     - `sms_sent: false`
     - `email_sent: false`
     - `calendar_event_created: false`
     - `production_write_performed: false`
   - If Make needs an output destination, use a Make-only run result or a safe text response. Do not use Gmail, Twilio, Google Calendar or Cevanta production writes.

## Required dry-run cases

Run with fictional payloads only.

| Case | Expected result |
| --- | --- |
| Happy path `call_analyzed` | One safe office-review output, no side effect |
| Duplicate call ID | No duplicate downstream output or clearly marked duplicate |
| Missing date/time | Office review only; no confirmed appointment |
| Missing service type | Incomplete/review state; no booking |
| Wrong event type | Filter stops; no output |
| Urgent language | Urgent office review; no emergency promise |
| Invalid phone/address | Incomplete/review state; no live side effect |

## Pass criteria

The scenario passes only if every test confirms:

- no SMS sent
- no email sent
- no calendar event created
- no Cevanta production write
- no live Retell webhook registration
- no Twilio phone routing change
- no real customer data used

## Stop conditions

Stop immediately if any module would:

- send Gmail or email
- send Twilio/SMS
- create or update Google Calendar
- call Cevanta production write endpoints
- expose a webhook URL, token or private payload in docs
- use a real customer name, phone, address, transcript or recording

## Next Make action

Create the minimal scenario manually in Make, keep it inactive, and run it only with fictional manual webhook payloads. After the first successful safe run, record the scenario name, run time, fictional call ID and pass/fail status in `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`.
