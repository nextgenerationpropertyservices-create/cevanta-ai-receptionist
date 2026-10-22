# Task CEV-ONBOARD-OPS-151A — Client portfolio search
- Owner: Morgan — Product Manager and Orchestrator
- State: assigned
- Scope: Add a URL-addressable search field to the internal client onboarding monitor, composed with the existing stage filter.
- Dependencies: CEV-ONBOARD-OPS-150A stage filter and existing managed-client query.
- Allowed files: `src/app/workspaces/[tenantId]/clients/page.tsx`, `src/app/globals.css`, matching UI tests, this task record, matching handoff.
- Acceptance criteria: 1) search matches client name, trade, or timezone; 2) search and stage can be combined; 3) empty results are clear; 4) no database, permission, or provider behavior changes.
- Required evidence: focused client UI tests, typecheck, lint, production build attempt and documented limitation.
