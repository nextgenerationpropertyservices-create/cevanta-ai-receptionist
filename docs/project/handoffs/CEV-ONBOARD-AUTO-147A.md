# CEV-ONBOARD-AUTO-147A — Reversible Retell routing pause

## OBJECTIVE

Give a client owner/admin a safe recovery control for the shared Retell-to-Make tenant mapping.

## OWNER / RECEIVING ROLE

- Owner: Blake / backend logic with Nova UI support
- Receiving role: Echo and Quinn for provider and security review

## CURRENT STATE

Retell agent mapping already required an owner/admin and stored the tenant route in `integration_private.retell_connections`. The Integrations page had a map form but no client-visible recovery control.

## FILES OR SYSTEMS AFFECTED

- `src/app/actions/retell-provisioning.ts`
- `src/app/workspaces/[tenantId]/integrations/retell-pause-form.tsx`
- `src/app/workspaces/[tenantId]/integrations/page.tsx`
- `tests/retell-provisioning.test.ts`
- `tests/integrations-ui.test.ts`

## DECISIONS AND REASONS

- Pausing sets only the tenant-scoped private mapping to `enabled=false`.
- The action does not delete a Retell agent, change phone routing, revoke credentials, or send provider requests.
- The UI avoids displaying private agent IDs and states that remapping is the recovery path.

## WORK COMPLETED

Added `pauseRetellAgentMapping` with owner/admin authorization, server-configured connection validation, tenant and connection scoping, safe result states, and a client confirmation before the reversible pause. Added `getRetellAgentMappingHealth`, which reports only active, paused, not-mapped, not-configured, or unavailable state.

## VERIFICATION AND RESULTS

- Focused UI/provisioning tests: PASS (13 tests, including direct tenant-scope, authorization, missing-configuration, and readiness checks)
- Typecheck: PASS
- Lint: PASS
- Full Vitest suite: PASS (49 files, 882 tests)

## KNOWN ISSUES / BLOCKERS

- Hosted Supabase execution and live two-client routing remain unverified.
- The shared Make connection and Retell provider credentials remain server configuration; this control does not implement client OAuth or provider account isolation.
- Production deployment requires owner approval.

## NEXT ACTION

Verify the hosted tenant-isolation path with fictional tenants before enabling any live writer. The Launch readiness gate now consumes the non-sensitive route state; hosted evidence and release approval remain open.
