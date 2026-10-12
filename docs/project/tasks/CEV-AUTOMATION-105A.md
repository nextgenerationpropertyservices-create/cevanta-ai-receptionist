# CEV-AUTOMATION-105A — Optional client automation controls

- Task ID: CEV-AUTOMATION-105A
- Owner: Morgan — Product Manager and Orchestrator
- Scope: Add client-by-client controls for SMS, email, external calendar writes, automatic booking, payment collection, subscription billing, and dispatch automation. Store each option with client visibility, owner approval, activation state, test evidence, rollback plan, and provider notes. Show payment-related gates on Billing. Do not implement live provider side effects in this task.
- Dependencies: Existing workspace membership authorization, Settings role boundaries, Supabase RLS helpers, Integrations and Billing workspace pages.
- Allowed files:
  - `src/lib/automation-controls.ts`
  - `src/lib/server/automation-control-queries.ts`
  - `src/app/actions/automation-controls.ts`
  - `src/app/workspaces/[tenantId]/integrations/page.tsx`
  - `src/app/workspaces/[tenantId]/integrations/automation-control-form.tsx`
  - `src/app/workspaces/[tenantId]/billing/page.tsx`
  - `src/app/globals.css`
  - `supabase/migrations/202610120003_workspace_automation_controls.sql`
  - `supabase/tests/workspace_automation_controls.sql`
  - `scripts/test-db-embedded.mjs`
  - `tests/integrations-ui.test.ts`
  - `tests/billing-ui.test.ts`
  - `tests/automation-controls.test.ts`
  - `docs/project/PROJECT_STATUS.md`
  - `docs/project/handoffs/CEV-AUTOMATION-105A-morgan.md`
- Acceptance criteria:
  1. Owners/admins can track all seven requested automation options per workspace.
  2. Non-owner/admin users can view safe summaries but cannot save automation controls.
  3. Active status requires requested=true, owner approval, test evidence, and rollback plan in both app validation and database constraints.
  4. Database RLS allows tenant members to read controls and only tenant owner/admin users to insert/update them.
  5. Billing page shows payment collection and subscription billing as optional controlled gates without collecting cards or charging money.
  6. No live SMS, email, external calendar, booking, payment, subscription, or dispatch side effect is added by this task.
- Required evidence:
  - Focused UI/unit tests for Integrations, Billing, and validation.
  - Embedded database migration/RLS/check-constraint test.
  - Typecheck, lint, full test suite, and production build.
  - Handoff with limitations, rollback notes, and exact next action.
- Review requirements: Architecture and Quality review required before acceptance because this adds a migration, shared automation contract, and security-sensitive controls.

