# CEV-LANDING-POLISH-166A — public funnel contrast polish

Owner: Morgan (Product Manager and Orchestrator)

## Scope

Review the public Cevanta landing page for client-facing readability and fix the contrast regression caused by authenticated dashboard theme variables leaking into the public funnel.

## Dependencies

- Existing public landing page and shared global stylesheet.
- No provider, database, or deployment dependency.

## Allowed files

- `src/app/globals.css`
- `tests/landing-page.test.ts`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/handoffs/CEV-LANDING-POLISH-166A-morgan.md`

## Acceptance criteria

- Public hero headline and section headings remain dark and readable on the light funnel background.
- Secondary buttons have readable dark text on a light surface.
- The global dark dashboard theme cannot override those public funnel contrast rules.
- Existing landing-page copy and safety boundaries remain unchanged.
- Tests, typecheck, and lint pass. No deployment is made in this task.

## Required evidence

- `pnpm test -- tests/landing-page.test.ts` (configured Vitest run)
- `pnpm typecheck`
- `pnpm lint`
- Production build result recorded, including any OneDrive filesystem limitation.
