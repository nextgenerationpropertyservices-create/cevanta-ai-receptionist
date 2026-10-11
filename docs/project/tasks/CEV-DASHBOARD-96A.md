# CEV-DASHBOARD-96A — Topbar, technicians, and full calendar

- **Owner:** Morgan (`product_manager`), implementation by coordinator because the user requested immediate dashboard continuation.
- **Status:** Implemented locally, verified locally, hosted release pending explicit owner deployment approval.
- **Scope:** Replace workspace sidebar with top navigation, add an owner/admin Technicians tab, add team-management persistence for confirmed users, and upgrade the calendar to Year / Month / Week / Day / Hour views with assigned technician context.
- **Dependencies:** Existing workspace auth/membership, jobs, appointments, technicians RPC, Supabase Auth users, and the current dashboard shell.
- **Allowed files:**
  - `src/components/workspace-shell.tsx`
  - `src/app/workspaces/[tenantId]/technicians/**`
  - `src/app/workspaces/[tenantId]/calendar/page.tsx`
  - `src/app/actions/team.ts`
  - `src/lib/team-validation.ts`
  - `src/lib/jobs-contracts.ts`
  - `src/lib/server/jobs-queries.ts`
  - `src/app/globals.css`
  - `supabase/migrations/202610110001_team_management.sql`
  - `tests/team.test.ts`
  - `tests/calendar-ui.test.ts`
  - this task and matching handoff/status records.
- **Acceptance criteria:**
  1. Workspace navigation uses a professional topbar and keeps all existing workspace routes reachable.
  2. Owner/admin users can open a Technicians tab, see field team workload, add a technician by confirmed Cevanta email, and edit non-owner roles.
  3. Dispatcher/technician/viewer users cannot manage team membership.
  4. Team-management database functions check the verified signed-in user and require owner/admin membership for the target tenant.
  5. Calendar supports Year, Month, Week, Day, and Hour views from a top menu and shows job/technician assignment context.
  6. No SMS, email, external calendar, billing, quote, dispatch, Retell, Make, or provider writes are added.
  7. Typecheck, lint, unit tests, relevant embedded database suites, and production build pass locally.
- **Required evidence:** local command output for typecheck, lint, unit tests, embedded database suites, production build, and handoff notes with limitations.
- **Review notes:** The migration uses `SECURITY DEFINER` intentionally for Auth user lookup, with pinned `search_path`, revoked default public/anon/authenticated grants before regranting to authenticated, and in-function `auth.uid()` plus owner/admin membership checks. Independent Atlas/Quinn review is still pending because this run did not use delegated specialist agents.
