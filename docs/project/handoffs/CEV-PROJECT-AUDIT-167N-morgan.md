# Agent handoff

- **Task ID:** CEV-PROJECT-AUDIT-167N
- **Work completed:** Replaced the impossible direct authenticated `jobs` table delete with the tenant-safe `delete_job` RPC from 167M. The action keeps verified-user membership and UUID checks, strictly accepts only a single status-only result, redirects and refreshes Jobs, Calendar, and Notifications only after `deleted`, returns a linked-record message for `protected`, and fails closed for unavailable, errored, malformed, identifier-bearing, or array responses.
- **Files changed:**
  - `src/app/actions/jobs.ts`
  - `tests/jobs.test.ts`
  - `docs/project/handoffs/CEV-PROJECT-AUDIT-167N-morgan.md`
- **Database changes:** None in this task. The app action depends on reviewed migration `202610260003_job_deletion_command.sql`, which has not been applied to hosted Supabase.
- **API or contract changes:** `deleteJob` now calls `delete_job({ target_tenant, target_job })` and accepts only `{status:"deleted"}`, `{status:"protected"}`, or `{status:"unavailable"}` with no extra fields.
- **Verification commands and results:** Focused jobs action tests PASS (82); full Vitest PASS (56 files / 957 tests); TypeScript PASS; ESLint PASS; maintained jobs embedded database suite PASS. A mistyped non-existent runner name failed before being corrected; it is not a product failure.
- **Known limitations:** Independent Quality review and a fresh clean non-OneDrive production build remain pending because the assigned specialist/reviewer turns hit the account usage limit. Hosted JWT/PostgREST and hosted migration behavior remain unverified.
- **Risks:** The app must be released with the reviewed migration in the documented order. Deploying the app without the command fails closed; applying the command without the reviewed app leaves the old UI unable to use it.
- **Rollback notes:** Revert `src/app/actions/jobs.ts` and `tests/jobs.test.ts`. Do not restore a direct authenticated table DELETE grant or policy.
- **Exact next action:** Quinn independently reviews 167M/167N together, then Phoenix runs a fresh clean non-OneDrive build. Only after both pass may Morgan mark the pair accepted and prepare a hosted migration/release candidate. No deployment or hosted migration occurred.
