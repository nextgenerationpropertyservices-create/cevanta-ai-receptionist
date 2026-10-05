# CEV-CRM-02 — Complete customer and contact editing

- Owner: Morgan integrates; Backend owns existing workspace actions; Frontend owns customer detail; Quinn reviews/tests.
- Scope: Edit customer business fields, add contacts using existing createContact action, edit contact business fields on customer detail. Existing schema/grants only; no delete, relocation, invitations or new permissions.
- Dependencies: Foundation schema/contracts and existing verified office authorization.
- Allowed files: Backend src/app/actions/workspace.ts and docs/project/handoffs/CEV-CRM-02-backend.md. Frontend src/app/workspaces/[tenantId]/customers/[customerId]/page.tsx and docs/project/handoffs/CEV-CRM-02-frontend.md. Quinn tests/security.test.ts and docs/project/handoffs/CEV-CRM-02-quinn.md after calendar handoff. Morgan task/status/integration records. All other paths read-only.
- Acceptance criteria: Verified member office roles, valid IDs/input, tenant/customer/contact parent chain, only business-field writes; immutable parents/identity, zero-row/cross-tenant failures safe. Prefilled edit forms and createContact form with pending/error/success/read-only/empty states; existing location/equipment flows preserved. Quality approval; meaningful action tests, type/lint/actual SQL/build and honest live/browser evidence.
- Required evidence: Template handoffs, permission/hostile-parent/absent/validation/error/success tests, React interface review, no sensitive logs or service role.
- State: assigned; unborn disjoint file ownership, no commit authorized.
- Exact next action: Backend implement scoped updateCustomer/updateContact; Frontend add connected detail forms after interface published.

## Integration self-check
- Backend/Frontend complete, Quinn source/security approval with 146 foundation/CRM tests.
- pnpm check PASS exit0: type/lint, 310 tests, four embedded SQL suites, production build.
- No schema change. Actual authenticated customer/contact edit/create persistence NOT RUN; criterion remains open. Existing customer/location/equipment UI preserved and source reviewed.
