# CEV-PROJECT-AUDIT-167U — Use authenticated Retell mapping commands

- **Owner:** Blake (`backend_logic`)
- **Status:** Accepted locally with limitations; deployment and hosted proof pending
- **Scope:** Update Retell mapping, pause, and health server actions to use the authenticated session client and the Architect-approved commands. Remove ordinary app dependence on the Supabase service-role client. Preserve safe result states, server-only connection configuration, and the rule that mapping does not publish an agent or prove provider ownership.
- **Dependencies:** Accepted CEV-PROJECT-AUDIT-167T command contract.
- **Allowed files:**
  - `src/app/actions/retell-provisioning.ts`
  - `src/app/workspaces/[tenantId]/integrations/page.tsx`
  - `src/app/workspaces/[tenantId]/integrations/retell-mapping-form.tsx`
  - `src/app/workspaces/[tenantId]/integrations/retell-pause-form.tsx`
  - `tests/retell-provisioning.test.ts`
  - `tests/integrations-ui.test.ts`
  - `docs/project/handoffs/CEV-PROJECT-AUDIT-167U-blake.md`
- **Acceptance criteria:**
  1. Mapping, pause, and health calls use the verified user's session client; no service-role client is imported or created.
  2. The database remains the final authority for internal-operator relationship and role checks; the server action keeps existing input validation and safe errors.
  3. Client workspace owners/admins can see only route health and cannot see controls that mutate routing.
  4. Cevanta internal owners/admins with an active managed-client relationship can map or pause the route; no provider ID is rendered after submission or in health state.
  5. Tests cover allowed internal management, client health-only behavior, denied mutation, configuration errors, conflicts, and absence of service-role use.
  6. Copy states that the operator must manually verify the Retell agent belongs to the client before mapping and that mapping does not publish, configure the phone number, or prove live delivery.
- **Required reviewer:** Quinn (`quality_security`) before acceptance or release.
- **Required evidence:** Focused positive/negative tests, service-client absence search, typecheck, lint, full Vitest, embedded mapping suite, limitations, and rollback instructions.

