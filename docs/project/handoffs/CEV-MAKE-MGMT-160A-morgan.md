# CEV-MAKE-MGMT-160A — Morgan handoff

- Task ID: CEV-MAKE-MGMT-160A
- Completed: Added a server-only Make management client, owner/admin-gated server actions, and an Integrations-page form to create client credential-request authorization links. The client sends only name/email; the Make token is read only on the server and never returned to the browser.
- Changed files: `src/lib/server/make-management.ts`, `src/app/actions/make-authorization.ts`, `src/app/workspaces/[tenantId]/integrations/make-authorization-form.tsx`, `src/app/workspaces/[tenantId]/integrations/page.tsx`, `tests/make-management.test.ts`, `docs/project/tasks/CEV-MAKE-MGMT-160A.md`.
- Database changes: None.
- API/contract changes: New server-side Make API client uses `POST /api/v2/credential-requests/requests/v2` . Required server settings are `MAKE_MANAGEMENT_API_TOKEN` and `MAKE_TEAM_ID`; optional `MAKE_CREDENTIAL_REQUEST_CREDENTIALS_JSON` overrides the default Gmail/Google Calendar module selections.
- Verification: `pnpm typecheck` PASS; `pnpm lint` PASS; `pnpm test -- tests/make-management.test.ts` PASS (Vitest configuration ran 50 files / 888 tests); `pnpm exec next build --webpack` PASS. Default `pnpm build` remains blocked by a Turbopack process panic in the sandbox; webpack fallback compiled and generated all routes.
- Hosted state: Vercel Production shows `MAKE_MANAGEMENT_API_TOKEN` and `MAKE_TEAM_ID` present; no deployment was started. The Make API call itself remains unverified from the hosted app until deployment and a fictional request test. Status tracking is intentionally deferred until request IDs are persisted against a tenant; this prevents cross-workspace status disclosure.
- Limitations: Make app/module wildcard defaults assume `gmail` and `google-calendar`; if the provider rejects those names, set `MAKE_CREDENTIAL_REQUEST_CREDENTIALS_JSON` to the exact app/module IDs from Make. No client request was created by this task.
- Security: Provider errors are redacted; no token or customer data is logged or stored in source/tests.
- Rollback: Revert the four source files and test/task/handoff files; leave the server variables present but unused, or remove them in Vercel if the feature is abandoned.
- Exact next action: Owner approves a production deployment, then run one fictional client authorization-link test and verify link creation without enabling booking, SMS, email, calendar writes, payments or dispatch.
