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
| High | Make-to-Cevanta bridge private credential | Cevanta must authenticate Make before trusting bridge traffic. The private bridge secret must not appear in docs, chat, screenshots, visible scenario notes or normal HTTP fields. | Use the private Cevanta Bridge Make app/credential path, then run one fictional verifier-only test before enabling any writer. |
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
## Current launch gates after production deployment

Priority: High
Why it matters: The public Vercel app exists, but live client use still depends on provider and business gates.

Current state: production app is deployed at `https://cevanta-ai-receptionist.vercel.app/`; owner production sign-in and limited fictional lead/customer persistence are accepted with limitations; Retell and Make bridge endpoints are in verifier-only no-writer mode.

Do not complete without owner approval if it can charge money or contact/change a live external system:

1. Add Retell credits or change billing/recharge settings.
2. Activate Make as always-on for live calls.
3. Enable Cevanta production writer envs for Make/Retell lead creation.
4. Send SMS/email or create/update external calendar events.
5. Enable billing/payments or sell a committed self-service plan.
6. Run a live client pilot outside the managed office-review boundary.


## Pilot demo recording

Priority: Medium
Why it matters: A reusable 5–8 minute demo video lets prospects self-qualify before a live call.
Ready action: record the demo using docs/business/ONE_TIME_DEMO_VIDEO_SCRIPT.md and docs/business/PILOT_DEMO_RECORDING_CHECKLIST.md. Use fictional data only and review the recording before sending.
Success looks like: no secrets/private data visible, managed-pilot boundary is clear, and the call to action is a 10-minute fit call.


## Current live-pilot gate — 2026-10-09

CURRENT STEP: Prove one controlled live writer test for office-review lead creation.
WHY: Retell and Make can already deliver safe analyzed-call data to Cevanta verifier mode, but the pilot is not fully live until a real call creates exactly one dashboard lead for office review.
DO THIS: Before turning the writer on, confirm the private hosted Retell mapping uses the current live agent `agent_b44c3917587cfd493655ff75b2`, then run one fictional HVAC service call. Do not enable SMS, email, calendar booking, payment, quotes or dispatch.
SUCCESS LOOKS LIKE: the dashboard shows one new fictional office-review lead from the call; repeating the same event does not create a duplicate; no customer message or appointment is sent automatically.

## Live writer proof completed — 2026-10-10

CURRENT STEP: Run one real Retell phone call using fictional details and confirm it appears in the dashboard.
WHY: The synthetic live Make/Cevanta proof now works, but the final pilot confidence check is a real phone-number call through Retell using made-up caller data.
DO THIS: Call the Retell number, give fictional HVAC service details, do not use real customer data, then check the Cevanta Leads page for one new office-review lead.
SUCCESS LOOKS LIKE: one fictional lead appears in the correct workspace, no duplicate is created on replay, and no appointment/SMS/email/calendar/payment/dispatch action happens automatically.

Important security follow-up: rotate the Supabase service-role key after this pilot validation because it was revealed during setup. Keep the replacement only in Vercel server-side secrets.
