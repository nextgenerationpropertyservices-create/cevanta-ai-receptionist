# Cevanta Client Onboarding Instructions

Updated: October 10, 2026
Use: give yourself and the first client a clear path from signup to live managed pilot.

Do not collect passwords, API keys, card numbers, bank details, private webhook URLs, government IDs, or full customer lists in the dashboard or in these documents. Keep secrets inside the provider account or an approved password manager.

## Plain-English client instructions

Send this to the client after they agree to start the managed pilot:

1. Open the Cevanta dashboard link I send you.
2. Sign in with your business email.
3. Go to **Onboarding**.
4. Fill out your business profile, services, service area, hours, call rules, escalation contact, and appointment preferences.
5. Use normal business information only. Do not enter passwords, payment details, private customer lists, or API keys.
6. If you are unsure about a question, write “review with Cevanta” instead of guessing.
7. Tell me when you are done so I can review it before test calls.

Use this expectation with the client:

“Cevanta will answer calls and collect service requests for office review. During the first pilot, your office confirms appointments and customer messages before anything is finalized.”

## What the client fills out in the dashboard

The client should fill out these items in the Cevanta dashboard onboarding page:

- Business public name
- Business phone and email
- Website
- Service area
- Services offered
- Normal business hours
- Holiday or closed-day exceptions
- What information the AI should collect from callers
- What the AI should never promise
- Emergency or urgent-call rules
- Office review contact
- Scheduling preferences
- Preferred appointment length
- Preferred callback process

## What you keep internal

Keep these outside the client-editable dashboard:

- Pricing
- Signed pilot agreement
- Payment method setup
- Internal test-call checklist
- Go-live approval checklist
- Support process
- Provider setup notes
- Retell, Make, Supabase, Vercel, Twilio, email, calendar, or billing credentials
- Private webhook URLs and API keys

## After the client submits onboarding

Do this before any live calls:

1. Review every dashboard onboarding answer.
2. Save a completed intake copy in the client folder.
3. Confirm the office-review boundary with the client.
4. Confirm what counts as urgent or emergency.
5. Confirm what the AI must never promise.
6. Confirm the escalation contact.
7. Run one fictional test call.
8. Check that exactly one lead appears in the dashboard.
9. Confirm no SMS, email, calendar event, quote, payment, booking, or dispatch happened automatically.
10. Get client approval before go-live.

## Where to save the completed intake

Save completed client onboarding records here:

`C:\Users\herri\OneDrive\Desktop\Cevanta Business\04 - Clients`

Create one folder per client:

`CL-0001 - Client Business Name`

Recommended client folder structure:

```text
CL-0001 - Client Business Name
├─ Intake
│  └─ 2026-10-10_CL-0001_completed_intake_v1.md
├─ Agreement
├─ Billing
├─ Setup
├─ Test Calls
├─ Go Live
└─ Support
```

Use a new version if the client changes important rules:

- `2026-10-10_CL-0001_completed_intake_v1.md`
- `2026-10-15_CL-0001_completed_intake_v2.md`

## Your review checklist

Before test calls, confirm:

- Business name is correct.
- Service area is clear.
- Services are clear enough for the AI to classify calls.
- Business hours are clear.
- Closed days and exceptions are listed.
- Emergency rules are clear.
- Escalation contact is correct.
- AI is not allowed to confirm appointments.
- AI is not allowed to quote prices unless the client approved exact wording.
- AI is not allowed to promise dispatch.
- AI is not allowed to send SMS/email/calendar updates unless separately approved.

## Test-call checklist

Use fictional caller information for the first tests.

Fictional test caller:

- Name: Sam Carter
- Callback number: 207-555-0198
- Address: 22 Pine Street, Lewiston, Maine
- Service need: furnace making a grinding noise
- Urgency: not an emergency, but would like service soon
- Preferred time: Monday morning

Pass criteria:

- AI answers naturally.
- AI collects name, callback number, service need, address or town, urgency, and preferred time.
- Phone number is repeated digit by digit when confirming.
- If area code is missing, AI asks for the area code.
- AI does not say the appointment is confirmed.
- AI says the office will review and follow up.
- One lead appears in Cevanta.
- No duplicate lead appears.
- No SMS, email, calendar event, payment, quote, or dispatch happens automatically.

## Go-live checklist

Go live only when all are true:

- Client completed dashboard onboarding.
- You reviewed and saved the completed intake in the client folder.
- Retell has enough credits.
- Retell phone number is assigned to the correct live agent.
- Retell prompt matches the client rules.
- Make/Cevanta lead creation has passed one fictional test call.
- Duplicate test does not create a second lead.
- Client approved the office-review wording.
- Client understands appointments are not automatically confirmed during the first pilot.
- Support process is ready.

## Support process for first pilot

Daily during the first week:

1. Check new leads in Cevanta.
2. Check Retell call history for failed or incomplete calls.
3. Check Make scenario history if a call does not appear in Cevanta.
4. Review any urgent-call handling.
5. Write down tuning changes before editing prompts.
6. Confirm with the client before changing booking, SMS, email, calendar, payment, quote, or dispatch behavior.

If something goes wrong:

- Pause live intake if the AI promises confirmed appointments.
- Pause live intake if duplicate leads are created.
- Pause live intake if Retell credits are low.
- Pause live intake before turning on SMS, email, calendar, payment, quote, or dispatch automation.
- Use manual office follow-up until the issue is fixed.
