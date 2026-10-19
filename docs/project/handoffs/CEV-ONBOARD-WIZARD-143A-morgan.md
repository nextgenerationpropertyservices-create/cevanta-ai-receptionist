# CEV-ONBOARD-WIZARD-143A handoff

- Task ID: CEV-ONBOARD-WIZARD-143A
- Owner: Morgan — Product Manager and Orchestrator
- Completed: Converted client owner/admin setup into a seven-step wizard: Business details, Services, Weekly hours, Date-specific hours, Request preferences, Escalation contacts, and Finish/review. Only the active section is visible; Back/Next controls return the user to the wizard heading. Added a compact progress summary and moved the detailed blueprint into an expandable panel.
- Changed files: `src/app/workspaces/[tenantId]/onboarding/page.tsx`; `src/app/workspaces/[tenantId]/onboarding/onboarding-wizard.tsx`; `src/app/globals.css`; `tests/onboarding-ui.test.ts`; `docs/project/tasks/CEV-ONBOARD-WIZARD-143A.md`.
- Database changes: None.
- API or contract changes: None. Existing server actions and validation are reused.
- Verification: `pnpm test -- tests/onboarding-ui.test.ts tests/client-onboarding-route-audit.test.ts` passed; configured runner executed 47 files / 874 tests. `pnpm typecheck` passed. `pnpm lint` passed.
- Build: `pnpm build` remains subject to the known local OneDrive/Turbopack `globals.css` worker panic; this feature did not change the database or provider path.
- Limitations: Manual signed-in browser review and production deployment are still pending. Saving a section and moving forward remain separate actions, with a visible reminder to save first.
- Risks: All wizard steps are rendered in the HTML but inactive steps use the native `hidden` attribute; only the active step is visible and available to assistive technology.
- Rollback: Revert the wizard component, onboarding page/CSS changes, updated test, and task documentation.
- Exact next action: Owner should open a client workspace Setup page, complete one fictional section, verify Save then Next, and approve a preview/production release if the flow is correct.
