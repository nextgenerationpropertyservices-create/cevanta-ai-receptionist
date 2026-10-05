# Onboarding backend next-slice plan

Date: 2026-10-04. Planning task: CEV-ONBOARD-BACKEND-GAP-57. Blake proposes; Morgan assigns exact ownership and accepts. Proposed IDs below are planning identifiers, not active write permission. Preserve other agents' work and serialize assignments sharing files.

## Current baseline and boundaries

Backend48 and UI50/SETUP52/53 have recorded acceptance with limitations. Configuration, resume, invitation acceptance and snapshot helpers exist with verified getUser, current membership checks, independent SQL guards, strict result decoding and safe failures. Setup now edits profile, services, weekly hours, request-only preferences and escalation contacts. STATUS54 has a Quinn review; this audit does not infer Morgan acceptance from a specialist handoff.

Settings still calls updateTenantSettings with free-text timezone/runtime Intl validation and direct tenant update. The schema005 trigger preserves revision invalidation, but this path lacks onboarding's shared precondition/receipt semantics and pinned validation. No invalidation bypass was observed. Setup does not wire saveOnboardingProgress or present date-exception mutation controls. Existing generic configuration actions already support both exception commands; new SQL is not automatically needed.

Transport49 explicitly sets a global 1 MiB Server Action cap. Parsed onboarding validation remains 131072 bytes. Neither static tests nor backend48 establish actual rendered HTTP cap, Origin rejection, proxy buffering or logging behavior. Do not describe this preparation as missing configuration or as live boundary proof.

Historical checks are evidence for their candidates: backend48 538 tests, SETUP53 594, Quinn STATUS54 600 with main checks/build/embedded SQL. No checks rerun in this plan. Anonymous browser protection is narrower than authenticated persistence/role/HTTP acceptance. No full client journey or operational readiness claim.

## Proposed tasks

### CEV-ONBOARD-57-S1 — Settings alignment

Owners: Blake backend adapter; Nova settings UI; Quinn independent review; Atlas approves any changed shared/SQL interface. Dependencies: accepted48/50/53, current snapshot/configuration contracts.

Allowed-file suggestions: Blake receives src/app/actions/workspace.ts and tests/onboarding-actions.test.ts only if Morgan transfers current ownership, or a new src/app/actions/onboarding-settings.ts plus tests/onboarding-settings.test.ts. Nova receives src/app/workspaces/[tenantId]/settings/page.tsx and a dedicated settings form/test. Shared actions/onboarding-rpc files change only if explicitly assigned. No simultaneous writers. Prefer reusing accepted save_business_profile action/editor rather than duplicating persistence; Morgan chooses final integration split.

Acceptance: one visible authority for tenant name/trade/timezone with shared pinned validation, required authoritative fields and current config revision. Contact-only values are preserved when editing Settings; omission must not clear contacts. Never auto-fetch a newer revision and silently rebase a stale client edit. Owner/admin only, other roles retain approved read-only view. Actual authority/contact change increments once; normalized no-op retains revision; stale/request-reuse/exhaustion and confirmed-save/refresh-failure are truthful. If legacy export is retired, update all callers and tests together; retained callers must still invalidate through the reviewed trigger.

Evidence: positive owner/admin save/reload, each denied role/direct invocation/foreign tenant, pinned versus previously accepted alias/invalid legacy timezone, astral/ASCII whitespace parity, stale-tab race, contacts preserved, one revision/audit, no-op and lost-response replay. Quinn cross-module review plus full local checks and affected SQL/browser evidence.

### CEV-ONBOARD-57-S2 — Persisted resume UI

Owners: Nova consumer; Blake adapter only if needed; Quinn review. Dependencies: saveOnboardingProgress and snapshot resume_step/resume_version.

Allowed-file suggestions: Nova receives a dedicated onboarding/resume-control.tsx, page integration and tests/onboarding-resume-ui.test.ts; Blake receives tests/onboarding-actions.test.ts and an explicitly assigned action file only for demonstrated gaps. Existing form/page ownership must be transferred rather than shared.

Acceptance: owner/admin save a selected allowlisted step using current resume version and unchanged request on uncertain retry. Missing resume starts version0 and saves version1. Navigation never marks setup complete or increments config revision. Cross-device conflict requires fresh authorized resume review; no background autosave loops or new request per retry. Limited roles receive no owner resume; removed/demoted members denied. Saved progress refers to last selected step, not unsaved editor contents. Normal dashboard access remains available.

Evidence: mounted UI and SQL tests for save/reload/revisit, cross-device versions, same-request replay/no-op, failure recovery, demotion and actor/tenant injection. Explicit browser evidence distinguishes persisted step from in-memory state; no credentials/tokens in screenshots.

### CEV-ONBOARD-57-S3 — Date-exception editor/adapters

Owners: Nova UI, Blake safe adapter if generic action is insufficient, Quinn review; Atlas for any contract changes. Dependencies: accepted exception RPC semantics, shared revision and tombstones.

Allowed-file suggestions: Nova new onboarding/hours-exceptions.tsx, page integration and dedicated UI tests; Blake dedicated tests or src/app/actions/onboarding.ts only under transferred ownership. No schema changes inferred from lack of UI.

Acceptance: exact Gregorian local date, closed/open/interval validation, explicit overnight handling, current config revision, same request on uncertain retry. Upsert/remove uses accepted generic command; absent removal id:null is successful no-op; active removal retains tombstone and re-add reuses ID. Show retained history distinctly from operational hours. Truthful cap error for 366 retained dates, no deletion workaround. Saved hours do not reserve appointments or choose DST booking behavior.

Evidence: SQL/browser save/remove/re-add/reload, leap dates, overlap/closed intervals, same-date stale edits, absent removal/replay, cap and role/tenant denials; no external calendar writer.

### CEV-ONBOARD-57-S4 — Decoder and retry integration hardening

Owners: Blake backend and Nova mounted form fixes in separate ownership waves; Quinn review; Atlas for changed enums or stored invariants.

Allowed-file suggestions: Blake src/lib/server/onboarding-rpc.ts, src/app/actions/onboarding.ts and tests/onboarding-actions.test.ts. Nova onboarding-form.tsx and mounted UI tests after Blake handoff. Do not overlap S1–S3 ownership.

Acceptance: add semantic read checks where legitimate storage permits them: unique weekly weekdays, closed=>empty, interval nonoverlap; do not require seven days for an uninitialized/partial stored snapshot, convert legacy timezone to a fallback, or cap retained service/contact history at input-list limits. Existing decoder permits safe syntax but does not independently check these relationships, contact syntax or normalization on read. Determine exact behavior with Atlas before tightening historical reads. Preserve strict no-extra-field/projection/tenant/role checks. Add corruption tests for exception/resume result identity/version through SQL review rather than inventing a client proof of receipt ownership.

Retry acceptance: one frozen request/precondition/payload per attempt; retryable outcome cannot permit payload edits/new null-ID request until commit uncertainty is resolved. Replayed version is historical; refresh/review allocated service/contact IDs and current global revision before later writes. mounted BusinessProfileForm currently catches save plus router.refresh together without the confirmed guard used by the other editors; prove refresh failure after success stays confirmed, then fix if reproduced. Prop identity changing is not proof of fresh server revision; test explicit reviewed snapshot/revision behavior, including no-op saves. Attempt refs are memory-only: do not claim reload preserves retry identity. Define recovery UX before cross-reload retry storage; avoid browser persistence of invitation tokens/private contact drafts or silent new-request resubmission.

Evidence: mounted double-click, dropped-response-after-commit, stale tabs across sections, refresh-only failure, null-ID allocation and replay, no-op/current snapshot review, invalid RPC field/projection/readiness injection, membership-role race between preflight and SQL. Full checks plus relevant SQL; Quinn reviews source and runtime separately.

### CEV-ONBOARD-57-S5 — Live Auth/JWT/direct API acceptance

Owners: Quinn independent tests; Phoenix disposable environment/HTTP harness; Atlas authorized migration/catalog verification; Blake fixes only through explicit transfer. Dependencies: authorized isolated staging/disposable resources, fictional two tenants and confirmed test users for all five roles, candidate migrations005/006 applied through separately scoped reviewed plan. Existing owner-session development smoke is insufficient. Privileged fixture provisioning is isolated operator work, not ordinary request service-role use.

Allowed-file suggestions: Quinn tests/e2e/onboarding.spec.ts and new tests/live/onboarding-authorization file; Phoenix dedicated runner/env-name docs and transport evidence; Atlas new migration-execution handoff only within authorized scope. Never include secret values, JWTs, tokens, hosted IDs or real customers in fixtures/docs/output.

Acceptance: real browser sign-in/refresh/sign-out/expired session, confirmed versus unconfirmed identity, changed email/deleted account and same user across tenants; direct session-authenticated PostgREST/RPC and Server Action attempts bypassing UI. All roles, foreign/nonmember/removed/demoted, owner contacts/RSC/network privacy, exact request replay and new-request accepted invite after expiry, immutable acceptance/current projection. Real independent connection races for settings/config/resume/accept/revoke/removal/email; fresh post-wait identity/receipt and rollback. Verify ordinary base/helper denial. Hosted schema/provider prerequisites may block this task, not safe independent local tasks.

HTTP evidence: actual rendered action ID/POST, payload limits including encoded/multipart overhead and proxy rejection, Origin mismatch, safe pre-action error UX, token/body/log redaction. Explicitly distinguish 1 MiB transport from parsed131072-byte object bound; resolve any stricter raw requirement in a separately reviewed Phoenix task, not by claiming validators limit pre-parse bytes. Tests need a safe rendered consumer and must not weaken CSRF/auth to pass.

## Order and gates

Morgan can assign S1 and independent test preparation first, then S2/S3/S4 in ownership waves. Live evidence preparation can proceed while account/environment access is pending. Every proposed task needs a real ledger assignment with exact allowed paths, dependencies and reviewers before edits. Atlas reviews shared/migration changes; Quinn reviews all security/cross-module work; Morgan owns acceptance. Run typecheck/lint/meaningful tests/build and affected SQL/browser suites per implementation task.

Invitation issuance/delivery/new account creation, public signup, token continuation, provider checks/writers, monetary estimates, readiness completion policy, revenue claims and production remain outside this plan. Resume/navigation/storage counts never grant readiness. These next slices improve the accepted verified-account/configuration subset; complete first-client onboarding still needs separately approved access/delivery and trusted readiness policies plus end-to-end evidence.
