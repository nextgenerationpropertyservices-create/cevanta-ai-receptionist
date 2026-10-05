# Local preview resource loading diagnosis

- Task ID: CEV-AUTO-16-dev-origin
- Owner: Phoenix — DevOps and Release
- State: accepted for narrow development configuration
- Scope: Inspect Next.js development resource origin warning for127.0.0.1 and make narrowly scoped dev-origin configuration if supported; determine whether it relates to loading-only foreign workspace result.
- Dependencies: Installed Next.js guide; preview network issue already repaired; server authorization denies foreign workspace but connected browser shows loading state.
- Allowed files: next.config.ts, docs/project/handoffs/CEV-AUTO-16-dev-origin.md.
- Acceptance criteria: Only loopback development origin permitted; production security headers unchanged; no wildcard/security bypass; type/lint/build as relevant, exact unresolved browser limitation recorded.
- Required evidence: Installed guide/source review and exact setting/check results; do not assume warning causes denied page issue without evidence.
- Reviewers: Quinn read-only configuration review, Morgan integration.
- Prohibited/shared files: App/auth/error boundaries, tests, global security settings, memberships, private browser tokens.
- Branch/worktree or ownership fallback: Disjoint files; no commit.
- Evidence: Phoenix installed-guide/source inspection, Quinn approval and targeted lint; coordinator final build PASS and restarted preview renders own calendar. Only 127.0.0.1 permitted; no claim that this setting caused or fixed foreign-page loading.
- Exact next action: Keep separate from production authorization and direct RLS acceptance.
