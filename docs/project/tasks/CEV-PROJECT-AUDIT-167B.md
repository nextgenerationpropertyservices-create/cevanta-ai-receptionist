# CEV-PROJECT-AUDIT-167B — Product catalog clarity and starter offer

Owner: Nova (Frontend and UX)

## Scope

Improve the authenticated Products page so a client or Cevanta operator can immediately understand what is available now, what requires setup and approval, and what is still planned. Add a low-friction Lead Rescue Starter offer that can introduce clients to Cevanta without implying that unbuilt provider automation is live.

## Dependencies

- Existing product catalog contracts in `src/lib/product-catalog.ts`.
- Existing Products page and workspace navigation.
- No new database, provider, or shared persistence contract.

## Allowed files

- `src/lib/product-catalog.ts`
- `src/app/workspaces/[tenantId]/products/page.tsx`
- `tests/products-ui.test.ts`
- `docs/project/handoffs/CEV-PROJECT-AUDIT-167B-nova.md`

## Acceptance criteria

- Products are grouped or labeled using plain-language states: available now, available with setup/approval, or planned.
- The page never presents design-only automation as operational.
- Lead Rescue Starter is positioned as a limited, low-risk entry offer with explicit scope and an upgrade path.
- The current Seasonal Maintenance Reactivator retains its guarded workflow link.
- The page is readable on mobile, keyboard accessible, and does not add provider side effects.
- Relevant focused tests pass.

## Required evidence

- `pnpm test -- tests/products-ui.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- Completed handoff using `docs/templates/AGENT_HANDOFF.md`.

## Reviewers

- Morgan for product acceptance.
- Quinn for claim and safety review as part of CEV-PROJECT-AUDIT-167C.

