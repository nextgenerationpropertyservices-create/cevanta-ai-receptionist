# CEV-PROJECT-AUDIT-167P — Remove invitation bearer token from URLs

- **Owner:** Atlas (`architect_data`)
- **Status:** Architecture contract complete; runtime implementation remains blocked on separate Atlas/Blake/Nova tasks and Quinn review
- **Scope:** Implement the already approved no-query-token invitation entry design: a fragment is removed before rendering/third-party requests, exchanged same-origin for a bounded opaque HttpOnly SameSite continuation, and later accepted without exposing the raw token to URL logs, history, referrers, analytics, screenshots, localStorage, or client-visible errors. Preserve verified recipient binding, one-time acceptance, and fixed safe redirects.
- **Dependencies:** Existing CEV-ONBOARD-CLARIFY-42 architecture, CEV-PROJECT-AUDIT-167C finding, and accepted CEV-PROJECT-AUDIT-167O digest repair. Requires separate Atlas schema/contract ownership, Blake server adapter ownership, Nova entry UI ownership, and Quinn security review before release.
- **Allowed files:**
  - `docs/architecture/INVITATION_CONTINUATION_CONTRACT.md`
  - `docs/project/tasks/CEV-PROJECT-AUDIT-167P.md`
  - `docs/project/handoffs/CEV-PROJECT-AUDIT-167P-atlas.md`
  - No runtime, migration, or test implementation is authorized in this architecture slice.
- **Acceptance criteria:**
  1. Raw bearer tokens never appear in URL queries, access logs, browser history, referrers, analytics, localStorage, audit events, receipts, screenshots, or errors.
  2. Fragment material is removed immediately and exchanged only through a same-origin protected endpoint for a short-lived opaque HttpOnly SameSite handle.
  3. Continuations are bound to the exact pending invitation and verified intended account, expire explicitly, are one-time/replay-safe, and cannot recreate removed membership.
  4. Sign-in continuation uses a fixed allowlisted path with no arbitrary return URL.
  5. Expired, revoked, wrong-account, substituted, replayed, CSRF, concurrent, and missing-continuation cases fail generically and atomically.
  6. Hosted browser/logging/referrer evidence and independent Quality approval are required before client use.
- **Required evidence:** Architect contract, migration/RPC tests, server tests, browser history/referrer/log tests, security review, and recovery plan. Architecture evidence is recorded in `docs/architecture/INVITATION_CONTINUATION_CONTRACT.md`; implementation and hosted evidence remain pending.

