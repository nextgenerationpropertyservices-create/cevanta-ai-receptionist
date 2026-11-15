# CEV-AI-SEARCH-168B — Independent public-search review

Date: 2026-10-26  
Reviewer: Quinn (Quality and Security)  
Review type: Independent source, rendered-output, crawler-boundary, metadata, claim, and focused-test review

## Decision

**REJECT — changes required before this search slice is released.**

The implementation has a sound public-content foundation: the JSON-LD is static and safely escaped, the FAQ structured data is generated from the same text rendered to visitors, the sitemap URL list contains only the public root and demo dashboard, the canonical host is consistent, explicit crawler groups include Googlebot, Bingbot, and OAI-SearchBot, and the reviewed files contain no detected secrets or real personal data.

Four release defects remain:

1. The exact authenticated `/workspaces` route is not disallowed by the `/workspaces/` robots pattern.
2. Page-level Open Graph and Twitter objects replace the layout objects, so the home page loses the intended social image and related fields.
3. The video sitemap entry omits both `content_loc` and `player_loc`, although Google requires one of them.
4. Two visible absolute claims exceed the currently proven operator-managed pilot boundary.

No production deployment is approved or performed by this review.

## Severity key

- **Critical:** direct compromise, credential exposure, or broad private-data access.
- **High:** plausible privacy/tenant boundary bypass or severe release integrity failure.
- **Medium:** material claim, crawler-boundary, or search-contract defect that must be repaired before release.
- **Low:** hardening or quality gap with limited immediate impact.

## Findings

### AS-1 — Exact private workspace route is crawlable

**Severity:** Medium  
**Evidence:** `src/app/robots.ts:12`; `src/app/workspaces/page.tsx`; `tests/seo-metadata.test.ts:26`

The robots policy disallows `/workspaces/`, which covers nested tenant routes such as `/workspaces/<tenant-id>`, but it does not match the exact `/workspaces` workspace-picker route. That route is authenticated application content and the task explicitly requires exact route variants to be excluded.

Reproduction:

1. Inspect the generated rules from `robots()` or `/robots.txt`.
2. Observe `Disallow: /workspaces/` and no `Disallow: /workspaces`.
3. Compare the path prefixes: `/workspaces` does not start with `/workspaces/`.
4. Confirm `src/app/workspaces/page.tsx` implements the exact private route.

Expected: both `/workspaces` and every nested workspace route are disallowed.  
Actual: only the nested form is disallowed.

Required fix: use `/workspaces` as the disallow prefix, or explicitly list both variants. Update the test to assert the exact `/workspaces` rule and add a route matrix that checks both exact and nested paths.

### AS-2 — Home-page social metadata drops inherited card/image fields

**Severity:** Medium  
**Evidence:** `src/app/layout.tsx:15-23`; `src/app/page.tsx:10-20`; installed Next.js guide `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md:1344-1383`

The layout defines Open Graph `siteName`, `locale`, and `images`, plus Twitter `card` and `images`. The home page then defines new `openGraph` and `twitter` objects without those fields. Next.js 16 shallowly merges route metadata and replaces nested fields from earlier segments. Therefore the root page keeps the page title/description/URL but loses the intended Open Graph image/site/locale and Twitter card/image.

The current test passes because it checks the layout and page exports separately; it does not test the resolved metadata for `/`.

Reproduction:

1. Read the installed Next.js metadata merging rule at the cited lines.
2. Compare the layout and page nested objects.
3. Observe that the later page objects omit the layout-only social fields.

Expected: the root resolves a coherent canonical URL, Open Graph URL/image/site identity, and `summary_large_image` Twitter card/image.  
Actual: the later page objects replace the earlier nested objects and omit those values.

Required fix: define complete Open Graph and Twitter objects at page level, or spread shared social fields into every overriding segment. Add a test that covers the complete page-level nested objects or the resolved head output rather than checking the layout in isolation.

### AS-3 — Video sitemap lacks a required video location

**Severity:** Medium  
**Evidence:** `src/app/sitemap.ts:14-18`; `public/cevanta-call-demo.mp4`; Next video sitemap type at `node_modules/next/dist/lib/metadata/types/metadata-types.d.ts:123-129`; Google Search Central video sitemap requirements

The sitemap video entry contains a title, thumbnail, and description but neither `content_loc` nor `player_loc`. Google Search Central requires at least one of those location tags for a video sitemap entry. The project already has a stable public MP4 used by the visible `<video>` element.

Reproduction:

1. Call `sitemap()` or inspect `/sitemap.xml` after a build.
2. Inspect the root entry's `videos[0]`.
3. Observe that both `content_loc` and `player_loc` are absent.

Expected: the entry identifies the crawlable video bytes or a player URL.  
Actual: the video cannot be verified through the sitemap contract.

Required fix: add a `content_loc` value of `${siteUrl}/cevanta-call-demo.mp4` and assert it in the focused sitemap test. The current SVG thumbnail format is supported by Google, but live fetchability and dimensions still need hosted validation.

Official reference reviewed: `https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps`.

### AS-4 — Absolute outcome/availability language exceeds current evidence

**Severity:** Medium  
**Evidence:** `src/components/ui.tsx:23,41`; `docs/project/PROJECT_STATUS.md`; `docs/project/reviews/CEV-PROJECT-AUDIT-167C-security.md`

The visible landing page says the product “turns missed calls into booked-job opportunities 24/7” and “Answer every opportunity.” Current project evidence conditionally permits only a closely monitored, operator-managed call-to-lead office-review pilot. Hosted provider uptime, unattended 24/7 delivery, and universal opportunity capture have not been proven. The surrounding office-control text is appropriately cautious, but it does not cure these absolute statements.

Expected: public claims describe what the guarded product helps the office do without guaranteeing availability or universal outcomes.  
Actual: the two phrases imply continuous and complete results that the current evidence does not support.

Required fix: use qualified wording such as “helps turn missed calls into office-ready lead opportunities” and “Capture more call opportunities, including after hours when configured.” Update the landing-page assertion so it prevents the old absolute claims from returning.

## Claim and structured-data review

| Check | Result | Evidence |
|---|---|---|
| Organization, service, application, and audience facts | PASS WITH LIMITATIONS | They match visible product concepts and do not add location, customer-count, rating, or pricing proof. Live availability remains subject to the guarded pilot limits. |
| FAQ parity | PASS | The same `faq` array drives the visible FAQ and `FAQPage.mainEntity`. |
| JSON-LD sanitization | PASS | Native script output uses `JSON.stringify(jsonLd).replace(/</g, '\\u003c')`, matching installed Next.js guidance. |
| Invented proof fields | PASS | No rating, review count, customer count, price, or postal location was found. |
| Unsupported provider jargon | PASS | No Retell, Make, Supabase, webhook, or secret/configuration jargon appears in the new public copy. |
| Absolute public claims | FAIL | AS-4. |

The structured data itself does not contain the two absolute phrases. Once visible copy is corrected, the current cautious service/application/FAQ JSON-LD can remain if it continues to mirror what visitors can see.

## Canonical and social matrix

| Signal | Result | Notes |
|---|---|---|
| `metadataBase` | PASS | Stable production Vercel host. |
| Root canonical | PASS | `/` resolves against the same host. |
| Root Open Graph URL | PASS | `/` resolves against the same host. |
| Root Open Graph image/site/locale | FAIL | Replaced by the page object; AS-2. |
| Root Twitter title/description | PASS | Present at page level. |
| Root Twitter card/image | FAIL | Replaced by the page object; AS-2. |
| Robots sitemap/host | PASS | Same production host. |
| Sitemap URL host | PASS | Root and demo use the same production host. |

## Private-route crawler matrix

| Route | Current rule | Result |
|---|---|---|
| `/api/health` and `/api/integrations/...` | `/api/` | PASS |
| `/auth/callback` and `/auth/recovery` | `/auth/` | PASS |
| `/invite` and nested invite paths | `/invite` | PASS |
| `/setup` | `/setup` | PASS |
| `/sign-in` | `/sign-in` | PASS |
| `/sign-up` | `/sign-up` | PASS |
| `/forgot-password` | `/forgot-password` | PASS |
| `/reset-password` | `/reset-password` | PASS |
| `/workspaces` | `/workspaces/` | **FAIL — exact route not matched** |
| `/workspaces/<tenant-id>/...` | `/workspaces/` | PASS |

All four configured crawler groups use the same public allow list and private disallow list. The sitemap contains only `/` and `/demo-dashboard`. Robots directives are discovery guidance, not authorization; existing server authentication must remain the security boundary.

## Sensitive-data review

- Targeted scan covered all 168A source and test files for common live/test secret prefixes, service-role assignments, bearer tokens, Twilio account identifiers, and common personal-email domains.
- Result: `NO_KNOWN_SECRET_OR_REAL_PERSONAL_DATA_PATTERN_MATCH`.
- The Google site-verification value in root metadata is intentionally public proof-of-site control, not an application credential.
- JSON-LD and visible content contain only generic business information and fictional/demo descriptions.
- This targeted current-tree scan does not prove Git history, remote caches, ignored files, or deployed responses are clean.

## Verification evidence

Independently run by Quinn:

- `node node_modules/vitest/vitest.mjs run --configLoader native tests/landing-page.test.ts tests/seo-metadata.test.ts` — PASS, 2 files / 7 tests. These tests do not cover the four findings above.
- `node node_modules/typescript/bin/tsc --noEmit` — PASS.
- `node node_modules/eslint/bin/eslint.js src/app/layout.tsx src/app/page.tsx src/components/ui.tsx src/app/robots.ts src/app/sitemap.ts tests/landing-page.test.ts tests/seo-metadata.test.ts` — PASS.
- Targeted known-secret and real-personal-email scan — PASS, no match.
- Manual source/render contract review — completed for metadata, JSON-LD, landing content, robots, sitemap, actual App Router paths, and public media files.

Specialist evidence reviewed, not independently rerun in full:

- Nova reports full Vitest PASS, 57 files / 961 tests.
- Nova reports a clean non-OneDrive webpack production build PASS with `/`, `/robots.txt`, and `/sitemap.xml` generated.

## Checks not run or not proven

- No production or preview deployment was made or changed.
- No live `/robots.txt`, `/sitemap.xml`, resolved production `<head>`, public media fetch, Google Rich Results Test, Schema Markup Validator, Search Console, Bing Webmaster Tools, or OAI-SearchBot fetch was exercised.
- No search indexing, ranking, citation, or AI-answer inclusion is guaranteed.
- No independent full Vitest run or production build was required for this read-only focused review; Nova's broader evidence was inspected.
- No Git-history, remote-cache, or ignored/generated-file secret scan was performed.

## Release gates

Before Morgan accepts 168A or Phoenix prepares a release:

1. Block the exact `/workspaces` route and add exact/nested matrix coverage.
2. Restore complete home-page Open Graph and Twitter fields after Next.js shallow merging and test the resolved/complete contract.
3. Add the public MP4 as the video sitemap `content_loc` and test it.
4. Replace the two absolute outcome/availability phrases and add a regression assertion.
5. Rerun the focused tests, typecheck, lint, full Vitest, and a clean production build, then return the repaired candidate to Quinn for re-review.

