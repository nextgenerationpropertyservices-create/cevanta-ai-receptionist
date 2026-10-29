# CEV-RELEASE-170C3 — Hosted preview security verification

- **Owner:** Quinn (`quality_security`)
- **Status:** Blocked until preview and migration preflight are complete
- **Scope:** Independently verify the hosted preview invitation/public boundary before and after the authorized hosted migration, using only fictional identities and records. Review only; do not deploy or migrate.
- **Dependencies:** CEV-RELEASE-170C1 preview READY; CEV-RELEASE-170C2 preflight approval; migration apply evidence from Morgan.
- **Allowed files:** `docs/project/reviews/CEV-RELEASE-170C3-hosted-security.md`; `docs/project/handoffs/CEV-RELEASE-170C3-quinn.md`.
- **Acceptance criteria:** Hosted headers/CSP/cache/referrer/noindex and service-worker behavior match contract; pre-migration failure is generic/fail-closed; post-migration database permissions, wrong-account/cross-tenant denial, cookie lifecycle, and one fictional acceptance pass or are explicitly blocked; no credential/PII leakage; no production impact.
- **Required evidence:** Exact hosted observations, positive/negative test matrix, limitations, decision, and rollback.

