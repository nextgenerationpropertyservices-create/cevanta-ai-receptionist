# CEV-ONBOARD-COLOR-164A

- Owner: Morgan (coordinator)
- Scope: Restore readable setup-page surfaces in both dashboard themes.
- Dependencies: Existing theme switch and onboarding editor styles.
- Allowed files: `src/app/globals.css`, task and handoff docs, and project status.
- Acceptance criteria:
  1. Dark mode keeps setup quick-fill and form controls readable against dark surfaces.
  2. Light mode resets setup panels, rows, controls, and notices to readable light surfaces.
  3. No onboarding behavior, persistence, or provider boundaries change.
- Required evidence: onboarding UI tests, typecheck, lint, and production build.
- State: implemented; awaiting owner release approval.
