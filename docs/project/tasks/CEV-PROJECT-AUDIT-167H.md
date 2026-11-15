# CEV-PROJECT-AUDIT-167H — Launch evidence trust contract review

Owner: Atlas (Software Architect and Data)

## Scope

Review the contract between client-editable onboarding milestones, secure Retell route health, provisioning readiness, and final client activation. Define the smallest tenant-safe design that prevents a client owner/admin from self-attesting provider verification or launch approval while still allowing the internal Cevanta operator to manage launch evidence.

This is an architecture review only. Do not edit source, migrations, or shared contracts in this task.

## Dependencies

- CEV-PROJECT-AUDIT-167D integration review.
- Existing `client_onboarding_milestones`, managed-client relationships, `buildProvisioningReadiness`, and Retell mapping health.
- Current CEV-PROJECT-AUDIT-167E UI labels treat milestones as recorded evidence, not provider telemetry.

## Allowed files

- `docs/project/reviews/CEV-PROJECT-AUDIT-167H-launch-evidence-contract.md`
- `docs/project/handoffs/CEV-PROJECT-AUDIT-167H-atlas.md`

All source, migrations, tests, and configuration are read-only.

## Acceptance criteria

- Identify who may record payment, setup, test-call, Retell, Make, and launch evidence.
- Define how an internal operator proves authority over the client workspace without trusting a client-supplied operator tenant ID.
- Resolve the contradiction between milestone records and the hard-coded blocked test/activation gates.
- Specify RLS/RPC, audit, idempotency, and recovery requirements for a follow-up implementation task.
- Preserve office-review mode and avoid enabling any provider side effect.

## Required evidence

- File/line references to the current milestone action, RLS/migration, managed-client relationship, readiness builder, and UI consumers.
- Explicit recommendation, risks, forward migration/recovery notes, and required Quality tests.
- Completed review and handoff documents.

