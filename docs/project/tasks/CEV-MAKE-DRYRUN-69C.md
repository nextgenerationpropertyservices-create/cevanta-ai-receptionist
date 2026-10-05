# CEV-MAKE-DRYRUN-69C — Make and Retell fictional dry-run checklist

Status: accepted with limitations as documentation
Owner: Morgan — Product Manager and Orchestrator
Date: 2026-10-05

## Scope

Create a safe, manual dry-run package for proving the intended Retell to Make voice path with fictional data only. The package must help the owner or Echo later test that a final analyzed call event can be mapped into a safe lead/request output without sending live SMS, email, calendar writes, customer messages, production webhooks, or production database writes.

## Dependencies

- CEV-PILOT-INTAKE-69A first-client intake package
- CEV-PILOT-DEMO-69B first-client demo script and local walkthrough
- Existing Retell readiness documents under `docs/ops/`
- Owner's stated provider direction: Retell AI, Make.com and Twilio are available, but live/provider activation still requires approval

## Allowed files

- `docs/project/tasks/CEV-MAKE-DRYRUN-69C.md`
- `docs/ops/MAKE_RETELL_DRY_RUN_CHECKLIST.md`
- `docs/ops/MAKE_RETELL_TEST_PAYLOAD.md`
- `docs/project/handoffs/CEV-MAKE-DRYRUN-69C-morgan.md`
- `docs/project/BACKLOG.md`
- `docs/project/PROJECT_STATUS.md`
- `context/NEXT_TASK.md`

## Out of scope

- Opening or changing live Make, Retell, Twilio, Google Calendar, SMS, email, Supabase, hosting, or production settings
- Recording a real webhook URL, API key, phone number, call transcript, customer record, calendar ID, or credential
- Live calls or real caller tests
- Production deployment
- Claiming provider readiness or hosted callback readiness
- Connecting a Make scenario to live customer messaging, live calendar writes, or ordinary app writes

## Acceptance criteria

1. A dry-run checklist exists and explains how to duplicate or isolate a safe Make scenario before testing.
2. The checklist gives pass/fail steps for Retell analyzed-call style payload handling, Make mapping, validation, duplicate protection, missing information handling, escalation review, and safe output.
3. A fictional payload map exists with no secrets, webhook URLs, real contact information, or real customer data.
4. The documentation clearly blocks live side effects until owner approval.
5. Project status, backlog and next-task context reflect the documentation result and remaining gates.

## Evidence

- Manual review of the new documentation for secret-free fictional content.
- Repository file inspection only; no runtime, hosted, provider, browser or production checks were run because this task is documentation-only and intentionally avoids live accounts.

## Acceptance decision

Accepted with limitations as documentation. This gives the owner and future Echo/Quinn review work a safe test script for Make and Retell, but it does not prove live provider behavior, hosted callback safety, real calls, production database writes, SMS/email/calendar behavior, or production readiness.
