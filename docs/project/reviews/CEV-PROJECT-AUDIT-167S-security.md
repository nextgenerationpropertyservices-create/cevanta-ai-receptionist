# CEV-PROJECT-AUDIT-167S — Quality and security review

Date: 2026-10-26  
Reviewer: Quinn (Quality and Security)

## Decision

**PASS WITH LIMITATIONS.** The implementation closes the reviewed URL-query privacy issue, preserves the internal operator and exact managed-client authorization boundary, strictly validates returned Stripe-hosted URLs twice, bounds each provider request through response-body parsing, and preserves one idempotency request across in-page failures while rotating only after success. It does not add a subscription, recurring charge, webhook, automatic payment confirmation, payment-status claim, retry loop, or provider logging.

This approval covers the local manual one-time payment-link generator only. It is not evidence that a live Stripe account can create or complete a checkout, and it does not make billing or payment reconciliation complete.

## Findings

No blocking defect was found in the final assigned diff.

### Authorization and tenant scope

- Input is parsed as exact UUID/payment/amount fields before provider access (`src/app/actions/stripe-payment-links.ts:11-18,91-96`).
- The action requires owner/admin membership in the selected operator tenant, independently verifies that tenant is `internal`, verifies the exact `(operator_tenant_id, client_tenant_id)` managed relationship, and reads the client name server-side (`:98-107`).
- The explicit negative test proves an absent managed relationship returns a safe error before any Stripe fetch, while still checking both tenant filters (`tests/stripe-payment-links.test.ts:122-132`).
- Membership denial and a non-internal operator also fail before provider access without returning private error details (`tests/stripe-payment-links.test.ts:105-119`).

### Query transport and rendering

- The action no longer redirects. A successful result is returned only in the authorized server-action state (`stripe-payment-links.ts:140-150`).
- The Clients page no longer declares, reads, or renders the four prior payment-result search parameters (`src/app/workspaces/[tenantId]/clients/page.tsx:174,214`).
- A direct legacy-query injection test proves the old URL values do not render (`tests/managed-clients.test.ts:110-128`).
- The link exists only in current component state and disappears on navigation/refresh. That is an intentional privacy boundary, not persisted payment state.

### Strict hosted-link validation

- Both server and client parse with `URL`, require `https:`, no port, no username/password, and an exact hostname of `buy.stripe.com` or `checkout.stripe.com` (`stripe-payment-links.ts:78-89,137-138`; `stripe-payment-request-form.tsx:11-24,36-43`).
- A sibling attacker hostname is rejected. The rendered external link uses `target="_blank"`, `rel="noopener noreferrer"`, and `referrerPolicy="no-referrer"` (`tests/stripe-payment-links.test.ts:135-143,208-217`).

### Timeout and failure behavior

- Each product, price, and link request has one five-second deadline spanning both fetch headers and `response.json()`; timeout aborts, returns a fixed redacted error, clears the timer, and never automatically retries (`stripe-payment-links.ts:39-75`).
- Focused tests prove one-call/no-retry stalled-header and stalled-body behavior, abort state, timer cleanup, and no private provider detail in the result (`tests/stripe-payment-links.test.ts:146-183`).
- Stripe can still finish a request after local abort if it ignores cancellation. The operator should check Stripe before abandoning that attempt or starting a new request.

### Idempotency and product boundary

- Product, price, and link use deterministic keys derived from the submitted request ID and payment type (`stripe-payment-links.ts:109-135`).
- The client retains that request ID after a partial failure and generates a new one only after the action reports success for the same ID (`stripe-payment-request-form.tsx:26-34,46-55`). Focused replay evidence confirms the same product/price keys after partial failure and rotation after success (`tests/stripe-payment-links.test.ts:185-206`).
- The monthly choice is labeled and created as a one-time first-month payment. The price request contains no recurring interval (`stripe-payment-links.ts:109,123-124`; `tests/stripe-payment-links.test.ts:84-103`).
- No subscription, webhook, automatic billing, payment collection claim, or payment-completion state was introduced. The UI explicitly tells the operator to confirm payment in Stripe (`stripe-payment-links.ts:142`; `stripe-payment-request-form.tsx:40-42`; `clients/page.tsx:214`).

## Independent evidence

- `pnpm exec vitest run --configLoader native tests/stripe-payment-links.test.ts tests/managed-clients.test.ts` — PASS, 2 files / 26 tests after the requested unconnected-client negative case was added.
- Static scan of the Clients page/component for `payment_link|payment_client|payment_type|payment_amount` — PASS, no matches.
- Static scan of assigned source/tests for common Stripe credential prefixes — PASS, no matches.
- Source inspection found no `console` provider logging, redirect, recurring price field, subscription call, webhook, or automatic payment-status mutation in the assigned implementation.
- Blake's handoff reports full Vitest 55 files / 916 tests, typecheck, lint, diff check, and a fresh non-OneDrive webpack production build PASS. The added managed-client negative assertion was rerun independently in the 26-test focused suite after that full run.

## Limitations and remaining risks

1. No live Stripe test-mode or production checkout was run; provider health, account permissions, resource creation, checkout completion, and payout behavior are unverified.
2. Payment completion is not stored or reconciled. The operator must confirm it in Stripe; legacy milestones remain untrusted launch evidence.
3. A successful new request creates a separate product, price, and payment link. There is no cleanup/catalog policy.
4. Refreshing after a partial provider failure loses the browser-held request ID. Check Stripe before starting a new attempt to avoid parallel resources.
5. The in-workspace Turbopack build remains blocked by the known OneDrive worker problem; the reviewed build evidence is Blake's clean temporary webpack build.

## Exact next action

Morgan may accept CEV-PROJECT-AUDIT-167S as the local manual-link privacy/timeout repair. Keep payment status manual and do not describe this as subscription billing or automatic payment confirmation. Before offering the feature to a real client, run one fictional Stripe test-mode request/checkout, verify the exact hosted link and operator recovery steps, and retain manual confirmation language.
