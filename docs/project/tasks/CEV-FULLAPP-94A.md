# CEV-FULLAPP-94A — Managed client workspaces

- Owner: Morgan — Product Manager and Orchestrator
- Scope: Move past the single pilot workspace by adding the first full-app foundation for Cevanta-managed HVAC client workspaces. Cevanta internal owner/admin users can create separate client workspaces from the internal operations dashboard, then open the new client's Setup page for onboarding.
- Dependencies: Existing internal operations workspace concept; existing Supabase tenants/memberships/audit foundation; existing Next.js workspace shell and server actions; hosted production migration still requires an explicit release step.
- Allowed files:
  - `package.json`
  - `supabase/migrations/202610020009_managed_client_workspaces.sql`
  - `supabase/tests/managed_client_workspaces.sql`
  - `scripts/test-managed-client-workspaces-embedded.mjs`
  - `src/lib/contracts.ts`
  - `src/lib/validation.ts`
  - `src/lib/server/queries.ts`
  - `src/app/actions/managed-clients.ts`
  - `src/app/workspaces/[tenantId]/clients/page.tsx`
  - `src/components/workspace-shell.tsx`
  - `tests/managed-clients.test.ts`
  - `docs/project/tasks/CEV-FULLAPP-94A.md`
  - `docs/project/handoffs/CEV-FULLAPP-94A-morgan.md`
  - `docs/project/PROJECT_STATUS.md`
- Acceptance criteria:
  1. Tenants can be marked as `internal` or `client` without weakening existing tenant authorization.
  2. Only verified owner/admin membership in an internal workspace can create managed client workspaces.
  3. Creation is idempotent by request ID and rejects changed replays.
  4. The creating Cevanta operator receives owner access to the new client workspace so onboarding can continue.
  5. The dashboard exposes a Client workspaces page only from internal workspaces and clearly states what is not automated yet.
  6. No credentials, real customer data, provider secrets, billing activation, SMS/email/calendar writes, auto-booking, quotes, payments or dispatch are added.
  7. Meaningful database, action, UI, type, lint, test and production-build checks pass locally.
- Required reviewers: Architect review required before hosted migration/deploy; Quality review required before production acceptance because this is cross-module and security-sensitive.
- Evidence:
  - `pnpm check` passed on 2026-10-11, including 25 Vitest files / 779 tests, embedded migration suites, managed-client database checks, Retell ingestion checks, and `next build`.
  - Focused `node scripts/test-managed-client-workspaces-embedded.mjs` passed.
  - `pnpm typecheck`, `pnpm lint`, and `pnpm build` passed separately before the full check.
- Result: Implemented locally and ready for review/release gating. Hosted Supabase migration and production deployment are not yet performed in this task record.
