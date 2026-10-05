# Onboarding disposable environment prerequisite inventory

- Task ID: CEV-ONBOARD-ENV-59.
- Owner: Phoenix owns operational/environment inventory. Morgan coordinates and accepts. Atlas reviews migration/catalog assumptions if any hosted-state recommendation is made. Quinn uses the result later but does not accept runtime evidence in this task.
- State: accepted with limitations.
- Scope: Convert Phoenix55, Atlas56, Blake57 and current project status into a concrete no-secret environment readiness checklist for future credentialed onboarding browser/JWT/PostgREST/HTTP tests. Identify exact fictional accounts, role memberships, tenant fixtures, migration/advisor evidence, local preview/browser prerequisites, safe evidence rules, and which checks can run without additional owner/provider access. Documentation and read-only local inspection only.
- Dependencies: CEV-ONBOARD-LIVE-PREREQ-55, CEV-ONBOARD-GAP-56, CEV-ONBOARD-BACKEND-GAP-57 and CEV-ONBOARD-STATUS-54 accepted with limitations.
- Allowed files: docs/project/ONBOARDING_ENVIRONMENT_READINESS.md; docs/project/handoffs/CEV-ONBOARD-ENV-59-phoenix.md. No other writes unless Morgan transfers ownership.
- Prohibited/shared files: No source code, tests, package scripts, migrations, provider settings, hosted database changes, credential files, screenshots, traces, videos, production deployment, real customer data, external writers or live provider calls. Do not request or store secret values.
- Acceptance criteria: The document states exact prerequisites, safe local commands to run later, pass/skip interpretation, redaction rules, environment blockers, and the difference between local anonymous, disposable authenticated, hosted/live and production evidence. It must not claim any live gate passed.
- Required evidence: Phoenix handoff using docs/templates/AGENT_HANDOFF.md with files changed, checks/skips, limitations, risks, rollback notes and exact next action.
- Reviewers: Morgan accepts. Atlas review required only if Phoenix makes hosted migration/catalog conclusions.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Use this checklist for future credentialed browser, JWT/PostgREST and HTTP evidence tasks.
