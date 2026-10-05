# CEV-DEPLOY-80A — Production deployment preparation

Owner: Morgan — Product Manager and Orchestrator
Status: blocked on Vercel authentication/linking
Date: 2026-10-05

## Scope

Prepare the Cevanta dashboard for production deployment on Vercel and attempt deployment if the connected project/authentication state allows it.

## Dependencies

- CEV-PACKAGE-79A installable app shell.
- Hosted Supabase development/project settings already available.
- Vercel account/team access.

## Allowed files

- `vercel.json`
- `.vercelignore`
- `docs/project/PRODUCTION_DEPLOYMENT.md`
- `docs/project/tasks/CEV-DEPLOY-80A.md`
- `docs/project/handoffs/CEV-DEPLOY-80A-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/OWNER_ATTENTION.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `MEMORY.md`
- `README.md`

## Acceptance criteria

- Production build configuration is recorded for Vercel. PASS.
- Production environment variables are listed by name only; no secret values are stored. PASS.
- Deployment blockers and exact owner action are recorded. PASS.
- If Vercel CLI or connected project is usable, deploy production and record URL/status. BLOCKED.
- If deployment is blocked by auth/linking, record that as a blocked external action rather than claiming deployment. PASS.
- Verification commands/results are recorded. PASS.

## Evidence

- Vercel connector shows team `nextgenerationpropertyservices-1486's projects` but no linked Git projects.
- Local Git has no remote repository configured.
- `pnpm dlx vercel@latest --version` succeeded after approval and reported Vercel CLI 62.2.0.
- `pnpm dlx vercel@latest whoami` failed because `@vercel/cli-auth` could not be resolved under the pnpm/Node runtime.
- `pnpm dlx vercel@46.1.1 whoami` ran but reported an invalid saved token.
- `pnpm dlx vercel@46.1.1 login nextgenerationpropertyservices@gmail.com` failed because Vercel disabled the legacy login flow.
- `pnpm dlx --package vercel@latest --package @vercel/cli-auth vercel login` still failed to resolve `@vercel/cli-auth`.
- `pnpm typecheck` PASS.
- `pnpm lint` PASS.
- `pnpm build` PASS with protected workspace routes included.
- `pnpm check` PASS: typecheck, lint, 22 Vitest files / 747 tests, embedded database suites, Retell lead-ingestion embedded suite and production build.

## Current blocker

Production deployment is blocked until either:

1. Vercel CLI login is repaired on this Windows machine, or
2. The project is pushed to a GitHub/GitLab/Bitbucket repository that the connected Vercel team can access, or
3. A valid Vercel token is provided through a secure local environment, not pasted into chat or source.

## Limitations

No production URL exists yet. Supabase Auth production redirect URLs cannot be completed until a production URL exists. No live Retell writer, SMS/email/calendar writer, billing or public client commitment was activated.