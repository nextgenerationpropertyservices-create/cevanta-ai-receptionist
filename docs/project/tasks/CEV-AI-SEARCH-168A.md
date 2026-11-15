# CEV-AI-SEARCH-168A — Public AI-search and crawlability foundation

- **Owner:** Nova (`frontend_ux`)
- **Status:** Accepted with limitations after 168C/168E repairs and 168D re-review
- **Scope:** Improve the public Cevanta landing page for conventional and AI-powered search without changing authenticated dashboard behavior or overstating current automation. Add accurate metadata, canonical URLs, public-only robots/sitemap coverage, visible answer-ready service content, truthful FAQ content, and JSON-LD that exactly matches visible claims. Keep private/authenticated routes out of the sitemap and disallowed for crawlers.
- **Dependencies:** Current public landing page; CEV-PROJECT-AUDIT-167B product-truth boundaries; current official Google/OpenAI/Bing crawler guidance; Next.js 16 metadata/JSON-LD/robots/sitemap guides.
- **Allowed files:**
  - `src/app/layout.tsx`
  - `src/app/page.tsx`
  - `src/components/ui.tsx`
  - `src/app/globals.css`
  - `src/app/robots.ts`
  - `src/app/sitemap.ts`
  - `tests/landing-page.test.ts`
  - `tests/seo-metadata.test.ts`
  - `docs/project/handoffs/CEV-AI-SEARCH-168A-nova.md`
- **Acceptance criteria:**
  1. Metadata has a stable production base/canonical, plain-language title/description, Open Graph and Twitter fields, and no unsupported claims.
  2. `/robots.txt` allows public content and specifically permits Googlebot, Bingbot, and OAI-SearchBot while disallowing authenticated/setup/API paths; it references the canonical sitemap.
  3. `/sitemap.xml` contains only canonical public URLs with honest freshness values.
  4. Visible text clearly answers who Cevanta is for, what it does now, how review works, and what it does not automate by default.
  5. JSON-LD is static, sanitized, matches visible text, and uses only supported organization/software/service/FAQ facts without invented ratings, customers, prices, location, or automation.
  6. Public content remains readable, keyboard-accessible, responsive, internally linked, and free of provider/implementation jargon.
  7. Focused tests, typecheck, lint, full Vitest, and production build evidence are recorded.
- **Required reviewer:** Quinn (`quality_security`) for claim/privacy/crawl-boundary review before release.
- **Required evidence:** Rendered markup assertions, metadata/robots/sitemap tests, source scan for unsupported claims/private routes, React checklist, commands/results, limitations, rollback, and no-deploy statement.

