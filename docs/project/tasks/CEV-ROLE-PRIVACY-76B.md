# CEV-ROLE-PRIVACY-76B — Setup role privacy automated evidence

Owner: Morgan — Product Manager and Orchestrator
Status: accepted with limitations on 2026-10-05

## Scope

Refresh automated evidence that limited roles do not receive owner-only Setup controls, private setup history or private escalation contact details.

## Dependencies

- CEV-ONBOARD-UI-50 Setup shell.
- CEV-ONBOARD-SETUP-52 and CEV-ONBOARD-SETUP-53 narrowed setup editors.
- CEV-ONBOARD-STATUS-54 setup status shell.
- CEV-SETUP-BROWSER-76A owner browser proof.

## Allowed files

- `docs/project/tasks/CEV-ROLE-PRIVACY-76B.md`
- `docs/project/handoffs/CEV-ROLE-PRIVACY-76B-morgan.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `docs/project/PROJECT_STATUS.md`
- `MEMORY.md`

## Acceptance criteria

- Automated checks pass for owner/admin-capable setup rendering.
- Dispatcher gets read-only operational setup information without private contact details or mutation controls.
- Technician and viewer get minimal access guidance without owner setup controls.
- Setup mutations are denied for dispatcher, technician and viewer before RPC writes.
- Evidence clearly states browser limited-role verification is still open.

## Evidence

- `pnpm test -- tests/onboarding-ui.test.ts tests/onboarding-actions.test.ts tests/onboarding-settings.test.ts tests/settings-ui.test.ts` passed on 2026-10-05. Vitest ran the configured suite and reported 19 test files / 739 tests passing.
- Covered limited-role expectations include dispatcher read-only operations summary, technician/viewer minimal access, no owner editor/status links for limited roles, private contact/sentinel exclusion and denied setup/configuration mutations before RPC writes.

## Known limitations

- This is automated source/test evidence, not separate browser sign-in evidence for dispatcher, technician or viewer accounts.
- Hosted direct JWT/PostgREST bypass checks remain open.
- No production, provider, external-send or live booking behavior was enabled.
