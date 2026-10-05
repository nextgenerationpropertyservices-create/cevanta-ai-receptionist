# Nova — final onboarding UX confirmation

- Task ID: CEV-ONBOARD-FINALIZE-43.
- Owner/scope: Nova, frontend_ux, review-only confirmation requested by Morgan. Sole allowed/changed file: this handoff. No other agent's files touched. Morgan owns acceptance.
- Decision: **PASS WITH LIMITATIONS**. The explicit accepted/already_accepted/replayed union and immutable acceptance versus current projection semantics can be represented truthfully in the narrowed UI. No remaining UX blocker in these two corrections. Earlier excluded first-client/bootstrap/delivery/continuation/completion-policy and live-readiness gates remain; this is not complete onboarding approval.
- Work completed/files reviewed: Task43, Atlas43 final corrections, Nova42 clarification review and handoff template. Compared against previously reviewed onboarding rules and existing tenant invariants. No source/private records/provider/session inspected.
- Files changed: docs/project/handoffs/CEV-ONBOARD-FINALIZE-43-nova.md only.
- Database/API changes: None. Future result schemas reviewed; no deployed implementation inferred.

## Invitation results and current projection

| Result | Truthful UI behavior |
| --- | --- |
| accepted | Your invitation was accepted. Proceed using the returned authorized workspace/role/entry. Do not claim a new account or new membership was created: exact-role membership might already exist. |
| already_accepted | This invitation was already accepted. Continue to your workspace. No new acceptance date, membership or onboarding completion implied. |
| replayed | Your invitation acceptance was already recorded. Continue to your workspace. Replay is handling of a prior successful request, not a customer-facing invitation status or renewed permission grant. |

The original acceptance.invitation_id/accepted_at identify the immutable acceptance. Workspace name and entry are fresh authorized projection, so a retry can display a changed current workspace name or route differently without rewriting acceptance history. Never cache role/entry/name from the old receipt response as permission authority. The opaque invitation ID need not be displayed. A new request returning already_accepted must not show another success-history event or reset the displayed acceptance date.

Pending policy routes entry setup, but it does not authorize trapping clients in the wizard or claiming they failed required setup. Preserve access to other currently authorized modules. Dashboard entry is navigation only, never full-product/provider/booking readiness. In this subset, do not offer Create account, issue/reissue/revoke invitation, email delivery or Go live.

A successful committed response is required before displaying acceptance. Projection/receipt/transaction failure returns retryable_failure, not a partial success. If the response is lost, retain the original attempt identity through the approved secure mechanism and retry the original token/request; do not create a new acceptance attempt merely because UI did not receive confirmation. Generic unavailable/member conflict/request-reuse must not reveal the recipient or another workspace, offer role override, or imply removed access can be restored with a token. Accepted token expiry does not itself revoke existing membership, while current email/role/member checks remain authoritative; normal workspace entry is the recovery path for an authorized member.

## Profile correction resolves earlier compatibility concern

Name, trade and timezone remain required valid tenant-authoritative values. Preload them and submit their explicit current values for contact-only edits. Blank optional contact fields may be saved as incomplete; blank/null/invalid authority rejects the entire operation. Copy must say Save business details / Details saved rather than Profile complete, and errors must preserve all unsaved edits, label the offending field and never announce a partial contact save. No silent retention, default timezone/trade or null-tenant workaround.

Concurrent profile/setup edits still conflict through shared config revision; refresh current state for explicit review, never overwrite silently. Initial revision0→1/no-op handling is an internal save protocol, not user-facing setup completion. Existing settings writes need assigned integration so they cannot bypass invalidation. Final43 supersedes Nova42's earlier conditional null-authority allowance; no clearing of required authoritative fields is permitted.

- Required later evidence: Connected synthetic tests for all three success statuses; first acceptance with/without existing exact-role membership; same request and new request retries before/after accepted-token expiry; newer name/entry alongside unchanged accepted_at; current role/email/member removal denial; request conflict and safe errors; projection/audit/receipt fault rollback and lost-response recovery. Profile tests include valid authority with incomplete contact fields, required-authority rejection with no partial save, invalid legacy timezone correction, conflict/input retention, settings/M5 compatibility and revision invalidation. Desktop/mobile keyboard/announcements/focus/error labels and safe generic unavailable views must be demonstrated after implementation; no token-bearing screenshots or logs.
- Verification commands/results: Read-only Get-Content/document comparison completed. Typecheck, lint, tests, SQL/concurrency, production build, browser/Auth, provider and hosted checks **SKIPPED/NOT RUN** because this is review-only. No fresh runtime evidence claimed.
- Limitations/risks: Stale projected entry or role used as authority; replay shown as renewed membership; acceptance date rewritten; receipt/projection failure shown as partial success; profile validation failure loses contacts or silently saves them; setup entry confused with operational readiness. Security/transaction acceptance remains Blake/Quinn's independent review and Morgan's decision. Complete delivery/account/continuation/readiness journeys remain outside this confirmation.
- Rollback notes: Remove this handoff only; no source/database/provider effects.
- Exact next action: Morgan collect Blake/Quinn confirmation and accept the corrected narrowed contract if their findings permit. Assign actual schema/shared types/backend/UI/tests under disjoint ownership, with Atlas/Quinn gates. Do not label the complete first-client journey accepted from this review.
