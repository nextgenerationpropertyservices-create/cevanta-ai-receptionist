# CEV-RELEASE-170A — Final local release-candidate verification

- **Owner:** Phoenix (`devops_release`)
- **Status:** Accepted locally with hosted gates — GO for authorized preview verification; not production use
- **Scope:** Verify the integrated local release candidate without changing application, database, provider, or deployment state. Record exact candidate evidence and safe release order.
- **Dependencies:** Accepted CEV-AI-SEARCH-168D and CEV-INVITE-CONT-169D reviews.
- **Allowed files:**
  - `docs/project/reviews/CEV-RELEASE-170A-readiness.md`
  - `docs/project/handoffs/CEV-RELEASE-170A-phoenix.md`
- **Acceptance criteria:** Typecheck, lint, full tests, maintained embedded database suites, clean non-OneDrive webpack production build, public crawl-output inspection, invitation fail-closed/version-order review, secret scan, rollback plan, and explicit separation of local evidence from hosted/provider evidence.
- **Required evidence:** Commands and exit results, exact test totals, build route summary, unexecuted hosted checks, release order, go/no-go decision, no production deploy, and no hosted migration.

