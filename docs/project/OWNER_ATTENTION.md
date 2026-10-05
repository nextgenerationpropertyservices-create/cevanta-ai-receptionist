# Owner attention list

Date: 2026-10-05
Owner: Heath
Coordinator: Morgan

Use this list when you return. These are decisions or actions I should not complete without you because they involve money, private accounts, production exposure, external messages, or client commitments.

## Needs your action before live client use

| Priority | Item | Why it matters | Ready action when you return |
| --- | --- | --- | --- |
| High | Retell credits | Retell showed a low credit warning. Live demos and client calls can fail if balance runs out. | Add credits or enable the Retell recharge setting you are comfortable with. |
| High | Retell-to-Make or Retell-to-Cevanta webhook activation | This turns live calls into downstream automation. It can create records or trigger workflows. | Approve the exact path: Retell → Make safe intake, Retell → Cevanta, or both in stages. |
| High | Production deployment approval | Public production launch changes who can access the app and may expose live workflows. | Approve a concrete release candidate after final checks. |
| High | First live client/pilot boundary | Sales language must match what is proven. | Decide whether the first offer is “managed pilot with office review” only. Recommended: yes. |
| Medium | SMS/email/calendar writes | These contact customers or change schedules outside the app. | Approve each channel separately after wording, consent, and rollback rules are reviewed. |
| Medium | Twilio business/SMS registration | Needed before serious SMS/business messaging through Twilio. | Finish or defer Twilio registration. Current path is Retell voice first. |
| Medium | Fresh owner signup proof | Full self-service signup needs a fresh test inbox confirmation. | Provide/approve a test inbox for signup proof, or do the confirmation email step yourself. |
| Medium | Pricing and package | We should not invent pricing or billing terms without you. | Choose pilot price, setup fee, monthly price, and what is included. |

## Safe work already completed while you were away

- Retell inbound phone answering was verified from Retell Call History as a successful ended inbound call.
- Make safe intake scenario was repaired and retested with fictional payloads; duplicates no longer run AddRecord and non-analysis events are ignored.
- Workspace Launch page was added and fully checked.
- Workspace Integrations page was added and fully checked.
- First-client sales packet, demo script and intake checklist were refreshed to match current evidence.

## Current honest launch position

Cevanta can be sold as a managed AI receptionist pilot with office review. It should not yet be sold as fully automatic production booking, SMS/email/calendar automation, or complete self-service SaaS.

## Recommended next owner decision

Approve this first offer wording before any real sales call:

“Cevanta is a managed AI receptionist pilot for HVAC businesses. It answers calls, captures service requests, and puts them into an office review flow. During the pilot, your office confirms appointments and customer messages before anything is finalized.”

## Production deployment unblock

Priority: High
Why it matters: Cevanta cannot get a production URL, Supabase production Auth redirects, or Windows/Android install testing until Vercel can deploy this local project.

What happened: the app is ready from a code/build standpoint and `pnpm check` passed, but deployment is blocked because the local folder has no Git remote/linked Vercel project and the Vercel CLI login on this machine is broken by an invalid saved token plus current CLI auth failure.

Ready action when you return: choose one unblock path:

1. Log into Vercel successfully from this Windows machine, then I can run the deploy.
2. Push this project to GitHub/GitLab/Bitbucket and connect it to Vercel.
3. Add a valid Vercel token securely to the local environment without pasting it into chat/source.
