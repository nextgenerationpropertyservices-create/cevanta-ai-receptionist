# CEV-RETELL-PROD-VERIFY-84C — Production Retell verifier-only proof

- Owner: Morgan (`product_manager`)
- Scope: Verify that production Retell ingress can be enabled in verifier-only mode without creating leads, bookings, messages or calendar events.
- Dependencies: CEV-RETELL-PROD-GATE-84A code gate, CEV-RETELL-PROD-MAP-84B private tenant mapping, Vercel production environment access.
- Allowed files: `docs/project/tasks/CEV-RETELL-PROD-VERIFY-84C.md`, `docs/project/handoffs/CEV-RETELL-PROD-VERIFY-84C-morgan.md`, `docs/project/PROJECT_STATUS.md`.
- Acceptance criteria:
  - Vercel Production has Retell verifier-only environment variables configured by name without recording private values.
  - A fresh production deployment is created after environment changes.
  - Unsigned production Retell request is rejected.
  - Signed fictional production Retell request is accepted as verified but not persisted.
  - No production writer, booking, SMS, email or calendar action is enabled.
- Required evidence:
  - Production health check result.
  - Unsigned and signed fictional Retell request results.
  - Explicit limitation that live Retell dashboard webhook/write-through is not yet enabled.
- Reviewers: Morgan coordinator review. Quinn review required before enabling writer mode with service-role credentials.
