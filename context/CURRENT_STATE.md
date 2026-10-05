# Current state

Date: 2026-10-04.
Coordinator: Morgan.

The project has a working local Cevanta application foundation and several completed internal modules, but it is not production-ready. The delivered modules include sign-in, tenant membership and roles, settings, CRM/customer/location/equipment records, manual intake, jobs/dispatch, internal appointments/calendar, recovery work and business documentation.

The current work is guided onboarding implementation and integration readiness for Retell AI, Make.com, Twilio and calendar workflows. The accepted Make validator work is isolated, inactive, fictional and no-writer only. It must not be treated as approval for live bookings.

## Retell/Make status

- Retell and Make are the owner's chosen voice/integration tools.
- The owner has a working Make.com system, but Cevanta must preserve existing workflows.
- CEV-MAKE-22 verified an isolated inactive Start -> Code -> Return Make draft with fictional inputs and one-hour appointment duration.
- Valid fictional RFC3339 offset input returned normalized UTC start/end. Invalid, timezone-less, wrong duration, false intent and missing date cases rejected.
- The actual Retell payload shape, date field, intent field, event version, retry identity, trusted event provenance and live time source remain unverified.
- No parent Make scenario, live call, SMS, email, real appointment, shared lead writer or production workflow was accepted.

## Open release gates

- Live multiuser authorization and direct JWT/PostgREST checks across roles.
- Hosted CI evidence.
- Backup and restore evidence.
- Provider environment separation and logging redaction checks.
- Retell/Make provenance, tenant routing, trusted live clock, dedupe, availability, confirmation and failure recovery.
- Explicit owner approval before production deployment or live activation.

## Full client journey requirement

The owner has made the guided dashboard journey a required product outcome. Cevanta must support a new non-technical business owner from first access through guided setup, readiness check and usable dashboard without code or configuration-file edits.

Current delivered modules are partial evidence only. The project still needs a coordinated gap audit and phased implementation for onboarding, setup readiness, AI receptionist activity, tracked handoffs, estimates/follow-ups, reporting, full role isolation, mobile/desktop usability and end-to-end verification.

Task CEV-JOURNEY-GAP-37 records the required first audit. Existing external, production, monetary and security gates remain in force.

## Guided onboarding current status

CEV-ONBOARD-SCHEMA-44 is accepted with limitations for storage/shared contracts. CEV-ONBOARD-TESTS-45 is accepted with limitations after Morgan recovery verification: `pnpm check` passes with onboarding validation tests and the onboarding embedded SQL runner included. CEV-ONBOARD-RPC-46 is blocked/resumable because Atlas hit a usage limit before completing the command migration, command SQL suite and handoff. The partial SQL draft is preserved at docs/project/handoffs/CEV-ONBOARD-RPC-46-atlas-partial.sql and is not an active migration.
