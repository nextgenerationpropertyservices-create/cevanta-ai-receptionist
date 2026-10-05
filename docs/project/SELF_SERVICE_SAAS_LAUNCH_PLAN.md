# Cevanta self-service SaaS launch plan

Date: 2026-10-05
Coordinator: Morgan — Product Manager and Orchestrator

## Current launch position

Cevanta now has a working hosted-development foundation for an existing owner workspace:

- owner sign-in
- workspace access
- Setup load/save/reload
- Settings save
- leads, jobs and calendar foundation
- tenant-denial browser evidence
- local automated checks and embedded database checks

This is enough to demo a managed pilot honestly. It is not yet a full self-service SaaS launch because new HVAC owners cannot sign up, create their own business workspace, connect providers, choose a paid plan or activate live receptionist behavior without operator involvement.

## Launch sequence

### Phase 1 — Self-service account and workspace creation

Goal: an HVAC owner can create an account and a business workspace without administrator SQL.

Required work:

- owner signup or invite-first access model
- verified identity requirement
- atomic tenant creation
- owner membership creation
- first setup state initialization
- duplicate/concurrent signup protection
- safe recovery if provisioning partially fails
- no client-supplied role or tenant authority

Required evidence:

- one verified fictional owner can create one workspace
- duplicate form/retry creates no second workspace
- forged tenant/role input is ignored or rejected
- unverified identity cannot provision
- new workspace opens directly into Setup
- existing CRM/job/calendar tenant isolation still passes

### Phase 2 — Team and invitation lifecycle

Goal: an owner can add office users safely.

Required work:

- create invitation
- resend invitation
- revoke invitation
- member list
- role change
- remove member
- last-owner protection
- immediate access denial after removal

Required evidence:

- wrong recipient cannot accept
- expired/revoked invites fail safely
- replay is idempotent
- role downgrade removes restricted screens
- removal blocks tenant access

### Phase 3 — Billing and entitlement gates

Goal: paid or trial accounts can activate only what their plan allows.

Required owner decision:

- billing provider and first pricing plan

Required work:

- checkout
- billing portal
- subscription/trial state
- verified billing webhooks
- plan entitlement checks
- suspended account behavior

Required evidence:

- sandbox purchase, cancel and failed payment
- duplicate/out-of-order webhook handling
- no entitlement from browser return alone
- cross-tenant billing records cannot be read or changed

### Phase 4 — Provider connection and receptionist activation

Goal: each tenant can connect the approved voice stack safely.

Initial provider direction from owner:

- Retell AI
- Make.com
- Twilio
- Google Calendar

Required work:

- tenant-to-provider mapping
- private credential or connection references
- Retell webhook registration/read-back
- Twilio number routing policy
- Make scenario ownership and authentication model
- Google Calendar consent and calendar selection
- test-call flow with explicit side-effect controls
- activation gate that stays blocked until tests pass

Required evidence:

- invalid/stale signatures rejected
- wrong tenant mapping rejected
- duplicate and out-of-order calls produce one outcome
- failed provider call leaves a visible pending/failed state
- no SMS/email/calendar write occurs without explicit activation
- one fictional live test call appears in Cevanta with safe evidence

### Phase 5 — Production release

Goal: a controlled production release candidate can be approved.

Required owner decisions:

- domain
- production hosting account
- sender email/domain
- backup/recovery target
- production approval

Required work:

- staging environment
- production Supabase project
- migration reconciliation
- hosted CI with all database checks
- production environment inventory
- Auth redirects and SMTP
- monitoring and alerting
- privacy-safe logs
- backup and restore drill
- rollback rehearsal

Required evidence:

- exact candidate revision
- successful hosted CI
- staging signup/setup proof
- all-role hosted tenant isolation proof
- backup restore proof
- monitoring alert proof
- production approval record

## Safe customer-facing claim before full launch

Allowed now:

> Cevanta has a working managed-pilot foundation for HVAC missed-call recovery: business setup, lead capture, job tracking and calendar review are working in development with fictional test data.

Not allowed yet:

- “fully self-service”
- “live AI receptionist is connected”
- “24/7 automatic booking”
- “messages are sent”
- “calendar appointments are created automatically”
- “production-ready”
- “recovered revenue is proven”

## Recommended next implementation task

Start with **Phase 1: self-service account and workspace creation**. It unlocks real self-service onboarding without touching live voice or billing side effects.
