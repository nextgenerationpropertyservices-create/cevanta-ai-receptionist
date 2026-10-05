# Cevanta product requirements

Cevanta is one configurable multi-tenant CRM and AI receptionist application for HVAC and other trades. Office staff coordinate customer work; field technicians use accessible mobile screens. Each tenant isolates customers, contacts, locations, equipment, leads, calls, jobs, appointments, users, and settings.

## Milestone 1 scope
Verified Supabase password sign-in, tenant membership selection, five roles, database tenant isolation, workspace settings, customer creation/list/detail, contacts schema, locations and HVAC equipment, fictional demo seed, audit events, setup and release guidance.

No public signup, tenant self-provisioning, or live voice providers in M1. Memberships are provisioned by a trusted database administrator. Application requests use publishable-key user sessions, never the service role.

| Capability | Owner | Admin | Dispatcher | Technician | Viewer |
| --- | --- | --- | --- | --- | --- |
| Read member workspace CRM | Yes | Yes | Yes | Yes | Yes |
| Create/update CRM records | Yes | Yes | Yes | No | No |
| Edit workspace settings | Yes | Yes | No | No | No |
| Provision users/memberships | Trusted provisioning only | Trusted provisioning only | No | No | No |

Technicians receive read-only tenant CRM access in M1. Assignment-scoped job permissions come with dispatch and jobs. No role can read another tenant merely by knowing its identifier.

## Security and data requirements
UUID primary keys; tenant_id on every business record; composite parent references bind entities to the same tenant. RLS enforces all authenticated reads and writes. User-supplied IDs are untrusted and validated server-side. Audit events are atomic database changes containing entity identifiers and operation names, not customer notes, credentials, or full row payloads.

Use Zod for user input, safe error text, secure auth cookies, and server-side authorization. Storage is private; unused storage paths grant no customer access. Future webhooks require signature verification, trusted tenant-provider mappings, and durable unique provider event IDs.

## Acceptance and evidence
A user can access only member workspaces. Direct PostgREST/database requests cannot cross tenant boundaries. Authorized office users create customers, add locations, attach equipment. Technician/viewer writes fail. Loading, empty, invalid, forbidden, and failed states exist. Typecheck, lint, meaningful tests, build, live auth, SQL RLS and authenticated browser flows all require recorded evidence. External checks may be blocked but cannot be called passed.

