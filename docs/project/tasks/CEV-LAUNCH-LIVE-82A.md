# Task CEV-LAUNCH-LIVE-82A — Production authenticated lead persistence smoke

Owner: Morgan — Product Manager and Orchestrator
Scope: Verify authenticated production workspace access and one fictional lead create/reload path after live deployment.
Dependencies: CEV-DEPLOY-80A; CEV-LAUNCH-SMOKE-81A; owner completed production sign-in.
Allowed files: `docs/project/tasks/CEV-LAUNCH-LIVE-82A.md`; `docs/project/handoffs/CEV-LAUNCH-LIVE-82A-morgan.md`; `docs/project/PROJECT_STATUS.md`.
Acceptance criteria:
- Authenticated owner workspace overview loads in production.
- Leads, jobs, calendar, onboarding, launch and integrations pages finish loading without console errors.
- A clearly fictional lead can be created in production.
- The fictional lead remains visible after reload.
- No external provider writer, SMS, email, calendar sync, payment or real customer data is used.
Status: accepted with limitations.
