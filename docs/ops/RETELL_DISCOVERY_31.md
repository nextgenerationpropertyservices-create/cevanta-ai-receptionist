# Retell discovery 31 — host capability and provider retry policy

Status: read-only discovery accepted with blockers. hostedReady:false and providerConnectionAuthorized:false remain unchanged. This document authorizes no deployment, host linking, callback registration, provider configuration, real secret use, routing, durable receipt, booking or writer.

## Host capability discovery

Phoenix found no committed hosting destination or release candidate in the repository. Known local/tracked metadata checks for vercel.json, .vercel/project.json, netlify.toml, fly.toml and render.yaml remain absent. The available project evidence shows local Next build/dev capability, CI checks and source-level route controls, but no verified hosted topology, direct-origin restriction, trusted forwarding identity, shared limiter store, numeric rate/concurrency policy, platform logging/redaction policy, kill switch, hosted CI, restore evidence or candidate environment.

Tool availability alone does not prove a configured Cevanta host or authorize account-wide inspection. A future capability task requires a privately identified, owner-authorized nonproduction candidate before any host-specific read-only inspection.

## Retell provider policy discovery

Echo checked official Retell documentation and the public official TypeScript helper on 2026-10-03. Retell's webhook overview documents a 10-second response timeout and up to three retries when a successful 2xx response is not received. It also says webhook events are POST JSON and that 2xx is success. The inspected official sources did not specify retry backoff timing, total retry window, Retry-After handling, status-specific retry behavior, whether retry signatures are regenerated, or a replay/dead-letter recovery SLA.

Signature documentation and the official helper corroborate HMAC over the original body plus millisecond timestamp and a five-minute timestamp allowance. That authenticates delivery content only; it does not authorize tenant routing, booking, messaging or durable receipt.

Official sources recorded in Echo's handoff:
- https://docs.retellai.com/features/webhook-overview
- https://docs.retellai.com/features/secure-webhook
- https://docs.retellai.com/features/register-webhook
- https://raw.githubusercontent.com/RetellAI/retell-typescript-sdk/main/src/lib/webhook_auth.ts

## Accepted implications

- Do not select numeric rate limits, Retry-After values, dedupe TTL, retry retention, hosted topology or shared limiter design from current evidence.
- Do not assume provider honors Retry-After or treats 429 differently from other non-2xx responses.
- Do not use 200 success to silence retries until the event is durably and safely accepted under a reviewed contract. The current prototype verifies and discards.
- Admission must remain independent of untrusted cookies, claimed provider identity, payload tenant/call IDs or spoofable forwarded headers.
- Next safe work is either owner-authorized candidate host inspection or current provider clarification/contract design, still no-writer and read-only until explicitly scoped.
