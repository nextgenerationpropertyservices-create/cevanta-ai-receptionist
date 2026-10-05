# First-client pilot readiness

Date: 2026-10-04
Purpose: define what Cevanta can honestly sell as the first version.

## Recommended sales position

Sell the first version as a managed AI receptionist pilot, not a fully automatic booking platform.

Best offer:

"Cevanta answers calls, captures service requests, organizes the lead in your dashboard, and helps your office follow up faster. During the pilot, your office reviews requests before confirming appointments, sending customer messages, or changing calendars."

## What is ready to show in a pilot demo

- Sign-in and workspace dashboard.
- Role-based access foundation.
- Customer, location and equipment records.
- Lead and service request tracking.
- Jobs and dispatch foundation.
- Internal calendar/appointment foundation.
- Setup flow for business profile, services, hours, date exceptions, request preferences and escalation contacts.
- Settings path aligned with the onboarding-safe backend.
- Local Retell/Make planning and safety documents.

## What can be sold now

A managed pilot where:

1. AI receptionist captures caller information.
2. Make/Retell test path sends a lead or request into a safe destination.
3. Office reviews the lead before any promise is made.
4. Cevanta dashboard is used as the operating record.
5. Cevanta team monitors setup and fixes issues during the pilot.

## What must stay manual in version 1

- Appointment confirmation.
- Calendar writes.
- Customer SMS/email sending.
- Emergency dispatch decisions.
- Price quotes.
- Payment requests.
- Production data migration.
- Changing live provider settings.

## Claims to avoid until more evidence exists

Do not claim:

- Fully automated booking is live.
- Retell/Make is proven end to end for production.
- Hosted Supabase tenant isolation has passed live JWT/PostgREST verification.
- Google Calendar sync is production-ready.
- SMS/email automation is production-ready.
- The system can run without office review.
- The system is deployed and production accepted.

## Evidence already available

Local evidence supports many app foundations and onboarding/backend flows. Recent local checks reported by the team include typecheck, lint, Vitest, embedded database suites and production build passing. The latest accepted backend history work reported 702 Vitest tests and production build passing locally.

This evidence is useful for development confidence, but it does not replace hosted/live provider proof.

## Evidence still needed before stronger sales claims

Before selling stronger automation, collect:

- Authenticated browser walkthrough for owner/admin and limited roles.
- Hosted Supabase Auth/JWT/PostgREST tenant and role verification.
- Hosted migration/advisor review or approved hosted forward refresh.
- Make dry run with fictional payload.
- Retell test-panel call with fictional caller.
- Real phone test from your own phone using fictional data.
- Duplicate call ID test.
- Proof no real SMS/email/calendar event is sent during dry run.
- Owner approval for any live SMS/email/calendar action.

## First client fit

Best first client:

- Small service business.
- Owner is willing to run a managed pilot.
- Can review leads manually.
- Has clear service area and hours.
- Does not require fully automated dispatch on day one.
- Understands AI call capture needs monitoring at first.

Avoid as first client:

- High-risk emergency-only operation.
- Requires guaranteed live booking from day one.
- Requires complex multi-location dispatch immediately.
- Will not allow fictional testing before live calls.
- Needs regulated data handling that has not been reviewed.

## Minimum pilot launch checklist

Before first live pilot call:

- Intake package completed.
- Client services and hours entered into Setup.
- Escalation contacts entered and verified.
- Retell agent greeting and boundaries reviewed.
- Make scenario copied into safe pilot scenario.
- Make dry run passes with fictional payload.
- Retell test call passes with fictional data.
- Duplicate test passes.
- Owner approves pilot language.
- Owner confirms no live booking promise is made.

## Suggested first-week operating rhythm

Daily:

- Review every AI-created lead.
- Check for missing fields.
- Check duplicate prevention.
- Confirm no unintended outbound messages.
- Adjust Retell prompts and Make mappings only after test runs.

End of week:

- Count calls captured.
- Count valid leads.
- Count manual follow-ups.
- List missed or misunderstood calls.
- Decide whether to add SMS/calendar automation in a controlled next phase.

## Stop conditions

Pause the pilot if:

- AI promises confirmed appointments without approval.
- Duplicate records appear from retries.
- Real customer messages are sent unexpectedly.
- Emergency calls are mishandled.
- Provider webhook data cannot be traced to a call ID.
- Client asks for live automation beyond the approved pilot scope.

## Next recommended build tasks

1. Create owner/admin browser test evidence for Setup and Settings.
2. Build the owner history/re-enable UI only after backend history APIs are accepted in the app flow.
3. Create a Make dry-run scenario guide tied to the intake fields.
4. Verify Retell test call to Make using fictional data.
5. Prepare hosted Supabase verification and forward refresh plan.