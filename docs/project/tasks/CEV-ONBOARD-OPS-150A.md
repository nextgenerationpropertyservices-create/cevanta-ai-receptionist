# Task CEV-ONBOARD-OPS-150A — Internal onboarding pipeline controls
- Owner: Morgan — Product Manager and Orchestrator
- State: assigned
- Scope: Make the internal Clients monitor easier to operate by adding a stage filter and clearer pipeline counts, without changing provider automation, permissions, or persistence.
- Dependencies: Existing `getManagedClientWorkspaces`, onboarding snapshot, and client operations monitor.
- Allowed files: `src/app/workspaces/[tenantId]/clients/page.tsx`, `src/app/globals.css`, matching UI tests, this task record, matching handoff.
- Acceptance criteria: 1) owner can filter clients by onboarding stage; 2) filter state is URL-addressable; 3) counts remain visible; 4) empty filtered state is clear; 5) no database or provider behavior changes.
- Required evidence: focused client UI tests, typecheck, lint, production build attempt and documented limitation.
