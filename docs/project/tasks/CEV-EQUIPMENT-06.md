# CEV-EQUIPMENT-06 — Edit customer equipment
- Owner: Coordinator integration; Backend workspace action; Frontend customer detail; Quality tests/review.
- Scope: Prefilled editing for existing equipment business fields. No relocation or schema changes.
- Dependencies: Existing equipment schema, office role authorization, location editing pattern, immutable column grants.
- Allowed files: Backend src/app/actions/workspace.ts and docs/project/handoffs/CEV-EQUIPMENT-06-backend.md; Frontend src/app/workspaces/[tenantId]/customers/[customerId]/page.tsx and docs/project/handoffs/CEV-EQUIPMENT-06-frontend.md; Quality tests/security.test.ts and docs/project/handoffs/CEV-EQUIPMENT-06-quality.md. Coordinator task/status/verification records.
- Acceptance: Verified user/tenant office membership; validate IDs and input; verify customer/location/equipment chain scoped tenant; update only equipment business fields with tenant/location/equipment predicates; reject absent/cross-parent rows, protect read-only roles; prefilled accessible UI, safe errors, refresh detail. Type/lint/security tests/embedded SQL/build pass.
- Evidence: Independent source review, actual action boundary tests, browser presence/default booleans without customer values. Live save separate owner verification.
- State: assigned; unborn repository disjoint ownership, no commit authorized.

## Integration evidence
- Backend/Frontend handoffs complete; independent Quality review no findings.
- Full check type/lint77 checkpoint/embedded SQL/production build PASS exit0; final 103 tests PASS exit0; Quality final type/test lint PASS.
- Read-only browser confirmed Edit equipment form, five inputs/default name and type present, Save equipment button. No customer values extracted or live mutations.
- Browser also showed one location card and one dropdown option; owner mentions two separate service-location sections (existing/edit and add-new sections).
- State: implemented/reviewed. Live equipment save unverified; owner refreshes and uses Edit equipment then Save equipment.
