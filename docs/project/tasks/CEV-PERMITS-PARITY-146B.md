# CEV-PERMITS-PARITY-146B — Standalone workflow parity

Owner: Morgan. Status: source received and inventoried. Depends on the Cevanta PermitDesk review branch and the standalone v12 export. Allowed files for this slice: this task brief only. Architecture review assigns implementation paths before code changes.

## Acceptance and evidence

| Area | Required behavior |
| --- | --- |
| Operations dashboard | Seven workflow lanes, open permits, due/expiry and correction alerts, approval timing, first inspection results, upcoming milestones and work readiness |
| Intake and records | Standalone and job-linked permits, record filters, templates, parcel and work details, photo checklist, timeline and CSV export |
| AHJ and filing | Editable tenant-scoped jurisdiction matrix, official source links, filing packets and credential references, editable unsigned Winchendon PDF, manual filing and submission tracking |
| Utility and inspections | Load worksheet and reviewer notes, disconnect/reconnect and meter spot tracking, inspection preparation and outcomes, corrections and closeout |
| Documents | Tenant-scoped uploads and references, authorized downloads, size limits, and revision conflict protection |
| Pilot administration | Internal-only contractor access, pause, expiry and end pilot, private feedback and quote permission, access and progress summaries |

Use Cevanta authentication, membership and workspace entitlement for every protected interaction. Preserve existing bundled and PermitDesk-only access behavior. Map the standalone D1 and R2 behavior to Cevanta data and storage instead of copying the Sites identity bridge. Retain the standalone deployment and live records. Municipal and utility filings remain manual.

Required review: Atlas on data and storage contracts, Quinn on tenant isolation and feature behavior, release QA on signed-in staging. Verify through lint, typecheck, tests, build, fictional PDF and attachment checks, and independent signed-in staging sessions.
Morgan owns the first read-only board slice in src/app/workspaces/[tenantId]/permits/page.tsx. It depends on existing permit status and workspace guards. Verify grouping, follow-up visibility, lint and typecheck. Utility and inspection lanes require their persisted workflows in a later slice.
Operations slice owner Morgan. Allowed paths: new 20261114010647_permitdesk_operations.sql, permit-contracts.ts, permits action and queue/detail pages, and permitdesk-db.test.ts. Atlas parity architecture applies. Acceptance: persist utility and inspection details with existing tenant and revision checks; derive stages from saved records.
Morgan owns closeout changes to the operations migration, permit-contracts.ts, permits action, permit-fields.tsx and permitdesk-db.test.ts. Existing closed records are preserved. Direct writes must enforce passed inspection, reference and date for new closeouts.

Closeout evidence: typecheck, lint and embedded PermitDesk database test passed. Within the authenticated fixture, closing before a passed inspection was rejected and closing with a passed inspection, final reference and date succeeded. Closeout remains local and requires staging migration and verification.
Morgan owns operations field expansion in the operations migration, permit-contracts.ts and permit detail and board pages. Templates, documents and pilot slices have disjoint worker ownership.
Morgan integration paths also include permits/new/page.tsx for template selection, workspace-shell.tsx for pilot navigation, and the onboarding route audit for the protected documents and operator pages. Dedicated library, documents, and pilot slices own migrations 10648 through 10650 and their respective actions, pages, and tests.
