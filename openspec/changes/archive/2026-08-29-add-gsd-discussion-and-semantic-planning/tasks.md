## 1. Freeze the Baseline and Scenario Map

- [x] 1.1 Record the current OpenSpec fork and `openspec-gsd` companion revisions, current five-workflow manifest, canonical event/projection versions, and representative private macOS installation fixtures.
- [x] 1.2 Map every scenario in `gsd-discussion`, `gsd-behavioral-semantics`, `gsd-plan`, and `gsd-execution` to a unit, integration, workflow-generation, Tier adapter, gate, or macOS/Pi acceptance test.
- [x] 1.3 Add RED contract tests proving the current package lacks `discuss`, `plan`, `do`, and `status`, cannot classify complete requirement bodies, cannot record semantic revision-bound plan approval, cannot preserve planner instructions through an executor-wrapper/apply delegation, cannot route planning or intent findings, and cannot re-enter planning after blocking review or verification findings.
- [x] 1.4 Add exclusion tests proving the increment introduces no FRET/PVS runtime dependency, parallel planning artifact, phase/milestone state, persistent discussion transcript, OpenSpec core API change, `GapPlanV1`, repair-plan schema, repair-specific planner prompt, duplicate executor, duplicate task queue, separate completion model, copied apply loop, weaker gap approval path, or additional loop-state store.

## 2. Compile Risk-Proportional Behavioral Semantics

- [x] 2.1 Add failing parser tests for full requirement and scenario bodies, multiline controlled-language requirements, labeled behavior blocks, requirement identifiers, malformed headings, and portable relative paths.
- [x] 2.2 Extend artifact compilation to preserve full requirement/scenario structure and revision evidence without duplicating authoritative prose in generated records.
- [x] 2.3 Add versioned `SemanticClassificationV1` schemas for `simple`, `behavioral`, and `modeling` levels with rationale, triggers, required evidence, source revision, and references.
- [x] 2.4 Add RED classification tests for ordinary outcomes, event-response behavior, modes, ordering, cancellation, retry/recovery, concurrency, authorization state, invariants, and irreversible transitions.
- [x] 2.5 Implement planner-produced classification and reviewer reconciliation so review may raise a minimum, no supplemental result may erase blocking semantic evidence, and Tier 0 provenance remains explicit.
- [x] 2.6 Add semantic-structure checks requiring component/response plus applicable scope, condition, trigger, timing, and prohibition meaning for `behavioral` and `modeling` requirements while allowing concise one-sentence forms.
- [x] 2.7 Add modeling checks that place observable invariants in specs, state/transitions/assumptions/proof obligations in design, and verification work in tasks without adding empty sections to simple changes.
- [x] 2.8 Add achieved-assurance vocabulary and failing tests that reject unsupported `FRET-valid`, `PVS-proven`, and `formally verified` claims.
- [x] 2.9 Add explicit human downgrade records with required level, achieved level, reason, actor where available, revision, and `human_needed` behavior when required analysis remains unresolved.
- [x] 2.10 Complete GREEN and REFACTOR passes for semantic compilation, classification, source-of-truth, and cross-platform path tests.

## 3. Add Materiality-Gated Discussion

- [x] 3.1 Add `discuss` to the companion workflow manifest and canonical host-skill sources without modifying OpenSpec core.
- [x] 3.2 Vendor the complete upstream `grilling` instruction body after YAML frontmatter from commit `85f83d3fde1d3a90d5c9a657f6998c79a6c37308` as one canonical companion-package source and record its upstream file, revision, copyright, and full MIT license in the distributed third-party notice.
- [x] 3.3 Generate every host's `/opsx:discuss` skill as OpenSpec GSD frontmatter followed by the byte-identical vendored body and then the canonical OpenSpec GSD supplement, with no separately maintained Pi, Codex, or other host copy.
- [x] 3.4 Add a byte-for-byte fixture or cryptographic-digest test for the pinned body and fail generation or package verification on unintended drift, missing provenance, missing license notice, or supplement placement before or inside the base body.
- [x] 3.5 Implement the supplemental discussion contract for materiality-screened human decisions, dependency-aware design trees, agent-owned fact finding, recommendation-bearing rounds, complete material branch coverage, and shared-understanding completion without weakening the vendored base.
- [x] 3.6 Implement coherent frontier clustering so large material frontiers remain complete without presenting an overwhelming round or silently resolving human-owned decisions.
- [x] 3.7 Implement adaptive “show me a rock” guidance for focused examples, contrasts, counterexamples, traces, outputs, and sketches, including the rule that feedback confirms only the tested distinction.
- [x] 3.8 Implement the self-contained proposal handoff format with goal, outcomes, non-goals, decisions, examples, commitments, semantic candidates, planning uncertainties, pathfinder candidates, and delegated technical choices.
- [x] 3.9 Implement the conversational decision-to-artifact mapping protocol used by proposal generation, including automatic success and targeted return to discussion when a material decision is missing or contradicted.
- [x] 3.10 Support `/opsx:discuss <change>` by loading current OpenSpec artifacts and unresolved intent findings, reopening only affected decision branches, and handing confirmed changes to the standard update workflow.
- [x] 3.11 Add contract tests that reject supplements which remove a material branch, ask a dependent question prematurely, omit recommendations, assign discoverable facts to the developer, act before shared-understanding confirmation, or otherwise override the base outside the enumerated adaptations.
- [x] 3.12 Add scripted workflow tests for discoverable facts, trivial timeout-like choices, material product differences, prerequisite ordering, coherent clustering, recommendation-bearing rounds, yes/no rock feedback, exhaustive material coverage, shared-understanding confirmation, successful handoff mapping, mapping failure, and targeted re-entry.
- [x] 3.13 Verify discussion creates no repository state before proposal generation, trivial or already-precise changes may bypass it, and a newer upstream grilling revision cannot alter behavior without an explicit reviewed pin update and rerun of the discussion contract suite.

## 4. Add Planning State and Revision Approval

- [x] 4.1 Add compatible canonical event types for semantic classification, pathfinder results, plan review, finding routing, human downgrade, plan approval, and plan staleness while retaining readability of existing v2 event fixtures.
- [x] 4.2 Extend deterministic replay into existing `run.json` and `assurance.json` projections with plan revision, classification summary, review provenance, approval status, dispositions, and next actions.
- [x] 4.3 Add an explicit registry for any new generated record fields or evidence types and retain the existing generated filenames rather than introducing a plan report directory.
- [x] 4.4 Add RED revision tests for proposal, spec, design, and semantic task changes; checkbox-only completion and reopening changes that preserve approval; file-order independence; path normalization; added/removed delta specs; unrelated-file changes; and deterministic replay.
- [x] 4.5 Implement canonical semantic artifact revision calculation from resolved explicit artifact paths and content hashes, normalizing only standard task-list completion markers while preserving task wording, identifiers, order, nesting, dependencies, metadata, and verification obligations, using Node path APIs at filesystem boundaries.
- [x] 4.6 Implement `plan_approved` recording against the canonical semantic revision, preserve approval across checkbox-only task progress, and mark approval stale when any authoritative semantic planning input changes.
- [x] 4.7 Add migration and replay tests proving older canonical histories remain readable, unknown newer events fail or degrade according to the documented compatibility contract, and no state migration fabricates approval.

## 5. Implement the Plan Workflow and Roles

- [x] 5.1 Implement one reusable planning orchestration capability over an existing OpenSpec change and expose it through `/opsx:plan <change>` for initial planning and through an internal `/opsx:do` caller for blocking finding triage and replanning.
- [x] 5.2 Implement the planner role contract with write authority limited to standard OpenSpec planning artifacts and explicit prohibition on silently changing observable intent.
- [x] 5.3 Compose repository context, semantic classification, assumption derivation, requirement/scenario/task coverage, dependency/write-set checks, compatibility obligations, and verification capability into the planning pipeline.
- [x] 5.4 Add the structured planning-only pathfinder request/result schema covering question, assumptions, experiments, observations, counterexamples, conclusion, confidence, evidence, and routing recommendation.
- [x] 5.5 Implement fresh-context pathfinder dispatch with read-only repository access and an explicitly disposable experiment workspace, rejecting authoritative artifact writes and non-planning invocation.
- [x] 5.6 Implement technical-result incorporation through the planner and material-result routing to `/opsx:discuss <change>`.
- [x] 5.7 Add the fresh-context plan-reviewer contract and opaque orchestrator receipt, with read-only evaluation of semantic faithfulness, coverage, assumptions, compatibility, feasibility, pathfinder evidence, and verification capability.
- [x] 5.8 Implement Tier 0 self-review fallback that records `independent: false`, warns the developer, offers continue-or-feedback, and reports `human_needed` when the required choice cannot be obtained.
- [x] 5.9 Reuse stable finding identities and implement at most two planner repair or replan/re-review cycles per unchanged blocking finding, stopping on unchanged concerns, attempt exhaustion, unavailable capabilities, or reviewer-driven scope expansion.
- [x] 5.10 Add RED–GREEN–REFACTOR integration tests for initial planning, internal reuse by `do`, current-plan routing with the stable finding and original task to the executor wrapper and canonical apply capability, deterministic blockers as an immutable lower bound, technical replanning, material-intent blocking, pathfinder conclusions, independent review, self-review fallback, convergence, and approval.

## 6. Rename and Gate the Execution Lifecycle

- [x] 6.1 Add RED manifest, CLI, help, generated-skill, and installed-artifact tests for replacing `run` with `do` and `run-status` with `status` without compatibility aliases.
- [x] 6.2 Rename the companion workflow contributions and public CLI commands while retaining the internal `run.json` projection filename and existing execution state identities.
- [x] 6.3 Update extension reconciliation fixtures so explicitly owned legacy `run` and `run-status` host files are removed and new `do` and `status` files are created without pattern-deleting user files.
- [x] 6.4 Require the initial `/opsx:do <change>` entry to compare the current semantic artifact revision with approval, preserve approval across checkbox-only task progress, and refuse absent or stale plans before any implementation write.
- [x] 6.5 Implement the existing executor as an assurance wrapper that receives the approved revision, selected task, planner instructions, semantic obligations, risk/TDD constraints, stable findings, and evidence requirements, then delegates implementation and standard task tracking to the canonical OpenSpec apply capability used by `$openspec-apply-change`.
- [x] 6.6 Prohibit the executor wrapper from maintaining a second task queue, copying task prose into generated state, inventing separate completion status, or reproducing the apply loop; retain canonical apply ownership of standard artifact loading, task implementation, and completion-marker updates.
- [x] 6.7 Submit every blocking code-review and goal-verification finding to the shared planning capability, associate a current-plan finding with its original task, return that task to pending state when necessary, and route both through the executor wrapper and canonical apply capability.
- [x] 6.8 Implement the closed `do` loop for plan revision, plan review, renewed approval, executor-wrapper repair, canonical-apply error or ambiguity return to planner triage, re-review, re-verification, targeted-discussion pause, post-update replanning, automatic resume, successful completion, and bounded `human_needed` termination.
- [x] 6.9 Feed current planner instructions, semantic classifications, scenarios, invariants, risk/TDD constraints, dispositions, and plan evidence into the executor wrapper, code-reviewer, and goal-verifier contexts according to their authority.
- [x] 6.10 Extend `/opsx:status <change>` to report the active execution, planner-triage, repair, replan, approval, review, verification, semantic assurance, resume, and precise human-action state without implying persisted discussion state.
- [x] 6.11 Update `check` to evaluate planning and semantic obligations without executing or expanding change scope.
- [x] 6.12 Complete GREEN and REFACTOR passes for command migration, generated workflow reconciliation, semantic revision and checkbox normalization, executor-wrapper/apply delegation, planner-instruction preservation, stale-plan refusal, closed-loop convergence, status, and installed entry-point tests.

## 7. Route Findings and Verify the Authoritative Contract

- [x] 7.1 Extend structured finding ownership and identities for discussion, planner, executor, pathfinder, and verifier routes without allowing callers to select privileged provenance.
- [x] 7.2 Implement planner triage for implementation defects, inadequate plans, material intent gaps, modeling/feasibility questions, and insufficient verification evidence using the existing stable finding and original task references, including reopening the original task for a current-plan repair.
- [x] 7.3 Route current-plan defects through the executor wrapper and canonical apply capability, route inadequate plans through artifact revision and renewed approval, and block any repair that would weaken or alter authoritative product meaning.
- [x] 7.4 Update goal verification to consume current OpenSpec artifacts, semantic obligations, approval revision, independent evidence, findings, and human dispositions while excluding raw discussion transcripts and executor self-report as completion authority.
- [x] 7.5 Convert verifier-discovered omissions or contradictions in product meaning into stable intent findings, route them to targeted discussion, and invalidate plan approval after the resulting artifact update.
- [x] 7.6 Extend `gsd.assurance` with durable semantic completeness, achieved level, plan freshness, plan-review provenance, finding, and downgrade obligations while keeping conversational handoff confirmation optional for changes that bypassed discussion.
- [x] 7.7 Add gate tests for current approval, stale approval, unresolved semantics, accepted lower assurance, unaccepted downgrade, self-review provenance, targeted intent re-entry, audited override, and archive reporting.
- [x] 7.8 Add mode tests proving quick, guarded, and full may change execution breadth but cannot silently lower semantic minimums.

## 8. Documentation and Package Surface

- [x] 8.1 Update README and help to document `discuss → propose → plan → do`, the distinction between initial proposal authoring and reusable planning, automatic `do → planner → executor wrapper → canonical apply → review/verify` convergence, targeted discussion, `check`, `status`, `uat`, and `debug` with concise examples.
- [x] 8.2 Document the pinned upstream grilling base and attribution, narrowly scoped OpenSpec adaptations, materiality-gated human decisions, agent-owned fact finding, coherent rounds, adaptive rocks, the prohibition on trivial human questions, and the explicit reviewed process for updating the pin.
- [x] 8.3 Document the three semantic levels, artifact ownership, achieved-assurance vocabulary, audited downgrade behavior, and the explicit absence of FRET/PVS runtime or proof claims.
- [x] 8.4 Document planner, pathfinder, plan-reviewer, executor-wrapper, canonical-apply, reviewer, verifier, and gap-router authority boundaries, including planner-instruction precedence, plus Tier 0 self-review warnings.
- [x] 8.5 Add private migration guidance for `run`/`run-status` to `do`/`status`, extension reconciliation, rollback by relinking the prior companion revision, and unchanged canonical generated filenames.
- [x] 8.6 Regenerate and inspect the Pi package/skills from canonical workflow contributions, confirming the exact vendored grilling body precedes the supplement, the pinned source and bundled third-party notice are present, and no hand-maintained host copy diverges from the manifest instructions.

## 9. Automated Verification

- [x] 9.1 Run companion formatting, lint, type-check, build, full unit tests, canonical replay, workflow generation, grilling-body drift and behavior contracts, third-party notice and package-content inspection, extension conformance, packed private install, and public-entry smoke tests.
- [x] 9.2 Run end-to-end Tier 0 scenarios for trivial bypass, behavioral planning, modeling analysis, self-review warning, approval, checkbox progress without approval staleness, semantic task change with stale-plan refusal, `executor wrapper → canonical apply → review fail → planner → reopen original task → executor wrapper → canonical apply → review pass`, `execute → verify fail → planner → replan → approve → executor wrapper → canonical apply → verify pass`, apply ambiguity returning to planner triage, targeted discussion and resume, bounded repetition, and archive.
- [x] 9.3 Run Tier 1/Tier 2 adapter tests for fresh plan review and isolated pathfinder execution, proving supplemental results cannot erase deterministic blockers or acquire unauthorized write/provenance authority.
- [x] 9.4 Add Windows and Linux GitHub Actions coverage where the existing suite can run fully automatically, including path normalization and workflow reconciliation, while labeling those results portability evidence rather than manual host qualification.
- [x] 9.5 Run strict validation for this OpenSpec change and source-of-truth tests proving generated state references but never reproduces or supersedes proposal/spec/design/tasks.
- [x] 9.6 Run the maintained extension-seam budget, core conformance tests, and upstream-survivability check; if a core change appears necessary, stop and propose the smallest generic seam separately before modifying core.

## 10. macOS/Pi Qualification and Bounded Acceptance

- [x] 10.1 Link the implementation candidate into the local OpenSpec fork, run extension doctor, reconcile generated Pi skills, and verify that `discuss`, `plan`, `do`, `check`, `status`, `uat`, and `debug` are discoverable while legacy owned names are absent.
- [x] 10.2 In a disposable macOS project, complete a Level 1 change with minimal interaction and no formal-method headings or discussion requirement.
- [x] 10.3 In a disposable macOS project, complete a behavior-bearing change from `/opsx:discuss` through proposal mapping, initial `/opsx:plan`, `/opsx:do`, executor-wrapper delegation through canonical apply with planner instructions intact, a blocking technical finding routed through the shared planner and reopened original task without manual plan reinvocation, independent review/verification, and archive without FRET or PVS installed.
- [x] 10.4 Exercise a modeling change that invokes an isolated planning pathfinder, records state/invariant/counterexample analysis without proof claims, and blocks or records an accepted downgrade when required assurance cannot be established.
- [x] 10.5 Exercise a post-approval artifact change and targeted intent finding through `/opsx:discuss <change>`, OpenSpec update, stale approval, internal replanning and renewed approval, automatic `/opsx:do` resume, and successful re-verification.
- [x] 10.6 Obtain one fresh bounded independent scope, code, semantic-claims, source-of-truth, and goal review against the frozen requirements; allow blocking only for reproducible violations of current scenarios and record tool integration, cross-platform manual qualification, pause/resume state, and broader formal methods as future work.
- [x] 10.7 After the bounded review passes, install or link the verified private OpenSpec GSD revision into the user's macOS environment, rerun installed workflow and `gsd.assurance` smoke checks, and do not publish to a package registry.
