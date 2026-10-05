# Task CEV-LAUNCH-LIVE-83A — Production customer persistence smoke

Owner: Morgan — Product Manager and Orchestrator
Scope: Verify one fictional customer create/reload path in the hosted production app.
Dependencies: CEV-DEPLOY-80A; CEV-LAUNCH-SMOKE-81A; CEV-LAUNCH-LIVE-82A; owner production sign-in.
Allowed files: `docs/project/tasks/CEV-LAUNCH-LIVE-83A.md`; `docs/project/handoffs/CEV-LAUNCH-LIVE-83A-morgan.md`; `docs/project/PROJECT_STATUS.md`.
Acceptance criteria:
- Production Customers page loads for the authenticated owner workspace.
- A clearly fictional customer can be created in production.
- The fictional customer remains visible after reload.
- No external provider writer, SMS, email, calendar sync, payment or real customer data is used.
Status: accepted with limitations.
