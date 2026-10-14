# Agent handoff — CEV-CLIENTS-TAB-115A

Task ID: CEV-CLIENTS-TAB-115A
Owner: Morgan — Product Manager and Orchestrator

## Work completed
- Renamed the internal workspace top navigation item from “Back office” to “Clients” so the client dashboard is easier to find.
- Updated the workspace picker so internal workspaces are identified as internal owner dashboards with “Manage clients” and “Open clients dashboard” copy.
- Added focused UI coverage for the top navigation and workspace picker.

## Files changed
- src/components/workspace-shell.tsx
- src/app/workspaces/page.tsx
- tests/workspace-shell-ui.test.ts
- tests/workspaces-page-ui.test.tsx
- docs/project/tasks/CEV-CLIENTS-TAB-115A.md
- docs/project/handoffs/CEV-CLIENTS-TAB-115A-morgan.md

## Database changes
None.

## API or contract changes
None.

## Verification commands and results
- `pnpm test -- tests/workspace-shell-ui.test.ts tests/workspaces-page-ui.test.tsx` — PASS; Vitest runner completed 39 files / 825 tests because of the project runner behavior.
- `pnpm typecheck` — PASS.
- `pnpm lint` — PASS.
- `pnpm build` — BLOCKED by Turbopack worker-process panic in local Windows environment against unchanged globals.css.
- `pnpm exec next build --webpack` — PASS; production build completed and included `/workspaces/[tenantId]/clients`.

## Known limitations
- The Clients tab appears only on workspaces whose `account_type` is `internal`; client workspaces still show the normal trade-service dashboard.
- This does not change live Supabase memberships or create client access.

## Risks
Low UI-copy/navigation discoverability change only.

## Rollback notes
Revert the label/copy changes and remove the added tests/task record.

## Exact next action
Owner should open the internal workspace card from `/workspaces`, then use the top-bar `Clients` tab.
