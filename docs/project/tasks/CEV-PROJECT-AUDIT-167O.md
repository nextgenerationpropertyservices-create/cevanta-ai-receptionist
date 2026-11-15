# CEV-PROJECT-AUDIT-167O — Align invitation token digest

- **Owner:** Blake (`backend_logic`)
- **Status:** Ready
- **Scope:** Repair the invitation issuer so it hashes the canonical decoded 32 token bytes exactly as the accepted onboarding SQL contract does, instead of hashing the 43-character base64url text. Add deterministic regression evidence. Do not change invitation delivery or URL transport in this task.
- **Dependencies:** CEV-PROJECT-AUDIT-167C confirmed the issuer/acceptor digest mismatch. Secure token transport remains separately blocked by CEV-PROJECT-AUDIT-167P.
- **Allowed files:**
  - `src/app/actions/invitations.ts`
  - one focused invitation action test under `tests/`
  - `docs/project/handoffs/CEV-PROJECT-AUDIT-167O-blake.md`
- **Acceptance criteria:**
  1. A canonical 43-character base64url invitation token is decoded to exactly 32 bytes before SHA-256 hashing.
  2. The digest sent to `issue_client_invitation` matches the database `onboarding_private.token_digest` algorithm for a fixed fictional token and differs from the prior UTF-8-text digest.
  3. Invalid/noncanonical tokens cannot reach issuance.
  4. Plaintext tokens and digests are not logged, persisted in source, or added to errors/test output.
  5. Existing internal-operator authorization, recipient binding, seven-day expiry, safe result mapping, and copy-once behavior remain unchanged.
  6. Focused tests, typecheck, lint, full Vitest, and production build pass.
- **Required reviewer:** Quinn (`quality_security`). Invitation release remains blocked until the separate query-string transport finding is resolved.
- **Required evidence:** Fixed-vector digest test, captured RPC input assertion, invalid-token test, secret-output scan, commands/results, and rollback instructions.

