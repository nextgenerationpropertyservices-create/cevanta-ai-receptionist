# Agent handoff

- Task ID: CEV-MAKE-18, Atlas private stub and date contract review.
- Decision: APPROVED for the minimal private inactive stub contract below. Date requirements approved as design only; no implemented date parser or runtime acceptance claimed.
- Work completed: Read task18, collaboration rules, current status and original build mission. Reviewed a deterministic non-persisting lead simulation boundary and fail-closed appointment input requirements. No browser access or edits.
- Files changed: Only docs/project/handoffs/CEV-MAKE-18-atlas.md.
- Database changes: None; no lead, customer, call or appointment persistence.
- API or contract changes: Proposed private stub input/output schema approved below. This is a test contract, not an operational lead creation endpoint or provider booking contract.
- Verification commands and results: Get-Content assigned task/collaboration/status/original prompt completed. No tests, build, browser execution, provider requests, listeners or scenario runs performed. Application checks NOT RUN; no application source changes. Echo supplies current Make documentation/UI feasibility evidence separately.
- Known limitations: Supported private scenario input/output controls and saved graph remain to inspect. Boolean output serialization and deterministic input echo remain unexecuted. No datetime payload example or approved booking duration exists.
- Risks: A stub success can be confused with persisted lead success if mappings/messages reuse operational wording. Do not route simulation into production or remove parent blockers. Private scenario access must remain unchanged; no public trigger, webhook or new key.
- Rollback notes: Remove only separately identified new private stub if preparation is abandoned; preserve original utility and parent safety filters. Never delete shared scenario resources.
- Exact next action: Morgan configures the private inactive stub using approved schema and supported UI, saves/reopens to inspect absence of external modules, and collects Quinn review. Keep parent filters and all runs blocked. Record date parsing as pending implementation and isolated verification.

## Exact approved private stub schema

Input:

| Key | Type | Required | Rule |
| --- | --- | --- | --- |
| call_id | Text | Yes | Fictional test identifier only; proposed test convention `test-call-` followed by 1–100 ASCII letters/digits/underscore/hyphen. Never a real call/customer identifier. |

Output:

| Key | Type | Value |
| --- | --- | --- |
| call_id | Text | Echo the fictional input unchanged. |
| simulation | Boolean | Literal `true`, not the Text string `"true"`. |
| status | Text | Literal `simulated_not_persisted`. |

No lead_id, booking_id, appointment_id, tenant/client_id, recipient, credentials or success/created flag. Do not emit fabricated operational IDs. If supported UI cannot represent Boolean output, report that exact limitation before switching contracts; do not silently substitute a string.

Only private input, deterministic mapping/tools and return-output modules are permitted. No data-store access, HTTP, nested operational scenario, calendar, email, SMS, filesystem, database or external provider module. No customer/name/phone/address payload input, logging or persistence. Actual test runs are outside this task.

Require the fictional input at the private boundary. If supported input validation cannot enforce the test convention, leave execution blocked and record it rather than implying runtime validation. Output must never be interpreted as a persisted lead or booking outcome; a future harness may assert simulation=true and status=simulated_not_persisted, but may not show callers an operational success message.

## Appointment date gate requirements

Do not invoke the gate as a way to unblock current booking. No run or calendar write is authorized by this design review.

1. Missing, blank, malformed or unrecognized Requested Appointment Datetime fails closed. Do not default to now, reinterpret locale-dependent text or allow forgiving parser normalization of impossible dates.
2. Establish the actual Retell extraction format first. Recommended contract is a strict ISO/RFC3339 instant with explicit Z or numeric offset, validated calendar components and normalized UTC output. If local civil time is required instead, pair it with an explicit trusted tenant IANA timezone; nonexistent and ambiguous daylight-saving times fail closed until a reviewed rule exists. Never silently use Make/server/browser timezone.
3. Reject a start instant at or before the trusted evaluation time, after parsing and normalization. An allowed booking horizon, lead time or operating-hours rule must come from approved business policy; do not invent it in this task.
4. No calendar write without an approved duration. Existing `addHours(datetime;1)` is not authority for one-hour bookings. Once approved, validate positive duration, finite end after start and any approved upper bound using normalized instants.
5. Appointment Requested must be verified Boolean true under the reviewed provider normalization contract. Missing/string truthiness must not authorize booking. Valid datetime alone does not establish caller intent, availability or booking success.
6. Calendar availability, trusted tenant/calendar mapping, concurrency/conflict handling and retry/effect deduplication remain separate gates even when datetime parsing passes. A successful parser does not confirm an appointment.

Suggested gate output contract for later implementation: `{valid:false,reason:'missing'|'invalid'|'timezone_unverified'|'past'|'duration_unapproved'}` or `{valid:true,starts_at_utc:Text,ends_at_utc:Text}` only after every applicable requirement passes. This proposed output must be reviewed against the actual Make controls before implementation. Never include raw caller text in logs/errors; keep parent write barriers until isolated tests cover malformed/impossible dates, missing offsets, past values, DST cases where supported, and unapproved duration.
