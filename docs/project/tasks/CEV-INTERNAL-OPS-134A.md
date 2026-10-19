# CEV-INTERNAL-OPS-134A

- Owner: Morgan — Product Manager and Orchestrator
- Scope: Reframe the internal Cevanta workspace Overview for portfolio operations instead of trade-service dispatch.
- Dependencies: Existing managed client workspace query and workspace account type.
- Allowed files: `src/app/workspaces/[tenantId]/page.tsx`, `src/app/globals.css`, `tests/dashboard-ui.test.ts`, this task file, matching handoff, and project status.
- Acceptance criteria:
  - Internal workspaces show managed clients, onboarding, pilot/live, paused counts, and owner shortcuts.
  - Internal Overview avoids HVAC/trade dispatch language and sends trade-specific work to client workspaces.
  - Client workspaces retain the existing front-office dashboard.
  - Responsive styling and tests cover the internal route.
- Required evidence: typecheck, lint, focused test suite, and production build result.
