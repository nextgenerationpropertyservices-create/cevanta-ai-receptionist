# Onboarding environment readiness checklist — CEV-ONBOARD-ENV-59

Documentation only. This checklist prepares future credentialed onboarding browser, JWT/PostgREST and HTTP evidence without collecting secrets or changing any environment. It does not authorize provisioning, hosted database writes, provider calls, production deployment, screenshots, traces, videos or credential storage.

Morgan must assign each future execution separately. Quinn owns independent runtime evidence when assigned. Phoenix may prepare run commands and release evidence within assigned files only. Atlas must review any hosted migration/catalog conclusion. Blake owns backend fixes only through a later ledger task.

## Evidence classes

Keep every result in one of these classes. Do not promote a narrower result into a broader claim.

| Class | What it can prove | What it cannot prove |
| --- | --- | --- |
| Local anonymous | Protected routes redirect, public sign-in layout loads, mobile overflow is acceptable and no credentials are needed. | Authenticated persistence, role privacy, tenant isolation, live JWT/PostgREST, hosted migrations, providers or production readiness. |
| Disposable authenticated | Fictional verified users can sign in to a disposable development project and exercise mounted browser flows against a local preview. | Direct live PostgREST/RPC denial, genuine hosted migration/advisor state, production behavior, provider readiness or external effects. |
| Hosted/live | The approved development or staging project has the expected schema, Auth/JWT/PostgREST behavior, RLS, advisors and live HTTP behavior. | Production approval or complete first-client journey unless the assigned task covers those claims. |
| Production | The exact release candidate has approved checks, reviewed migrations, restore/rollback evidence, logging controls and explicit owner deployment approval. | Anything without owner approval. Local builds and hosted development tests are not production deployment evidence. |

## Fictional accounts and tenants

Use a disposable development project, not production, customer data, demo data that must be preserved or an owner's personal session. The trusted operator injects private values into local processes; evidence records only labels and pass/fail facts.

Create five separate confirmed Auth accounts in the same fictional tenant. Each account should have one intended role membership and no extra memberships unless the assigned test requires same-user multi-tenant behavior.

| Label | Fictional account handle | Intended role | Required evidence use |
| --- | --- | --- | --- |
| owner | owner-onboarding@example.invalid | owner | Business profile/services/hours/preferences/contact save and reload; privileged Setup controls. |
| admin | admin-onboarding@example.invalid | admin | Same privileged Setup save/reload coverage as owner. |
| dispatcher | dispatcher-onboarding@example.invalid | dispatcher | Limited-role Setup view with no private editing controls. |
| technician | technician-onboarding@example.invalid | technician | Limited-role Setup view, mobile layout and privacy checks. |
| viewer | viewer-onboarding@example.invalid | viewer | Read-only/limited Setup view and privacy checks. |

Use one fictional tenant for those memberships:

- Tenant label: `cevanta-onboarding-disposable`.
- Business name: `Cevanta Onboarding Test HVAC`.
- Trade: `hvac`.
- Time zone: one pinned valid IANA zone already accepted by the application, for example `America/New_York`.
- Starting state: no real contacts, customers, provider credentials or production data.
- Existing fixture effect: owner/admin browser tests may save a unique fictional optional contact and leave it changed. Cleanup/restoration must be a separately approved development workflow.

Use a second fictional tenant only for cross-tenant/direct-denial tests:

- Tenant label: `cevanta-onboarding-foreign`.
- Memberships: no membership for the five role accounts unless a later test explicitly covers same-user multi-tenant behavior.
- Records: synthetic only, enough to prove inaccessible foreign data when Quinn assigns direct JWT/PostgREST or foundation denial checks.

Do not invent schema fields such as a membership `enabled` flag. Confirm current membership semantics from the active migration/schema before provisioning or interpreting results.

## Required private environment names

Values stay out of source, chat, screenshots, traces, videos, reports and copied logs. Use process-local variables or another approved private injection method. Never write passwords, JWTs, cookies, Supabase keys or tenant IDs into tracked files.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Disposable project URL for the local preview process. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Disposable publishable key for the local preview process. |
| `E2E_BASE_URL` | Approved loopback preview URL, normally `http://127.0.0.1:3000`. |
| `E2E_CHROMIUM_PATH` | Installed browser override, if the local Chrome executable is used. |
| `E2E_AUTHENTICATED` | `0` for anonymous-only; `1` only after all disposable prerequisites are confirmed privately. |
| `E2E_CONFIGURED` | Required by configured foundation/all suites; current onboarding spec does not read this switch. |
| `E2E_EMAIL` / `E2E_PASSWORD` | Owner account. |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | Admin account. |
| `E2E_DISPATCHER_EMAIL` / `E2E_DISPATCHER_PASSWORD` | Dispatcher account. |
| `E2E_TECHNICIAN_EMAIL` / `E2E_TECHNICIAN_PASSWORD` | Technician account. |
| `E2E_VIEWER_EMAIL` / `E2E_VIEWER_PASSWORD` | Viewer account. |
| `E2E_TENANT_ID` | Same fictional tenant used by the five role memberships. |
| `E2E_FOREIGN_TENANT_ID` | Fictional tenant inaccessible to those users; required by foundation owner denial cases, not by the current onboarding spec. |

If ignored local configuration points to a non-disposable project, stop. Do not continue by changing roles, weakening RLS, borrowing cookies or using a service-role client for ordinary app requests.

## Hosted migration, catalog and advisor evidence needed

Local embedded SQL passes do not prove hosted state. Before any live Auth/JWT/PostgREST or hosted HTTP acceptance, an assigned operator must record no-secret evidence for the exact disposable project/candidate:

- Migration history or catalog presence for reviewed foundation through onboarding migrations `001` through `006`, including onboarding storage `005` and onboarding commands `006`.
- Expected RPCs, tables, triggers, grants, function owners, stable `search_path` behavior and RLS policies relevant to onboarding.
- Anonymous access denied where expected and authenticated access subject to RLS through ordinary session clients.
- Auth schema assumptions needed by current code, including user confirmation, deletion and email/current-identity behavior.
- Pinned timezone/catalog behavior used by business profile validation.
- Supabase database/security/performance advisor findings reviewed or explicitly recorded as blockers.
- Backup/restore or rollback rehearsal evidence before release claims.

Do not blindly reapply migrations to a hosted database. Do not infer hosted migration success from PGlite, static source, package scripts, owner reports or a local browser pass.

## Local preview and browser prerequisites

Use installed dependencies from the repository root. Start a task-owned foreground local preview only after Morgan coordinates the candidate and confirms no shared preview will be disrupted.

Safe local checks for future runs:

```powershell
Test-Path 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:E2E_CHROMIUM_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:E2E_BASE_URL='http://127.0.0.1:3000'
```

If Chrome is absent, a later approved task may run:

```powershell
node node_modules/@playwright/test/cli.js install chromium
```

That command downloads browser binaries. Missing browser binaries are an environment prerequisite, not an application failure.

Development preview:

```powershell
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000
```

Local production-mode preview after a successful build:

```powershell
pnpm build
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
```

These are local previews, not deployments. If port `3000` is occupied, coordinate a different loopback port and matching `E2E_BASE_URL`. Do not kill unknown Node processes or reuse an unknown server. Prior Supabase Auth `EACCES` means the preview/test process needs approved outbound network access; never bypass Auth, TLS, RLS or membership checks to make a test pass.

## Future command shape

Anonymous-only onboarding browser run:

```powershell
$env:E2E_AUTHENTICATED='0'
node node_modules/@playwright/test/cli.js test tests/e2e/onboarding.spec.ts
```

Disposable authenticated onboarding browser run after all five private accounts, schema state and project mapping are confirmed:

```powershell
$env:E2E_AUTHENTICATED='1'
$env:E2E_CONFIGURED='1'
node node_modules/@playwright/test/cli.js test tests/e2e/onboarding.spec.ts
```

Potential direct JWT/PostgREST and rendered Server Action HTTP checks require separately assigned harnesses. They must use ordinary session credentials, synthetic data and no service-role ordinary request path. They must prove both permitted and denied behavior, including foreign/nonmember/demoted or removed membership cases, without logging JWTs, cookies, request bodies or private response payloads.

## Pass, skip and blocker interpretation

- Current onboarding browser spec has seven cases: one anonymous case, two owner/admin save-reload cases, three limited-role privacy cases and one permanently skipped oversize case.
- Anonymous-only expected result is `1 passed, 6 skipped`. This is a valid anonymous result only.
- Fully prepared disposable authenticated expected result is `6 passed, 1 skipped`. Any additional skip is missing coverage, even if the runner exits `0`.
- The oversize rendered Server Action case remains a known skip until a separate safe harness observes the real rendered action request, sends bounded synthetic excess bytes and proves safe UI/HTTP/log/no-mutation behavior.
- A failure is not automatically a blocker or a product defect; diagnose whether it is environment, credential/session, schema, browser, network, app behavior or test harness.
- Owner/admin contact changes are real writes in the disposable project. They require approved cleanup or restoration; they must not be hidden by resetting a hosted database.
- Static source tests, embedded SQL tests, local anonymous browser runs, owner-reported results and live JWT/PostgREST checks are separate evidence types.
- Exit `0` means the command completed according to its runner rules. It does not mean complete onboarding acceptance when skips or narrower evidence remain.

## Safe evidence rules

Allowed in evidence:

- Candidate/build identity, date, local runtime mode, browser executable/version, command name, exit code and per-case pass/skip/fail counts.
- Account labels such as `owner`, `admin`, `dispatcher`, `technician`, `viewer`, not private email/password/token values.
- Sanitized failure categories such as `missing role credential`, `schema object absent`, `auth network blocked`, `foreign access denied as expected` or `unexpected private control visible`.
- Redacted catalog/advisor summaries with object names when approved by task scope and no credentials or customer data.

Not allowed in evidence:

- Passwords, JWTs, cookies, session storage, raw tokens, Supabase secret keys, provider keys, private URLs, storageState files or copied request/response bodies.
- Screenshots, videos, traces, HTML reports, console/network logs or debug output for authenticated runs unless a later task explicitly authorizes a privacy-reviewed artifact.
- Real customer names, phone numbers, addresses, provider payloads or owner personal session data.
- SQL or commands that print private environment values.

Keep Playwright trace, screenshot and video capture disabled for authenticated runs unless Morgan and Quinn approve a privacy-reviewed artifact task. Keep `PLAYWRIGHT_NO_COPY_PROMPT` behavior intact.

## Current blockers

- Disposable five-role account credentials and tenant IDs are not available to this documentation task and must never be requested in chat.
- Hosted onboarding migrations `005` and `006`, RPC grants/owners/search path, RLS and advisor state still need exact authorized evidence before live claims.
- Actual rendered Server Action oversize/session/logging harness remains unimplemented and separate from global `1 MiB` framework configuration or parsed `131072` byte onboarding validation.
- Direct live Auth/JWT/PostgREST role, tenant, membership and RLS checks remain open.
- Genuine multi-connection concurrency and configuration lock behavior depend on CEV-ONBOARD-LOCK-60 and later runtime tasks.
- Invitations, public signup, token continuation, provider readiness, live calls/messages/bookings, hosted CI, restore rehearsal and production approval remain outside this checklist.

## Next safe action

CURRENT STEP: Environment readiness is documented, but no private disposable environment has been verified here.

WHY: Future browser/JWT/PostgREST/HTTP tests need confirmed fictional accounts, hosted schema state and safe evidence rules before they can run without leaking secrets or overstating readiness.

DO THIS: Morgan privately coordinates the disposable project, five confirmed role accounts, two fictional tenants, migration/advisor evidence and exact test ownership without sending secret values through chat.

SUCCESS LOOKS LIKE: Quinn and Phoenix can run assigned future tests with only private process-local secrets, record sanitized pass/skip/fail evidence and keep all live, hosted and production gates clearly separated.
