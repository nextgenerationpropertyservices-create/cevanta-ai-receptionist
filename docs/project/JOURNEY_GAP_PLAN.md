# Full guided dashboard/onboarding gap plan — CEV-JOURNEY-GAP-37

Status: accepted as a gap audit on 2026-10-03. This is not product completion.

## Outcome required

Cevanta must support a non-technical business owner from first access through guided setup, readiness check and ordinary dashboard use without code, SQL, environment-file or configuration-file edits. Dashboard modules must persist through the backend, enforce role permissions and tenant isolation, and work on desktop and mobile.

## Combined audit finding

All six specialist audits agree that the current app has useful protected foundations but not the complete journey. Customers, leads, jobs, calendar/appointments, CRM settings and authentication foundations exist with recorded local evidence. The complete owner-confirmed journey remains blocked by first-access/onboarding, setup persistence, readiness, AI activity/handoff persistence, M5 runtime implementation, reporting definitions, full role/JWT evidence, hosted CI/restore and end-to-end desktop/mobile verification.

## Verified gaps by phase

1. **First access and guided setup**
   - Missing accepted invitation/account-entry workflow.
   - Ordinary clients still depend on trusted provisioning or setup outside the app.
   - Missing saved progress/resume and server-derived readiness.
   - Missing service catalogue, business hours/exceptions, booking rules and escalation contacts.
   - Initial safe direction: invitation-based first access. Public self-serve tenant creation is deferred until separately approved.

2. **Connected dashboard readiness**
   - Current dashboard evidence is partial and module-specific.
   - Need authorized backend summary contracts, readiness states, module errors and no hidden-record leakage.
   - Need desktop/mobile journey evidence from first access through save/reload/update.

3. **AI receptionist activity and tracked handoffs**
   - Retell/Make no-writer work verifies limited local safety, not operational activity.
   - Missing tenant-routed persistent call activity, event receipts, handoff transitions and failure/recovery states.
   - Live provider activation, callbacks, external writers and booking confirmation remain blocked by existing gates.

4. **M5 estimates and follow-ups**
   - Contract and replay/lock clarification are accepted with limitations.
   - No runtime tables, RPCs, backend actions, UI or tests exist yet.
   - First slice remains non-monetary internal scope drafts plus one active manual date-only follow-up.

5. **Reporting**
   - No accepted metric dictionary or reporting implementation.
   - Safe initial reporting must use approved operational counts only.
   - Revenue/recovered-revenue reporting remains blocked by definitions and authoritative revenue sources.

6. **Verification and release**
   - Live all-role/multiuser/JWT/PostgREST evidence remains open.
   - Hosted CI, staging candidate, backup/restore and complete journey browser checks remain open.
   - Release checklist now includes the full guided journey and backend-connected dashboard requirements.

## Phased follow-up tasks

- **CEV-ONBOARD-38 — guided onboarding contracts.** Define first-access invitation flow, business profile, services, hours, timezone, booking rules, escalation contacts, saved progress and backend-derived readiness before implementation.
- **M5 implementation tasks.** Use CEV-M5-CONTRACT-FINAL-34 plus CEV-M5-CONTRACT-CLARIFY-36 to scope migration, backend, UI and security tests.
- **CEV-DASHBOARD-39 — connected dashboard journey.** Define and implement authorized module summaries and complete save/reload/update journey checks after dependencies are ready.
- **CEV-AI-ACTIVITY-40 — AI activity and tracked handoffs.** Define and implement persisted no-writer activity/handoff records first; live activation remains separately gated.
- **CEV-REPORTING-41 — operational reporting.** Define metrics and implement backend-connected operational reporting without revenue claims.
- **Journey verification/release task.** After implementations, run full desktop/mobile role-isolated journey checks, hosted CI and restore evidence before production approval can be requested.

## Acceptance rule

Do not call the platform complete until a fictional new client can enter through the approved first-access path, complete setup in the app, see readiness/missing requirements, use the dashboard modules within approved scope, and pass role-isolated backend persistence checks on desktop and mobile.
