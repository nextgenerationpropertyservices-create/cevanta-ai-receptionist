# CEV-MAKE-MINIMAL-77C — Minimal safe Make dry-run plan

Owner: Morgan — Product Manager and Orchestrator
Status: ready for Make build on 2026-10-05

## Scope

Prepare a minimal Make dry-run scenario design that can be built without touching the active scenario and without live side effects.

## Dependencies

- CEV-MAKE-SAFE-COPY-77B identified that the cloned full scenario still contains Gmail, Google Calendar and SMS side-effect modules.
- Owner is signed in to Make.

## Allowed files

- `docs/ops/MAKE_MINIMAL_SAFE_DRY_RUN.md`
- `docs/project/tasks/CEV-MAKE-MINIMAL-77C.md`
- `docs/project/handoffs/CEV-MAKE-MINIMAL-77C-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `MEMORY.md`

## Acceptance criteria

- Define a minimal Make scenario path with webhook input, event filtering, safe mapping and safe response/log only.
- Explicitly block Gmail, SMS, Google Calendar, production Cevanta writes, live Retell registration and Twilio routing.
- Define fictional dry-run cases and pass criteria.
- Do not store webhook URLs, secrets, real customer data, transcripts or recordings.

## Evidence

- Created `docs/ops/MAKE_MINIMAL_SAFE_DRY_RUN.md` with required modules, dry-run cases, pass criteria and stop conditions.

## Known limitations

- This is the safe build plan only. The minimal Make scenario has not yet been built or run.
- Live Retell, Twilio, SMS/email/calendar and Cevanta production writes remain blocked.
