# Cevanta operations

No production deployment has been performed. M1 acceptance requires live database isolation and authenticated workflow evidence; a successful compilation does not establish those criteria.

## Local setup

Use Node.js 22 and pnpm 11.19.0. Run `pnpm install --frozen-lockfile`. Copy `.env.example` to `.env.local` and fill its two Supabase variables privately. Never paste environment values into chat, tickets, screenshots, or logs. Next.js loads `.env.local`; the presence-only check is `node --env-file=.env.local scripts/check-environment.mjs` and exits nonzero for missing values.

Install Docker Desktop, Supabase CLI, and the PostgreSQL `psql` client using their official installers. Start Docker, then run `supabase start` from this repository. It applies migrations and fictional seed data to the local stack. Obtain the local API URL and publishable key from local Supabase Studio. Do not copy a service-role key into the app. Run `pnpm dev` and open `http://localhost:3000`.

Create and verify a synthetic Auth user through trusted Supabase administration, then provision membership using `supabase/provision-membership.sql`. Signup is disabled; a user account alone grants no tenant access. Read the seed's fictional tenant IDs and assign only the intended role. Keep user identifiers out of committed files. Ordinary requests use the verified user session and RLS.

Run `pnpm agents:validate`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`. To run SQL assertions against the disposable local database, set `DATABASE_TEST_URL` privately to the local connection URI and run `pnpm test:db`. The runner refuses nonlocal hosts and uses `psql -v ON_ERROR_STOP=1`; SQL assertions are not pgTAP tests. Run the configured Playwright suite with `pnpm test:e2e`; inspect its prerequisites and record whether it exercises synthetic display data or authenticated persistence.

`pnpm test:db:embedded` runs actual migration/seed/assertions in embedded PostgreSQL with a minimal Auth compatibility fixture; it passes locally and is included in the application CI job. This does not replace the mandatory live Supabase job. All seven CLI instruction layers pass `pnpm agents:validate:native`; current runtime named-agent selector is unavailable. CEV-OPS-08 verified clean Windows browser runner exit for the configured anonymous suite using installed Chrome; authenticated acceptance remains open.

### Private browser verification

CEV-AUTH-14 diagnosed sandbox network `EACCES` when the server contacted Supabase Auth. An approved network probe returned HTTP200 and an approved network-enabled dev process restored sign-in. A local page loading does not establish outbound Auth connectivity. Reuse the approved process; restarting under restricted execution requires approved network access before sign-in testing. Do not disable TLS, Auth or RLS. Record only sanitized probe status/category. Coordinate the integrated build after handoffs; do not overwrite the active dev output while a private session is in use.

The foreign-tenant browser case now waits for the root unavailable heading and retry control on the requested foreign path before asserting that customer controls/data are absent. This eliminates a pass during loading. The root boundary is also used for service failures, so this UI check alone does not establish the reason for rejection: direct JWT/PostgREST isolation evidence remains mandatory. All authenticated URL/text checks use boolean polling to avoid reporter disclosure. Never reuse the owner's current browser session or extract its credentials for automation.

Start the configured development app separately; Playwright does not start or stop its server. In PowerShell, set `$env:E2E_CONFIGURED='1'` and `$env:E2E_CHROMIUM_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe'`, then run `pnpm test:e2e`. Set `E2E_BASE_URL` only to the intended development preview if different from `http://127.0.0.1:3000`. The configured anonymous case checks sign-in enforcement for dashboard, customers, leads, jobs, calendar and settings plus mobile overflow. It proves route protection, not authenticated writes or direct API isolation. The unconfigured setup case skips intentionally in this mode.

Authenticated tests require explicit `E2E_AUTHENTICATED=1` and privately injected environment values: `E2E_EMAIL`, `E2E_PASSWORD`, `E2E_TENANT_ID`, `E2E_FOREIGN_TENANT_ID`; technician coverage additionally needs `E2E_TECHNICIAN_EMAIL` and `E2E_TECHNICIAN_PASSWORD`. Keep `E2E_CONFIGURED=1`. Use disposable verified synthetic accounts in a development project, with owner/admin membership and a genuinely inaccessible foreign tenant. Never use production or real customer accounts. Missing prerequisites are reported as skips. The owner/admin test creates fictional records and saves settings; arrange synthetic-data cleanup through an approved development workflow. Remove credential variables from the process after use; never type their values into a recorded command or store them in tracked files.

Trace, screenshot and video capture are disabled. The config also sets the installed Playwright page-text capture opt-out, `PLAYWRIGHT_NO_COPY_PROMPT=1`; authenticated assertions report boolean outcomes instead of actual URLs or matched text. Do not override these settings, enable debug/API logging, add page dumps or upload authenticated failure artifacts. Recheck this protection after Playwright upgrades because its page-snapshot opt-out is version-specific. Test failures still exit nonzero, with no retries. A clean anonymous run must not be reported as full authenticated coverage.

Never run `supabase db reset` against a hosted database. A reset is only appropriate for an explicitly disposable local stack, after confirming that no needed local data exists.

## CI and release gates

`.github/workflows/ci.yml` runs frozen dependency installation, agent definition validation, type checking, lint, tests, and production build. A separate job starts a disposable local Supabase stack, applies migration/seed files, and executes database assertions. Both jobs must pass for acceptance; infrastructure failure is a failed gate, not evidence of passing RLS. These jobs use no hosted database credentials and perform no deployment. The Supabase CLI currently follows `latest`; after the first successful run, record and pin that verified version in a reviewed change. Action major tags likewise need commit pinning before a production release.

Database CI does not replace an authenticated browser check. Before M1 acceptance, verify two tenant users, every supported role, denied cross-tenant direct reads/writes, customer creation, service-location creation, equipment creation, audit records, logout, and expired-session behavior. Record commands without private values and sanitized results in the quality handoff; credential tests must not capture account/customer screenshots or page dumps. The current browser suite does not cover every role, direct API writes, logout or expired sessions; these remain separate required gates.

## Preview and staging

Use a dedicated nonproduction Supabase project, synthetic data, and separate Vercel preview/staging environment scopes. Restrict preview access. Never connect previews to production data. Configure the two public Supabase variables in the appropriate environment; they identify the project but do not confer privileged access. Configure Auth site and callback allowlists for exact approved preview/staging URLs; avoid unrestricted wildcard redirects.

Apply only Architect-reviewed migrations to the intended nonproduction project using the Supabase migration workflow. Verify the project reference before linking or pushing, review the migration plan, and retain migration history. Do not apply the local demo seed to production. A trusted administrator provisions verified tenant memberships; the web app has no provisioning service-role path.

## Health and logging

### Manual SQL Editor migration history

Project records CEV-DB-12 and CEV-DB-13 confirm migrations `202610020003` and `202610020004` were applied to development through SQL Editor. Do not rerun them. This does not establish CLI history entries. History reconciliation remains unexecuted.

Before any push, an authorized operator must verify the linked development project reference against the intended resource, privately authenticate, inspect `supabase migration list --linked`, retain a restricted recovery point/history snapshot, and obtain Atlas review comparing installed objects, constraints, functions, triggers, grants and RLS with the exact migration files. Inspect all earlier versions too; do not mark an incomplete schema applied. Resolve drift through a reviewed forward repair before history repair. Do not store credentials or raw database dumps in this repository.

Only after that evidence and coordinator authorization, for each confirmed installed version missing from history, run `supabase migration repair 202610020003 --status applied --linked` and/or `supabase migration repair 202610020004 --status applied --linked`. Skip any version already registered. These commands update history without executing the migration. Then inspect `supabase migration list --linked` again and `supabase db push --dry-run --linked`; the plan must omit already installed versions and include only reviewed pending changes. Stop on disagreement. No history repair, linking, push or hosted database mutation was executed by CEV-AUTO-16-ops. [Official CLI reference](https://supabase.com/docs/reference/cli/supabase-migration-repair) checked 2026-10-02; verify installed CLI help before execution.

`GET /api/health` returns `status: ok` and a boolean `databaseConfigured` with no-store caching. It checks process reachability and configuration presence, not database connectivity, Auth, RLS, or readiness. Monitor those separately with authorized synthetic checks in staging. Alert on sustained server errors, failed sign-in, failed migrations, and unexpected authorization denials. Log request IDs, operation names, status codes, and sanitized error categories only; do not log bodies, cookies, tokens, email addresses, call recordings, or customer records. Restrict log access and define retention before onboarding real businesses.

## Production, backups, and rollback

Production requires explicit owner approval after Architect, Quality, and coordinator acceptance. Provision an independent production Supabase project and production-scoped Vercel environment. Require exact Auth redirect URLs, restricted administration, branch protection with both CI jobs, and documented backup retention and restore access. Enable and verify provider backups appropriate to the chosen plan; test restoring into a separate restricted project before relying on them. Database backups may not include Storage objects, Auth configuration, or external integration settings; inventory and protect each separately.

Before a schema change, verify the project reference, take a provider-supported backup or recovery point, record migration version and application deployment ID, and test compatibility with the previous application build in staging. Prefer additive migrations so an application rollback remains possible. Apply reviewed migrations through a trusted operator, then validate health, authentication, isolation, and the core write flow before releasing traffic.

For an application regression, return traffic to the recorded previous Vercel deployment only if compatible with the current schema. For a schema regression, stop affected writes and have the Architect prepare a forward corrective migration; test it on a restored copy first. Do not drop tables, reset a hosted database, or improvise reverse migrations. For data corruption, restore the backup into a separate restricted project, verify integrity and tenant isolation, reconcile writes after the recovery point, and obtain owner approval before cutover. Record the incident and any lost writes. Never overwrite production as an unreviewed rollback shortcut.

## Evidence at initial handoff

Docker, Supabase CLI, and psql were unavailable in the initial workspace. Live database, Auth, migration, backup/restore, hosted CI, and deployment checks remain unexecuted. The coordinator owns application build and UI evidence. Operations documentation describes required actions, not executed infrastructure.

References: [Supabase local CLI](https://supabase.com/docs/guides/local-development/cli/getting-started), [Supabase CI testing](https://supabase.com/docs/guides/deployment/ci/testing), [Supabase environment workflow](https://supabase.com/docs/guides/deployment/managing-environments), and [official setup-cli action](https://github.com/supabase/setup-cli).
