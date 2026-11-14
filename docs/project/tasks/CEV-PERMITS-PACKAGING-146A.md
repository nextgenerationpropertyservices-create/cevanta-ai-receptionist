# CEV-PERMITS-PACKAGING-146A — PermitDesk product and bundle

- Owner: Morgan (Product Manager / Orchestrator).
- State: Handoff accepted. Implementation not started.
- Scope: Offer PermitDesk by itself or bundled with Cevanta Missed Call, using one codebase, one Cevanta login, and one company workspace. Start with manual access for one pilot contractor.
- Dependencies: Import CEV-PERMITS-145A from commit `78e1838` onto a review branch based on current `main`. The module passed 883 tests, lint, typecheck, production build, and a PDF fixture smoke test locally. It was not pushed or deployed because repository write access was unavailable. The saved [Git bundle](https://chatgpt.com/library?file_id=libfile_a751a267d3bc8191a84e52e71e0723a1&account_id=personal) can recover the change. Keep both existing live apps unchanged.
- Allowed files for this handoff: this task brief only. Morgan will assign exact implementation paths after repository reconciliation and architecture review.
- Reviewers: Architect for entitlement, route, and data boundaries. Quality for sign-in, onboarding, navigation, and tenant isolation. Release reviewer for staging and pilot activation.

## Product behavior and acceptance

| Workspace access | Expected result |
| --- | --- |
| PermitDesk only | The invited contractor uses normal Cevanta sign-in, lands in Permits, and can save a draft without completing receptionist or HVAC setup. Missed Call tools are unavailable. |
| Missed Call only | Existing receptionist, leads, and jobs workflows are unchanged. Permits does not appear and direct routes cannot be used to bypass access. |
| Bundle | Both products appear under one workspace. Jobs → Create permit carries over the authorized job address and scope. Existing permit records stay in place when access is upgraded. |
| Internal Cevanta | The owner retains a distinct admin view for product access and pilot management. This does not grant access to contractor records outside existing authorization. |

- Enforce product access server-side as well as in navigation. An unentitled account, a different company, or a paused or expired pilot must not be able to read or write permits through a direct request. No automatic free workspace from signup.
- In staging, use fictional records and independent signed-in sessions for the access combinations above. Run one Winchendon job through a saved draft, editable unsigned PDF download, manual filing handoff, and submission tracking. Do not send anything to a municipality.
- Preserve existing Auth and tenant boundaries. Do not change live HVAC setup, migrate standalone records, add checkout, change DNS, deploy to production, or send invitations or permits under this handoff.
- Required evidence: local lint, typecheck, tests, build, and signed-in staging results. Record any blocked verification separately.

## Next action

From a checkout with GitHub write access, reconcile the bundle with current `main` on a review branch. Then assign the permits-only onboarding and entitlement slice for implementation and independent review. Enable only the chosen pilot workspace after staging checks and the applicable release approval.

## Assigned slice
Morgan owns workspace entry, permit guards and shell in src/lib/server/{queries,permits}.ts, src/app/workspaces/[tenantId]/{layout,page,onboarding/page}.tsx, src/components/workspace-shell.tsx, src/lib/contracts.ts and additive migration 20261114010646_permitdesk_packaging.sql. Depends on recovered module and Atlas review. Acceptance requires server and RLS isolation, legacy compatibility and independent verification. No live activation.
Morgan also owns the scoped product guard in src/app/actions/retell-provisioning.ts and direct access regression assertions in tests/permitdesk-db.test.ts.
Morgan owns updates to the existing onboarding UI and Retell provisioning test fixtures for the new authorization boundary.
Morgan owns the linked-job visibility guard in src/app/workspaces/[tenantId]/permits/[permitId]/page.tsx and provider ingress guard in the packaging migration.
