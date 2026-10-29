# CEV-INVITE-CONT-169C — Invitation bootstrap and continuation UI

- **Owner:** Nova (`frontend_ux`)
- **Status:** Accepted with limitations after CEV-INVITE-CONT-169D review
- **Scope:** Replace the query-token invite page with a no-index fragment bootstrap and a fixed `/invite/continue` experience. No raw token, request ID, tenant, role, email, or continuation may be rendered in DOM, props, forms, storage, or errors.
- **Dependencies:** Accepted 167P contract; server actions/route from 169B.
- **Allowed files:**
  - `src/app/invite/page.tsx`
  - `src/app/invite/layout.tsx`
  - `src/app/invite/invitation-bootstrap.tsx`
  - `src/app/invite/continue/page.tsx`
  - `tests/invitation-ui.test.ts`
  - `tests/e2e/invitation-continuation.spec.ts`
  - `docs/project/handoffs/CEV-INVITE-CONT-169C-nova.md`
- **Acceptance criteria:** Immediate fragment removal; exact v/r/t validation; same-origin bounded POST; generic recovery; fixed replace to `/invite/continue`; no sign-up shortcut; signed-out fixed sign-in link; signed-in identifier-free acceptance form; noindex metadata; no third-party content; keyboard/mobile states; history/refresh/source tests.
- **Required reviewer:** Quinn before release.
- **Required evidence:** Render/source tests, browser history/referrer/network checks where available, secret scans, typecheck/lint/full tests/build, limitations, and no-deploy statement.

