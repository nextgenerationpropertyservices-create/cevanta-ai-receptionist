Build a coordinated software-development agent team for Cevanta.

Cevanta will be a multi-tenant CRM and AI receptionist platform for HVAC and other trade businesses. Do not stop after writing a plan. Create the agent definitions, collaboration files, project records, and initial software foundation in this repository.

PRODUCT GOAL

Build one configurable application that can serve multiple trade businesses. Each business must have isolated customers, locations, equipment, leads, calls, jobs, appointments, users, and settings.

Default stack for this empty repository:

- Next.js App Router
- TypeScript strict mode
- React
- Tailwind CSS
- Supabase Postgres, Auth, Storage, and Row Level Security
- Zod validation
- Vercel deployment

Use the agent configuration format actually supported by this Codex environment. Check the installed Codex documentation or examples before creating agent files. Do not invent unsupported fields.

CREATE THESE AGENTS

1. Product Manager and Orchestrator
- Maintains the roadmap, backlog, current milestone, decisions, and change log.
- Creates tasks with scope, dependencies, allowed files, acceptance criteria, and required evidence.
- Assigns work without allowing agents to edit the same files simultaneously.
- Reviews completed work before accepting it.

2. Software Architect and Data Agent
- Owns application architecture, database schema, migrations, tenant isolation, Row Level Security, shared types, and API contracts.
- Reviews architectural and database changes.
- Prevents unnecessary complexity.

3. Frontend and UX Agent
- Builds accessible, responsive interfaces for office staff and field technicians.
- Owns the dashboard, customer records, lead inbox, dispatch board, calendar, job screens, settings, and call details.
- Includes loading, empty, validation, permission, and error states.

4. Backend and Application Logic Agent
- Builds secure route handlers, server actions, queries, commands, and business workflows.
- Enforces authorization on every protected operation.
- Implements idempotency for webhook and retry-sensitive operations.
- Records important changes in an audit trail.

5. AI Voice and Integrations Agent
- Owns Retell, Telnyx or Twilio, Make, calendar, SMS, email, maps, and webhook integrations.
- Stores call outcomes and creates or updates leads without duplicates.
- Matches every event to the correct tenant.
- Uses provider-independent integration boundaries.
- Stores credentials only in secure environment variables.

6. Quality and Security Agent
- Tests authentication, roles, tenant isolation, validation, webhook security, duplicate protection, failure handling, and important workflows.
- Runs meaningful integration and end-to-end tests.
- Reports exact reproduction steps for failures.
- Checks that secrets and unnecessary personal data do not appear in logs.

7. DevOps and Release Agent
- Owns local, preview, staging, and production setup.
- Configures type checking, linting, tests, builds, migrations, logging, health checks, deployment, and rollback instructions.
- Must not deploy to production without explicit owner approval.

COLLABORATION RULES

- The Product Manager is the coordinator.
- Every task needs a task ID, owner, scope, dependencies, allowed files, acceptance criteria, and required evidence.
- Agents must use isolated branches or worktrees when supported.
- Agents may only change assigned files.
- Shared contracts and migrations require Architect review.
- Cross-module and security-sensitive work requires Quality review.
- Every handoff must list:
  - Task ID
  - Work completed
  - Files changed
  - Database changes
  - API or contract changes
  - Verification commands and results
  - Known limitations
  - Risks
  - Rollback notes
  - Exact next action
- Never store secrets in source code, documentation, logs, screenshots, or test fixtures.
- Never weaken authorization to make a feature pass.
- Never claim work is complete without verification.
- Ask the owner only one short question when a material business decision is required.

CREATE THESE PROJECT FILES

- AGENTS.md
- Supported Codex agent definitions for all seven roles
- docs/agents/README.md
- docs/agents/COLLABORATION.md
- docs/product/PRODUCT_REQUIREMENTS.md
- docs/product/MVP_ROADMAP.md
- docs/project/PROJECT_STATUS.md
- docs/project/DECISION_LOG.md
- docs/project/CHANGE_LOG.md
- docs/project/BACKLOG.md
- docs/templates/AGENT_TASK.md
- docs/templates/AGENT_HANDOFF.md
- docs/templates/RELEASE_CHECKLIST.md
- README.md
- .env.example containing variable names only

MVP MODULES

Build in this order:

1. Authentication
2. Tenant membership
3. Roles and permissions
4. Tenant settings
5. Customers and contacts
6. Service locations
7. Equipment and assets
8. Leads and service requests
9. Dispatch and jobs
10. Calendar and appointments
11. AI receptionist calls and outcomes
12. Tracked human handoffs
13. Estimates and follow-up
14. Revenue recovery reporting

FIRST BUILD MISSION

Complete Milestone 1: Secure Multi-Tenant Foundation.

Deliver:

- Next.js application
- Supabase configuration
- Authenticated sign-in
- Tenant/workspace database model
- User membership model
- Owner, admin, dispatcher, technician, and viewer roles
- Database-level tenant isolation
- Tenant settings screen
- Customer, contact, service-location, and equipment schema
- Customer list screen
- Customer detail screen
- Ability to add a service location and HVAC equipment
- Safe demo tenant and seed data
- Basic audit-event model
- Setup instructions

MILESTONE 1 ACCEPTANCE CRITERIA

- A user can sign in and access only tenants they belong to.
- Direct database or API requests cannot access another tenant’s records.
- An authorized office user can create a customer, add a service location, and attach HVAC equipment.
- Role permissions restrict technician access appropriately.
- Loading, empty, validation, and error states exist.
- Type checking, linting, relevant tests, and the production build pass.
- No real credentials or customer data are committed.

EXECUTION ORDER

1. Inspect the repository.
2. Confirm the supported Codex agent format.
3. Create the agent team and collaboration files.
4. Validate that the agent definitions load correctly.
5. Create the product requirements and prioritized backlog.
6. Divide Milestone 1 into non-overlapping work packages.
7. Assign the work to the specialist agents.
8. Implement Milestone 1.
9. Run architecture, quality, security, UI, and build reviews.
10. Fix verified problems.
11. Update project status, decisions, and change records.
12. Report what works, verification evidence, remaining blockers, and one next step.

The owner is not a professional programmer. Use plain language. If owner action is required, provide only one action using:

CURRENT STEP
WHY
DO THIS
SUCCESS LOOKS LIKE

Begin now. Do not stop after proposing a plan.