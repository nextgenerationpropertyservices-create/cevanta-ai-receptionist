# CEV-PWA-174 — Install Cevanta
- Owner: Morgan (implementation and integration); Quinn (independent security review).
- Scope: finish existing PWA with accessible install control, platform instructions, and public-only offline resources.
- Dependencies: existing manifest, icons, service-worker registration, root layout.
- Allowed files (Morgan): src/components/pwa-register.tsx, public/sw.js, public/manifest.webmanifest, public/offline.html, tests/pwa-install.test.ts, this task, docs/project/handoffs/CEV-PWA-174-morgan.md.
- Allowed files (Quinn): docs/project/handoffs/CEV-PWA-174-quinn.md only.
- Acceptance: native install prompt when available; manual iOS/desktop instructions otherwise; installed mode hides control; keyboard-accessible dialog; private/auth/API data never cached; offline navigation shows honest connection message.
- Evidence: typecheck, lint, tests, production build; independent security review; report device installation as unverified unless exercised.
- Status: assigned. Production release requires owner approval for this candidate.
