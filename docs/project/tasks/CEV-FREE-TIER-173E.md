# CEV-FREE-TIER-173E — Provider ingress plan lock

- Status: ready after CEV-FREE-TIER-173A approval; depends on the `plan_restricted` database result from 173B.
- Owner: Echo (`voice_integrations`)
- Scope: Make Retell and Make lead ingress fail closed for free workspaces and return a safe, explicit non-persisted result without creating a lead, booking, notification, or provider side effect.
- Dependencies: CEV-FREE-TIER-173A contract; CEV-FREE-TIER-173B database ingress result.
- Allowed files:
  - `src/app/api/integrations/retell/route.ts`
  - `src/app/api/integrations/make/retell-lead/route.ts`
  - `tests/retell-lead-writer.test.ts`
  - `tests/make-retell-lead-ingress.test.ts`
  - `docs/project/handoffs/CEV-FREE-TIER-173E-echo.md`
- Acceptance criteria:
  - Both ingress routes recognize the trusted database `plan_restricted` result.
  - A plan-restricted event returns a safe, non-persisted response and never claims that a booking or lead was created.
  - Existing signature, mapping, duplicate, validation, and retry behavior remains unchanged.
  - Focused tests cover the restricted result for both ingress paths.
- Reviewers: Atlas contract review; Quinn security review.
- Required evidence: focused route tests and handoff using the project template.
