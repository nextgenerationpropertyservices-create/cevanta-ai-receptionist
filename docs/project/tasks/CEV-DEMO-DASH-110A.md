# CEV-DEMO-DASH-110A — Google Meet demo dashboard polish

Date: 2026-10-12 (America/New_York)
Owner: Morgan (`product_manager`)
Status: implemented

## Scope

Make the public `/demo-dashboard` route cleaner and more useful for a Google Meet sales demo. The page should tell a simple HVAC owner story with fictional data only: missed call problem, AI receptionist intake, new lead attention, office review, job/calendar preview, setup snapshot, ROI, pilot offer, and clear boundaries.

This task is presentation/UI only. It does not connect live providers, send messages, write calendars, book appointments, collect payments, dispatch technicians, expose provider pages, or use real customer records.

## Dependencies

- Existing standalone demo dashboard route.
- Existing global demo dashboard CSS.
- Existing demo dashboard UI test.

## Allowed files

- `src/app/demo-dashboard/page.tsx`
- `src/app/globals.css`
- `tests/demo-dashboard-ui.test.ts`
- `docs/project/tasks/CEV-DEMO-DASH-110A.md`
- `docs/project/handoffs/CEV-DEMO-DASH-110A-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `MEMORY.md`

## Acceptance criteria

- Demo dashboard is Google Meet friendly: clean hero, large proof cards, obvious lead alert, and a clear talk track.
- Uses fictional HVAC data only and says so clearly.
- Shows the offer `$497 setup + $297/month` and managed-pilot boundary.
- Shows ROI/missed-call value without claiming guaranteed results.
- Shows office review workflow and does not claim automatic booking, SMS/email, calendar writes, payments, or dispatch are live.
- Tests cover the new demo copy and guard against unsafe live-automation claims.

## Required evidence

- Demo dashboard UI test passes.
- Typecheck and lint pass, or skipped checks are recorded with the reason.

