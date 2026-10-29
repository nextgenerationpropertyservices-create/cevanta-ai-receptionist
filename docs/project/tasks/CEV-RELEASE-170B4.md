# CEV-RELEASE-170B4 — Invitation exchange response policy

- **Owner:** Blake (`backend_logic`)
- **Status:** Accepted locally with hosted database-backed exchange limitations
- **Scope:** Apply the fixed deny-all CSP and complete privacy/cache headers to every invitation continuation API response while preserving same-origin, bounds, cookie, status-only, no-CORS, and fail-closed behavior.
- **Dependencies:** Accepted CEV-RELEASE-170B1 contract.
- **Allowed files:** `src/app/api/invitations/continuations/route.ts`; `tests/invitation-continuations.test.ts`; `docs/project/handoffs/CEV-RELEASE-170B4-blake.md`.
- **Acceptance criteria:** Success and all representative 4xx/5xx responses share exact headers; CSP is fixed deny-all; no CORS; continuation cookie unchanged; no body/auth/tenant contract change.
- **Required evidence:** Focused API tests, typecheck/lint, handoff, no deploy/migration.

