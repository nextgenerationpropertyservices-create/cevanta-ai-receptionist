# CEV-DASHBOARD-136A — Lead date and urgency filters

- **Owner:** Morgan (Product Manager and Orchestrator)
- **Scope:** Extend the tenant-scoped Leads filter bar with received-date presets and clearer urgency filtering while preserving existing status, source, search, and follow-up filters.
- **Dependencies:** Existing `getLeads` query, lead display normalization, and current lead status/priority contracts.
- **Allowed files:** `src/app/workspaces/[tenantId]/leads/page.tsx`, `tests/leads-ui.test.ts`, this task file, and the matching handoff.
- **Acceptance criteria:**
  1. Users can filter by date received: today, last 7 days, last 30 days, or older.
  2. Users can filter by urgency with clear wording while preserving existing priority values.
  3. Existing follow-up date, status, source, search, and view filters continue to combine correctly.
  4. Filters remain tenant-scoped, shareable through URL query parameters, and readable on mobile.
- **Required evidence:** Focused Leads UI tests, typecheck, lint, and webpack production build status recorded.
