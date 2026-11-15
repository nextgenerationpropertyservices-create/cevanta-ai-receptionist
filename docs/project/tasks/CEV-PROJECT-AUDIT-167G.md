# CEV-PROJECT-AUDIT-167G — CI coverage alignment

Owner: Phoenix (DevOps and Release)

## Scope

Align the GitHub application-check workflow with the repository's current full verification command so new onboarding, provisioning, managed-client, Retell-ingress, and migration suites cannot silently fall outside hosted CI.

## Dependencies

- Existing `pnpm check` script in `package.json`.
- Existing independent disposable Supabase tenant-isolation job.
- No deployment, provider, database, or environment-value changes.

## Allowed files

- `.github/workflows/ci.yml`
- `docs/project/handoffs/CEV-PROJECT-AUDIT-167G-phoenix.md`

## Acceptance criteria

- Hosted application checks execute the maintained full verification command or an equivalent complete set without obvious drift.
- Agent validation remains explicit.
- The disposable Supabase tenant-isolation job remains separate and unchanged unless a documented defect requires correction.
- The workflow does not deploy, expose secrets, or target a hosted production database.
- YAML remains valid and the local verification command is executed successfully or an exact blocker is recorded.

## Required evidence

- Diff review of `.github/workflows/ci.yml` against `package.json` scripts.
- `pnpm check` result, or the exact local environmental blocker.
- Completed handoff using `docs/templates/AGENT_HANDOFF.md`.

