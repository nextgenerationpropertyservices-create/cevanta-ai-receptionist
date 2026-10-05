# Final architecture review

- Task ID: CEV-M1-08.
- Owner: Software Architect and Data Agent (final_architecture_review).
- Scope: final source review of M1 schema, shared contracts, server operations, frontend alignment, integration ports, and embedded SQL harness.
- Dependencies: CEV-M1-02 through CEV-M1-07 and coordinator integration.
- Allowed files: this review only; all application and database files were read only.
- Acceptance criteria: coherent M1 boundaries, tenant and role enforcement, durable database persistence, accurate verification claims, and no blocking contract mismatch.
- Required evidence: inspected source, previous architecture handoff, coordinator execution evidence, and explicit remaining limitations.

## Decision

Approved for the initial foundation implementation. No blocking architecture defect was found in the reviewed source. Full Milestone 1 acceptance remains conditional on live authenticated Supabase and browser/API verification.

The application is a single Next.js server application with Supabase persistence. Shared roles match database policy and form visibility: all five roles can read their tenant records; owner/admin/dispatcher can write customer records; owner/admin can change settings. Technicians and viewers are read only in M1. Verified Auth users and tenant memberships are checked in server operations; ordinary clients use the publishable key and user session. RLS provides independent protection. Composite foreign keys bind records to parents within the same tenant. Column grants prevent changing identity, tenant ownership, parent links and timestamps through ordinary updates. Audit triggers persist identifiers and operations atomically with business changes. Membership provisioning remains an administrator operation.

The provider-independent voice contract is approved as a design boundary. It explicitly has no implemented verifier, endpoint or persistence adapter. Signature verification concerns, server-owned account mapping, transaction-time route revalidation, durable deduplication, projection ordering and transactional outbox requirements are specified. The TypeScript brand is explicitly not a runtime security boundary. Voice ingestion, call outcomes and tracked handoffs are future implementation work; interface definitions do not establish that these features run today.

## Verification and limits

This review inspected the actual migration, SQL assertions, shared record and integration contracts, authorization, queries, actions, Supabase client/configuration, customer/settings forms, and CLI agent adapter. No redundant tests were run by this reviewer.

The coordinator reports successful execution of the migration, fictional seed and tenant-isolation assertions through scripts/test-db-embedded.mjs. The harness uses real embedded PostgreSQL (PGlite), applies the actual SQL files, and switches database roles for assertions. That is database execution evidence, beyond source inspection. Its auth.users table and auth.uid function are compatibility fixtures: it does not run real Supabase Auth, JWT verification, PostgREST, or an authenticated browser session. Those checks remain open. Quality approval and coordinator test/build evidence remain separate acceptance requirements.

The native collaboration tool has no agent_type selector. The coordinator reports all seven saved TOML instruction layers passed CLI smoke validation. scripts/run-agent.mjs loads a selected definition into the supported CLI developer_instructions override. This is an explicit adapter; it does not prove native named-agent selection in this desktop tool schema.

Direct authorized database settings updates can bypass server IANA timezone validation. This existing data-quality limitation should be addressed before scheduling. M1 has no file uploads or storage access policy; private customer file storage requires a later reviewed design. No production deployment or credentials were required for this review.

## Handoff

- Work completed: final architecture and boundary review; source approval with acceptance limits.
- Files changed: docs/project/ARCHITECTURE_REVIEW.md only.
- Database changes: none.
- API or contract changes: none; reviewed contracts approved for their stated scope.
- Verification commands and results: read source and previous handoffs; runtime SQL and agent smoke results attributed to coordinator, not rerun here.
- Known limitations: live Supabase Auth/JWT/PostgREST and authenticated browser/API flows remain unverified.
- Risks: do not treat embedded auth fixtures or design-only integration ports as production verification.
- Rollback notes: review document only; no runtime behavior changed.
- Exact next action: coordinator reconcile final project evidence and acceptance status, then owner configure Supabase to enable the live authenticated acceptance checks.
