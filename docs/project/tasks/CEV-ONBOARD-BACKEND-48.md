# Authenticated onboarding backend actions and result decoding

- Task ID: CEV-ONBOARD-BACKEND-48.
- Owner: Blake owns backend implementation. Morgan coordinates and accepts. Atlas reviews shared contract fit if files under src/lib/onboarding-contracts.ts or SQL contracts change. Quinn reviews security/error/logging behavior before UI integration.
- State: accepted with limitations.
- Scope: Add backend-only server actions/read helpers that call the accepted onboarding RPCs for the narrowed subset: configuration commands, resume save, setup snapshot and invitation acceptance for privately provisioned verified existing accounts. Use ordinary authenticated session clients, verified user/session boundaries, shared validators, exact named RPC arguments, safe result decoding, safe messages, and revalidation only after confirmed RPC success. Do not add UI.
- Dependencies: CEV-ONBOARD-SCHEMA-44, CEV-ONBOARD-TESTS-45, CEV-ONBOARD-RPC-46 and CEV-ONBOARD-COMMAND-TESTS-47 accepted with limitations; Blake/Quinn RPC reviews.
- Allowed files: src/app/actions/onboarding.ts; src/lib/server/onboarding-rpc.ts; tests/onboarding-actions.test.ts; docs/project/handoffs/CEV-ONBOARD-BACKEND-48-blake.md. If a shared type is strictly missing, request Morgan approval before editing src/lib/onboarding-contracts.ts.
- Prohibited/shared files: No migrations, SQL tests, UI components/pages, provider settings, hosted database changes, live provider calls, invitation issuance/delivery, new account provisioning, public signup, token-continuation store, production deployment, real customer data, credentials or external writers.
- Acceptance criteria: Actions reject malformed input before RPC calls, verify Supabase getUser/session before protected calls, never use service-role clients, never trust client-supplied actor/role, call RPCs with exact names/named arguments, decode status/projection/entity/role/version/id fields against allowlists, return safe user messages without SQL/provider detail, preserve request IDs/preconditions for caller retries, revalidate only after confirmed saved/accepted results, and distinguish unavailable/conflict/validation/retryable categories.
- Required evidence: Blake handoff using docs/templates/AGENT_HANDOFF.md with files changed, commands/results, skipped checks, limitations, risks, rollback notes and exact next action.
- Reviewers: Atlas if shared contracts change; Quinn security review required; Morgan acceptance required before frontend/UI wiring.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Assign Server Action transport/body-limit configuration and verification before UI wiring claims HTTP readiness.

