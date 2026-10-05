# Cevanta

Cevanta is a secure CRM foundation for HVAC and other trade businesses. The first build includes Supabase sign-in, member workspace selection, role restrictions, workspace settings, customer records, contacts, service locations, equipment, fictional demo data, and atomic audit events.

The application uses Next.js App Router, strict TypeScript, React, Tailwind CSS, Zod, and Supabase Postgres/Auth. Each business's records are protected by database Row Level Security and server membership checks. There is no public demo login or hardcoded password.

## Run locally

Requirements: Node.js 22 or newer and pnpm (the exact version is in package.json). A full local database additionally needs Docker Desktop, the Supabase CLI and psql. Instructions are in [operations](docs/project/OPERATIONS.md).

1. Run `pnpm install --frozen-lockfile`.
2. Copy .env.example to .env.local and privately set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Use a publishable key, never a service-role key.
3. Run `supabase start` for a disposable local stack. It applies migrations and the fictional seed; check local status for the URL and public key without sharing raw credential output.
4. Create a confirmed Auth user in the local Supabase Studio. Choose its password privately. Public signup is disabled.
5. As a trusted database administrator, assign that user to the demo workspace using the SQL below.
6. Run `pnpm dev` and visit http://localhost:3000. Sign in and select the workspace.

Without environment settings the app shows a setup screen. This screen grants no data access.

### Provision a demo membership

In the trusted local SQL editor, replace the placeholder with the Auth user's UUID:

```sql
insert into public.memberships (tenant_id, user_id, role)
values (
  '10000000-0000-4000-8000-000000000001',
  '<AUTH_USER_UUID>'::uuid,
  'owner'
);
```

The second fictional workspace has ID `10000000-0000-4000-8000-000000000002`. Create separate verified test users for isolation checks. Normal application users cannot create memberships or elevate roles.

## Verify

```text
pnpm agents:validate
pnpm typecheck
pnpm lint
pnpm test
pnpm test:db:embedded
pnpm build
pnpm test:e2e
pnpm test:db
```

The embedded database check executes the real migration, fictional seed and SQL assertions in PGlite PostgreSQL, with a minimal Auth compatibility fixture. It verifies SQL/RLS semantics without Docker, but does not run real Supabase Auth, JWT verification or PostgREST. The live database command requires DATABASE_TEST_URL privately supplied for a disposable loopback database and psql installed. It executes the same assertion SQL and rolls back test fixtures. It intentionally refuses hosted databases. Authenticated E2E requires private test environment variables as described in the Quality review and test files; skipped tests are not accepted as passed.

## Windows and Android app packaging

Cevanta now includes an installable app manifest, icons and a safe service-worker shell for Windows and Android install support. The first pilot should use the hosted HTTPS dashboard as an installable app. Signed Windows installers and Android store packages require a final production URL, package choice and owner approval. See [Windows and Android packaging](docs/project/WINDOWS_ANDROID_PACKAGING.md).

## Production deployment

Production deployment is prepared for Vercel, but the actual deploy requires a working Vercel project link or CLI login on the machine running the deploy. Environment variable names and post-deploy checks are documented in [production deployment](docs/project/PRODUCTION_DEPLOYMENT.md). Do not store secret values in source or chat.

## Roles

Owners, admins, and dispatchers can add CRM records. Owners and admins can change workspace settings. Technicians and viewers have read-only CRM access in M1. Membership provisioning remains an administrator operation. Record deletion and assignment-based technician job permissions are deferred.

## Team and project records

Seven native Codex specialists are defined in .codex/agents. Start with [team instructions](docs/agents/README.md), [current project status](docs/project/PROJECT_STATUS.md), and [prioritized backlog](docs/project/BACKLOG.md). See [requirements](docs/product/PRODUCT_REQUIREMENTS.md), [roadmap](docs/product/MVP_ROADMAP.md), and [architecture](docs/agents/ARCHITECTURE.md).

AI calls, jobs, calendar, handoffs, estimates, and revenue reporting follow the ordered roadmap. No production deployment is authorized or performed. See operations for staging setup, backups, forward repair and rollback.
