# CEV-PACKAGE-79A — Windows and Android app packaging foundation

Owner: Morgan — Product Manager and Orchestrator
Status: accepted with limitations
Date: 2026-10-05

## Scope

Prepare Cevanta so the dashboard can be installed as an app on Windows and Android while preserving the secure hosted Next.js dashboard.

## Dependencies

- Existing authenticated Cevanta dashboard.
- Production hosting URL exists for browser-install testing. Signed packages still require owner decisions and possible paid accounts/signing.

## Allowed files

- `src/app/layout.tsx`
- `src/components/pwa-register.tsx`
- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/icon.svg`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `tests/pwa-install.test.ts`
- `docs/project/WINDOWS_ANDROID_PACKAGING.md`
- `docs/project/tasks/CEV-PACKAGE-79A.md`
- `docs/project/handoffs/CEV-PACKAGE-79A-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `MEMORY.md`
- `README.md`

## Acceptance criteria

- App metadata points to a web app manifest. PASS.
- Manifest includes Cevanta app name, dashboard start URL, standalone display, theme color, and app icons. PASS.
- A safe service worker registration exists for install support without caching private dashboard data. PASS.
- Documentation explains the Windows and Android packaging path in plain language. PASS.
- Documentation does not claim a signed `.exe`, MSIX, APK, AAB, store listing, or production deployment was created. PASS.
- Verification commands/results are recorded. PASS.

## Evidence

- `.\node_modules\.bin\vitest.CMD run tests\pwa-install.test.ts --configLoader native` PASS: 1 file / 4 tests.
- `pnpm typecheck` PASS.
- `pnpm lint` PASS.
- `pnpm build` PASS after final change; route table still includes protected workspace routes.
- `pnpm check` PASS before final local-install adjustment: typecheck, lint, 22 files / 747 tests, embedded database suites, Retell lead-ingestion embedded suite and production build.

## Limitations

This prepares and hosts an installable web app at the production URL. It does not create a signed Windows `.exe`, MSIX, Android APK, Android AAB or app-store listing. Those require owner approval for package format, publisher identity, store/developer-account costs, signing and release process.

## Hosted follow-up evidence

2026-10-05 read-only production checks confirmed https://cevanta-ai-receptionist.vercel.app/manifest.webmanifest is reachable with Cevanta app metadata and https://cevanta-ai-receptionist.vercel.app/sw.js returns HTTP 200. Browser install is ready to test on Windows/Android. No signed .exe, MSIX, APK, AAB, store listing, paid account or code-signing action was created.




