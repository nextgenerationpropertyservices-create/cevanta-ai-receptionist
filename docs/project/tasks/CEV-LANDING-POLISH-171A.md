# CEV-LANDING-POLISH-171A — Straight landing proof card

- **Owner:** Nova (`frontend_ux`)
- **Status:** Assigned
- **Scope:** Remove the rotated/crooked appearance from the public landing hero's sample-call proof card while preserving its hierarchy, depth, responsiveness, and reduced-motion/accessibility behavior.
- **Dependencies:** Owner screenshot and request on 2026-10-29; current preview branch `codex/release-170c-preview-20261029`.
- **Allowed files:** `src/app/globals.css`; `tests/landing-page.test.ts`; `docs/project/handoffs/CEV-LANDING-POLISH-171A-nova.md`.
- **Acceptance criteria:** Proof card is level at desktop and mobile widths; no clipping/overflow; hero remains balanced and readable; focused landing tests, typecheck, and lint pass; preview-only deployment evidence is recorded separately by Morgan/Phoenix.
- **Required evidence:** Before/after CSS, focused tests, responsive browser observations, limitations, rollback, no-production statement.
