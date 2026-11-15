# CEV-AI-SEARCH-168D independent AI-search review

Date: 2026-10-27  
Reviewer: Quinn (Quality and Security)  
Review type: Independent metadata, crawl-boundary, structured-data, public-claim, and focused-test re-review

## Decision

**PASS WITH LIMITATIONS.**

All four findings from CEV-AI-SEARCH-168B are fixed in the current source:

- `/workspaces` and `/workspaces/` are both disallowed for every configured crawler group.
- The root page supplies complete Open Graph and Twitter objects despite Next.js shallow nested-metadata replacement.
- The public video sitemap includes the stable MP4 `content_loc`.
- The two rejected phrases, “turns missed calls into booked-job opportunities 24/7” and “Answer every opportunity,” are absent and have regression assertions.

CEV-AI-SEARCH-168E repaired the one additional universal claim found during this review. The audience heading now says “A clear front door for service calls,” and the focused test rejects the old “every service call” wording. The public discovery and claims slice is accepted locally with the live-response, crawler, webmaster, and production-build limitations below. No production deployment was approved or performed by this review.

## Finding

### ASR-1 — Universal call-coverage wording — RESOLVED

**Severity:** Medium  
**Evidence:** `src/components/ui.tsx:76`; `docs/project/PROJECT_STATUS.md`; `docs/project/reviews/CEV-PROJECT-AUDIT-167C-security.md`

The audience heading previously said “A clear front door for every service call.” CEV-AI-SEARCH-168E changed it to “A clear front door for service calls.” This removes the universal-coverage implication while preserving the intended audience message.

Reproduction:

1. Open the public landing page source or render `LandingPage`.
2. Find the `#who-it-is-for` section.
3. Read its heading: “A clear front door for every service call.”
4. Compare it with the current conditional operator-managed pilot evidence.

Expected: qualified language that describes the product without guaranteeing every call.  
Actual after 168E: “A clear front door for service calls.”

Resolution evidence: the focused render assertion requires the qualified heading, and the regression assertion rejects “A clear front door for every service call.” No metadata, schema, crawler, database, or provider change was made.

## Repaired finding matrix

| 168B finding | Result | Evidence |
|---|---|---|
| Exact `/workspaces` crawler exclusion | PASS | `src/app/robots.ts:12-13`; every crawler group receives the same list; test asserts both forms. |
| Complete root social metadata | PASS | `src/app/page.tsx:10-27`; page-level objects include type, site name, locale, URL, image, card, title, and description. |
| Valid video sitemap location | PASS | `src/app/sitemap.ts:18`; test asserts the public MP4 `content_loc`; the public file exists. |
| Previously rejected absolute phrases | PASS | Both phrases are absent; `tests/landing-page.test.ts` prevents their return. |

## Other review results

- Canonical, Open Graph, robots host, and sitemap signals consistently use `https://cevanta-ai-receptionist.vercel.app`.
- The sitemap contains only `/` and `/demo-dashboard`; it does not list sign-in, setup, invitation, API, or workspace routes.
- JSON-LD remains static, escapes `<`, reuses the visible FAQ source, and adds no rating, review count, price, customer count, or postal location.
- Visible and structured service descriptions remain within office-review lead-capture boundaries.
- Googlebot, Bingbot, and OAI-SearchBot are explicitly declared; this improves crawl eligibility but does not guarantee indexing, rankings, citations, or AI-answer inclusion.
- Targeted reviewed-file scan found no common secret, bearer-token, service-role-assignment, Twilio account-ID, or real personal-email pattern. The public Google verification value is site-control metadata, not a private application credential.
- Robots directives are discovery guidance only; they are not treated as authorization.

## Independent verification

- `node node_modules/vitest/vitest.mjs run --configLoader native tests/landing-page.test.ts tests/seo-metadata.test.ts` — PASS, 2 files / 7 tests.
- `node node_modules/typescript/bin/tsc --noEmit` — PASS.
- `node node_modules/eslint/bin/eslint.js src/app/layout.tsx src/app/page.tsx src/components/ui.tsx src/app/robots.ts src/app/sitemap.ts tests/landing-page.test.ts tests/seo-metadata.test.ts` — PASS.
- Reviewed-file known-secret/personal-data scan — PASS, no match.
- Rejected/absolute claim scan after 168E — PASS. The only remaining `always` match appears in the accurate sentence that service teams “cannot always stop working to answer the phone,” not in a Cevanta capability promise.
- Public asset existence check — PASS for the social image, demo MP4, and poster.
- `git diff --check` on reviewed source/tests — PASS apart from normal Windows line-ending notices.

## Checks not run or not proven

- I did not rerun the full 997-test suite; Nova's reported full result was reviewed. The focused tests and type/lint evidence were independently run.
- A production build was not independently rerun. Nova's working-copy and clean-copy attempts were blocked by Windows `EPERM`; Phoenix must run the final clean build in a filesystem that permits `.next` creation.
- No preview/production response, resolved production `<head>`, robots/sitemap fetch, media fetch, Search Console, Bing Webmaster Tools, rich-result validator, or live crawler request was exercised.
- No indexing, ranking, citation, traffic, or AI-answer placement is guaranteed.
- No Git-history, remote-cache, deployment-log, or ignored/generated-file secret scan was performed.

## Release gate and rollback

ASR-1 is repaired and the AI-search slice passes local Quality review with limitations. Phoenix must still complete the clean production build and final release-candidate checks; hosted output and crawler eligibility must be verified after an explicitly approved release. If later live validation finds incorrect metadata or crawler output, revert the 168A/168C public discovery changes without changing authenticated authorization. A future custom-domain launch must update canonical, social, robots, sitemap, JSON-LD, tests, and webmaster properties together.

