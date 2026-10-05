# Task CEV-RETELL-PROD-MAP-84B — Production Retell tenant mapping preparation

Owner: Morgan — Product Manager and Orchestrator
Scope: Prepare the server-owned Supabase mapping needed for a production Retell verifier/writer proof without enabling Vercel Retell env vars yet.
Dependencies: CEV-RETELL-PROD-GATE-84A; CEV-VOICE-74A.
Allowed files: `docs/project/tasks/CEV-RETELL-PROD-MAP-84B.md`; `docs/project/handoffs/CEV-RETELL-PROD-MAP-84B-morgan.md`; `docs/project/PROJECT_STATUS.md`.
Acceptance criteria:
- Mapping connects the current production workspace to the Retell agent ID through the reviewed private mapping table.
- Mapping is enabled.
- No service-role key, webhook signing secret or writer env var is stored in source.
- Live writes remain disabled until Vercel env configuration and signed payload test are separately completed.
Status: accepted with limitations.
