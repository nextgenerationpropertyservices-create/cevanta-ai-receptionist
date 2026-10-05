# CEV-LEAD-CONVERT-75B — Clear AI lead alert after job conversion

Owner: Morgan — Product Manager and Orchestrator
Status: accepted with limitations on 2026-10-05

## Scope

Fix the launch bug found during AI receptionist testing: when office staff turns a new AI receptionist lead into a job, the lead must stop appearing as an unreviewed AI lead.

## Dependencies

- CEV-LEAD-NOTIFY-75A in-app AI lead notification.
- Existing lead-to-job conversion action and dispatch board.
- Hosted fictional AI lead dry-run record created for launch testing.

## Allowed files

- `src/app/actions/jobs.ts`
- `src/app/workspaces/[tenantId]/leads/page.tsx`
- `tests/jobs.test.ts`
- `tests/leads-ui.test.ts`
- `docs/project/tasks/CEV-LEAD-CONVERT-75B.md`
- `docs/project/handoffs/CEV-LEAD-CONVERT-75B-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `MEMORY.md`

## Acceptance criteria

- Creating a job from a new lead updates the lead status so the AI receptionist alert clears.
- Scheduled conversions mark the lead `scheduled`; unscheduled conversions mark the lead `contacted`.
- Existing duplicate/replay protections still work.
- The Leads page notification wording is grammatically correct for one or many leads.
- Focused tests and full project checks pass.
- Browser verification uses fictional data only.

## Evidence

- Focused tests passed: `pnpm test -- tests/jobs.test.ts tests/leads-ui.test.ts tests/retell-lead-writer.test.ts` with 18 test files / 737 tests passing.
- Full `pnpm check` passed on 2026-10-05: typecheck, lint, 18 Vitest files / 737 tests, embedded database suites, Retell lead ingestion embedded suite, and production build.
- Browser proof on 2026-10-05: converted fictional AI lead `Fictional AI Caller` into a job. The lead detail changed to `contacted`, showed `This enquiry already has a job`, and exposed an `Open job` link. The Leads inbox no longer showed the AI alert or `NEW AI LEAD` badge for that handled lead. The Jobs board showed the new `Fictional AI Caller` job.

## Known limitations

- This is still an in-app review workflow. It does not send SMS, email, browser push, or mobile notifications.
- Retell real-provider delivery remains unverified; this browser proof used the fictional hosted dry-run lead.
- The lead status update is part of the current server action flow. A future database RPC could make job creation plus lead status change more explicitly atomic.
