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
- [ ] 8.8 Implement isolated previous-version upgrade scenarios and rollback evidence, requiring human disposition for unavailable, destructive, or irreversible rollback.
- [x] 8.9 Route quick mode to required pack/install/public-smoke evidence, guarded mode to applicable metadata/upgrade/rollback checks, and full mode to configured platform and compatibility matrices without claiming omitted required checks passed.
- [ ] 8.10 Verify release drivers on Linux, macOS, and Windows, including paths with spaces, missing tools, unavailable registries, package scripts, cleanup after partial failure, and proof that no external publication occurred.

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
- [ ] 10.5 Run hosted Linux, macOS, and Windows matrices for portable references, atomic state, debug resume, UAT evidence, temporary release projects, clean installs, and CLI entry points.
- [x] 10.6 Run extension conformance and all contributed workflow-generation tests against every supported API-bearing OpenSpec version and a fresh official-upstream patch build.
- [ ] 10.7 Pack the companion release candidate, inspect its published file list and dependency metadata, install the actual candidate with the released core seam in a clean project, and exercise all five contributed workflows through installed host discovery.
- [ ] 10.8 After completing the independent-review remediation tasks in sections 11 and 12, rerun independent code review, adversarial security probes, requirement-to-scenario coverage verification, and final goal verification with every original and newly discovered blocking finding dispositioned.
- [ ] 10.9 Prepare the companion as a new minor version for private link or packed-artifact installation only after the v1 baseline is verified, all required matrices pass, migration guidance is complete, and the installed artifact passes conformance; defer package-registry publication.

## 11. Remediate Independent Review Findings

- [x] 11.1 Add RED adversarial tests proving archive cannot be satisfied by forged or stale `run.json` and `assurance.json`, then make the gate replay canonical events, validate reproducible projections, and fail closed on missing, corrupt, or divergent canonical state for every supported state version.
- [x] 11.2 Add a multi-process contention test in which every successful unique append survives exactly once, including a live writer exceeding the normal lease interval, then serialize event commits with bounded cross-process locking, safe live-owner/stale-lock handling, fencing, re-read-before-write, and post-commit event verification.
- [x] 11.3 Add symbolic-link, junction where supported, ancestor-replacement during commit, and cleanup probes for `.guardrails/`, then enforce race-safe containment for every generated-state read, write, migration, restoration, and deletion.
- [ ] 11.4 Add stale-resume tests that change requirements, scenarios, tasks, and cited repository evidence after readiness passes, make required readiness the version 2 default, and recompute current context and readiness before every execution or resume write.
- [x] 11.5 Persist current OpenSpec scenario coverage through canonical events, derive the real UAT queue from replayed scenarios plus findings, fail closed on unexplained empty required UAT, and invalidate affected dispositions after material changes.
- [x] 11.6 Wire material-revision invalidation into production `run` and `check` for repaired or verified findings and UAT evidence, including controlling OpenSpec digests and the exact cited repository-evidence digests.
- [x] 11.7 Add production recording operations for distinct debug conclusion, root-cause, changed-reference, unresolved-question, next-action, independent-verification, and resolution events; require conclusions to cite observations; and make active, unresolved, or human-needed blocking debug sessions archive obligations.
- [ ] 11.8 Derive changed files and release surfaces from both workspace and committed branch changes in production, honor configured surfaces and required platforms, and route metadata, compatibility, mode, prior-artifact, rollback, and repository-policy evaluation through the actual CLI orchestration.
- [ ] 11.9 Replace implicit package build/import execution with a capability-backed constrained release-runner contract: allowlisted environment, secret-safe bounded output, no original source access, out-of-process public smoke, explicit lifecycle-script authorization, enforced filesystem/network bounds, and `human_needed` when required isolation is unavailable.
- [ ] 11.10 Strengthen installed extension/plugin checks and upgrade/rollback scenarios to verify actual host discovery, project- or driver-declared state, and public behavior rather than installation success or verifier-created sentinels alone.
- [x] 11.11 Replace destructive version 1 restoration over canonical version 2 history with a separate compatibility export or restore target, preserving readable version 2 events and adding migration/downgrade regression tests.
- [x] 11.12 Derive Tier 0 changed files deterministically from uncommitted and committed branch work, report explicit base-selection unknowns when impact cannot be established, include cited evidence digests in context revisions, and pass negotiated Tier 1/Tier 2 repository-analysis adapters through the runner.
- [x] 11.13 Repair the active core branch upstream-survivability command to test only the maintained generic seam, exclude regenerated lockfile noise, use the proven three-way application strategy, and verify it against current official upstream.
- [ ] 11.14 Correct the assurance capability test map to reference only existing tests and semantically established scenario coverage, add automated consistency checks, and record the unavailable historical fail-first commit evidence as `human_needed` without reconstructing or fabricating RED evidence.
- [ ] 11.15 Run build, type-check, lint, full tests, conformance, canonical replay, lease-expiry contention, ancestor-replacement, staleness, UAT, debug independence, constrained-release escape, downgrade, actual-candidate clean-install, and upstream-survivability regression suites before requesting the independent re-review in task 10.8.

## 12. Remediate Independent Re-Review Findings

- [x] 12.1 Add a reproducible failing version 1 projection-forgery probe, then require canonical replay and projection equality for every supported legacy archive path without trusting passing projections as fallback state.
- [x] 12.2 Add a fault-injection test that holds a live writer beyond the lease interval while another writer contends, then implement lease renewal, owner-liveness handling, and fencing so no lost event can be reported as successfully appended.
- [x] 12.3 Add deterministic ancestor-swap and junction-cleanup race probes around generated-state commit and deletion, then bind mutations to validated ancestors with descriptor-relative or equivalently race-safe platform operations so no external target is touched before rejection.
- [x] 12.4 Persist exact cited repository-evidence digests on finding and UAT lifecycle records and invalidate affected verified, accepted, or awaiting-retest states through production `run`, `check`, and resume paths when those contents change.
- [x] 12.5 Add clean-feature-branch tests with committed changes relative to configured, upstream, and merge-base comparisons, then make unresolved base selection an explicit blocking unknown rather than an empty impact set or `not_applicable` release result.
- [x] 12.6 Require a distinct authorized verifier actor, current digest-bound regression evidence, and a verified linked finding or equivalent check before debug resolution; expose production operations and CLI/adapter recording paths for changed-reference, unresolved-question, next-action, verifier-confirmation, and resolution events.
- [x] 12.7 Wire independent verification of a failed-UAT finding to return the original scenario to awaiting-retest, and make required UAT with no projected scenario or explicit non-applicability record a gate-blocking projection error.
- [ ] 12.8 Add adversarial release-runner probes for reading unrelated host secrets, mutating the source workspace, reaching localhost or external networks, and persisting arbitrary secret-bearing output; require an enforceable filesystem/network capability or return `human_needed` before candidate code executes.
- [ ] 12.9 Replace synthetic upgrade sentinels with driver- or project-declared state contracts and test actual state plus public behavior across previous-version upgrade and rollback, escalating unavailable or irreversible evidence for human disposition.
- [ ] 12.10 Pack the actual companion release candidate, inspect its files and dependency metadata, install it with the supported core seam in a clean project, and prove all five contributed workflows are discovered and executable from the installed artifact.
- [ ] 12.11 Correct the assurance test map against the re-review probes and add semantic assertions for the claimed concurrency, containment, staleness, retest, constrained-runner, upgrade-state, and installed-workflow evidence while retaining historical RED provenance as `human_needed`.
- [ ] 12.12 Run every re-review adversarial probe plus the complete companion, core-seam, conformance, migration, upstream-survivability, and local release-install suites; record exact evidence and leave hosted cross-platform or historical fail-first gaps unresolved rather than claiming coverage.
