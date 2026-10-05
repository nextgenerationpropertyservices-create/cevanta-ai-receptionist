# CEV-M1-02 — Architecture and data handoff

- Owner: Software Architect and Data Agent.
- Scope: Supabase schema/config/seed, shared types, form validation, architecture review.
- Dependencies: Coordinator stack setup; backend verified Auth and membership guards; Quality SQL/API review.
- Allowed files: supabase/**, src/lib/contracts.ts, src/lib/validation.ts, docs/agents/ARCHITECTURE.md, this handoff.
- Acceptance criteria: tenant RLS, role restrictions, same-tenant parent constraints, fictional seed, atomic payload-free audit, shared contracts.
- Work completed: implemented schema, role policies, shared contracts and validation; reviewed own migration and contracts. Coordinator acceptance and independent Quality review remain required.
- Files changed: supabase/config.toml; supabase/migrations/202610020001_foundation.sql; supabase/seed.sql; supabase/tests/tenant_isolation.sql; supabase/provision-membership.sql; src/lib/contracts.ts; src/lib/validation.ts; docs/agents/ARCHITECTURE.md.
- Database changes: seven tenant-scoped tables, role enum, constraints, membership predicate, grants, policies, timestamp and audit triggers.
- API/contract changes: entity interfaces and role permission helpers; six form validators. Parent and tenant UUIDs are backend context, not user-editable form schema fields.
- Verification commands/results: Get-Command supabase,docker,node found Node only; Supabase/Docker unavailable on PATH. SQL test authored but NOT executed. Coordinator runs typecheck/lint/tests/build after integration.
- Known limitations: no runtime database acceptance, provider configuration, assigned-job technician filter, deletes, or file uploads; trusted administrator must create verified users and memberships.
- Risks: database authorization must be checked against a real Supabase runtime before release. Technician read scope is all CRM records in own tenant, explicitly conservative read-only foundation.
- Rollback: before first release, reset the local database. For hosted environments restore a backup; do not drop tenant tables with real records. No production migration was applied.
- Exact next action: Quality agent reviews policies and runs supabase db reset followed by tenant_isolation.sql on a local database when runtime is available.
