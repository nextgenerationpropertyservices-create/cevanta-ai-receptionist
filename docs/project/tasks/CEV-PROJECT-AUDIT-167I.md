# CEV-PROJECT-AUDIT-167I — Bound Make integration requests

- **Owner:** Blake (`backend_logic`)
- **Status:** Assigned
- **Scope:** Add interruptible time limits to the existing Make lead-ingress body read and Make management API request so stalled provider traffic fails safely instead of hanging. Preserve all current authentication, tenant mapping, validation, deduplication, and redacted-error behavior.
- **Dependencies:** CEV-PROJECT-AUDIT-167D integration review. No schema or shared-contract change is authorized.
- **Allowed files:**
  - `src/app/api/integrations/make/retell-lead/route.ts`
  - `src/lib/server/make-management.ts`
  - `tests/make-retell-lead-ingress.test.ts`
  - `tests/make-management.test.ts`
  - `docs/project/handoffs/CEV-PROJECT-AUDIT-167I-blake.md`
- **Acceptance criteria:**
  1. A request body whose next read never resolves is interrupted within the existing Make ingress time budget and returns the existing safe timeout response.
  2. Make management API calls have a bounded timeout and return a safe, non-secret error when the provider does not respond.
  3. No automatic retry is added to credential-request creation because its provider-side idempotency behavior is not established.
  4. Existing authentication, tenant mapping, payload validation, and duplicate behavior remain unchanged.
  5. Focused positive, timeout, and regression tests pass.
  6. A handoff records exact checks, limitations, risks, and rollback steps.
- **Required reviewers:** Quinn (`quality_security`) for final cross-module/security acceptance through the parent audit.
- **Required evidence:** Focused test command/results, `pnpm typecheck`, `pnpm lint`, and a source review confirming no credential or provider-payload logging was added.

