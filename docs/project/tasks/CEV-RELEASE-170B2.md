# CEV-RELEASE-170B2 — Invitation response boundary and cache repair

- **Owner:** Phoenix (`devops_release`)
- **Status:** Accepted locally with hosted-platform limitations
- **Scope:** Implement the proxy/config/service-worker half of `INVITATION_HTTP_HEADERS_CONTRACT.md`: per-request invitation nonces and CSP propagation, exact privacy/cache headers, route-specific header precedence, provider-refresh bypass, and no service-worker invitation caching/fallback.
- **Dependencies:** Accepted CEV-RELEASE-170B1 contract.
- **Allowed files:** `next.config.ts`; `src/proxy.ts`; `public/sw.js`; `tests/retell-proxy-path.test.ts`; `tests/pwa-install.test.ts`; `tests/invitation-response-policy.test.ts`; `scripts/verify-invitation-response-policy.mjs`; `docs/project/handoffs/CEV-RELEASE-170B2-phoenix.md`.
- **Acceptance criteria:** Exact/nested invite documents get fresh nonce request/downstream CSP and complete privacy headers; exact exchange path bypasses provider refresh; lookalikes do not; config precedence fixes static headers; invite paths never enter Cache Storage/offline fallback; production script CSP has no unsafe-inline or third-party origin.
- **Required evidence:** Focused tests, typecheck/lint, clean build plus actual response captures where feasible, handoff, no deploy/migration.

