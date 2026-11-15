# CEV-RELEASE-170B1 — Invitation HTTP/CSP implementation contract

- **Owner:** Atlas (`architect_data`)
- **Status:** Accepted — architecture contract delivered and implemented
- **Scope:** Define the narrow Next.js 16 route-scoped header and CSP contract that repairs REL-1 without weakening the early fragment-removal bootstrap, auth, same-origin exchange, or public-site behavior. Review only; no source changes.
- **Dependencies:** CEV-RELEASE-170A readiness finding; installed Next.js 16 CSP, headers, and proxy guides; existing `proxy.ts`, `next.config.ts`, invite UI, and continuation route.
- **Allowed files:**
  - `docs/architecture/INVITATION_HTTP_HEADERS_CONTRACT.md`
  - `docs/project/handoffs/CEV-RELEASE-170B1-atlas.md`
- **Acceptance criteria:** Choose nonce or audited hash approach; define exact matcher, dynamic/static behavior, request/response nonce propagation if applicable, page and API headers, cache behavior, CSP directives, existing proxy-auth interaction, failure behavior, source ownership split, test plan, and rollback. No third-party content or `unsafe-inline` in production script policy.
- **Required evidence:** Current source inspection, installed Next.js 16 guide references, conflict analysis with global headers/proxy/auth, implementation file list, Quality review points, and no-deploy statement.

