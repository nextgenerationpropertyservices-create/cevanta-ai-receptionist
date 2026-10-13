# CEV-LEAD-NOTIFY-114A — Lead field cleanup and actionable notifications

Owner: Morgan — Product Manager and Orchestrator
Status: assigned
Date: 2026-10-13

## Scope
Improve the current dashboard workflow so AI receptionist leads are easier to convert and notifications are directly actionable.

## Dependencies
- Existing lead, job, appointment, technician, workspace shell, and notification routes.
- Existing office-role authorization and tenant membership checks.
- No database migration or live provider activation in this task.

## Allowed files
- `src/lib/lead-display.ts`
- `src/app/workspaces/[tenantId]/leads/[leadId]/page.tsx`
- `src/app/workspaces/[tenantId]/notifications/page.tsx`
- `src/components/workspace-nav.tsx`
- `src/components/workspace-shell.tsx`
- `src/app/globals.css`
- `tests/lead-display.test.ts`
- `tests/lead-detail-ui.test.tsx`
- `tests/notifications-ui.test.ts`
- `tests/workspace-shell-ui.test.ts`
- `docs/project/tasks/CEV-LEAD-NOTIFY-114A.md`
- `docs/project/handoffs/CEV-LEAD-NOTIFY-114A-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `MEMORY.md`

## Acceptance criteria
- Lead detail edit fields show the best available enquiry name, email, and phone, including values extracted from AI receptionist text when the stored fields are blank.
- Service request defaults to the cleaned summary text only, not contact labels or AI marker boilerplate.
- Job creation from a lead defaults the job title from the service need/summary, not just the caller name.
- Notifications tab remains and lets users open new leads, urgent jobs, unassigned jobs, and today’s visits from clear cards and queues.
- Top navigation clearly marks the current section.
- No SMS, email, external calendar writes, automatic booking, payment collection, subscription billing, dispatch automation, provider writes, migrations, credentials, or real customer data are added.

## Evidence required
- Focused tests for lead parsing/display, lead detail defaults, notifications action cards, and active navigation.
- Typecheck, lint, and production build results, or explicit blockers.
