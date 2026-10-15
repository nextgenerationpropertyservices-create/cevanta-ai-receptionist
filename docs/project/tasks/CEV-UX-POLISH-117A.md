# CEV-UX-POLISH-117A — Client dashboard first usability pass

- Status: implemented
- Owner: Morgan — Product Manager and Orchestrator
- Scope: Simplify top navigation, consolidate duplicate lead alerts, and make lead rows show useful caller/service details.
- Dependencies: Existing workspace shell, lead display parser, and in-app notification flow.
- Allowed files: `src/components/workspace-nav.tsx`, `src/components/workspace-shell.tsx`, `src/lib/lead-display.ts`, `src/app/workspaces/[tenantId]/leads/page.tsx`, `src/app/globals.css`, focused UI tests.
- Acceptance criteria:
  1. Primary workspace actions remain visible in the top bar and secondary destinations are grouped under More.
  2. The Leads page does not repeat the global new-lead alert.
  3. Lead rows show a useful fallback name and cleaned service summary.
  4. Existing navigation, tenant boundaries, and provider safety copy remain intact.