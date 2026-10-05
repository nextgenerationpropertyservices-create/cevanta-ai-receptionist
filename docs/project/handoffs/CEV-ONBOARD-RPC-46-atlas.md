# Agent handoff — Atlas guarded onboarding database commands

- Task ID: CEV-ONBOARD-RPC-46.
- Owner: Atlas. State: implemented, awaiting Blake backend-fit review, Quinn security review and Morgan acceptance.
- Assignment confirmed: scope is protected configuration/resume/invitation acceptance and narrow reads for the accepted verified-existing-account subset; dependency schema44 accepted, tests45 accepted with limitations. Exact allowed files: migration006, onboarding_commands.sql, onboarding-contracts.ts, onboarding-validation.ts and this handoff. Acceptance requires explicit current Auth/member/role guards, pinned search_path/grants, private receipts, safe enums, revisions/no-ops, role-safe projections and meaningful SQL evidence.
- Required documents read: AGENTS.md, original build/team prompts, collaboration/status, task44/46, Atlas/Blake/Quinn44 handoffs, task45 and archived partial46 draft; accepted Atlas38/42/43 and final43 reviewer routing/receipt rules retained. Supabase guidance applied. No Next.js runtime code changed.
- Work completed: Recreated a complete active migration006 from the archived draft; implemented four guarded database entrypoints, independently normalized SQL inputs, transactional persistence/replay, role-safe snapshots, and persistent command SQL tests. Archived partial file remains untouched.
- Files changed: supabase/migrations/202610020006_onboarding_commands.sql; supabase/tests/onboarding_commands.sql; src/lib/onboarding-contracts.ts; docs/project/handoffs/CEV-ONBOARD-RPC-46-atlas.md. onboarding-validation.ts reviewed but unchanged; existing shared validators already fit the SQL contract. No other source writes, commits or ownership overlap. Git remains unborn; disjoint ownership fallback used.

## Database changes

Migration006 is one additive transaction after005. It adds no tables, Auth changes, provider effects or ordinary base-table permissions. All new/private helpers remain inaccessible to PUBLIC/anon/authenticated. Four public entrypoints are explicitly postgres-owned SECURITY DEFINER with empty search_path, qualified relations, PUBLIC/anon EXECUTE revoked, and authenticated-only EXECUTE:

| Function | Named arguments | Result |
| --- | --- | --- |
| onboarding_configure | command text, input jsonb | saved/replayed setup or exception; validation_error, conflict, unavailable, retryable_failure |
| onboarding_save_resume | input jsonb | saved/replayed resume and original revision/version; same safe failures |
| onboarding_snapshot | target uuid | available with role-specific snapshot, unavailable, retryable_failure |
| onboarding_accept_invitation | input jsonb | accepted/already_accepted/replayed; unavailable, membership_conflict, conflict/request_reuse, retryable_failure |

Ordinary app requests later use authenticated session clients, never a service-role client. SQL independently derives auth.uid() and locks the current Auth record FOR SHARE, requiring current email confirmation, non-deletion and a present email. No JWT email, user_metadata, client actor/role or client digest is authoritative. Config/read access does not require the current email to match a syntactic invite representation; invite acceptance independently requires current canonical email to equal the immutable recipient binding. No grant lets ordinary callers read Auth/private records.

Configuration lock order: current Auth identity → current membership FOR SHARE with owner/admin check → tenant FOR UPDATE → command/request advisory → root → aggregate/children. Private request namespace includes tenant/actor/command/request. Input is independently normalized: exact keys, actual JSON Boolean/integer types, UUID case, ASCII edge trim/code-point bounds, supported contacts/timezone, real dates, explicit seven weekdays, interval sorting/overlap bounds, sorted replacement items and duplicate ID denial. Parsed compact JSON byte sizing matches shared normalization for valid bounded numeric inputs; raw HTTP131072-byte enforcement is still the later server boundary's responsibility. SQL canonical receipt envelope matches the shared command/version/verified actor/full normalized input. No raw payload/digest/token is returned or stored in receipts.

Target ID ownership is checked before replay. Existing successful receipt authorizes no one: current identity/member/role is rechecked, digest and exception target binding checked, and immutable original result returned. Stale precondition is evaluated only for a new request, after replay handling. Request reuse with changed normalized input is conflict/request_reuse. Actual changes advance shared revision once; initial root0→1 occurs even for a first absent removal. Later exact normalized no-ops keep revision and add a receipt without business audit. Revision/row-version exhaustion denies changes. A profile authority change uses the005 settings trigger's increment; contact-only/other changes use advance_revision exactly once. Required tenant fields and contacts save atomically. Existing settings trigger/grants remain unchanged.

Bounded aggregate writes use a private fixed-table/column allowlist writer; no public input supplies SQL identifiers or metadata. Database IDs/actors generated by commands, changed rows increment versions, unchanged rows skipped. Replacements disable omitted existing IDs, preserve disabled/history identities, and allocate null IDs once per committed original request. Weekly replacements write seven explicit rows together. Exception remove is a retained tombstone; re-add reuses the immutable date UUID; absent remove produces id:null and no phantom row. Retained366-date limit checked before root/receipt mutation, with safe date/invalid_input error. Booking mode is always request_only. Resume serializes current tenant/actor across distinct requests, uses its own expected_version, never changes config revision and never stores another user's progress.

Read projections acquire current membership and tenant locks, then collect one statement-coherent snapshot:
- owner/admin: workspace authority, contact profile, services/week/retained exceptions, request-only rules, escalation, current actor resume, pending readiness; no invitation/receipt/Auth data.
- dispatcher: services id/name/enabled, hours/timezone, **active** exceptions only and request-only rules; no profile/escalation/resume/readiness diagnostics or counts.
- technician/viewer: workspace id/name and current role only; existing module permission/capability logic remains authoritative.
Readiness remains not_evaluated/setup_policy_pending, booking blocked, release not_evaluated and hostedReady/providerConnectionAuthorized false. No complete/verified/provider probe is invented.

Invitation sequence: bounded strict token/request validation → current verified Auth row share lock → private preliminary digest lookup solely for lock identity → membership-v1 advisory for tenant/recipient → current membership share lock if present → tenant share lock/current workspace → acceptance request advisory → invitation update lock → fresh invitation/receipt checks. Recipient user/email, token/tenant identity and non-revoked state checked on every branch. Pending expiry uses clock_timestamp after waits; accepted repeats skip expiry but require current exact intended-role membership. No accepted token restores missing/demoted membership or changes a role. Current intended-role mismatch on a pending invitation is membership_conflict.

Pending acceptance creates membership only when absent, marks accepted once and audits only actual membership/invitation changes. Every successful new request, including already_accepted, atomically persists a minimal receipt; same-request replay makes no writes. UTC accepted_at remains immutable while workspace name is freshly projected under the tenant lock. Entry is setup while the accepted completion policy remains pending, as final43 requires; clients must preserve access to existing authorized modules and avoid trapping non-office roles in an owner wizard. Dashboard routing can be introduced only under a separately accepted policy; no readiness claim follows from navigation.

A noncooperating membership INSERT collision is reread in a fresh statement. Differing role returns membership_conflict; identical/uncertain state returns retryable_failure to restart the complete original lock sequence, rather than taking a late membership lock after tenant. Cooperative pending invites for same target/intended role may accept without a second membership insert. Unreviewed admin/Auth-cascade paths are not claimed deadlock-free.

Exception handlers cover the whole command body: mutation/audit/receipt failure rolls back its subtransaction and returns a safe retryable_failure (numeric version exhaustion returns conflict/version_exhausted). No database exception detail, private record or guessed success is returned. A lost response reuses the original command/token/request and current authorization; no history reset.

## API or contract changes

onboarding-contracts.ts now exports ONBOARDING_RPC function names, WorkspaceOnboardingSnapshot and OnboardingSnapshotResult. Existing config/resume/invite payloads/results, role-specific projections, canonical serializers and validator behavior are preserved. No server action, route, HTTP mapper or UI wiring ships. Backend must call getUser, enforce raw byte limits before JSON parsing, use exact named arguments, map gateway/argument/JWT errors safely, and report success only after confirmed committed RPC response. SQL Auth checks add defense; they do not prove live JWT/session validity.

## Verification commands and results

All listed checks completed exit0 against the six-migration candidate in disposable local compatibility databases. Node entrypoints run the installed tools behind package scripts.

| Check | Command and result |
| --- | --- |
| Typecheck | node node_modules/typescript/bin/tsc --noEmit --incremental false — PASS |
| Global lint | node node_modules/eslint/bin/eslint.js . — PASS |
| Unit tests | node node_modules/vitest/vitest.mjs run --configLoader native — PASS10 files/482 tests, including44 persistent onboarding validation tests; existing module-type warning only |
| Foundation SQL | node scripts/test-db-embedded.mjs — PASS6 migrations, seed and existing isolation/role/identity/parent/audit tests |
| Module SQL | node scripts/test-intake-embedded.mjs; node scripts/test-jobs-embedded.mjs; node scripts/test-appointments-embedded.mjs — each PASS |
| Onboarding storage SQL | node scripts/test-onboarding-embedded.mjs — PASS with migration006 loaded and unchanged005 storage assertions |
| Onboarding commands SQL | Disposable runner below — PASS persistent supabase/tests/onboarding_commands.sql |
| Independent SQL/TS parity | Transient Node/PGlite/transpiled TypeScript checks — PASS10 vectors covering all7 command normalizations and3 compact body sizes near131072 bytes |
| Production build | node node_modules/next/dist/bin/next build — PASS Next16.3.8; build is not deployment |

Persistent command SQL covers guarded owner/search_path/execute metadata; private/helper/base-table denial and anon; current verified/deleted/changed email behavior; all5 roles and foreign owner; safe projection field allowlists/readiness; root initialization, authority+contacts exactly-one revision, contact-only revision, no-op audit, stale revision, request reuse, independently normalized text/week digest replay, service null-ID replay/omission/foreign ID, seven-day atomicity, exception tombstone/re-add/absent removal, request-only rules, sensitive escalation, actor resume/replay/demotion, version exhaustion, invite wrong/expired/revoked token/current identity/member/role denial, accepted/new-request receipt counts and unchanged audit/time, fresh workspace name, expired historical accepted repeats, and config/invitation receipt-fault rollback/retry.

Fixture Auth columns/users/grants/triggers and all data roll back; nothing touches hosted Auth. Historical expired acceptance is explicitly a trusted fictional fixture, not a claim a pending expired invitation can be accepted. Raw tokens never printed; fixtures generate synthetic token patterns only.

Reproduce new command suite from repo root (PowerShell; in-memory only):

```powershell
@'
import {PGlite} from '@electric-sql/pglite';import {readFileSync,readdirSync} from 'node:fs';const db=await PGlite.create();try{await db.exec(`create role anon nologin;create role authenticated nologin;create schema auth;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;alter default privileges in schema public grant all on tables to anon,authenticated;`);for(const f of readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(readFileSync('supabase/migrations/'+f,'utf8'));await db.exec(readFileSync('supabase/tests/onboarding_commands.sql','utf8'));console.log('PASS onboarding commands SQL');}catch(e){console.error(e.message,e.code,e.where);process.exitCode=1;}finally{await db.close();}
'@ | node --input-type=module
```

The existing accepted tests45 runner invokes onboarding_isolation.sql, **not onboarding_commands.sql**. New command assertions persist, but main check/CI registration requires a separately assigned script/package ownership change. No package/script files modified or existing tests weakened.

## Known limitations and skipped checks

NOT RUN / UNVERIFIED: genuine multi-connection accept/accept/revoke/removal/email races and lock/FK/Auth-cascade inventory; hosted Auth/JWT/PostgREST and tzdata/migration/advisors; browser/backend HTTP/raw-body/session/log-redaction integration; hosted CI/backup restore; live providers/delivery/new-account/continuation. No environment/implementation for those was assigned and no hosted access used. PGlite has a fictional Auth table and a single execution context; sequential assertions cannot establish genuine concurrency or JWT proof. Existing legacy settings uses its original RLS path and is not evidence of this new locked-membership revocation protocol; its validation integration remains assigned separately.

Blake/Quinn actual implementation reviews remain **pending**. Migration006 has not been applied to hosted or production environments. Issuance/delivery/public signup/new accounts/token continuation/completion/provider readiness remain excluded. No credentials, real customer information or external effects added.

## Risks and rollback notes

Primary review points: generic command dispatch/fixed-table writer, SQL/server normalization/digest/body-size parity, profile trigger double-bump avoidance, all lock ordering including resume and noncooperating insertion handling, current Auth schema assumptions and role-safe coherent projections. Cooperative administration must honor membership-v1 and Auth-first locking; destructive Auth/admin cascades still need inventory and real concurrent evidence. Client setup navigation must keep existing authorized modules accessible while policy remains pending. Future mutations must keep tenant locking and revision invalidation.

Migration transaction failure rolls back new functions/grants. After applying, prefer additive forward repair. First revoke authenticated EXECUTE on unsafe public RPCs; preserve005 settings revision invalidation and all configuration, accepted invitations, memberships, tombstones, audit and receipts. Do not undo accepted membership, reset tokens/timestamps, erase successful receipts, grant broad table access or drop populated tables to recover. Helpers may remain private while a reviewed replacement is prepared; do not remove the005 settings trigger alone.

- Exact next action to Morgan: Obtain Blake backend-fit and Quinn independent security/SQL review of migration006, command tests and shared RPC result types. Assign disjoint runner registration for onboarding_commands.sql and genuine concurrency/live-auth evidence before accepting those claims. After reviews pass, accept RPC46 and assign authenticated server-action/raw-body/safe-error integration plus separate legacy-settings validation integration, then role-aware UI. Keep hosted application, issuer/delivery/new-account/readiness/provider/production gates separately authorized. Morgan owns final acceptance.
