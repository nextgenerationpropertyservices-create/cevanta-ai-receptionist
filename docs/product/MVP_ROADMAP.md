# Cevanta product roadmap

Last reviewed: 2026-10-26 (America/New_York)

## Current product state

Cevanta is past the original foundation-only milestone. The production application now has a multi-tenant front-office dashboard and an internal operator workspace. This table separates working application features from guarded workflows and planned products.

| Area | Current state | Evidence boundary | Next gate |
| --- | --- | --- | --- |
| Authentication and tenant access | Working in the application | Supabase sign-in, workspace membership, roles, server checks, and RLS-backed data access exist | Repeat hosted role/isolation evidence for each major release |
| Client onboarding | Working in the application | Guided setup, trade starters, milestones, invitations, and internal progress monitoring exist | Prove a fresh first-client journey from invitation through launch evidence |
| Front-office CRM | Working in the application | Customers, leads, jobs, appointments, technicians, attention queue, calendar, and reports are stored per workspace | Continue usability, accessibility, and outcome-reporting polish |
| Retell/Make lead intake | Available as a guarded managed workflow | Trusted mapping, gated ingress, deduplication, and office-review lead creation exist | Verify the route and one fictional end-to-end call separately for every client |
| Email and external calendar | Authorization/setup support only | Cevanta can create a private Make authorization request and store readiness decisions | Build, test, observe, and approve actual provider execution before calling it live |
| SMS | Not live | Readiness controls and compliance guidance exist | Complete sender/compliance setup, consent and opt-out handling, delivery tests, and rollback plan |
| Automatic booking and dispatch | Not live | Internal calendar/job workflows and guarded readiness controls exist | Build conflict-safe execution and prove rollback before any automatic confirmation or dispatch |
| Billing | Manual payment-link workflow | Internal operators can create adjustable Stripe-hosted requests; Cevanta does not store card data | Add verified payment state/webhooks and subscriptions only after a separate contract and security review |
| Seasonal maintenance Reactivator | Guarded application workflow | Candidate selection, drafts, office approval, dismissal, and internal visit creation exist | Add compliant outbound conversation and external calendar execution only after provider tests and approval |
| Lead Rescue Starter | Available as a manual starter offer | Up to 25 client-approved records can be reviewed in the existing lead workspace; no outreach is sent | Validate the offer with early prospects, then decide whether an import tool is needed |
| Quote Follow-Up | Planned — not live | Product definition and catalog entry only | Define estimate-source contract, consent, reply handling, manager escalation, and measurable outcomes |
| Blueprint & Scope Intake | Planned — not live | Product definition and catalog entry only | Define secure document ingestion, retention, extraction review, and estimator sign-off |

## Current build order

1. Keep every workspace status truthful and client-specific.
2. Complete a repeatable first-client onboarding and fictional end-to-end call with retained evidence.
3. Make email and calendar execution observable, retry-safe, approval-gated, and reversible.
4. Add outcome reporting based on recorded calls, leads, response time, confirmed appointments, unresolved work, and failures.
5. Add compliant SMS only after business registration, consent, opt-out, and delivery evidence.
6. Build Quote Follow-Up as the next stand-alone paid product after its source contract is approved.
7. Build Blueprint & Scope Intake only after document security, retention, and human review requirements are approved.

## Release rule

Every slice still requires a scoped task, exact file ownership, meaningful tests, production build evidence, any required Architect/Quality review, and explicit owner approval before production deployment. A saved readiness switch is not proof that an external provider is connected or working.

## Historical milestone order

The original milestone order remains useful as architecture history: secure foundation → intake → jobs/calendar → voice intake → follow-up → reporting. It no longer describes the present implementation level; use the current-state table above for planning and sales claims.

