# CEV-MANAGED-CLIENT-133A

- Owner: Morgan — Product Manager and Orchestrator
- Scope: Add a protected owner/admin-only way to remove managed client workspaces from active operations, with access from the internal Clients page and from an authorized internal view inside the client workspace.
- Dependencies: Existing managed client workspace relation and Supabase authenticated RPC boundary.
- Allowed files: `src/app/actions/managed-clients.ts`, `src/lib/server/queries.ts`, `src/app/workspaces/[tenantId]/clients/page.tsx`, `src/app/workspaces/[tenantId]/page.tsx`, `src/app/globals.css`, `supabase/migrations/202610190002_managed_client_workspace_archive.sql`, `tests/managed-clients.test.ts`, this task file, the matching handoff, and project status.
- Acceptance criteria:
  - Only an internal owner/admin can archive a managed client workspace.
  - The action requires the exact confirmation phrase `DELETE WORKSPACE`.
  - The client workspace leaves the active internal client list and the operator's support membership is revoked.
  - Workspace records remain available for audit; no provider, billing, messaging, calendar, booking, or dispatch side effect is performed.
  - The control is available from the internal Clients page and from the authorized internal view of a client workspace.
  - Type checking, lint, focused tests, and the production build are recorded.
- Required evidence: action tests for exact confirmation and safe RPC result mapping; UI test coverage for the internal control; verification results and build limitation if reproduced.
