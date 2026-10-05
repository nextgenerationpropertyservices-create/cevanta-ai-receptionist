# Agent handoff

- Task ID: CEV-MAKE-19, Atlas offline pure-function contract.
- Decision: APPROVED for standalone offline prototype only; no Make/provider/runtime acceptance.
- Work completed: Read task19 and applied task18 fictional stub/date requirements. Approved exact functions below before implementation.
- Files changed: Only docs/project/handoffs/CEV-MAKE-19-atlas.md.
- Database changes: None.
- API or contract changes: Offline exports simulateLead and validateAppointment approved below. No application/provider contract changed.
- Verification commands and results: Get-Content task19 completed. No implementation tests yet; typecheck/lint/build/application/database/provider checks NOT RUN by Atlas. Echo and Quinn supply implementation and independent test evidence.
- Known limitations: Actual Retell date format, approved business duration, Make Boolean serialization and live execution remain unresolved. This validator cannot prove availability or booking success.
- Risks: Treating simulated output or valid dates as operational success. Prevent application imports and external effects.
- Rollback notes: Remove only newly assigned offline scripts if abandoned; preserve Make parent blockers and existing workflows.
- Exact next action: Echo implements these pure exports and meaningful negative tests; Quinn reviews code and test evidence before Morgan acceptance.

## Exact lead simulation contract

`simulateLead(call_id)` accepts only a primitive string matching `^test-call-[A-Za-z0-9_-]{1,100}$`. Reject all other input by throwing TypeError with a generic message, without echoing invalid input. Return exactly `{call_id, simulation:true, status:'simulated_not_persisted'}`. No operational IDs, persistence or side effects. Repeated same input returns structurally identical output.

## Exact appointment validation contract

`validateAppointment(payload, trusted)` uses payload `{requestedAt, appointmentRequested, durationMinutes}` and separately supplied trusted configuration `{now, approvedDurationMinutes}`. Both must be non-null objects (not arrays); otherwise return `{valid:false,reason:'invalid'}`. Never accept payload fields as an override for trusted clock/duration; ignored extra payload fields have no authority. The harness explicitly supplies trusted values; this split does not itself authenticate the caller or tenant.

- requestedAt: primitive string, strict offset-bearing RFC3339 subset `YYYY-MM-DDTHH:mm:ss[.SSS]Z` or same with `+HH:mm`/`-HH:mm`. Fraction may have 1–3 digits. No whitespace trimming, lowercase separators, absent offset, offset seconds, leap second or 24:00. Validate real month/day/leap-year and time components before normalization; reject permissive Date parser rollovers. Year range 0001–9999. Offset hours 00–23, minutes 00–59; reject `-00:00` (unknown local offset). Explicit Z and +00:00 accepted. Local timezone-less input fails closed rather than assigning a timezone.
- now: required primitive string using the same strict instant format/components; never default to Date.now. Invalid/missing evaluation instant fails closed as invalid. This supplied evaluation instant makes prototype tests deterministic; no real clock access.
- appointmentRequested: actual Boolean true only. Any other value returns intent_not_confirmed; no coercion.
- durationMinutes and approvedDurationMinutes: explicitly supplied primitive positive safe integers. They must match exactly. Missing, nonpositive, fractional, string, infinite, unsafe integer or unequal duration returns duration_unapproved. No implicit one-hour duration and no new business maximum. Resulting millisecond delta/end must remain finite/safe and representable in year 0001–9999; otherwise duration_unapproved.
- Normalize valid requestedAt/now into UTC timestamps. Require requested start strictly greater than now (equality rejected as past). Validate end after start. Return exactly `{valid:true,starts_at_utc: <canonical ISO UTC milliseconds>,ends_at_utc: <canonical ISO UTC milliseconds>}`.

Allowed failure shape is exactly `{valid:false,reason}` with reason in `missing|invalid|timezone_unverified|past|duration_unapproved|intent_not_confirmed`. Missing/empty requestedAt returns missing; a syntactically complete local timestamp without offset or an unknown -00:00 offset returns timezone_unverified; other invalid date/input returns invalid. Use deterministic evaluation order: input object, missing requestedAt, intent, requestedAt/now parsing, duration, future comparison/end computation. Do not include caller values or diagnostic payloads in output/logs. Do not throw for routine invalid appointment inputs.

No fetch/network, database, filesystem, environment lookup, process execution, provider adapters or application imports. Unit tests must cover offset normalization, calendar impossibilities, leap years, no offset/unknown offset, exact-now/past, supplied invalid now, string Boolean, duration mismatch/missing/fraction/overflow, malformed objects, deterministic repeat and valid boundary values. These tests demonstrate offline contract behavior only.
