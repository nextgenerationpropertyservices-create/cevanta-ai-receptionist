# Onboarding retained-history and bounded-projection contract

Date: 2026-10-04. Task: CEV-ONBOARD-HISTORY-68A. Owner: Atlas. Morgan accepts. This is a documentation-only architecture contract for future implementation. It does not change source code, migrations, tests, hosted databases, provider settings, credentials, external writers or production state.

## Purpose

The guided onboarding setup editors now cover settings authority fields, resume progress, services, weekly hours, date-specific hours exceptions, request-only preferences and escalation contacts. The storage model intentionally retains history: rows are not deleted merely because an owner removes them from the active setup. That is useful for audit, recovery, replay and future operations, but it creates a read-contract risk if every retained row is always returned to every editor.

This contract separates three ideas:

- retained history: database facts preserved for audit and recovery
- bounded current-state projections: the small, active view a setup editor may load and submit
- explicit history/recovery projections: separate future views for inspecting, re-enabling or reconciling retained rows

Future work must preserve the LOCK60 config revision, compare-and-swap and same-request replay rules. This document does not implement the design and does not prove live hosted behavior.

## Current source-derived limits

The accepted storage and RPC path currently behaves as follows.

- `tenant_setup_state.config_revision` is the tenant-wide setup revision for configuration commands.
- `replace_services` accepts at most 100 submitted service items. Omitted enabled service rows are disabled and retained.
- `replace_escalation_contacts` accepts at most 20 submitted contact items. Omitted enabled contact rows are disabled and retained.
- `tenant_hours_days` is keyed by weekday, so weekly hours have at most seven current rows.
- `tenant_hours_exceptions` is keyed by local date and capped at 366 retained dates. Removing an exception marks the date inactive rather than deleting it.
- `tenant_booking_preferences` is a singleton current preference row for the tenant.
- Owner snapshots currently include all service rows, all escalation contact rows and all exception rows for the tenant; dispatcher snapshots include active exceptions and service summaries.
- The current UI seeds replacement editors from the owner snapshot. As retained services or contacts accumulate, the returned history can exceed replacement input limits even if the active current list is small.

The retained-history risk is therefore architectural, not a reproduced production incident in this task. It must be fixed by designing bounded projections and explicit history behavior, not by deleting retained records to fit the form.

## Contract terms

Retained row means a tenant-owned setup row that remains in storage after it stops being part of the current setup. Examples include disabled service rows, disabled escalation contact rows and inactive date exceptions.

Current projection means the bounded data a normal setup editor reads and resubmits under one `config_revision`.

History projection means a separate bounded read model that exposes retained records for audit, recovery, re-enable or diagnostics. It must have its own pagination/filtering contract and role-specific privacy rules.

Tombstone means a retained row whose current operational effect is off. For setup history, disabled services and contacts are tombstones by business meaning; inactive date exceptions are explicit tombstones by date.

Re-enable means making a retained row active again through a reviewed operation that preserves the row identity and advances `config_revision`.

Omission means the submitted current projection does not contain a previously active row. Omission may disable the row only when the operation is explicitly a full replacement of that bounded current list and the precondition revision is current.

## Source of truth and tenant safety

The database remains the source of truth. Future projections must be produced by guarded server/database code that verifies the current user, confirmed identity where required, tenant membership and operation role. Ordinary app requests must not use a service-role client.

Base tables for onboarding history should remain tenant-bound, RLS-enabled and closed to direct public table access unless a future Atlas/Quinn review explicitly approves a different design. If views are introduced, they must not bypass RLS for exposed roles; prefer guarded RPC projections or security-invoker views with explicit grants and tests. Security-definer functions remain sensitive: they must keep explicit `auth.uid()`/membership checks, narrow grants, fixed search paths and safe error responses.

Every retained row identity must include tenant ownership in lookups and constraints. A row ID from one tenant must never disclose existence or state to another tenant through current projections, history projections, receipts, conflicts or validation errors.

## Projection model

Future implementation should split onboarding reads into at least these conceptual projections.

1. Owner current setup projection
   - For owner/admin editing.
   - Contains only the bounded current state needed for the editor.
   - Includes `config_revision`.
   - Includes enough row IDs and versions to resubmit current items.
   - Does not include private receipts, request IDs, tokens or unbounded history.

2. Dispatcher operations projection
   - For dispatcher operational visibility.
   - Contains active operational services, weekly hours, active date exceptions and request preferences.
   - Excludes private owner/admin contact history and inactive tombstones unless a future role policy explicitly allows them.

3. Basic workspace projection
   - For technician/viewer setup-adjacent routing.
   - Does not include setup history or mutation controls.

4. Owner history projection
   - Future, separate from the normal editor.
   - Bounded by pagination or explicit filters.
   - Lets owner/admin inspect disabled services, disabled escalation contacts and inactive exceptions without forcing them into replacement payloads.
   - Requires its own follow-up implementation and Quinn review.

The normal editor must not depend on an unbounded all-history array. A future UI can show a small "recent disabled" hint only if that hint has a hard server-side bound and cannot become the replacement payload by accident.

## Services

Current-state projection:

- Return active services plus any disabled services currently selected for explicit edit/re-enable, within an approved item limit.
- Sort deterministically by `position`, then stable row identity.
- Include `id`, `name`, `description`, `enabled`, `position` and `version` for editable rows.
- Keep the current replacement submit limit at or below the reviewed input cap. If the UI needs more than 100 active services, that is a product and backend redesign, not a silent cap bypass.

Retained history:

- Disabled service rows are retained for audit/recovery.
- Re-enable must reuse the retained service ID when the row represents the same business service.
- History reads must be paged or filtered. Required filters should include active state and optional search by name.
- The system must never delete disabled services merely to make the editor fit.

Omission semantics:

- In a current replacement command, omitting an active service means disable that service only when the submitted projection was current and intentionally represented the full active list under the reviewed revision.
- Omission of a disabled historical service from the current editor means nothing. It must not delete, alter or further tombstone that retained row.

Required future evidence:

- Fixture with at least 101 retained service rows and a bounded active subset.
- Owner/admin can edit the bounded current list without submitting all history.
- Re-enabling a disabled row preserves tenant and row identity.
- Foreign tenant service IDs return safe unavailable/conflict behavior without disclosure.

## Weekly hours

Current-state projection:

- Return seven weekday rows when initialized, or a clearly defined partial/uninitialized shape until a future read-contract task tightens this.
- Each day contains `weekday`, `closed` and normalized non-overlapping intervals.
- The projection is naturally bounded by weekdays. It should remain part of the current setup projection rather than history pagination.

Retained history:

- Weekly hours currently overwrite the row per weekday with version/audit history, not separate retained business rows.
- Historical weekly-hours audit is an audit trail concern, not an editor payload concern.
- Future detailed weekly-hours history, if needed, should be designed as an audit/reporting projection rather than overloading the current setup snapshot.

Omission semantics:

- A weekly-hours replacement must be a complete reviewed seven-day payload unless Morgan/Atlas approve a partial patch command.
- Missing weekday data in a submitted replacement is validation failure, not "leave unchanged."

Required future evidence:

- Closed days have empty intervals.
- Intervals are normalized, ordered and non-overlapping.
- Partial stored snapshots, if still supported for legacy/uninitialized tenants, decode safely without inventing readiness.

## Date-specific hours exceptions

Current-state projection:

- For owner/admin current editing, expose active exceptions in a bounded operational list plus the selected local date being edited.
- Dispatcher operations projection should include active exceptions only.
- The normal setup editor should not need all inactive tombstones to add, update or remove a selected date.

Retained history:

- A local date can have a retained row even when inactive.
- Removing an exception marks the date inactive; re-adding the same date should reuse the retained row under the existing schema.
- The hard retained-date cap is 366. This is a storage cap, not proof that returning all exceptions forever is the best UI contract.

Omission semantics:

- Omission from an active-exception list does not remove all omitted dates unless the command is explicitly a full bounded replacement. Current accepted commands are upsert/remove by local date, so omission should normally have no effect.
- Removing an absent date is a no-op only under a current valid precondition and should still preserve replay semantics.

Required future evidence:

- Active and inactive date fixtures up to the cap.
- Remove/re-add preserves the same tenant/date identity.
- Active operational projection stays bounded and excludes inactive tombstones for dispatcher.
- Owner history projection can inspect inactive dates without loading every tombstone into the current editor.

## Request preferences

Current-state projection:

- Request preferences are a singleton setup area. Return either null or one current object with `request_only` mode and normalized optional lead time, buffers, horizon, notes and acknowledgement.
- Preferences do not create appointment availability, provider readiness, external delivery or production release evidence.

Retained history:

- Preference changes are retained through row version/audit/receipt behavior rather than multiple active preference rows.
- A future audit viewer may show preference history, but the setup editor should receive only the current singleton.

Omission semantics:

- Omission of the singleton from unrelated setup editors means unchanged.
- A preference save must carry an explicit current payload and config precondition. Null/blank fields mean the normalized values accepted by validation, not "keep old" unless the command contract says so.

Required future evidence:

- No-op preference save does not advance revision after initialization.
- Stale preference save conflicts.
- Preference saves do not modify services, hours, exceptions or contacts.

## Escalation contacts

Current-state projection:

- Return active escalation contacts plus any disabled contacts explicitly selected for re-enable/edit, within an approved limit.
- Keep private contact values restricted to owner/admin projections unless Morgan approves a narrower dispatcher need.
- Include row IDs and versions only for rows the editor may resubmit.

Retained history:

- Disabled escalation contacts are retained because they may be needed for audit and recovery.
- Re-enable must preserve the retained row ID where the business contact is the same retained record.
- History reads must be paged or filtered and must not be sent to limited roles.
- Contact history is sensitive. Do not put private emails/phones into screenshots, logs, fixtures or broad network projections.

Omission semantics:

- In a current replacement command, omitting an active contact disables it only when the submitted projection intentionally represented the full active contact list under the reviewed revision.
- Omission of disabled retained contacts from the current editor means unchanged.

Required future evidence:

- Fixture with at least 21 retained contacts and a bounded active subset.
- Owner/admin can save current contacts without loading all disabled history.
- Dispatcher/technician/viewer cannot receive private retained contact history.
- Foreign tenant contact IDs fail safely.

## Lock and replay preservation

All current and future setup-history operations remain under the LOCK60 contract unless Atlas approves a replacement.

- Current projections carry `config_revision`.
- Mutations submit `expected_config_revision` and a single-use `request_id`.
- Same-request replay requires the same tenant, verified actor, command, request ID and normalized input digest.
- Request reuse with changed payload, expected revision, row ID allocation or selected history row returns conflict and mutates nothing.
- A replayed result is historical. It does not prove the current projection is fresh.
- After replay, conflict, unavailable or retryable uncertainty, the UI must require refresh/review before a dependent edited submit.
- Server-allocated IDs from null input must be recovered by replaying the same request or by a fresh authorized projection after reconciliation.

History projections do not relax locking. Selecting a retained row for re-enable creates a normal current-state mutation with the current revision and the retained row ID scoped to the tenant.

## Migration, API and UI implications

This task does not create a migration. Future implementation likely needs separate tasks for these decisions.

Migration/API possibilities:

- Add bounded projection RPCs or shared result contracts that separate current setup from retained history.
- Add indexes for history pagination, such as tenant/active/position/id for services and contacts, and tenant/active/local_date/id for exceptions.
- Add explicit history count or `has_more_history` fields if the UI needs to explain that retained records exist outside the current editor.
- Add projection tests for 101 services, 21 contacts and 366 exceptions.
- Preserve existing rows and receipts during migration. Prefer forward repair over destructive rollback.

UI possibilities:

- Keep normal setup editors focused on current active rows.
- Add separate owner/admin history/recovery panels only after a bounded backend contract exists.
- Make re-enable an explicit command or explicit inclusion of a retained row selected from a history projection.
- Keep internal revisions, receipts, request IDs and private contact history out of product copy.

Backend possibilities:

- Decode current projections separately from history projections.
- Keep safe unavailability for unauthorized row IDs and foreign tenant references.
- Preserve replay/no-op/conflict semantics for all new commands.
- Keep request preferences singleton and weekly hours bounded rather than forcing them into the retained-row history model.

## Privacy and security constraints

- No credentials, real customer data, real contact data, raw provider payloads or tokens may appear in source, fixtures, logs, screenshots or documents.
- Owner/admin projections may include private escalation contact details needed for editing. Dispatcher projections should not receive retained private contact history without a product decision and review.
- Technicians/viewers should not receive setup history through onboarding projections.
- History pagination cursors or filters must not encode secrets or raw private data.
- Direct PostgREST/table access must remain denied unless a reviewed RLS/grant design changes it.
- Live Supabase Auth/JWT/PostgREST evidence remains separate from embedded SQL or mocked action evidence.

## Follow-up task recommendations

Morgan should split follow-up work with disjoint ownership.

1. HISTORY68B - Atlas/Blake contract finalization if implementation needs shared types or new SQL contracts.
   - Files only as assigned by Morgan.
   - Decide exact current/history projection shapes, pagination fields, limits and indexes.

2. HISTORY68C - Blake bounded projection implementation.
   - Requires Atlas review before migration/shared-contract changes and Quinn review after implementation.
   - Prove tenant-safe reads, active-only current projections, history pagination, no deletion and lock/replay preservation.

3. HISTORY68D - Nova history/recovery UI, only after backend projection acceptance.
   - Owner/admin history panels, explicit re-enable flow, stale conflict copy and private-data-safe rendering.
   - Limited roles must not see mutation controls or retained private contact history.

4. HISTORY68E - Quinn security and runtime review.
   - 101-service, 21-contact and 366-exception fictional fixtures.
   - Cross-tenant ID attempts, all roles, stale/replay/no-op, network privacy and no-secret artifact review.
   - Live Auth/JWT/PostgREST and genuine concurrency remain separate unless ENV/JWT/RACES tasks are assigned and ready.

5. POLICY69 alignment.
   - Morgan must still decide completeness/readiness meanings. History and bounded projections do not decide whether setup is complete, provider-ready or production-ready.

## Acceptance boundary

This contract is accepted only when Morgan accepts CEV-ONBOARD-HISTORY-68A. It is not implementation evidence. Later tasks must cite this document, keep file ownership exact in the ledger, preserve tenant safety and produce their own checks before Morgan can accept bounded history projections in the product.
