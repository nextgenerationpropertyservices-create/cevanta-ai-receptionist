# CEV-PERMITS-PACKAGING-146A — Morgan handoff

- Added PermitDesk-only workspace mode, direct entry to Permits, and isolated navigation. Existing workspaces default to Missed Call and can gain PermitDesk as an add-on.
- The additive packaging migration guards Missed Call tables and targeted RPCs, linked permit creation, and Retell ingress. Permit pilot access still requires membership, an office role, and an enabled, unexpired entitlement. Pilot pause is controlled by permit_workspace_access.enabled.
- Atlas reviewed the architecture. Quinn flagged privileged Retell ingress and historical job navigation; both were addressed. Final independent re-review and signed-in staging are pending.
- Local typecheck, lint, 883 tests, embedded database checks, and a Webpack build passed across the review runs. Default Turbopack has a Windows worker failure; one later check also encountered a concurrent build lock.
- No migrations or deployment were applied to either live app. No invitations or permits were sent.
- Rollback: disable the pilot entitlement and preserve permit records.
- Next: stage both migrations and the review build in an isolated environment. Verify permit-only, Missed Call-only, bundle, and internal sessions and complete the fictional Winchendon PDF/filing workflow before requesting pilot activation.

Final verification: Quinn independently cleared the previous issues. Final typecheck, lint, 883 tests, focused Retell and PermitDesk embedded checks, and Webpack production build passed. The fictional Winchendon PDF was generated, reopened, edited and saved locally. Hosted sign-in, browser download and tracking workflow remain unverified. The identified nonproduction project is dedicated to Outreach; a staging target for PermitDesk must be designated before hosted migration and fixture setup.

Hosted staging verification: owner approved reuse of Cevanta Outreach Test. Both migrations applied successfully. Transaction-scoped fictional fixtures verified the four product access combinations and a PermitDesk-only Winchendon draft insert/read under the authenticated database role. The fixture transactions rolled back. These checks did not exercise Auth login, browser PDF download, or the filing and tracking UI. No production migration, deployment, or pilot activation occurred.
