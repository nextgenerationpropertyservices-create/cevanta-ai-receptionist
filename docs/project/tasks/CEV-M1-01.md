# CEV-M1-01

- Owner: product_manager
- State: implemented and reviewed; milestone acceptance gates remain open (see PROJECT_STATUS.md)
- Scope: Team/configuration, product records, scaffold, integration and final acceptance
- Dependencies: None
- Allowed files: .codex/agents/**; AGENTS.md; docs/** excluding assigned specialist reports; root config; scripts/validate-agents.mjs
- Acceptance criteria: Seven native agents parse and load; all requested documents exist; build checks recorded
- Required evidence: Agent validation, native discovery, check outputs, task/handoff ledger
- Reviewers: Architect for schema/contracts; Quality for cross-module/security; coordinator for acceptance.
- Isolation: disjoint path ownership for unborn repository; use worktrees once a base commit exists.
- Exact next action: implement scope and submit full handoff for review.
