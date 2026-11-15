# CEV-RELEASE-170B3 — Invitation document nonce wiring

- **Owner:** Nova (`frontend_ux`)
- **Status:** Accepted locally with hosted-browser limitations
- **Scope:** Make `/invite` explicitly dynamic, read only the proxy nonce on the server, and nonce the existing first bootstrap script without moving it or exposing invitation identifiers.
- **Dependencies:** Accepted CEV-RELEASE-170B1 contract.
- **Allowed files:** `src/app/invite/page.tsx`; `src/app/invite/invitation-bootstrap.tsx`; `src/app/invite/invitation-bootstrap-status.tsx`; `tests/invitation-ui.test.ts`; `tests/e2e/invitation-continuation.spec.ts`; `docs/project/handoffs/CEV-RELEASE-170B3-nova.md`.
- **Acceptance criteria:** Bootstrap remains first executable invitation element; valid nonce reaches only its script attribute; page is dynamic; no fragment/token/request/tenant/email/role/return URL enters props/DOM/storage/errors; missing nonce fails safely; browser history/privacy behavior remains.
- **Required evidence:** Focused UI/browser tests, typecheck/lint, handoff, no deploy/migration.

