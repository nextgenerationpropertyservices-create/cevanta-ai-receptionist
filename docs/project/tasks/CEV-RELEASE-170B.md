# CEV-RELEASE-170B — Invitation HTTP privacy-header repair

- **Owner:** Morgan (`product_manager`) coordinating Atlas, Phoenix, Nova, Blake, and Quinn
- **Status:** Accepted locally with limitations; hosted preview and database-backed acceptance remain open
- **Scope:** Add exact route-scoped production HTTP privacy/security headers for `/invite` and `/api/invitations/continuations`, including private/no-store caching, pragma, no-referrer, X-Robots-Tag, and an audited nonce/hash CSP that preserves the early fragment-removal bootstrap without allowing third-party content.
- **Dependencies:** CEV-RELEASE-170A REL-1.
- **Allowed files:** Must be assigned before implementation after reviewing the installed Next.js 16 routing/header/CSP guides. Expected ownership includes only the minimum routing/header configuration, invite bootstrap nonce/hash integration if required, focused response tests, task handoff, and review record.
- **Acceptance criteria:** Actual clean production-server responses for both routes match the reviewed header contract; `/invite` is never shared-cacheable; the early bootstrap still removes fragments before other work; malformed and valid browser privacy tests pass; public landing/search routes remain unaffected.
- **Required reviewers:** Atlas for any shared contract change and Quinn for the final security response review.
- **Required evidence:** Focused source/response/browser tests, full typecheck/lint/test/database suites, clean production build, actual response-header capture, secret scan, rollback, and rerun of CEV-RELEASE-170A. No deployment or hosted migration without explicit owner approval.

