# CEV-CONNECT-146A handoff

- **Task ID:** CEV-CONNECT-146A
- **Owner:** Morgan
- **Completed:** Simplified the Retell connection area into a four-step client connection flow. It explains draft creation, phone assignment, the Agent ID-only mapping, and the fictional test call. The existing owner/admin server-side mapping, status, and pause controls remain unchanged.
- **Files changed:** `src/app/workspaces/[tenantId]/integrations/page.tsx`, `src/app/workspaces/[tenantId]/integrations/retell-mapping-form.tsx`, `tests/integrations-ui.test.ts`, `docs/project/tasks/CEV-CONNECT-146A.md`.
- **Database changes:** None.
- **API or contract changes:** None.
- **Verification:** `pnpm test -- tests/integrations-ui.test.ts` passed (49 files / 882 tests); `pnpm typecheck` passed; `pnpm lint` passed. Production build not rerun; known local OneDrive/Turbopack CSS worker issue remains documented.
- **Limitations:** The flow still requires the operator to create the Retell agent and assign its phone in Retell. It does not publish agents, change phone routing, or enable provider writes. Phone numbers are not stored in the Cevanta mapping contract.
- **Risks:** A wrong Agent ID is rejected by the existing server action; a valid but incorrect client Agent ID must still be caught by the fictional test call.
- **Rollback:** Revert the two integration UI files and focused test changes; no migration rollback is needed.
- **Next action:** Review the Integrations page in an authenticated workspace, then approve production deployment if the guided copy is acceptable.
