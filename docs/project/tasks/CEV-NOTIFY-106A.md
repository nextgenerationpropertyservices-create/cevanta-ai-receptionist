# CEV-NOTIFY-106A — Persistent new-lead top alert

Date: 2026-10-12 (America/New_York)
Coordinator: Morgan — Product Manager and Orchestrator
Owner: Morgan (`product_manager`)

## Scope

Make new AI receptionist leads harder to miss from any workspace page by adding a persistent in-app top alert to the workspace shell. The alert must link to the newest unreviewed AI lead and show urgent/high-priority counts when present. Keep this version in-app only.

## Dependencies

- Existing AI lead detection helper in `src/lib/ai-lead-notifications.ts`.
- Existing workspace layout attention count calculation.
- Existing notification center, lead inbox, and top navigation.

## Allowed files

- `src/app/workspaces/[tenantId]/layout.tsx`
- `src/components/workspace-shell.tsx`
- `src/app/globals.css`
- `tests/workspace-shell-ui.test.ts`
- `docs/project/tasks/CEV-NOTIFY-106A.md`
- `docs/project/handoffs/CEV-NOTIFY-106A-morgan.md`
- `docs/project/PROJECT_STATUS.md`

## Acceptance criteria

- When one or more new AI receptionist leads exist, every workspace page shell shows a highly visible in-app lead alert below the top menu.
- The alert links directly to the newest unreviewed AI lead.
- Urgent/high-priority AI leads are called out in the alert text.
- The top navigation still shows lead and total attention badges.
- When no new AI receptionist leads exist, the top alert is hidden.
- The UI states clearly remain in-app only and do not claim SMS, email, booking, dispatch, calendar, or payment automation.
- No database changes, provider calls, external messages, or secrets are introduced.

## Required evidence

- Focused UI tests for the workspace shell alert.
- Typecheck and lint.
- Production build or `pnpm check` if time allows.
- Handoff and project status update with limitations.
