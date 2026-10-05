# First-client intake package

Date: 2026-10-04
Use: collect information for the first managed Cevanta pilot before the client has app access.

This document is for fictional test setup and first-client discovery. Do not place passwords, API keys, private webhook URLs, payment details, government IDs, or real customer lists in this file. Store secrets only in the approved provider accounts or environment settings.

## How to use this with a prospect

Tell the client: "We are setting up a managed AI receptionist pilot. The first version captures calls, creates service requests for office review, and helps your team respond faster. Live booking, calendar sync, SMS, and automated customer messages stay under manual approval until the pilot tests pass."

Collect the answers below. If an answer is unknown, write "decide later" rather than guessing.

## 1. Business profile

- Business legal name:
- Public business name:
- Trade or specialty:
- Main phone number:
- Main email:
- Website:
- Business address:
- Time zone:
- Primary owner/contact name:
- Primary owner/contact phone:
- Primary owner/contact email:

## 2. Service area

- Cities/counties served:
- ZIP codes served:
- Maximum travel distance:
- Areas not served:
- After-hours service area different from daytime? Yes/No. Details:

## 3. Services offered

List each service the AI receptionist may recognize.

| Service | Description | Emergency? | Usually same-day? | Notes |
| --- | --- | --- | --- | --- |
| Example: AC repair | No cooling, weak cooling, strange noise | Sometimes | Yes | Office confirms availability |

## 4. Business hours

Weekly hours:

| Day | Open/closed | Hours | Notes |
| --- | --- | --- | --- |
| Monday |  |  |  |
| Tuesday |  |  |  |
| Wednesday |  |  |  |
| Thursday |  |  |  |
| Friday |  |  |  |
| Saturday |  |  |  |
| Sunday |  |  |  |

Date-specific exceptions:

| Date | Open/closed | Hours | Reason |
| --- | --- | --- | --- |
|  |  |  |  |

## 5. Call handling rules

- What should the AI say in the opening greeting?
- Should the AI say it is an AI receptionist? Recommended: yes.
- What information should it always collect?
  - Customer name:
  - Callback phone:
  - Service address:
  - Service needed:
  - Urgency:
  - Preferred day/time:
  - Notes/photos availability:
- What should the AI never promise?
- What words should trigger office review?
- What words should trigger emergency handling?

## 6. Emergency and escalation rules

- Is emergency service offered? Yes/No.
- Emergency hours:
- Emergency phone or person:
- What counts as emergency?
- What should the AI do for emergency calls?
- Should the AI transfer, text, email, or only create a high-priority lead during pilot?
- Backup person if first contact does not respond:

Escalation contacts:

| Purpose | Contact name | Phone | Email | When to use |
| --- | --- | --- | --- | --- |
| Office review |  |  |  |  |
| Emergency |  |  |  |  |
| Scheduling |  |  |  |  |

## 7. Lead qualification

- Good lead examples:
- Bad lead examples:
- Minimum information needed before office follow-up:
- Should renters be accepted? Yes/No/Depends:
- Commercial jobs accepted? Yes/No/Depends:
- Warranty work accepted? Yes/No/Depends:
- New installs accepted? Yes/No/Depends:
- Maintenance plans accepted? Yes/No/Depends:

## 8. Booking policy for the pilot

Recommended first version: AI captures the request; office confirms booking manually.

- Can the AI offer appointment windows? Yes/No:
- Can the AI confirm appointments? Recommended for pilot: No.
- Standard appointment length: 60 minutes unless changed.
- Minimum lead time:
- Buffer before/after jobs:
- How far ahead can customers request service?
- What should happen if requested time is unavailable?
- What should the AI say after collecting a request?

Approved pilot wording:

"I have your request and the office will review availability before confirming the appointment."

Avoid saying during pilot:

"Your appointment is confirmed."

## 9. Make, Retell, Twilio and calendar readiness

- Retell account available? Yes/No:
- Retell phone-answering test passed? Current Cevanta status: Yes, with limitations.
- Twilio account available? Yes/No:
- Phone number to use for pilot:
- Make.com scenario exists? Yes/No:
- Make safe intake duplicate test passed? Current Cevanta status: Yes, with fictional data and scenario inactive after testing.
- Make.com scenario name:
- Google Calendar to use for testing:
- Should test leads go to app, sheet, email draft, or Make datastore first?
- SMS sending approved for pilot? Recommended: No until dry run passes.
- Email sending approved for pilot? Recommended: Draft or internal only until dry run passes.
- Calendar creation approved for pilot? Recommended: No until office review flow passes.

## 10. Test data only

Use this fictional caller for testing:

- Name: Test Customer
- Phone: +15550000001
- Address: 123 Fictional Street
- Service: HVAC repair
- Preferred time: Tomorrow at 2 PM
- Note: This is only a test.

The first successful test should prove:

- Retell captures the call.
- Make receives the final analyzed call event.
- One lead/request is created.
- Duplicate call ID does not create duplicate records.
- No real SMS/email/calendar/customer message is sent unless separately approved.

## 11. Owner approvals needed before go-live

The owner must approve these before a live pilot:

- Business info is correct.
- Services and hours are correct.
- Emergency handling wording is correct.
- Escalation contacts are correct.
- AI is allowed to answer test calls.
- Retell test call passed.
- Make safe intake duplicate handling passed.
- Launch and Integrations pages have been reviewed with the client.
- Any SMS/email/calendar action is explicitly approved.
- Client understands this is a managed pilot with office review.

## 12. Pilot launch notes

- Pilot start date:
- Pilot phone number:
- Internal reviewer:
- Daily check time:
- What counts as success in week 1:
- What should stop the pilot immediately:


