# CEV-PROJECT-AUDIT-167M — Tenant-safe job deletion command

- **Owner:** Atlas (`architect_data`)
- **Status:** Accepted locally with limitations; hosted migration/JWT proof pending
- **Scope:** Add a narrow, tenant-safe database command for deleting an unprotected job record without granting authenticated users direct table DELETE rights. Preserve foreign-key blockers and audit behavior so linked appointments/records cannot be silently removed.
- **Dependencies:** CEV-PROJECT-AUDIT-167C confirmed that the current UI action can never succeed because `jobs` intentionally has no DELETE policy/grant. The companion action task CEV-PROJECT-AUDIT-167N must land before release.
- **Allowed files:**
  - `supabase/migrations/202610260003_job_deletion_command.sql`
  - `supabase/tests/jobs_isolation.sql`
  - `docs/project/handoffs/CEV-PROJECT-AUDIT-167M-atlas.md`
- **Acceptance criteria:**
  1. A confirmed tenant owner/admin/dispatcher may delete only an unprotected job belonging to that exact tenant through a fixed-search-path command.
  2. Anonymous, unconfirmed/deleted, viewer, technician, non-member, and cross-tenant callers are denied without revealing another tenant's record.
  3. Direct DELETE on `public.jobs` remains unavailable to authenticated clients; no broad DELETE policy or grant is added.
  4. Existing foreign keys block deletion of jobs with protected appointments or other linked records, leave all data intact, and return a safe command failure.
  5. The existing job audit trigger records a successful deletion with the authenticated actor.
  6. Function ownership, execute grants, fully qualified references, and empty search path are asserted.
  7. The existing maintained jobs embedded suite covers the new positive and negative cases and remains part of `pnpm check`.
- **Required reviewer:** Quinn (`quality_security`) before acceptance or hosted migration.
- **Required evidence:** Embedded job suite, direct-delete denial, role/cross-tenant tests, linked-record atomic failure, audit assertion, migration ordering, typecheck, lint, and handoff.

