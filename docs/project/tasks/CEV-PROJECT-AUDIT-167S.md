# CEV-PROJECT-AUDIT-167S — Keep Stripe payment results out of URL queries

- **Owner:** Blake (`backend_logic`)
- **Status:** Accepted with limitations after Backend implementation and independent Quality review
- **Scope:** Return the validated Stripe-hosted payment result directly to an authorized in-page form state instead of redirecting the payment URL, client name, payment type, and amount through the Clients-page query string. Add bounded Stripe transport timeouts while preserving manual payment confirmation and existing internal-operator checks.
- **Dependencies:** CEV-PROJECT-AUDIT-167C sensitive-data review and CEV-PROJECT-AUDIT-167D provider timeout review. No database or subscription change.
- **Allowed files:**
  - `src/app/actions/stripe-payment-links.ts`
  - `src/app/workspaces/[tenantId]/clients/page.tsx`
  - one new colocated client component under `src/app/workspaces/[tenantId]/clients/`
  - one new focused Stripe action test under `tests/`
  - `tests/managed-clients.test.ts`
  - `docs/project/handoffs/CEV-PROJECT-AUDIT-167S-blake.md`
- **Acceptance criteria:**
  1. Successful Stripe link, client name, payment label, and amount are returned only in authorized server-action state and never placed in a redirect/query string.
  2. The Clients page no longer reads or renders `payment_link`, `payment_client`, `payment_type`, or `payment_amount` search parameters.
  3. The displayed link is restricted to validated `https://buy.stripe.com/` or `https://checkout.stripe.com/` URLs and uses safe external-link attributes.
  4. A new request ID is used after each successful creation; failed partial requests retain the original idempotency key for a safe retry.
  5. Each Stripe request, including response-body parsing, has a bounded abort deadline, returns a safe redacted error, and is not automatically retried.
  6. Existing internal owner/admin, internal-tenant, managed-client, amount, and Stripe-host validation remain enforced.
  7. No subscription, payment webhook, automatic billing, provider logging, or payment-status claim is added.
  8. Focused positive/denied/timeout/invalid-provider tests, typecheck, lint, full Vitest, and production build pass.
- **Required reviewer:** Quinn (`quality_security`).
- **Required evidence:** Absence of query transport, action-state and idempotency tests, stalled header/body timeout tests, secret-output scan, commands/results, limitations, and rollback notes.

