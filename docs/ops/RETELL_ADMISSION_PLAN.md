# Retell admission plan — CEV-RETELL-ADMISSION-30

Status: planning only. `hostedReady:false`; `providerConnectionAuthorized:false`. No limit, hosting topology or shared-state contract is selected. No known committed hosting destination exists; the offline inventory cannot rule out externally configured dashboards. No deployment, callback registration, provider setting, secret, database or writer change is authorized.

Morgan must obtain explicit owner approval and create a separate no-writer hosted-environment task before any hosted callback test. Preserve the hard production-disable guard and ordinary default-off behavior. Deploying a development server or weakening the guard to obtain a positive hosted result is not an accepted workaround.

## Required admission layers

The future reviewed request path must identify a trusted ingress boundary, request/header/body protections before application buffering, rate and global connection/request admission, bounded per-instance application readers/backlog, signature verification and a reviewed downstream acknowledgement contract. This is a requirement inventory, not a selected provider or implemented topology.

| Decision | Required behavior | Missing input / next owner |
| --- | --- | --- |
| Host/topology | Enumerate all edges, workers, regions and bypass paths; restrict direct-origin access so attackers cannot bypass edge controls | Morgan identifies authorized nonproduction candidate; Phoenix maps topology; Atlas reviews actual design |
| Identity before verification | Global unauthenticated caps must not require cookies, payload tenant/call IDs or a claimed provider identity; do not exempt claims before authentication | Phoenix/Quinn define admission keys against actual host trust boundary |
| Forwarded IP/header trust | Strip client-supplied forwarding identity at trusted edge; use only authenticated/overwritten platform metadata with documented proxy hops. If unavailable, do not treat IP as authoritative | Host documentation and direct-origin enforcement missing; Phoenix verifies, Quinn tests spoofing |
| Verified identity fairness | Only verified server-owned provider connection mapping may support per-connection quotas; signature alone does not establish tenant membership | Atlas/Echo routing contract and Blake implementation remain separately blocked |
| Global rate | Bound arrivals and burst allowance before expensive buffering/verification; shared NAT/provider egress can defeat naive per-IP fairness | Approved volume/burst/retry objectives and verified host policy missing; no requests-per-second value invented |
| Global concurrency | Bound aggregate active requests across workers/regions; atomic admission, bounded leases, release/reclamation and partition/failure semantics must be reviewed | Topology/shared limiter capability/store/consistency unknown; Atlas review before selection |
| Local readers/backlog | Bound active readers, queued requests, queue wait and chunk-count/object overhead; reject excess before application buffering, release on success/timeout/abort/error | Memory/CPU sizing, host upstream buffering and approved capacity missing; Blake implements only later assigned scope |
| Store/control outage | No silent unbounded fail-open. Define safe denial/service-unavailable behavior, bounded local fallback if reviewed, lease expiry and recovery without reset-induced burst | Failure/partition policy and retry compatibility need Atlas/Quinn approval |
| Resource limits | Explicit edge header size/count, total body size, read/header/idle/total timing, encoding and disconnect cancellation semantics | Host policies unverified; application65536-byte cap and5000ms reader budget do not bound pre-handler costs or event-loop stalls |
| Rate rejection | Proposed safe429 JSON: status rate_limited, persisted:false, bookingCreated:false; no identifiers/payload/error details, no Set-Cookie, no-store. No success acknowledgement on rejection | This is a proposed response shape, not route implementation or accepted shared contract; Blake/Quinn review before implementation |
| Retry behavior | Choose bounded Retry-After only from reviewed policy; do not invent delay. Verify actual provider support, retry count/window/backoff and signature regeneration; avoid synchronized retry storms | Echo validates current official provider policy; Quinn tests scripted retries; durable dedupe prerequisite remains open |

Rate admission is not durable processing. After limiter release, retries can still duplicate effects. No operational callbacks may connect to the current verification/discard handler; routing, durable receipts, idempotency and confirmed effects require independent contracts and tests. Do not return fabricated booking success to reduce retries.

## Observability, shutdown and recovery

Record only reviewed aggregate counters: admission/rejection categories, active/queued counts, timeout/cancel categories and limiter-store health. Avoid high-cardinality caller/call/tenant labels by default. Logs must exclude body, signature, tokens, cookies, forwarding-header values, contact details, transcripts and recordings. Define access, retention, deletion and alert ownership before exposure. Test fictional sentinels through ingress/platform/APM/handler failure paths; a handler with no console calls does not prove platform redaction.

The future host must support a reviewed kill switch blocking new ingress before origin buffering, with a separately defined response consistent with retry policy. Never temporarily switch rejection into200 success: events would be lost. Preserve existing provider/writer barriers; no provider edits follow from this document.

Before reopening, reconcile pending admissions/leases and any durable retry state against trusted receipts; avoid replaying completed effects. Record the previous compatible candidate and configuration without secrets, operator, rollback trigger and recovery objective. Exercise limiter-store outage/restart/partition and restricted recovery on synthetic traffic. Database restore and external effect reconciliation are separate gates if later implemented; no hosted reset or live replay here.

## Evidence required before exposure

1. Reviewed topology and bypass tests, trusted identity mapping and spoofed-header rejection.
2. Approved numeric limits based on measured memory/CPU and intended synthetic workload, provider retry rules and owner service objectives. No plan defaults substitute for these inputs.
3. Tests across multiple instances: bursts, queue overflow, slow/chunked/header-heavy clients, tiny-chunk overhead, abort, timeout, hung cancellation, store outage/partition, restart and lease reclamation. Verify total admission does not multiply unexpectedly by worker count.
4. Actual no-writer hosted raw-byte/header preservation, safe429/retry behavior, redaction/retention, kill switch and recovery evidence under later approved scope.
5. Candidate-specific local checks and green hosted CI; Blake backend fit, Quinn abuse/security approval and Atlas approval for any chosen topology/shared identity/state contracts; Morgan acceptance. Production/provider activation requires its own explicit owner approval.

## Current check and next task

Run `node scripts/retell-hosted-readiness.mjs` for the existing offline inventory and `pnpm check` for local regressions. Neither command authorizes exposure; no admission implementation exists. This task adds no duplicate checklist test or new executable with fictional numeric thresholds. Host absence, real limit choices, retry compatibility, global store and runtime behavior remain explicit blockers.

Morgan's next concrete task should be read-only host-capability and provider-retry discovery with exact safe evidence paths. Phoenix owns host/control inventory, Echo provider retry policy, Atlas topology/state review and Quinn spoofing/failure matrix. No host purchase, linking, deployment or callback mutation in that discovery. A later separate owner-approved no-writer hosted task follows only after a concrete reviewable design exists.
