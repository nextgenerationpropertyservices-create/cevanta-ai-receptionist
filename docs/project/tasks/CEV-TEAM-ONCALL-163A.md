# CEV-TEAM-ONCALL-163A — Make architecture and release roles on-call

- **Owner:** Morgan — Product Manager and Orchestrator
- **Scope:** Mark Atlas (`architect_data`) and Phoenix (`devops_release`) as on-call roles in the supported project agent definitions. Keep Morgan, Nova, Blake, Echo, and Quinn as the normal active team.
- **Dependencies:** Existing `.codex/agents` role definitions and collaboration contract.
- **Allowed files:** `.codex/agents/architect_data.toml`, `.codex/agents/devops_release.toml`, this task record, matching handoff, and project status.
- **Acceptance criteria:** Atlas and Phoenix descriptions identify them as on-call and state when to engage them; their safety and review requirements remain intact; the other five role definitions are unchanged; no application, database, provider, or deployment state changes occur.
- **Required evidence:** Direct inspection of both updated TOML files and the project status note. Application typecheck, lint, tests, and build are not required for this documentation/configuration-only change and are explicitly skipped.
