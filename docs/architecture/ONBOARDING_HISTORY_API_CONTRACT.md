# Onboarding owner history API contract

Date: 2026-10-04. Task: CEV-ONBOARD-HISTORY-68C. Owner: Atlas. Morgan accepts. This is a documentation-only API contract for future owner/admin retained setup history and re-enable flows. It does not implement source code, migrations, SQL tests, UI, hosted database changes, provider settings, external writers, calendar sync or production changes.

## Purpose

HISTORY68B changed normal setup snapshots so owner/admin and dispatcher reads receive bounded current projections instead of unbounded retained rows. Retained rows still exist in storage for audit, recovery and replay. This contract defines the separate owner/admin history API needed to inspect and re-enable those retained rows safely.

The future API must keep these boundaries:

- Normal setup snapshots remain current-state reads.
- History reads are owner/admin-only and explicitly paged or filtered.
- Re-enable writes are normal configuration writes with `config_revision`, `request_id`, compare-and-swap and replay semantics from LOCK60.
- Disabled services, disabled escalation contacts and inactive date exceptions are retained; they must not be deleted to make the UI simpler.
- This contract does not decide setup completeness, provider readiness, live booking, invitation issuance or production release.

## API surface

Future implementation should add guarded backend entry points with these conceptual names. Exact exported names may differ if Morgan assigns a naming task, but the shapes and semantics below are the contract.

1. `onboarding_history_list`
   - Read-only owner/admin retained-history projection.
   - Returns one page for one history kind.
   - Does not mutate data or create receipts.

2. `onboarding_history_reenable`
   - Owner/admin mutation to re-enable one retained row.
   - Uses the existing tenant-wide setup `config_revision`.
   - Creates or reuses the existing receipt model for same-request replay.

These APIs are separate from `onboarding_snapshot`. Normal snapshots must not regain unbounded retained rows.

## Shared authorization and safety

Every history read and re-enable request must verify:

- current authenticated user from the ordinary session client
- confirmed/non-deleted Auth identity where the existing onboarding RPCs require it
- current tenant membership
- owner or admin role
- requested row belongs to the requested tenant before any row-specific response reveals state

Ordinary app requests must not use a service-role client. Database RLS, revoked base table privileges, fixed search paths and narrow RPC grants remain defense in depth. If future implementation uses security-definer functions, they must keep explicit identity and membership checks, safe `unavailable` behavior, and no broad table exposure. If future implementation uses views, they must not bypass RLS for exposed roles without an explicit Atlas/Quinn review.

Dispatcher, technician and viewer users must not receive owner history projections. They should receive `unavailable` or the existing role-limited projection behavior, not partial history.

## History kinds

The read API accepts exactly one history kind per request:

- `services`
- `escalation_contacts`
- `date_exceptions`

Weekly hours and request preferences are excluded from this history API. Their current storage is bounded or singleton; detailed historical views for those areas would be a separate audit/reporting contract.

## Read request contract

`onboarding_history_list` input:

```json
{
  "tenant_id": "uuid",
  "kind": "services | escalation_contacts | date_exceptions",
  "state": "disabled | inactive | all_retained",
  "limit": 1,
  "cursor": null,
  "search": null,
  "sort": "position | updated_at | local_date",
  "direction": "asc | desc"
}
```

Required fields:

- `tenant_id`
- `kind`

Defaults:

- `state`: `disabled` for services and escalation contacts; `inactive` for date exceptions
- `limit`: 25
- `cursor`: null
- `search`: null
- `sort`: kind default
- `direction`: `asc`

Allowed limits:

- minimum `1`
- default `25`
- maximum `50`

The maximum is intentionally lower than current replacement caps. History pages are for inspection and recovery, not bulk replacement.

Allowed state values:

- Services: `disabled`, `all_retained`
- Escalation contacts: `disabled`, `all_retained`
- Date exceptions: `inactive`, `all_retained`

`all_retained` may include active/current rows only for review context, but the response must mark each row's state clearly and must not be used as a replacement payload. Normal current editors continue using the bounded current snapshot.

Allowed sort values:

- Services: `position`, `updated_at`
- Escalation contacts: `position`, `updated_at`
- Date exceptions: `local_date`, `updated_at`

Search:

- Services: optional search against service `name` only.
- Escalation contacts: optional search against `label` and `contact_name` only.
- Date exceptions: no free-text search; use cursor/sort and optional future date filters only after review.
- Search strings must be trimmed, no NUL, maximum 120 code points, and treated as data, not SQL fragments.

Cursor:

- Opaque string issued by the server.
- Must encode no secrets, raw private data, emails, phone numbers, request IDs, receipts or service-role information.
- Must be scoped to tenant, actor, kind, filter, sort and direction.
- Must expire or become invalid safely if it cannot be verified.
- Invalid, foreign or mismatched cursors return `validation_error` or `unavailable` without exposing row existence.

## Read response contract

Successful response:

```json
{
  "status": "available",
  "tenant_id": "uuid",
  "kind": "services",
  "config_revision": 12,
  "items": [],
  "page": {
    "limit": 25,
    "next_cursor": null,
    "has_more": false
  }
}
```

Failure responses:

- `unavailable`
- `retryable_failure`
- `validation_error` with safe issue fields/codes

The response must not include request IDs, receipts, raw audit rows, tokens, provider payloads, private SQL details, stack traces or hidden membership metadata.

`config_revision` is a review precondition for a later re-enable. It is not proof that the page contains every retained row. It is also not proof of readiness, provider connectivity or production acceptance.

## Service history item

Service history item shape:

```json
{
  "id": "uuid",
  "kind": "service",
  "state": "disabled | active",
  "version": 3,
  "name": "Maintenance",
  "description": "Seasonal maintenance",
  "position": 4,
  "updated_at": "2026-10-04T00:00:00.000000Z",
  "can_reenable": true
}
```

Rules:

- `id` is the retained `tenant_services.id`.
- `state` derives from `enabled`.
- Disabled service rows remain retained.
- Re-enable must reuse this `id`.
- `updated_at` is safe owner/admin metadata; it must not replace audit history.
- `can_reenable` is false if the row is already active, version exhausted, or future policy blocks it. It is advisory only; the server still validates on write.

The item must not include receipts, actor IDs, audit event payloads or hidden tenant details.

## Escalation contact history item

Escalation contact history item shape:

```json
{
  "id": "uuid",
  "kind": "escalation_contact",
  "state": "disabled | active",
  "version": 2,
  "label": "Office",
  "contact_name": "Fictional Contact",
  "email": "office@example.invalid",
  "phone": null,
  "position": 1,
  "updated_at": "2026-10-04T00:00:00.000000Z",
  "can_reenable": true
}
```

Rules:

- `id` is the retained `tenant_escalation_contacts.id`.
- `state` derives from `enabled`.
- Contact values are private owner/admin data. They must not be exposed to dispatcher, technician, viewer, logs, screenshots, fixtures with real data, telemetry or broad network projections.
- Re-enable must reuse this `id`.
- Search must not leak contact email/phone matches through counts or errors. Search by email/phone is not part of this contract.

## Date exception history item

Date exception history item shape:

```json
{
  "id": "uuid",
  "kind": "date_exception",
  "state": "inactive | active",
  "version": 5,
  "date": "2026-12-24",
  "closed": true,
  "intervals": [],
  "updated_at": "2026-10-04T00:00:00.000000Z",
  "can_reenable": true
}
```

Rules:

- `id` is the retained `tenant_hours_exceptions.id`.
- `date` is the immutable local Gregorian date for the row.
- `state` derives from `active`.
- Re-enable must preserve the existing row for that local date.
- Re-enable may require the caller to supply current desired `closed` and `intervals`; it must not silently turn an inactive exception active with stale hours unless the future implementation explicitly chooses and tests that behavior.
- Date exception history remains bounded by the 366 retained-date storage cap, but reads still use pagination for a consistent API.

## Re-enable request contract

`onboarding_history_reenable` input:

```json
{
  "tenant_id": "uuid",
  "request_id": "uuid",
  "expected_config_revision": 12,
  "kind": "services | escalation_contacts | date_exceptions",
  "row_id": "uuid",
  "payload": {}
}
```

Required fields:

- `tenant_id`
- `request_id`
- `expected_config_revision`
- `kind`
- `row_id`
- `payload`

The command must be one operation against one retained row. Bulk re-enable is out of scope. Bulk actions would need their own receipt and partial-failure contract.

Same-request replay:

- Same tenant, actor, command, request ID, row ID, kind and normalized payload may replay the exact prior result.
- Reusing `request_id` with a different row ID, kind, expected revision or payload returns `conflict` with `request_reuse`.
- Replayed results are historical and do not prove the current history page is fresh.

Compare-and-swap:

- The command compares `expected_config_revision` to current tenant `config_revision`.
- Stale revision returns `conflict` with `revision` and mutates nothing.
- Version exhaustion returns `conflict` with `version_exhausted`.
- Unauthorized, nonmember, limited-role, foreign-tenant and unknown-row cases return `unavailable` without distinguishing existence.

## Service re-enable payload

Service re-enable payload:

```json
{
  "name": "Maintenance",
  "description": "Seasonal maintenance",
  "position": 4
}
```

Rules:

- The retained row must belong to the tenant and currently be disabled, unless the exact request is replaying a prior successful no-op/already-active result.
- Re-enable sets `enabled` to true and updates editable fields from the normalized payload.
- It must preserve the retained `id`.
- It must increment the service row version only when row data changes.
- It must advance `config_revision` when the current setup changes.
- It must not disable or reorder other active services except through a separately reviewed replacement command.
- If the active service cap of 100 would be exceeded, return `validation_error` or `conflict` under an explicit future code. Do not silently drop another active service.

## Escalation contact re-enable payload

Escalation contact re-enable payload:

```json
{
  "label": "Office",
  "contact_name": "Fictional Contact",
  "email": "office@example.invalid",
  "phone": null,
  "position": 1
}
```

Rules:

- The retained row must belong to the tenant and currently be disabled, unless replaying an exact prior result.
- Re-enable sets `enabled` to true and updates editable fields from the normalized payload.
- At least one safe contact route requirement should match the existing escalation contact validation rules when implementation occurs. Do not loosen validation to pass tests.
- It must preserve the retained `id`.
- It must advance `config_revision` when current setup changes.
- It must not expose private contact values outside owner/admin responses or safe fictional tests.
- If the active contact cap of 20 would be exceeded, fail safely. Do not silently disable another contact.

## Date exception re-enable payload

Date exception re-enable payload:

```json
{
  "date": "2026-12-24",
  "closed": true,
  "intervals": []
}
```

Rules:

- `row_id` and `payload.date` must identify the same tenant-owned retained exception row.
- The retained row must currently be inactive, unless replaying an exact prior result.
- The date remains immutable. A re-enable command must not move one retained row to another date.
- Re-enable sets `active` to true and updates `closed`/`intervals` from the normalized payload.
- It must preserve the retained `id`.
- It must advance `config_revision` when current setup changes.
- It must preserve existing interval validation: closed means empty intervals; open intervals are ordered, non-overlapping and within one local day.
- It must not book appointments, sync calendars, decide DST booking semantics, connect providers or mark readiness complete.

## Re-enable response contract

Successful response:

```json
{
  "status": "saved",
  "entity": "history_reenable",
  "kind": "services",
  "id": "uuid",
  "version": 4,
  "config_revision": 13
}
```

Replay response:

```json
{
  "status": "replayed",
  "entity": "history_reenable",
  "kind": "services",
  "id": "uuid",
  "version": 4,
  "config_revision": 13
}
```

Failure responses:

- `validation_error`
- `conflict` with `revision`, `request_reuse` or `version_exhausted`
- `unavailable`
- `retryable_failure`

The response must not include private contact values, receipts, request IDs, row history pages, audit internals, SQL details, provider data or readiness claims.

After `saved` or `replayed`, the UI must refresh/review the normal current setup snapshot before another dependent write. After conflict/unavailable/retryable failure, the UI must preserve user input and require review or same-request retry according to LOCK60.

## Cursor and pagination details

The future implementation should use keyset pagination, not offset pagination, for deterministic retained history.

Recommended order keys:

- Services by `position`, then `id`; or `updated_at`, then `id`.
- Escalation contacts by `position`, then `id`; or `updated_at`, then `id`.
- Date exceptions by `local_date`, then `id`; or `updated_at`, then `id`.

Cursor payload should be server-protected and opaque. It should bind:

- tenant ID
- actor user ID or session-bound actor identity
- kind
- state filter
- search text hash or normalized search
- sort and direction
- last order key
- issue time and expiry

Cursor failures must be safe. A cursor for another tenant, another actor, another filter or expired state must not disclose data.

## Privacy constraints

Escalation contact history is private owner/admin data. Required constraints:

- no contact history in dispatcher, technician or viewer projections
- no private emails/phones in logs, screenshots, test evidence or docs using real data
- no email/phone search in this contract
- no contact values in cursor payloads unless encrypted/server-protected and still not loggable
- no broad RSC/network projection for limited roles

Service names/descriptions and date exceptions are tenant data and still require owner/admin history access. They should not be treated as public.

## Required tests for future implementation

Blake/backend tests:

- owner/admin can page disabled services, disabled escalation contacts and inactive date exceptions
- dispatcher/technician/viewer/nonmember/unconfirmed users cannot read history
- foreign tenant row IDs return safe `unavailable`
- cursors are tenant/actor/filter/sort bound and reject tampering
- page size defaults to 25 and rejects values above 50
- service search only searches names
- contact search only searches label/contact name and does not search or leak email/phone
- date exception list is deterministic by local date
- re-enable service/contact/date preserves row ID and advances `config_revision`
- active caps 100 services and 20 contacts fail safely on re-enable overflow
- date re-enable rejects date mismatch, invalid intervals and moving immutable dates
- same-request replay returns the same historical result
- request ID reuse with changed row/payload/precondition conflicts
- stale `expected_config_revision` conflicts without mutation
- retained rows are not deleted

Nova/UI tests:

- owner/admin history panels are separate from normal current editors
- limited roles see no retained history controls
- private contact values do not appear in limited-role HTML, screenshots or network fixtures
- re-enable forms use current `config_revision` and frozen `request_id`
- typed values are preserved on validation/conflict/retryable outcomes
- after saved/replayed, UI requires refresh/review before further writes
- pagination and filter changes reset cursors safely

Quinn/security tests:

- two fictional tenants and all roles
- direct RPC/API attempts bypassing UI
- foreign row IDs for all three kinds
- tampered/foreign/expired cursors
- retained contact privacy in responses, rendered HTML, logs and artifacts
- no service-role ordinary request path
- live Auth/JWT/PostgREST evidence when ENV/JWT tasks are available
- genuine concurrency for re-enable versus current replacement saves when RACES tasks are assigned

Phoenix/operations evidence before hosted acceptance:

- owner-authorized forward RPC/migration plan for hosted environments that already applied earlier migration006
- hosted catalog/grant/search_path/advisor checks for new RPCs
- no secret values in environment evidence

## Follow-up task split

Morgan should assign follow-up work separately.

1. HISTORY68D - Blake backend implementation.
   - New guarded history read and re-enable contracts, SQL/RPC/tests/shared decoders as explicitly assigned.
   - Atlas review before acceptance; Quinn review after implementation.

2. HISTORY68E - Nova owner/admin history UI.
   - Separate panels for disabled services, disabled escalation contacts and inactive date exceptions.
   - No limited-role exposure.
   - Re-enable forms follow LOCK60.

3. HISTORY68F - Quinn security/runtime review.
   - Cross-role, cross-tenant, cursor, privacy, replay and stale-write evidence.

4. Hosted forward refresh task.
   - Phoenix/Atlas/Quinn as assigned after Morgan authorizes a specific environment.

This contract does not grant write ownership for those tasks.

## Acceptance boundary

This document is accepted only when Morgan accepts CEV-ONBOARD-HISTORY-68C. It is not implementation evidence. Future implementation must cite this contract, preserve HISTORY68A/HISTORY68B/LOCK60 behavior, and produce independent checks before retained history and re-enable flows can be accepted.
