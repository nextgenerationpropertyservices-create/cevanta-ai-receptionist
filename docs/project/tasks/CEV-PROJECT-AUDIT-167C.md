# CEV-PROJECT-AUDIT-167C — Security and tenant-safety review

Owner: Quinn (Quality and Security)

## Scope

Perform an independent read-only review of authentication, workspace membership enforcement, destructive operations, tenant isolation, service-role usage, provider ingress, and sensitive-data handling. Rank concrete findings by severity and include exact file references and verification evidence.

## Dependencies

- Current source and Supabase migrations at commit `c9ddfd9` plus the in-progress CEV-PROJECT-AUDIT-167B diff when available.
- Existing embedded database and security tests.

## Allowed files

- `docs/project/reviews/CEV-PROJECT-AUDIT-167C-security.md`
- `docs/project/handoffs/CEV-PROJECT-AUDIT-167C-quinn.md`

Source, migration, fixture, and test files are read-only for this task. Implementation fixes require a new Morgan-owned task and explicit file ownership.

## Acceptance criteria

- Every protected mutation sampled is checked for authentication, tenant membership, role, input validation, and tenant-scoped record lookup.
- Service-role clients and provider ingress are checked for safe boundaries and trusted tenant mapping.
- Destructive actions and invitation/onboarding flows are reviewed.
- Findings clearly separate confirmed defects, design risks, and checks not run.
- Evidence contains no secrets or real customer data.

## Required evidence

- Read-only source review with file/line references.
- Relevant targeted tests or safe static searches.
- Completed review and handoff documents.

