# Production deployment

Date: 2026-10-05
Owner: Morgan — Product Manager and Orchestrator
Task: CEV-DEPLOY-80A

Cevanta is deployed to Vercel production at `https://cevanta-ai-receptionist.vercel.app/`.

This release should still be sold only as a managed pilot with office review. It is not a fully automatic booking/SMS/email/calendar production system yet.

## Release candidate

Current release candidate includes:

- Secure multi-tenant dashboard foundation.
- Fresh owner signup and workspace provisioning flow.
- Customer, lead, job and internal calendar foundation.
- Setup/onboarding storage and readiness flow.
- Retell-first voice proof and Make safe-intake proof recorded with limitations.
- Launch, Integrations and Pilot pages for managed-pilot operation.
- Installable app shell for Windows and Android browser install after HTTPS hosting.

## Vercel configuration

The repository now includes `vercel.json` with:

- Framework: Next.js
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`

The repository also includes `.vercelignore` to keep local build folders, secrets, test artifacts and desktop helper files out of deployment uploads.

## Production environment variables

These Vercel Production variables are configured:

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server Supabase connection | Points to the Cevanta Supabase project. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser Supabase client | Publishable browser key only; no service-role key was added. |
| `APP_ORIGIN` | Auth redirect/callback origin | Set to `https://cevanta-ai-receptionist.vercel.app`. |

These server-only verifier variables are configured by name only. Secret values are not stored in source or docs:

- `RETELL_INGRESS_PROTOTYPE`
- `RETELL_INGRESS_PRODUCTION`
- `RETELL_INGRESS_CONNECTION_ID`
- `RETELL_INGRESS_TEST_SECRET`
- `MAKE_RETELL_INGRESS_ENABLED`
- `MAKE_RETELL_INGRESS_PRODUCTION`
- `MAKE_RETELL_INGRESS_CONNECTION_ID`
- `MAKE_RETELL_INGRESS_SECRET`

These server-only/live-provider writer variables remain intentionally unset or unverified for this managed-pilot release:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RETELL_INGRESS_LEAD_WRITER`
- `MAKE_RETELL_INGRESS_LEAD_WRITER`

Do not add service-role or live writer secrets until the Retell/Make writer path, tenant mapping, dedupe, logging and quality review are approved.

## Supabase production Auth settings

Supabase Auth URL configuration is updated:

- Site URL: `https://cevanta-ai-receptionist.vercel.app`
- Redirect URLs include:
  - `https://cevanta-ai-receptionist.vercel.app/auth/callback`
  - `https://cevanta-ai-receptionist.vercel.app/auth/recovery`
  - `http://127.0.0.1:3000/auth/recovery`
  - `http://127.0.0.1:3000/auth/callback`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/recovery`

## Deployment attempts already made

- Local `pnpm dlx vercel@latest --version` initially failed in the restricted sandbox, then succeeded with approval and reported Vercel CLI 62.2.0.
- `pnpm dlx vercel@latest whoami` failed because the latest CLI could not load an auth dependency under this machine's Node runtime.
- Pinned `pnpm dlx vercel@46.1.1 whoami` ran but reported that the saved Vercel token is invalid.
- Vercel connector is authenticated and shows team `nextgenerationpropertyservices-1486's projects`, but no linked Git projects are present.
- Local Git has no remote repository, so the Vercel connector cannot create a Git-linked production project yet.
- GitHub repository was created and local `main` was pushed to `https://github.com/nextgenerationpropertyservices-create/cevanta-ai-receptionist.git`.
- Vercel dashboard import created project `cevanta-ai-receptionist`.
- First deployment completed, then Production env vars were added and a production redeploy completed from commit `e4f6235`.

## Current production state

- Production URL: `https://cevanta-ai-receptionist.vercel.app/`
- Vercel deployment status: Ready after redeploy.
- Production health endpoint: `200` with `{"status":"ok","databaseConfigured":true}`.
- Live pages verified to load without creating accounts or sending email:
  - `/sign-in`
  - `/sign-up`
  - `/forgot-password`
  - `/auth/recovery`

## Remaining launch checks

These checks remain before selling this as more than a managed pilot:

1. Run a fresh signup with a private test inbox and confirm the email link opens on the production domain.
2. Run a password reset with a private test inbox and confirm the recovery link opens on the production domain.
3. Sign in and verify workspace pages load against hosted Supabase.
4. Test setup save/reload, lead save/reload, job save/reload and calendar save/reload with fictional data.
5. Confirm installable app behavior from Windows Edge/Chrome and Android Chrome.
6. Keep Retell live writer, SMS/email/calendar external writes and billing disabled until separately approved.

