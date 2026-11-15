# CEV-LANDING-161A — Plain-language public landing page

Date: 2026-10-24 (America/New_York)
Owner: Morgan — Product Manager and Orchestrator
Status: implemented

## Scope

Replace the configured root route's internal setup screen with a public, client-facing Cevanta landing page. Explain the missed-call problem in plain language, show a short fictional AI receptionist call/demo video, and provide clear paths to start setup, view the dashboard demo, or sign in.

## Dependencies

- Existing public `/demo-dashboard` route.
- Existing fictional demo video in `demo-video-output/`.
- Existing sign-up and sign-in routes.

## Allowed files

- `src/app/page.tsx`
- `src/components/ui.tsx`
- `src/app/globals.css`
- `public/cevanta-call-demo.mp4`
- `public/call-demo-poster.svg`
- `tests/landing-page.test.tsx`
- `docs/project/tasks/CEV-LANDING-161A.md`
- `docs/project/handoffs/CEV-LANDING-161A-morgan.md`
- `docs/project/PROJECT_STATUS.md`

## Acceptance criteria

1. The root page is public and no longer shows setup instructions when Supabase is configured.
2. The main message uses plain language and clearly explains how missed calls become reviewable job opportunities.
3. The page includes a usable video element with controls, a poster, and accessible fallback copy describing a fictional call.
4. Primary calls to action link to `/sign-up`, `/demo-dashboard`, and `/sign-in`.
5. The page avoids provider names, implementation jargon, private data, and claims that automatic booking or payment collection is already live.
6. The layout is readable on mobile and desktop.

## Required evidence

- Focused landing-page test.
- Typecheck and lint.
- Production build or a documented local build limitation.
