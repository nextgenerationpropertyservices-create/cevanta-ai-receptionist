# Agent handoff
- Task ID: CEV-BILLING-LINKS-131A
- Work completed: Added an internal Clients dashboard form for adjustable setup and monthly payment requests, defaulting to $497 and $297. The server action verifies internal owner/admin membership, verifies the client relationship, validates the selected amount from $1.00 through $1,000,000.00, creates Stripe Product/Price/Payment Link objects with idempotency keys, validates the hosted Stripe URL, and returns it to the dashboard. Cevanta never receives card details and does not auto-charge or mark payment as paid.
- Files changed: `src/app/actions/stripe-payment-links.ts`, `src/app/workspaces/[tenantId]/clients/page.tsx`, `src/app/globals.css`, `docs/project/tasks/CEV-BILLING-LINKS-131A.md`, `docs/project/handoffs/CEV-BILLING-LINKS-131A-morgan.md`.
- Database changes: None.
- API or contract changes: Stripe REST API calls from a server action only; no public API contract added.
- Verification commands and results: `pnpm exec vitest run tests/billing-ui.test.ts tests/managed-clients.test.ts tests/workspace-shell-ui.test.ts` passed (14 tests); `pnpm typecheck` passed; `pnpm lint` passed; `git diff --check` passed. `pnpm build` was attempted but hit the existing Windows/OneDrive Turbopack process panic while parsing `src/app/globals.css`.
- Preview deployment: Preview deployment: READY at https://cevant-git-245e81-nextgenerationpropertyservices-1486s-projects.vercel.app from commit `86331c25ff2721292c573847e95c9e795e11f3a4`.
- Known limitations: Requires `STRIPE_SECRET_KEY` in server-only Vercel environment variables. Stripe test-mode/live provider proof is not yet run. Payment status is still manually confirmed in Stripe.
- Risks: Creating a link creates Stripe objects; repeated attempts are protected per request ID, but each new request ID intentionally creates a new link.
- Rollback notes: Remove the payment request panel/action and revoke unused Stripe links in Stripe.
- Exact next action: Run focused tests, configure Stripe test mode, perform one fictional test-mode request, confirm the hosted link opens, then approve production environment setup separately.

