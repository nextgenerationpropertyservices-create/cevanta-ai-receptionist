# CEV-PILOT-LAUNCH-86A — Managed pilot launch walkthrough

Owner: Morgan — Product Manager and Orchestrator
Status: in progress
Date: 2026-10-05

## Scope

Create a simple owner-facing launch walkthrough for selling and running the first managed HVAC AI receptionist pilot. Keep the scope to office-reviewed lead capture and avoid paid/provider activation unless the owner separately approves it.

## Dependencies

- Production app is live at `https://cevanta-ai-receptionist.vercel.app/`.
- Retell inbound phone proof exists with limitations.
- Make safe intake and Make-to-Cevanta verifier-only bridge evidence exists with limitations.
- CEV-SALES-78C, CEV-LAUNCH-78A, CEV-INTEGRATIONS-78B and CEV-PILOT-78D.

## Allowed files

- `docs/business/PILOT_LAUNCH_WALKTHROUGH.md`
- `docs/business/FIRST_CLIENT_SALES_PACKET.md`
- `docs/project/tasks/CEV-PILOT-LAUNCH-86A.md`
- `docs/project/handoffs/CEV-PILOT-LAUNCH-86A-morgan.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `docs/project/PROJECT_STATUS.md`
- `README.md`
- `MEMORY.md`

## Acceptance criteria

- Walkthrough gives a clear sequence from first prospect to first pilot day.
- It uses managed-pilot language and does not claim full automatic booking or fully self-service SaaS.
- It separates no-cost work from owner decisions involving money, live provider traffic, external messages, calendar writes, billing or client commitments.
- It includes exact stop rules and success criteria.
- No secrets, webhook URLs, credentials, real customer records, transcripts, recordings or private screenshots are stored.

## Required evidence

- Documentation diff reviewed.
- Secret/private-data scan against edited files.
- Record skipped checks explicitly; documentation-only changes do not require app test reruns unless code changes.
