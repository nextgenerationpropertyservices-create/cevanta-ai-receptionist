# Client dashboard and guided onboarding requirement

Status: required product outcome recorded on 2026-10-03. This is not accepted as complete.

Cevanta must deliver a fully functional frontend dashboard connected to a working backend, with simple guided onboarding for non-technical business owners.

## Required outcome

A new client should be able to get access, complete ordinary setup in the app, pass a readiness check and use the dashboard without editing code or configuration files.

The journey starts with account creation or invitation and continues through business profile setup, services, hours, timezone, integrations, booking rules, escalation contacts, readiness status and normal dashboard use.

## Functional requirements

- Dashboard features save, retrieve and update real data through protected backend workflows.
- Authentication, role permissions and tenant/client data isolation must work correctly.
- Customers, leads, jobs, scheduling, AI receptionist activity, tracked handoffs, estimates, follow-ups and reporting must function within their approved scope.
- Guided onboarding must cover account creation or invitation, business details, services, hours, timezone, integrations, booking rules and escalation contacts.
- Setup must show progress, missing requirements, helpful errors and a readiness check.
- Clients must complete ordinary setup and use the dashboard without editing code, database rows, environment files or configuration files.
- The interface must work well on desktop and mobile.

## Current acceptance boundary

This requirement preserves all approved safety gates. It does not authorize production deployment, live provider activation, external message/call/calendar writers, pricing/tax decisions, customer-facing estimates, payments, financing, revenue claims, service-role ordinary requests, weakened authorization, or storing real customer data in fixtures/evidence.

Do not declare the platform complete based only on mockups, isolated modules, passing builds or local source evidence. Completion requires an end-to-end verified journey from first access through guided onboarding to a usable dashboard, with role isolation and real persistence proven through the backend.

## Known high-level gaps to verify

- Invitations and first-access onboarding are not yet accepted as complete.
- Business setup may require direct configuration or manual intervention today.
- Live multiuser/JWT/PostgREST role coverage remains open.
- AI receptionist activity, tracked handoffs and provider-connected status remain limited by no-writer Retell/Make gates.
- M5 estimates/follow-ups are still in contract review before implementation.
- Reporting and recovered-revenue definitions are not implemented.
- Hosted CI, restore evidence, full live release readiness and production approval remain open.

The gap audit task CEV-JOURNEY-GAP-37 owns the first coordinated review of unfinished work against this requirement.
