# CEV-PROJECT-AUDIT-167K — Harden Reactivation database boundaries

- **Owner:** Atlas (`architect_data`)
- **Status:** Ready after CEV-PROJECT-AUDIT-167J
- **Scope:** Repair the unreleased Seasonal Maintenance Reactivator database contract so only office roles can read its campaign/candidate data and state transitions cannot be bypassed through direct Data API writes. Use an additive migration, narrow RPCs for required transitions, and durable embedded tenant/role tests. Do not enable outbound messaging, weather providers, external calendars, automatic booking, payment, or dispatch.
- **Dependencies:** CEV-PROJECT-AUDIT-167C confirmed findings; CEV-PROJECT-AUDIT-167J must finish first because both tasks touch the maintained embedded database runner. The companion backend adapter task CEV-PROJECT-AUDIT-167L must land before any hosted migration or release.
- **Allowed files:**
  - one new additive Reactivation hardening migration under `supabase/migrations/` dated `20261026`
  - one new focused SQL test under `supabase/tests/`
  - one new focused embedded runner under `scripts/`
  - `scripts/test-db-embedded.mjs` for the minimal Auth compatibility-fixture columns required by the confirmed/deleted identity checks
  - `package.json`
  - `docs/project/handoffs/CEV-PROJECT-AUDIT-167K-atlas.md`
- **Acceptance criteria:**
  1. Viewer/technician roles cannot read Reactivation campaigns or personalized candidates through direct SQL/Data API access.
  2. Direct authenticated table writes cannot forge creator/approver identity, mark a campaign approved, approve/dismiss a candidate, or mark a candidate scheduled/booked outside approved commands.
  3. Existing owner/admin/dispatcher office workflow remains possible through narrow, tenant-scoped RPCs with fixed search paths and explicit grants.
  4. RPCs derive the actor from the authenticated identity, validate the allowed state transition, and never trust a client-supplied role or actor ID.
  5. Cross-tenant, unconfirmed/deleted, anonymous, and disallowed-role calls fail without leaking records.
  6. Scheduling remains atomic through the existing scheduling RPC; no provider side effect is introduced.
  7. The focused embedded suite is added to `pnpm check` so CI cannot skip it.
  8. A forward recovery plan and exact source-adapter dependency are documented.
- **Required reviewer:** Quinn (`quality_security`) before acceptance or hosted migration.
- **Required evidence:** Positive office-role workflow, negative viewer/technician/direct-write/cross-tenant tests, grant/function-owner/search-path assertions, atomicity evidence, typecheck, lint, full relevant embedded checks, and a handoff.

