# Voice and integration boundaries

M1 includes design-only TypeScript ports in `src/lib/integrations/contracts.ts`. There is no HTTP webhook, signature implementation, event store, live provider SDK or external provider call. These ports must not be connected to public ingestion until Architect and Quality review the real implementation.

The server selects a configured connection. A provider verifier validates the original bytes, provider signature, account identity, payload size/schema and freshness. Failure or an unconfigured verifier rejects the request. The branded verified envelope documents trust flow; TypeScript cannot authenticate an event. Never cast untrusted payloads into verified envelopes.

Resolve a unique enabled tenant mapping from server-owned connection and verified provider account. A request's tenant ID, phone number, or call metadata cannot establish tenant identity. The event transaction rechecks the route to prevent disabled or changed mappings being used. Provision mappings only through authenticated tenant owner/admin operations, under RLS; integration worker privileges must be limited to the routed tenant and reviewed independently of ordinary application clients.

Persist a unique receipt by provider, connection, provider account and event ID, with tenant ownership. Atomically store minimal call outcome, references to lead/call, tracked handoff and outbox records. Concurrent duplicate delivery returns the original receipt, without repeating lead creation or notifications. Different call events link to one lead through a unique trusted call reference. Failed transactions remain retryable. Out-of-order events cannot regress completed calls or resolved handoffs. Exactly-once external delivery must not be promised; use provider idempotency keys and reconciliation.

Handoffs track requested, assigned, acknowledged, resolved or failed state, times, actor and references. Assignment requires active tenant membership and an appropriate role. A human acknowledges and resolves; successful telephony transfer alone cannot mark work resolved. Define allowed state transitions and timeout escalation before launch.

Keep only outcome enums and opaque references in default storage and operational logs. References can still identify people; use tenant authorization, retention policy and access audit. No raw bodies, signatures, credentials, transcripts, recordings or caller contact data in logs. Credentials belong in secure deployment environment variables. If recordings or transcripts are later enabled, document consent, restricted storage, retention/deletion and signed access separately.

## Later milestone review and tests

- Retell: verify the documented raw-body signature and replay/freshness scheme; verify account/call identity and call/lead linkage, event ordering and retried outcomes.
- Telnyx or Twilio: verify provider-specific signing inputs (including public URL where required), timestamp/replay behavior and account routing; test proxy URL mismatch, forged transfer completion and duplicate status callbacks.
- Make: require a configured authenticated inbound boundary and event ID; reject arbitrary tenant selection and default shared webhook secrets. Every workflow must preserve trace and retry references.
- Calendar: enforce tenant-scoped OAuth token storage, renewal/revocation, provider event versioning and conflict reconciliation; reject cross-tenant appointment references.
- SMS/email: authorize outbound tenant workflows, preserve consent and opt-out state, dedupe delivery jobs and normalize callbacks. Test forged callbacks and message retry races.
- Maps: restrict credentials and request limits, validate tenant-scoped location access and avoid logging precise personal addresses.
- All: forged/missing signatures, stale/replayed delivery, disabled/ambiguous mappings, changed mapping during transaction, mismatched routes, concurrent duplicates, transaction failures, out-of-order events, cross-tenant references, unauthorized handoff assignment and log redaction require meaningful integration tests before activation.

No provider choice or owner credentials are needed for this M1 design. Provider-specific documentation and real cryptographic implementations must be reviewed in the milestone that activates each integration.
