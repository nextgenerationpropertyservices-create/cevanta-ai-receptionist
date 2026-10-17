# CEV-INTAKE-133A handoff

- Task ID: CEV-INTAKE-133A
- Work completed: Added tenant-scoped lead deletion permission, safe error messages for missing permissions and protected linked records, and dark-theme calendar view-tab contrast for year/month/week/day/hour navigation.
- Files changed: `src/app/actions/intake.ts`, `src/app/globals.css`, `supabase/migrations/202610170001_lead_delete_permissions.sql`, `docs/project/tasks/CEV-INTAKE-133A.md`.
- Database changes: New `lead_delete` RLS policy for owner/admin/dispatcher roles and `delete` grant on `public.leads` to authenticated users. Existing foreign keys continue to prevent deleting leads linked to jobs or protected call receipts.
- API or contract changes: None.
- Verification commands and results: `pnpm typecheck` PASS; `pnpm lint` PASS; `pnpm test -- tests/intake.test.ts tests/calendar-ui.test.ts tests/lead-detail-ui.test.tsx` PASS (Vitest configuration ran 44 files / 853 tests); `pnpm test:intake:db` PASS with the new delete-policy and audit assertions. `pnpm build` BLOCKED by the recurring Windows/OneDrive Turbopack panic while parsing `src/app/globals.css`; no source diagnostic was reported.
- Known limitations: The hosted Supabase migration has not been applied in this task, so production deletion remains unavailable until the migration is run. Linked leads remain intentionally protected. Production deployment has not been requested or performed for this change.
- Risks: Applying the migration grants deletion to the existing office roles; application authorization and RLS remain the required controls. Deletion is irreversible for standalone leads, so the UI continues to label it for duplicates, tests, or records no longer needed.
- Rollback notes: Revert the migration by dropping the `lead_delete` policy and authenticated delete grant, then revert the action and CSS changes. Do not remove linked records to force deletion.
- Exact next action: Apply `202610170001_lead_delete_permissions.sql` to the intended hosted Supabase project, run an authenticated fictional lead-delete check and a linked-record negative check, then request owner approval before deploying this release.
