# CEV-DASHBOARD-132A

- Owner: Morgan (coordinator)
- Scope: Show manually created new leads in the workspace overview queue and summary; add a common technician-skill picker while retaining custom skills, editing, service areas, and availability.
- Dependencies: Existing tenant-scoped lead queries, technician profile contract, and owner/admin technician permissions.
- Allowed files: `src/app/workspaces/[tenantId]/page.tsx`, `src/app/workspaces/[tenantId]/technicians/page.tsx`, `src/app/actions/technician-profiles.ts`, `src/lib/technician-profiles.ts`, `tests/dashboard-ui.test.ts`, `tests/technician-profiles.test.ts`, this task record, and its handoff.
- Acceptance criteria:
  - New leads created manually are visible in the overview summary, attention banner, and today's queue while preserving links to the lead detail.
  - AI and manually created leads remain distinguishable in the queue.
  - Owners/admins can edit a technician profile with common skills selected from a multi-select list and additional free-form skills.
  - Preset and custom skills are normalized, deduplicated, validated, and saved through the existing tenant-scoped action.
  - Existing tenant and role checks remain unchanged.
- Required evidence: typecheck, lint, focused overview/profile tests, full configured test run, and production build result.
