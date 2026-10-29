# CEV-RELEASE-170B5 independent security review

Date: 2026-10-28

Reviewer: Quinn — Quality and Security

Decision: **PASS WITH LIMITATIONS**

## Scope reviewed

This review independently checked the integrated CEV-RELEASE-170B2, CEV-RELEASE-170B3, and CEV-RELEASE-170B4 changes against sections 2–8 of `docs/architecture/INVITATION_HTTP_HEADERS_CONTRACT.md`. It covered:

- exact `/invite`, nested invitation, and exchange-path matching;
- cryptographic nonce generation, shape, freshness, request propagation, response CSP, and rendered HTML agreement;
- production CSP directives, absence of script `unsafe-inline`/`unsafe-eval`, and absence of third-party origins or requests;
- final built-response cache, referrer, robots, frame, content-type, and permissions headers;
- the exchange API deny-all CSP, same-origin rejection, failure responses, no CORS, and no failure cookies;
- service-worker bypass and absence of invitation Cache Storage entries;
- early fragment removal, cold/warm-cache ordering, exchange/body privacy, history replacement, and malformed-link failure;
- no token/request identifier in URLs, referrers, DOM, browser storage, console output, resource names, or cached documents;
- lookalike invitation paths and the public root route retaining ordinary behavior;
- source/test/handoff scans for credential patterns and unnecessary owner personal data.

No application source, test, deployment, environment, provider, or database state was changed by this review.

## Decision basis

No Critical, High, Medium, or Low security defect was reproduced in the reviewed local candidate.

The candidate passes the local response-policy gate because:

1. The proxy creates 16 random bytes per invitation document and sends one matching CSP upstream while returning the same CSP downstream. In a 64-response built-server stress check, all 64 canonical base64 nonces were unique and every response's CSP nonce matched every rendered script nonce. The private `x-nonce` request header was absent from responses.
2. Built production invitation responses contained the exact no-store/no-referrer/noindex/frame/content-type/permissions policy. `script-src` contained the request nonce and `strict-dynamic`, but neither `unsafe-inline` nor `unsafe-eval`; no CSP directive named an HTTP(S) origin. `style-src-attr 'unsafe-inline'` remained the narrow, reviewed exception.
3. The final built exchange endpoint returned the exact fixed deny-all CSP and static privacy policy for representative 400, 403, 405, and 415 failures and Next's automatic 204 OPTIONS response. None emitted `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`, or a continuation cookie. A separately started secret-free server with no configured origin returned the same policy on its fail-closed 503 response.
4. The invitation bootstrap removed the fragment before parsing/exchange. Production-server Chrome tests passed for valid and malformed fictional links. Independent cold-cache and warm-cache probes observed `history.replaceState` while the hash was still present, followed by Next framework chunk execution only after the hash was gone.
5. The fictional token and request UUID appeared only in the one required same-origin exchange body. They did not appear in request URLs, referrers, rendered DOM, local/session storage, console messages, Performance resource names, or Cache Storage. No third-party request occurred.
6. The service worker returns before `event.respondWith` for exact and nested invitation paths, and the browser probe found no cached invitation document. Root and lookalike paths did not receive the invitation CSP or nonce response header.
7. Missing/malformed page nonces render a generic unavailable state without an executable invitation bootstrap. Malformed fragments are erased without exchange. Missing origin/configuration and unavailable database behavior return generic, policy-protected failures without cookies.

## Independent evidence

### Focused and full automated checks

- `node node_modules/vitest/vitest.mjs run --configLoader native tests/retell-proxy-path.test.ts tests/pwa-install.test.ts tests/invitation-response-policy.test.ts tests/invitation-ui.test.ts tests/invitation-continuations.test.ts tests/invitations.test.ts` — **PASS**, 6 files / 89 tests.
- `node node_modules/typescript/bin/tsc --noEmit` — **PASS**.
- `node node_modules/eslint/bin/eslint.js .` — **PASS**.
- `node node_modules/vitest/vitest.mjs run --configLoader native` — **PASS**, 60 files / 1,022 tests.
- `node scripts/test-db-embedded.mjs` — **PASS**, all maintained migrations through `202610260005_invitation_continuations.sql`, fictional seed, and aggregate RLS/role/identity/atomicity assertions. The script correctly warns that its Auth layer is a compatibility fixture.

### Production build and actual response checks

- The ordinary OneDrive build attempt failed with the documented Windows filesystem error: `EPERM ... mkdir ... .next/server/app/api/integrations/make`. This is an environment limitation, not a response-policy failure.
- A secret-free isolated copy outside OneDrive ran `node node_modules/next/dist/bin/next build --webpack` — **PASS** on Next.js 16.3.8. `/invite` and `/invite/continue` were reported dynamic.
- `node scripts/verify-invitation-response-policy.mjs http://127.0.0.1:43217` against that production server — **PASS**: document statuses 200/200; exchange 503 fail closed because the copy intentionally had no hosted configuration.
- Independent 64-response built-server stress probe — **PASS**: 64 unique canonical 128-bit nonces, 832 script tags checked, CSP/HTML nonce agreement, exact headers, no response `x-nonce`, no script-policy weakening, and four root/lookalike non-regressions.
- Independent built API matrix — **PASS**: wrong origin 403, missing fetch metadata 403, wrong media type 415, malformed JSON 400, valid-shape/no-database 400, unsupported GET 405, automatic OPTIONS 204. Every response had the exact fixed deny-all CSP/static privacy headers, no CORS allow headers, and no cookie.

### Browser and privacy checks

- Focused Playwright against the built production server — **PASS**, 2/2 tests. A fictional valid fragment exchanged once, removed the hash, reached `/invite/continue`, made no third-party/token-bearing URL or referrer request, produced no inline-script CSP execution error, and Back returned to `/`. A malformed fragment was erased and never exchanged.
- Independent cold-cache ordering probe — **PASS**: fragment replacement occurred before framework chunk execution.
- Independent warm-cache ordering probe — **PASS**: the same ordering held after first loading the public root and warming shared assets.
- Independent browser privacy/cache probe — **PASS**: the fictional credential appeared only in the one exchange POST body; URL/referrer/DOM/local storage/session storage/console/Performance resource/Cache Storage leakage counts were zero; invitation cache entries and third-party requests were zero.

### Sensitive-data and hygiene checks

- Focused filename-only scan for private-key blocks, common Stripe/Twilio/Vercel/Retell/Supabase credential forms, owner name/email markers, and consumer email domains across the changed source, tests, verifier, architecture contract, and implementation handoffs — **PASS**, zero matching files.
- Test values are fictional UUIDs, `example.test`/`example.invalid` hosts, and deterministic fictional base64 values. No real customer record was found in the reviewed surface.

## Limitations and remaining release gates

This is local production-like evidence, not hosted acceptance. The following remain unverified and therefore prevent an unconditional production-use decision:

- Vercel preview/production proxy execution and final platform cache behavior;
- platform consumption or removal of `Vercel-CDN-Cache-Control` and browser-visible CDN behavior;
- hosted access/referrer/CSP logs and confirmation that they contain no invitation credential;
- real continuation cookie persistence, deletion, host-only scope, and navigation across sign-in;
- an actual 200 database-backed exchange response from the built HTTP server (the success response object and cookie flags pass focused route tests, while the secret-free actual server intentionally fails closed);
- hosted Supabase Auth/JWT/PostgREST, wrong-account and cross-tenant behavior, true multi-connection exchange/acceptance concurrency, and one fully fictional hosted acceptance;
- application-first/migration-second hosted release order and revocation of old pending query-token invitations.

These are explicit hosted gates from the approved architecture contract, not local defects. They must remain visible in the final CEV-RELEASE-170A decision.

## Reproduction notes

No product defect requires reproduction steps. The only reproduced failure was the known OneDrive build-environment limitation:

1. From the OneDrive checkout, run `node node_modules/next/dist/bin/next build --webpack`.
2. Observe Windows `EPERM` while Next creates a nested `.next/server/app/...` directory.
3. Copy the same candidate without environment secrets to a non-OneDrive location, install dependencies offline, and rerun the command.
4. Observe the successful production build. This comparison supports classifying the first failure as environment-only.

## Required next action

Morgan may accept this local review as **PASS WITH LIMITATIONS** and ask Phoenix to rerun CEV-RELEASE-170A against the exact final candidate. Phoenix must keep the hosted gates above open. No production deployment or migration is authorized by this review; any later production action still requires explicit owner approval.
