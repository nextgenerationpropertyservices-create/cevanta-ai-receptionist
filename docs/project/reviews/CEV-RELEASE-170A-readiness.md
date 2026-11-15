# CEV-RELEASE-170A final local release-candidate verification

Date: 2026-10-29 (America/New_York)  
Reviewer: Phoenix (`devops_release`)  
Decision: **GO for an authorized hosted preview verification; not yet GO for production use**

## Candidate identity

The verified candidate is the final integrated, uncommitted working tree after accepted CEV-RELEASE-170B1 through CEV-RELEASE-170B5. Its Git base is `c9ddfd930564ace261e975cf07cc8a3f0ae5cbc9`. Because the candidate contains tracked modifications and untracked files, it is not an immutable release commit and must not be described by the base SHA alone.

Phoenix calculated a SHA-256 manifest across 1,063 Git tracked/untracked, non-ignored candidate files, excluding only this readiness record and its Phoenix handoff. Candidate manifest: `f9715afd51f95e826749bf7daeffdff47760fc9ca4f4826f0fa98a4770c5c7be`. This identifies the locally verified tree but is not a substitute for an immutable release commit.

## Inferred release story

The public flow renders accurate, crawlable Cevanta service content through `/`, `/robots.txt`, and `/sitemap.xml`. The private flow receives a fragment invitation at `/invite`, removes the fragment, exchanges it through the same-origin continuation endpoint, stores only a short-lived HttpOnly continuation, and accepts it through the authenticated database command before entering workspace setup. The 170B repair adds dynamic nonce-protected invitation documents, no-store/privacy headers, a deny-all API CSP, and service-worker bypass without weakening the continuation or authorization contract.

## Historical blocker — repaired in the final rerun

REL-1 below was the 2026-10-27 finding that caused the original NO-GO. Accepted tasks CEV-RELEASE-170B1 through CEV-RELEASE-170B5 repaired and independently reviewed that boundary. The final rerun evidence later in this document supersedes the original response capture.

### REL-1 — High — the built invitation surface does not emit the approved privacy/security headers

A clean production build was started locally and its actual HTTP output was inspected. `GET /invite` returned:

- `Cache-Control: s-maxage=31536000`
- no `Pragma`
- `Referrer-Policy: strict-origin-when-cross-origin`
- no `X-Robots-Tag`
- no `Content-Security-Policy`

The approved invitation contract requires the entry document and exchange response to use private/no-store caching, `Pragma: no-cache`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow, noarchive`, and a restrictive CSP that permits only required same-origin assets plus the audited bootstrap by nonce or hash. Page metadata currently supplies HTML robots/referrer tags, but metadata is not equivalent to the required HTTP response boundary. The one-year shared-cache directive is especially incompatible with a private invitation entry surface.

The malformed test `POST /api/invitations/continuations` correctly failed closed with HTTP 503 and emitted private/no-store, pragma, and robots headers, but still emitted `Referrer-Policy: strict-origin-when-cross-origin` and no CSP. The full approved header contract is therefore not met at either boundary.

Expected repair: add exact route-scoped response headers for `/invite` and `/api/invitations/continuations`, including a CSP compatible with the audited early bootstrap without enabling third-party content. Verify the final Next.js production response rather than only source metadata. Do not weaken the bootstrap timing or restore query-string invitation credentials.

## Original 2026-10-27 evidence

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit` — PASS.
- Full lint: `node node_modules/eslint/bin/eslint.js .` — PASS.
- Full Vitest: PASS, 59 files / 1,004 tests.
- Maintained onboarding command SQL: PASS.
- Invitation-continuation SQL: PASS.
- Aggregate migration/database suite: PASS through migration `202610260005_invitation_continuations.sql`, fictional seed, RLS, role, identity, audit, Retell mapping, and invitation-continuation assertions.
- Maintained intake, jobs, appointments, onboarding storage, workspace provisioning, managed-client, Retell mapping, Retell lead-ingestion, and reactivation suites: PASS.
- Clean copy dependency restore: offline/frozen lockfile PASS; no package download was required.
- Clean non-OneDrive production build: Next.js 16.3.8 webpack PASS; 18 static pages generated. Expected routes include `/`, `/robots.txt`, `/sitemap.xml`, `/invite`, `/invite/continue`, and `/api/invitations/continuations`.
- Public runtime output: root HTTP 200; canonical resolves to `https://cevanta-ai-receptionist.vercel.app`; Open Graph image, Twitter large-card, JSON-LD, and qualified visible copy present; rejected universal claims absent.
- Robots runtime output: HTTP 200; exact and nested workspace exclusions present for `*`, Googlebot, Bingbot, and OAI-SearchBot.
- Sitemap runtime output: HTTP 200; only `/` and `/demo-dashboard`; video `content_loc` present; no private/auth/API URL present.
- Secret scan: zero reviewed files matched the selected high-risk private-key, API-secret, JWT, Stripe-secret, Twilio-account, or populated server-secret patterns. No private env file is tracked; `.env.local` is ignored.
- `git diff --check`: no whitespace error; only Windows LF-to-CRLF notices.

## Checks not proven in the original run

- The configured Playwright invitation privacy test was not independently rerun by Phoenix because verification stopped at the first confirmed broken HTTP boundary. Nova reported 2/2 PASS; Quinn could not independently start Edge in its restricted profile.
- Hosted Supabase migration 005, JWT/PostgREST grants, true multi-connection concurrency, proxy Origin/Host behavior, real continuation cookies, CSP/referrer/access logs, and a fictional hosted acceptance remain unverified.
- Preview/production HTTP output, Search Console, Bing Webmaster Tools, live crawler inclusion, ranking, citations, and AI-answer placement were not tested and cannot be guaranteed.
- Hosted CI, backup restoration, provider flows, and live Retell/Make effects were not exercised.
- `pnpm check` was not executed as one chained command. Its type, lint, test, database, and build components were run independently; the build ran in a clean non-OneDrive copy because the source workspace has the documented OneDrive filesystem limitation.

## Final integrated rerun evidence

### Compiler, lint, application, and database gates

- `node node_modules/typescript/bin/tsc --noEmit` — **PASS**.
- `node node_modules/eslint/bin/eslint.js .` — **PASS**.
- `node node_modules/vitest/vitest.mjs run --configLoader native` — **PASS**, 60 files / 1,022 tests.
- Aggregate embedded database suite — **PASS** through `202610260005_invitation_continuations.sql`, including fictional seed, RLS, role, parent, identity, atomic audit, Retell mapping, and invitation-continuation assertions.
- All maintained specialist embedded suites — **PASS**: intake, jobs, appointments, onboarding storage, onboarding commands, workspace provisioning, managed client workspaces, Retell mapping, Retell lead ingestion, reactivation security, and invitation continuations.

The embedded database suites use an Auth compatibility fixture. They do not prove hosted Supabase JWT/PostgREST or true multi-connection behavior.

### Secret-free clean production build

- A fresh candidate copy was created outside OneDrive with `.git`, `.next`, `node_modules`, `.env*`, and private-key files excluded.
- `pnpm install --offline --frozen-lockfile` — **PASS**, 408 packages reused and zero downloaded.
- A sandboxed build reached static generation and then hit the known Windows `EPERM` directory-creation restriction. The identical clean copy was rerun outside that filesystem restriction.
- `node node_modules/next/dist/bin/next build --webpack` — **PASS** on Next.js 16.3.8. TypeScript, compilation, page-data collection, 17 static pages, and build traces completed. `/invite`, `/invite/continue`, and `/api/invitations/continuations` were dynamic; `/`, `/robots.txt`, and `/sitemap.xml` were static.

### Actual built-server response and HTML captures

- `node scripts/verify-invitation-response-policy.mjs http://127.0.0.1:43279` — **PASS**: `/invite` 200, `/invite/continue` 200, and the intentionally secret-free exchange 503 fail closed.
- `/` — HTTP 200; production canonical, JSON-LD, Open Graph image, and Twitter large-card metadata present.
- `/robots.txt` — HTTP 200; workspace exclusions plus Googlebot, Bingbot, and OAI-SearchBot policies present.
- `/sitemap.xml` — HTTP 200; root, demo, and video content location present; workspace, invitation, API, and sign-in URLs absent.
- `/invite` and `/invite/continue` — HTTP 200 with exact private/no-store semantics, CDN no-store controls, `Pragma: no-cache`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow, noarchive`, `X-Frame-Options: DENY`, and the reviewed permissions policy. Each response carried a different canonical 128-bit nonce CSP with `strict-dynamic`, no production script `unsafe-inline`, no third-party origin, and no returned `x-nonce` header. All 15 entry-page and 14 continuation-page rendered nonce attributes matched their response CSP nonce.
- `/api/invitations/continuations` malformed/config-unavailable request — HTTP 503 fail closed with the complete privacy policy and fixed `default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; sandbox` CSP. It emitted neither CORS allow-origin nor a continuation cookie.

The verifier asserted exact contract header values using Node fetch. PowerShell normalized the secondary `Cache-Control` display order but preserved the same private/no-store/max-age semantics.

### Sensitive-data and diff hygiene

- High-risk filename-only scan across the non-ignored working tree — **PASS**, zero matching files.
- `.env.local` is ignored. The only tracked env-pattern file is the value-free `.env.example`; no private env file is tracked.
- `git diff --check` — **PASS**, zero whitespace errors.

## Hosted and provider gates still open

- Vercel proxy execution, final CDN cache behavior, and platform handling/removal of `Vercel-CDN-Cache-Control`.
- Hosted browser-visible CSP/referrer behavior and access/referrer/CSP logs containing no invitation credential.
- A database-backed HTTP 200 exchange, real host-only continuation-cookie persistence/deletion, sign-in navigation, and wrong-account handling.
- Hosted Supabase Auth/JWT/PostgREST grants, cross-tenant denial, true multi-connection exchange-versus-accept concurrency, and one fully fictional acceptance.
- Hosted CI and backup/restore evidence.
- Live crawler inclusion, rankings, citations, provider behavior, Search Console, and Bing outcomes; none can be guaranteed from local evidence.
- Revocation of old pending query-token invitations and issuance of new fragment invitations.

The independent CEV-RELEASE-170B5 Quality review passed the integrated repair with these same hosted limitations and included production-like browser privacy and 64-nonce stress evidence. Phoenix did not repeat that full Playwright/stress matrix in this rerun; it reran the release suites and actual built-response verifier against the final candidate.

## Safe preview and release order

1. Preserve this exact tree as an immutable candidate and verify its commit/artifact in CI.
2. Deploy the fail-closed application/UI to an authorized preview **first**, without applying migration 005. Confirm missing-database behavior remains generic and policy-protected.
3. Exercise Vercel proxy/CDN/CSP/log behavior and public crawler routes in preview.
4. Apply the Architect-reviewed migration `202610260005_invitation_continuations.sql` to the matching authorized hosted environment **second**.
5. Run hosted JWT/PostgREST, role, tenant-isolation, wrong-account, real-cookie, and true concurrency checks plus one entirely fictional invitation acceptance.
6. Revoke old pending query-token invitations and issue fragment links only after hosted acceptance.
7. Production deployment or migration still requires explicit owner approval and Morgan's final acceptance.

## Rollback

Nothing external changed during this verification, so no rollback is required now. During preview, roll back the application deployment if proxy/CSP/cache behavior differs from local evidence. If migration 005 has already been applied, disable invitation issuance and repair forward; never restore query-string bearer links, service-worker invitation fallback, shared caching, production script `unsafe-inline`, or the retired raw-token RPC grant.

## Exact next action

Morgan should accept this local GO-with-hosted-gates decision, preserve the candidate as an immutable commit/artifact, and authorize a preview-only deployment for the hosted checks above. Stop before production deployment or any hosted migration until preview evidence is complete and explicit owner approval is recorded.

