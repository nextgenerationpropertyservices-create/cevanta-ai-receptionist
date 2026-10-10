# CEV-INTERNAL-OPS-93A — Establish internal operations workspace

- Owner: Morgan — Product Manager and Orchestrator
- Scope: Establish the current production workspace as Heath's internal Cevanta operations dashboard and document how it differs from client workspaces.
- Dependencies: Existing production workspace `1cb2a226-84ef-4dcd-9976-5ce87dd3e449`; Supabase production project `rafiksklbrfgefkypvkn`.
- Allowed files: `docs/business/CEVANTA_INTERNAL_OPERATIONS_DASHBOARD.md`, `docs/project/tasks/CEV-INTERNAL-OPS-93A.md`, `docs/project/handoffs/CEV-INTERNAL-OPS-93A-morgan.md`, `docs/project/PROJECT_STATUS.md`, Desktop Cevanta Business folder copies.
- Acceptance criteria:
  1. Current workspace is clearly named as Cevanta's internal operations workspace.
  2. The guide explains this is not a paying-client workspace.
  3. The guide explains where client setup information appears.
  4. The guide explains future client workspace pattern.
  5. No credentials, private customer data, or provider secrets are stored.
- Evidence:
  - Supabase query confirmed the workspace formerly named `Heath Herrick`.
  - Supabase update returned `Cevanta Internal Operations`, trade `AI Receptionist Operations`, timezone `America/New_York` for workspace `1cb2a226-84ef-4dcd-9976-5ce87dd3e449`.
  - Desktop business folder guide created.
- Result: Accepted as an operations/database naming change. No app code changed.
