# Cevanta

Cevanta is a multi-tenant front-office platform for HVAC and other trade-service businesses. The production application includes Supabase sign-in, private workspaces and roles, guided client onboarding, customers and contacts, leads, jobs, appointments, technicians, an attention queue, a full calendar, internal owner operations, manual Stripe payment requests, and guarded AI-receptionist/product workflows.

The application uses Next.js App Router, strict TypeScript, React, Tailwind CSS, Zod, and Supabase Postgres/Auth. Each business's protected records use server membership checks and database Row Level Security. There is no hardcoded login or public customer-data demo.

## Capability boundary

Working application features and live external automation are not the same thing:

- The signed-in dashboard, onboarding, CRM, leads, jobs, internal calendar, technicians, notifications, manual payment links, and office-review workflows are implemented.
- Retell/Make intake has trusted mapping, gated ingress, and deduplicated lead creation, but every client still needs its own fictional end-to-end test and launch evidence.
- Gmail/Google Calendar authorization links and readiness controls exist. Automatic email, SMS, external calendar writes, booking, subscription billing, payment collection, and dispatch are not proven live merely because a readiness switch exists.
- Seasonal maintenance reactivation is a guarded human-review workflow. Quote Follow-Up and Blueprint & Scope Intake are product designs, not live automation.

## Run locally

Requirements: Node.js 22 or newer and pnpm (the exact version is in package.json). A full local database additionally needs Docker Desktop, the Supabase CLI and psql. Instructions are in [operations](docs/project/OPERATIONS.md).

1. Run `pnpm install --frozen-lockfile`.
2. Copy `.env.example` to `.env.local` and privately set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Ordinary browser requests use the publishable key. Optional provider-ingress routes may require a server-only service-role key; it must never be exposed to browser code, source, logs, screenshots, or chat.
3. Run `supabase start` for a disposable local stack. It applies migrations and the fictional seed; check local status for the URL and public key without sharing raw credential output.
4. Create a confirmed Auth user in local Supabase Studio or use the application's sign-up/confirmation flow in an environment where email confirmation is configured. Choose its password privately.
5. For the seeded demo workspace, a trusted database administrator can assign that user using the SQL below. Self-created first workspaces use the reviewed provisioning flow instead.
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
pnpm check
pnpm test:e2e
pnpm test:db
```

`pnpm check` runs type checking, lint, the application tests, the maintained embedded database suites, and the production build.

The embedded database check executes the real migration, fictional seed and SQL assertions in PGlite PostgreSQL, with a minimal Auth compatibility fixture. It verifies SQL/RLS semantics without Docker, but does not run real Supabase Auth, JWT verification or PostgREST. The live database command requires DATABASE_TEST_URL privately supplied for a disposable loopback database and psql installed. It executes the same assertion SQL and rolls back test fixtures. It intentionally refuses hosted databases. Authenticated E2E requires private test environment variables as described in the Quality review and test files; skipped tests are not accepted as passed.

## Windows and Android app packaging

Cevanta includes an installable app manifest, icons and a safe service-worker shell for Windows and Android install support. The first pilot should use the production HTTPS dashboard as an installable browser app. Signed Windows installers and Android store packages require a separate package choice, publisher/signing decisions and owner approval. See [Windows and Android packaging](docs/project/WINDOWS_ANDROID_PACKAGING.md).

## Production deployment

Production is deployed on Vercel at https://cevanta-ai-receptionist.vercel.app/. Environment variable names, verifier-only provider gates and remaining post-deploy checks are documented in [production deployment](docs/project/PRODUCTION_DEPLOYMENT.md). Do not store secret values in source or chat.

## Roles

Owners, admins, and dispatchers can manage office CRM records within their authorized workspace. Owners and admins control workspace settings and guarded automation readiness. Technician access is restricted by current role/assignment rules, and viewers remain read-only. Client invitations, technician account linking, and internal managed-client access use explicit protected workflows; hiding a control is never treated as authorization.

## Team and project records

Seven native Codex specialists are defined in .codex/agents. Start with [team instructions](docs/agents/README.md), [current project status](docs/project/PROJECT_STATUS.md), and [prioritized backlog](docs/project/BACKLOG.md). See [requirements](docs/product/PRODUCT_REQUIREMENTS.md), [roadmap](docs/product/MVP_ROADMAP.md), and [architecture](docs/agents/ARCHITECTURE.md).

The current roadmap distinguishes working dashboard features, guarded workflows, and planned products. Production hosting exists, but each live provider action remains client-specific, evidence-based, approval-gated, and reversible. See operations for staging setup, backups, forward repair, and rollback.

