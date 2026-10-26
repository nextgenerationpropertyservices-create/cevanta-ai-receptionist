# CEV-REACTIVATION-164A — Seasonal maintenance reactivation foundation

- **Owner:** Morgan — Product Manager and Orchestrator
- **Scope:** Add a tenant-safe Seasonal Maintenance Reactivator using existing customer, lead, job and appointment records. Create seasonal campaign records, identify accounts with completed service older than twelve months, generate reviewable personalized drafts, support office approval/dismissal, and allow an approved candidate to create an internal job and calendar appointment. Keep external email/SMS/weather providers and automatic outbound sending off.
- **Dependencies:** Existing customers, leads, jobs, appointments, tenant membership/RLS, and automation-control boundaries. Architect review is required for the new migration and shared contracts; Quality review is required for protected campaign/candidate mutations.
- **Allowed files:** One new reactivation migration, reactivation contracts/helpers/server queries/actions, the workspace reactivation route and UI, workspace navigation/styles, focused tests, this task record, matching handoff, and project status.
- **Acceptance criteria:**
  1. Office roles can open a Reactivation page without exposing another tenant’s records.
  2. A campaign can be created with season, channel, trigger type, and optional weather trigger while remaining draft/off.
  3. Generation selects only customers whose latest completed job is more than twelve months old and creates one candidate per customer per campaign.
  4. Each candidate has a clearly labeled personalized draft, approval/dismissal controls, consent/automation warnings, and no automatic outbound send.
  5. An approved candidate can be scheduled into the existing internal jobs/calendar flow with a date/time and idempotent retry protection.
  6. Loading, empty, validation, error, read-only and setup/migration states are represented.
  7. No external provider call, SMS/email send, weather lookup, or external calendar write is performed by this slice.
- **Required evidence:** Focused reactivation unit/UI/security tests, typecheck, lint, production build, and embedded migration checks. Hosted migration/provider behavior remains unverified unless explicitly run and approved.
