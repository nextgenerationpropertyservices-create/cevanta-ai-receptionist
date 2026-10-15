# Handoff — CEV-CLIENT-INTAKE-SHEET-122A

- **Task:** Controlled owner-approved intake-to-Google-Sheet sync
- **Owner:** Morgan
- **Completed:** Added server-only Make webhook sync action and owner Setup button; added environment template and operator documentation. Created Make scenario `6652097` inactive, learned a fictional payload, and mapped its Google Sheets row writer to the native `Cevanta Client Intake Responses` sheet.
- **Changed files:** `src/app/actions/onboarding.ts`, `src/app/workspaces/[tenantId]/onboarding/onboarding-form.tsx`, `src/app/workspaces/[tenantId]/onboarding/page.tsx`, `.env.example`, `CLIENT_INTAKE_SHEET_MAP.md`, `docs/project/tasks/CEV-CLIENT-INTAKE-SHEET-122A.md`.
- **Database/contract changes:** None.
- **Verification:** `pnpm typecheck` PASS; `pnpm lint` PASS; `pnpm test -- --runInBand` PASS (845 tests); Make trigger learning accepted one fictional payload and reported the expected 18 fields; Make scenario remains inactive.
- **Build limitation:** `pnpm build` hit a Turbopack child-process panic while processing `src/app/globals.css`. `pnpm exec next build --webpack` then hit `EPERM` creating `.next/server/app/setup` under the OneDrive workspace. No production build pass is claimed.
- **Security:** Webhook URL is read only from server-side `CEVANTA_CLIENT_INTAKE_WEBHOOK_URL`; it is not rendered or logged. The UI sends only after an owner/admin explicitly clicks the final sync button. No credentials or real customer data were used.
- **Next action:** Add `CEVANTA_CLIENT_INTAKE_WEBHOOK_URL` to the Vercel Production environment for project `cevanta-ai-receptionist`, redeploy, send one fictional owner setup snapshot, confirm one row in the Sheet, then activate Make scenario `6652097` only when the owner is ready.
