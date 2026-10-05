# CEV-PILOT-78D — Workspace pilot runbook page

Owner: Morgan — Product Manager and Orchestrator
Status: accepted with limitations
Date: 2026-10-05

## Scope

Add an authenticated workspace Pilot page that gives an HVAC owner/operator a safe operating runbook for the first managed AI receptionist pilot.

## Dependencies

- CEV-LAUNCH-78A Launch readiness page.
- CEV-INTEGRATIONS-78B Integrations readiness page.
- CEV-SALES-78C first-client sales materials refresh.

## Allowed files

- `src/components/workspace-shell.tsx`
- `src/app/workspaces/[tenantId]/launch/page.tsx`
- `src/app/workspaces/[tenantId]/pilot/page.tsx`
- `tests/pilot-ui.test.ts`
- `docs/project/tasks/CEV-PILOT-78D.md`
- `docs/project/handoffs/CEV-PILOT-78D-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `MEMORY.md`

## Acceptance criteria

- Workspace navigation includes a Pilot link. PASS.
- Pilot page is protected by the existing workspace membership gate. PASS; route uses `getWorkspace` like the other protected workspace pages.
- Page gives pre-pilot, live-day, post-call and stop-rule steps. PASS.
- Page keeps office review, no automatic booking, no external sends/writes, and no production claims clear. PASS.
- Page links to Launch, Integrations, Leads, Jobs, Calendar and Setup. PASS.
- UI render test covers the pilot runbook language and links. PASS.
- Verification commands/results are recorded. PASS.

## Evidence

- `pnpm test -- tests/pilot-ui.test.ts` returned PASS; project script reported 21 files / 743 tests passing.
- `pnpm check` on 2026-10-05 returned PASS after this work and later packaging work: typecheck, lint, 22 files / 747 Vitest tests, embedded database suites, Retell lead-ingestion embedded suite and production build.
- Production build route table includes `/workspaces/[tenantId]/pilot`.

## Limitations

This is an operating runbook page. It does not activate live Retell webhooks, Make always-on runs, SMS/email/calendar writers, billing, or production deployment.