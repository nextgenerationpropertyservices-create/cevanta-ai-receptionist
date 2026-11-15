# CEV-PROJECT-AUDIT-167Q — Remove tracked personal setup data

- **Owner:** Morgan (`product_manager`)
- **Status:** Assigned
- **Scope:** Remove real owner email/Auth identifiers from tracked setup and historical project records, replace them with clear fictional/private placeholders, and ignore generated deployment/video artifact folders so they cannot be committed accidentally. Preserve truthful historical outcomes without retaining the personal identifiers.
- **Dependencies:** CEV-PROJECT-AUDIT-167C sensitive-data scan.
- **Allowed files:**
  - `.gitignore`
  - `context/NEXT_TASK.md`
  - `docs/project/PROJECT_STATUS.md`
  - `docs/project/tasks/CEV-AUTH-MEMBER-70D.md`
  - `docs/project/handoffs/CEV-AUTH-MEMBER-70D-morgan.md`
  - `supabase/setup-development-owner-targeted.sql`
  - `docs/project/handoffs/CEV-PROJECT-AUDIT-167Q-morgan.md`
- **Acceptance criteria:**
  1. No tracked file contains the identified real owner email addresses or Auth user UUID.
  2. The development SQL contains a non-routable placeholder and still fails safely until an operator replaces it privately.
  3. Historical docs retain the fact that a development membership was provisioned and an invite was rate-limited without retaining personal identifiers.
  4. `.deploy-worktree/` and `demo-video-output/` are ignored; existing contents are not deleted or modified.
  5. No credential values, customer data, or provider side effects are introduced.
- **Required reviewer:** Quinn (`quality_security`) through CEV-PROJECT-AUDIT-167C.
- **Required evidence:** Exact-pattern scan returns no matches, `git diff --check`, typecheck/lint if shared checks are run under the parent audit, and handoff.

