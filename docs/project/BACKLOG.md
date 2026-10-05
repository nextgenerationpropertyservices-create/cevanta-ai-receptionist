# Prioritized backlog

| Priority | ID | Owner | Work | Dependencies | Status |
| --- | --- | --- | --- | --- | --- |
| P0 | CEV-JOURNEY-GAP-37 | Morgan + all specialists | Full guided dashboard/onboarding journey gap audit and acceptance plan | Owner-confirmed product outcome | Accepted with limitations |
| P0 | CEV-ONBOARD-38 | Atlas/Blake/Nova/Quinn | Guided onboarding contracts: invitation-first access, setup data, progress and readiness states | CEV-JOURNEY-GAP-37 | Accepted with limitations |
| P0 | CEV-ONBOARD-CLARIFY-42 | Atlas/Blake/Quinn | Clarify guided onboarding contracts before implementation | CEV-ONBOARD-38 reviews | Accepted with limitations |
| P0 | CEV-ONBOARD-FINALIZE-43 | Atlas/Blake | Final onboarding contract correction before implementation | CEV-ONBOARD-CLARIFY-42 reviews | Accepted with limitations |
| P0 | CEV-ONBOARD-SCHEMA-44 | Atlas | Additive onboarding schema/shared contracts | CEV-ONBOARD-FINALIZE-43 | Accepted with limitations |
| P0 | CEV-ONBOARD-TESTS-45 | Quinn/Morgan recovery | Permanent onboarding storage and validation checks | CEV-ONBOARD-SCHEMA-44 | Accepted with limitations |
| P0 | CEV-ONBOARD-RPC-46 | Atlas; Blake/Quinn review | Guarded onboarding database commands and read projections | CEV-ONBOARD-SCHEMA-44; CEV-ONBOARD-TESTS-45 | Accepted with limitations |
| P0 | CEV-ONBOARD-COMMAND-TESTS-47 | Morgan | Permanent onboarding command SQL check registration | CEV-ONBOARD-RPC-46 | Accepted with limitations |
| P0 | CEV-ONBOARD-BACKEND-48 | Blake; Quinn review | Authenticated onboarding server actions and result decoding | CEV-ONBOARD-RPC-46; CEV-ONBOARD-COMMAND-TESTS-47 | Accepted with limitations |
| P0 | CEV-ONBOARD-TRANSPORT-49 | Phoenix; Quinn review | Server Action transport/body-limit and safe error verification | CEV-ONBOARD-BACKEND-48 | Accepted with limitations |
| P0 | CEV-ONBOARD-UI-50 | Nova; Quinn review | First guided onboarding UI consumer | CEV-ONBOARD-BACKEND-48; CEV-ONBOARD-TRANSPORT-49 | Accepted with limitations |
| P0 | CEV-ONBOARD-BROWSER-51 | Quinn | Rendered onboarding browser and HTTP verification | CEV-ONBOARD-UI-50 | Accepted with limitations |
| P0 | CEV-ONBOARD-SETUP-52 | Nova; Quinn review | Guided onboarding services and weekly hours UI | CEV-ONBOARD-UI-50; CEV-ONBOARD-BROWSER-51 | Accepted with limitations |
| P0 | CEV-ONBOARD-SETUP-53 | Nova; Quinn review | Guided onboarding booking preferences and escalation contacts UI | CEV-ONBOARD-SETUP-52 | Accepted with limitations |
| P0 | CEV-ONBOARD-STATUS-54 | Nova; Quinn review | Guided onboarding status and readiness shell | CEV-ONBOARD-SETUP-53 | Accepted with limitations |
| P0 | CEV-ONBOARD-LIVE-PREREQ-55 | Phoenix | Onboarding live/browser verification prerequisites | CEV-ONBOARD-BROWSER-51; SETUP52/53; STATUS54 | Accepted with limitations |
| P0 | CEV-ONBOARD-GAP-56 | Atlas | Onboarding integration gap review after storage editors | CEV-ONBOARD-SCHEMA-44 through SETUP53; STATUS54 | Accepted with limitations |
| P0 | CEV-ONBOARD-BACKEND-GAP-57 | Blake | Onboarding backend next-slice plan | CEV-ONBOARD-BACKEND-48; UI50; SETUP52/53; STATUS54 | Accepted with limitations |
| P0 | CEV-ONBOARD-VOICE-GAP-58 | Echo | Voice/provider readiness alignment after onboarding storage | SETUP53; STATUS54 | Accepted with limitations |
| P0 | CEV-ONBOARD-ENV-59 | Phoenix | Disposable environment prerequisite inventory for onboarding runtime evidence | 55; 56; 57; 54 | Accepted with limitations |
| P0 | CEV-ONBOARD-LOCK-60 | Atlas | Onboarding configuration lock and concurrency contract | 56; 57; accepted RPC/backend evidence | Accepted with limitations |
| P0 | CEV-ONBOARD-SETTINGS-65A | Blake; Quinn review | Backend-only settings alignment with onboarding lock semantics | BACKEND48; SETUP53; STATUS54; LOCK60 | Accepted with limitations |
| P0 | CEV-ONBOARD-SETTINGS-65B | Nova; Quinn review | Settings UI wiring to onboarding lock semantics | SETTINGS65A; LOCK60 | Accepted with limitations |
| P0 | CEV-ONBOARD-SETTINGS-65C | Blake; Quinn review | Retire or safely block legacy direct Settings writer | SETTINGS65A; SETTINGS65B | Accepted with limitations |
| P0 | CEV-ONBOARD-RESUME-66A | Nova; Quinn review | Persisted onboarding resume UI | BACKEND48; UI50; STATUS54; LOCK60 | Accepted with limitations |
| P0 | CEV-ONBOARD-EXCEPTIONS-67A | Nova; Quinn review | Date-specific hours exception UI | BACKEND48; SETUP52; STATUS54; LOCK60 | Accepted with limitations |
| P0 | CEV-ONBOARD-HISTORY-68A | Atlas | Retained onboarding history and bounded projection contract | 56; 60; 65A/B/C; 66A; 67A | Accepted with limitations |
| P0 | CEV-ONBOARD-HISTORY-68B | Blake; Atlas/Quinn review | Bounded backend onboarding setup projection | 60; 67A; 68A | Accepted with limitations |
| P0 | CEV-ONBOARD-HISTORY-68C | Atlas | Owner history and re-enable API contract | 68A; 68B | Accepted with limitations |
| P0 | CEV-ONBOARD-HISTORY-68D | Blake; Atlas/Quinn review | Backend owner history and re-enable APIs | 68B; 68C | Accepted with limitations |
| P0 | CEV-PILOT-INTAKE-69A | Morgan | First-client intake package | HISTORY68D; business docs | Accepted with limitations |
| P0 | CEV-PILOT-DEMO-69B | Morgan | First-client local demo script and walkthrough checklist | 69A; onboarding accepted slices | Accepted with limitations |
| P0 | CEV-MAKE-DRYRUN-69C | Morgan | Make and Retell fictional dry-run checklist | 69A; 69B; Retell planning docs | Accepted with limitations |
| P0 | CEV-PILOT-SALES-69D | Morgan | First-client managed-pilot sales readiness packet | 69A; 69B; 69C | Accepted with limitations |
| P0 | CEV-PILOT-EVIDENCE-69E | Morgan | First-client evidence tracker and go/no-go checklist | 69A; 69B; 69C; 69D | Accepted with limitations |
| P0 | CEV-DASHBOARD-39 | Nova/Blake/Quinn | Connected dashboard journey verification across customers, leads, jobs, scheduling, M5 approved scope, reporting shell and role isolation | CEV-JOURNEY-GAP-37; module contracts | Planned |
| P1 | CEV-AI-ACTIVITY-40 | Echo/Blake/Nova/Quinn/Phoenix | AI receptionist activity and tracked handoff dashboard within no-writer/provider-approved gates | Retell/Make trust and hosted gates | Planned |
| P1 | CEV-REPORTING-41 | Product/Backend/Frontend/Quality | Reporting definitions and backend-connected reporting dashboard without unapproved revenue claims | M5/M6 definitions | Planned |
| P0 | CEV-M1-01 | Product Manager | Team, records, scaffold and acceptance | None | Implemented; live acceptance open |
| P0 | CEV-M1-02 | Architect | Tenant schema, RLS, seed, shared contracts | 01 | Reviewed; embedded SQL passes |
| P0 | CEV-M1-03 | Backend | Auth, membership, protected reads/writes | 02 contracts | Reviewed; live Auth pending |
| P0 | CEV-M1-04 | Frontend | Sign-in, workspace, customer/location/equipment/settings UI | 02/03 contracts | Reviewed; live workflow pending |
| P0 | CEV-M1-05 | Quality | Security, roles, SQL isolation and E2E review | 02/03/04 | Review complete; runtime gates open |
| P0 | CEV-M1-06 | DevOps | CI, setup, health, deployment/rollback review | 01/03 | Reviewed; hosted CI not run |
| P1 | CEV-M1-07 | Voice | Provider-independent contract and security requirements | 02 | Abstract contract reviewed |
| P0 | CEV-M1-08 | Architect | Final shared/voice/test-harness review | 02/03/04/07 | Approved source review |
| P0 | CEV-VERIFY-02 | Quality | Diagnose Windows Playwright shutdown; obtain clean runner exit | 05 | Open |
| P0 | CEV-VERIFY-01 | Quality | Run local/live Supabase RLS and authenticated E2E | Configured test environment | Pending |
| P1 | CEV-M2-01 | Backend/Frontend/Quality | Leads/service requests with duplicate protection | Foundation contracts; M1 live gates open | Implemented; hosted migration/acceptance pending |
| P1 | CEV-M3-01 | Frontend/Backend/Quality | Dispatch/jobs, assigned-only technician scope | M2 | Implemented/reviewed; hosted acceptance open |
| P1 | CEV-M3-02 | Architect/Frontend/Quality | Internal UTC job appointments/calendar | M3 jobs | Implemented/reviewed; hosted acceptance open |
| P1 | CEV-M4-01 | Voice | Signed tenant-mapped call outcomes, idempotency, handoffs | M3 | Not started |
| P2 | CEV-M5-01 | Backend | Estimates and follow-up | M4 | Not started |
| P2 | CEV-M6-01 | Product/Backend | Revenue recovery definitions and reporting | M5 | Not started |
| P1 | CEV-AUTH-02 | Backend | Password recovery and invitations | M1 | Not started |
| P0 | CEV-AUTH-RESET-70A | Morgan | Supabase local password recovery redirect configuration | Owner reset-link blocker | Accepted with limitations |
| P0 | CEV-AUTH-PROXY-70B | Morgan | Public auth pages avoid hosted Auth proxy stall | Owner reset rendering blocker | Accepted with limitations |
| P0 | CEV-AUTH-RECOVERY-70C | Morgan | Recovery callback accepts Supabase token and PKCE code formats | Owner reset-link blocker | Accepted with limitations |
| P0 | CEV-AUTH-MEMBER-70D | Morgan | Existing Auth user demo owner membership | Supabase invite rate limit | Accepted with limitations |
| P0 | CEV-BACKEND-BROWSER-70E | Morgan | Owner browser backend flow smoke | Authenticated demo owner access | Accepted with limitations |
| P2 | CEV-CRM-02 | Frontend/Backend/Quality | Customer editing and contact create/edit | M1 | Implemented/reviewed; live persistence open |
| P0 | CEV-OPS-08 | Phoenix | Browser artifact and operations readiness review | Integrated application | Assigned; named chat blocked by usage limit |
| P1 | CEV-BIZ-09 | Morgan | Comprehensive business Markdown blueprint | Requirements/current evidence | Documentation accepted |
| P0 | CEV-RELEASE-07 | Morgan and named specialists | Full-scope integration and acceptance | All milestones/access/decisions | Open;310 tests/four SQL/build pass, full product gates unmet |

Detailed M1 scopes, file ownership and required evidence appear in docs/project/tasks. Review findings become explicit tasks; no hidden scope expansion.


































