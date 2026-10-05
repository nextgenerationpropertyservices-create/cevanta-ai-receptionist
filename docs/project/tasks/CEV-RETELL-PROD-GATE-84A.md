# Task CEV-RETELL-PROD-GATE-84A — Production Retell ingress gate

Owner: Morgan — Product Manager and Orchestrator
Scope: Replace the unconditional production Retell endpoint block with an explicit production opt-in gate while preserving disabled-by-default behavior.
Dependencies: CEV-VOICE-74A Retell writer foundation; CEV-DEPLOY-80A production deployment.
Allowed files: `src/app/api/integrations/retell/route.ts`; `tests/retell-ingress.test.ts`; `tests/retell-lead-writer.test.ts`; `.env.example`; task/handoff/status docs.
Acceptance criteria:
- Production Retell endpoint remains disabled unless `RETELL_INGRESS_PRODUCTION=enabled` is explicitly set.
- Non-production verifier behavior remains unchanged.
- Writer mode still requires `RETELL_INGRESS_LEAD_WRITER=enabled`, a valid connection ID and service-role RPC access.
- Tests cover production disabled-by-default and production explicit opt-in.
- Typecheck, lint, full tests, embedded database suites and production build pass.
Status: implemented and accepted locally; hosted deployment and live provider proof remain next.
