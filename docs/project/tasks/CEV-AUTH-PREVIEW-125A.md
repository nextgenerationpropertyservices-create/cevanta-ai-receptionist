# CEV-AUTH-PREVIEW-125A — Preview signup callback repair

Status: implemented
Owner: Morgan — Product Manager and Orchestrator
Scope: Allow Vercel preview signup and password recovery callbacks to use the platform preview hostname when the explicit production origin is not configured.
Dependencies: Existing Supabase auth configuration; Vercel-provided `VERCEL_URL` and `VERCEL_ENV` on preview deployments.
Allowed files: `src/lib/server/password-recovery-origin.ts`, `tests/password-recovery.test.ts`, this task record, and the matching handoff.
Acceptance criteria: Preview callback origin is derived from a validated HTTPS Vercel hostname; production still fails closed without `APP_ORIGIN`; no credentials or user data are logged.
Required evidence: focused auth tests, typecheck, lint, and preview signup verification.
