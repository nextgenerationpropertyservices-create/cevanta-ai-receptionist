# CEV-SELF-SERVE-72 — Full self-service SaaS launch planning

Status: accepted as launch plan, implementation pending
Owner: Morgan — Product Manager and Orchestrator
Date: 2026-10-05

## Scope

Turn the hosted Setup repair and specialist launch reviews into a concrete sequence for launching Cevanta as a full self-service AI receptionist SaaS for HVAC owners.

## Dependencies

- CEV-SETUP-HOSTED-71A hosted Setup repair.
- Blake backend launch gap review.
- Echo voice/integration launch gap review.
- Phoenix operations/release launch gap review.

## Allowed files

- `docs/project/SELF_SERVICE_SAAS_LAUNCH_PLAN.md`
- `docs/project/tasks/CEV-SELF-SERVE-72.md`
- `docs/project/handoffs/CEV-SELF-SERVE-72-morgan.md`
- `docs/project/PROJECT_STATUS.md`

## Acceptance criteria

- Identify the current launch position honestly.
- Separate managed-pilot readiness from full self-service launch readiness.
- Define ordered phases for signup/provisioning, invitations, billing, provider activation and production release.
- Mark required owner decisions and evidence gates.
- Name the next implementation slice.

## Evidence

- Backend review found no implemented public signup, tenant provisioning, billing entitlement, provider connection storage or durable production call ingestion.
- Voice review found Retell/Make/Twilio/Google Calendar activation still requires tenant mapping, signature/authentication proof, duplicate protection, test-call experience and side-effect controls.
- DevOps review found production launch still requires staging/production separation, environment inventory, hosted CI, migration reconciliation, SMTP/domain setup, monitoring, backup/restore and production approval.
- Local source inspection confirmed sign-in and workspace selection exist, while public signup/self-service workspace provisioning is not implemented.
- `pnpm check` passed after planning updates: typecheck, lint, 16 Vitest files with 711 passing tests, embedded PostgreSQL suites, onboarding command checks and production build.

## Limitations

- Planning only. No signup, billing, provider connection, deployment, domain, SMTP, SMS, email, calendar write or live call was implemented by this task.

## Acceptance decision

Accepted as the launch sequence. The next implementation task should be Phase 1: verified owner signup and atomic workspace provisioning.
