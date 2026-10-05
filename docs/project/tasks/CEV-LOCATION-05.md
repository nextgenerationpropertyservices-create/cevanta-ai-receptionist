# CEV-LOCATION-05 — Edit customer service locations
- Owner: Coordinator integration; Backend src/app/actions/workspace.ts; Frontend src/app/workspaces/[tenantId]/customers/[customerId]/page.tsx; Quality tests/security.test.ts.
- Scope: Existing location editing on customer detail with prefilled fields and secure update action.
- Dependencies: Existing location schema, role checks and immutable column database grants; no migration/shared contract changes.
- Allowed files: Each specialist only its listed source file and docs/project/handoffs/CEV-LOCATION-05-{backend,frontend,quality}.md respectively. Coordinator task, status and verification records.
- Acceptance: Authorized office roles edit business fields only; verified user and tenant membership; update constrained by tenant/customer/location IDs and checks matching parent; malformed/missing/cross-tenant IDs fail safely; errors not leaked; technician/viewer read-only; defaults populated; successful save refreshes current detail; type/lint/security tests/build pass.
- Evidence: Actual-action tests incl denial, scoped update, no identity mutation, not-found failure; source Quality review; browser safe presence check; live owner save remains separate.
- State: assigned; unborn Git disjoint ownership, no commit authorized.

## Integration evidence
- Quality action/UI review approved without findings.
- Full check passed typecheck, global lint, 54 tests at checkpoint, embedded SQL and production build exit 0. Final test additions: global lint pass, all 77 tests pass outside known bundler sandbox restriction; Quality typecheck also pass.
- Browser read-only booleans confirm current customer has edit form/save button with prefilled fields and hidden location binding; no customer values extracted and no live data mutated.
- State: implemented and reviewed; live owner save remains unverified. Refresh customer, open Edit service location, change fields and Save location.
