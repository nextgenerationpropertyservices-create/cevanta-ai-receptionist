# Server Action transport/body-limit and safe error verification

- Task ID: CEV-ONBOARD-TRANSPORT-49.
- Owner: Phoenix owns framework/configuration and operational verification. Morgan coordinates and accepts. Quinn reviews security/error behavior before UI wiring.
- State: accepted with limitations.
- Scope: Configure and/or verify the Next.js Server Action/request transport boundary for onboarding actions so oversized payloads fail safely before accepted UI integration claims HTTP readiness. Read installed Next.js docs before editing. Preserve accepted backend action behavior, safe messages and current check path.
- Dependencies: CEV-ONBOARD-BACKEND-48 accepted with limitations; Quinn48 raw transport-limit gate; installed Next.js 16 documentation.
- Allowed files: next.config.ts; tests/onboarding-transport.test.ts; docs/project/handoffs/CEV-ONBOARD-TRANSPORT-49-phoenix.md. If a different file is required by installed Next.js docs, ask Morgan for ownership transfer before editing it.
- Prohibited/shared files: No migrations, SQL tests, backend onboarding action logic, UI components/pages, provider settings, hosted database changes, live provider calls, invitation issuance/delivery, new account provisioning, public signup, token-continuation store, production deployment, real customer data, credentials or external writers.
- Acceptance criteria: Installed Next.js docs have been consulted. The project records the effective Server Action body/request limit relevant to onboarding. Oversized synthetic onboarding payload behavior is verified or, if current local tooling cannot exercise actual HTTP Server Action POSTs safely, a precise blocked limitation is recorded and the strongest meaningful static/config test is added. No raw provider/SQL/token/contact data is logged or exposed. Existing `pnpm check` remains passing.
- Required evidence: Phoenix handoff using docs/templates/AGENT_HANDOFF.md with docs read, files changed, commands/results, skipped checks, limitations, risks, rollback notes and exact next action.
- Reviewers: Quinn security review required. Morgan acceptance required before Nova UI wiring.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Add a rendered onboarding UI consumer, then verify actual Server Action HTTP behavior with a fictional session before full transport acceptance.

