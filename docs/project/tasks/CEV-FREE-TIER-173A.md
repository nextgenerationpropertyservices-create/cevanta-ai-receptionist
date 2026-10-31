# CEV-FREE-TIER-173A — Free tier architecture contract

- Status: assigned
- Owner: Atlas (`architect_data`)
- Scope: Define the tenant-safe plan model, server-enforced free limits, upgrade boundaries, compatibility strategy, migration/recovery plan, and contracts consumed by backend and UI.
- Dependencies: Existing tenant, membership, provisioning, CRM, calendar, technician, billing, and automation-control contracts.
- Allowed files:
  - `docs/architecture/FREE_TIER_CONTRACT.md`
  - `docs/project/handoffs/CEV-FREE-TIER-173A-atlas.md`
- Acceptance criteria:
  - Defines `free`, `dashboard_plus`, and `managed_receptionist` plan identifiers without claiming payment state.
  - Defines secure server/database enforcement for free limits: 50 active leads and 2 technician roster entries.
  - Preserves existing paid/client workspaces by assigning a backward-compatible default.
  - Defines which existing features remain usable on free and which are visible but locked behind an upgrade explanation.
  - No provider action, live booking, SMS/email, payment, calendar write, or dispatch automation is enabled.
  - Includes migration, rollback/forward-repair, tenant isolation, and test requirements.
- Reviewers: Morgan; Quinn required before acceptance of security-sensitive implementation.
- Required evidence: inspected current schema/actions, documented compatibility decision, handoff using the project template.

