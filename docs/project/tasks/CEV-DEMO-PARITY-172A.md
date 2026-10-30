# CEV-DEMO-PARITY-172A — Client-facing demo dashboard parity

- **Owner:** Nova (`frontend_ux`)
- **Status:** Assigned
- **Scope:** Rebuild the public `/demo-dashboard` route so it closely mirrors the authenticated client workspace Overview in layout, navigation feel, attention hierarchy, summary cards, office queue, dispatch coverage, calendar pulse, ROI, and next actions. Use fictional trade-service data only. Remove all internal talk tracks, presenter scripts, close scripts, implementation prompts, credentials, provider controls, and operator-only language. Retain truthful boundaries and client-facing calls to action.
- **Dependencies:** Current authenticated overview in `src/app/workspaces/[tenantId]/page.tsx`; current public demo route; accepted dark/light theme and responsive workspace visual language; owner request on 2026-10-29.
- **Allowed files:** `src/app/demo-dashboard/page.tsx`; demo-specific rules in `src/app/globals.css`; `tests/demo-dashboard-ui.test.ts`; `docs/project/handoffs/CEV-DEMO-PARITY-172A-nova.md`.
- **Acceptance criteria:**
  1. Demo visually and structurally resembles the real client Overview without copying authenticated controls or exposing internal information.
  2. Client-facing top navigation, attention queue, summary metrics, lead queue, field-team workload, calendar pulse, ROI context, and clear CTA are present.
  3. All records are obviously fictional and no internal talk track, sales script, prompt, credential, webhook, tenant ID, provider secret, billing page, or operator-only control appears.
  4. Copy accurately states that booking, messages, calendar writes, payments, and dispatch require client-specific approval/testing.
  5. Desktop and 390px mobile layouts are readable, keyboard-accessible, and free of horizontal overflow.
  6. Focused tests, typecheck, lint, and production build pass.
- **Required evidence:** Before/after route structure, focused/full checks, responsive browser observations, secret/PII scan, limitations, rollback, and no-production statement.

