# CEV-DASHBOARD-GUIDE-129A

- **Owner:** Nova (frontend_ux), coordinated by Morgan
- **Scope:** Add a built-in dashboard guide to authenticated workspace pages. It answers common navigation and workflow questions, offers quick prompts, and keeps help local to the browser.
- **Dependencies:** Existing workspace shell and routes; no new provider, API, database, or secret.
- **Allowed files:** `src/components/dashboard-guide.tsx`, `src/components/workspace-shell.tsx`, `src/app/globals.css`, this task file, and the matching handoff.
- **Acceptance criteria:**
  1. A clearly labeled Dashboard help launcher is available on workspace pages.
  2. The panel supports quick questions and free-text questions with deterministic guidance for leads, jobs, setup, calendar, notifications, billing, reports, and integrations.
  3. The panel can be closed with a visible control and remains usable on narrow screens.
  4. Guidance does not send workspace data to an external AI provider and does not expose secrets or change records.
  5. Focused UI checks, typecheck, and lint pass.
- **Reviewers:** Morgan acceptance; Quinn security review for the no-data/no-provider boundary.
- **Required evidence:** Test output and preview deployment URL recorded in the handoff.
