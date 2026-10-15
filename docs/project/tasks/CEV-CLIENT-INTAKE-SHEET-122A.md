# CEV-CLIENT-INTAKE-SHEET-122A — controlled intake-to-Sheet sync

- **Owner:** Morgan (coordinator)
- **Scope:** Send one complete owner-approved onboarding snapshot through the inactive Make webhook into the Cevanta Client Intake Responses Google Sheet.
- **Dependencies:** Make scenario `6652097`; server-only `CEVANTA_CLIENT_INTAKE_WEBHOOK_URL`; existing Supabase-authenticated owner/admin Setup access.
- **Allowed files:** `src/app/actions/onboarding.ts`, `src/app/workspaces/[tenantId]/onboarding/onboarding-form.tsx`, `src/app/workspaces/[tenantId]/onboarding/page.tsx`, `.env.example`, `CLIENT_INTAKE_SHEET_MAP.md`, this task file.
- **Acceptance criteria:** owner/admin sees a final Send to Google Sheet action; server validates access and sends a complete snapshot without exposing the webhook URL; Make appends the mapped fields; individual section saves do not send rows; provider and production automation remain off until tested.
- **Evidence:** TypeScript, lint, and Vitest pass. Make scenario was created inactive, learned from one fictional payload, and mapped to the native Google Sheet. Production build was attempted but blocked by an environment Turbopack child-process panic while processing `globals.css`.

## Required owner setup

Add the Make webhook URL for scenario `6652097` as the server-only Vercel Production variable `CEVANTA_CLIENT_INTAKE_WEBHOOK_URL`. Do not place that value in browser code, client documents, or screenshots. Keep the Make scenario inactive until a fictional submission is confirmed in the Sheet.
