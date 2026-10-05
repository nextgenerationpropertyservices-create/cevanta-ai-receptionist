# CEV-RELEASE-07 — Complete documented scope and release acceptance

- Owner: Morgan, coordinator and final acceptance.
- Scope: Integrate existing dispatch/jobs, verify the current foundation and intake, then implement remaining documented milestone flows without inventing business decisions. Prepare a concrete release candidate; no production deployment.
- Dependencies: Existing M1/M2/M3 tasks and reviews; hosted migrations and private verified test sessions for live acceptance. Repository is unborn; disjoint ownership, no commit authorized.
- State: assigned.
- Allowed files: Morgan owns this task, PROJECT_STATUS.md, BACKLOG.md, CHANGE_LOG.md, milestone task records and coordinator integration package/CI/embedded fixture files previously assigned in CEV-M3-01.
- Atlas scope/ownership: Read-only review all current jobs schema/contracts/actions/UI; write only docs/project/handoffs/CEV-RELEASE-07-atlas.md. Identify blocking defects and specify next milestone contracts and unresolved material decisions. Approve or reject migrations/shared contracts explicitly.
- Quinn scope/ownership: tests/jobs.test.ts, supabase/tests/jobs_isolation.sql, scripts/test-jobs-embedded.mjs, docs/project/handoffs/CEV-M3-01-quality.md and CEV-RELEASE-07-quinn.md. Meaningful security/action/SQL verification, read-only app review; no application edits.
- Frontend scope/ownership: Existing CEV-M3-01 frontend paths only: src/app/workspaces/[tenantId]/jobs/**, src/components/workspace-shell.tsx, src/app/workspaces/[tenantId]/leads/[leadId]/page.tsx, src/app/globals.css, docs/project/handoffs/CEV-M3-01-frontend.md. Finish current dispatch UI and address verified UI defects; no backend/schema edits.
- Prohibited/shared files: Other owners' files; credentials, real customer data and deployment writes. Read-only inspections permitted.
- Acceptance criteria: Architect approval, Quality approval, integrated type/lint/meaningful tests/actual SQL/build; affected browser flows where accessible; explicit blocked/skipped live and operational gates. Each documented milestone gets separate disjoint assignments before implementation. Handoffs alone do not establish acceptance.
- Required evidence: Template handoffs, exact commands/results, defects/limitations, hosted versus embedded distinction, final scope acceptance matrix.
- Exact next action: Independent Atlas/Quinn/frontend dispatch review and completion; Morgan integrates checks and assigns next work.

## Integration ownership addition
Morgan owns docs/project/jobs-ui-preview.cjs to repair existing global lint failure without weakening global lint rules. It remains a synthetic visual review helper, never a live customer fixture.
Morgan also owns playwright.config.ts and tests/e2e/foundation.spec.ts until a documented DevOps transfer, to distinguish configured anonymous browser checks from unconfigured setup and authenticated checks.

## Owner-directed named-chat coordination
Owner requested existing separate specialist chats and strict specialization. All internal specialist handoffs are complete and write ownership released. No overlapping internal writes remain. Dispatch follow-up through the named chats:
- Atlas Architecture & Data: read-only independent approval of current jobs/appointments migrations/contracts; owns only docs/project/handoffs/CEV-RELEASE-07-atlas-chat.md.
- Blake Backend & Application Logic: read-only backend integration review; owns only docs/project/handoffs/CEV-RELEASE-07-blake-chat.md. Report defects before source ownership transfer.
- Nova Frontend & UX: read-only complete current UI review; owns only docs/project/handoffs/CEV-RELEASE-07-nova-chat.md. Report defects before source ownership transfer.
- Quinn Quality & Security: tests/security.test.ts, tests/jobs.test.ts, tests/appointments.test.ts, supabase/tests/appointments_isolation.sql, scripts/test-appointments-embedded.mjs and docs/project/handoffs/CEV-RELEASE-07-quinn-chat.md; independent review and verification, app/schema read-only. Original specialist tests ownership explicitly transferred after completed handoffs.
- Phoenix DevOps & Release: CEV-OPS-08 exact allowed files, browser/operations ownership transferred from Morgan; handoff only plus assigned fixes.
- Echo AI Voice & Integrations: read-only provider/integration roadmap readiness and access/decision gaps; owns only docs/project/handoffs/CEV-RELEASE-07-echo-chat.md. No public webhook, accounts or provider calls until choice/access and reviewed task contract.
Morgan owns integration, business document and project records. Each named chat reads original prompts, instructions, ledger and handoff template, fixes only assigned files, reports blocked/skipped checks, and remains within its specialization.

## Current evidence and blockers
Morgan additionally owns docs/project/handoffs/CEV-RELEASE-07-morgan.md for the integration evidence handoff.
- Full pnpm check PASS exit0 after calendar/CRM integration: type/lint, 310 tests, four actual embedded SQL suites, production build.
- Configured anonymous Chrome browser runner PASS clean exit0: 1 executed, 3 skipped explicitly. Required password-field locator fixed to account for the accessible required marker; no app authorization change.
- All six named-chat dispatch calls succeeded. All six subsequent specialist turns failed at account usage limit; none produced final assigned named-chat review evidence. Existing internal source/Quality approvals remain recorded, but named-chat follow-up review is incomplete.
- Browser inventory exposes only empty in-app/MCP surfaces, no authenticated Supabase administration session. No hosted migration executed by Morgan. Owner-reported M2 create/edit persistence distinct from live multiuser automation.
- Provider decision pending; M4 live integrations unimplemented. M5 estimate business contract and M6 actual recovered-revenue attribution still require decisions. Hosted CI/backup restore/deployment not run. Overall product/release NOT ACCEPTED.
- Next action: restore named specialist execution when account allows, perform hosted development migrations/live tests with authorized access, resolve provider/business contracts. Do not retry identical usage-limit failures or assume elapsed time supplies authorization.
