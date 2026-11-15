# CEV-RELEASE-170C1 — Preview deployment

- **Owner:** Phoenix (`devops_release`)
- **Status:** Assigned
- **Scope:** Confirm the intended Vercel team/project and create an identifiable preview-only deployment of the accepted candidate. Inspect build completion and preview runtime headers. Do not promote or touch production aliases.
- **Dependencies:** CEV-RELEASE-170C owner authorization; CEV-RELEASE-170A manifest and checks.
- **Allowed files:** `docs/project/handoffs/CEV-RELEASE-170C1-phoenix.md` only.
- **Acceptance criteria:** Correct project/team/preview target proven; deployment reaches READY; `/invite`, `/invite/continue`, and malformed continuation exchange retain exact privacy/CSP behavior; public root/robots/sitemap remain reachable; no production alias or migration change.
- **Required evidence:** Deployment ID/URL, target, candidate identity, build status/log summary, response captures, limitations, rollback, no-production statement.

