# CEV-DASHBOARD-95A — Trade-services front office dashboard

Owner: Morgan — Product Manager and Orchestrator

## Scope

Upgrade the authenticated workspace overview into a trade-services front office command center using existing persisted data only. The dashboard should feel valuable for HVAC, plumbing, electrical, roofing, and other field-service businesses without adding new live automation or external provider writes.

## Dependencies

- Existing workspace, lead, job, technician, and appointment read contracts.
- Existing AI receptionist lead classification helpers.
- Existing authenticated workspace shell and route protection.

## Allowed files

- `src/app/workspaces/[tenantId]/page.tsx`
- `src/app/globals.css`
- `tests/dashboard-ui.test.ts`
- `docs/project/tasks/CEV-DASHBOARD-95A.md`
- `docs/project/handoffs/CEV-DASHBOARD-95A-morgan.md`
- `docs/project/PROJECT_STATUS.md`

## Acceptance criteria

1. Workspace overview presents a clean professional front-office dashboard for trade-service businesses, not HVAC-only copy.
2. New AI receptionist leads, urgent leads, unassigned jobs, and today's schedule are highly visible.
3. Dashboard includes an ROI/recovered-loss snapshot with clear assumptions.
4. Dashboard shows field team workload and upcoming scheduled work using existing jobs, technicians, and appointments.
5. No secrets, real customer data, provider keys, external writes, auto-booking, SMS, email, payment, or calendar writes are added.
6. Focused UI tests cover the new command-center behavior and no-secret rendering.
7. Lint, typecheck, tests, and production build pass locally.

## Evidence required

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test -- tests/dashboard-ui.test.ts`
- `pnpm build`

## Status

Implemented locally by Morgan. Production deployment requires owner approval.
