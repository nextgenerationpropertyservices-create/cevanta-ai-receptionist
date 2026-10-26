# Agent handoff
- Task ID: CEV-LANDING-161A
- Work completed: Replaced the configured root route's internal setup screen with a public client-facing landing page. Added plain-language missed-call positioning, a fictional AI receptionist call preview, a self-hosted demo video with poster and fallback copy, three-step workflow explanation, and clear setup, dashboard demo, and sign-in actions. Added responsive styles for desktop and mobile layouts. Follow-up visual review restored the Cevanta logo asset, strengthened light-theme text contrast, and widened the simple-story descriptions so they do not wrap word-by-word.
- Files changed: `src/app/page.tsx`; `src/components/ui.tsx`; `src/app/globals.css`; `public/cevanta-call-demo.mp4`; `public/call-demo-poster.svg`; `tests/landing-page.test.ts`; `docs/project/tasks/CEV-LANDING-161A.md`; `docs/project/handoffs/CEV-LANDING-161A-morgan.md`; `docs/project/PROJECT_STATUS.md`.
- Database changes: None.
- API or contract changes: None.
- Verification commands and results: `pnpm exec vitest run tests/landing-page.test.ts --configLoader native` passed (2 tests). Full `pnpm test` passed (51 files, 890 tests). `pnpm typecheck` passed. Targeted ESLint passed for the changed TypeScript files. `node node_modules/next/dist/bin/next build --webpack` passed in the non-OneDrive build copy and includes `/` as a static route. The default Turbopack build remains blocked by the known Windows sandbox CSS-worker process error; webpack build is the verified production build path for this environment.
- Known limitations: The video is a fictional sales example and does not connect to a live call. The root page is now public for all visitors; authenticated users should use the dashboard link or `/workspaces` directly. The preview is protected by Vercel authentication, so recipients may need access to the Vercel team to view it. Local browser visual review was blocked by the same Windows Turbopack CSS-worker failure that affects the default dev server; the webpack production build passed. Visual review was completed against the Vercel preview.
- Risks: The headline describes booked-job opportunities, not guaranteed bookings. The page keeps office approval and the pilot boundary visible to avoid promising unsupported automation.
- Rollback notes: Revert `src/app/page.tsx`, the `LandingPage` addition in `src/components/ui.tsx`, the public landing CSS block, the two public media assets, the focused test, and the task documentation. No data or provider rollback is needed.
- Exact next action: Production is live at https://cevanta-ai-receptionist.vercel.app/. The owner should share the public URL and test the setup and demo links from a separate browser.

## Production release update

- Production deployment: `dpl_A8r8s9cRE2ryavhiSW5kTWCH9Ey3` (`READY`), aliased to `https://cevanta-ai-receptionist.vercel.app/`.
- Post-deploy error scan: no error records returned in the available 30-minute Vercel retention window.
- Browser verification: live root page loaded with the headline, video section, simple story, workflow cards, and setup/demo links visible. Production remains protected by the project's existing Vercel deployment protection settings.
