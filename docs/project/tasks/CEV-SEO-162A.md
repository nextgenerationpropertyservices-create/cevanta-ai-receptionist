# CEV-SEO-162A — Search Console URL-prefix verification

- **Owner:** Morgan (Product Manager and Orchestrator)
- **Status:** assigned
- **Scope:** Add the Google Search Console URL-prefix verification metadata to the public root layout, verify the production property, and document the result.
- **Dependencies:** Google Search Console URL-prefix property for `https://cevanta-ai-receptionist.vercel.app/`; owner-authorized production deployment.
- **Allowed files:** `src/app/layout.tsx`; `docs/project/tasks/CEV-SEO-162A.md`; `docs/project/handoffs/CEV-SEO-162A-morgan.md`; `docs/project/PROJECT_STATUS.md`.
- **Acceptance criteria:**
  1. The root layout emits the exact Google verification metadata returned by Search Console.
  2. The production build passes and the metadata is present on the deployed root page.
  3. Search Console reports the URL-prefix property as verified.
  4. No credentials or customer data are added to source or logs.
- **Evidence required:** build output, deployed root-page verification, Search Console verification result, and final production URL.
