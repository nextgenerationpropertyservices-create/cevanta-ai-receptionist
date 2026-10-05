# Cevanta software team

## Individual instruction guides

Read the relevant guide alongside the assigned task file. These Markdown guides supplement the executable TOML definitions; include the guide path explicitly in the agent assignment.

| Agent | Guide |
| --- | --- |
| Morgan — Product Manager and Orchestrator | [product_manager.md](product_manager.md) |
| Atlas — Software Architect and Data | [architect_data.md](architect_data.md) |
| Nova — Frontend and UX | [frontend_ux.md](frontend_ux.md) |
| Blake — Backend and Application Logic | [backend_logic.md](backend_logic.md) |
| Echo — AI Voice and Integrations | [voice_integrations.md](voice_integrations.md) |
| Quinn — Quality and Security | [quality_security.md](quality_security.md) |
| Phoenix — DevOps and Release | [devops_release.md](devops_release.md) |

Example assignment: “Read docs/agents/backend_logic.md and docs/project/tasks/<TASK-ID>.md, then perform only the assigned work.”

Seven supported project-scoped Codex agents live in .codex/agents/*.toml. Every definition uses only name, description, and developer_instructions. Model and reasoning settings inherit the current session.

| Agent | Responsibility |
| --- | --- |
| product_manager | Coordinator, tasks, roadmap, acceptance, records |
| architect_data | Architecture, database, RLS, shared types and contracts |
| frontend_ux | Accessible responsive screens and UI states |
| backend_logic | Protected workflows, auth, queries and actions |
| voice_integrations | Provider boundaries, signed tenant-matched idempotent events |
| quality_security | Security, integration, E2E testing and reproduction evidence |
| devops_release | CI, environments, deployment and rollback |

Assign a role a task file. This environment's current subagent tool exposes task_name and message but no agent_type selector; a native ephemeral smoke test confirmed this limitation. The initial build executes specialist roles through explicit instructions in available subagents. Documented standalone TOML files remain portable, but native named-tool discovery is not claimed here.

Use `pnpm agent architect_data "Read docs/project/tasks/CEV-M1-02.md and perform the assigned task"` to launch a role through the installed CLI's supported developer_instructions configuration layer. The launcher parses the same definition, inherits the normal model, and passes arguments directly without shell interpolation. It cannot enforce file ownership at the filesystem level; task boundaries and reviews still apply. `pnpm agents:validate:native` validates all seven instruction layers with Codex's read-only prompt inspector without making a model request or printing raw prompt/configuration contents.

Format verified against installed Codex v0.159.2 help and official [custom-agent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents). Run `pnpm agents:validate` for TOML schema/path validation. All seven native instruction-layer checks passed. See docs/project/AGENT_RUNTIME_SMOKE.md for the separate named-tool discovery result.

Four total concurrent slots are available in this chat, so the coordinator runs specialists in waves. File ownership appears in docs/project/tasks. Do not start seven concurrent writers. See COLLABORATION.md.

