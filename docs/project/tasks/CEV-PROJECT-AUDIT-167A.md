# CEV-PROJECT-AUDIT-167A — Whole-project review and improvement

Owner: Morgan (Product Manager and Orchestrator)

## Scope

Review the current Cevanta application as a complete product, coordinate specialist audits, integrate one high-value client-safe improvement, and produce a prioritized improvement plan grounded in the actual implementation.

The review must distinguish:

- features that work in the application today;
- features that are guarded or require owner approval;
- features that are presentation/design only;
- provider work that still depends on Retell, Make, email, SMS, calendar, billing, or other external configuration.

## Dependencies

- Current source at commit `c9ddfd9`.
- Existing product catalog and Seasonal Maintenance Reactivator.
- Existing authentication, workspace membership, role checks, and RLS policies.
- Specialist tasks CEV-PROJECT-AUDIT-167B, CEV-PROJECT-AUDIT-167C, and CEV-PROJECT-AUDIT-167D.

## Allowed files

- `docs/project/tasks/CEV-PROJECT-AUDIT-167A.md`
- `docs/project/tasks/CEV-PROJECT-AUDIT-167B.md`
- `docs/project/tasks/CEV-PROJECT-AUDIT-167C.md`
- `docs/project/tasks/CEV-PROJECT-AUDIT-167D.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/handoffs/CEV-PROJECT-AUDIT-167A-morgan.md`
- New follow-up task records created by Morgan after specialist findings identify exact file ownership.

## Acceptance criteria

- The current product is reviewed across usability, security, tenant isolation, integrations, reliability, and release readiness.
- Claims about working features match the implementation and available evidence.
- At least one high-value, low-risk client-facing improvement is implemented and tested through a separately assigned specialist task.
- Findings are ranked by customer impact and operational risk.
- Required Architect or Quality reviews are recorded before accepting shared-contract, migration, security-sensitive, or cross-module changes.
- No production deployment occurs without a new explicit owner approval.

## Required evidence

- Specialist review records and handoffs.
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`, or an exact documented local environmental blocker plus an independent successful build of the same candidate.

