# Fictional Retell-to-Make test payload

Date: 2026-10-05
Use: copy-safe example for Make dry-run mapping.

This payload is fictional. It uses reserved example domains and fake phone numbers. Do not replace it with real customer information in source control. Do not add webhook URLs, API keys, recordings, transcripts from real calls, or provider secrets.

## Full happy-path payload

```json
{
  "event": "call_analyzed",
  "event_id": "evt_demo_20261005_0001",
  "created_at": "2026-10-05T14:00:00.000Z",
  "call": {
    "call_id": "call_demo_northstar_0001",
    "agent_id": "agent_demo_safe_dry_run",
    "from_number": "+15550000001",
    "to_number": "+15550000002",
    "call_status": "ended",
    "start_timestamp": 1791208800000,
    "end_timestamp": 1791209100000,
    "transcript": "Caller Test Customer says the air conditioner is not cooling at 123 Fictional Street and asks whether tomorrow afternoon is available. The caller agrees the office can review the request before confirming anything.",
    "call_analysis": {
      "call_summary": "Fictional caller requested AC repair for no cooling at 123 Fictional Street. Requested tomorrow at 2 PM. Office review is required before any appointment is confirmed.",
      "user_sentiment": "neutral",
      "call_successful": true,
      "custom_analysis_data": {
        "customer_name": "Test Customer",
        "service_type": "AC repair",
        "service_address": "123 Fictional Street, Demo City, NY 10001",
        "requested_date": "2026-10-06",
        "requested_time": "14:00",
        "urgency": "normal",
        "issue_summary": "Air conditioner is not cooling.",
        "consent_to_text": true,
        "office_review_required": true,
        "do_not_confirm_booking": true
      }
    }
  }
}
```

## Expected safe output shape

Use this as the safe record Make should create in a test-only destination.

```json
{
  "source": "retell_make_dry_run",
  "source_event_id": "evt_demo_20261005_0001",
  "source_call_id": "call_demo_northstar_0001",
  "customer_name": "Test Customer",
  "caller_phone": "+15550000001",
  "service_type": "AC repair",
  "service_address": "123 Fictional Street, Demo City, NY 10001",
  "requested_window": "2026-10-06 14:00",
  "urgency": "normal",
  "summary": "Fictional caller requested AC repair for no cooling at 123 Fictional Street. Requested tomorrow at 2 PM. Office review is required before any appointment is confirmed.",
  "office_review_required": true,
  "booking_confirmed": false,
  "sms_sent": false,
  "email_sent": false,
  "calendar_event_created": false,
  "production_write_performed": false,
  "dry_run_notes": "Safe fictional dry run only. No live side effects."
}
```

## Minimal duplicate-check key

Use one of these, in this order:

1. `call.call_id`
2. `event_id` if the call ID is unavailable
3. a composed dry-run key from `agent_id`, `from_number`, and `created_at` only for manual investigation

A duplicate must not create a second lead, booking, calendar hold, SMS, or email.

## Mutation-safe field rules

| Field | Safe rule |
| --- | --- |
| `office_review_required` | Must remain `true` in the first managed pilot dry run |
| `booking_confirmed` | Must remain `false` unless a later owner-approved booking workflow confirms it |
| `sms_sent` | Must remain `false` during dry run |
| `email_sent` | Must remain `false` during dry run |
| `calendar_event_created` | Must remain `false` during dry run |
| `production_write_performed` | Must remain `false` during dry run |

## Variation payload snippets

Use these snippets by replacing the matching fields in the full payload.

### Wrong event type

```json
{
  "event": "call_started"
}
```

Expected: Make stops at the event filter.

### Missing scheduling details

```json
{
  "requested_date": null,
  "requested_time": null
}
```

Expected: Make records an office-review lead/request only and does not claim a scheduled appointment.

### Missing service type

```json
{
  "service_type": null
}
```

Expected: Make marks the request incomplete and sends it to safe office review.

### Urgent review

```json
{
  "urgency": "high",
  "issue_summary": "Caller says the home has no cooling and asks for same-day help. This is fictional dry-run data."
}
```

Expected: Make marks urgent office review. No emergency promise, live transfer, SMS, email or confirmed appointment occurs.

## Evidence warning

When recording a Make test result, capture only the scenario name, run time, fictional call ID, fictional event ID, module pass/fail status and safe output destination. Do not paste private webhook URLs, secret tokens, provider signatures, recordings, or real transcripts into project docs.
