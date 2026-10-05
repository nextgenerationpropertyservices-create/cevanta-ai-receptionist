# Windows and Android packaging

Date: 2026-10-05
Owner: Morgan — Product Manager and Orchestrator
Task: CEV-PACKAGE-79A

Cevanta is prepared as an installable web app at the production URL:

`https://cevanta-ai-receptionist.vercel.app/`

This is the safest first packaging path because the dashboard depends on the hosted Next.js app, Supabase Auth, tenant membership checks and server-side logic. It gives clients an app-style launcher without building a paid store package or signed installer first.

## What is ready now

- The production app publishes `public/manifest.webmanifest` so Windows and Android browsers can recognize Cevanta as an app.
- App icons exist in `public/icons/` for desktop and mobile install prompts.
- The root layout links the manifest and app icons.
- A small service worker exists at `public/sw.js` for install support.
- The service worker avoids private workspace routes, API routes and Auth routes so sensitive dashboard data is not cached for offline use.
- Read-only production check on 2026-10-05 confirmed the hosted manifest is reachable and the hosted service worker returns HTTP 200.

## What this means for Windows

A Windows user can test browser install from Edge or Chrome:

1. Open `https://cevanta-ai-receptionist.vercel.app/`.
2. Sign in.
3. Use the browser menu and choose install app.
4. Pin Cevanta to the Start menu or taskbar.

This gives the owner a normal app window without browser tabs. It is not a signed `.exe` installer.

A signed Windows installer requires a separate packaging decision. The recommended options are:

| Option | Output | Best use | Notes |
| --- | --- | --- | --- |
| Browser install | Windows app shortcut | Fast first pilot | No signed installer needed. Uses the hosted app. |
| PWA Builder | MSIX package | Microsoft Store or managed Windows install | Needs app identity, icons, signing choice and possible store/publisher setup. |
| Electron wrapper | `.exe` installer | Traditional downloadable installer | Needs packaging dependencies, code signing decision and update policy. Larger download. |

Recommended first version: browser install. Use MSIX or Electron only if a client specifically requires it.

## What this means for Android

An Android user can test browser install from Chrome:

1. Open `https://cevanta-ai-receptionist.vercel.app/`.
2. Sign in.
3. Tap the browser menu and choose add to home screen or install app.
4. Open Cevanta from the phone home screen.

This gives a mobile app-style experience. It is not a signed APK or Play Store AAB.

A signed Android package requires a separate packaging decision. The recommended options are:

| Option | Output | Best use | Notes |
| --- | --- | --- | --- |
| Chrome install | Android home-screen app | Fast first pilot | No Play Store submission needed. Uses the hosted app. |
| Trusted Web Activity | APK/AAB | Play Store listing | Needs Android app ID, signing key, store assets, Digital Asset Links and Play Console decisions. |
| Capacitor wrapper | APK/AAB | Custom native shell later | Needs Android Studio/SDK and native maintenance. |

Recommended first version: Chrome install for the managed pilot, then Trusted Web Activity if you want a Play Store listing.

## Required before signed packages

These are owner decisions or external actions, so they are not completed in this repository yet.

1. Choose package style: fast installable app, Windows installer, Android Play Store app, or all three.
2. Decide public app name and publisher name.
3. Provide final brand assets if you want a polished store listing.
4. Approve any store/developer-account fees or code-signing costs.
5. Approve packaging dependencies and release process.

## Safe first-client recommendation

Use the installable hosted app first. It is faster, lower risk and keeps updates automatic. Once the first HVAC pilot proves value, package Windows and Android store builds around the same hosted app if customers ask for them.
