# CEV-DISPATCH-98A — Technician skills and dispatch suggestions

- Owner: Morgan — Product Manager and Orchestrator
- Scope: Add technician profile data for skills and availability notes, let owner/admin users edit it from the Technicians tab, and surface safe manual dispatch suggestions on job cards.
- Dependencies: CEV-DASHBOARD-96A team management; CEV-DISPATCH-97A quick technician assignment; existing secured job update action and role checks.
- Allowed files: `supabase/migrations/202610110002_technician_profiles.sql`; `src/lib/technician-profiles.ts`; `src/lib/server/technician-profile-queries.ts`; `src/app/actions/technician-profiles.ts`; `src/app/workspaces/[tenantId]/technicians/page.tsx`; `src/app/workspaces/[tenantId]/jobs/page.tsx`; `src/app/workspaces/[tenantId]/jobs/dispatch-board.tsx`; `src/app/globals.css`; `tests/jobs-ui.test.ts`; `tests/technician-profiles.test.ts`; this task file; matching handoff; project status.
- Acceptance criteria:
  - Owner/admin users can save technician skills and availability notes for active technicians only.
  - Technician profile records are tenant-scoped, RLS protected, audited, and tied to a real technician membership.
  - Dispatch cards suggest a technician when the job title/description matches technician skills.
  - Suggestions remain manual only; no auto-assignment, booking, SMS, email, calendar, payment, quote, or external provider write is added.
  - Typecheck, lint, meaningful tests, embedded database migration checks, and production build pass.
- Required evidence: command results, changed files, limitations, and release gate notes in handoff.
