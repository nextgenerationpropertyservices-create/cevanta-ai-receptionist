# CEV-OVERVIEW-WIDGETS-127A

- **Owner:** Morgan (coordinator)
- **Scope:** Add browser-scoped overview widget personalization, including per-card sizing, and make the top-bar More menu close when a user clicks outside it or presses Escape.
- **Dependencies:** Existing workspace navigation and overview dashboard contracts.
- **Allowed files:** `src/components/dashboard-widgets.tsx`, `src/components/workspace-nav.tsx`, `src/app/workspaces/[tenantId]/page.tsx`, `src/app/globals.css`, focused UI tests, this task record, and the handoff record.
- **Acceptance criteria:**
  1. An authenticated workspace owner can enter overview edit mode, reorder visible cards with drag/drop or keyboard arrows, resize each card as small/medium/large, hide/show cards, and reset the layout.
  2. When not editing, each overview card opens its relevant workspace page by click or keyboard activation; controls and links inside the card remain usable.
  3. Layout preferences are isolated by workspace in browser storage and do not change server data or permissions.
  4. The urgent attention banner remains visible outside the editable cards.
  5. The More menu closes on outside pointer interaction and Escape while preserving active navigation styling.
  6. Type checking, lint, focused UI tests, and a production build pass.
- **Required evidence:** Focused workspace shell and dashboard UI tests, typecheck, lint, production build, and preview deployment readiness.
