# CEV-CHECKUP-178

Morgan owns integration. Build a public missed-call checkup using three weekly counts, with a callback tracker download and links to free signup and an after-hours setup request. Depends on the existing public landing page and signup. Inputs stay in browser memory. The setup CTA opens a draft email for the visitor to review and send.

Allowed files: src/app/missed-call-checkup/page.tsx, src/components/missed-call-checkup.tsx, src/components/missed-call-checkup.module.css, src/lib/missed-call-checkup.ts, src/components/ui.tsx, src/app/free-tools/page.tsx, public/callback-tracker.csv, tests/missed-call-checkup.test.ts, and matching task/handoff records.

Acceptance: checkup reachable from public landing and free tools; meaningful results and recommendation for valid inputs; consistent counts enforced; empty and zero values handled; downloadable tracker and genuine next steps. Verify math, lint, type checking, tests, and build. Production release requires owner approval.
