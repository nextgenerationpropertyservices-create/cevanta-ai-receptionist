# Production deployment

Date: 2026-10-05
Owner: Morgan — Product Manager and Orchestrator
Task: CEV-DEPLOY-80A

Cevanta is ready for a Vercel production deployment attempt from a code/build standpoint, but the actual deploy is currently blocked by Vercel project linking or CLI authentication.

## Release candidate

Current release candidate includes:

- Secure multi-tenant dashboard foundation.
- Fresh owner signup and workspace provisioning flow.
- Customer, lead, job and internal calendar foundation.
- Setup/onboarding storage and readiness flow.
- Retell-first voice proof and Make safe-intake proof recorded with limitations.
- Launch, Integrations and Pilot pages for managed-pilot operation.
- Installable app shell for Windows and Android browser install after HTTPS hosting.

This release should be sold only as a managed pilot with office review. It is not a fully automatic booking/SMS/email/calendar production system yet.

## Vercel configuration

The repository now includes `vercel.json` with:

- Framework: Next.js
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`

The repository also includes `.vercelignore` to keep local build folders, secrets, test artifacts and desktop helper files out of deployment uploads.

## Required production environment variables

Set these in Vercel for Production. Store values only inside Vercel; do not paste them into chat or commit them.

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server Supabase connection | Current project URL is `https://rafiksklbrfgefkypvkn.supabase.co`. This URL is not secret. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser Supabase client | Use the Supabase publishable key only. Never use service-role key here. |
| `APP_ORIGIN` | Auth redirect/callback origin | Set to the final Vercel production URL after deployment, then update Supabase Auth redirect URLs to match. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Retell writer when enabled | Sensitive. Only needed if Retell lead writer is enabled. Never expose to browser. |
| `RETELL_INGRESS_PROTOTYPE` | Retell no-writer verification mode | Keep according to the current release path. |
| `RETELL_INGRESS_TEST_SECRET` | Retell webhook signature verification/test gate | Sensitive. Use a production secret only after webhook path approval. |
| `RETELL_INGRESS_LEAD_WRITER` | Retell-to-lead persistence switch | Keep disabled until live write path is approved. |
| `RETELL_INGRESS_CONNECTION_ID` | Server-owned Retell tenant mapping | Required only when writer mode is enabled. |

## Supabase production settings after URL exists

After the Vercel production URL exists, update Supabase Auth settings to allow:

- Site URL: the Vercel production URL.
- Redirect URL: `<production-url>/auth/callback`.
- Recovery redirect URL: `<production-url>/auth/recovery`.

Do not remove the current local development redirect URLs while local testing is still needed.

## Deployment attempts already made

- Local `pnpm dlx vercel@latest --version` initially failed in the restricted sandbox, then succeeded with approval and reported Vercel CLI 62.2.0.
- `pnpm dlx vercel@latest whoami` failed because the latest CLI could not load an auth dependency under this machine's Node runtime.
- Pinned `pnpm dlx vercel@46.1.1 whoami` ran but reported that the saved Vercel token is invalid.
- Vercel connector is authenticated and shows team `nextgenerationpropertyservices-1486's projects`, but no linked Git projects are present.
- Local Git has no remote repository, so the Vercel connector cannot create a Git-linked production project yet.

## Current blocker

Vercel needs one of these before I can complete the production deploy:

1. A working Vercel CLI login on this Windows machine, or
2. A GitHub/GitLab/Bitbucket remote repository connected to this local code, or
3. A user-approved inline deployment path for a small project. This project is not small, so Git or CLI is the safer path.

## Recommended next action

Use the Vercel CLI login path from this project folder:

```text
pnpm dlx vercel@46.1.1 login
```

Complete the browser/email login flow, then rerun deployment from this folder.

After login works, the deployment command should be:

```text
pnpm dlx vercel@46.1.1 deploy --prod
```

If Vercel asks to link/create a project, use:

- Project name: `cevanta`
- Framework: Next.js
- Build command: `pnpm build`
- Install command: `pnpm install --frozen-lockfile`
- Team: `nextgenerationpropertyservices-1486's projects`

## Post-deploy verification

After Vercel returns a production URL:

1. Open `/api/health` and confirm a safe healthy response.
2. Open `/sign-up` and `/sign-in`.
3. Update Supabase Auth URLs to the production domain.
4. Run a fresh signup or invite test with a private test inbox.
5. Sign in and verify workspace pages load.
6. Test setup save/reload, lead save/reload, job save/reload and calendar save/reload with fictional data.
7. Confirm the app can be installed from Windows Edge/Chrome and Android Chrome.
8. Keep Retell live writer, SMS/email/calendar external writes and billing disabled until separately approved.
Local release commit prepared: `cdca042` on branch `main`. It has no remote configured yet, so it is not pushed to GitHub.
