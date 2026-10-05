# CEV-AUTH-03 — Diagnose live sign-in rejection safely

- Owner: Coordinator; Backend owns src/app/actions/auth.ts; Quality owns tests/security.test.ts and docs/project/AUTH_SIGNIN_REVIEW.md.
- Scope: Expose actionable allowlisted Auth error categories and sanitized diagnostic metadata; diagnose actual sign-in without logging credentials/account identifiers or weakening Auth/RLS.
- Dependencies: Configured development Supabase, owner-created Auth account and reported membership setup.
- Allowed files: Backend src/app/actions/auth.ts and docs/project/handoffs/CEV-AUTH-03-backend.md; Quality tests/security.test.ts, docs/project/AUTH_SIGNIN_REVIEW.md, docs/project/handoffs/CEV-AUTH-03-quality.md; coordinator this task and verification records.
- Acceptance criteria: Invalid credentials remain generic; confirmed-email/rate-limit/unavailable errors actionable; only fixed allowlisted category and numeric HTTP status logged, never raw provider errors/form values/session objects; success redirect preserved; security tests/type/lint/build pass.
- Required evidence: Safe category tests; source security review; real error category if user form retry available without extracting credentials.
- State: assigned

## Coordinator evidence
- Backend implemented allowlisted error categories; typecheck, lint, existing 37 tests, embedded SQL assertions and production build passed.
- Live retry yielded unknown category without valid HTTP status. A credentials-free Auth settings request from the restricted process failed. Earlier unrestricted request returned HTTP 200.
- Likely blocker: development process network restrictions; password correctness is not established.
- Unrestricted diagnostic was not executed: automatic approval review failed due account usage limit. Quality agent also stopped at usage limit; expanded tests and independent final review remain incomplete.
- Restricted development server stopped. Owner must run development server in a normal local terminal and retry privately. Live sign-in remains unverified.
