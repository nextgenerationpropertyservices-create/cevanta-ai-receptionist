# M5 estimates and follow-up — Nova UX discovery

- Task ID: CEV-M5-SCOPE-32.
- Owner: Nova (frontend_ux), UX discovery only. Morgan owns synthesis and acceptance.
- Scope/dependencies: Recommend minimal estimate and manual follow-up flows using existing CRM/intake/jobs/calendar conventions. Dependencies are approved commercial decisions, relationship/state/permission contracts and backend commands. Sole allowed write file is this handoff. No UI/source/schema ownership granted.
- Work completed: Read AGENTS.md, MEMORY.md, all four context documents, both project prompts, collaboration/status/task records, business blueprint and handoff template. Reviewed workspace navigation, shared forms, lead follow-up and customer-dependent job fields, with CRM/calendar handoffs. MEMORY.md and context/ now exist; their older integration next-step notes do not supersede current PROJECT_STATUS and this task. Source inventory found no estimate/follow-up routes. Business blueprint labels M5 planned and its commercial contract unresolved.
- Files changed: docs/project/handoffs/CEV-M5-SCOPE-32-nova.md only.
- Database changes: None.
- API or contract changes: None. All flow/state proposals below await Morgan/Atlas/Blake approval; they are not delivered features or assigned implementation.

## Recommended minimum flow

1. One workspace Estimates destination, with a list showing reference/title, linked customer/job where permitted, estimate status and next manual follow-up date. Link to the same estimate detail from customer and job records; avoid duplicate estimate editors and competing follow-up records across screens. Route naming and source ownership belong to a later task.
2. An authorized office user starts a draft from a customer or job. Prefill only known, authorized relationships and show them clearly; never infer a customer from a matching name or email. Require an approved customer-link rule. A lead can offer a contextual entry/link only after the owner decides whether pre-customer estimates are permitted; no implicit lead-to-customer/job creation. Job link should remain optional only if approved. Changing a customer must clear or revalidate dependent job/location choices. Linking an assigned job must not automatically grant a technician access to estimate amounts.
3. Detail has one draft editor, relationship context, approved estimate content, status/history and manual follow-up section. Monetary fields, line items, totals and recipient-facing content cannot be designed as final until currency, precision, tax treatment and content requirements are agreed. No default currency, zero tax or guessed total.
4. Provide a review step to inspect the saved version and required fields before any outward status change. Review may initially be a view/checklist rather than a stored workflow state; owner must decide whether reviewer approval is required and which role supplies it.
5. Record sending and customer response manually only if the owner approves that scope. No send button without an actual authorized delivery path. A record of an operator's observation must remain distinguishable from verified delivery or customer acceptance. Show actor/time and approved evidence source; do not collect legal signatures or imply a binding agreement.
6. Manual follow-up is a separate work item linked to the estimate: next date, responsible operator if approved, completion/reschedule outcome and history. A due list offers date/status filters, an explicit completion action and rescheduling. Follow-up completion must not change estimate acceptance or job status implicitly. No automatic email/SMS, calendar appointment or escalation.

## State meanings needing approval

| Candidate state | Minimum truthful UX meaning and transition needs |
| --- | --- |
| Draft | Saved internal work, editable under approved permissions. Save confirms persistence only. Distinguish unsaved edits from saved version. |
| Review | Needs review / ready for review, not delivered or customer approved. Decide whether this is a persisted state, optional checklist or separate approval gate. |
| Sent | Actual delivery evidence, or explicitly labelled operator-recorded sending under a manual policy. Do not show Delivered for a manually set flag. Decide recipient/channel evidence and version locking before offering this action. |
| Accepted | Approved record of a customer's response to a specific estimate version. Manual office recording must identify who recorded it and when, and must not masquerade as portal approval/e-signature/payment. |
| Declined | Approved record of a response to a specific version. Any reason field is optional only if policy says so; no invented mandatory commercial explanation. |

These names are discovery candidates, not an approved enum or guaranteed linear workflow. Owner decisions must cover permissible skips, corrections, revisions after sending, reopening, and whether cancellation/expiry is needed. If an accepted/sent estimate changes, retain the version it referred to; a stale screen must not overwrite another operator's newer revision. Do not allow arbitrary status selection to bypass future approval rules.

Manual follow-up candidates: **No follow-up scheduled**, **Scheduled**, **Completed**, and **Cancelled** only if an explicit stop action is approved. **Due today/Overdue** should be derived from the agreed workspace calendar-day rule and pending date, not a competing stored estimate state. Reschedule should retain prior history. Completion means office work was recorded, not a message sent or a customer response received. Existing lead follow_up_date is independent; decide if it stays separate or links to the new queue, without silently copying dates or creating duplicate reminders. A date-only task is not a UTC appointment.

## Interface states and evidence required later

| Area | Required behavior and later fictional evidence |
| --- | --- |
| Loading/empty/filter | Loading status; no estimates yet with an authorized create action; no linked customer/job guidance; no filter matches with Clear. Missing schema/setup and unavailable service must not render a misleading empty list. |
| Validation/save failure | Labeled required fields, approved bounds and monetary precision, field-linked errors plus summary, server-authoritative totals, pending disable, preserved user edits on recoverable failure. Test whitespace, invalid dates, precision/large values, stale relationships and network/server failure. No success before persistence. |
| Review/status changes | Show saved version/context before transition; only allowed actions; useful reason when blocked. Test concurrent edits, stale version, retries/duplicate actions, failed transition and reload persistence. No multiple/conflicting customer outcomes. |
| Permissions | Approved read/write/review/response-recording role matrix; safe not-found/denied response and loss-of-membership handling. Read-only UI and direct denied operations tested independently. Existing CRM access does not establish estimate financial access. |
| Follow-up | Visible due date and approved calendar zone, separate status from estimate outcome, no date/overdue/completed/rescheduled states, failed save with preserved input, attribution/history if approved. Test date boundaries and duplicate completion/retry. |
| Accessibility/responsive | Keyboard-accessible list/detail/editor/review; visible focus, native labels and semantic controls, announced save/error/status changes, non-color status text, meaningful repeated action names. Mobile line items/summary must remain readable without clipping or hiding context. Error focus and confirmation-dialog focus restoration if dialogs are used. |

Later screenshots must use fictional data only: desktop list/detail, narrow mobile detail/editor, empty and filtered-empty views, validation/failure with retained input, read-only view, saved review, recorded response and overdue/rescheduled/completed follow-up. Capture only approved commercial fixtures after decisions; do not invent prices or tax to manufacture evidence. Add end-to-end synthetic user tests for draft save/reload, permitted transitions and manual follow-up persistence, plus cross-tenant/role denial and stale-write handling. Tests must verify actual backend results, not just button presence. Typecheck/lint/meaningful tests/SQL/build and authenticated browser evidence belong to implementation acceptance.

## Copy boundaries, blockers and risks

Use plain labels such as Save draft, Review estimate, Schedule follow-up and Record response only after their commands are approved. If manual sending is approved, prefer Record as sent over Send estimate. If manual acceptance is approved, display Acceptance recorded by your office rather than Customer signed. Never imply automated reminders, delivery/read receipt, payment, financing, legally binding terms, earned/paid/recovered revenue or a booked job. No legal wording proposed here.

Implementation blockers: currency/precision and tax policy; content/line-item/total rules; required customer/job and optional lead relationships; lifecycle/version/review/permission matrix; manual sending/response evidence policy; follow-up date/time-zone and ownership policy. These require Morgan synthesis and material owner decisions before Atlas-approved contracts. Existing source/embedded evidence does not establish live M5 behavior.

Exact risks: unlabelled manual states look provider-confirmed; editing sent content rewrites acceptance history; permitted CRM readers accidentally gain financial access; duplicate lead/estimate reminders create competing work; due dates shift between UTC and workspace dates; failed forms lose carefully entered line items; estimates are confused with invoices/paid revenue; adding mobile navigation crowds existing workspace controls. These are design risks, not newly verified implementation defects.

- Verification commands and results: Read-only Get-Content/rg inventory and evidence review completed. No live accounts, provider data, real customer records or screenshots accessed. Typecheck, lint, tests, production build, SQL and browser checks NOT RUN: documentation-only discovery; task explicitly makes commands optional for this scope. No M5 runtime acceptance claimed.
- Known limitations: No implemented screen, wireframe, persisted estimate, approved commercial term or operator policy. Existing context contains older integration readiness notes; current task/status govern this discovery.
- Required reviewers: Morgan for scope and owner decisions; Atlas for relationships, states/versioning and shared contracts; Blake for authorization/commands/persistence/idempotency; Quinn before security-sensitive/cross-module implementation; Phoenix for later browser/release evidence. No independent approval by these roles is inferred.
- Rollback notes: Remove this handoff only; no source/database/provider effect.
- Exact next action: Morgan combine Nova/Atlas/Blake findings into ESTIMATES_FOLLOWUP_SCOPE.md, label recommendations separately from confirmed requirements, resolve material commercial/lifecycle decisions, then assign contract-first implementation with exact disjoint paths. Nova's discovery handoff is ready for that review; implementation remains blocked.
