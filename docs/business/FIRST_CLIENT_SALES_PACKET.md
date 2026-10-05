# First-client sales packet

Date: 2026-10-05
Use: sell the first version as a managed pilot without overpromising automation.
Related launch walkthrough: docs/business/PILOT_LAUNCH_WALKTHROUGH.md.

Cevanta is not ready to sell as a fully automated production AI receptionist. It is ready to present as a managed pilot if you are clear that the office still confirms appointments, customer messages and calendar changes. Retell phone answering has passed a live inbound test, and the Make safe intake receiver has passed fictional duplicate-handling tests. Production writes, SMS, email, external calendar writes, billing and fully self-service launch are still gated.

## The offer

Use this offer:

"Cevanta is a managed AI receptionist pilot for HVAC and service businesses. It helps capture missed calls, organize service requests, and give the office a clear review flow. During the pilot, your team stays in control of confirmations, calendar changes and customer messages."

The first sellable version is strongest as a done-with-you pilot, not a self-serve SaaS launch.

## Best first client

Look for a business like this:

| Signal | Good first-client fit |
| --- | --- |
| Trade | HVAC, plumbing, electrical or another appointment-based service business |
| Call problem | Misses calls, loses details, or has no clean after-hours intake |
| Office process | Has a person who can review requests before confirming appointments |
| Automation comfort | Will accept a managed pilot with office approval instead of full autopilot |
| Data size | Small enough to start with a simple service list, hours and call rules |
| Urgency | Wants better lead capture soon, but does not require instant production-grade automation on day one |

Avoid first clients who require all of these immediately:

- fully automatic bookings with no office review
- guaranteed SMS/email/calendar automation on day one
- heavy compliance demands before a pilot
- complex multi-branch dispatch rules
- emergency-service promises the AI must make without a human
- large customer imports before the product is live-ready

## What you can say

Use these safe claims:

- "The pilot is built to capture service requests and organize follow-up."
- "Your office reviews the request before anything is confirmed."
- "We can configure services, hours, escalation contacts and call-handling rules."
- "Retell phone answering has passed a live inbound test, and Make safe intake has passed fictional duplicate-handling tests. We still keep production writes and customer messages off until approved."
- "The first pilot focuses on fewer missed calls and better follow-up, not replacing your office staff."

## What not to say yet

Do not say:

- "It is fully production-ready."
- "It books appointments automatically with no review."
- "SMS, email and calendar automation are already proven live."
- "It can handle every emergency call without a person."
- "It is ready for any business size or workflow."
- "Live Retell, Make, Twilio and Google Calendar behavior is already verified for your business."
- "The app can send customer SMS, email or calendar updates today without office approval."

## Simple sales call structure

### 1. Open with the problem

"A lot of service businesses lose money when calls are missed or details are not captured cleanly. Cevanta is being built to catch those requests and put them into an office review flow."

### 2. Set the pilot expectation

"For the first pilot, the AI helps capture and structure requests. Your office still approves messages, calendar changes and confirmed appointments."

### 3. Ask discovery questions

Ask these first:

- How many calls do you miss in a normal week?
- Who answers after-hours calls now?
- What details do you always need before scheduling?
- Which services should the AI recognize first?
- What should the AI never promise?
- Who should review new AI-created requests?
- Do you want the first pilot to create leads only, or draft appointment requests for review?

### 4. Show the demo

Use the accepted demo script in `docs/business/FIRST_CLIENT_DEMO_SCRIPT.md`.

Show only fictional data:

- workspace/dashboard
- setup/onboarding
- services and hours
- request preferences
- customer or lead foundation
- calendar foundation, described as internal and not live Google Calendar proof
- Launch page and Integrations page, showing what is ready and what is still gated
- Retell phone-answering proof and Make safe-intake proof, described with limitations

### 5. Close with a next step

Use this close:

"If this fits, the next step is a setup call where we collect your services, hours, call rules and escalation contacts. Then we run a safe dry run before we turn on any live automation."

## First-client setup checklist

Before taking a first client live, collect this with `docs/business/FIRST_CLIENT_INTAKE.md`:

| Item | Needed before sales demo? | Needed before live pilot? |
| --- | --- | --- |
| Business name and service area | Yes | Yes |
| Services offered | Yes | Yes |
| Normal hours | Yes | Yes |
| Date-specific exceptions | Optional | Yes if used |
| Who reviews AI-created requests | Yes | Yes |
| What the AI must never promise | Yes | Yes |
| Emergency/escalation rules | Yes | Yes |
| Retell agent choice | No | Yes |
| Make safe dry-run evidence | No | Yes |
| Twilio routing decision | No | Yes before live calls |
| SMS/email/calendar approval | No | Yes before any sends/writes |

## Evidence needed before live pilot

Do not move from demo to live pilot until this evidence is available:

| Evidence | Required result |
| --- | --- |
| Local app walkthrough | Setup and core demo path work with fictional data |
| Role privacy check | Limited roles do not see owner-only controls or private setup history |
| Intake complete | Services, hours, rules and escalation contacts are documented |
| Retell phone test | Live inbound call reaches the AI receptionist and ends successfully |
| Make safe intake dry run | Fictional `call_analyzed` event creates one safe office-review output |
| Duplicate dry run | Same fictional call ID does not create a duplicate review record |
| Missing-info dry run | Incomplete call goes to office review and does not claim booking |
| Live side-effect review | SMS, email, calendar and production writes are disabled until approved |
| Owner approval | Explicit approval is recorded for the next live action |

## Suggested first pilot boundaries

Start with these boundaries:

- capture calls and create office-review requests
- use a limited service list
- keep office confirmation for appointments
- keep SMS/email/calendar writes off until separately approved
- use one business/location first
- review every AI-created request during the pilot
- collect failures and missed fields for improvement

## Stop rules

Pause sales or live setup if:

- the prospect needs automatic bookings with no human review on day one
- live SMS/email/calendar actions cannot be disabled for testing
- real customer data would be exposed in a demo
- the Make safe intake dry run creates duplicates or logs module errors
- the Retell agent promises a confirmed appointment without verified scheduling
- owner approval has not been given for a live call, webhook change, phone routing, or external send

## One-page owner talk track

"Cevanta is a managed AI receptionist pilot. The first version helps capture calls, structure service requests and keep the office in control. We configure the business profile, services, hours, call rules and escalation rules, then test the voice workflow safely before any live automation. In the pilot, the system creates requests for review. Your office confirms appointments and customer messages. Once that works reliably, we can add controlled automation in later phases."

## After the first sales conversation

Record:

- business name
- trade
- contact person
- pain point
- services to start with
- office reviewer
- call rules
- never-promise list
- preferred pilot boundary
- next meeting date
- blockers

Do not record credentials, private webhook URLs, provider secrets, real customer lists, call recordings, or transcripts in project docs.



