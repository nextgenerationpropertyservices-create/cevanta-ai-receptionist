# CEV-ACCOUNT-141A — Workspace account settings

- **Owner:** Morgan — Product Manager and Orchestrator
- **Scope:** Add an Account section to workspace Settings showing the signed-in email and a secure password-change path.
- **Dependencies:** Existing Supabase Auth session and password recovery flow.
- **Allowed files:** workspace Settings page, settings UI test, this task record, matching handoff, and project status.
- **Acceptance criteria:** Email is visible for the current signed-in account; password is never displayed or stored; the Change password action uses the existing secure recovery flow; all roles can see their own account section.
- **Required evidence:** Settings UI test, typecheck, and lint. No production deployment without owner approval.
