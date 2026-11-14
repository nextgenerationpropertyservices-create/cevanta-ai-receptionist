# CEV-PERMITS-145A — PermitDesk inside Cevanta
- Owner: Morgan, integration. Architect and Quality independently review.
- Scope: invite-only workspace gate, job-linked permit queue, municipal guidance, Winchendon draft and manual filing tracking.
- Dependencies: existing Supabase Auth, memberships, jobs and service locations. Preserve the private standalone app.
- Allowed files: permit-specific routes, actions, server/domain modules, PDF public assets, migrations/tests, task and handoff records, workspace shell/layout and job detail entry point.
- Acceptance: same Cevanta login, client office roles only and pilot off by default, tenant-safe links, a prefilled and downloadable unsigned application, no automatic filing. Verify using embedded SQL and app checks.
- Branch: codex/permitdesk-module. Production requires explicit approval.
