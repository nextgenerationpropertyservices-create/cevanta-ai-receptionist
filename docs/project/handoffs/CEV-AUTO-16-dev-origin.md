# Agent handoff

- Task ID: CEV-AUTO-16-dev-origin
- Owner: Phoenix — DevOps and Release
- State: implemented; Quinn review and Morgan integration pending.
- Work completed: Read the installed App Router allowedDevOrigins guide and development origin enforcement source. Added only `allowedDevOrigins: ["127.0.0.1"]` for the actual loopback preview hostname. Existing poweredByHeader and all four security headers remain unchanged. No wildcard, global CORS change or Server Actions origin override.
- Files changed: next.config.ts; docs/project/handoffs/CEV-AUTO-16-dev-origin.md.
- Database changes: None.
- API or contract changes: None. This Next.js option permits additional development resource request hostnames; scheme/port/path are not part of matching. Next.js already allows localhost and the server's initialized hostname. The sole added hostname is127.0.0.1.
- Verification commands and results:
  - Read `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/allowedDevOrigins.md`: supports exact hostname entries without scheme/port.
  - Read `node_modules/next/dist/server/lib/router-utils/block-cross-site-dev.js`: checks Origin/Referer hostnames for internal dev endpoints and rejects unapproved sources. Opaque origins remain rejected; existing handling of requests without an Origin remains unchanged.
  - Read `node_modules/next/dist/server/lib/router-server.js`: dev websocket upgrade checks the origin before routing `/_next/hmr`; development HTTP resource checks also use this function. This supports the reported HMR warning diagnosis, but does not establish the loading-only foreign-workspace root cause.
  - `pnpm typecheck`: exit0.
  - `node node_modules/eslint/bin/eslint.js next.config.ts`: exit0.
- Known limitations: No browser, server restart, production build, full application tests or global lint executed by this task. Morgan owns preview lifecycle and integrated checks. Foreign-workspace loading state is coordinator-observed; server membership denial is coordinator-reported. No causal relationship to HMR blocking has been proven. Installed source advises restart after the setting changes; coordinator must confirm resources and denied-page rendering after appropriate dev reload/restart.
- Risks: Additional exact loopback host access applies across ports in development by documented hostname matching. This is development resource configuration, not app authentication or tenant authorization. Actual IAB rendering remains unverified.
- Rollback notes: Remove only the allowedDevOrigins entry and coordinate development server restart if needed. Preserve concurrent edits and all security headers. No database rollback.
- Exact next action: Morgan collects Quinn read-only configuration review, manages approved-network preview reload/restart, confirms HMR/resource warning resolved and independently retests unavailable foreign workspace rendering. If loading persists, investigate separately without relaxing membership checks. Run integrated build and tests after specialist handoffs.
