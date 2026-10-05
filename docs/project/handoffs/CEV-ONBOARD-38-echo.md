# Agent handoff — Echo onboarding integration review

- Task ID: CEV-ONBOARD-38.
- Owner: Echo, integration-readiness reviewer; Morgan owns acceptance.
- Decision: **PASS WITH LIMITATIONS** for the proposed no-writer onboarding design. No runtime, provider-ready or activation acceptance.
- Work completed: Read required AGENTS.md, memory/context, collaboration, status, task38 and Atlas handoff. Reviewed proposed integration status/readiness, evidence revision/expiry, role projections, escalation contacts, hours/timezone and request-only booking preferences against current Retell/Make/Twilio/Google Calendar gates. No other owners' files changed.
- Files changed: docs/project/handoffs/CEV-ONBOARD-38-echo.md only.
- Database changes: None.
- API or contract changes: None applied. Reviewed prospective contracts only; refinements below need Atlas/Morgan acceptance before implementation.
- Verification commands and results: Get-Content reads and manual contract comparison completed. Self-check confirms this review addresses all assigned integration topics without provider calls, secret data or implementation. Findings below distinguish design fit from missing operational evidence.
- Known limitations: Typecheck, lint, tests, build, SQL, browser/mobile, concurrency, hosted and provider runtime checks SKIPPED/NOT RUN because this is design-only review. No migration/source/tests/provider/hosted changes or screenshots. Atlas's complete onboarding design still depends on Morgan's recorded requiredness/policy decisions and other specialist reviews.
- Risks: Bare verified language can be mistaken for live readiness; saved destinations/preferences can be mistaken for consent, delivery or reservation; stale evidence can survive changes unless invalidation is enforced. Cross-role escalation contact projection must remain restricted. No live onboarding/provider verification accepted here.
- Rollback notes: Remove this handoff only. No runtime or external state to reverse; preserve all existing provider/writer barriers.
- Exact next action: Morgan collects remaining reviews and records outstanding setup policy decisions. Atlas clarifies the provider verification display/evidence scope and disabled precedence below before implementation assignments. Scope backend-persisted configuration and pure readiness separately from future secure provider connection/verification/activation tasks. Quinn reviews cross-module implementation; Phoenix reviews evidence policy and hosted gates.

## Design fit

Atlas's readiness derivation explicitly makes no provider calls, bookings, messages or contact-verification effects. Client resume state and checkboxes cannot grant completion; evidence must match config revision/check policy and stale evidence becomes awaiting_verification. There is no SetReady or activation command. booking_state stays blocked and release_state not_evaluated. These boundaries fit the current no-writer phase.

Owner/admin-only setup and sensitive contact access, limited dispatcher operational projection and restricted technician/viewer capability summary fit integration configuration separation. Provider references/secrets/routes are deferred to a separately reviewed secure store; ordinary clients must not edit configuration files. Missing setup fields are separated from infrastructure blockers, and safe manual modules remain usable while integrations await verification.

Request_only preferences expressly do not reserve capacity or enable booking. Optional buffers/horizon/lead time have no automatic values. Existing60-minute approval remains the isolated validator policy, not a universal duration for every service. Local hours/timezone validation and readiness invalidation do not claim DST slot resolution or change existing UTC appointments.

Escalation contact presence is not destination verification, delivery, human acknowledgement or resolution. Atlas leaves urgency, after-hours routing, recipient policy and timeout decisions blocked, appropriately. No message consent is inferred from business contacts or extracted Yes/No fields.

## Required clarification before implementing integration states

1. **Verified label scope:** GetReadiness lists verified, but no secure provider connection or operational verification exists in this slice. Present it only as explicitly scoped evidence such as configuration checked, never provider ready/live/connected. Record module/check scope and safe reason codes so a historical local signature test cannot verify tenant connection. Current integrations remain unconfigured/awaiting_verification/disabled according to actual saved evidence; no manufactured positive status.
2. **Disabled precedence:** Define precedence so disabled/revoked permission overrides any older positive evidence. A readiness refresh cannot re-enable a provider. Specify safe disconnected/revoked reason codes within existing states or add a reviewed state; do not select an implicit operational reconnect behavior.
3. **Evidence invalidation:** Config revision/expiry rules are sound. Later connection revocation, credential/agent/calendar changes and route disabling must also invalidate relevant evidence even if business setup did not change. Until a connection store/policy exists, no verified provider result can be issued. Null expires_at is allowed only under an explicitly accepted versioned policy, not an indefinite default.
4. **Escalation drafts and consent:** Distinguish draft-save validity from a complete enabled contact, preserving safe recipient display and helpful errors. Any future contact verification, transfer, email/SMS or invitation delivery is a separate authorized action. Do not make the pure readiness checker perform it. Consent purpose/channel/source/revocation and acknowledgement/escalation contracts remain later tasks.

These are implementation constraints/clarifications, not a request to broaden this design into provider activation. No blocking defect found in the stated no-writer intent.

## Provider gates that onboarding must display truthfully

| Integration | Safe present-slice interpretation | Still blocked |
| --- | --- | --- |
| Retell | Local verifier and recorded configuration discovery are limited evidence | Hosted signed compatibility, trusted tenant route, durable receipt/outcome/replay handling and activity persistence |
| Make | Isolated typed validator simulation passed | Parent callback mappings, trusted live clock, operation idempotency/recovery, availability and writers |
| Twilio | Owner-selected telephony path | Tenant-bound number/routing/transfer contract and authorized synthetic operational evidence |
| Google Calendar | Internal UTC job appointments are distinct from external calendar | Secure tenant grant/revocation, destination binding, availability/concurrency/reservation, synchronization and committed confirmation |

No card should imply connection from selected provider, contact method, entered key/URL or setup completion. Keep hostedReady/providerConnectionAuthorized false and every parent/writer barrier intact. Do not announce booking success until a later authoritative committed result; unknown timeout remains unknown pending reconciliation. A bridged transfer is not resolved human work.

Future acceptance evidence: fictional two-tenant/all-role configuration save/reload, foreign contact/route denial, revoked membership and stale/expired/disabled evidence precedence, no provider/network calls from readiness derivation, truthful unknown/missing/error displays and desktop/mobile flow. Atlas approves shared contracts/migrations; Quinn tests security and cross-module behavior; Phoenix validates check policy/operational evidence; Echo reviews any actual provider adapter. Morgan accepts each scoped result, not provider readiness from this review.
