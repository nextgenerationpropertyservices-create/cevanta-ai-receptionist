# Disposable onboarding browser prerequisites — CEV-ONBOARD-LIVE-PREREQ-55

Runbook only; no live test or provisioning authorized by its creation. Morgan/Quinn must confirm a disposable development environment and synthetic identities before authenticated execution. Never request credentials in chat, print values, borrow the owner's session or store credentials/tokens in repository files.

## Environment and test records

Use a separate disposable development database with reviewed foundation through onboarding storage005 and commands006 actually installed and available to session-authorized requests. Embedded SQL success does not establish that hosted migrations exist. A trusted operator must confirm exact schema/state under a separately assigned setup task; never blindly reapply migrations, change an existing user's membership or use service-role ordinary requests.

Create five separate fictional, confirmed Auth accounts with exactly one intended role each in the same fictional tenant: owner, admin, dispatcher, technician, viewer. They need working passwords and current enabled membership under existing schema semantics; do not invent an enabled column. Owner/admin need an existing valid business name/trade/IANA timezone so contact-only tests can retain authority. Start with no real contacts/customer/provider data. Arrange an approved restoration/cleanup of synthetic contact changes; the tests do not undo them. Concurrent writers must be absent.

Provision a second fictional foreign tenant with known synthetic records and no membership for these five users if testing foundation foreign-denial cases. Onboarding spec itself does not use the foreign variable or prove cross-tenant/direct API denial. Its anonymous case hardcodes fictional tenant10000000-0000-4000-8000-000000000001; authenticated cases use E2E_TENANT_ID. Do not repurpose production/demo resources holding needed data.

| Variable | Exact requirement |
| --- | --- |
| E2E_BASE_URL | Approved loopback preview; defaults http://127.0.0.1:3000; no arbitrary hosted callback URL |
| E2E_CHROMIUM_PATH | Installed Chrome executable override; otherwise matching Playwright Chromium required |
| E2E_AUTHENTICATED | Set1 only after private synthetic session prerequisites confirmed;0 for anonymous-only |
| E2E_CONFIGURED | Set1 for configured app when running foundation/all suites; onboarding spec does not read this switch |
| E2E_EMAIL / E2E_PASSWORD | Disposable owner account |
| E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD | Disposable admin account |
| E2E_DISPATCHER_EMAIL / E2E_DISPATCHER_PASSWORD | Disposable dispatcher account |
| E2E_TECHNICIAN_EMAIL / E2E_TECHNICIAN_PASSWORD | Disposable technician account |
| E2E_VIEWER_EMAIL / E2E_VIEWER_PASSWORD | Disposable viewer account |
| E2E_TENANT_ID | Same fictional tenant with intended role memberships |
| E2E_FOREIGN_TENANT_ID | Required by foundation owner case only; inaccessible fictional tenant |

Application environment uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for that disposable project. The trusted operator injects values privately into the preview process; E2E variables belong in the separate test process. Confirm project match privately without emitting values. Next may load existing ignored local configuration; halt if it points to a different or nondisposable project. This runbook grants no environment-file edit. Keep provider opt-ins off and do not invoke invitation delivery/new-account/continuation or external writers. No credentials needed for an anonymous local preview.

## Browser and preview lifecycle (PowerShell)

From repository root with installed frozen dependencies:

```powershell
Test-Path 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:E2E_CHROMIUM_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:E2E_BASE_URL='http://127.0.0.1:3000'
```

If Chrome absent, use an approved browser-install step: `node node_modules/@playwright/test/cli.js install chromium`, then remove E2E_CHROMIUM_PATH so Playwright uses its matching bundled browser. Installation downloads browser binaries; do not misdiagnose missing executable as app/security failure. No install is performed by this task.

Coordinate with Morgan before starting or building. Use a task-owned foreground terminal; do not kill another preview, remove its lock or run build over an active private dev session. Start either development mode:

```powershell
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000
```

Or a local production-mode preview after current build completes:

```powershell
pnpm build
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
```

Both are local previews, not deployments or production authorization. Wait for Ready. If port occupied, coordinate another approved loopback port and matching E2E_BASE_URL/Auth-origin configuration; do not silently reuse unknown server. Supabase outbound Auth network access must work under approved process permissions; page loading alone does not prove it. Prior sandbox EACCES requires approved network access, not disabled TLS/Auth/RLS. Do not echo framework/client bodies or private environment values while diagnosing.

In a second terminal, with private values already injected (no assignment lines containing credentials), run anonymous-only:

```powershell
$env:E2E_AUTHENTICATED='0'
node node_modules/@playwright/test/cli.js test tests/e2e/onboarding.spec.ts
```

After all five disposable accounts and project/schema are confirmed, run authenticated suite:

```powershell
$env:E2E_AUTHENTICATED='1'
$env:E2E_CONFIGURED='1'
node node_modules/@playwright/test/cli.js test tests/e2e/onboarding.spec.ts
```

Stop the exact task-owned preview terminal with Ctrl-C after test completion, including failures. Confirm terminal/process ended and task port no longer listening; `Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue` should return no listener when no other approved server owns it. Interrupted server exit1 is intentional cleanup, not browser failure. If cleanup/network permissions fail, report blocker and use managed termination of that owned session only; do not kill all Node processes. No unattended process-tree guarantee claimed.

Close private test terminal after results or remove E2E account/password/tenant variables from process memory by name using Remove-Item Env:NAME (not values); terminate child processes before clearing preview variables. Cleanup/restoration of fictional data remains an approved separate step; never reset a hosted database.

## Result interpretation and evidence

- Seven onboarding cases: one anonymous, owner and admin save/reload, three limited-role cases, one permanently skipped oversize case. With no credentials expected1 pass/6 skips. With all five working disposable accounts expected6 passes/1 skip; any further skip is missing coverage. Exit0 with skips is runner success only. A failure is not accepted or reclassified as missing coverage without diagnosis.
- Owner/admin cases persist a unique fictional optional contact and reload equality, then show pending readiness. Limited-role cases await the actual approved role heading before proving no forms/private contacts and check390x844 overflow. They do not prove all fields/steps/full first access, direct RLS, cross-tenant reads/writes, accessibility or all desktop sizes. Anonymous mobile result tests the destination/sign-in page, not authenticated Setup.
- Oversized-action case always skips regardless of credentials. Separate Quinn-owned harness must observe real rendered action reference/request, generate bounded synthetic excess bytes, verify safe HTTP/UI/log behavior and independently no mutation. Client field rejection, global1MiB config or onboarding128KiB parsed limit alone do not close HTTP gate. No guessed action IDs or unauthorized endpoints.
- Keep Playwright config trace/screenshot/video off and PLAYWRIGHT_NO_COPY_PROMPT page-text opt-out; do not override, enable debug/network/console payload capture, HTML/private attachments or storageState. Auth failures must remain sanitized and boolean-only. No tokens/cookies/passwords/emails/private IDs/contacts/URLs in evidence; fictional values also must not be mistaken for real accounts.
- Record candidate/build identity, date, local runtime mode, browser executable/version, command, exit code, per-case counts/names and sanitized failure categories. Keep runtime/log evidence distinct from static tests, embedded SQL, owner reports and genuine hosted JWT evidence. Do not copy full framework logs or reports without privacy review.

## Open blockers and next action

Private disposable role sessions/project mapping and actual005/006 schema not verified by this task; pending SETUP52/53/STATUS54 reviews may change UI expectations. Auth network permissions/browser binaries/candidate preview must be confirmed. Actual oversized-action harness, two-tenant direct JWT checks, retries/conflicts, genuine multi-connection concurrency, hosted CI/restore, staging/provider/readiness/delivery/new-account/continuation and production remain open. Morgan verifies pending reviews and assigns Quinn an explicit disposable browser run plus separate transport-harness ownership; no credential request or hosted mutation follows from this document.
