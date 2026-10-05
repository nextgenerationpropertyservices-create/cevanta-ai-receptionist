# Browser verification and operations readiness

- Task ID: CEV-AUTO-16-ops
- Owner: Phoenix — DevOps and Release
- State: reviewed; local browser/configuration scope accepted, hosted release gates open
- Scope: Complete prior CEV-OPS-08 review; strengthen foreign-tenant browser assertions; document reproducible preview network requirements, hosted migration-history reconciliation and remaining release gates.
- Dependencies: Quinn readiness finding Q16-01; existing browser suites; owner session remains private and is not an automated credential source.
- Allowed files: playwright.config.ts, tests/e2e/foundation.spec.ts, docs/project/OPERATIONS.md, docs/project/handoffs/CEV-AUTO-16-ops.md.
- Ownership transfer: Prior CEV-OPS-08 named chat reported no edits; these same paths remain Phoenix owned. Other specialists own different files.
- Acceptance criteria: Foreign tenant test asserts safe denial, not merely missing create button or own-tenant name; authenticated failure artifacts stay disabled; anonymous suite runs cleanly where environment allows; skips and hosted/restore/history gates explicit. No relaxed authorization or automated credential extraction.
- Required evidence: Tests/inspection, safe runner results, type/lint/build integration; exact approved manual history process if known, never assume SQL editor execution registered CLI history.
- Reviewers: Quinn read-only independent security review; Quinn owns only docs/project/handoffs/CEV-AUTO-16-ops-quality.md. Morgan integration.
- Prohibited/shared files: App code, existing migration/source updates, package/CI files, credentials, provider/hosted settings, production/deployment writes.
- Branch/worktree or ownership fallback: Disjoint ownership, no commit.
- Evidence: Phoenix anonymous browser suite exit0:1 passed,3 skipped; Quinn independent approval. Coordinator full check and final build passed. Separate CEV-AUTO-16-dev-origin gives Phoenix sole ownership of next.config.ts; no expansion of this task's allowed paths.
- Exact next action: Complete separate live role/JWT, hosted CI, restore and migration-history gates before release acceptance.
