# Agent handoff — Atlas final onboarding corrections

- Task ID: CEV-ONBOARD-FINALIZE-43.
- Owner: Atlas; Morgan acceptance and Blake review required. Quinn confirmation recommended because result projection/receipt interpretation is clarified; no authorization relaxation intended.
- Files reviewed: AGENTS.md, MEMORY.md, context/, collaboration/status, task43, Atlas42, Blake42 and Quinn42; existing foundation tenant name/trade/timezone constraints. Prior Nova/Phoenix/Echo limits remain applicable.
- Work completed: Resolved the two specified blockers through exact rules below. This document supersedes only inconsistent profile and invitation-result wording in Atlas38/42. Scope remains verified-existing-account invitation acceptance plus configuration persistence; delivery, issuance UI, new-account/continuation, operational readiness and production remain excluded.
- Allowed/changed files: This handoff only. Other agents' work preserved.
- Database/API changes: None applied. Prospective command correction; no tenant constraint weakening or duplicate authority introduced.

## 1. Profile persistence uses existing required tenant invariants

Choose **reject incomplete authoritative tenant fields; permit incomplete contact fields**. tenants.name/trade/timezone remain sole authority. No nullable tenant migration, duplicate profile draft values, delayed promotion, hidden retention of submitted null or fabricated fallback.

SaveBusinessProfile.payload remains strict with all keys required:

| Field | Exact accepted normalized value |
| --- | --- |
| name | string, ASCII edge-trimmed, 1–160 Unicode code points; empty/whitespace/null invalid |
| trade | string, same trim, 1–80 code points; empty/whitespace/null invalid |
| timezone | non-null string containing an explicitly supported valid IANA identifier; empty/null/invalid unsupported value invalid |
| business_contact_name | string, same trim, 0–160 code points; empty valid incomplete contact |
| business_email | null or valid email within254 code points; empty string normalizes null |
| business_phone | null or bounded validated phone representation within40 code points; empty string normalizes null |

No key omission, string-to-null tenant coercion, default HVAC/trade/timezone, browser timezone or silent retention of prior authority. Config form preloads current tenant values; user may retain them explicitly in input. An invalid legacy tenant timezone is surfaced for correction, not accepted as ready or automatically normalized. Contact requiredness/completion policy remains not_evaluated/setup_policy_pending until separately approved; incomplete contact storage is not a completed profile.

Valid command writes tenant authority and contact profile atomically with version/receipt/audit as Atlas42. Any invalid authoritative field rejects the entire command: no partial contact save, revision increment, audit or receipt. UI preserves unsaved edits and names the invalid field; it must not announce partial save. Contact-only edits still send valid current name/trade/timezone and expected_config_revision. Concurrent changes produce revision conflict, not overwrite. Generic incomplete-save0..max wording applies only designated contact draft fields, never tenant authority or other explicitly nonempty invariants.

Existing tenant/settings and M5 consumers keep non-null Tenant contract; direct legacy settings mutations must participate in shared config revision/invalidation or be replaced through a separately assigned ownership transfer. No broad grant bypass allowed. Initial root handling is now fixed: before root exists, read config_revision0; first successful command creates root revision1, including a no-op or absent-exception removal. That initialization is a real metadata change audited once. Subsequent exact normalized no-ops retain positive revision; resume initializes its own version1 separately. Domain failure creates neither root nor receipt. Receipt result for first absent-exception removal is id:null, version/config_revision1; subsequent no-op keeps current revision.

Specific implementation validation prerequisites still belong in the assigned shared-types/schema task: one explicit supported email/phone/IANA representation and SQL/server parity, canonical digest domain/serialization and stable code allowlists. Do not substitute permissive parser defaults. This correction resolves existing-tenant compatibility without claiming those runtime validators already exist.

## 2. Invitation success/result and durable receipt rules

Exact success shape:

`{status:'accepted'|'already_accepted'|'replayed', acceptance:{invitation_id:UUID, accepted_at:UTCString}, workspace:{id:UUID,name:string}, role:AppRole, entry:'setup'|'dashboard'}`.

Failure shapes remain Atlas42 unavailable, membership_conflict, conflict/request_reuse, retryable_failure. No token/email/digest/private diagnostic echo. Role is the current exact intended invitation role after reauthorization; changed role never returned as success. Workspace name and entry are fresh current authorized projections, not immutable receipt data. `acceptance.invitation_id/accepted_at` are the immutable original accepted transition. `status` denotes current call handling, not a second invitation state change.

Receipt namespace onboarding-v1/invite_accept remains tenant/actor/command/request scoped. Digest binds contract version, request UUID, actor and canonical token digest; target/result is invitation UUID. **Every successful new request MUST create an immutable private receipt atomically**, including already_accepted; optional receipt wording is removed. Receipt stores minimal immutable invitation/actor/intended-role/accepted_at outcome and no workspace name/entry/email/token. Same request retry derives status replayed even if original request returned already_accepted. Accepted transition time never refreshes. Current projection is recomputed after reauthorization; receipt is not a cached permission-bearing UI response.

| Current situation | Exact behavior |
| --- | --- |
| Pending valid invitation, first request, confirmed matching actor/email, absent or exact intended-role membership | Atomically create membership only if absent, mark accepted once, audit only actual transitions, persist receipt; status accepted. |
| Accepted by same actor, same successful request/digest | Reauthorize current confirmed account/email, exact intended-role membership and invite binding; return replayed with immutable acceptance and fresh projection. No receipt/audit/business write. |
| Accepted by same actor, new request UUID, same token | Same current reauthorization; MUST persist a new receipt, return already_accepted with original acceptance and fresh projection. No new membership, acceptance timestamp or business audit; private receipt insert is not a business change audit. |
| Accepted token expired, same/new authorized request | Expiry is NOT reevaluated as admission for accepted replay/already_accepted. Same request=replayed, new request=already_accepted plus receipt. Token never grants missing membership or bypasses email/role checks. Ordinary workspace entry remains available without token. |
| Pending token expired after lock waits | unavailable; no membership/accepted transition/receipt. Pending freshness uses trusted post-wait clock as Atlas42. |
| Current member removed/demoted or role differs from intended invitation | unavailable on accepted branches; no receipt read/result exposure or membership restoration. For pending invite with differing existing role, membership_conflict without role change. |
| Wrong actor, unconfirmed/deleted account or current email no longer matches canonical recipient binding | unavailable on every branch; no cached receipt success, no identity update or email fallback. |
| Successful request UUID reused with another token/digest/target | conflict/request_reuse after current safe scope/identity checks; never original acceptance content/target leakage. |
| Accepted invitation revoked through trusted reviewed operation | unavailable regardless of receipt; no token reset/reacceptance. |

Auth/email/invitation/member checks, target binding and lock order from Atlas42 remain mandatory for every branch. New request already_accepted is business-state idempotent but produces its own durable operation receipt; identical replay makes no writes. Both acceptance branches ignore changed setup-completion policy for immutable acceptance outcome, but entry is computed from current permitted setup projection. Pending policy/not_evaluated means entry setup, not dashboard readiness. No complete-client/operational readiness implication from accepted or dashboard entry.

Projection consistency: under established transaction tenant/invite/identity/membership locks, obtain current workspace name and authorized setup-routing snapshot for response. Separate receipt’s immutable acceptance from this current projection. Config changes serialized by tenant lock may yield a different entry on later retry; that is intentional and documented, not corrupted receipt replay. If projection retrieval fails, do not return guessed name/entry: abort the transaction when inserting a new receipt/acceptance, or return retryable_failure with no new writes for an existing receipt replay. Only successful committed projection-bearing results are promised replay outcomes.

Fault recovery: audit/receipt/projection failure rolls back all changes in a new acceptance; already_accepted new-request failure rolls back its new receipt, preserving historical acceptance. Lost response uses original request/token to retrieve reauthorized replay. No clearing successful receipt, resetting accepted_at or reinserting membership to make tests pass. Token expiry never erases retained private receipts.

## Tests, limits and handoff

- Required implementation tests: empty/whitespace/null name/trade; null/invalid legacy timezone; valid authority plus blank contact persists; invalid authority causes complete rollback; no silent fallback; legacy settings/M5 reads and invalidation compatibility; first revision1 versus subsequent no-op; absent exception result initialization. Invitation same/new request before/after expiry; two already_accepted concurrent new requests; removal/demotion/email change denies; token/request collision; current name/entry changes while immutable accepted_at stays fixed; audit/receipt/projection fault rollback and lost-response replay; no payload/digest disclosure or new business audit for reacceptance.
- Remaining blockers: No additional product decision needed to resolve these two narrowed-subset rules. Blake confirmation/Morgan acceptance still required; actual validation parity, grants/Auth access, constraint/trigger and concurrency evidence required before runtime acceptance. Previous excluded issuer/delivery/new-account/continuation/completion-policy/live-readiness/hosted gates remain unchanged. Nova should receive changed three-state invitation success contract; Quinn may confirm authorization semantics preserved.
- Verification: Manual source-constraint/document reconciliation only. **Runtime checks SKIPPED because this is documentation-only**: typecheck/lint/tests/SQL/concurrency/build/browser/Auth/provider/hosted all NOT RUN. No migrations, code, UI or external actions performed.
- Risks: Treating already_accepted as new membership, returning stale recipient/role from receipt, mixing immutable accepted outcome with cached readiness, allowing null tenant fields despite compatibility constraints, or silently saving only contacts. Existing locks/privileged functions still need actual independent security review.
- Rollback notes: Documentation only. Later remediation preserves original invite acceptance/receipt/config identity and disables unsafe commands; no nullable-authority workaround, accepted-token reset or membership recreation.
- Exact next action: Morgan requests Blake review of these exact corrected rules, informs Nova/Quinn of explicit invitation success and immutable-versus-current projection semantics, then assigns disjoint implementation only for the accepted verified-account/config persistence subset. Complete onboarding, external delivery and production remain separately blocked.
