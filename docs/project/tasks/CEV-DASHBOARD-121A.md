# CEV-DASHBOARD-121A — Lead pipeline views

- **Owner:** Morgan (Product Manager and Orchestrator)
- **Scope:** Replace the long lead list experience with a tenant-scoped pipeline view, quick status views, search, and attention counts while preserving existing lead records and permissions.
- **Dependencies:** Existing `getLeads` query, lead display normalization, and current lead status/priority contracts.
- **Allowed files:** `src/app/workspaces/[tenantId]/leads/page.tsx`, `src/app/globals.css`, `tests/leads-ui.test.ts`, this task file, and the matching handoff.
- **Acceptance criteria:**
  1. Leads open to a useful Needs attention view instead of showing every record by default.
  2. Users can switch between Needs attention, All leads, New, Contacted, Scheduled, and Closed views with visible counts.
  3. Users can search by contact or service details and combine search with status, priority, source, and follow-up date filters.
  4. Urgent/high priority and new leads are visually clear; closed leads do not appear in Needs attention.
  5. Existing tenant scoping, read-only behavior, links, and add-enquiry flow remain unchanged.
- **Required evidence:** focused UI tests, typecheck, lint, and full test run; production build status recorded.
