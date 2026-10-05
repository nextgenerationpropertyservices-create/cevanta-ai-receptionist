# Agent handoff

- Task ID: CEV-MAKE-18; Echo workflow research, 2026-10-03.
- Work completed: Read task18, collaboration, status and original build mission. Verified current official Make subscenario/input/output documentation. Proposed smallest deterministic simulated lead stub and documented activation limitation.
- Files changed: Only docs/project/handoffs/CEV-MAKE-18-echo.md.
- Database changes: None; no records written.
- API or contract changes: None; proposal below awaits Atlas approval.
- Verification commands and results: Required records read successfully; official Make documentation opened successfully. No browser inspection/mutation or execution by Echo. Application checks not required by this documentation-only task and NOT RUN. No runtime acceptance evidence.
- Known limitations: The actual account UI/module entitlement and saved draft must be verified by Morgan. An inactive stub cannot be called as a ready subscenario according to current documented prerequisites. This task prohibits activation/runs, so it can deliver a saved draft only.
- Risks: Returning a plausible lead ID could fool downstream actions into treating simulation as persistence. An on-demand scenario can still be invoked through supported authenticated systems when active; absence of public webhook is not complete access control. Do not expose as AI/MCP tool or wire an operational parent during this task.
- Rollback notes: Remove only the separately identified new stub draft and this handoff if needed. Preserve parent/old workflows and blockers. No external side effects to undo.
- Exact next action: Atlas approves minimal contract; Morgan creates separate inactive Start scenario → Return output stub and inspects all modules/mappings. Quinn reviews graph and saved state before a later separately authorized isolated execution task.

## Supported minimal graph

Use the Scenarios app: Start scenario → Return output. Inputs/outputs are configured in the scenario builder. Literal output values and mapped input can be set in Return output, so a Tools module is optional, not necessary. Do not use Custom webhook, HTTP, datastore, CRM, calendar, email, SMS, Make Run a scenario or another nested scenario. [Make scenario inputs/outputs](https://help.make.com/scenario-inputs-and-outputs), [subscenario setup](https://help.make.com/subscenarios).

Use one Return output. Make maps the declared output fields there; when multiple return modules exist, the first reached ends the scenario. [Make outputs](https://help.make.com/use-scenario-outputs). Define required typed inputs in the inputs/outputs panel. Make validates input structure against the specification. [Make input/output structure](https://help.make.com/create-the-structure-of-scenario-inputs-or-outputs).

Current Make documentation requires active, on-demand subscenarios for calls from a parent. Save this draft inactive; on-demand schedule can be configured without enabling activation. Do not treat inability to call it while inactive as a reason to activate under this task. Later synchronous Call a scenario may be used only in an isolated reviewed harness; task18 does not permit parent edits. Same-team call restrictions apply. [Make subscenario prerequisites](https://help.make.com/subscenarios).

## Minimal proposed contract

Name: Cevanta Lead Stub — SIMULATION ONLY — CEV-MAKE-18.

Input: correlation_id, required Text. Accept only fictional IDs in an isolated future harness, for example fixture_lead_001; no customer/contact fields, credentials, tenant identifiers or API URLs. A required Text type does not itself validate the fixture-only restriction. Atlas/Quinn must approve any additional filter or validation before later execution.

Outputs:

| Field | Type | Mapping |
| --- | --- | --- |
| correlation_id | Text | Exact input correlation_id |
| status | Text | Literal simulated |
| simulated | Boolean | Literal true |
| persisted | Boolean | Literal false |
| simulated_lead_reference | Text | Literal prefix sim_ followed by mapped correlation_id |

Same fictional input produces same output; no clock/random state or durable store. This is deterministic simulation, not idempotent real persistence or existence checking. Never return status created/success or a real-shaped database UUID. Do not name the reference lead_id unless an approved parent contract explicitly preserves its simulated provenance. No duplicate_created flag because no creation occurred. Downstream must block external actions when simulated=true or persisted=false; parent blockers remain unchanged here.

Suggested static future example: correlation_id fixture_lead_001 returns simulated_lead_reference sim_fixture_lead_001, status simulated, simulated true, persisted false. Values are fictional and contain no personal information. No test executed.

## Date gate stays separate

Lead stub takes no appointment dates. Keep appointment input as raw text until explicit offset/timezone and strict format are checked; missing/ambiguous timezone, malformed/impossible date, past start, end before start and unapproved duration must reject. Never derive a date/time from call summary or silently substitute current time/default timezone. Runtime parsing permissiveness, DST and exact allowed durations require Atlas's date contract and later isolated tests; this research does not approve a Make date expression or calendar write.

## Future verification gates

Inspect saved graph contains only the two allowed modules, literal simulation markers and input mapping; inspect no connections, webhook, external writer or nested workflow; confirm inactive state and parent remains blocked. In a later authorized isolated harness, compare repeated identical fictional input outputs and distinct correlation IDs, missing/wrong-type IDs, forbidden personal content, simulation-marker preservation and downstream refusal to treat stub as persisted lead. Date validation tests are separate. Saving module configuration is not runtime proof.
