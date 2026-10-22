# CEV-MAKE-MGMT-160A — Dashboard Make authorization link management

- Owner: Morgan (coordinator)
- Scope: Add a server-only Make management API client and an authenticated dashboard action/page for creating and checking client credential-request links.
- Dependencies: Vercel Production environment variable `MAKE_MANAGEMENT_API_TOKEN`; existing Supabase membership authorization; Make API credential-request endpoints.
- Allowed files: `src/lib/server/make-management.ts`, `src/app/actions/make-authorization.ts`, `src/app/workspaces/[tenantId]/integrations/make-authorization-form.tsx`, `src/app/workspaces/[tenantId]/integrations/page.tsx`, `tests/make-management.test.ts`, this task and handoff docs.
- Acceptance criteria:
  1. Token is read only on the server and never returned to browser responses.
  2. Owner/admin membership is required for create actions.
  3. Create action validates client email/name and sends only approved request metadata to Make.
  4. UI shows a create-link action, safe link result, loading/error states.
  5. Make API failures are handled without leaking provider payloads or secrets.
  6. Typecheck, lint, relevant tests, and production build pass.
- Evidence: automated tests for missing config, authorization/validation boundaries and redacted provider errors; local checks; hosted Make/Vercel behavior remains unverified until deployment.
- Reviewers: Architect/data and Quality/security review required before acceptance.
