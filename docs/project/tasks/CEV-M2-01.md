# CEV-M2-01 — Leads and service requests intake
- Owner: Coordinator; location_backend owns architecture/data/contracts and backend; location_frontend owns architectural review then UI; auth_quality owns security review and tests.
- Scope: Tenant-isolated manual intake inbox with create/edit, enquiry contact details, optional existing customer, description, priority, status new/contacted/scheduled/closed and follow-up date. Submission token idempotency prevents retry duplicates. No voice/dispatch/provider integration.
- Dependencies: Existing verified Auth/membership/office roles. M1 live role/isolation gates remain open; M2 development does not imply M1 acceptance.
- Allowed files: Backend supabase/migrations/202610020002_service_intake.sql, src/lib/intake-contracts.ts, src/lib/intake-validation.ts, src/lib/server/intake-queries.ts, src/app/actions/intake.ts, docs/project/handoffs/CEV-M2-01-backend.md. Frontend src/app/workspaces/[tenantId]/leads/**, src/components/workspace-shell.tsx, docs/project/handoffs/CEV-M2-01-architect.md and CEV-M2-01-frontend.md. Quality tests/intake.test.ts, supabase/tests/intake_isolation.sql, scripts/test-intake-embedded.mjs, docs/project/handoffs/CEV-M2-01-quality.md. Coordinator task/project records and package check script if required.
- Acceptance: Tenant/member scoped reads; office-only writes; RLS + immutable identity grants + same-tenant customer FK; atomic metadata-only audit; idempotent create under retries without altering existing record. Validated input, scoped update, prefilled forms and permission/loading/empty/error states. No personal data in source/logs. Architecture and security reviews; type/lint/meaningful tests/actual SQL/build pass.
- Required evidence: Real migration/seed intake RLS/role/cross-customer/immutability/idempotency tests, mocked actual action tests and UI source review. Hosted new migration is owner action; database-not-ready UI should explain setup safely.
- State: assigned. No commit authorized; disjoint ownership.
- Ownership addition: Coordinator package.json, .github/workflows/ci.yml and scripts/test-db.mjs for integration of intake verification gates; no overlap with Quality runner.

## Final integration
- State: implemented and independently reviewed. Architect migration/contracts approved; Quality final no findings.
- Full check type/lint/SQL/build exit0; final suite147 tests (44 intake+103 existing) exit0; final global lint exit0; Quality final typecheck pass.
- First intake fixture expected FK denial on an immutable customer field; corrected test to expect restricted grant, no application permission weakening. Final SQL assertion passes.
- CI application now includes intake SQL runner and local live psql gate runs both isolation files. Hosted CI not run.
- Browser new Leads navigation and missing-migration setup notice verified. No live data mutated.
- Owner next: run ONLY 202610020002_service_intake.sql in Cevanta Development SQL Editor, refresh Leads. Hosted migration/create/edit/persistence and real JWT role/isolation remain unverified.
