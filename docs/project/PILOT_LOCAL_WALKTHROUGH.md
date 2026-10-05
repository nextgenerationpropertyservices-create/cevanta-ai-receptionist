# Pilot local walkthrough checklist

Date: 2026-10-05
Use: local manual walkthrough before showing a first-client pilot demo.

This checklist does not prove hosted Supabase, Retell, Make, Twilio, Google Calendar, SMS, email, or production behavior. It only checks the local demo path and records what still needs evidence.

## Before you start

Use fictional data only. Do not enter real customer lists, real emergency contacts, API keys, webhook URLs, or private provider settings.

Recommended fictional data:

- Company: Northstar HVAC Demo
- Caller: Test Customer
- Phone: +15550000001
- Address: 123 Fictional Street
- Service: AC repair
- Preferred time: Tomorrow at 2 PM

## Local setup checks

| Step | Expected result | Pass/fail | Notes |
| --- | --- | --- | --- |
| Run full local check | Typecheck, lint, tests, embedded DB checks and build pass |  |  |
| Start local app | App opens locally |  |  |
| Sign in | Owner/admin can access workspace |  |  |
| Open workspace dashboard | Dashboard loads without private errors |  |  |

## Setup / Onboarding walkthrough

| Step | Expected result | Pass/fail | Notes |
| --- | --- | --- | --- |
| Open Setup | Owner/admin setup page loads |  |  |
| Save business profile | Values save and survive refresh |  |  |
| Add service | Service appears after save/refresh |  |  |
| Save weekly hours | Hours appear after save/refresh |  |  |
| Add date-specific hours | Override appears after save/refresh |  |  |
| Remove date-specific hours | Removal behaves safely and does not claim booking |  |  |
| Save request preferences | Preferences save for office review |  |  |
| Save escalation contact | Contact saves for owner/admin only |  |  |
| Resume setup later | Resume point saves without changing readiness claims |  |  |

## Settings walkthrough

| Step | Expected result | Pass/fail | Notes |
| --- | --- | --- | --- |
| Open Settings | Settings page loads |  |  |
| Save business/profile fields | Save uses onboarding-safe path and survives refresh |  |  |
| Try unavailable/review state if shown | UI asks for review/refresh rather than legacy save |  |  |

## Role privacy walkthrough

Use only fictional accounts or existing test users.

| Role | Expected result | Pass/fail | Notes |
| --- | --- | --- | --- |
| Dispatcher | Can view appropriate office setup summary, no owner mutation controls |  |  |
| Technician | No owner setup controls or private retained contact history |  |  |
| Viewer | No owner setup controls or private retained contact history |  |  |

## CRM and work management walkthrough

| Area | Expected result | Pass/fail | Notes |
| --- | --- | --- | --- |
| Customers | Fictional customer can be viewed/created if allowed |  |  |
| Locations | Fictional service location works if allowed |  |  |
| Equipment | Fictional equipment record works if allowed |  |  |
| Leads/service requests | Fictional request can be reviewed without live provider claims |  |  |
| Jobs/dispatch | Fictional job flow is visible and role-safe |  |  |
| Calendar | Internal calendar foundation works without live Google Calendar claims |  |  |

## Voice/Make dry-run readiness check

Do not run live calls from this checklist unless separately approved.

| Item | Expected result | Pass/fail | Notes |
| --- | --- | --- | --- |
| Intake doc completed | Services, hours, call rules and escalation contacts are known |  |  |
| Make safe scenario copy exists | Real SMS/email/calendar modules disabled |  |  |
| Fictional webhook payload ready | Payload uses Test Customer only |  |  |
| Duplicate call ID plan ready | Duplicate does not create duplicate lead/booking |  |  |
| Retell test wording ready | Agent does not promise confirmed appointment |  |  |

## Evidence to capture

Capture notes, not secrets:

- date and time of local run
- command results, if run
- pages tested
- fictional records used
- pass/fail observations
- blockers
- screenshots only if they contain fictional data and no credentials

## Known gates this walkthrough does not close

- Hosted Supabase Auth/JWT/PostgREST verification
- hosted migration/advisor verification
- genuine multi-user concurrency
- browser Server Action HTTP boundary evidence
- Retell live provider behavior
- Make production scenario behavior
- Twilio phone routing
- Google Calendar writes
- SMS/email sends
- production deployment

## Go/no-go for first sales demo

Go for a managed-pilot sales demo if:

- local app opens
- owner/admin setup flow works with fictional data
- limited roles do not see owner-only setup controls
- lead/customer/job/calendar foundation can be shown honestly
- you can explain that voice/provider automation still needs dry-run proof

Do not demo as production-ready if:

- setup cannot save/reload
- private data appears to limited roles
- app errors appear during basic navigation
- Make/Retell is described as live without dry-run evidence
- SMS/calendar/customer messaging could trigger accidentally