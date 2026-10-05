# Autonomous completion acceptance

Owner instruction: Build the documented business/product with the specialist team; make routine choices autonomously; bring the owner in only for important decisions or required access; verify work before progressing to dependent stages.

Coordinator: Morgan. Authorization covers development implementation and verification; production release requires separate explicit approval. Business registration, purchases, pricing promises, legal agreements and customer communications are not inferred from software-build authorization.

## Current acceptance matrix

| Scope | Evidence | Remaining gate |
| --- | --- | --- |
| Auth and membership | Private owner sign-in; recovery implemented, Architect/Quality approval, 38 recovery tests and safe UI checks | Recovery provider configuration and private end-to-end test; invitations; live all-role/session tests |
| CRM | Implemented with architecture/security reviews, local SQL/action tests; owner-reported persistence | Independent remaining authenticated CRM flow verification |
| Leads | Implemented and reviewed; local SQL/action tests; owner-reported persistence | Independent live transitions/retries and tenant boundaries |
| Jobs | Hosted migration003 verified; owner create/edit/reload PASS | Technician assignment and multiuser/JWT denial checks |
| Calendar | Hosted migration004 verified; owner create/reschedule/reload PASS | Live cancel, role/assignment and cross-tenant checks |
| AI calls and human handoffs | Provider-independent ports only | M4 schema/contracts, real provider verification, routing, retries, live calls, handoff policy |
| Estimates/follow-up | Not implemented | Currency/tax/delivery/acceptance/consent policy, implementation and evidence |
| Revenue recovery | Not implemented | Owner-approved attribution and actual payment/revenue source |
| Operations | Local 350 tests/four SQL/build PASS; final build rerun after last changes; strengthened denial tests reviewed; preview restored | Hosted CI, migration history reconciliation, backup restore, production approval |
| Business launch | Blueprint exists | Pricing, usage, market, registration, legal/support policies and owner-approved launch |

## Decision and access queue

- Twilio selected by owner on 2026-10-02: existing account; business registration may be arranged. No credential or registration completion inferred.
- Retell AI and Make.com confirmed by owner; a working Make system already exists. Preserve it and integrate Cevanta after read-only discovery of actual scenario steps/events. No replacement workflow or live provider change authorized by inference.
- Handoff and escalation rules need owner business policy before live activation.
- Estimate currency/tax, delivery and acceptance policy require an approved business contract.
- Recovered revenue must use an approved measurable definition and actual source; do not label estimates as recovered cash.
- Test identities and memberships are protected operations; do not change existing users to fabricate live test evidence.
- Team works in specialist waves with exact ledger ownership; contracts and migrations receive Architect review, security and cross-module changes receive Quality review.

## Stage gate

Before accepting a task: inspect the changes and complete user flow, run type/lint/meaningful tests/database checks/build as applicable, obtain required independent reviews, exercise accessible live behavior, record limitations and evidence. A blocked external check permits independent preparation, not acceptance of that blocked criterion or dependent production activation.

