# CEV-AUTO-ONBOARD-145A

- Task ID: CEV-AUTO-ONBOARD-145A
- Work completed: The final onboarding wizard step now automatically attempts the configured Make intake sync. It records a browser-local sent marker keyed by tenant and saved configuration revision, so refreshes do not resend the same revision in that browser. Manual “Send again” remains available for failed or incomplete setup.
- Files changed: `src/app/workspaces/[tenantId]/onboarding/onboarding-wizard.tsx`, `src/app/workspaces/[tenantId]/onboarding/onboarding-form.tsx`, `src/app/workspaces/[tenantId]/onboarding/page.tsx`, `docs/project/tasks/CEV-AUTO-ONBOARD-145A.md`.
- Database changes: None.
- API or contract changes: None. Existing server readiness and server-only webhook checks remain authoritative.
- Verification commands and results: `pnpm typecheck` PASS; `pnpm lint` PASS; `pnpm test -- tests/onboarding-ui.test.ts` PASS (47 files, 875 tests); `git diff --check` PASS. `pnpm build` BLOCKED by the known local OneDrive/Turbopack worker panic while processing `src/app/globals.css`.
- Known limitations: The one-time marker is browser-local. A different browser/device can retry the same revision; the Make scenario should add durable webhook dedupe before treating this as a cross-device exactly-once guarantee.
- Risks: Automatic sync still sends only the completed owner-setup snapshot to the configured intake sheet; it does not activate Retell, booking, SMS, email, calendar writes, payment collection, or dispatch.
- Rollback notes: Revert the three onboarding UI files to remove automatic triggering; the existing manual sync action remains server-only.
- Exact next action: Redeploy this candidate after owner approval, then complete a fictional onboarding run and verify one row in Make/Google Sheets.
