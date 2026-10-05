# CEV-M1-03

- Owner: backend_logic
- State: implemented and reviewed; milestone acceptance gates remain open (see PROJECT_STATUS.md)
- Integration ownership: backend handoff delivered; coordinator owns configuration consistency fixes after specialist completion.
- Scope: Verified auth, authorized queries/actions, health
- Dependencies: 02 contracts
- Allowed files: src/lib/server/**; src/lib/supabase/**; src/app/actions/**; src/app/auth/**; src/app/api/health/**; src/proxy.ts; docs/project/handoffs/CEV-M1-03.md
- Acceptance criteria: Every operation checks user/membership/role/tenant; safe errors; no service role
- Required evidence: Unit/integration review; live login/E2E evidence where possible
- Reviewers: Architect for schema/contracts; Quality for cross-module/security; coordinator for acceptance.
- Isolation: disjoint path ownership for unborn repository; use worktrees once a base commit exists.
- Exact next action: implement scope and submit full handoff for review.
