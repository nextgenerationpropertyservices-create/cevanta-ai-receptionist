# CEV-CONNECT-146A handoff

- **Task ID:** CEV-CONNECT-146A
- **Owner:** Morgan
- **Completed:** Replaced direct PostgREST access to the private Retell mapping table with tightly scoped service-role RPCs. The Integrations page still provides the owner/admin mapping, status, pause controls, and four-step client connection guidance.
- **Files changed:** `src/app/actions/retell-provisioning.ts`, `src/app/workspaces/[tenantId]/integrations/page.tsx`, `src/app/workspaces/[tenantId]/integrations/retell-mapping-form.tsx`, `supabase/migrations/202610200001_retell_mapping_rpc.sql`, `tests/retell-provisioning.test.ts`, `tests/integrations-ui.test.ts`, `docs/project/tasks/CEV-CONNECT-146A.md`.
- **Database changes:** Migration `202610200001_retell_mapping_rpc` was applied to the configured Supabase project. The RPCs are service-role only and keep the private table out of the public Data API.
- **API or contract changes:** Server actions now call `retell_mapping_register`, `retell_mapping_health`, and `retell_mapping_pause`; no client-visible API contract changed.
- **Verification:** Supabase migration apply passed; direct fictional health check returned `active`; `pnpm test -- tests/retell-provisioning.test.ts tests/integrations-ui.test.ts` passed (49 files / 882 tests); `pnpm typecheck` and `pnpm lint` passed in the original checkout. The temporary worktree could not rerun pnpm because Windows symlink permissions blocked dependency linking. Production deployment `dpl_9vTyeoz3Wc6uFnUoSdBh4fK9ebsv` reached READY.
- **Limitations:** The flow still requires the operator to create the Retell agent and assign its phone in Retell. It does not publish agents, change phone routing, or enable provider writes. Phone numbers are not stored in the Cevanta mapping contract.
- **Risks:** A wrong Agent ID is rejected by the existing server action; a valid but incorrect client Agent ID must still be caught by the fictional test call.
- **Rollback:** Revert the mapping action/UI/test commit while retaining the RPC migration, or disable the route through the existing pause control. Do not expose the private schema through the Data API.
- **Next action:** Refresh the production Integrations page and confirm the mapped workspace shows `Route status: Active`.
