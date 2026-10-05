# Guided onboarding final contract correction

- Task ID: CEV-ONBOARD-FINALIZE-43.
- Owner: Atlas owns the final correction. Morgan coordinates and accepts. Blake reviews required; Quinn reviews if the correction changes security semantics.
- State: accepted with limitations on 2026-10-03.
- Scope: Resolve the two remaining implementation blockers from Blake's CEV-ONBOARD-CLARIFY-42 review: (1) incomplete profile saves versus existing tenant constraints/source authority, and (2) repeat invitation acceptance results/receipts. This is documentation-only and must not broaden scope beyond existing verified-account invitation acceptance plus configuration persistence.
- Dependencies: docs/project/tasks/CEV-ONBOARD-CLARIFY-42.md, docs/project/handoffs/CEV-ONBOARD-CLARIFY-42-atlas.md, docs/project/handoffs/CEV-ONBOARD-CLARIFY-42-blake.md, docs/project/handoffs/CEV-ONBOARD-CLARIFY-42-quinn.md and other CEV-ONBOARD-CLARIFY-42 reviews.
- Allowed files: docs/project/handoffs/CEV-ONBOARD-FINALIZE-43-atlas.md only for Atlas. Morgan may update this task, docs/project/PROJECT_STATUS.md, docs/project/BACKLOG.md and context/NEXT_TASK.md. Reviewers receive separate paths after Atlas completes.
- Prohibited/shared files: No migrations, source code, UI components, tests, package scripts, provider settings, hosted database changes, live provider calls, production deployment, real customer data, credentials, screenshots with private data, external messages/calls/calendar writers or service-role ordinary request design.
- Acceptance criteria: Atlas states exact final rules for profile/tenant fields so incomplete setup can be saved without conflicting with existing tenant constraints or bypassing config revision/readiness invalidation. Atlas also states exact repeat invitation acceptance behavior, receipt creation/replay rules, and result categories for same request, new request, expired accepted invite, removed/demoted member and changed account/email cases.
- Required evidence: Atlas handoff using docs/templates/AGENT_HANDOFF.md with files reviewed, exact corrected rules, unresolved blockers if any, risks, rollback notes and exact next action. Runtime checks are not required for documentation-only work, but skipped checks must be stated.
- Reviewers: Blake required. Quinn required only if Atlas changes authorization/security semantics beyond the already passed narrowed subset.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Atlas writes docs/project/handoffs/CEV-ONBOARD-FINALIZE-43-atlas.md.

## Coordinator acceptance — 2026-10-03

Decision: ACCEPTED WITH LIMITATIONS for implementation planning. Atlas resolved the final two onboarding blockers. Blake passed with limitations; Quinn passed with limitations; Nova passed with limitations.

Accepted subset: configuration persistence plus acceptance of privately provisioned invitations for already verified accounts. Tenant name/trade/timezone remain required authoritative fields. Contact fields may be incomplete. Repeat invitation acceptance has exact accepted/already_accepted/replayed result and receipt behavior.

Still blocked: invitation issuance/delivery, new account provisioning, public self-serve signup, token-continuation store, complete first-client delivery journey, operational/provider readiness, production deployment and full release acceptance.

Next gate: CEV-ONBOARD-SCHEMA-44 for Atlas-owned additive schema/shared contracts and SQL evidence.
