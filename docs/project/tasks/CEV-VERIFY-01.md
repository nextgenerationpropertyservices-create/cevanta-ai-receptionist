# CEV-VERIFY-01 — Connect development Supabase and verify live foundation

- Owner: Product Manager and Orchestrator; specialist review requested for verified defects.
- Scope: Configure local development connection, apply reviewed foundation to the identified development project, provision synthetic users with owner participation, and verify real auth, tenant isolation and core workflows.
- Dependencies: Owner-created Supabase project, private local connection settings, existing reviewed migration and seed.
- Allowed files: ignored .env.local; supabase/setup-development.sql (exact reviewed migration/seed assembly); this task; docs/project/handoffs/CEV-VERIFY-01.md; verification/status records after actual results. Database changes limited to the identified development project and reviewed foundation files.
- Acceptance criteria: Real auth, five-role restrictions, cross-tenant API denial, authorized customer/location/equipment/settings workflow; no credential output or unauthorized production changes.
- Required evidence: Presence-only configuration check, actual live test results and explicit blocked/skipped evidence.
- State: live connection and all seven schema endpoints verified. Anonymous reads return HTTP 401/PostgreSQL 42501 table-permission denials; no records returned or displayed. Authenticated tenant/role isolation remains unverified.
- Exact next action: Owner reports Auth user created. Complete CEV-VERIFY-02 reviewed workspace membership setup, then verify actual signed-in workflows.
