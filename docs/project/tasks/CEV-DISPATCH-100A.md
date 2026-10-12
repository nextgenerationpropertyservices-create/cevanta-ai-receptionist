# CEV-DISPATCH-100A — Technician matching, automation controls and internal operations monitor

Owner: Morgan — Product Manager and Orchestrator
Status: reviewed locally; not released to production

## Scope

Build the next safe dashboard slice for a full front-office app:

- Add technician service areas and structured weekly availability windows.
- Use technician skills, service area and declared availability to suggest a technician for unassigned jobs.
- Keep suggestions manual and clearly office-confirmed, with no automatic dispatch.
- Add an internal Cevanta back-office dashboard for client workspace monitoring, paperwork status and onboarding progress.
- Add automation-control visibility for automatic booking, messages, external calendar writes and dispatch automation as off/approval-gated options.

## Dependencies

- Existing team-management and technician-profile migrations.
- Existing onboarding snapshot RPC for client setup progress.
- Existing internal managed-client workspace relationship.
- Existing workspace top navigation and dashboard shell.

## Allowed files

- `supabase/migrations/202610120001_technician_availability_matching.sql`
- `supabase/tests/technician_profiles.sql`
- `scripts/test-db-embedded.mjs`
- `src/lib/technician-profiles.ts`
- `src/lib/server/technician-profile-queries.ts`
- `src/app/actions/technician-profiles.ts`
- `src/app/workspaces/[tenantId]/technicians/page.tsx`
- `src/app/workspaces/[tenantId]/jobs/dispatch-board.tsx`
- `src/app/workspaces/[tenantId]/clients/page.tsx`
- `src/app/workspaces/[tenantId]/integrations/page.tsx`
- `src/components/workspace-shell.tsx`
- `src/app/globals.css`
- Related tests for those files.

## Acceptance criteria

- Owners/admins can record technician skills, service areas and weekday availability windows.
- Database rejects malformed service-area and availability-window direct writes, including null JSON fields.
- Job suggestions use matching signals but do not claim booking, availability confirmation or automatic dispatch.
- Internal Cevanta workspace shows a back-office monitor for clients, paperwork/setup progress and next action.
- Integrations page shows automatic booking, messages, external calendar writes and dispatch automation as off/approval-gated options.
- No live automatic booking, messaging, calendar writes or dispatch automation is enabled.
- Architect and Quality reviews approve local scope.
- Typecheck, lint, meaningful tests, embedded database checks and production build pass locally.

## Evidence

- `pnpm test -- tests/technician-profiles.test.ts tests/jobs-ui.test.ts tests/managed-clients.test.ts tests/integrations-ui.test.ts tests/workspace-shell-ui.test.ts`: PASS, Vitest reported 30 files and 802 tests due project config.
- `pnpm test:db:embedded`: PASS, including `supabase/tests/technician_profiles.sql` direct SQL regression checks.
- `pnpm typecheck`: PASS.
- `pnpm lint`: PASS.
- `pnpm build`: PASS.
- Atlas architecture/data re-review: approved local scope after JSON-null validation repair.
- Quinn quality/security re-review: approved repaired local scope; confirmed no live automation enabled.

## Remaining gates

- Hosted Supabase migration has not been applied in this task.
- Live Vercel deployment has not been performed in this task.
- Live JWT/PostgREST/browser verification remains required after production release.
- Automatic booking/messages/calendar writes/dispatch automation remain future approval-gated work.
