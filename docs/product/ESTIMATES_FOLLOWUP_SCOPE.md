# Estimates and follow-up scope — CEV-M5-SCOPE-32

Status: scope discovery and design review accepted with limitations. The first implementation slice is non-monetary internal scope drafts plus one active manual date-only follow-up. Implementation remains blocked until CEV-M5-CONTRACT-FINAL-34 publishes exact buildable contracts and required reviews pass.

## First implementation slice

Office staff can prepare an internal scope draft connected to a known customer, optionally tied to a same-customer job and location. The draft can store a title and bounded scope description. It is for internal planning only.

The first slice does not include prices, totals, currency, tax, customer-facing delivery, e-signature, payment, financing, automated SMS/email, customer portal, legal terms, customer acceptance, provider writers, calendar writes or revenue attribution.

## Recorded contract decisions

- Drafts require a known customer anchor.
- Optional job and location links must match the same customer and tenant.
- Lead-only drafts, equipment links and independent lead references are deferred.
- Owner, admin and dispatcher are the only first-slice roles for draft/follow-up access and approved commands.
- Technician, viewer, anonymous users, removed members and demoted members must not read or change draft/follow-up content.
- Follow-up is one active date-only manual office task per draft.
- Follow-up has no assignee in this slice.
- Completed and cancelled follow-ups remain immutable history.
- Due today and overdue labels are derived from trusted workspace date/timezone only for scheduled follow-ups.
- Follow-up dates do not send messages, create reminders, create appointments or imply customer contact.
- Replay/idempotency, private receipt behavior, audit visibility and safe error categories must be finalized before implementation.

## Approved first workflow

1. Office user creates an internal scope draft from an authorized customer, with optional same-customer job/location context.
2. The app validates tenant-safe relationships and saves the draft only after verified membership and approved office role checks.
3. Office user edits the draft title and scope description under revision control.
4. Office user schedules one manual follow-up date.
5. Office user can reschedule, complete or cancel that follow-up.
6. Completed/cancelled follow-ups remain visible history.
7. External send, customer review, customer acceptance, decline and payment remain blocked until later tasks.

For this first slice, the only draft status is internal draft. Sent, delivered, accepted, declined, paid, expired, cancelled and superseded states are not available.

Follow-up states are scheduled, completed and cancelled. “No follow-up scheduled” is a read/display condition, not a stored competing state.

## Later owner decisions outside this slice

- Currency, quantity/unit, precision, rounding, zero/negative/discount rules and whether prices include or exclude tax.
- Tax treatment: none recorded, manually entered or calculated under a defined policy.
- Who can view prices, create/edit priced estimates, review, send and record customer responses.
- Delivery and acceptance channel, recipient verification, consent, response evidence, revision locking and legal meaning.
- Assignees, automated reminders, cadence, retries and provider behavior.
- Customer portal, e-signature, payment, financing and recovered-revenue attribution.

## Later implementation review gates

- Atlas: schema, relationships, lifecycle contracts, RLS and migration review.
- Blake: server commands, authorization, validation, transaction/idempotency, audit and safe errors.
- Nova: list/detail/editor/follow-up UI with loading, empty, validation, permission, conflict and responsive states.
- Quinn: security and cross-module tests before acceptance.
- Phoenix/Echo: only if scheduled delivery, email/SMS, reminders, provider integrations, deployment or release operations enter scope.

## Required evidence for implementation acceptance later

Implementation must test positive and denied roles, cross-tenant denial, mismatched parent chains, stale revisions, duplicate retry keys, validation failures, atomic audit/receipt behavior, safe error messages, follow-up completion/reschedule/cancel, one-active follow-up concurrency and no leakage of draft/follow-up details to unauthorized users. Run typecheck, lint, meaningful tests, SQL checks, production build and affected browser flows with fictional data.

## Current decision

The owner approved internal drafts plus manual follow-up as the first workflow. Morgan accepted the reviewed design as a non-monetary internal scope-draft slice. CEV-M5-CONTRACT-FINAL-34 now blocks implementation until exact buildable contracts and reviewer acceptance are complete.
