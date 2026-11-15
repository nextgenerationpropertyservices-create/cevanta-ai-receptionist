# CEV-PROJECT-AUDIT-167L — Independent security review

Date: 2026-10-26  
Reviewer: Quinn (Quality and Security)

## Decision

**PASS WITH LIMITATIONS.** The final adapter matches the Architect-approved CEV-PROJECT-AUDIT-167K Reactivation command boundary. It authenticates and authorizes an office role before protected reads or commands, scopes all history reads to the verified tenant, strips forged state/actor/linkage fields, uses only the narrow campaign/review/schedule RPCs, validates their results before reporting success, and introduces no provider side effect.

The first review found one release-blocking confirmation defect: scheduling treated an error-free RPC response as success without proving that the command returned the created job and appointment. The final patch now accepts exactly one strict `{ job_id: UUID, appointment_id: UUID }` row and fails closed for null, empty, multiple, malformed, or extra-field results (`src/app/actions/reactivation.ts:23,121-134`; `tests/reactivation-actions.test.ts:184-213`). That finding is resolved locally.

This approval does not authorize a production deployment. The 167K migration is not applied to hosted Supabase, and hosted Auth/JWT/PostgREST plus real concurrent replay behavior remain unverified.

## Security findings

No unresolved Critical, High, or Medium implementation defect was confirmed in the final 167L diff.

### Campaign creation

- `request_id` must be a UUID before authorization/database work (`reactivation.ts:27-32`). The page supplies one server-generated hidden UUID (`reactivation/page.tsx:1,26`), and the same rendered hidden value remains available for a retry after an action error.
- `requireMembership(tenantId, OFFICE_ROLES)` runs before history reads or the command (`reactivation.ts:32`). `OFFICE_ROLES` is owner/admin/dispatcher; UI visibility is not the authorization boundary.
- Customer, lead, and job reads each add `.eq('tenant_id', tenantId)` to the user-scoped client (`reactivation.ts:34-39`). Any read error stops the command.
- The `create_reactivation_campaign` input contains exactly the approved campaign keys, while each candidate contains only customer/lead linkage plus generated draft fields (`reactivation.ts:45-68`; exact-key assertions at `reactivation-actions.test.ts:84-106`). Client-supplied creator, status, role, tenant alias, job, or appointment fields are ignored.
- Command output is schema-checked for `saved`, `replayed`, or the documented request-reuse conflict; the returned candidate count must equal the generated count before success/revalidation (`reactivation.ts:18-21,69-76`).

### Candidate review

- Approve and dismiss both authorize first and call only `review_reactivation_candidate` (`reactivation.ts:83-110`). The decision is a server-selected literal, not a form value.
- Success requires a strict recognized result whose candidate ID and status match the requested candidate and server-selected decision (`reactivation.ts:22,89-98`). A denial or mismatched result returns a generic error and does not revalidate or claim success.

### Scheduling

- Scheduling authorizes first, validates the candidate/date/time, derives the one-hour UTC interval server-side, and calls the existing `schedule_reactivation_visit` contract with the verified tenant and parsed candidate (`reactivation.ts:113-127`). Forged job, appointment, tenant-alias, and status fields are not forwarded.
- Success now requires exactly one strict row with valid job/appointment UUIDs (`reactivation.ts:23,128-134`). Five negative cases prove fail-closed behavior and no success revalidation (`reactivation-actions.test.ts:199-213`).
- The success message is accurate: the command creates only internal records and does not claim an external calendar write or customer message.

## Direct-write and external-effect review

- Source scan found no Reactivation campaign/candidate `.insert()`, `.update()`, or `.delete()` operation and no direct campaign/candidate table write in the action.
- The action calls only `create_reactivation_campaign`, `review_reactivation_candidate`, and `schedule_reactivation_visit`.
- No email, SMS, weather API, payment, external-calendar, automatic-booking, or dispatch provider call is present. Draft approval explicitly says no message was sent.
- Database-side 167K evidence independently confirms authenticated direct-write denial, actor-derived attribution, tenant checks, replay/conflict handling, and atomic scheduling. See `docs/project/reviews/CEV-PROJECT-AUDIT-167C-security.md` for the database-contract review.

## Independent verification

Executed after the schedule-result repair:

- `pnpm exec vitest run --configLoader native tests/reactivation.test.ts tests/reactivation-actions.test.ts` — **PASS**, 2 files / 20 tests.
- `pnpm test:reactivation:db` — **PASS**, including office-role commands/reads, direct-write denial, cross-tenant and identity denial, actor-bound replay/conflict, strict state transitions, derived attribution, atomic rollback, grants, ownership, and fixed search paths.
- Static scan for direct Reactivation table writes — **PASS**, no matching action write.
- Static scan for external provider calls and known credential prefixes in the owned action/tests — **PASS**, no match.
- `git diff --check -- src/app/actions/reactivation.ts tests/reactivation-actions.test.ts` — **PASS** apart from the existing Windows LF-to-CRLF notice.

Blake additionally reports final full Vitest **PASS** (56 files / 933 tests), typecheck **PASS**, lint **PASS**, and a fresh post-repair non-OneDrive webpack production build **PASS**. Those full/build checks are specialist-reported rather than independently rerun by Quinn.

## Limitations and release conditions

- The hardened 167K migration is not applied to hosted Supabase. Until it is, the adapter intentionally returns the safe migration/setup message.
- Embedded PGlite uses an Auth compatibility fixture and one connection. It does not prove live JWT/PostgREST enforcement, session revocation, or simultaneous replay locking.
- No browser workflow or live provider was exercised.
- Campaign creation above the database contract's 250-candidate cap fails safely rather than creating a partial campaign.
- Scheduling interprets entered time as UTC, matching the existing UI/contract. Workspace-local scheduling is a separate product decision, not a security defect in this task.
- Reactivation remains an internal draft/review workflow. It must not be sold as sending email/SMS, using weather automation, or writing an external calendar.

## Required release order

1. Deploy the fail-closed 167L adapter first.
2. Apply the reviewed 167K migration second.
3. Run hosted positive owner/admin/dispatcher tests and denied technician/viewer, archived/deleted membership, wrong-tenant, forged-field, replay, and result-confirmation tests with fictional identities.
4. Keep outbound providers off until their own consent, delivery, idempotency, recovery, and rollback reviews pass.

