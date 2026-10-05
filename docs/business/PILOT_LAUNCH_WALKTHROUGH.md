# Managed pilot launch walkthrough

Date: 2026-10-05
Use: launch Cevanta as the first managed HVAC AI receptionist pilot.

This is the recommended first launch path. It sells the product honestly while keeping the office in control. Do not use this as a full self-service SaaS promise yet.

## Current offer

Use this wording:

"Cevanta is a managed AI receptionist pilot for HVAC businesses. It answers calls, captures service requests, and puts them into an office review flow. During the pilot, your office confirms appointments and customer messages before anything is finalized."

## What we can sell now

Sell this:

- AI receptionist answers or helps cover calls.
- Calls become organized service requests for office review.
- The dashboard keeps leads, customers, jobs and appointments organized.
- Setup captures services, hours, request preferences and escalation contacts.
- The pilot focuses on fewer missed calls and cleaner follow-up.

Do not sell this yet:

- fully automatic appointment booking
- customer SMS/email automation
- live Google Calendar writes
- payment collection or subscriptions
- emergency dispatch promises without human review
- app-store packages or signed installers
- "set it and forget it" self-service SaaS

## Launch sequence

### Step 1 — Pick the first prospect

Best prospect:

- HVAC or similar service business.
- Misses calls or struggles with after-hours intake.
- Has an owner, dispatcher or office person who can review new requests.
- Accepts office review during the pilot.
- Has a simple service area and service list.

Avoid the first prospect if they need full autopilot, complex dispatch, immediate SMS/calendar automation or strict compliance before a small pilot.

### Step 2 — Run the sales call

Use the first-client sales packet and demo script.

Show:

- production app URL
- dashboard/workspace
- Setup/onboarding sections
- Leads page and AI lead notification concept
- Jobs and internal calendar foundation
- Launch, Integrations and Pilot pages
- Retell phone-answering proof with limitations
- Make safe-intake proof with limitations

Say clearly:

"The first pilot captures and organizes requests. Your office approves the next step."

### Step 3 — Collect setup information

Use `docs/business/FIRST_CLIENT_INTAKE.md`.

Required before live pilot:

- business name and service area
- services offered
- normal hours and exceptions
- office reviewer
- what the AI must collect
- what the AI must never promise
- emergency/escalation rules
- preferred pilot phone path
- daily review process

Do not collect passwords, API keys, payment details, private customer lists or provider credentials in project docs.

### Step 4 — Configure Cevanta for the pilot

In the production dashboard, configure with the client or from approved intake answers:

- business profile
- services
- weekly hours
- date exceptions
- request preferences
- escalation contacts

Use fictional test data first when proving the flow.

### Step 5 — Run a safe dry run

Before any live client traffic:

- Retell test call should capture caller details and avoid confirming a booking.
- Make safe intake should create one office-review output for a fictional analyzed call.
- Duplicate fictional call ID should not create a duplicate review record.
- Cevanta Make bridge should be verifier-only first: signed request accepted, persisted false, bookingCreated false.
- SMS, email and external calendar writes stay off.

### Step 6 — Owner approval for first live action

Only after the dry run, choose one live action at a time:

1. Live phone answering only.
2. Live Make intake review only.
3. Production Cevanta lead creation from Make or Retell.
4. SMS/email/calendar writes later, after separate approval.

Do not enable all of these at once.

### Step 7 — Pilot day operating rhythm

For the first week:

- Check new AI-created requests daily.
- Confirm every appointment manually.
- Review call failures or missing fields.
- Keep a small list of improvements.
- Pause automation if the AI promises a confirmed booking, loses contact details, misroutes a request, or creates duplicates.

## Success criteria for week 1

The pilot is working if:

- calls are answered or captured more reliably than before
- office sees organized requests
- no duplicate leads are created for one call
- AI does not confirm appointments by itself
- no unauthorized SMS/email/calendar writes happen
- client understands the office-review workflow

## Stop rules

Stop or pause the pilot if:

- Retell credits are too low for reliable calls
- Make scenario errors on duplicate or normal events
- Cevanta writer creates wrong or duplicate records
- the AI says an appointment is confirmed without office approval
- real customer data appears in public docs, screenshots or demos
- the client demands full automation before the pilot flow is proven

## What costs money or needs approval

Stop for owner approval before:

- adding Retell credits or changing recharge settings
- activating Make as always-on for live calls
- enabling production Cevanta writes from provider events
- sending SMS or email
- writing external calendar events
- enabling billing/subscriptions
- buying store/developer accounts or code-signing certificates
- creating signed Windows or Android store packages

## Recommended next decision

Pick the pilot price and boundary before the first real sales call.

Suggested boundary:

- managed pilot
- one HVAC business/location
- lead capture and office review
- no automatic booking
- no SMS/email/calendar writes without later approval
- daily review during week 1

Suggested pricing options to choose from:

- Free/low-cost beta for one trusted business in exchange for feedback and testimonial.
- Paid pilot with setup fee plus first month.
- Monthly managed pilot price with no setup fee for the first client.

Morgan should ask the owner to choose pricing before making real client commitments.
