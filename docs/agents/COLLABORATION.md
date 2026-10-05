# Collaboration rules

The Product Manager is the coordinator. Each task is recorded under docs/project/tasks with an ID, owner, scope, dependencies, allowed files, acceptance criteria, and required evidence. State transitions: ready → assigned → implemented → reviewed → accepted. A blocked check prevents acceptance of the relevant criterion.

Specialists may read all files but only edit assigned paths. Ask the coordinator to transfer ownership before touching another module. Never edit shared files simultaneously. Use separate branches/worktrees once a base commit exists. The initial repository is unborn: this build uses disjoint file ownership because worktrees cannot branch from an absent commit.

Architect approves migrations and contracts before dependent implementation. Quality reviews cross-module and security-sensitive work after implementation. The coordinator collects evidence and updates project records.

Every handoff includes task ID, completed work, changed files, database changes, contract changes, commands and results, limitations, risks, rollback notes, and exact next action. Use the provided template. Production deployment requires owner approval.

Never commit secrets, real personal data, or screenshots containing them. Never weaken authorization or use service credentials in normal request paths. Do not call work complete merely because code exists. Clearly distinguish automated checks, manual inspection, and unexecuted integration tests.
