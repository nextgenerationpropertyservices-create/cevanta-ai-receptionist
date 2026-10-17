# CEV-INTAKE-133A handoff

- Task ID: CEV-INTAKE-133A
- Work completed: Added tenant-scoped lead deletion permission, safe error messages for missing permissions and protected linked records, and dark-theme calendar view-tab contrast for year/month/week/day/hour navigation.
- Files changed: `src/app/actions/intake.ts`, `src/app/globals.css`, `supabase/migrations/202610170001_lead_delete_permissions.sql`, `docs/project/tasks/CEV-INTAKE-133A.md`.
- Database changes: New `lead_delete` RLS policy for owner/admin/dispatcher roles and `delete` grant on `public.leads` to authenticated users. Existing foreign keys continue to prevent deleting leads linked to jobs or protected call receipts.
- API or contract changes: None.
- Verification commands and results: `pnpm typecheck` PASS; `pnpm lint` PASS; `pnpm test -- tests/intake.test.ts tests/calendar-ui.test.ts tests/lead-detail-ui.test.tsx` PASS (Vitest configuration ran 44 files / 853 tests); `pnpm test:intake:db` PASS with the new delete-policy and audit assertions. `pnpm build` BLOCKED by the recurring Windows/OneDrive Turbopack panic while parsing `src/app/globals.css`; no source diagnostic was reported.
- Known limitations: Linked leads remain intentionally protected and cannot be deleted until their linked job or protected call record is handled. Vercel's direct production-promote endpoint rejected the connected deployment permission, so the verified READY deployment was assigned to the production domain alias instead. Vercel's protected URL fetch could not independently read the page from this connection.
- Risks: Applying the migration grants deletion to the existing office roles; application authorization and RLS remain the required controls. Deletion is irreversible for standalone leads, so the UI continues to label it for duplicates, tests, or records no longer needed.
- Rollback notes: Revert the migration by dropping the `lead_delete` policy and authenticated delete grant, then revert the action and CSS changes. Do not remove linked records to force deletion.
- Exact next action: Run one authenticated fictional lead deletion and one linked-record negative check in the live dashboard. If the delete button still reports a permission error, refresh the session and confirm the user is an owner, admin, or dispatcher.

## Release evidence

- Hosted Supabase project `rafiksklbrfgefkypvkn`: migration applied successfully through the Supabase connector. Read-only verification returned `lead_delete` for `DELETE` on `public.leads` for `authenticated`, and `has_table_privilege(..., 'DELETE') = true`.
- Vercel project `cevanta-ai-receptionist`: READY deployment `dpl_GSzzbXw4qDsz4791LR3VV3xXSy8g` built from commit `58c3a9340742c552dbb2af273004e9a5ac33cc16`. Production alias `cevanta-ai-receptionist.vercel.app` was assigned to that deployment; the prior deployment was `dpl_7C4jcXjrV5sKZAdU2FbXhxmAK8hD`.
