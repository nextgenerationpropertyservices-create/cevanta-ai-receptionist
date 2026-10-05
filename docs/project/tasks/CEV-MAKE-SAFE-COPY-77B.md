# CEV-MAKE-SAFE-COPY-77B — Make safe dry-run copy

Owner: Morgan — Product Manager and Orchestrator
Status: blocked before execution on 2026-10-05

## Scope

Create and inspect a safe Make scenario copy for Retell/Cevanta dry-run work without running the active scenario or sending live SMS, email, calendar or booking side effects.

## Dependencies

- CEV-LIVE-PROVIDER-77A live-provider readiness setup.
- Existing Make scenario `Cevanta Receptionist — New Draft v2`.
- Owner signed in to Make on 2026-10-05.

## Allowed files

- `docs/project/tasks/CEV-MAKE-SAFE-COPY-77B.md`
- `docs/project/handoffs/CEV-MAKE-SAFE-COPY-77B-morgan.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `docs/project/PROJECT_STATUS.md`
- `MEMORY.md`

## Acceptance criteria

- Inspect the Make scenario without running it.
- Create a separate dry-run copy that does not reuse the source scenario's webhook trigger.
- Confirm the dry-run copy is inactive and not currently running.
- Identify live side-effect modules that must be disabled, replaced or guarded before any run.
- Do not record webhook URLs, API keys, provider secrets, real transcripts or call recordings.

## Evidence

- Original scenario inspected: `Cevanta Receptionist — New Draft v2`, scenario ID `6495246`.
- Original scenario history showed activation on 2026-10-05 at 10:15 AM and no visible execution rows in the inspected history list.
- Original scenario usage panel showed `0 credits` and `0 B data transfer` for the last 7 days and `No execution is currently running`.
- Created separate Make scenario copy: `Cevanta Receptionist — Safe Dry Run`, scenario ID `6515596`.
- Make required a replacement webhook because the original webhook could not be duplicated. A new replacement webhook was created for the dry-run copy; its URL is not recorded because webhook URLs are secret-like.
- Dry-run copy opened as `Inactive`, showed `0 credits`, `0 B data transfer`, and `No execution is currently running`.
- Diagram inspection found side-effect modules still present in the copy: Gmail urgent lead alert, Google Calendar create appointment, Gmail unavailable-time alert, Gmail callback email and SMS callback message.
- Opened the Gmail urgent lead module and confirmed it still uses a real Gmail connection and real recipient. The module was closed without saving; the dry-run scenario was not run.

## Known limitations

- No Make scenario execution occurred.
- Side-effect modules are identified but not neutralized.
- The accessible Make UI did not expose a simple per-module disable control in this pass.
- The dry-run copy must not be run until Gmail, Calendar and SMS modules are disabled, replaced with safe logging, or guarded by impossible/explicit dry-run filters.
