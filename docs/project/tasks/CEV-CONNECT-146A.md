# CEV-CONNECT-146A — Simple client agent connection

- **Owner:** Morgan (Product Manager)
- **Scope:** Make the existing Retell mapping screen an easy, guided connection flow with clear steps, a single Agent ID field, visible status, and a safe test checklist.
- **Dependencies:** Existing owner/admin Retell mapping action and server-side Make routing configuration.
- **Allowed files:** `src/app/workspaces/[tenantId]/integrations/page.tsx`, `src/app/workspaces/[tenantId]/integrations/retell-mapping-form.tsx`, `tests/integrations-ui.test.ts`, this task record, and the handoff.
- **Acceptance criteria:**
  1. An owner/admin can follow a short numbered flow from Retell draft to Cevanta mapping.
  2. The form clearly accepts only a Retell Agent ID and never asks for a webhook or secret.
  3. The current route status and reversible pause action remain visible.
  4. A post-save checklist explains how to assign the phone and run a fictional test call.
  5. Existing authorization and provider-side-effect boundaries are unchanged.
- **Required evidence:** focused UI test, typecheck, lint, and task handoff with limitations.
