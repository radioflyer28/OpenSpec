## 1. Establish the Versioned Baseline and Test Map

- [x] 1.1 Complete and verify the locally installable Guardrails v1 baseline, record the OpenSpec fork prerelease and companion commit or packed-artifact identity, and preserve representative version 1 `events.json`, `run.json`, and `assurance.json` fixtures.
- [x] 1.2 Map every scenario in the six delta specs to a planned unit, integration, conformance, cross-platform, or human-contract test before production implementation begins.
- [x] 1.3 Add failing tests proving current version 1 behavior cannot represent readiness results, finding transitions, debug sessions, scenario-level UAT, or release artifact evidence without the new schema.
- [x] 1.4 Define feature configuration and rollout defaults for readiness report-only migration, repository analysis, automatic debug transition, conversational UAT, and release-assurance drivers.

## 2. Introduce Guardrails State Version 2

- [x] 2.1 Add version 2 schemas for repository context, readiness issues and results, finding lifecycle records, debug sessions, UAT scenarios, release candidates, and their evidence references.
- [x] 2.2 Add version 2 event payloads and actors for compilation, evaluation, finding transitions, debugging observations, UAT decisions, release checks, staleness, and human dispositions.
- [x] 2.3 Add an explicit constant registry for every Guardrails-owned generated file and report path, using portable record identities and Node path APIs at filesystem boundaries.
- [x] 2.4 Extend deterministic event replay to project all version 2 state into `run.json`, `assurance.json`, status output, and replaceable reports without introducing another authoritative store.
- [x] 2.5 Implement an idempotent version 1-to-version 2 migration that preserves provenance, does not fabricate verification or scenario acceptance, and fails closed on corrupt or ambiguous records.
- [x] 2.6 Add migration-preview and recovery diagnostics that retain valid version 1 files until the version 2 event store and projections validate successfully.
- [x] 2.7 Add RED–GREEN–REFACTOR tests for migration idempotence, event ordering, duplicate event handling, projection replay, atomic writes, corrupt input, and Windows/macOS/Linux path behavior.

## 3. Compile Repository Pattern and Impact Context

- [x] 3.1 Add failing repository-context tests covering implementation analogs, affected modules, test conventions, architectural boundaries, downstream consumers, conflicting patterns, and explicit unknowns.
- [x] 3.2 Implement deterministic collection of configured boundaries, known manifest names and fields, module relationships, test locations, changed files, public entry points, and OpenSpec references.
- [x] 3.3 Define a read-only repository-analysis contract whose structured claims cite evidence and distinguish observed facts, inferences, conflicts, and unknowns.
- [x] 3.4 Implement Tier 0 recording and Tier 1/Tier 2 adapter paths that produce the same repository-context schema without requiring agent dispatch or Git.
- [x] 3.5 Feed current repository context into execution-graph compilation while routing discovered scope gaps back to readiness instead of mutating OpenSpec artifacts.
- [x] 3.6 Invalidate only affected context entries when cited repository or OpenSpec evidence changes, and report stale or unavailable references explicitly.
- [x] 3.7 Verify repository-context generation and portable evidence references against representative repositories on Linux, macOS, and Windows.

## 4. Add Independent Pre-Execution Plan Readiness

- [x] 4.1 Add failing readiness tests for uncovered requirements, unmapped scenarios, insufficient verification, dependency cycles, unsafe write-set overlap, missing prerequisites, risky assumptions, and omitted compatibility obligations.
- [x] 4.2 Implement goal-to-requirement-to-scenario-to-task-to-evidence coverage evaluation using stable OpenSpec identifiers.
- [x] 4.3 Implement deterministic dependency, execution-wave, write-set, and prerequisite checks using compiled tasks and repository context.
- [x] 4.4 Define and implement the read-only independent readiness evaluator contract for assumptions, architectural plausibility, public-contract obligations, and evidence sufficiency.
- [x] 4.5 Add structured readiness issue identity, severity, blocking status, evidence, remediation, and current-input revision tracking.
- [x] 4.6 Insert readiness before implementation writes in every mode, support the migration-only report-first rollout, and fail closed when a required independent result is unavailable.
- [x] 4.7 Reconcile stale readiness results after material task, design, specification, or cited repository changes and expose next remediation through `check` and `run-status`.
- [x] 4.8 Verify that executor self-report cannot satisfy readiness and that Tier 0 sequential evaluation enforces the same result contract as isolated agents.

## 5. Implement Stable Finding Lifecycle and Review Convergence

- [x] 5.1 Add failing tests for stable finding reconciliation, logically distinct similar findings, lifecycle transition authorization, stale verification, accepted risk, and archive blocking.
- [x] 5.2 Implement namespaced finding identities from provider identity, rule or category, and logical requirement, scenario, task, contract, symbol, or portable-location scope without using summary wording as identity.
- [x] 5.3 Implement append-only transitions from `open` to `repaired`, `independently_verified`, `accepted_risk`, or `human_needed`, preserving actor, reason, evidence, source revisions, and prior state.
- [x] 5.4 Reconcile repeated checker reports with existing findings and keep omitted findings unresolved until an authorized disposition is recorded.
- [x] 5.5 Link repair evidence to findings without treating executor repair claims as verification, then require a read-only verifier transition for technical closure.
- [x] 5.6 Mark repair and verification stale after relevant source or OpenSpec changes and return the finding to the appropriate blocking state.
- [x] 5.7 Require explicit human actor, reason, scope, timestamp, and optional expiry or follow-up for accepted risk and human-needed dispositions.
- [x] 5.8 Update assurance evaluation, status, reports, event replay, and `guardrails.assurance` so unresolved blocking findings fail closed while non-blocking warnings follow project policy.

## 6. Add Persistent Scientific Debugging

- [x] 6.1 Add failing tests for repair-exhaustion transition, session reuse, hypothesis state, experiment observations, repeated unchanged experiments, resume, and regression-proof enforcement.
- [x] 6.2 Implement one active debug-session identity per logical failure with links to originating findings, tasks, requirements, scenarios, checks, and preserved failed evidence.
- [x] 6.3 Implement hypothesis, experiment, observation, conclusion, unresolved-question, changed-reference, and next-action events with deterministic projection and resume.
- [x] 6.4 Implement experiment fingerprints from hypothesis, action identity, targeted evidence, and relevant revisions, rejecting repeated unsuccessful experiments unless evidence or human rationale changes.
- [x] 6.5 Route debug mutations through existing executor write-set and Git opt-in policies while keeping analysis, review, and verification roles read-only.
- [x] 6.6 Require a relevant fail-before/pass-after regression check for resolved behavior defects or a recorded independently accepted non-applicable exemption.
- [x] 6.7 Transition exhausted repairs automatically into a resumable session and stop with `human_needed` when no safe experiment or required capability is available.
- [x] 6.8 Add `openspec-guardrails debug` and `/opsx:debug <change> [--finding <id>]`, including Tier 0 structured recording, status summaries, and workflow-generation tests.

## 7. Add Conversational UAT

- [x] 7.1 Add failing tests for scenario ordering, resume, explicit human identity, passed, failed, blocked, accepted-limitation, stale evidence, and archive-gate behavior.
- [x] 7.2 Project applicable human scenarios from OpenSpec coverage and human-needed findings with prerequisites, action instructions, expected observable result, and stable scenario identity.
- [x] 7.3 Implement one-scenario-at-a-time presentation and append-only human dispositions for interactive hosts and Tier 0 structured CLI recording.
- [x] 7.4 Record project-relative or stable external evidence references with digests, preserving dispositions when attachments are unavailable on another platform.
- [x] 7.5 Convert failed scenarios into stable blocking findings linked to the requirement, task, observation, and evidence, then return independently verified repairs to awaiting-retest.
- [x] 7.6 Map accepted limitations to explicit accepted-risk dispositions without representing them as specified behavior that passed.
- [x] 7.7 Invalidate scenario acceptance after material requirement or implementation changes and keep failed, blocked, awaiting-retest, or undispositioned scenarios gate-blocking.
- [x] 7.8 Add `openspec-guardrails uat` and `/opsx:uat <change>`, including resume behavior, unresolved-action output, manifest contribution, and workflow-generation tests.

## 8. Add Conditional Distribution and Install Assurance

- [x] 8.1 Add failing applicability tests for Node packages, CLIs, packaged extensions or plugins, configured distributions, non-release changes, explicit enablement, and explicit disablement with recorded reason.
- [x] 8.2 Implement an explicit registry of supported manifest names and parsed release fields plus a driver contract that reports activation evidence and supported checks.
- [x] 8.3 Implement disposable build, pack, content inspection, dependency-metadata inspection, artifact digest, and clean-install primitives that never publish or mutate remote registries.
- [x] 8.4 Implement the Node package and CLI driver, verifying packed files, declared exports, binary entry points, dependency compatibility, installation instructions, and installed smoke behavior.
- [x] 8.5 Implement packaged extension or plugin verification through manifest conformance, clean installation, generated workflow discovery, and public entry-point smoke tests.
- [x] 8.6 Implement a configured-command driver for other public distributions with explicit commands, expected artifacts, isolated working state, timeouts, and structured evidence.
- [x] 8.7 Implement repository-policy checks for versioning, compatibility ranges, release notes or changesets, and documented installation commands.
- [x] 8.8 Implement isolated previous-version upgrade scenarios and rollback evidence, requiring human disposition for unavailable, destructive, or irreversible rollback.
- [x] 8.9 Route quick mode to required pack/install/public-smoke evidence, guarded mode to applicable metadata/upgrade/rollback checks, and full mode to configured platform and compatibility matrices without claiming omitted required checks passed.
- [x] 8.10 Supersede the hosted Linux/macOS/Windows matrix with the private macOS qualification in task 15.2. Linux and Windows qualification are future work and are not archive blockers or support claims for this increment.

## 9. Integrate Workflows, Configuration, Status, and Gates

- [x] 9.1 Extend project and change configuration schemas with bounded, documented controls for repository analysis, readiness rollout, debug transition, UAT, release surfaces, drivers, and required platform matrices.
- [x] 9.2 Update `run`, `check`, and `run-status` orchestration to follow the designed pipeline and report readiness, context freshness, finding states, debug sessions, UAT scenarios, release applicability, and next actions.
- [x] 9.3 Update the extension manifest and generated workflow instructions for `run`, `check`, `run-status`, `debug`, and `uat` without requiring new OpenSpec core contribution types.
- [x] 9.4 Update the single `guardrails.assurance` provider to summarize all subordinate obligations and preserve durable archive blocking when routing, configuration, or extension enablement changes.
- [x] 9.5 Update package exports, CLI help, JSON output, README, maintenance guide, compatibility contract, and upgrade guidance for state version 2 and the new workflows.
- [x] 9.6 Add source-of-truth tests proving generated analysis and operational records reference but never rewrite, reproduce, or supersede OpenSpec proposal, specs, design, and tasks.
- [x] 9.7 Add exclusion tests and documentation confirming this increment adds no deferred Little Coder mechanisms, additional specialist-checker backlog, phases, milestones, roadmaps, workstreams, or persistent GSD project state.

## 10. Verify Convergence, Portability, and Release Readiness

- [x] 10.1 Run companion build, type-check, lint, full unit suite, event replay, migration, readiness, context, finding, debug, UAT, release, status, and gate tests.
- [x] 10.2 Run end-to-end Tier 0 scenarios from incomplete plan through readiness remediation, execution, failed review, repair exhaustion, debugging, regression proof, independent verification, UAT, release assurance, and archive.
- [x] 10.3 Run Tier 1 and Tier 2 adapter tests proving isolated or parallel execution changes scheduling but not schemas, lifecycle authorization, evidence requirements, or gate outcomes.
- [x] 10.4 Run the version 1 fixture migration and downgrade-safety matrix, including interruption, replay repair, corrupt records, stale evidence, and restoration of the previous companion version.
- [x] 10.5 Replace the hosted multi-platform completion requirement with the macOS qualification in task 15.2 while retaining portable identities as a design constraint. Defer hosted Linux and Windows evidence to a future OpenSpec change.
- [x] 10.6 Run extension conformance and all contributed workflow-generation tests against every supported API-bearing OpenSpec version and a fresh official-upstream patch build.
- [x] 10.7 Pack the companion release candidate, inspect its published file list and dependency metadata, install the actual candidate with the released core seam in a clean project, and exercise all five contributed workflows through installed host discovery.
- [ ] 10.8 After tasks 15.1 and 15.2 pass, run one bounded independent code, accepted-security-boundary, maintainability, requirement-to-scenario, and final-goal acceptance review. The review may block only for a reproducible violation of a current requirement within the frozen threat model with an observable impact; record speculative hardening, new features, full-GSD administration, and unqualified-host concerns as future work rather than reopening this increment.
- [ ] 10.9 After task 10.8 passes, privately link or install the verified OpenSpec GSD companion in the user's macOS environment, run extension doctor and installed-interface diagnostics, and smoke all five contributed workflows plus the `gsd.assurance` archive gate. Do not publish to a package registry.

## 11. Remediate Independent Review Findings

Completed tasks 2.5-2.7, 8.8, 10.4, 11.2-11.3, 11.9-11.11, 12.2-12.3, 12.6, and 12.8-12.9 record historical implementation and review work. Section 13 supersedes their multi-writer, hostile-filesystem, permanent downgrade, caller-selected authority, generalized upgrade/rollback, and Guardrails-built isolation mechanisms wherever they conflict with the accepted assurance boundary.

- [x] 11.1 Add RED adversarial tests proving archive cannot be satisfied by forged or stale `run.json` and `assurance.json`, then make the gate replay canonical events, validate reproducible projections, and fail closed on missing, corrupt, or divergent canonical state for every supported state version.
- [x] 11.2 Add a multi-process contention test in which every successful unique append survives exactly once, including a live writer exceeding the normal lease interval, then serialize event commits with bounded cross-process locking, safe live-owner/stale-lock handling, fencing, re-read-before-write, and post-commit event verification.
- [x] 11.3 Add symbolic-link, junction where supported, ancestor-replacement during commit, and cleanup probes for `.guardrails/`, then enforce race-safe containment for every generated-state read, write, migration, restoration, and deletion.
- [x] 11.4 Add stale-resume tests that change requirements, scenarios, tasks, and cited repository evidence after readiness passes, make required readiness the version 2 default, and recompute current context and readiness before every execution or resume write.
- [x] 11.5 Persist current OpenSpec scenario coverage through canonical events, derive the real UAT queue from replayed scenarios plus findings, fail closed on unexplained empty required UAT, and invalidate affected dispositions after material changes.
- [x] 11.6 Wire material-revision invalidation into production `run` and `check` for repaired or verified findings and UAT evidence, including controlling OpenSpec digests and the exact cited repository-evidence digests.
- [x] 11.7 Add production recording operations for distinct debug conclusion, root-cause, changed-reference, unresolved-question, next-action, independent-verification, and resolution events; require conclusions to cite observations; and make active, unresolved, or human-needed blocking debug sessions archive obligations.
- [x] 11.8 Derive changed files and release surfaces from both workspace and committed branch changes in production, honor configured surfaces and required platforms, and route metadata, compatibility, mode, prior-artifact, rollback, and repository-policy evaluation through the actual CLI orchestration.
- [x] 11.9 Replace implicit package build/import execution with a capability-backed constrained release-runner contract: allowlisted environment, secret-safe bounded output, no original source access, out-of-process public smoke, explicit lifecycle-script authorization, enforced filesystem/network bounds, and `human_needed` when required isolation is unavailable.
- [x] 11.10 Strengthen installed extension/plugin checks and upgrade/rollback scenarios to verify actual host discovery, project- or driver-declared state, and public behavior rather than installation success or verifier-created sentinels alone.
- [x] 11.11 Replace destructive version 1 restoration over canonical version 2 history with a separate compatibility export or restore target, preserving readable version 2 events and adding migration/downgrade regression tests.
- [x] 11.12 Derive Tier 0 changed files deterministically from uncommitted and committed branch work, report explicit base-selection unknowns when impact cannot be established, include cited evidence digests in context revisions, and pass negotiated Tier 1/Tier 2 repository-analysis adapters through the runner.
- [x] 11.13 Repair the active core branch upstream-survivability command to test only the maintained generic seam, exclude regenerated lockfile noise, use the proven three-way application strategy, and verify it against current official upstream.
- [x] 11.14 Correct the assurance capability test map to reference only existing tests and semantically established scenario coverage, add automated consistency checks, and record the unavailable historical fail-first commit evidence as `human_needed` without reconstructing or fabricating RED evidence.
- [x] 11.15 Run build, type-check, lint, full tests, conformance, canonical replay, lease-expiry contention, ancestor-replacement, staleness, UAT, debug independence, constrained-release escape, downgrade, actual-candidate clean-install, and upstream-survivability regression suites before requesting the independent re-review in task 10.8.

## 12. Remediate Independent Re-Review Findings

- [x] 12.1 Add a reproducible failing version 1 projection-forgery probe, then require canonical replay and projection equality for every supported legacy archive path without trusting passing projections as fallback state.
- [x] 12.2 Add a fault-injection test that holds a live writer beyond the lease interval while another writer contends, then implement lease renewal, owner-liveness handling, and fencing so no lost event can be reported as successfully appended.
- [x] 12.3 Add deterministic ancestor-swap and junction-cleanup race probes around generated-state commit and deletion, then bind mutations to validated ancestors with descriptor-relative or equivalently race-safe platform operations so no external target is touched before rejection.
- [x] 12.4 Persist exact cited repository-evidence digests on finding and UAT lifecycle records and invalidate affected verified, accepted, or awaiting-retest states through production `run`, `check`, and resume paths when those contents change.
- [x] 12.5 Add clean-feature-branch tests with committed changes relative to configured, upstream, and merge-base comparisons, then make unresolved base selection an explicit blocking unknown rather than an empty impact set or `not_applicable` release result.
- [x] 12.6 Require a distinct authorized verifier actor, current digest-bound regression evidence, and a verified linked finding or equivalent check before debug resolution; expose production operations and CLI/adapter recording paths for changed-reference, unresolved-question, next-action, verifier-confirmation, and resolution events.
- [x] 12.7 Wire independent verification of a failed-UAT finding to return the original scenario to awaiting-retest, and make required UAT with no projected scenario or explicit non-applicability record a gate-blocking projection error.
- [x] 12.8 Add adversarial release-runner probes for reading unrelated host secrets, mutating the source workspace, reaching localhost or external networks, and persisting arbitrary secret-bearing output; require an enforceable filesystem/network capability or return `human_needed` before candidate code executes.
- [x] 12.9 Replace synthetic upgrade sentinels with driver- or project-declared state contracts and test actual state plus public behavior across previous-version upgrade and rollback, escalating unavailable or irreversible evidence for human disposition.
- [x] 12.10 Pack the actual companion release candidate, inspect its files and dependency metadata, install it with the supported core seam in a clean project, and prove all five contributed workflows are discovered and executable from the installed artifact.
- [x] 12.11 Correct the assurance test map against the re-review probes and add semantic assertions for the claimed concurrency, containment, staleness, retest, constrained-runner, upgrade-state, and installed-workflow evidence while retaining historical RED provenance as `human_needed`.
- [x] 12.12 Run every re-review adversarial probe plus the complete companion, core-seam, conformance, migration, upstream-survivability, and local release-install suites; record exact evidence and leave hosted cross-platform or historical fail-first gaps unresolved rather than claiming coverage.

## 13. De-complexify the Assurance Architecture

- [x] 13.1 Inventory actual active version 1 generated state and private consumers of compatibility exports, per-domain reports, configuration fields, and broad package exports; record which require one-time conversion and which can be deleted.
- [x] 13.2 Add RED tests proving roles cannot write canonical state, caller timestamps cannot reorder accepted events, and higher tiers return structured results; route all canonical writes through one orchestrator and remove event-level leases, heartbeat, PID liveness, stale-lock stealing, quarantine, fencing, and direct role writes.
- [x] 13.3 Retain explicit generated-path registration, change-root containment, existing symbolic-link and junction rejection, unique temporary writes, and atomic replacement; remove subprocess ancestor-identity writers, hostile swap handling, and lock-lifecycle path machinery while preserving portable Linux, macOS, and Windows behavior.
- [x] 13.4 Collapse the unpublished schema and runtime paths, remove permanent version 1 compatibility and downgrade exports, eliminate redundant per-domain report projections, and consolidate duplicated version 1 and version 2 modules without introducing version 3; retain a one-time importer only if task 13.1 finds real active version 1 evidence.
- [x] 13.5 Add RED status tests for forged, stale, missing, and corrupt projections; factor canonical load, validation, replay, and projection comparison into one read-only path shared by gate, check, status, and projection regeneration.
- [x] 13.6 Add RED provenance and debugging tests; make the orchestrator assign privileged workflow roles, remove caller selection of verifier and human actor kinds, bind resolution to existing RED and GREEN evidence for the same check and subject at current revisions, and require distinct verifier-stage or explicit-human actions.
- [x] 13.7 Add RED configured-surface precedence tests for packages, CLIs, extensions or plugins, and generic distributions; implement disablement, then enabled configuration, then discovery precedence and trim release assurance to private packing, inspection, clean installation, metadata, public entry points, and host discovery.
- [x] 13.8 Remove generic upgrade and rollback state contracts, previous-artifact machinery, Guardrails-provided filesystem and network isolation claims, and adversarial sandbox tests; retain temporary workspaces, minimal environment, redaction, argument-vector execution, disabled lifecycle scripts, no-publication behavior, and host-capability escalation.
- [x] 13.9 Narrow public exports and configuration, remove incidental tests, update CLI help, README, compatibility guidance, maintenance documentation, capability maps, and generated-file registries, and preserve outcome-focused Tier 0, Tier 1, Tier 2, gate, readiness, finding, debug, UAT, install, and core-boundary tests.
- [x] 13.10 Run build, type-check, lint, full companion tests, conformance, core-seam tests, installed private-artifact verification, upstream-survivability checks, and available Linux, macOS, and Windows tests; record exact evidence and leave unavailable hosted evidence unresolved.
- [x] 13.11 Consolidate the duplicate final-review obligation into the single bounded acceptance review in task 10.8; no separate unconstrained review cycle is required.

## 14. Remediate Independent Final Review Findings

- [x] 14.1 Add failing ordinary-caller probes for caller-selected reviewer and verifier provenance, then remove privileged stage selection from generic CLI and result APIs and accept technical verification only through an orchestrator-dispatched role-result channel.
- [x] 14.2 Add a structured reviewer finding-result contract that derives stable identity from provider, rule, and logical scope, reconciles reruns without caller-selected canonical IDs, and preserves existing lifecycle transitions.
- [x] 14.3 Add failing backdated RED and caller-authored source-state probes, then validate RED-before-repair and GREEN-after-repair using canonical event order and bind GREEN to the orchestrator-derived current material revision.
- [x] 14.4 Add a production run/check regression that changes source or cited evidence after debug resolution, then mark the verification stale, reopen the session, and require new GREEN evidence plus a new verifier-stage confirmation.
- [x] 14.5 Add run-status projection-tampering tests and make JSON and human output report an explicit blocking integrity error without presenting the run or assurance as complete or passing.
- [x] 14.6 Preserve and merge release-applicability and unresolved comparison-base checks through candidate execution so a successful artifact check cannot erase prior `human_needed` evidence.
- [x] 14.7 Replace the release compatibility range shortcut with standards-compliant semver evaluation, fail closed on invalid ranges, and cover caret, tilde, comparator, prerelease, incompatible-major, and malformed inputs.
- [x] 14.8 Run focused defect probes, full companion verification, conformance, installed-artifact checks, core seam tests, strict OpenSpec validation, and upstream survivability; record exact results and leave final independent acceptance review to task 10.8.

## 15. Rename and Qualify OpenSpec GSD for Private macOS Use

- [x] 15.1 Rename all current external companion surfaces from the Guardrails working name to product **OpenSpec GSD**, package and CLI `openspec-gsd`, extension ID `gsd`, archive gate `gsd.assurance`, configuration `openspec/gsd.json`, and generated execution-record directory `.openspec-gsd/`; retain `/opsx:*` workflow names. Update implementation, manifests, schemas, fixtures, tests, help, and documentation without introducing compatibility aliases for the private unpublished identity.
- [x] 15.2 Add or update tests proving OpenSpec artifacts remain the sole human-maintained planning truth, generated execution records reference rather than reproduce OpenSpec content, no GSD project-management artifacts or complete-runtime dependency are introduced, and no registry publication occurs. Run build, type-check, lint, full companion tests, core-seam and extension conformance tests, strict OpenSpec validation, upstream-survivability checks, and packed clean-install qualification on macOS; exercise all five contributed workflows and `gsd.assurance` from the installed artifact.

## Completion-Boundary Revision Evidence — 2026-08-14

- Product identity is OpenSpec GSD. GSD supplies selected skill and harness ideas only; OpenSpec proposal, specifications, design, and tasks remain the sole human-maintained planning and development-tracking truth.
- `.openspec-gsd/` is limited to machine-generated execution evidence needed to execute, resume, and verify work. It is not a GSD planning hierarchy or parallel source of scope.
- Hosted Linux and Windows qualification was removed from this private-use increment. Task 15.2 is the sole platform qualification obligation and targets macOS.
- Tasks 10.8, 10.9, 15.1, and 15.2 form the complete remaining finish line. Task 10.8 is one bounded acceptance review, not an open-ended hardening cycle.

## OpenSpec GSD Rename and macOS Qualification Evidence — 2026-08-14

- RED: `test/product-identity.test.ts` initially failed two of three tests because the package still identified as `openspec-guardrails` and the `.openspec-gsd/` path API did not exist.
- Companion commit `075c3ca` renames the product, package/CLI, exported APIs, manifest ID, gate, configuration, execution-record path, workflows, tests, and current documentation without old-name aliases. A repository and built-output scan found no remaining Guardrails identity in current companion surfaces.
- Companion lint and type-check passed. The full suite passed 36 files and 144 tests, including source-of-truth, exclusion, cross-repository archive, private pack/clean-install, five installed workflows, and `gsd.assurance` coverage. Extension conformance passed 4 tests.
- OpenSpec commit `c9e45ee` aligns the maintained fork prerelease to `1.8.0-gsd.1` and updates only fork-identity documentation and generic seam fixtures. Core build, type-check, and lint passed; 9 extension/archive files passed 269 tests; the seam budget reported no violations.
- Strict validation passed. Upstream survivability passed against official revision `2826b8889e5223a9a8095d4428b60b56597e1020`; the generic seam applied in a disposable worktree and all 8 verification files passed 61 tests.
- Qualification ran on macOS and made no Linux or Windows support claim. No package-registry publication or complete GSD runtime installation occurred.

## De-complexity Audit Evidence — 2026-08-13

- Audit target: OpenSpec `3d1b9eb665148bb2b30141a12cd4d901b448ab50` and companion `bccb4501a48f04b01063077f26d89e57377ad899`.
- Independent verdict: `OVERBUILT`; the assurance workflow remains valuable, while multi-writer state, hostile-local-filesystem defenses, permanent intermediate-schema compatibility, and release sandbox machinery exceed the accepted boundary.
- Audit-time companion type-check and lint passed; all 159 companion tests passed after sandbox-dependent release tests were rerun with local cache and loopback access.
- Audit-time OpenSpec extension-seam suites passed 43 tests and the seam-budget check passed.
- No implementation remediation is represented as complete by this audit; section 13 remains required.

## Independent Final Review Evidence — 2026-08-14

- Review targets: OpenSpec `381422646c3f0d7dca4b7a2e29a2e4dccf15d5f3` and companion `eaa94988f4315c568fd518e917396368e2bd5718`.
- Independent verdict: `BLOCK`; the architectural de-complexification was accepted, while seven assurance defects remained in provenance, canonical regression chronology, debug staleness, status integrity, release-impact preservation, stable reviewer finding identity, and semver compatibility evaluation.
- The review independently passed the companion suites, core seam tests, strict change validation, and upstream-survivability check, and reproduced five defect scenarios with disposable probes.
- At review time, hosted Linux and Windows matrices were tracked by tasks 8.10 and 10.5 and tasks 10.8 and 13.11 were incomplete. The later completion-boundary revision supersedes the hosted matrices and consolidates the review obligation into task 10.8.

## Independent Final Review Remediation Evidence — 2026-08-14

- Companion `72f9fa9bb8a3ca609a8d51b7414845aa7e36e962` derives reviewer finding IDs from structured provider/rule/category/scope reports and accepts reviewer/verifier mutations only through process-local opaque receipts created by read-only orchestrator dispatches. Generic CLI/API role selection and direct technical finding/debug closure are rejected.
- Focused provenance and debug probes passed, including forged receipt and caller-selected role rejection, stable finding identity across reruns, canonical RED-before-repair/GREEN-after-repair ordering despite conflicting caller timestamps, orchestrator-derived repository revisions, and automatic reopening after post-verification source changes.
- Companion `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed: 35 test files and 141 tests, including the private packed-candidate clean-install and five-workflow discovery suites. `pnpm conformance` passed 4 tests.
- OpenSpec build, type-check, and lint passed. The core seam and survivability unit suite passed 9 files and 64 tests; the extension seam budget reported no violations.
- `openspec validate add-guardrails-assurance-capabilities --strict` passed.
- Upstream survivability passed against official revision `2826b8889e5223a9a8095d4428b60b56597e1020`; the allowlisted generic seam applied in a disposable upstream worktree and all 8 seam files passed (61 tests).
- The remediation left tasks 10.8 and 13.11 open at that time. The later completion-boundary revision consolidates them into the single bounded acceptance review in task 10.8.

## De-complexity Implementation Evidence — 2026-08-13

- Task 13.1 inventory searched repositories beneath `/Users/akriz/code` while excluding dependency and Git metadata trees; no active `.guardrails/events.json`, `run.json`, or `assurance.json` state was found.
- No private source consumer imports the companion package API. Compatibility exports, downgrade state, per-domain reports, generalized release state contracts, and isolation fields are referenced only by companion source, tests, and documentation.
- No one-time version 1 importer is required for active state. Intermediate local state may be regenerated with explicit human reconfirmation where applicable.
- Companion commits `888fb25`, `40e8929`, `344f4d7`, `ae0b9be`, `7b81e82`, and `eaa9498` implement the single-writer boundary, portable generated-path handling, one canonical history with two projections, orchestrator-owned provenance and debug closure, private install assurance, and the narrowed supported API and documentation.
- The package root no longer exports raw event append, replay, projection-write, or filesystem-state helpers. Tier 1 and Tier 2 adapters return structured outcomes without mutating canonical state.
- Release configuration no longer contains generic drivers, prior-artifact state contracts, upgrade or rollback protocols, or claimed Guardrails filesystem and network isolation. Operational safeguards remain explicitly documented as non-sandbox controls.

## De-complexity Verification Evidence — 2026-08-13

- Companion `eaa94988f4315c568fd518e917396368e2bd5718`: `npm run build`, `npm run typecheck`, and `npm run lint` passed on macOS.
- Companion `npm test`: 33 test files passed; 128 tests passed, including Tier 0 end-to-end execution, Tier 1 and Tier 2 structured outcomes, canonical replay and projection integrity, readiness, finding/debug/UAT lifecycles, private pack and clean install, installed five-workflow discovery, archive gating, and the public package boundary.
- Companion `npm run conformance`: 1 test file passed; 4 tests passed.
- OpenSpec `pnpm run build`, `pnpm exec tsc --noEmit`, and `pnpm run lint` passed.
- Core seam suite: 9 test files passed; 64 tests passed. `pnpm run check:extension-seam` passed with no budget violations.
- `openspec validate add-guardrails-assurance-capabilities --strict` passed.
- `pnpm run check:upstream-survivability` passed against official upstream revision `2826b8889e5223a9a8095d4428b60b56597e1020`; all 8 upstream-worktree seam files passed (61 tests).
- Hosted Linux and Windows verification was unavailable in this session. The later completion-boundary revision removes it from this private-use increment; no cross-platform result or support claim is inferred from the macOS evidence.

## Local Verification Evidence — 2026-08-13

- Companion candidate: commits `d993f1a`, `1eab098`, and `bccb450` on `codex/harden-guardrails-maintainability`.
- `npm run build`, `npm run typecheck`, and `npm run lint`: passed in `openspec-guardrails`.
- `npm test`: 38 test files passed; 159 tests passed. This complete suite includes canonical replay, live-lease contention, ancestor-replacement containment, readiness staleness, finding/UAT lifecycle, independent debug closure, constrained-runner probes, v1 migration and compatibility export, actual packed-candidate installation, and five-workflow host discovery.
- `npm run conformance`: 1 test file passed; 4 conformance tests passed.
- OpenSpec core `pnpm run build`, `pnpm exec tsc --noEmit`, and `pnpm run lint`: passed.
- Core seam and survivability unit suite: 9 test files passed; 64 tests passed, covering extension lifecycle, manifests, lockfiles, workflows, gates, archive enforcement, and the survivability script.
- `pnpm run check:extension-seam`: passed with no budget violations.
- `openspec validate add-guardrails-assurance-capabilities --strict`: passed.
- `pnpm run check:upstream-survivability`: passed against official upstream revision `2826b8889e5223a9a8095d4428b60b56597e1020`; the maintained patch applied with the three-way strategy and all 8 upstream-worktree seam files passed (61 tests).
- At the time of this evidence, hosted platform matrices, historical fail-first provenance, de-complexification review, and private version preparation remained unresolved. The later completion-boundary revision supersedes the hosted matrices, retains the historical provenance honestly, and defines tasks 10.8, 10.9, 15.1, and 15.2 as the complete remaining work.

## Bounded Acceptance Review Remediation Evidence — 2026-08-14

- The task 10.8 reviewer reported four reproducible blockers: readiness adapters could remove deterministic mapping failures, production planning did not derive explicit unsupported assumptions, repository analyzers could erase deterministic unknown impact evidence at Tier 0, and a shell-wrapped configured command could dispatch `npm publish` and record a pass.
- RED: the four focused files initially ran 47 tests with six failures covering the four reproductions plus their production-run paths. No publication command executed; the release probe used a capture-only runner and demonstrated that dispatch occurred before remediation.
- Companion commit `c220ba8` makes deterministic readiness issues and repository unknown/conflict evidence immutable lower bounds, invokes planning adapters only after negotiated Tier 1 or Tier 2 dispatch, ignores them at Tier 0, and derives assumptions from current OpenSpec `## Assumptions` sections. Unsupported assumptions block readiness; an explicit evidence, validation-task, verification-task, or human-disposition annotation resolves the assumption.
- Companion commit `3e2adef` rejects configured distribution commands that use shells, interpreters, indirect execution wrappers, package-manager script dispatch, or direct or nested publication operations before invoking the host release runner. Explicitly authorized private build commands retain their separate existing path and remain subject to direct publication rejection.
- GREEN: companion lint and type-check passed. The focused remediation suite passed 4 files and 48 tests. The complete companion suite passed 36 files and 151 tests, including the packed-candidate clean-install and five installed workflows; extension conformance passed 4 tests.
- OpenSpec core build, type-check, and lint passed. Ten extension, archive, and survivability test files passed 272 tests; the extension-seam budget reported no violations. Strict validation passed.
- Upstream survivability passed against official revision `2826b8889e5223a9a8095d4428b60b56597e1020`; the generic seam applied in a disposable upstream worktree and all 8 seam files passed 61 tests.
- Task 10.8 remains open pending a targeted independent re-review of companion commits `c220ba8` and `3e2adef`. Task 10.9 remains dependency-blocked until that review passes.
