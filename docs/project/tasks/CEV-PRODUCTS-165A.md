# CEV-PRODUCTS-165A — Cevanta product catalog

Owner: Morgan (Product Manager and Orchestrator)

## Scope

Add a client-safe product catalog to each workspace so Cevanta can package three products as stand-alone offers or optional add-ons:

1. No-Leak Quote Follow-Up
2. Commercial Maintenance Agreement Reactivator
3. Blueprint & Scope Intake

This slice is a presentation and workflow entry point. It must explain what each product does, what data it needs, and what remains off until integrations, approvals, test evidence, and rollback notes are complete.

## Dependencies

- Existing workspace membership and office-role checks.
- Existing Reactivation page and Integration readiness controls.
- No new database or provider contract is required for the catalog.

## Allowed files

- `src/lib/product-catalog.ts`
- `src/app/workspaces/[tenantId]/products/page.tsx`
- `src/components/workspace-shell.tsx`
- `src/app/globals.css`
- `tests/products-ui.test.ts`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/handoffs/CEV-PRODUCTS-165A-morgan.md`

## Acceptance criteria

- Office users can open a Products page from the workspace navigation.
- Each product is clearly labeled as stand-alone and/or add-on, with an outcome, inputs, current safe state, and next step.
- The Reactivator links to the existing guarded campaign workflow; other products link to controlled Integrations/readiness rather than claiming live automation.
- The page does not promise automatic booking, outbound messages, payment collection, document extraction, or provider writes.
- Client-facing language avoids implementation jargon and is readable on mobile.
- Tests, lint, typecheck, and production build pass.

## Required evidence

- `pnpm test -- tests/products-ui.test.ts` (configured Vitest run)
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build` (use webpack fallback if the OneDrive Turbopack worker fails; record the result)
- No production deployment in this task.
