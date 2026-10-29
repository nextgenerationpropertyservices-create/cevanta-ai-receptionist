# CEV-PROJECT-AUDIT-167T — Authenticated Retell mapping commands

- **Owner:** Atlas (`architect_data`)
- **Status:** Accepted locally with limitations; hosted migration and provider proof pending
- **Scope:** Replace the service-role-only Retell mapping management boundary with authenticated, fixed-search-path database commands. Route mutation must be limited to a confirmed Cevanta internal owner/admin who has an active managed-client relationship to the target workspace. A non-sensitive route-health read may remain available to the target workspace owner/admin and the authorized internal operator. Keep provider identifiers private in health responses and preserve the existing trusted connection mapping contract.
- **Dependencies:** CEV-PROJECT-AUDIT-167C security finding; existing `integration_private.retell_connections` and `public.managed_client_workspaces` contracts.
- **Allowed files:**
  - `supabase/migrations/202610260004_authenticated_retell_mapping_commands.sql`
  - `supabase/tests/retell_mapping_commands.sql`
  - `scripts/test-retell-mapping-embedded.mjs`
  - `scripts/test-db-embedded.mjs`
  - `package.json`
  - `docs/project/handoffs/CEV-PROJECT-AUDIT-167T-atlas.md`
- **Acceptance criteria:**
  1. Register and pause commands derive the actor from `auth.uid()` and permit only a confirmed, non-deleted owner/admin of an operator tenant actively linked to the target client workspace.
  2. A target client owner/admin may read only the non-sensitive state `active`, `paused`, or `not_mapped`; they cannot register or pause a mapping.
  3. Anonymous, unconfirmed/deleted, viewer, dispatcher, technician, unrelated member, archived relationship, and cross-tenant callers fail closed without exposing provider identifiers or another tenant's mapping.
  4. Direct access to `integration_private.retell_connections` remains unavailable; service-role execution is not required for ordinary app mapping actions.
  5. Agent ID format, unique mapping conflict behavior, connection scoping, function ownership, execute grants, and fixed/empty search path are tested.
  6. The contract states clearly that provider-account ownership is still manually verified before mapping; the database command does not claim live Retell telemetry.
  7. The new embedded suite is included in `pnpm check` and passes with the maintained database suites.
- **Required reviewer:** Quinn (`quality_security`) before acceptance or hosted migration.
- **Required evidence:** Positive/negative role and relationship tests, private-table denial, non-sensitive health response assertions, grants/search-path checks, commands/results, migration ordering, limitations, and recovery notes.

