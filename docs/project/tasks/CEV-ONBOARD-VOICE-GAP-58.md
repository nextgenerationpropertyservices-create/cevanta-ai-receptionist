# Voice/provider readiness alignment after onboarding storage

- Task ID: CEV-ONBOARD-VOICE-GAP-58.
- Owner: Echo owns voice/integration readiness planning. Morgan coordinates and accepts.
- State: accepted with limitations.
- Scope: Review the current onboarding setup fields and identify what still must exist before Retell/Make/Twilio workflows can safely use them. Focus on provider readiness, business hours/services/escalation usage, request-only booking boundaries, tenant mapping, failure recovery and what must remain blocked. No live provider calls or implementation.
- Dependencies: accepted Retell/Make planning tasks and onboarding SETUP53; STATUS54 pending review.
- Allowed files: docs/project/ONBOARDING_VOICE_READINESS.md; docs/project/handoffs/CEV-ONBOARD-VOICE-GAP-58-echo.md. No other writes.
- Prohibited/shared files: No source code, migrations, SQL tests, provider settings, Make/Retell/Twilio changes, hosted changes, live calls/messages/bookings, credentials, production deployment or external writers.
- Acceptance criteria: Produce a provider-readiness gap list and recommended task sequence that keeps provider/live booking readiness false until verified. Include what setup data can be read safely later and what must not trigger calls/bookings/messages.
- Required evidence: Echo handoff using docs/templates/AGENT_HANDOFF.md.
- Reviewers: Morgan accepts. Quinn review may be required before any later live integration task.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Keep provider readiness false until later trusted routing/provider contracts and live verification are assigned and accepted.
