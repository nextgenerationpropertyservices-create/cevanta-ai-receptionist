# CEV-LEAD-OVERVIEW-75C — Workspace overview AI lead notice

Owner: Morgan — Product Manager and Orchestrator
Status: accepted with limitations on 2026-10-05

## Scope

Make AI receptionist leads visible from the workspace overview, not only from the Leads page, so office staff can notice new missed-call leads immediately after opening the workspace.

## Dependencies

- CEV-LEAD-NOTIFY-75A in-app lead notification.
- CEV-LEAD-CONVERT-75B conversion clearing behavior.

## Allowed files

- `src/lib/ai-lead-notifications.ts`
- `src/app/workspaces/[tenantId]/page.tsx`
- `src/app/workspaces/[tenantId]/leads/page.tsx`
- `tests/dashboard-ui.test.ts`
- `tests/leads-ui.test.ts`
- `docs/project/tasks/CEV-LEAD-OVERVIEW-75C.md`
- `docs/project/handoffs/CEV-LEAD-OVERVIEW-75C-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `MEMORY.md`

## Acceptance criteria

- The workspace overview shows a clear in-app notice when new AI receptionist leads are waiting.
- The overview notice links to the newest AI lead.
- Handled AI leads do not show the overview notice.
- Leads page and overview use the same AI lead detection helper.
- Focused UI tests and full project checks pass.

## Evidence

- Focused tests passed: `pnpm test -- tests/dashboard-ui.test.ts tests/leads-ui.test.ts tests/jobs.test.ts` with 19 test files / 739 tests passing.
- Full `pnpm check` passed on 2026-10-05: typecheck, lint, 19 Vitest files / 739 tests, embedded database suites, Retell lead ingestion embedded suite, and production build.
- Browser state after conversion remains correct: no unreviewed AI lead alert is shown once the fictional lead has been converted and marked contacted.

## Known limitations

- Overview alert is in-app only. It does not send external notifications.
- Positive overview alert is covered by automated render tests; the current hosted fictional lead was already handled during browser verification.

