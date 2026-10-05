# Architect review handoff

- Task ID: CEV-M1-02-F1 (review and fix for CEV-M1-02)
- Owner: Software Architect and Data Agent (architect_review).
- Scope: fix database identity/tenant/parent mutation vulnerability; review shared contracts and M1 authorization integration.
- Dependencies: CEV-M1-02 schema and Quality finding; backend/frontend implementation.
- Allowed files: supabase/**; docs/agents/ARCHITECTURE.md; docs/project/handoffs/CEV-M1-02-review.md. No overlapping writes used.
- Acceptance criteria: ordinary office sessions may update business fields but cannot rewrite record identity, tenant ownership, parent links or timestamps; RLS office restrictions remain; shared contracts reviewed; runtime evidence accurately reported.
- Work completed: replaced table-wide entity UPDATE grants with explicit business-column grants; extended transactional SQL tests; inspected contracts, validation, server authorization/queries/actions/client and frontend customer/settings forms.
- Files changed: supabase/migrations/202610020001_foundation.sql; supabase/tests/tenant_isolation.sql; docs/agents/ARCHITECTURE.md; this handoff.
- Database changes: customer/contact/location/equipment UPDATE now excludes IDs, tenant ownership, parent links and timestamps. Existing RLS, INSERT and SELECT rules retained. No deployed database altered.
- API or contract changes: none. Architect source review approves shared M1 record and role contracts; database acceptance is pending execution and Quality review.
- Verification commands and results: read source and inspected grants using rg; git diff --check passed (untracked new foundation files do not appear in this check). SQL regression file expanded with multi-tenant transfer denial, identity/ownership/timestamp/parent privilege assertions, authorized business updates, owner/admin, viewer and anonymous coverage. These are added test cases, not successful runtime results.
- Known limitations: no Docker, Supabase CLI or psql available to this agent. SQL runtime and authenticated browser/API flows unexecuted. Coordinator owns typecheck, lint, tests and production-build evidence; this SQL/docs fix has no TypeScript changes.
- Risks: SQL tests need real execution on a reset local database. Direct office timezone updates can bypass server IANA validation; tighten before scheduling. Editing initial migration does not update an already migrated database; a forward revoke/grant migration would be required there.
- Rollback notes: no database deployment occurred. Revert these files only in an isolated local environment; restoring broad UPDATE grants reintroduces a verified security vulnerability and must not be released.
- Exact next action: Quality re-review the grants and SQL regression, then coordinator run test:db against a reset local database and preserve output. Do not accept RLS without runtime evidence.
