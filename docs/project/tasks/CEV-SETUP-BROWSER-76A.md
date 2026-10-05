# CEV-SETUP-BROWSER-76A — Fresh workspace Setup browser proof

Owner: Morgan — Product Manager and Orchestrator
Status: accepted with limitations on 2026-10-05

## Scope

Verify the fresh self-service workspace Setup page can store the launch-critical setup sections needed for a managed-pilot demo: services, weekly hours, date-specific hours, request preferences and escalation contacts.

## Dependencies

- CEV-SELF-SERVE-73A self-service owner signup and workspace provisioning.
- CEV-SETUP-HOSTED-71A hosted Setup repair.
- Owner-reported fresh workspace access on 2026-10-05.

## Allowed files

- `docs/project/tasks/CEV-SETUP-BROWSER-76A.md`
- `docs/project/handoffs/CEV-SETUP-BROWSER-76A-morgan.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `docs/project/PROJECT_STATUS.md`
- `MEMORY.md`

## Acceptance criteria

- Fresh workspace Setup page opens for the signed-in owner.
- A fictional enabled service can be saved and shown in the setup summary.
- Weekly hours can be saved and shown in the setup summary.
- A fictional date-specific closed override can be saved and shown in the setup summary.
- Request-only preferences can be saved with office-review acknowledgment.
- A fictional escalation contact can be saved after the page review step.
- Evidence records limitations and avoids secrets or real customer data.

## Evidence

- Browser proof in the local app for workspace `1cb2a226-84ef-4dcd-9976-5ce87dd3e449` on 2026-10-05.
- Services summary showed `1 services saved; 1 enabled` after saving fictional service `Emergency no-cooling call`.
- Weekly hours summary showed `7 of 7 days saved` after saving all days closed.
- Date-specific hours summary showed `1 active date overrides saved`; saved override list showed `2026-10-06: Closed all day`.
- Request preferences saved 60-minute advance notice, 15-minute before/after buffers, 14-day horizon, fictional office-review notes and acknowledgment; saved panel showed booking remains request-only.
- Escalation contacts summary showed `1 contacts saved; 1 enabled` after resolving the built-in review step and saving fictional contact `Fictional Dispatcher` at `dispatcher@example.invalid`.

## Known limitations

- This proves local browser behavior against the current hosted development backend, not production.
- Lower-role privacy for Setup remains unproven in browser.
- Removal/edit paths for date overrides and escalation contacts were not run in this pass.
- No live provider, SMS, email, external calendar, Retell, Make, Twilio or production behavior was enabled.
