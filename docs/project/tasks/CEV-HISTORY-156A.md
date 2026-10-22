# CEV-HISTORY-156A
- Owner: Morgan (coordinator)
- Scope: Add a plain-language opportunity history timeline to lead detail using existing lead, job, and appointment records.
- Dependencies: Existing tenant-scoped lead, job, and appointment queries.
- Allowed files: `src/app/workspaces/[tenantId]/leads/[leadId]/page.tsx`, `docs/project/tasks/CEV-HISTORY-156A.md`, `docs/project/handoffs/CEV-HISTORY-156A-morgan.md`.
- Acceptance criteria:
  1. Lead detail shows received/captured, current office-review status, converted job, and scheduled visit when records exist.
  2. Timeline links to the related job and remains honest about what is known from stored records.
  3. No provider writes or booking claims are introduced.
- Required evidence: typecheck, lint, full tests, and build result.
- State: assigned.
