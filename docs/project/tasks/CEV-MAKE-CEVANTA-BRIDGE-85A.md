# CEV-MAKE-CEVANTA-BRIDGE-85A — Make-to-Cevanta Retell lead bridge

- Owner: Morgan (`product_manager`)
- Scope: Add a disabled-by-default production-safe Cevanta endpoint that lets Make send a minimal Retell analyzed-call lead package to Cevanta after the existing Retell → Make flow runs.
- Dependencies: Existing Retell lead-ingestion RPC and private Retell connection mapping. Retell currently points to Make, so Cevanta needs a Make-authenticated bridge rather than replacing the Retell webhook.
- Allowed files: `.env.example`, `src/app/api/integrations/make/retell-lead/route.ts`, `src/proxy.ts`, `tests/make-retell-lead-ingress.test.ts`, `tests/retell-proxy-path.test.ts`, `docs/project/tasks/CEV-MAKE-CEVANTA-BRIDGE-85A.md`, `docs/project/handoffs/CEV-MAKE-CEVANTA-BRIDGE-85A-morgan.md`, `docs/project/PROJECT_STATUS.md`.
- Acceptance criteria:
  - Endpoint is disabled unless explicitly enabled and production requires its own explicit production gate.
  - Endpoint verifies a Make-specific signed raw body before trusting content.
  - Endpoint accepts only minimal Retell lead fields and never stores transcript, recording URLs, body tenant IDs or arbitrary provider payloads.
  - Endpoint uses the existing service-role-only RPC and same Retell call dedupe identity so retries or future direct Retell tests do not create duplicate leads.
  - Endpoint returns safe statuses and never books appointments, sends SMS/email or writes calendar events.
  - Proxy excludes only the exact Make bridge route from browser session refresh.
- Required evidence: focused tests for disabled/default-off, production gate, bad signature, safe RPC payload, duplicate mapping, proxy exclusion and unchanged user-session behavior.
- Reviewers: Quinn review required before enabling this in production Make with a real secret and service-role writer env.
