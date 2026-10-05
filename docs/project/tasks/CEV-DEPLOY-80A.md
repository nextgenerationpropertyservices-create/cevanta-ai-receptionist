# CEV-DEPLOY-80A — Production deployment preparation

Owner: Morgan — Product Manager and Orchestrator
Status: accepted with limitations
Date: 2026-10-05

## Scope

Prepare the Cevanta dashboard for production deployment on Vercel and record the production candidate after the owner connected GitHub and Vercel.

## Dependencies

- CEV-PACKAGE-79A installable app shell.
- Hosted Supabase project settings.
- GitHub repository connected by owner.
- Vercel project connected by owner.

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
- Deployment blockers and exact owner action are recorded when blocked. PASS for earlier blocked state.
- If Vercel CLI or connected project is usable, deploy production and record URL/status. PASS by GitHub/Vercel connected deployment.
- If deployment is blocked by auth/linking, record that as a blocked external action rather than claiming deployment. PASS for the earlier state; superseded after owner connected GitHub and Vercel.
- Verification commands/results are recorded. PASS.

## Evidence

Earlier local Vercel CLI deployment was blocked by CLI auth/linking issues. The owner then connected GitHub and Vercel outside the local CLI path.

Current production records:

- GitHub repository: `https://github.com/nextgenerationpropertyservices-create/cevanta-ai-receptionist.git`
- Vercel production URL: `https://cevanta-ai-receptionist.vercel.app/`
- Vercel project: `cevanta-ai-receptionist`
- Production Supabase Auth URL configuration was updated for the Vercel origin during the launch work.
- Production sign-up/sign-in and authenticated workspace loading were owner-reported working.
- CEV-LAUNCH-LIVE-82A accepted with limitations for production lead persistence smoke.
- CEV-LAUNCH-LIVE-83A accepted with limitations for production customer persistence smoke.
- Hosted Retell and Make verifier routes are configured in no-writer mode; signed fictional verifier requests were accepted and unsigned requests rejected.

Local verification before deployment included `pnpm check` passing with typecheck, lint, app tests, embedded database suites, Retell lead-ingestion embedded suite and production build. Hosted browser and provider checks are recorded in their later launch tasks and handoffs.

## Remaining limitations

Production deployment exists, but this does not make Cevanta a fully automatic live-client SaaS yet. The remaining gates are live-provider writer activation, Make scenario activation, Retell/Make/Cevanta writer review, SMS/email/calendar writes, billing, role-browser matrix, backup/restore/CI evidence and first-client approval boundaries.

No payment flow was enabled by this task. No SMS/email/calendar writer, Make always-on activation, Retell production writer or live booking automation is accepted by this deployment record.

## Follow-up evidence

2026-10-05 read-only production health check returned status ok with databaseConfigured true. This did not trigger provider calls, payments, SMS/email/calendar writes or production lead writer behavior.

