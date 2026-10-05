# CEV-OPS-08 — Release verification and browser readiness

- Owner: DevOps; Morgan integrates and accepts.
- Scope: Review operations/release gates; validate configured anonymous browser suite, diagnose runner exit, ensure prerequisites/skips are truthful and sensitive artifacts disabled. No deployment or provider accounts.
- Dependencies: Current app and CEV-RELEASE-07 checks; calendar source arriving.
- Allowed files: playwright.config.ts, tests/e2e/foundation.spec.ts (transferred from Morgan), docs/project/OPERATIONS.md, docs/project/handoffs/CEV-OPS-08.md. Other files read-only.
- Acceptance criteria: Clean browser runner exit for available anonymous checks, failures not masked; authenticated missing prerequisites explicit skips; no traces/screenshots/error page dumps of real account/customer data in authenticated tests; reproducible private instructions and real remaining gates. No hosted CI/backup/deploy claim without execution.
- Required evidence: Exact commands/results, source review, clean browser runner and explicit live/hosted blockers; template handoff.
- State: assigned; disjoint ownership, unborn repository.
- Exact next action: Inspect current browser tests, protect sensitive failure artifacts, validate local configured anonymous tests and operations instructions.

## Named-chat execution blocker
Phoenix chat started but failed at the account usage limit before its independent operations handoff. No further writes were reported. Assigned review remains incomplete; no release acceptance claimed. Coordinator's earlier configured anonymous browser run passed clean exit0 (1 passed, 3 explicitly skipped). Authenticated failure-artifact handling still needs Phoenix review before running credential-dependent cases.
