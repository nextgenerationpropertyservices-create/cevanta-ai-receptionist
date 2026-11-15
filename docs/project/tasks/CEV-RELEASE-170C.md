# CEV-RELEASE-170C — Hosted preview and invitation acceptance

- **Owner:** Morgan (`product_manager`)
- **Status:** In progress
- **Scope:** Preserve the accepted local candidate as an identifiable preview artifact, deploy only to Vercel Preview, verify hosted response/privacy behavior, apply reviewed invitation migration 005 only after the preview fails closed safely, then run hosted fictional database and invitation checks. Production remains out of scope.
- **Dependencies:** Accepted CEV-RELEASE-170A and CEV-RELEASE-170B; owner authorization in chat on 2026-10-29.
- **Allowed files:** Project status/task/handoff/review records for CEV-RELEASE-170C. Specialist ownership is defined in CEV-RELEASE-170C1 through CEV-RELEASE-170C3.
- **Acceptance criteria:** Exact Vercel team/project/preview target confirmed; identifiable preview deployment ready; invitation routes show approved hosted headers and fail closed before migration; migration 005 applied only to the confirmed Cevanta Supabase project; hosted schema/advisors and fictional acceptance checks recorded; no real customer data; no production deployment/domain promotion.
- **Required reviewers:** Atlas for migration preflight and Quinn for hosted verification.
- **Required evidence:** Deployment ID/URL/status, candidate identity, response captures, migration identity/state, hosted SQL/JWT/PostgREST/browser results or explicit blockers, rollback, and no-production statement.

