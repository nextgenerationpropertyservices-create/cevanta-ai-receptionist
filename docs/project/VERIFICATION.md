# M1 verification evidence

Date: 2026-10-02. No real customer data or credentials used.

- pnpm check: exit 0, TypeScript, global ESLint, 37 actual-module mocked-client security tests, and optimized Next.js 16.3.8 production build. The final check script also includes the independently passing embedded SQL gate.
- node scripts/test-db-embedded.mjs: exit 0; actual foundation migration, fictional seed and SQL regression assertions pass in PGlite PostgreSQL. Covers RLS, roles, cross-tenant parent links, immutable identity/tenant/parent fields, authorized business updates, anonymous denial and atomic audits.
- Embedded auth.users/auth.uid and anon/authenticated roles are compatibility fixtures. No real Supabase Auth server, signed JWT, PostgREST or network database ran.
- node scripts/validate-agents.mjs --native: exit 0; seven TOML definitions and seven supported developer_instructions layers parsed/loaded by Codex v0.159.2 without printing raw configuration output.
- Native ephemeral smoke confirmed current delegation tool lacks agent_type. Same specialist definitions are executable via supported CLI launcher; automatic named-role registration is unavailable here.
- Chrome and Edge setup assertions passed: desktop heading, protected route redirect to /setup, no create controls, 390px viewport without overflow. Full runners stalled during shutdown and were interrupted with exit 1; two real-auth cases skipped.
- SETUP_PREVIEW.png captured separately with exit 0 and visually inspected by Quality and coordinator.
- Environment-check syntax and absent/synthetic-present tests pass and print names/presence only.
- Health reports reachability/configuration presence, not database readiness.
- Hosted CI, backup restore, real provider calls and production deployment were not executed.

Initial esbuild sandbox parent-path resolution failed; identical verification passed outside sandbox. pnpm 11 build allowlist repaired for esbuild/unrs-resolver; authorization was not weakened.

Reproduce with README/OPERATIONS: pnpm check; pnpm agents:validate; pnpm agents:validate:native (installed Codex); pnpm test:db for a disposable loopback Supabase stack and private DATABASE_TEST_URL; E2E process variables documented in QUALITY_REVIEW.md.

M1 implementation/source reviews complete; acceptance still requires live Supabase and clean authenticated E2E evidence.


## CEV-LOCATION-05
Existing customer locations now offer office-role-only editing. Backend requires verified tenant membership, validates parent relationships, updates only business fields and scopes every write by tenant/customer/location. Quality approved; final 77 security tests/global lint/typecheck and embedded SQL/build pass. Browser controls/default presence verified privately. Live save remains owner check; restricted bundler startup failed once and identical final tests passed outside sandbox.

CEV-EQUIPMENT-06: existing equipment editing added with office-role authorization, customer/location/equipment scope checks, business-fields-only updates and safe errors. Quality approved; 103 tests and type/lint/SQL/build pass. Browser form presence privately verified. Hosted save pending owner verification.

Owner reported successful equipment save and persistence after page refresh (CEV-EQUIPMENT-06). This is manual reported persistence evidence, not automated role/isolation acceptance.

## M2 service intake
CEV-M2-01 implementation: Leads navigation, inbox, create/edit enquiry, optional immutable customer link, priority/status/follow-up fields and loading/empty/error/setup states. Migration and shared contracts independently reviewed. RLS requires tenant membership; office roles write business fields only; tenant/submission token uniqueness prevents retry duplicates; existing metadata audit is atomic. Coordinator React skill review found labeled controls, stable keys, server-side data reads and no unnecessary client effects. Full check passes application type/lint, foundation migration assertions and intake SQL assertions, production build. Action test additions and final Quality review pending at this checkpoint. Hosted migration and authenticated lead create/edit remain owner steps; M1 live role/isolation gates remain open. No production deployment.

M2 final Quality review approved no findings. Final147 tests/global lint/typecheck/actual SQL and production build pass. Leads setup view verified in browser. Hosted migration and live intake save remain required; no full milestone acceptance claimed.

Owner reports hosted intake migration success, lead creation and status/follow-up edits persisting after refresh. Manual owner evidence; full JWT role/tenant isolation and browser automation gates remain open.

## M3 Jobs and dispatch
CEV-M3-01 implements job create/edit, assignment, date/status/priority filters, immutable links, retry-safe lead conversion and assigned-only technician read access. Verified-user actions and database RLS both enforce technician assignment; removal/demotion clears assignment and visibility. Architect/Quality approved source including serialized assignment validation. Full pnpm check exit0 with214 tests, all3 actual SQL suites and production build. Responsive real-component synthetic preview inspected1280/390px nooverflow; actual live Jobs setup notice verified. Hosted migration and real multiuser/assignment E2E/concurrent stress remain open. No production deployment.
