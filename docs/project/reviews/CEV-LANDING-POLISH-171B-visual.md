# CEV-LANDING-POLISH-171B — Independent visual regression review

Date: 2026-10-29
Reviewer: Quinn (`quality_security`)
Decision: **PASS WITH LIMITATIONS**

## Scope reviewed

The review covered only the public landing hero proof card change from CEV-LANDING-POLISH-171A:

- `src/app/globals.css`: `.landing-proof-window` changed from `transform:rotate(2deg)` to `transform:none`.
- `tests/landing-page.test.ts`: added a focused regression assertion for a level, responsive proof card.

No application behavior, authentication, tenant data, database contract, provider integration, or protected route changed in this slice.

## Findings

### Level alignment and responsive containment

Pass.

- Desktop at 1280 × 800: computed transform was `none`; the card measured 480px wide and remained inside the viewport at 733.16–1213.16px. Document width equaled viewport width at 1280px.
- Narrow mobile at 390 × 844: computed transform was `none`; the card measured 354px wide and remained inside the viewport at 18–372px. Document width equaled viewport width at 390px.
- Both call-copy blocks stayed inside the card at both widths. No horizontal clipping or page overflow was detected.
- A local desktop screenshot inspection showed the card level, balanced with the hero copy, and no longer visually tilted.

### Readability

Pass.

- The card retained its dark `rgb(16, 44, 59)` surface.
- Both call responses rendered as `rgb(244, 250, 244)` and were fully visible at desktop and mobile widths.
- Headline, call labels, fictional-example marker, proof chips, and CTA copy remained present. No public wording changed in this task.

### CTA and keyboard focus behavior

Pass.

- Hero primary action remained visible and linked to `/sign-up` with the text `Start your setup`.
- Hero secondary action remained visible and linked to `#watch` with the text `Watch the call`.
- At 390px, both actions retained a visible 3px solid focus outline with a 4px offset. The change did not alter their order, destinations, or interaction behavior.

### Public-route regression

Pass locally.

- The focused landing suite passed all four tests, including plain-language copy, supported-action boundaries, public contrast guards, CTA targets, and the new level-card rule.
- The production build completed and generated `/` as static content along with the existing public and protected routes.
- The reviewed diff is limited to one CSS declaration and one focused regression test.

## Verification evidence

- `node node_modules/vitest/vitest.mjs run --configLoader native tests/landing-page.test.ts` — PASS, 1 file / 4 tests.
- `node node_modules/typescript/bin/tsc --noEmit` — PASS.
- `node node_modules/eslint/bin/eslint.js .` — PASS.
- `node node_modules/next/dist/bin/next build --webpack` — PASS with Next.js 16.3.8; all routes generated.
- Local Chromium layout check against the development server at 1280 × 800 and 390 × 844 — PASS for `transform:none`, viewport containment, call-copy containment, CTA visibility/targets, and primary CTA focus.
- Local Chromium focus check against the production server at 390 × 844 — PASS for both hero CTAs; each showed a 3px solid outline and 4px offset.
- Local in-app-browser screenshot inspection at desktop width — PASS; the proof card was visibly level and readable.
- `git diff --check -- src/app/globals.css tests/landing-page.test.ts` — PASS; only line-ending warnings were reported by Git.
- Reviewed-diff scan for credential, token, password, service-role, bearer, and common owner-email patterns — no match.

## Defects and severity

No defect was found in the reviewed change. Severity: **none**.

To reproduce the reviewed state:

1. Start the current local application.
2. Open `/` at 1280 × 800, then at 390 × 844.
3. Inspect `.landing-proof-window`; its computed transform should be `none` and its right edge should remain inside the document width.
4. Focus `Start your setup` and `Watch the call`; each should show a visible focus ring and retain `/sign-up` and `#watch` respectively.

The original crooked appearance would reproduce only with the former `transform:rotate(2deg)` declaration, which is no longer present in the current working change.

## Limitations

- Evidence is local Chromium evidence. Firefox, Safari, physical-device rendering, hosted Vercel proxy/CDN behavior, and production telemetry were not exercised.
- The full Vitest and database/security suites were not rerun. This review used the focused landing suite plus full typecheck, full lint, production build, and browser checks because the implementation is one public CSS declaration and one test with no auth, role, tenant, webhook, or persistence path.
- No hosted preview or production deployment was created or changed by this review.
- Local development emitted restricted-network Supabase auth retry errors after public requests, but `/` returned 200 and rendered. This change does not touch authentication; hosted auth behavior was not inferred from the public-page check.

## Risk and rollback

Residual risk is low because the implementation removes one decorative transform and preserves dimensions, spacing, shadow, content, and actions.

If rollback is required, restore the prior `.landing-proof-window` transform declaration and remove the focused level-card regression assertion. That rollback would intentionally restore the reported tilted appearance. No data or migration rollback is involved.

## Exact next action

Morgan should accept the visual review, preserve this exact CSS/test change in the release candidate, and have Phoenix create a preview-only deployment for a final hosted desktop/mobile check. Production still requires explicit owner approval.
