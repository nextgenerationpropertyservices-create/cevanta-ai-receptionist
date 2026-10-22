# CEV-ONBOARD-AUTO-148A — Hosted verification prerequisites

## OBJECTIVE

Prepare the hosted two-client tenant-isolation verification for the Retell route health and pause controls.

## VERIFIED

- Vercel project `cevanta-ai-receptionist` is visible through the connected Vercel project listing.
- Production currently points to a prior `main` deployment and has server-only Supabase/Make routing variables, including `SUPABASE_SERVICE_ROLE_KEY` and `MAKE_RETELL_INGRESS_CONNECTION_ID`; values were not decrypted or printed.
- `RETELL_API_KEY` is now stored privately as Production and Preview Secrets in Vercel. A deployment created after the update is READY and the deployed sign-in page loads. It is based on connected `main` commit `76bb78e`, which predates the latest local routing changes.
- The Vercel connector cannot fetch the current production deployment because its deployment/team authorization is not mapped for protected fetches.

## REQUIRED OWNER ACTION

In Vercel Project Settings → Environment Variables, add the replacement Retell key as a sensitive server-only variable named `RETELL_API_KEY` for each intended environment. Do not paste the value into chat. Confirm only when it has been stored.

## RELEASE SEQUENCE

1. Verify the existing private Supabase/Make settings remain present in the new deployment.
2. Create a preview deployment containing the current local changes.
3. Sign in with two fictional owner workspaces and verify each sees only its own route status, mapping, pause result, and lead intake.
4. Verify a paused route stops its tenant mapping while the other fictional tenant remains active.
5. Record passed, failed, skipped, and blocked checks.
6. Request explicit production-release approval only after preview evidence passes.

## LIMITS

No live writer, phone routing change, customer message, booking, payment, or production deployment was performed during this prerequisite check.
