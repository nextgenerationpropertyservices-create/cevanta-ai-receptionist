# CEV-VOICE-74A — Verified Retell call result to Cevanta lead

Owner: Morgan — Product Manager and Orchestrator
Status: assigned

## Scope

Turn the existing local Retell verifier into a gated lead-ingestion path for the first managed pilot. The route must keep no-writer behavior by default, then create or replay one Cevanta lead only when all provider-write gates are enabled, the Retell signature verifies, a trusted server-side tenant mapping exists, and duplicate protection succeeds.

## Dependencies

- Existing Retell raw-byte verifier and proxy exclusion.
- Supabase hosted development project for schema install.
- Server-only service-role key for the webhook writer, used only for provider ingress, never ordinary user app requests.
- Retell/Make/Twilio live activation remains blocked until fictional dry-run and owner approval.

## Allowed files

- `src/app/api/integrations/retell/route.ts`
- `src/lib/integrations/retell-verifier.ts`
- `src/lib/supabase/service.ts`
- `supabase/migrations/202610020008_retell_lead_ingestion.sql`
- `supabase/tests/retell_lead_ingestion.sql`
- `scripts/test-retell-lead-ingestion-embedded.mjs`
- `tests/retell-ingress.test.ts`
- `tests/retell-hosted-readiness.test.ts`
- `tests/retell-lead-writer.test.ts`
- `package.json`
- `.env.example`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `docs/project/tasks/CEV-VOICE-74A.md`
- `docs/project/handoffs/CEV-VOICE-74A-morgan.md`

## Acceptance criteria

- Default and production-disabled behavior remains safe unless an explicit reviewed writer flag is enabled.
- Raw-body Retell signature verification still happens before persistence.
- Tenant ID is never read from provider payload; it is resolved from server-owned connection ID plus Retell agent/account ID.
- Duplicate provider events return the existing lead instead of creating a second lead.
- Wrong event type, missing mapping, disabled mapping, malformed extraction and DB failures do not leak payloads or secrets.
- Lead creation stores only minimal office-review data: name, optional phone/email, summary, priority and status. No transcript, recording URL, webhook URL, signature, API key, or raw provider payload is stored.
- Local database tests and app tests cover positive and negative behavior.

## Required evidence

- Focused Retell tests.
- Embedded SQL ingestion test.
- Full `pnpm check` if focused checks pass.
- Hosted catalog verification if migration is applied.
- Handoff with limitations and exact next action.
