# Decision log

| ID | Date | Decision | Reason and consequence |
| --- | --- | --- | --- |
| D001 | 2026-10-02 | Next.js App Router, strict TypeScript, React, Tailwind, Zod, Supabase, Vercel | Owner-selected stack; managed auth and database isolation |
| D002 | 2026-10-02 | Standalone .codex/agents/*.toml with name/description/developer_instructions | Current official Codex custom-agent format; inherit model and permissions |
| D003 | 2026-10-02 | Path-selected workspace, explicit membership check plus RLS | Tenant identifiers and client forms are untrusted |
| D004 | 2026-10-02 | Technicians/viewers read-only tenant CRM in M1 | Conservative write restrictions; job assignment scopes require M3 schema |
| D005 | 2026-10-02 | Trusted membership provisioning; no public signup/self-elevation | Protect tenant membership and roles |
| D006 | 2026-10-02 | Initial build uses disjoint file ownership | No Git base commit exists for isolated worktrees; use worktrees after baseline |
| D007 | 2026-10-02 | No demo auth bypass and no service role in request code | Fictional seed must still exercise real authenticated isolation |
| D008 | 2026-10-02 | Live voice integrations postponed to M4 | Build secure CRM first; preserve provider-independent contracts |
| D009 | 2026-10-02 | Provide supported CLI role adapter | Current runtime has no named-agent selector; all seven native instruction layers verified without claiming automatic tool registration |
| D010 | 2026-10-02 | Execute actual SQL in embedded PostgreSQL | Docker/CLI/psql absent; PGlite verifies migration/RLS with Auth compatibility fixture; live Supabase checks remain required |
| D011 | 2026-10-02 | Restrict direct UPDATE to business fields | Quality identified tenant/identity reassignment risk; immutable identity/parent regression assertions now pass |
| D012 | 2026-10-02 | Pin installed pnpm 11.19.0 and supported allowBuilds map | Reproducible lockfile/CI; authorize only required esbuild/unrs-resolver build scripts |


2026-10-02: Owner chose assigned-only job visibility for technicians (CEV-M3-01). Office roles manage tenant dispatch; tenant viewers remain read-only. Existing M1 CRM visibility is unchanged. Jobs visibility is enforced by verified assignment and current tenant technician membership, including direct database requests.

2026-10-02: D013 — Owner authorized Morgan to lead autonomous completion with specialist support, routine reversible decisions, verification before dependent stages, and owner involvement only for material decisions/access/production approval. CEV-AUTO-16 records scope and stage gates.
2026-10-02: D014 — Owner confirmed existing Twilio account, Retell AI, and a working Make.com system. Preserve working scenarios; adapt Cevanta to existing boundaries after read-only discovery. No business registration, live endpoint change, external message/call, spend, or production release is inferred as completed.

## 2026-10-03 — M5 first workflow

Decision: The first estimates/follow-up release will support internal office-managed estimate drafts plus manual follow-up only.

Boundaries:
- No external estimate sending.
- No customer acceptance, e-signature, payment, financing, or legal terms.
- No automated SMS/email reminders.
- No tax automation or revenue recovery claim.
- Implementation must still record currency/tax/amount rules as explicit blockers unless separately decided.

Rationale: This gives office staff a useful internal workflow while avoiding unapproved commercial, legal, provider, and messaging commitments.

2026-10-03: D015 — M5 first implementation will be non-monetary internal scope drafts and manual office follow-up. Owner/admin/dispatcher are the initial office roles; technician/viewer/anonymous/removed/demoted users have no draft/follow-up access. Drafts require a customer anchor, may optionally link same-customer job/location, and have one active date-only follow-up with no assignee. Prices, totals, tax, sending, acceptance, reminders, payment, financing and revenue recovery remain blocked for later explicit decisions and reviews.

2026-10-03: D016 — Cevanta must deliver a complete guided client journey: backend-connected dashboard, in-app onboarding, readiness checks, role isolation, desktop/mobile usability and approved-scope modules. This is required but not complete. First onboarding implementation path will use invitation-based first access; public self-serve tenant creation remains deferred until separately approved.
