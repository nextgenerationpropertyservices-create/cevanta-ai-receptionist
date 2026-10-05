# Release checklist
- [ ] Task ownership and handoffs recorded; Architect and Quality reviews accepted.
- [ ] Typecheck, lint, meaningful tests, and production build pass.
- [ ] Live sign-in, membership and RLS checks pass against two tenants and all roles.
- [ ] Authenticated E2E customer → location → equipment/settings flow passes.
- [ ] Invalid input, empty, loading, denied, provider/database failure states verified.
- [ ] No real customer data, secrets, or credential-bearing logs/fixtures/screenshots.
- [ ] Migration tested on disposable database; backup taken for existing environments.
- [ ] Preview/staging env configured with publishable user session credentials.
- [ ] Health endpoint and safe server errors verified.
- [ ] Rollback and forward repair steps recorded.
- [ ] Explicit owner approval recorded before production deployment.
- [ ] New-client guided onboarding journey verified from first access or invitation through business details, services, hours, timezone, integrations, booking rules, escalation contacts, progress, helpful errors and readiness check.
- [ ] Dashboard save/retrieve/update verified through backend for customers, leads, jobs, scheduling, AI receptionist activity, tracked handoffs, estimates, follow-ups and reporting within approved scope.
- [ ] Authentication, role permissions and tenant data isolation verified for the complete journey on desktop and mobile.
- [ ] Client can complete ordinary setup and use the dashboard without editing code, database rows, environment files or configuration files.
- [ ] Coordinator updates project status, decisions, changes and backlog.


