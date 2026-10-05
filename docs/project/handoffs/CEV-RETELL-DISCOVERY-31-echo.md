# Agent handoff — Echo provider policy discovery

- Task ID: CEV-RETELL-DISCOVERY-31.
- Owner: Echo, AI Voice and Integrations; Morgan owns acceptance. Phoenix independently owns host discovery.
- Scope/dependencies: Official current Retell webhook delivery/retry/signature/timeout research after admission30; no implementation, topology, routing or numeric limit selection. Read AGENTS.md, both prompts, collaboration, role brief, MEMORY.md/context, current status, task31, task30, admission plan, hosted-readiness document and accepted Retell handoff evidence. Only this handoff assigned for writing.
- Work completed: Rechecked official documentation and public official SDK helper on 2026-10-03 (America/New_York). Distinguished documented policy from unknown provider implementation details and prior synthetic project evidence. Findings below address admission-plan retry questions without selecting policy.
- Files changed: docs/project/handoffs/CEV-RETELL-DISCOVERY-31-echo.md only.
- Database changes: None.
- API or contract changes: None. No response shape, limiter, storage or topology approved here.
- Verification commands and results: Get-Content/record searches completed. Official webhook overview, registration and security pages and public TypeScript SDK helper opened successfully. Official-domain searches for webhook backoff and Retry-After returned no results; registration page contained no retry match and overview contained no Retry-After match. These searches support the scoped documentation gaps below, not proof that no other specification exists. Template and scope self-check completed; evidence contains no private values or real provider payloads.
- Known limitations: Public documentation/source inspection only; no live requests, detected-value requests, dashboard inspection, callbacks, provider calls, scenario runs or credentials. No application/source changes. Typecheck, lint, tests, production build, SQL, browser, hosted timing/load/signature/real-provider checks NOT RUN for this documentation-only scope. Historical accepted tests are not newly executed evidence. No published revision/update date was displayed in the inspected pages; links carry the observation date below. Public SDK main is mutable, not an installed/pinned release or server-side delivery implementation.
- Risks: Unknown retry timing and Retry-After support prevent claiming safe rate-limit recovery. Signature freshness is not the retry retention horizon or durable dedupe. A local discard-only200 can suppress retries while losing events. Host time before application reader acquisition remains outside the local5000ms budget. No deployment or provider connection is authorized.
- Rollback notes: Remove this handoff only. No external/configuration/source state changed; retain default-off and production-disable guards.
- Exact next action: Morgan combines Echo and Phoenix discovery and accepts only read-only findings. Record unresolved retry questions for official provider clarification before choosing Retry-After, dedupe retention or numeric admission controls. Scope any concrete host/admission/acknowledgement design separately for Blake/Quinn and Atlas where shared identity/state/topology becomes a contract. Do not register or connect callbacks.

Readiness remains `hostedReady:false` and `providerConnectionAuthorized:false`. Research does not change either flag or authorize exposure.

## Current official findings

Observed 2026-10-03; publication/update dates not shown in these sources.

The call-event webhook is POST JSON with event and call. Retell specifies10 seconds to receive2xx and up to3 retries otherwise. Events are triggered in order but do not block later events on an earlier failure.2xx is successful; no response body is expected. Documentation recommends acknowledgement after safe acceptance, such as queue persistence. Lifecycle dedupe uses event plus call ID; transfer and transcript events need different handling. The accepted project route is only call_analyzed, so other event rules are contextual evidence, not scope expansion. [Official webhook overview](https://docs.retellai.com/features/webhook-overview)

The above uses Retell's wording of up to3 retries; it does not establish exact timing or a measured attempt count. Status-specific treatment of429,408,401, other4xx/5xx and redirects is not separately specified in the inspected policy. Its broad non2xx rule must not be reinterpreted as a guarantee of particular recovery behavior. [Official webhook overview](https://docs.retellai.com/features/webhook-overview)

Signature verification uses the original body string and X-Retell-Signature, with the webhook-badged API key. Header v is a millisecond delivery timestamp; d is HMAC-SHA256 of body concatenated with timestamp. The manual procedure checks within5 minutes of current time and uses a constant-time digest comparison. Re-serialization can invalidate verification. This authenticates delivery content, not tenant membership, business intent or booking. [Official security procedure](https://docs.retellai.com/features/secure-webhook)

Current official helper uses an anchored signature pattern, a64-hex-character digest, finite/safe numeric checks and absolute clock difference against a default five-minute allowance. It verifies through Web Crypto; the public sign helper defaults to Date.now. This corroborates algorithm/time-window behavior, but does not prove the delivery service invokes sign afresh for each retry. [Official TypeScript helper, mutable main](https://raw.githubusercontent.com/RetellAI/retell-typescript-sdk/main/src/lib/webhook_auth.ts)

Registration documentation was checked as an additional official source; it did not resolve the missing retry policy details. No dashboard/configuration was opened or changed. [Official registration guide](https://docs.retellai.com/features/register-webhook)

## Exact unresolved policy blockers

| Question | Result of official-source discovery | Why it remains a gate |
| --- | --- | --- |
| Webhook backoff | No specified delay sequence, jitter or minimum/maximum interval found | Cannot model retry burst synchronization or select a delay |
| Total retry window | No total elapsed retry horizon or expiration/retention promise found | Cannot infer durable receipt retention from10-second request timeout or five-minute signature freshness |
| Retry-After | No specified handling for delta-seconds/date values or429 header compliance found | Cannot promise provider respects a chosen admission delay |
| Status distinctions | General2xx success rule; no separate retryable/nonretryable status table found | Cannot assume permanent401/4xx stops,429 delays, or redirects succeed |
| Signature on retry | No delivery-service guarantee of regenerated timestamp/signature or unchanged payload found | Cannot prove late retries remain verifiable or byte-identical |
| Timeout accounting |10-second timeout documented; detailed DNS/TLS/connect/read/total breakdown absent | Local reader budget cannot establish end-to-end hosted response timing |
| Recovery after exhaustion | No inspected replay/recovery SLA, dead-letter retention or automatic redelivery guarantee found | Must not promise recoverability after rejection/exhaustion |

These are unknowns in the inspected official sources, not assertions that Retell lacks the features. No custom-function exponential-backoff/max_retry policy is imported into call-event webhook policy. No numeric load threshold, Retry-After value, dedupe TTL or host is selected.

## Implications for the next reviewed task

Planning inference: rate rejection and service-unavailable responses may generate further arrivals under the general non2xx rule; safe bounded admission must remain independent of a provider delay assumption. Do not exempt unauthenticated claimed provider identity. A successful acknowledgement must not be used to discard operational events just to stop retries. Signature timestamps, request admission and business-effect identity must remain separate.

Future candidate-specific work needs Phoenix host timing/raw-byte/logging evidence, Blake acknowledgement/backend fit, Quinn rejection/replay/outage tests and Atlas review if a durable receipt, trusted identity or shared limiter topology is proposed. This document supplies policy evidence only and does not design or approve those contracts.
