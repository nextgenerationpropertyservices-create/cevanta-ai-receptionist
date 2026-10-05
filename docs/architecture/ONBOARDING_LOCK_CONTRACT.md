# Onboarding lock and concurrency contract

Date: 2026-10-04. Task: CEV-ONBOARD-LOCK-60. Owner: Atlas. Morgan accepts. This is a planning contract for later settings, resume, exceptions, invitations and provider-readiness work. It does not change source code, migrations, tests, hosted databases, providers or production state.

## Purpose

Guided onboarding has a guarded storage path, accepted with limitations, for provisioned and confirmed users who already belong to a tenant. Future implementation must preserve a simple rule: a user saves from a reviewed snapshot, the server compares that snapshot's revision to current storage, and the server either commits one frozen request, replays the exact prior result for that request, or returns a conflict/failure that does not mutate data.

This contract defines the expected lock and replay behavior future tasks must prove. It does not declare the current product first-client ready. Live Auth/JWT/PostgREST, actual browser persistence, genuine concurrent connections, hosted migration/advisor state, invitation issuance, provider readiness and production release remain separate gates.

## Existing authority model

- The tenant configuration source of truth is the database, reached through guarded authenticated request paths. Ordinary app requests must use the current verified user session and tenant membership. They must not use a service-role client.
- Database RLS and revoked table privileges remain defense in depth. Future direct table grants, views or new RPCs must be reviewed by Atlas and Quinn before implementation.
- `tenant_setup_state.config_revision` is the tenant-wide configuration revision for setup configuration. It covers authoritative tenant profile fields, business contact profile, services, weekly hours, date exceptions, request-only booking preferences and escalation contacts.
- `tenant_setup_resume.version` is a per-tenant, per-user resume revision. Resume progress does not advance `config_revision` and must not imply configuration readiness.
- Invitations and provider readiness are separate operation domains. They may reference current configuration and membership, but they must not reuse `config_revision` as proof of token validity, provider authorization, delivery success, booking readiness or production approval.
- Existing onboarding receipts bind `tenant_id`, `actor_user_id`, `command`, `request_id`, a canonical input digest and the recorded outcome. Future work should keep this model unless Atlas approves a changed shared contract.

## Request shape

Every mutable onboarding operation must carry an explicit operation identity and precondition.

Configuration operations use:

- `tenant_id`
- `request_id`
- `expected_config_revision`
- normalized command payload

Resume operations use:

- `tenant_id`
- `request_id`
- `expected_version`
- `step_id`

Invitation acceptance uses:

- `request_id`
- the private token presented by the user

Future invitation issuance, provider readiness and evidence operations must define their own operation identities before implementation. They may not borrow a UI click ID, provider event ID, Make execution ID, browser retry counter or settings revision unless the contract explicitly proves that identity is stable, tenant-bound and replay-safe.

For every operation, `request_id` is a single-use identity for one actor, one tenant, one command and one exact normalized input. The UI may generate it, but the server decides whether it is new, replayed or reused with different content.

## Compare-and-swap rules

Configuration writes must implement compare-and-swap against the current tenant `config_revision`.

- If current `config_revision` equals `expected_config_revision`, the server may evaluate and commit the normalized payload.
- If current `config_revision` differs, the server returns a revision conflict and makes no mutation, unless the exact same request was already committed and can be replayed from an immutable receipt.
- The server must not silently fetch the latest configuration, merge user edits, and commit them under the user's stale request.
- The server must not let a stale tab overwrite a different section just because the changed rows do not overlap. A single tenant-wide revision is the initial lock because readiness and provider decisions depend on coherent full-setup state.
- Section-specific finer locks may be proposed later, but only with a reviewed compatibility plan that proves cross-section readiness and retained-history behavior. Until then, all configuration sections share the tenant-wide `config_revision`.

Resume writes compare against the actor's own resume `version`.

- A missing resume row has version `0`.
- Saving a different allowed step creates or advances only the actor's resume row.
- Saving the same step is a no-op but still may produce a receipt for replay.
- Resume conflicts must require a fresh authorized resume snapshot. They must not refresh configuration, mark setup complete, change readiness or advance tenant `config_revision`.

Invitation acceptance and future issuance must use their own version and state preconditions. Acceptance cannot depend only on possession of a token; it must also verify confirmed identity, canonical recipient binding, current invitation state, expiration, current membership conflict state and the exact request receipt.

## Same-request replay

Same-request replay exists to recover from uncertain client outcomes such as a lost response after commit. It is not a general retry shortcut.

The server may return `replayed` or an equivalent historical outcome only when all of these remain true:

- same tenant
- same verified actor
- same command
- same `request_id`
- same normalized input digest
- same receipt binding to the committed target or operation

If the same actor reuses a `request_id` with different normalized input, the server must return `conflict` with `request_reuse` and perform no mutation. This includes payload changes after a retryable/unknown outcome, changing a null ID to a concrete ID, changing a date, changing a token operation, or changing an expected revision under the same request ID.

Replayed results are historical. They do not prove the current snapshot is fresh. After any replay, the UI/backend must refresh or explicitly review a current authorized snapshot before allowing another dependent write.

## No-op behavior

A normalized no-op is a successful request that changes no business data.

- It must not increment `config_revision` merely because a button was pressed, unless storage initialization requires creating the first setup state for a tenant with no prior revision.
- It may create an immutable receipt for replay of the exact request.
- It must return a result that lets the UI truthfully say the earlier save was accepted or nothing changed.
- It must not create duplicate audit claims for changed fields when no fields changed.
- It must not turn a stale request into success. If another request already advanced the relevant revision, the no-op attempt is still stale unless it is a replay of its own committed receipt.

Future implementation tasks must distinguish these cases in tests: first initialization, true no-op at the current revision, stale no-op, replayed no-op, request reuse and version exhaustion.

## Stale tabs and concurrent section saves

The user-visible stale-tab rule is intentionally conservative.

1. Each editor loads a snapshot and stores the revision it reviewed.
2. The user submits a frozen payload with a new `request_id` and that reviewed revision.
3. If another tab or section commits first, the later submit sees a revision conflict.
4. The UI keeps the user's typed values visible, shows conflict copy, and requires a fresh review before resubmission.
5. The retry after fresh review uses a new request identity only after the user/backend has reconciled the latest snapshot. It must not reuse the uncertain original request with edited payload.

Concurrent section saves must serialize by tenant. A services save racing with a profile save, hours save, request-preferences save, date-exception save or escalation-contact save should result in one commit and one conflict unless both are exact replays of already recorded requests. Future evidence must use separate real database connections or a harness that proves independent transactions, not only a single-process ordered mock.

## Retained history and tombstones

Onboarding retains historical rows rather than deleting them. Future UI and backend work must treat that as part of the data contract.

- Services and escalation contacts use replacement inputs with stable IDs for retained rows. Omitted currently enabled rows are disabled, not deleted.
- New rows with `id: null` receive server-owned IDs. If the response is uncertain, the client must replay the exact same request or refresh to learn allocated IDs before submitting further changes.
- Existing row IDs must be verified as belonging to the same tenant before a receipt or response can disclose anything about them.
- Date exceptions are keyed by tenant and local date. Removing an active exception creates or preserves a tombstone by setting it inactive. Removing an absent date is a successful no-op only if the current revision is valid.
- Re-adding a removed date should reuse the retained date row where the schema does so. The UI must not promise deletion or a new identity.
- Snapshot projections that return retained disabled rows for editing must either stay bounded by reviewed limits or be redesigned with a paged/history projection before large retained histories can be accepted.

Future HISTORY68 work must decide how operators see retained rows, how they re-enable them, and how response sizes stay bounded. Until that work is accepted, tasks must not treat the existing input caps as proof that retained output is forever bounded.

## Receipt, audit and evidence expectations

Receipts answer "what happened to this exact operation?" Audits answer "what changed in storage?" They are related but not interchangeable.

Required receipt properties:

- immutable once written
- tenant-bound
- actor-bound
- command-bound
- request-bound
- canonical input digest-bound
- target-bound when a row or operation target exists
- safe to replay without disclosing foreign tenant or unauthorized target data

Required audit properties:

- record actual inserts and updates with the verified actor where supported by current audit triggers
- avoid claiming field changes for normalized no-ops
- preserve historic actor identity even if a user is later removed or Auth state changes
- never include secrets, raw tokens, provider payloads or real customer data in source fixtures or documentation evidence

Future provider-readiness and invitation issuance contracts must add explicit receipt and audit expectations before runtime implementation. Provider evidence must be revision-bound and trusted; flags cannot turn true from a UI checkbox, local storage value, unverified provider callback, Make execution status or a stale readiness shell.

## Error and status meanings

Future tasks should preserve the current public meanings unless a separate contract changes them.

- `saved`: this request committed or recorded the current no-op under its valid precondition.
- `replayed`: this exact request had already committed; the returned result is historical.
- `conflict` with `revision`: the submitted revision/version was stale.
- `conflict` with `request_reuse`: the same operation identity was reused with different normalized input.
- `conflict` with `version_exhausted`: the bounded integer revision/version space is exhausted.
- `validation_error`: the request shape or normalized fields failed validation before mutation.
- `unavailable`: identity, membership, role, tenant, target ownership or token state did not authorize a safe response.
- `retryable_failure`: the server cannot confirm the outcome to the client; retry only with the exact frozen request until reconciliation establishes whether it committed.

The UI must not treat `retryable_failure` as permission to generate a new request with changed payload for the same intended operation. It should keep user input visible, explain uncertainty, and offer a retry/review path that preserves the original request until the outcome is known.

## Settings alignment requirements

Settings currently remains a separate path in the accepted gap analysis. Future settings work must align with this lock contract before it can be considered a peer writer.

The accepted direction is one authoritative writer protocol for tenant name, trade and timezone. That writer must:

- use the pinned timezone catalog and shared normalization rules
- require owner/admin membership
- use current `config_revision` as a precondition
- preserve business contact values when editing only settings fields
- return replay/no-op/conflict semantics consistent with setup
- avoid silent rebase after stale tabs
- prove the existing revision trigger is not bypassed by any retained legacy path

If Morgan chooses to keep a legacy settings action for compatibility, that path still has to participate in revision invalidation, tenant safety, current-user authorization and conflict evidence. If Morgan retires it, all callers and tests must move together under an explicit ownership transfer.

## Allocation and replay uncertainty

The riskiest retry cases are operations that allocate server-owned IDs or accept a private token.

For server-allocated rows:

- The client submits `id: null` only in the original frozen payload.
- If the response is lost or retryable, the client repeats the exact same request.
- The server replays the original allocated ID if it committed.
- The client must not submit a second request with another `id: null` for the same intended row until the original outcome is reconciled.
- The client must not invent or persist local row IDs as authoritative database IDs.

For invitation/token operations:

- Tokens must never be stored in plaintext tables, browser local storage, query-derived docs, screenshots or logs.
- Replays must bind to the same verified actor and accepted invitation state.
- New account creation, issuance, delivery, revoke/reissue and continuation storage need a separate accepted access contract before implementation.

For provider readiness:

- Provider evidence must have a trusted source, a stable operation/event identity, tenant route binding, revision/freshness metadata and recovery state.
- Unknown provider write outcomes must reconcile the same operation before repeating side effects.
- Provider readiness cannot be inferred from onboarding configuration revision alone.

## Required future evidence

Blake implementation tasks must prove:

- ordinary authenticated session clients only; no service-role ordinary requests
- verified user, confirmed identity where required, tenant membership and role before mutation
- foreign tenant, removed member, demoted member and wrong role denials
- current `config_revision` or resume version compare-and-swap
- same-request replay with identical digest
- request reuse conflict with changed payload/precondition
- no-op behavior without extra revision increments
- version exhaustion handling
- retained row ownership checks before receipts disclose targets
- refresh/review after replay before dependent writes

Nova implementation tasks must prove:

- editors submit the reviewed revision/version
- stale conflicts preserve typed values and require fresh review
- uncertain retry repeats the same request and payload
- successful save followed by refresh failure still gives truthful confirmed/uncertain copy
- same tab double-click, back/forward, route refresh and cross-section saves do not create silent overwrites
- private details, request IDs, tokens, receipts and internal revision fields are not exposed in product copy or screenshots

Quinn review tasks must prove:

- two fictional tenants and all relevant roles
- direct API/RPC attempts that bypass the UI
- real Auth/JWT/PostgREST behavior when ENV59 supplies a disposable environment
- genuine multi-connection race evidence for settings/config/resume/invitation paths
- browser save/reload, lost response, stale tab and network privacy behavior
- logs and artifacts contain no credentials, tokens, real customers or private provider payloads

Phoenix environment tasks must prove:

- which environment is disposable and authorized
- how fictional users and tenants are provisioned without storing secrets in source
- whether hosted migrations/advisors/catalog checks ran
- raw HTTP and rendered Server Action boundaries when those tasks are assigned

## Migration and rollback risks

This task makes no migration. Future schema changes that add locks, receipts, projections or indexes must document forward repair and rollback behavior.

Risks to call out before implementation:

- A direct settings writer could advance revision without receipt semantics, leaving UI retries ambiguous.
- A section-specific lock could allow cross-section readiness calculations to see mixed generations.
- Retained services or contacts can grow beyond current replacement input caps unless a history projection is designed.
- Reusing request IDs across edited payloads can mask duplicate effects or stale overwrites.
- Treating provider or invitation state as configuration revision can overstate readiness and create unsafe side effects.
- Live Supabase behavior can differ from embedded tests for Auth, JWT, PostgREST grants and RLS. Embedded SQL evidence is necessary but not sufficient for live acceptance.

The preferred recovery for bad lock semantics is forward repair: stop the unsafe writer, preserve receipts/audits, add a reviewed reconciliation path, and require fresh snapshots before further writes. Destructive rollback that deletes retained onboarding history is not acceptable without a separate owner decision and data-retention review.

## Acceptance boundary

This contract is accepted only when Morgan accepts CEV-ONBOARD-LOCK-60. It is not implementation evidence. Later tasks must cite this document, keep exact file ownership in the ledger, and produce their own runtime checks before Morgan can accept settings alignment, resume UI, exceptions UI, invitations, provider readiness or release.
