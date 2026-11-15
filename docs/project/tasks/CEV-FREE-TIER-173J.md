# CEV-FREE-TIER-173J — Guard regression test repairs

- Status: assigned after 173H verification exposed stale mocks
- Owner: Blake (`backend_logic`)
- Scope: Update existing action tests for the authoritative plan preflight introduced by 173G without weakening assertions.
- Dependencies: CEV-FREE-TIER-173G and 173H.
- Allowed files:
  - `tests/reactivation-actions.test.ts`
  - `tests/automation-controls-server.test.ts`
  - `tests/make-authorization-actions.test.ts`
  - `tests/retell-provisioning.test.ts`
  - `docs/project/handoffs/CEV-FREE-TIER-173J-blake.md`
- Acceptance criteria:
  - Managed-plan success and prior authorization behavior remain covered.
  - Free/unavailable plan paths fail before mutation/provider calls.
  - All four focused suites pass.
- Reviewers: Quinn.
- Required evidence: focused tests, lint, handoff.
