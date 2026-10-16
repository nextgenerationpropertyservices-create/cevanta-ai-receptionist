# CEV-BILLING-LINKS-131A

- **Owner:** Blake (backend_logic) with Nova (frontend_ux), coordinated by Morgan
- **Scope:** Add an internal owner dashboard action that creates a Stripe-hosted payment link for a connected client workspace's adjustable setup fee or monthly pilot payment.
- **Dependencies:** Existing internal managed-client relationship, Supabase membership checks, Stripe server environment variable.
- **Allowed files:** `src/app/actions/stripe-payment-links.ts`, `src/app/workspaces/[tenantId]/clients/page.tsx`, `src/app/globals.css`, this task file, and the matching handoff.
- **Acceptance criteria:**
  1. Only authenticated internal owner/admin members can create requests for their connected client workspaces.
  2. The server creates Stripe Product, Price, and Payment Link objects without exposing the key or handling card details.
  3. Setup and monthly amounts default to the approved pilot offer ($497 and $297), but are adjustable per request.
  4. Amounts are validated server-side from $1.00 through $1,000,000.00 and the selected amount is used for the Stripe Price.
  5. Requests use Stripe idempotency keys and validate the returned hosted link before showing it.
  6. The dashboard shows a copy/open link only after Stripe confirms creation; missing Stripe configuration produces a safe message.
  7. No subscription, payment capture, SMS, calendar, booking, or dispatch side effect occurs inside Cevanta.
- **Reviewers:** Morgan acceptance; Quinn security review.
- **Required evidence:** Focused UI/type/lint tests and a Stripe test-mode proof with no card data stored in Cevanta.
