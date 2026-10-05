# Correct current workspace overview

- Task ID: CEV-AUTO-16-ui
- Owner: Nova — Frontend and UX
- State: ready
- Scope: Correct stale dashboard copy claiming dispatch and scheduling are future features; link existing Jobs and Calendar while describing AI calls accurately as pending integration.
- Dependencies: Existing implemented jobs/calendar routes, CEV-LIVE-15 verified owner persistence.
- Allowed files: src/app/workspaces/[tenantId]/page.tsx, docs/project/handoffs/CEV-AUTO-16-ui-frontend.md.
- Acceptance criteria: Current features described accurately; accessible working module links; no unsupported AI claims or data exposure; preserve existing CRM/current role behavior.
- Required evidence: Installed Next.js guide read, type/lint/build integration and browser navigation checks.
- Reviewers: Morgan; no migration/contract/security changes intended.
- Prohibited/shared files: Other UI, shared components, global CSS, server modules, credentials and customer fixtures.
- Branch/worktree or ownership fallback: Disjoint ownership; no commit.
- Exact next action: Nova implements alongside separately owned recovery pages after Backend interface confirmed.
