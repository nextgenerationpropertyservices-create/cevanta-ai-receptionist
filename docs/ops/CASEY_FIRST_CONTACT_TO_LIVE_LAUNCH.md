# Casey first-contact to live-launch checklist

Date: 2026-10-11
Owner: Heath
Role: Casey, Client Success and Operations

Use this checklist to move a first managed HVAC AI receptionist prospect from first contact through the first live pilot launch. This is for the managed pilot with office review. It is not a full automatic booking launch, not SMS/email automation, and not self-service SaaS.

Do not store real customer records, real phone numbers, addresses, transcripts, recordings, webhook URLs, API keys, payment data, private screenshots, government IDs, or provider secrets in this file or project docs.

## Operating boundary

The first launch path is:

1. Prospect discovery.
2. Managed-pilot demo using fictional data.
3. Client intake.
4. Cevanta setup review.
5. Safe dry run with fictional data.
6. Owner-approved controlled live test.
7. Live managed pilot with office review.
8. Daily Casey health summaries.

During the pilot, Cevanta may capture calls and create office-review requests. The client office confirms appointments, customer messages, calendar changes, and follow-up.

Do not perform these actions without explicit owner approval for the exact action:

- send a message to a prospect, client, or customer
- change a booking
- create or update an external calendar event
- send SMS or email
- enable provider settings or always-on scenarios
- buy credits, tools, numbers, subscriptions, or paid services
- modify billing
- delete records
- store private client, customer, provider, or payment data

## Phase 1 - First contact

Goal: decide whether the prospect is a safe first managed-pilot fit.

Casey tracks:

- business type
- call-answering pain
- whether the office can review new requests
- whether the prospect accepts office review
- whether they need immediate full automation
- first-contact outcome
- next step

Good first-pilot signals:

- appointment-based HVAC or similar service business
- missed calls or weak after-hours intake
- simple service area and service list
- owner, dispatcher, or office person can review requests
- accepts that the pilot captures requests first and office confirms outcomes

Stop or mark as not first-pilot fit if the prospect requires:

- automatic booking with no review on day one
- live SMS/email/calendar writes immediately
- complex multi-branch dispatch before a small pilot
- emergency dispatch promises without human review
- strict compliance requirements before a controlled pilot

Safe record:

```text
Prospect alias:
Trade:
Fit status: Good fit / Watch / Not first-pilot fit
Main pain:
Office reviewer available: Yes / No / Unknown
Managed-pilot boundary accepted: Yes / No / Unknown
Next step:
Evidence type: owner-reported / client-reported / verified
```

## Phase 2 - Sales call and demo

Goal: show the managed pilot honestly and avoid unsupported claims.

Use:

- `docs/business/FIRST_CLIENT_SALES_PACKET.md`
- `docs/business/FIRST_CLIENT_DEMO_SCRIPT.md`
- production demo dashboard with fictional data

Say:

"Cevanta is a managed AI receptionist pilot. It answers or helps cover calls, captures service requests, and puts them into an office review flow. During the pilot, your office confirms appointments and customer messages before anything is finalized."

Show only fictional data:

- dashboard
- setup/onboarding
- leads or office-review request flow
- jobs and internal calendar foundation
- Launch, Integrations, and Pilot pages
- Retell and Make proof with limitations

Do not claim:

- automatic appointment booking is live
- SMS/email/calendar writes are production-ready
- the client can run with no office review
- provider integrations are fully proven for that client before setup and testing

Sales-call exit criteria:

- prospect understands office review
- prospect agrees to provide setup information
- owner has not made unsupported automation commitments
- no private data or provider secrets were shown or stored

## Phase 3 - Client intake

Goal: collect enough setup information to configure a safe pilot.

Use:

- `docs/business/FIRST_CLIENT_INTAKE.md`

Required before live pilot:

- business name and service area
- services offered
- normal hours and exceptions
- office reviewer
- information the AI must collect
- what the AI must never promise
- emergency and escalation rules
- preferred pilot phone path
- daily review process

Do not collect or store:

- passwords
- API keys
- webhook URLs
- payment details
- real customer lists
- recordings or transcripts
- private provider screenshots

Casey readiness label:

- `Healthy` if intake is complete enough for setup and dry run.
- `Watch` if a minor detail is missing but no live action is planned.
- `Needs owner attention` if office reviewer, emergency rules, launch boundary, credits, or provider approval is missing.
- `Paused` if the client requires unsupported automation or private-data handling.

## Phase 4 - Setup review

Goal: verify the Cevanta workspace matches the approved intake before any live traffic.

Review in Cevanta:

- business profile
- services
- weekly hours
- date exceptions
- request preferences
- escalation contacts
- office-review wording
- Launch, Integrations, and Pilot pages

Required result:

- setup matches intake
- no automatic booking claim appears in the workflow
- SMS/email/external calendar writes remain off unless separately approved
- office reviewer understands how to review AI-created requests

Record only safe evidence:

```text
Client alias:
Setup review date:
Reviewer:
Business profile checked: Yes / No
Services checked: Yes / No
Hours checked: Yes / No
Escalation rules checked: Yes / No
Office-review wording checked: Yes / No
External sends/writes off: Yes / No
Gaps:
Next action:
```

## Phase 5 - Safe dry run

Goal: prove the pilot path with fictional data before live client traffic.

Use:

- `docs/ops/MAKE_RETELL_DRY_RUN_CHECKLIST.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`

Minimum dry-run proof:

- Retell captures a fictional service request and does not confirm a booking.
- Make receives or simulates a final analyzed-call event in a safe test path.
- One office-review request is created for a fictional call.
- Repeating the same fictional event does not create a duplicate.
- Missing or incomplete information remains office review.
- Urgent language is flagged for office review and does not promise dispatch.
- No SMS, email, calendar event, payment, quote, dispatch, or external customer action occurs.

If any duplicate, wrong write, provider error, or unauthorized promise appears, mark status `Paused` until fixed and verified.

## Phase 6 - Owner approval before live action

Goal: approve one live action at a time.

Owner approval is required before:

- adding or changing Retell credits/recharge
- activating a Make scenario as always-on
- changing Retell webhook or phone routing
- enabling production Cevanta writes from provider events
- sending SMS or email
- creating or updating external calendar events
- enabling billing/payments
- using live client traffic outside the managed office-review boundary

Use this owner-action format:

```text
CURRENT STEP:

WHY:

DO THIS:

SUCCESS LOOKS LIKE:
```

Do not treat general approval to "launch" as approval for every provider, writer, message, calendar, billing, or paid action. Approve each live action separately.

## Phase 7 - Controlled live launch

Goal: start the first managed pilot without unsupported side effects.

Launch only when:

- intake is complete enough for the first pilot
- setup has been reviewed
- Retell credits are sufficient for expected calls
- Retell phone-answering proof is current enough for the launch decision
- Make/Cevanta path is approved for the exact live behavior being used
- duplicate prevention has been tested
- office reviewer is ready
- SMS/email/calendar writes remain off unless separately approved
- stop rules are understood

Recommended first live sequence:

1. Live phone answering only, if approved.
2. Live office-review lead creation, if approved.
3. Daily office review.
4. Structured-field tuning from safe evidence.
5. Later SMS/email/calendar decisions only after separate proof and approval.

Launch-day Casey checks:

- Did Retell answer expected calls?
- Any failed, abandoned, or unusually short calls?
- Any low-credit or provider warning?
- Did Make receive only expected final analyzed events?
- Did Cevanta create the expected office-review request?
- Any duplicate lead from one call?
- Any urgent request waiting for review?
- Did the AI avoid confirmed-booking language?
- Did any unauthorized SMS/email/calendar/payment/dispatch action occur?

## Phase 8 - First-week monitoring

Casey prepares daily summaries using this format:

```text
Client:
Date:
Status: Healthy / Watch / Needs owner attention / Paused

Calls:
- Answered:
- Failed/missed:
- Notes:

Requests/leads:
- New office-review requests:
- Urgent requests:
- Duplicates:
- Still waiting for office review:

Systems:
- Retell:
- Make:
- Cevanta:
- Credits/warnings:

Recommended next action:

Needs owner approval:
```

Separate evidence:

- verified provider/app evidence
- owner-reported outcomes
- client-reported outcomes
- unverified or unavailable counts

Never convert an unknown count into zero. Use `Unverified` when Casey has no direct evidence.

## Phase 9 - Live-pilot stop rules

Recommend pause if:

- Retell credits are too low for reliable live calls
- Retell fails to answer or calls end unexpectedly
- Make errors on normal or duplicate events
- Cevanta creates wrong or duplicate records
- AI says an appointment is confirmed without office approval
- urgent requests wait without review
- client reports confusion or harm
- real customer data appears in public docs, screenshots, demos, or unsafe notes
- unsupported SMS/email/calendar/billing action occurs
- client demands full automation before the managed pilot is proven

Casey can recommend pausing. Casey must not change provider settings, disable workflows, delete records, contact clients, or modify bookings without exact owner approval.

## First live-launch decision

Before the first live client launch, record:

```text
Client alias:
Pilot boundary:
Office reviewer:
Pilot start date:
Retell status:
Make status:
Cevanta status:
Credits/warnings:
Approved live action:
Actions still not approved:
Stop rules reviewed: Yes / No
Launch decision: Go / Watch / Needs owner attention / Paused
Decision evidence:
```

