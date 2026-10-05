# Windows and Android packaging

Date: 2026-10-05
Owner: Morgan — Product Manager and Orchestrator
Task: CEV-PACKAGE-79A

Cevanta is now prepared as an installable web app. This is the safest first packaging path because the dashboard depends on the hosted Next.js app, Supabase Auth, tenant membership checks and server-side logic.

## What is ready now

- The app publishes `public/manifest.webmanifest` so Windows and Android browsers can recognize Cevanta as an app.
- App icons exist in `public/icons/` for desktop and mobile install prompts.
- The root layout links the manifest and app icons.
- A small service worker exists at `public/sw.js` for install support.
- The service worker avoids private workspace routes, API routes and Auth routes so sensitive dashboard data is not cached for offline use.

## What this means for Windows

After Cevanta is hosted at an approved HTTPS URL, a Windows user can install it from Edge or Chrome:

1. Open the hosted Cevanta URL.
2. Sign in.
3. Use the browser menu and choose install app.
4. Pin Cevanta to the Start menu or taskbar.

This gives the owner a normal app window without browser tabs. It is not yet a signed `.exe` installer.

A signed Windows installer requires a packaging step after the production URL is approved. The recommended options are:

| Option | Output | Best use | Notes |
| --- | --- | --- | --- |
| Browser install | Windows app shortcut | Fast first pilot | No signed installer needed. Uses the hosted app. |
| PWA Builder | MSIX package | Microsoft Store or managed Windows install | Needs final HTTPS URL, app identity, icons and signing choice. |
| Electron wrapper | `.exe` installer | Traditional downloadable installer | Needs packaging dependencies, code signing decision and update policy. Larger download. |

Recommended first version: browser install or PWA Builder after production hosting is approved. Use Electron only if a client specifically requires a downloadable `.exe`.

## What this means for Android

After Cevanta is hosted at an approved HTTPS URL, an Android user can install it from Chrome:

1. Open the hosted Cevanta URL.
2. Sign in.
3. Tap the browser menu and choose add to home screen or install app.
4. Open Cevanta from the phone home screen.

This gives a mobile app-style experience. It is not yet a signed APK or Play Store AAB.

A signed Android package requires a packaging step after the production URL is approved. The recommended options are:

| Option | Output | Best use | Notes |
| --- | --- | --- | --- |
| Chrome install | Android home-screen app | Fast first pilot | No Play Store submission needed. Uses the hosted app. |
| Trusted Web Activity | APK/AAB | Play Store listing | Needs final HTTPS URL, Android app ID, signing key, store assets and Digital Asset Links. |
| Capacitor wrapper | APK/AAB | Custom native shell later | Needs Android Studio/SDK and native maintenance. |

Recommended first version: Chrome install for the managed pilot, then Trusted Web Activity if you want a Play Store listing.

## Required before signed packages

These are owner decisions or external actions, so they are not completed in this repository yet.

1. Approve the production hosted URL.
2. Choose package style: fast installable app, Windows installer, Android Play Store app, or all three.
3. Decide public app name and publisher name.
4. Provide final brand assets if you want a polished store listing.
5. Approve any store/developer-account fees or code-signing costs.
6. Approve production deployment before any public package points clients to the app.

## Safe first-client recommendation

Use the installable hosted app first. It is faster, lower risk and keeps updates automatic. Once the first HVAC pilot proves value, package Windows and Android store builds around the same hosted app.