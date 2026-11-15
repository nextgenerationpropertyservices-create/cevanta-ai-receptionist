# CEV-PROJECT-AUDIT-167F — Roadmap and backlog truth pass

Owner: Morgan (Product Manager and Orchestrator)

## Scope

Correct stale planning records so the roadmap and active backlog match the application now in production. Preserve historical records, but add a clear current-state summary and prioritized next build order.

## Dependencies

- CEV-PROJECT-AUDIT-167B/C/D findings.
- Current implementation and release evidence through commit `c9ddfd9`.
- No source, schema, provider, or deployment changes.

## Allowed files

- `docs/product/MVP_ROADMAP.md`
- `docs/project/BACKLOG.md`
- `README.md`
- `docs/project/handoffs/CEV-PROJECT-AUDIT-167F-morgan.md`

## Acceptance criteria

- The roadmap no longer says the product is only at M1.
- The README describes the current dashboard, account flow, and verification commands instead of the original foundation-only state.
- Core dashboard features, guarded workflows, design-only products, and unverified external integrations are clearly separated.
- The active backlog is ranked by customer impact and operational risk.
- Historical task records remain available and are not rewritten as completed without evidence.
- No live/provider capability is overstated.

## Required evidence

- Cross-check against source, current project status, and specialist reviews.
- Completed handoff using `docs/templates/AGENT_HANDOFF.md`.

