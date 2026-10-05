# CEV-BACKEND-BROWSER-70E — Owner browser backend flow smoke

Status: accepted with limitations as owner-browser evidence
Owner: Morgan — Product Manager and Orchestrator
Date: 2026-10-05

## Scope

Use the authenticated owner browser session to smoke test the backend paths most relevant to the AI missed-call recovery pilot: job persistence, lead/service-request creation, lead detail, lead-to-job conversion and calendar visibility.

## Evidence observed

- Jobs page refreshed and still showed `Test backend job` with description `Fictional backend test only`.
- Leads page loaded and showed existing lead data.
- Created fictional lead `AI missed call test 2026-10-05 0737` with email `caller@example.invalid`, phone `+15550000001`, and fictional AC repair description.
- Leads page showed `Lead saved successfully` and listed the new lead.
- After refresh, the new lead remained listed in the lead inbox.
- Opened the new lead detail page; it loaded the saved title and description.
- Created a job from that lead; the lead detail changed to show the linked job.
- Opened the converted job; it loaded with the same fictional title and description.
- Calendar page loaded as owner and showed appointment data plus a create-appointment form where the converted job appeared as a selectable job.
- Screenshot evidence saved at `docs/project/backend-flow-browser-proof-2026-10-05.png`.

## Limitations

- This is owner-browser evidence, not independent Quinn review.
- It does not test limited-role denial, cross-tenant access, direct API bypass attempts, hosted PostgREST/JWT negative tests, real Retell/Make/Twilio flow, SMS/email/calendar writes, production deployment or full browser test automation.
- Created records are fictional development data in the hosted development project.

## Acceptance decision

Accepted with limitations. The owner account can use the local app against hosted Supabase to persist and reload a job, create and reload a lead/service request, convert that lead into a job and load the calendar foundation.
