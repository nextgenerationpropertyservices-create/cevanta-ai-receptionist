# CEV-CLIENT-UI-132A

- **Owner:** Nova (frontend_ux), coordinated by Morgan
- **Scope:** Condense the internal Clients dashboard's Client Intake Details and Private Client Access sections using accessible native disclosure rows.
- **Dependencies:** Existing managed client and invitation data.
- **Allowed files:** `src/app/workspaces/[tenantId]/clients/page.tsx`, `src/app/globals.css`, this task file, and the matching handoff.
- **Acceptance criteria:**
  1. Intake rows show client name, trade/status, readiness, and expand to reveal existing details and actions.
  2. Private access rows show client name and expand to reveal the existing invitation form.
  3. Native disclosure behavior remains keyboard accessible and responsive.
  4. No data, permissions, invitation, or billing behavior changes.
- **Reviewers:** Morgan acceptance.
- **Required evidence:** Managed-client UI tests, typecheck, lint, and preview deployment.
