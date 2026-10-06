# Make → Cevanta bridge checklist

Date: 2026-10-05
Scenario: `6515719` — `Cevanta Receptionist — MCP Intake Receiver`
Production endpoint: `https://cevanta-ai-receptionist.vercel.app/api/integrations/make/retell-lead`

This checklist is safe to keep in source because it contains no private webhook URL, signing secret, provider token, customer data, transcript or recording link.

## Before editing Make

- Confirm the scenario is inactive.
- Confirm Cevanta production health is ok.
- Confirm Cevanta Make bridge is in verifier-only mode: writer env remains unset.
- Confirm the Make bridge secret will be entered through a private field or controlled UI path, not copied into docs, chat, screenshots or command logs.
- Use fictional data for every test.

2026-10-06 status: scenario `6515719` was re-inspected and remains inactive. Cevanta bridge tests passed locally. A new Make canvas note `354328` records the verifier-only status and signing gate. A private Make custom app shell `Cevanta Bridge` (`cevanta-bridge-cgv2vw`) was created for the safer credential-based bridge path. Do not add a normal HTTP module with visible secret fields.

## Where the bridge belongs

Add the Cevanta HTTP call only on the new-call create path:

1. Retell webhook receives event.
2. Event router keeps only `call_analyzed`.
3. Data-store existence check looks up `call.call_id`.
4. Duplicate path returns duplicate acknowledgement.
5. Create path adds the safe office-review record.
6. New Cevanta bridge HTTP call posts the minimal lead payload.
7. Final webhook response returns the safe intake acknowledgement.

Do not add the Cevanta bridge to the duplicate path or the ignored-event path.

## Payload allowed to leave Make

Send only:

- `event`: `retell_call_analyzed`
- `call_id`: Retell call ID
- `agent_id`: Retell agent ID
- `lead.caller_name`
- `lead.caller_phone`
- `lead.service_type`
- `lead.call_summary`
- `lead.service_address`
- `lead.urgency`
- `lead.preferred_appointment_time`

Do not send:

- full Retell payload
- transcript
- recording URL
- webhook URL
- Make webhook URL
- provider request headers
- tenant ID from the incoming body
- API keys or signing secrets
- real customer test data

## Expected verifier-only result

A valid signed test should return HTTP 200 with:

```json
{"status":"verified_not_persisted","persisted":false,"bookingCreated":false}
```

That means the bridge works but Cevanta intentionally did not create a production lead yet.

Unsigned, stale, altered or malformed tests should reject before any write.

## Stop conditions

Stop before continuing if any of these happen:

- Make cannot send the bridge secret through a private credential/connection without exposing it in scenario config, docs, chat, screenshots or logs.
- Make requires a paid upgrade or paid connection.
- A test would consume Retell minutes or paid phone credits.
- A module would send SMS, email or calendar updates.
- The private signing secret would appear in docs, chat, screenshots, command output or source.
- The scenario cannot stay inactive after editing.
- The Cevanta endpoint returns anything other than verifier-only status while writer mode should be off.

## Writer activation is a separate decision

Do not enable `MAKE_RETELL_INGRESS_LEAD_WRITER` or add service-role writer secrets as part of this checklist. Writer mode needs Quinn review and owner approval because it creates production records from provider events.
