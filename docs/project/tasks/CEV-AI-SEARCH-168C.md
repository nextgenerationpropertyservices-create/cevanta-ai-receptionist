# CEV-AI-SEARCH-168C — Search-review repair

- **Owner:** Nova (`frontend_ux`)
- **Status:** Accepted with limitations after CEV-AI-SEARCH-168D re-review
- **Scope:** Correct the exact crawler, metadata-merging, video-sitemap, and overclaim defects found by independent review. Preserve the useful 168A content and structured-data parity.
- **Dependencies:** CEV-AI-SEARCH-168A implementation and 168B review.
- **Allowed files:**
  - `src/app/layout.tsx`
  - `src/app/page.tsx`
  - `src/components/ui.tsx`
  - `src/app/robots.ts`
  - `src/app/sitemap.ts`
  - `tests/landing-page.test.ts`
  - `tests/seo-metadata.test.ts`
  - `docs/project/handoffs/CEV-AI-SEARCH-168C-nova.md`
- **Acceptance criteria:** Block both `/workspaces` and `/workspaces/`; retain complete OG siteName/locale/image and Twitter card/image after page metadata merge; supply valid public video `content_loc` or remove invalid video metadata; replace `Answer every opportunity` and booked-opportunity 24/7 overclaims with accurate operator-reviewed wording; update visible text, metadata, JSON-LD, and tests consistently.
- **Required reviewer:** Quinn final re-review before acceptance.
- **Required evidence:** Focused/full tests, typecheck/lint, metadata/robots/sitemap assertions, claim scan, production build, limitations, and no-deploy statement.

