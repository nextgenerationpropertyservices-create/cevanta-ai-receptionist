# CEV-LEAD-NOTIFY-75A — AI lead inbox notification

Owner: Morgan — Product Manager and Orchestrator
Status: accepted with limitations on 2026-10-05

## Scope

Fix the launch blocker reported by the owner: AI receptionist leads must visibly notify office users in the app before launch.

## Allowed files

- `src/app/workspaces/[tenantId]/leads/page.tsx`
- `tests/leads-ui.test.ts`
- `docs/project/tasks/CEV-LEAD-NOTIFY-75A.md`
- `docs/project/handoffs/CEV-LEAD-NOTIFY-75A-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `MEMORY.md`

## Acceptance criteria

- New AI receptionist leads show a visible notification on the Leads page.
- High-priority AI leads are called out.
- AI-generated lead rows are visibly marked.
- Manual leads and already-contacted AI leads do not trigger the new-lead notification.
- No SMS/email/browser push notification is claimed or enabled.

## Evidence

- Focused tests passed: `pnpm test -- tests/leads-ui.test.ts tests/intake.test.ts tests/retell-lead-writer.test.ts`.
- Full `pnpm check` passed with typecheck, lint, 18 Vitest files / 736 tests, all embedded database suites and production build.
- Browser UI proof on 2026-10-05: fresh workspace Leads page showed `New AI receptionist lead waiting`, `1 new AI receptionist lead needs office review`, `including 1 high-priority request`, the `Review newest AI lead` link and the `NEW AI LEAD` badge for `Fictional AI Caller`.

## Known limitations

- This is an in-app Leads page notification, not browser push, SMS, email or mobile notification.
- Notification clears when the lead is no longer `new` or no longer matches the AI receptionist marker.
- A broader workspace-wide badge/count can be added later, but the immediate launch blocker is fixed on the Leads page.

