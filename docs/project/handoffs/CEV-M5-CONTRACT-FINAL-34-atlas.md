# Atlas final contract — CEV-M5-CONTRACT-FINAL-34

- Owner: Atlas, Architecture & Data. Morgan acceptance and Blake/Nova/Quinn review required before implementation.
- Work completed: Final specification reconciles recorded Morgan decisions with all task33 specialist reviews. Reviewed AGENTS.md, MEMORY.md, context/, collaboration/status, scope document, tasks32/33/34 and Atlas/Blake/Nova/Quinn/Morgan task33 handoffs, existing CRM/job/intake/calendar relationships and audit pattern.
- Allowed/changed file: This handoff only. Other agents' files preserved.
- Database/API changes: None applied. Names and rules below specify the next implementation, not an existing API.
- Decision: Contract ready for specialist review. Scope is **internal scope drafts**, never priced estimates. No monetary, external, acceptance, payment, assignee, messaging, scheduling or revenue fields/effects.

## Tables

All business IDs are database-generated UUIDs; timestamps are database-generated timestamptz. Tenant, parent, submission and creator identity are immutable. Actor UUIDs have no cascading Auth FK, preserving opaque history after account deletion; actor values are derived from auth.uid(), never command arguments. No hard-delete command.

`public.internal_scope_drafts`:

| Field | Exact type/nullability and constraint |
| --- | --- |
| id | uuid primary key, default gen_random_uuid() |
| tenant_id | uuid NOT NULL, FK tenants(id) |
| submission_id | uuid NOT NULL |
| customer_id | uuid NOT NULL |
| job_id, service_location_id | uuid nullable |
| title | text NOT NULL, trimmed, 1–160 Unicode code points |
| scope_description | text NOT NULL, trimmed, 1–4000 code points |
| status | text NOT NULL, default/check literal `draft` |
| version | integer NOT NULL default1, 1..2147483647 |
| created_by, updated_by | uuid NOT NULL |
| created_at, updated_at | timestamptz NOT NULL default transaction_timestamp() |

Unique `(tenant_id,id)` and `(tenant_id,submission_id)`. Customer FK `(tenant_id,customer_id)`; job FK `(tenant_id,customer_id,job_id)` to new additive jobs unique target `(tenant_id,customer_id,id)`; location FK `(tenant_id,customer_id,service_location_id)` to existing location target. When job has a non-null location, draft location must equal it: create command derives it if input omitted, rejects contradictory input. When job location is null, explicitly chosen same-customer location is permitted. Creation enforces this rule with locked parent reads plus a constraint trigger on draft INSERT/UPDATE; job parent fields remain immutable under existing grants. Reject customerless jobs. No lead/equipment links: job origin lead may be displayed through existing job interface, never an independent editable draft field. No job/customer/lead status changes.

`public.internal_scope_followups`:

| Field | Exact type/nullability and constraint |
| --- | --- |
| id | uuid primary key default gen_random_uuid() |
| tenant_id, draft_id, submission_id | uuid NOT NULL; composite FK tenant/draft |
| due_on | date NOT NULL, finite, year0001..9999 |
| note | text NOT NULL default empty string, trimmed, 0–2000 code points |
| status | text NOT NULL default scheduled; scheduled/completed/cancelled |
| version | integer NOT NULL default1, 1..2147483647 |
| created_by, updated_by | uuid NOT NULL |
| created_at, updated_at | timestamptz NOT NULL default transaction_timestamp() |
| completed_by, cancelled_by | uuid nullable |
| completed_at, cancelled_at | timestamptz nullable |

Unique `(tenant_id,id)` and `(tenant_id,submission_id)`; FK `(tenant_id,draft_id)` to drafts. Status check: scheduled has all four terminal fields null; completed has only completed actor/time non-null; cancelled has only cancelled actor/time non-null. A BEFORE UPDATE/DELETE guard rejects any change/deletion of completed/cancelled rows and rejects identity changes for scheduled rows. New follow-up after terminal history uses a new creation token. No reopening. Unique partial index `(tenant_id,draft_id) WHERE status='scheduled'` enforces one active record even if RPC locks are bypassed by trusted maintenance.

Private schema `cevanta_private.scope_command_receipts`: tenant_id, actor_id, request_id UUID NOT NULL; command text restricted to the six command names below; target_id UUID NOT NULL; input_digest bytea NOT NULL length32; result_id UUID NOT NULL; result_version integer positive; committed_at timestamptz NOT NULL. PK `(tenant_id,actor_id,command,request_id)`. No raw inputs, notes, titles or customer data. No browser access, schema usage or exposed REST API. Receipts have no delete/cascade/expiry path in this slice: retain while corresponding business history is retained; no TTL resets. A later privacy/retention migration must explicitly preserve retry tombstones or replace the guarantee before cleanup. Do not present digests as anonymized data.

Indexes: drafts tenant/customer/created_at/id, tenant/job_id (nonnull) and tenant/location (nonnull); follow-ups tenant/draft/created_at/id and tenant/due_on/id for scheduled records; partial active uniqueness; receipt PK. Stable descending draft ordering created_at,id; follow-up history descending created_at,id.

## Privileges and function ownership

RLS enabled on both public tables. Authenticated SELECT policy uses current `has_tenant_role(tenant_id, ['owner','admin','dispatcher'])`. No technician/viewer/anon reads or mutations, including counts/search/history. Revoke all PUBLIC/anon/authenticated defaults, then grant authenticated SELECT only. No direct INSERT/UPDATE/DELETE, sequence privilege or business-column write grant. Private receipt RLS enabled and all client privileges revoked; no client policy.

Six narrow public command functions are SECURITY DEFINER owned by migration administrator `postgres` (same trusted database administration boundary as existing definer helpers), with `SET search_path=''`, fully qualified objects, no dynamic SQL, no arbitrary table/column/function input, and no real provider/HTTP access. Revoke PUBLIC/anon EXECUTE immediately in the same migration; grant authenticated EXECUTE for exact signatures only. Internal guard/digest/constraint functions have no client EXECUTE. Function owner is privileged and may bypass RLS: every command MUST independently check non-null auth.uid(), verified-session server guard, current database membership/office role and tenant-scoped target/parent existence. RLS protects direct reads, not this owner’s writes. Never invoke these commands with a service-role application client.

Database obtains actor from auth.uid(). Server calls requireMembership(tenant, OFFICE_ROLES) with verified getUser before RPC. Database locks current matching membership row FOR SHARE, then checks its current role; this serializes against concurrent membership DELETE/role UPDATE. Revocation committed before the guard denies; an authorized transaction already holding the membership lock can finish before waiting revocation commits. Do not promise retroactive cancellation. Use generic unavailable for null/missing/non-office identity. Ordinary sessions cannot set actor or role through arguments.

No changes to existing audit SELECT policy: owner/admin retain metadata-only audit access; dispatcher can manage drafts but does not gain global audit access; technician/viewer/anon remain denied. IDs/actions in owner/admin audit are metadata, not descriptions. Receipt insert does not invoke the business audit trigger. Use existing atomic business-row INSERT/UPDATE audit trigger; no payload audit or audit RPC added. Creator/updater/terminal metadata on authorized detail is office-visible; not a private receipt projection.

## Canonical commands

Each RPC takes exactly one strict JSON object parameter `input jsonb`. Reject extra keys including money, lead/equipment/assignee, status, actor, timestamps, tenant override aliases and totals. Server and SQL independently validate shape/types/limits. UUID strings normalize to lowercase; positive versions are JSON integers 1..2147483647, never strings; dates are exact YYYY-MM-DD with real components, year0001..9999. Text normalization removes leading/trailing ASCII whitespace U+0009..000D/U+0020, preserves interior content, and checks Unicode code-point limits, not JavaScript UTF-16 length. No normalization of scope content beyond that. Optional IDs omitted/null normalize to null; note omitted on create normalizes to empty string. Required text is not optional. Exceeding version max returns version_exhausted without changes.

| RPC/command | Exact allowed inputs |
| --- | --- |
| scope_draft_create | tenant_id, request_id, submission_id, customer_id UUIDs; job_id/location_id nullable UUIDs; title, scope_description strings |
| scope_draft_update | tenant_id, request_id, draft_id UUIDs; expected_version integer; title, scope_description strings |
| scope_followup_create | tenant_id, request_id, submission_id, draft_id UUIDs; expected_draft_version integer; due_on string; optional note string |
| scope_followup_reschedule | tenant_id, request_id, draft_id, followup_id UUIDs; expected_version integer; due_on, note strings |
| scope_followup_complete | tenant_id, request_id, draft_id, followup_id UUIDs; expected_version integer |
| scope_followup_cancel | tenant_id, request_id, draft_id, followup_id UUIDs; expected_version integer |

Use `service_location_id` as stored/projection field; `location_id` above is the sole command field alias, not an additional accepted input. No parent edits after create. UpdateDraft increments draft version once; follow-up changes increment only follow-up version. CreateFollowup checks expected_draft_version to detect stale scope context; subsequent follow-up edits deliberately do not depend on draft version. No note-only command: reschedule supplies unchanged due date to edit note. Terminal operations set matching actor/time server-side; status never comes from client.

Results (strict discriminated JSON):

- `{status:'saved'|'replayed', entity:'draft'|'followup', id:UUID, version:integer, draft_id:UUID}`. For a draft draft_id=id. No content returned; refresh current authorized reads. Replayed version is original committed version, not newest row state.
- `{status:'validation_error', code:'invalid_input'|'invalid_relationship'|'invalid_date', field:allowedInputKey|null}`; no input echo or foreign labels.
- `{status:'conflict', code:'revision'|'request_reuse'|'submission_reuse'|'active_followup'|'terminal_followup'|'version_exhausted'}`; no current content/version leaked in error.
- `{status:'unavailable'}` for denied/missing target or tenant/foreign parents; same message/status category.
- `{status:'configuration_error', code:'workspace_timezone_invalid'}` for authorized timezone invalidity only.
- `{status:'retryable_failure'}` for unexpected transaction/provider-free infrastructure failure, no SQL details. Auth redirect/control flow stays framework control flow in server wrapper; do not stringify it.

Domain errors return without mutation/receipt; unexpected failures rollback and server maps safely. Revalidate routes only after committed saved/replayed result. Functions must not catch unexpected exceptions and commit partial work.

## Replay and lock order

For all commands durable identical retries return original minimal committed result. Input digest is SHA256 of UTF-8 PostgreSQL normalized `jsonb::text` with an added fixed `contract_version:'scope-v1'`, command and all normalized explicit arguments including request/submission IDs, target and expected version; compute only in SQL using pgcrypto, never rely on caller hash. Requested location remains canonical null if omitted; derived location does not silently alter retry identity. Once receipt exists, identical replay occurs before stale-version/date-config checks but after current authorization and target visibility. Changed expectedVersion/content under a reused request is request_reuse. To retry an invalid/conflicting unsaved attempt with corrected input, generate a new request UUID.

Global order: (1) lock own tenant membership FOR SHARE/check; (2) tenant row FOR SHARE when new work needs timezone; (3) transaction advisory lock on hash of tenant+actor+command+request; create commands additionally take tenant+entity+submission advisory lock, then inspect creation-token ownership; (4) existing draft FOR UPDATE; for draft create instead lock customer, job, location in that order FOR KEY SHARE; (5) target follow-up FOR UPDATE; (6) mutate/audit/insert receipt atomically. Read authorized committed receipt immediately after request lock, before any domain precondition; no subsequent lock reversal. Hash collisions serialize harmlessly, not identify receipts. All receipt reads are actor/tenant/command/request scoped. Existing child visibility requires its matching tenant/draft target.

Create collision across actors or new request IDs using the same submission token returns submission_reuse, never another actor's result/receipt/content. Same original request and identical input replays; same token cannot create a second row even after terminal follow-up. Unique constraints remain final protection. New follow-up checks no active row under draft lock, then partial unique index. Version compare occurs after row lock. Holding membership/tenant locks before request/aggregate is mandatory across commands; no child-first path. Receipt failures or audit failures abort business changes. Advisory key encoding uses delimited canonical UUIDs and command, not ambiguous concatenation. Retrying after uncertain commit always reuses original request/expectedVersion.

## Read/list/detail projections and dates

Reads verify office membership server-side and use session SELECT under RLS. Never expose receipts/digests/raw errors. `DraftSummary={id,customer_id,customer_name,job_id,job_title:null|string,service_location_id,location_label:null|string,title,status:'draft',version,created_at,updated_at,active_followup:null|Followup}`. Customer/job/location labels are joined only through validated same-tenant parents. `Followup={id,draft_id,due_on,note,status,version,created_at,updated_at,completed_at,completed_by,cancelled_at,cancelled_by,due_state:null|'overdue'|'today'|'upcoming'}`; due_state is null for terminal rows. Detail adds scope_description, created_by, updated_by and paginated follow-up history. No prices/line items/lead/equipment values/counts. Summary includes active note only because same office permissions apply; no public/less-privileged summary endpoint.

List parameters: tenant_id, optional customer_id UUID, optional scheduled-filter `all|overdue|today|upcoming|none`, limit integer1..50 default25, opaque validated keyset cursor bound to tenant/filters/order. No free-text search in slice. Return `{status:'ok',items:DraftSummary[],next_cursor:null|string,workspace_today:YYYY-MM-DD,workspace_timezone:string,date_valid_until:UTCString}`. Detail takes tenant/draft and history limit1..50/default25/cursor; returns corresponding draft/history/next_cursor plus same date metadata. Unavailable or configuration_error use same codes as commands. No total counts or foreign-parent labels in denied responses. Detail history has active and terminal rows; scheduled uniqueness makes active field deterministic.

due_on accepts past dates deliberately as manual overdue work. trusted server/database current time and validated current tenant IANA timezone determine workspace_today; validate timezone against supported IANA identifiers at database boundary, not arbitrary offset abbreviations. Invalid/missing zone fails safely, no UTC/browser fallback. Compute date_valid_until as the earliest instant on which the workspace date changes, handling DST/timezone discontinuities; never fixed24-hour TTL. Return identical date metadata/due labels for one read snapshot. UI refreshes at expiry/focus/next navigation and displays workspace timezone; changing settings can change labels but never stored date. Follow-up commands require valid zone for new mutation; exact authorized replays remain available if configuration later becomes invalid. List/detail date derivation lives in reviewed read RPCs or trusted server module using one instant; RLS remains enforced and no definer read function is introduced solely for joins. No scheduler or midnight provider action.

## Implementation and acceptance plan

New additive migration includes tables, indexes, new job composite unique target, guards, six RPCs, privileges/RLS, receipts and audits in one reviewed transaction. No backfill prices/tax, no rewriting hosted migrations003/004. Verify pgcrypto availability/schema and migration administrator role/ownership before executing; stop if postgres ownership or digest resolution cannot be established rather than relaxing guards. Required source ownership assigned separately by Morgan.

Test matrix: office positive/all other roles negative across table/read/list/detail/RPC/audit/receipt; removal/demotion before replay, concurrent revocation lock semantics; direct writes/identity spoofing; same-tenant wrong parent, foreign targets, customerless jobs, derived/contradictory location, forbidden inputs; whitespace/code-point/date rules; invalid IANA timezone; midnight/DST date expiry; immutable terminal history and version overflow. Genuine multi-connection tests for same-request races, same-submission cross-actor reuse, stale edits, one-active competing create, reschedule versus terminal operations, duplicate complete, consistent lock order/deadlock behavior. Force audit/receipt failures and prove rollback, lost-response replay and safe errors/logs. Server/UI tests prove retained inputs, no success before persistence, original replay version versus refreshed content, access denial and no external effects. Run type/lint/meaningful tests/SQL/build and affected browser checks only after implementation; embedded compatibility fixtures are not live JWT acceptance.

- Blockers: No unresolved commercial decisions for this expressly non-monetary slice. Mandatory Blake/Nova/Quinn review and Morgan acceptance remain implementation gates. Platform role/pgcrypto/timezone-library details require implementation prerequisite verification; no unsafe fallback authorized. Monetary/external scope remains blocked by separate owner decisions. Candidate read projection/command limits are engineering choices for review, not commercial commitments.
- Verification: Documentation/source review and specification self-check only. **No runtime checks were run because this is contract-only**: typecheck, lint, tests, SQL, browser, build, provider and hosted checks all NOT RUN. No code or migration acceptance inferred.
- Risks: Definer owner bypasses RLS, so guards and grants must be independently verified; request retention is durable and private, not PII-free by hashing; date-expiry computations need transition tests; long locks can affect provisioning; earlier actor command replay must never skip current permission. No full issued-content revision history exists and must not be claimed.
- Rollback: Documentation only. Later failure recovery disables command execute before destructive changes; retain drafts, terminal follow-up, audit and receipt identities. Use reviewed forward repair once records exist, not token resets/table drops.
- Exact next action: Morgan assigns Blake/Nova/Quinn disjoint final-contract reviews, resolves any contradiction here, then accepts and creates migration/contracts/backend/UI/test tasks. Atlas must review actual migration/shared types before dependent implementation. No runtime/host/provider deployment authorized.
