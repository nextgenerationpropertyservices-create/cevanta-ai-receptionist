# Cevanta — Business and Product Blueprint

Version: 1.0  
Date: October 2, 2026  
Owner: Morgan, Product Manager and Orchestrator  
Status: Business blueprint and implementation record. Launch acceptance is open.

## 1. Business purpose

Cevanta is a multi-tenant CRM and AI voice receptionist SaaS for HVAC businesses, with a configurable foundation intended to support other trade businesses later.

The product brings customer records, service locations, equipment, enquiries and office operations into one workspace. Its planned AI receptionist captures call outcomes, connects service requests to the right business, and tracks human follow-up.

One application serves multiple businesses. Each business has its own members, permissions, settings and isolated records. Cevanta must earn trust through reliable workflows and verified data isolation before onboarding real customers.

## 2. What is confirmed and what is still a decision

**Confirmed requirements:** HVAC-first product; configurable multi-tenant application; CRM and AI receptionist scope; five workspace roles; Supabase authentication and database isolation; Next.js application; documented milestone order; explicit owner approval before production deployment.

**Planned capabilities:** Calendar and appointments, provider-connected call outcomes, tracked human handoffs, estimates, follow-up and revenue recovery reporting. A roadmap entry does not establish that the capability is ready for customers.

**Proposed business practices:** Subscription packaging, paid pilot, assisted onboarding, customer support process and the launch sequence below. These are recommendations for the business, not existing contractual commitments.

**Owner decisions still required:** Voice/telephony provider; commercial pricing and usage limits; initial operating market and currency; estimate delivery/approval requirements; definition and source of recovered revenue; support commitments; integration accounts and operating policies.

No customer count, revenue forecast, market-size estimate or price has been assumed in this document.

## 3. Customers and users

### Primary customer

An HVAC business that needs a shared customer record and a reliable path from an incoming enquiry to office follow-up and scheduled service.

### Users inside each business

| User | Primary need |
| --- | --- |
| Business owner | Understand activity, control settings and oversee the team |
| Administrator | Maintain workspace records and settings |
| Dispatcher or office staff | Capture enquiries, manage customers, schedule work and assign technicians |
| Technician | Find assigned jobs and the information needed for field work |
| Viewer | Read permitted workspace information without making changes |

The initial CRM gives technicians read-only access to workspace CRM records. Jobs and their appointments use the owner's confirmed assigned-only technician visibility rule.

### Expansion

Other trade businesses are a later expansion opportunity. Validate the HVAC workflows first; do not promise trade-specific features before they are defined and tested.

## 4. Customer problem and value

Cevanta is intended to reduce gaps between the call, customer information, office follow-up and the service visit.

The core value comes from:

- One customer record with contacts, service addresses and equipment.
- A shared service-request inbox with priority, status and follow-up information.
- Office dispatch with jobs, dates and technician assignment.
- A calendar linked to jobs, with access that follows current assignment.
- Planned call outcomes and tracked handoffs so a call does not disappear after transfer.
- Planned estimates and reporting that use recorded business facts.

Claims such as increased revenue, fewer missed calls or reduced staffing cost require measured customer evidence. They are goals to evaluate, not proven results.

## 5. Product offering

### Secure workspace foundation

Verified sign-in, tenant membership, five roles, isolated database access, workspace settings and an audit trail of record changes. There is no public signup or ordinary application path for granting membership; trusted administration provisions access.

### Customer management

Customer directory and detail records; customer notes and contact information; additional contacts; service locations; HVAC equipment and identifying details. Office roles maintain business information. Read-only roles have no mutation controls and are denied writes on the server and in the database.

### Service intake

Manual leads and service requests with contact details, description, priority, status, optional customer linkage and a follow-up date. Submission identifiers protect creation retries from making duplicate records.

### Jobs and dispatch

Create and edit jobs, attach valid customer/location/lead references, assign existing workspace technicians, set a service date, filter the dispatch board and convert a lead into one job. Technicians see only jobs assigned to their verified identity while they remain a member of that workspace.

### Internal calendar

Job-linked appointments with a start, end and scheduled/cancelled state. Office roles create, reschedule and cancel. Technicians see appointments through their currently assigned jobs. The initial implementation uses explicitly labelled UTC input and display; local-time conversion and external calendar synchronization are not delivered by this flow.

### AI receptionist and calls — planned

Connect the selected provider, authenticate incoming events, map each event to the correct business, store minimal call outcomes, link appropriate leads without duplicates and track follow-up. Provider branding or interface definitions alone do not constitute a working receptionist.

### Human handoffs — planned

Track requested, assigned, acknowledged, resolved and failed handoffs. A transfer completing is distinct from a human resolving the work. Assignment rules, timeout escalation and recipient policies must be defined before activation.

### Estimates and follow-up — planned

Support a defined estimate workflow linked to the customer/job. Currency, tax treatment, line items, sending, customer acceptance and reminder rules must be agreed before implementation can be accepted. The existing lead follow-up date is a manual reminder field, not an automated follow-up service.

### Revenue recovery reporting — planned

Show business activity from recorded facts. Recovered revenue needs an agreed attribution rule and a reliable source of actual revenue. An estimate amount, an accepted job and paid revenue are different measures and must be labelled separately.

## 6. Primary end-to-end journeys

### Business setup

1. A trusted operator prepares the business workspace and verified accounts.
2. Members receive the intended roles through trusted administration.
3. The owner signs in and confirms access to the correct workspace.
4. Settings and fictional test records are checked before real onboarding.
5. Provider accounts and integrations are connected only after reviewed implementation and private configuration.

### Office intake to service visit

1. Create or find the customer.
2. Maintain customer contacts, service locations and equipment.
3. Record the enquiry and its priority/follow-up.
4. Convert the enquiry into one job, or create a job directly.
5. Assign a workspace technician and schedule the work.
6. Add a job appointment where a specific interval is needed.
7. Office staff maintain job status; current technician access follows the assignment.

### AI call to tracked follow-up — target journey

1. The selected voice provider receives the call.
2. Authenticated provider events reach Cevanta through a reviewed integration boundary.
3. A server-owned account mapping determines the business.
4. A durable transaction stores the receipt, minimal outcome and related lead/handoff updates.
5. Retries do not create duplicate business records or repeated side effects.
6. An authorized person acknowledges and resolves the handoff.
7. Reporting reflects the recorded outcome, with financial attribution only when its definition and data source exist.

This journey remains unverified until the provider, implementation, account access and live acceptance tests are complete.

## 7. Roles and access

| Capability | Owner | Admin | Dispatcher | Technician | Viewer |
| --- | --- | --- | --- | --- | --- |
| Read member-workspace CRM | Yes | Yes | Yes | Yes | Yes |
| Maintain CRM and intake | Yes | Yes | Yes | No | No |
| Change workspace settings | Yes | Yes | No | No | No |
| Read jobs/appointments | All in workspace | All in workspace | All in workspace | Currently assigned jobs | All in workspace |
| Create/edit/schedule jobs and appointments | Yes | Yes | Yes | No | No |
| Grant membership or roles | Trusted administration only | Trusted administration only | No | No | No |

Knowing a record or workspace identifier never grants access. Every protected operation verifies the user and current membership; database row-level security independently enforces isolation.

## 8. Data and trust model

Business records use tenant identifiers and same-tenant parent relationships. Ordinary requests use the signed-in user's session and publishable key. They never use service-role credentials to bypass permissions.

Audit events record identifiers and operations atomically with changes. They do not copy customer notes, credentials or full record payloads into logs.

Provider events must authenticate exact signing inputs, reject invalid or stale deliveries, and resolve trusted tenant mappings. Durable unique event keys and atomic writes protect against retries. Transcripts, recordings and extra caller data require an explicitly reviewed storage/access/retention design before activation.

Credentials and real customer information must not appear in source, test fixtures, screenshots, logs or project documents. Testing uses fictional records and private credentials.

## 9. Technical operating model

| Layer | Selected foundation |
| --- | --- |
| Web application | Next.js App Router, React, TypeScript strict mode |
| Interface | Tailwind CSS and accessible application components |
| Validation | Zod and database constraints |
| Identity and database | Supabase Auth/Postgres with row-level security |
| Storage | Supabase; customer storage access must be explicitly reviewed before use |
| Intended deployment | Vercel, subject to release acceptance and owner approval |
| Verification | Type checking, lint, application tests, SQL assertions, browser journeys and live multiuser tests |

Development, staging and production need separate data and configuration. Previews must not access production customer data. Health monitoring, backup retention, restore exercises, controlled migrations and rollback records are release requirements, not completed services merely because instructions exist.

## 10. Business model and packaging proposal

The proposed commercial model is a recurring subscription per business workspace, with provider usage either included within a defined allowance or billed transparently under an agreed usage policy.

Do not publish prices before understanding the provider costs and service commitments. Possible package dimensions to validate with pilot customers are workspace users, voice minutes/calls, enabled integrations, onboarding assistance and support level.

A paid pilot can test whether the business receives enough value to renew. Its terms should state exactly which capabilities are available, any usage limits, the support channel and the boundaries of the pilot. No availability guarantee or claim of a finished AI receptionist should precede evidence.

Pricing decisions required:

- Target operating market, currency and billing interval.
- Subscription price and included usage.
- Usage overage, spending limits and notification rules.
- Onboarding charges, trial/pilot policy and cancellation terms.
- Responsibility for provider accounts and charges.
- Support hours and response commitments.

## 11. Cost and viability model

Track these cost categories before setting prices:

- Application hosting, database, storage and backups.
- Voice AI, telephony numbers, minutes and any transfer charges.
- SMS/email/calendar/maps services where activated.
- Payment processing and subscriptions infrastructure if introduced.
- Onboarding, support, incident handling and account administration.
- Development, testing, monitoring and maintenance.

For each package, calculate contribution from actual collected subscription/usage revenue less attributable provider and servicing costs. Keep estimated costs and observed costs separate. Do not present a financial forecast without explicit assumptions, reliable inputs and owner review.

## 12. Go-to-market proposal

Start with a small controlled group of HVAC pilot businesses. Validate one complete daily workflow rather than advertising every roadmap module as available.

Suggested sequence:

1. Finish the secure foundation and live isolation acceptance.
2. Validate customer/intake/dispatch/calendar with fictional development data.
3. Complete the selected receptionist and handoff journey with provider test accounts.
4. Prepare onboarding and operational support.
5. Agree pilot pricing and scope with the owner.
6. Obtain explicit release approval and onboard selected pilot businesses.
7. Measure usage, workflow reliability, customer outcomes and renewal interest.
8. Expand only after the product and support model are repeatable.

Potential channels to test include direct outreach, owner referrals and trade-service partners. These are proposed experiments; no partnership or acquisition result is assumed.

## 13. Onboarding and customer success

An onboarding checklist should cover workspace identity, verified accounts and roles, settings, fictional workflow rehearsal, authorized data migration, provider configuration and the customer's escalation contacts.

Teach office staff the customer → location → equipment and enquiry → job → appointment journeys. Teach technicians how assignment controls their job visibility. Document who maintains job status and who acknowledges handoffs.

Use support requests to identify reproducible failures, with sanitized diagnostic categories and operation identifiers. Do not ask customers to send passwords, raw session tokens or unnecessary personal information.

## 14. Development governance

Morgan owns integration and acceptance. The seven specialist responsibilities are:

| Role | Responsibility |
| --- | --- |
| Product Manager and Orchestrator | Scope, priorities, ownership, evidence and acceptance |
| Software Architect and Data | Schema, shared contracts, isolation and architectural approval |
| Frontend and UX | Connected accessible office/field journeys and interface states |
| Backend and Application Logic | Authorized reads/writes, validation, idempotency and business workflows |
| AI Voice and Integrations | Provider verification, tenant routing, event processing and integrations |
| Quality and Security | Workflow, permission, failure and security verification |
| DevOps and Release | Environments, checks, migrations, monitoring and release preparation |

Tasks require IDs, scope, dependencies, allowed files, acceptance criteria and evidence. Specialist handoffs do not equal acceptance. Migrations/shared contracts need Architect approval; sensitive and cross-module changes need Quality review. Production deployment needs explicit owner approval.

## 15. Product roadmap and implementation state

This table describes the inspected repository and recorded evidence on the document date. Current execution evidence belongs in PROJECT_STATUS.md and task handoffs.

| Stage | Scope | State |
| --- | --- | --- |
| M1 | Auth, tenants, roles, settings, customers/contacts, locations, equipment, audits | Implemented and source reviewed; full live role/isolation acceptance open |
| CRM completion | Customer/contact business-field editing and connected contact creation | Implemented/source reviewed; integrated checks pass, authenticated live saves pending |
| M2 | Leads and service requests | Implemented/reviewed; owner reports hosted creation/edit persistence; full live role/isolation gates open |
| M3 dispatch | Jobs, office assignment, lead conversion, assigned-only technician visibility | Source/embedded checks pass; hosted migration/live multiuser verification pending |
| M3 calendar | Internal job appointments and calendar | Implemented/source reviewed; integrated tests/SQL/build pass, hosted migration/live checks pending; explicit UTC scope |
| M4 | Provider-connected calls/outcomes and tracked handoffs | Design boundaries exist; provider decision and implementation required |
| M5 | Estimates and follow-up | Business contract and implementation required |
| M6 | Revenue recovery reporting | Attribution definition, source data and implementation required |

Password recovery and invitations are recorded follow-up work. They must not be advertised as complete. Trusted provisioning remains the current access model.

## 16. Acceptance and release checklist

Before calling the agreed product ready:

- All promised primary journeys work through the interface, backend and database.
- No placeholder controls, fabricated metrics or mock success responses are presented as completed functionality.
- Direct authenticated requests cannot cross business boundaries.
- Every supported role has positive and negative live evidence.
- Technician job/appointment access updates when assignment or membership changes.
- Provider signatures, routing, retries, ordering and handoffs are verified where integrations are enabled.
- Type checking, lint, meaningful tests, SQL checks and production build pass.
- Authenticated browser journeys pass with private synthetic accounts and no sensitive artifacts.
- Hosted CI and deployment-environment checks pass.
- Monitoring, backups, restore, migration and rollback procedures are verified.
- Commercial promises match delivered capability and support capacity.
- The owner approves the concrete production release candidate.

Embedded PostgreSQL assertions exercise database behavior with an Auth compatibility fixture. They do not replace live Supabase Auth/JWT/PostgREST or authenticated browser evidence. Skipped checks remain open gates.

## 17. Measures to collect

Use observed records and clearly defined denominators:

| Measure | What must be defined |
| --- | --- |
| Workspace activation | Which completed workflow counts as activation |
| Intake-to-job conversion | Eligible leads, period and conversion link |
| Follow-up completion | Due items and recorded completion evidence |
| Call handling | Provider-confirmed outcome categories and exclusions |
| Handoff acknowledgement/resolution | Start/end events and timeout policy |
| Service completion | Job status and who confirms it |
| Customer retention | Subscription/customer cohort and period |
| Revenue recovery | Paid-revenue source, attribution event/window and exclusions |
| Reliability | Failed requests/events, retry completion and incident duration |

These are measurement proposals. The application must collect and validate the required facts before presenting them as operational dashboards.

## 18. Current risks and next decisions

The main launch blockers are incomplete live acceptance, unavailable authorized hosted administration/test sessions, unresolved provider choice, unimplemented voice/estimates/reporting flows and unexecuted hosted operations gates.

Resolve the voice provider decision first while independent CRM/calendar and verification work continues. Then define estimate scope and revenue attribution with the owner. Keep major business choices explicit; do not invent them to make the roadmap appear complete.

## 19. Source of truth

This blueprint is grounded in repository materials:

- [Original build prompt](../../Cevanta_Software_Agent_Team_Codex_Prompt.md)
- [Product requirements](../product/PRODUCT_REQUIREMENTS.md)
- [MVP roadmap](../product/MVP_ROADMAP.md)
- [Project status](../project/PROJECT_STATUS.md)
- [Decision log](../project/DECISION_LOG.md)
- [Backlog](../project/BACKLOG.md)
- [Collaboration rules](../agents/COLLABORATION.md)
- [Integration boundaries](../agents/INTEGRATIONS.md)
- [Operations guide](../project/OPERATIONS.md)
- [Task ledger](../project/tasks/)
- [Specialist handoffs](../project/handoffs/)

Update this document when commercial decisions or product scope change. Update task evidence and project status whenever implementation or verification changes.
