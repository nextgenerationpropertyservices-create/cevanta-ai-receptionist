# CEV-LAUNCH-78A — Workspace launch readiness page

Owner: Morgan — Product Manager and Orchestrator
Status: implemented and accepted with limitations on 2026-10-05
Date: 2026-10-05

## Scope

Add an in-app Launch page that tells an HVAC owner what is ready, what is manual, and what still needs owner action before selling or running Cevanta as a live AI receptionist.

## Dependencies

- Retell inbound live call proof from 2026-10-05.
- Make MCP safe intake receiver duplicate repair from 2026-10-05.
- Existing authenticated workspace shell and onboarding/setup pages.

## Allowed files

- `src/components/workspace-shell.tsx`
- `src/app/workspaces/[tenantId]/launch/page.tsx`
- `docs/project/tasks/CEV-LAUNCH-78A.md`
- `docs/project/handoffs/CEV-LAUNCH-78A-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `MEMORY.md`

## Acceptance criteria

- Workspace navigation includes a Launch link.
- Launch page is accessible only inside the existing authenticated workspace layout.
- Page gives plain-language readiness status without claiming production readiness.
- Page shows Retell phone test and Make safe dry-run status as proven with limitations.
- Page lists owner-attention items separately from work that can continue.
- Page links to Setup, Leads, Calendar, Jobs, and Settings.
- No secrets, webhook URLs, private phone numbers, transcripts, recordings, or real customer data are stored or displayed.
- Typecheck, lint, focused tests or build checks run and results are recorded.

## Evidence

Implemented Launch page and sidebar navigation. Verification: `pnpm typecheck` PASS, `pnpm lint` PASS, `pnpm build` PASS with `/workspaces/[tenantId]/launch`, `pnpm test` PASS with 19 files and 739 tests, and `pnpm check` PASS including embedded database suites and production build.


