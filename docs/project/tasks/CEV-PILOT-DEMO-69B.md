# First-client local demo walkthrough evidence

- Task ID: CEV-PILOT-DEMO-69B.
- Owner: Morgan owns product/sales-readiness documentation. Nova and Quinn may be assigned later only if implementation or independent review is needed.
- State: accepted with limitations.
- Scope: Prepare a first-client demo script and local walkthrough checklist that the owner can use to test and present the managed pilot without live provider changes. This is documentation-only preparation; actual browser testing is a separate owner-approved run.
- Dependencies: CEV-PILOT-INTAKE-69A accepted with limitations; accepted onboarding/setup and app foundation slices through CEV-ONBOARD-HISTORY-68D.
- Allowed files: docs/business/FIRST_CLIENT_DEMO_SCRIPT.md; docs/project/PILOT_LOCAL_WALKTHROUGH.md; docs/project/handoffs/CEV-PILOT-DEMO-69B-morgan.md; docs/project/PROJECT_STATUS.md; docs/project/BACKLOG.md; context/NEXT_TASK.md.
- Prohibited/shared files: No source code, migrations, tests, provider settings, hosted database changes, credentials, real customer data, SMS/email/calendar sends, Retell/Make/Twilio live changes, or production deployment.
- Acceptance criteria: Demo script shows the pilot story in plain language, includes exact fictional data, avoids live automation claims, covers intake, dashboard, setup, lead/service request, customer/job/calendar foundation and office-review positioning. Walkthrough checklist gives manual local steps, pass/fail observations, blocked gates and evidence to capture without screenshots containing real data. It must clearly state that Retell/Make/live provider and production behavior are not proven by the local demo.
- Required evidence: Morgan handoff with changed files, docs-only verification, limitations, risks, rollback notes and exact next action.
- Reviewers: Morgan acceptance. Quinn review is optional later if the checklist becomes customer-facing or includes private data handling changes.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Accepted by Morgan as documentation. Next action is to run the local walkthrough when the owner is ready, then prepare Make/Retell dry-run evidence.