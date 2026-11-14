# CEV-PERMITS-145A handoff

- Implemented a pilot-only PermitDesk module in the existing Cevanta dashboard. Client office roles reuse their normal Supabase account. Jobs provide a tenant-verified address, title and scope. One linked permit per job, plus standalone permit drafts.
- The queue, official jurisdiction guidance, Winchendon editable PDF, manual filing email and tracking are included. No automatic submission, AI, portal integration, standalone data migration, or full standalone feature parity.
- Migration adds job_permits and permit_workspace_access, reuses the existing job composite key and audit trigger. Feature is off for all tenants until a privileged operator adds an enabled access row for the selected client tenant. To set a fixed trial end, specify expires_at. Do not grant end users write access to that table.
- Architect reviewed the migration and action contracts. Independent Quality review flagged a possible default GET for an unhydrated PDF form. The form now explicitly uses POST and intercepts it locally when hydrated.
- Verification: pnpm lint, pnpm typecheck, pnpm test (883 passed including embedded PostgreSQL), pnpm build, and an editable PDF fixture smoke test passed. Hosted Supabase, authenticated browser PDF download, and deployment were not run.
- Rollback: disable permit_workspace_access for the pilot tenant or revert the app release. Preserve permit rows; do not drop production tables for rollback.
- Next: after production approval, apply the additive migration, release the verified build, enable the chosen pilot workspace, and check a signed-in fictional job and download before sharing.

## Recovery on the 146A review branch

The supplied integration patch applied cleanly to origin/main at 26e640c. The attachment named download was not a Git bundle, so this recovers the patch contents without recovering the original commit object.

Local typecheck, lint, all 883 tests, and embedded database suites passed. Default Turbopack build failed to start its CSS worker on this Windows checkout. The local production build passed with pnpm exec next build --webpack. Signed-in staging and pilot activation were not run.

Packaging review found that permit pages still use the existing receptionist onboarding gate. The packaging slice must separate workspace product mode from expiring permit access, preserve legacy Missed Call access, and enforce the separation in direct server actions and database policies as well as navigation.
