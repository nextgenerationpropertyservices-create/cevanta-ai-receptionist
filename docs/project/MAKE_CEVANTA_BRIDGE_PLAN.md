# Make → Cevanta bridge setup note

Date: 2026-10-05

## Current state

Retell agent `agent_a9182cc8117ac588f68bc52a3d` sends analyzed-call events to Make. The safe receiver scenario is Make scenario `6515719`, `Cevanta Receptionist — MCP Intake Receiver`. It is inactive and currently:

- Receives Retell webhook events.
- Ignores non-`call_analyzed` events.
- Checks the Make data store for an existing record by `call.call_id`.
- Creates one safe office-review record only when the call ID is new.
- Returns duplicate acknowledgement when the call ID already exists.
- Has Make canvas note `353828` attached to the create/response section explaining the future Cevanta bridge step.

Cevanta has a production bridge endpoint at:

`POST https://cevanta-ai-receptionist.vercel.app/api/integrations/make/retell-lead`

Production verifier mode is enabled and writer mode is off. Signed fictional requests return `verified_not_persisted`; unsigned requests are rejected. No lead, booking, SMS, email or calendar write is created while writer mode stays off.

## Safe Cevanta payload from Make

When the Make bridge is wired, Make should send only this minimal JSON shape after the duplicate check succeeds and before returning the normal success response:

```json
{
  "event": "retell_call_analyzed",
  "call_id": "{{1.call.call_id}}",
  "agent_id": "{{1.call.agent_id}}",
  "lead": {
    "caller_name": "{{1.call.call_analysis.custom_analysis_data.customer_name}}",
    "caller_phone": "{{1.call.from_number}}",
    "service_type": "{{1.call.call_analysis.custom_analysis_data.service_type}}",
    "call_summary": "{{1.call.call_analysis.call_summary}}",
    "service_address": "{{1.call.call_analysis.custom_analysis_data.service_address}}",
    "urgency": "{{1.call.call_analysis.custom_analysis_data.urgency}}",
    "preferred_appointment_time": "{{1.call.call_analysis.custom_analysis_data.requested_date}} {{1.call.call_analysis.custom_analysis_data.requested_time}}"
  }
}
```

Do not send transcripts, recordings, raw provider payloads, webhook URLs, secrets, real customer screenshots, or body-provided tenant IDs.

## Required headers

- `Content-Type: application/json`
- `x-cevanta-make-signature: v=<unix-ms>,d=<hmac-sha256(rawBody + timestamp)>`

The signing secret must be stored only in Vercel and Make, never in source, docs, screenshots or chat messages.

## Remaining gate

The route is ready for verifier-only Make testing, but the private bridge secret still needs a safe entry path into Make. Do not paste the secret into docs or source. Do not activate the scenario as always-on and do not enable `MAKE_RETELL_INGRESS_LEAD_WRITER` until Quinn review and owner approval for live production writes.
