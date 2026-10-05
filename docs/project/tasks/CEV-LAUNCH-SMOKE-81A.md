# Task CEV-LAUNCH-SMOKE-81A — Production launch smoke evidence

Owner: Morgan — Product Manager and Orchestrator
Scope: Verify production public launch surfaces after initial Vercel deployment and Supabase Auth URL configuration.
Dependencies: CEV-DEPLOY-80A production deployment and Supabase URL configuration.
Allowed files: `docs/project/tasks/CEV-LAUNCH-SMOKE-81A.md`; `docs/project/handoffs/CEV-LAUNCH-SMOKE-81A-morgan.md`; `docs/project/PROJECT_STATUS.md`.
Acceptance criteria:
- Production health endpoint responds successfully.
- Public auth pages respond successfully.
- Installable app manifest, service worker and icons respond successfully.
- Browser sign-up page loads with no console warnings/errors.
- No real signup, email, payment, customer data or provider writer is triggered.
Evidence required: HTTP status results and browser observation.
Status: accepted with limitations.
