# CEV-OWNER-04 — Targeted development owner membership
- Owner: Coordinator (SQL, task, handoff); Architect and Quality (read-only SQL review).
- Scope: Replace ambiguous sole-user provisioning with exact private email selection for the fictional demo tenant.
- Dependencies: Hosted Auth sign-in works; membership is absent; previous sole-user SQL rolled back.
- Allowed files: Coordinator supabase/setup-development-owner-targeted.sql, this task, docs/project/handoffs/CEV-OWNER-04.md; Architect docs/project/handoffs/CEV-OWNER-04-architect.md; Quality docs/project/targeted-owner-review.mjs and docs/project/handoffs/CEV-OWNER-04-quality.md.
- Acceptance: exact one confirmed matching Auth account; placeholder fails; no arbitrary selection, role promotion, replacement of another owner or broad grants; transaction rollback; reviewed and isolated SQL tests pass. Owner executes privately in development SQL Editor.
- Evidence: Architect review, Quality real migration/seed scenario tests, owner-reported execution and browser workspace access separately.
- State: assigned. Initial repository disjoint ownership; no commit authorized.
- State update: reviewed; Architect approved final locked SQL, Quality nine real migration/seed isolated scenarios PASS exit 0. Hosted execution/dashboard pending owner.
