# CEV-INTEGRATIONS-78B — Workspace integrations readiness page

Owner: Morgan — Product Manager and Orchestrator
Status: implemented and accepted with limitations on 2026-10-05
Date: 2026-10-05

## Scope

Add an authenticated workspace Integrations page that shows safe readiness status for Retell, Make, Twilio/SMS, Google Calendar, and Cevanta lead intake without exposing credentials or enabling live side effects.

## Dependencies

- CEV-LAUNCH-78A Launch page.
- Retell inbound phone test evidence from 2026-10-05.
- Make MCP safe intake receiver duplicate handling evidence from 2026-10-05.

## Allowed files

- `src/components/workspace-shell.tsx`
- `src/app/workspaces/[tenantId]/launch/page.tsx`
- `src/app/workspaces/[tenantId]/integrations/page.tsx`
- `tests/integrations-ui.test.ts`
- `docs/project/tasks/CEV-INTEGRATIONS-78B.md`
- `docs/project/handoffs/CEV-INTEGRATIONS-78B-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `MEMORY.md`

## Acceptance criteria

- Workspace navigation includes an Integrations link.
- Integrations page is protected by the existing workspace membership gate.
- Page shows Retell and Make as tested with limitations, and Twilio/SMS, calendar writers, production deployment, and billing as not live.
- Page gives setup next steps without asking for or displaying secrets, webhook URLs, transcripts, recordings, private phone numbers or real customer data.
- Launch page links to Integrations.
- UI render test covers the readiness language and secret-free owner-action copy.
- Typecheck, lint, tests and build or full check run and results are recorded.

## Evidence

Implemented Integrations page, workspace sidebar link, Launch link, and render test. Verification: project test script PASS with 20 files and 741 tests, `pnpm typecheck` PASS, `pnpm lint` PASS, `pnpm build` PASS with `/workspaces/[tenantId]/integrations`, and `pnpm check` PASS including embedded database suites and production build.


