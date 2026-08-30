## Context

See `proposal.md` for motivation and the four delta specs for observable behavior.

OpenSpec GSD currently contributes five extension workflows (`run`, `check`, `run-status`, `debug`, and `uat`) and one aggregate assurance gate. Its runtime compiles existing proposal/spec/design/tasks into an execution graph, derives repository context, evaluates plan readiness, dispatches executor/reviewer/verifier roles, and records canonical events plus replaceable projections under `.openspec-gsd`.

The current extension seam already supports declarative workflow contributions and gates, so discussion and planning can remain companion-package workflows. The artifact compiler currently extracts requirement and scenario headings but not requirement bodies or behavioral structure. Current execution roles do not include planner, plan reviewer, or pathfinder.

The design must preserve these constraints:

- Standard OpenSpec proposal, specs, design, and tasks are the only maintained planning truth.
- Discussion is conversational and may occur before a change identifier exists.
- Formal-method weight is proportional, with no FRET/PVS runtime dependency or tool-backed claim in v1.
- Fresh contexts improve review quality when available, but Tier 0 remains usable with an explicit self-review warning.
- The companion package remains independently maintainable from OpenSpec core.
- macOS/Pi is the only manually qualified v1 host; other operating systems receive automated compatibility coverage where practical.

## Goals / Non-Goals

**Goals:**

- Add a proposal-focused discussion workflow based on materiality-gated grilling.
- Compile applicable FRET-inspired behavioral semantics into ordinary OpenSpec requirements and scenarios.
- Add a distinct repository-grounded planning stage with optional planning-only pathfinders.
- Add bounded plan-review convergence and revision-bound approval.
- Carry approved changes through a closed `/opsx:do` convergence loop that reuses planning, preserves independent execution review, and routes gaps by role ownership.
- Extend existing generated state and aggregate assurance rather than creating new planning documents.

**Non-Goals:**

- Bundling, installing, or invoking FRET, PVS, Electron, theorem provers, model checkers, or solver stacks.
- Claiming FRETish validity, PVS proof, or formal verification.
- Persisting discussion transcripts or design trees in the repository.
- Adding GSD milestones, phases, roadmaps, workstreams, or project-state artifacts.
- Adding a second requirements database, `PLAN.md`, `FORMAL.md`, `.pvs`, or proof-ledger artifact.
- Making discussion mandatory for trivial or already-precise changes.
- Allowing pathfinders to operate as execution agents or to edit authoritative OpenSpec artifacts.
- Manually qualifying Linux or Windows hosts.
- Renaming the already-published private package or repository directory; the package is already named `openspec-gsd`.

## Decisions

### 1. Keep the implementation in the companion extension

Add `discuss` and `plan` workflow contributions and rename the existing `run`/`run-status` contributions to `do`/`status` in the companion manifest. Reuse the existing OpenSpec workflow materialization and gate invocation APIs without extending core.

The companion runtime owns semantic compilation, planning events, approval revisions, plan review/pathfinder dispatch, gap routing, and aggregate assurance changes. OpenSpec core continues to discover contributions, render workflows, invoke the aggregate gate, and reconcile generated host files.

**Alternatives considered:**

- Modify OpenSpec core proposal generation directly. Rejected because a self-contained conversational handoff can guide the existing proposal skill without adding product-specific policy to core.
- Add an extension-contributed schema. Rejected because the current generic seam intentionally supports workflows and gates, and standard artifacts already have the required expressive capacity.

### 2. Use a conversational handoff protocol rather than persisted discussion state

`/opsx:discuss` operates as an agent skill. It builds an internal decision tree, resolves facts, asks the material frontier in dependency-aware rounds, and emits a self-contained final handoff only after shared-understanding confirmation.

The handoff contains stable local decision labels within the response and a next-agent instruction to map every material decision into proposal/spec/design/tasks. Proposal generation produces an automated decision-to-artifact mapping in its response. The mapping is conversational evidence, not a new project artifact or archive gate. When a mapping is incomplete or contradictory, the same interaction routes the affected branch back to discussion.

Once proposal artifacts exist, they are authoritative. Planning independently evaluates their completeness and may reopen targeted discussion, so later sessions do not depend on the original transcript.

**Alternatives considered:**

- Store resumable discussion JSON under `.openspec-gsd`. Rejected for v1 because it creates pre-proposal repository state and duplicates deferred pause/resume concerns.
- Require human confirmation after every proposal call. Rejected because discussion is meant to settle human decisions before proposal generation; confirmation should be automatic unless faithful compilation cannot be established.

### 3. Adapt grilling through a materiality filter

Vendor the upstream `grilling` instruction body from commit `85f83d3fde1d3a90d5c9a657f6998c79a6c37308` as the immutable base contract for v1. “Instruction body” means the complete upstream content after its YAML frontmatter; `/opsx:discuss` uses OpenSpec GSD frontmatter, then includes that body byte-for-byte, then appends the OpenSpec GSD supplement. The companion repository keeps one canonical vendored body used by workflow generation for every host rather than maintaining separate Pi, Codex, or other generated copies.

The supplement retains the grilling design tree, prerequisite-aware frontier, rounds, recommendations, fact-finding responsibility, exhaustive branch coverage, and shared-understanding completion rule. It specializes the upstream vocabulary as follows:

- a user-owned `decision` is a material choice whose plausible answers create meaningfully different product outcomes or consequential commitments after discoverable facts have been resolved;
- the `frontier` and `every branch` refer to the complete set of material human-owned decisions, while safe technical choices remain in the internal tree and are delegated to repository research, planning, or implementation; and
- asking the `whole frontier` permits presenting one coherent domain cluster when the entire ready material frontier would be cognitively overwhelming, provided every deferred material branch remains tracked and is asked in a later round.

These are the only intentional adaptations to the upstream interaction contract. The supplement additionally defines concrete-candidate behavior, the proposal-ready handoff, automatic handoff mapping, and targeted re-entry for existing changes. Any supplemental instruction that weakens dependency ordering, recommendations, agent-owned fact finding, material branch coverage, or the final shared-understanding confirmation is a generation error rather than an allowed override.

Safe technical choices remain in the internal tree but are assigned to repository research, planning, or implementation rather than turned into human questions. When the whole material frontier would be cognitively heavy, the skill presents one coherent domain cluster while retaining every other material branch. “Show me a rock” candidates are used only when concrete feedback is likely to reveal intent more reliably than an abstract question.

Pinning avoids a runtime dependency on GitHub and prevents unreviewed upstream changes from altering installed behavior. A byte-for-byte fixture or recorded cryptographic digest checks the vendored body during tests and package generation. Updating the pin requires an explicit change that reviews the upstream diff, reconciles any supplement conflict, updates the fixture or digest, and reruns discussion behavior tests.

The companion package carries a third-party notice naming Matt Pocock, the upstream repository and file, the pinned revision, the 2026 copyright, and the full MIT license text. Generated skills identify the vendored source and direct users to that bundled notice without modifying the verbatim instruction body.

### 4. Compile three semantic levels from authoritative artifacts

Extend artifact compilation to read full requirement and scenario bodies and produce a revision-bound `SemanticClassificationV1` per requirement:

```text
simple      ordinary outcome and scenarios are sufficient
behavioral  explicit component/response plus applicable scope,
            condition, trigger, timing, and prohibition semantics
modeling    behavioral semantics plus state, transitions, invariants,
            assumptions, boundaries, and reviewable proof obligations
```

The classification record stores identifiers, level, rationale, triggers, artifact revision, and evidence references; it does not copy requirement prose. Classification is derived by the planning agent and checked by the plan reviewer. Tier 0 self-review is marked accordingly. No fragile lexical keyword detector is allowed to lower a classification; a reviewer may raise a planner-selected level, and lowering a required level needs an audited human disposition.

The controlled-language discipline is inspired by FRET's `[scope] [condition] component shall [timing] response` structure, but the package calls it “FRET-inspired behavioral semantics.” A labeled behavior block is introduced only when a concise sentence cannot expose the necessary modes, triggers, exceptions, or timing obligations.

For `modeling` requirements, observable invariants remain in specs; abstract state, transitions, assumptions, and proof obligations belong in design; work and verification belong in tasks. The analysis strategy borrows PVS-style explicit theories, types, assumptions, invariants, transitions, proof obligations, and counterexample reasoning without producing `.pvs`/`.prf` files or proof claims.

References used to define the boundary:

- FRET writing guide: https://github.com/NASA-SW-VnV/fret/blob/master/fret-electron/docs/_media/user-interface/writingReqs.md
- FRET semantics overview: https://github.com/NASA-SW-VnV/fret/blob/master/fret-electron/docs/_media/semantics/semanticsOverview.md
- PVS documentation: https://pvs.csl.sri.com/documentation.html

**Alternatives considered:**

- Add labeled FRET fields to every requirement. Rejected because it adds boilerplate even when ordinary OpenSpec scenarios are adequate.
- Keep all semantics implicit in agent reasoning. Rejected because planners and reviewers need an observable contract to preserve.
- Integrate official tools in v1. Rejected because their installation, solver, modeling, and proof-maintenance costs are disproportionate to the initial goal.

### 5. Implement one reusable planning capability

Implement planning once as a reusable orchestration boundary. `/opsx:plan` is its public initial-planning entry point; `/opsx:do` invokes the same capability internally for every blocking code-review or goal-verification finding. Both entry paths perform the same applicable stages:

```text
compile current artifacts and revisions
  → derive repository context
  → classify requirements and semantic obligations
  → refine design/tasks within planner authority
  → dispatch planning-only pathfinder when required
  → evaluate deterministic readiness
  → dispatch fresh-context plan review when available
  → resolve findings for at most two cycles
  → record revision-bound approval
```

The planning capability returns one of four outcomes to its caller: a current-plan route that associates the existing finding with its original task, returns that task to pending state when necessary, and sends both to the existing executor wrapper; a revised and reapproved plan; targeted discussion for material intent; or bounded terminal `human_needed`. The current-plan route is ordinary finding routing, not a repair plan, repair schema, second executor mechanism, or second apply loop.

The planner may update design and tasks directly and may clarify requirement wording without changing meaning. Any change to observable behavior, scope, non-goals, compatibility, or accepted semantic obligations becomes an `intent` finding and routes to `/opsx:discuss <change>` plus the existing OpenSpec update workflow. When invoked by `/opsx:do`, technical dispositions return control to that active loop automatically after repair or renewed approval.

Planning reuses existing repository-context and readiness lower-bound behavior. Supplemental agents may add evidence but cannot remove deterministic unknowns, conflicts, or blocking readiness findings.

**Alternatives considered:**

- Add a dedicated gap planner, `GapPlanV1`, repair schema, repair-specific prompt, or repair-only approval path. Rejected because it would duplicate planning or executor skills, weaken evidence contracts, and create another source of execution intent.
- Require the developer to reinvoke `/opsx:plan` after each technical finding. Rejected because `/opsx:do` is responsible for GSD-style convergence and can safely reuse planning without human orchestration.

### 6. Add planner, plan-reviewer, and pathfinder dispatch contracts

Extend the host adapter boundary with explicit roles and opaque orchestrator-issued dispatch receipts:

- `planner`: read/write access limited to standard OpenSpec planning artifacts.
- `plan_reviewer`: read-only access to current artifacts, repository evidence, classifications, and pathfinder results.
- `pathfinder`: read-only repository access plus an explicitly disposable isolated workspace for experiments; no authoritative artifact writes.

Pathfinder dispatch is available only from planning. Results have a structured status, question, assumptions, experiments, observations, counterexamples, conclusion, confidence, evidence references, and routing recommendation. Material conclusions route to discussion; technical conclusions may be incorporated by the planner.

On hosts without isolated review, the planner may self-review. The result records `independent: false`, emits a warning, and offers the human a continue-or-feedback choice. It is never relabeled as independent. If a host cannot obtain the required choice interactively, planning reports `human_needed`.

### 7. Reuse stable findings and bound combined convergence

Extend finding ownership with `discussion`, `planner`, `executor`, `pathfinder`, and `verifier` routing while preserving stable derived identities and the existing lifecycle:

```text
open → repaired → independently_verified
     ↘ accepted_risk
     ↘ human_needed
```

Every blocking code-review or goal-verification finding first receives planner triage. The planner may determine that the current plan already covers the defect, associate the same finding with the original task, return that task to pending state when necessary, and route both to the existing executor wrapper, or it may revise standard artifacts and obtain a new review and approval. The same finding identity survives executor repair, replanning, re-review, and verification.

Plan and execution convergence permit two repair or replan attempts per unchanged blocking finding by default. The active `/opsx:do` loop stops when a finding survives the limit, repeats without new evidence, requires unavailable capabilities, or reviewer feedback attempts to expand scope beyond the confirmed proposal. The stop is a structured `human_needed` result, not an invitation to continue review indefinitely.

### 8. Bind approval to deterministic semantic artifact revisions

Compute a canonical revision for the explicit set of authoritative proposal/spec/design/task files using normalized relative paths and semantic content hashes. Proposal, spec, and design content is revision-sensitive in full. Before hashing task files, normalize only standard Markdown task-list completion markers (`[ ]`, `[x]`, or `[X]`) on task lines to a common pending marker. Preserve and hash task wording, identifiers, order, nesting, dependencies, metadata, and verification obligations. Path enumeration comes from resolved artifact paths and explicit tracked lists, not wildcard deletion or heuristic filename matching.

Record `plan_approved` with the revision, semantic levels, review provenance, open dispositions, and evidence references in canonical events. Project `run.json` and `assurance.json` gain replaceable plan projections. Task completion or reopening therefore changes execution progress without making approval stale. Any semantic change to an authoritative artifact causes the computed current revision to differ; `/opsx:status` reports staleness and `/opsx:do` refuses execution until replanning succeeds.

The internal generated filename `run.json` remains unchanged to avoid a needless state migration; only the user-facing workflow becomes `do`.

### 9. Rename the public execution surface cleanly

Replace manifest and CLI contributions:

```text
run         → do
run-status  → status
```

The extension reconciliation mechanism removes extension-owned generated files by explicit prior contribution identity and writes the new files. It does not pattern-delete similarly named user files. Because the package is private, no permanent aliases are retained. Documentation and Pi package metadata are updated in the same change.

`/opsx:do` owns this convergence state machine while reusing the planning capability and the existing executor wrapper:

```text
executor wrapper
  → supply approved planner instructions, task scope, semantic obligations,
    risk/TDD constraints, stable findings, and required evidence
  → delegate implementation and standard task tracking to the canonical
    OpenSpec apply capability used by $openspec-apply-change
  → code review and goal verification
  → planner disposition
      ├─ current plan adequate → reopen original task when needed
      │                           → executor wrapper → canonical apply
      ├─ revise artifacts → plan review → renewed approval
      └─ targeted discussion → artifact update → plan review → renewed approval
  → resume execution, review, and verification
  → pass or bounded human_needed
```

The executor wrapper is an assurance and context boundary, not an alternative implementation engine. It ensures that planner instructions omitted by ordinary apply context remain binding and captures structured implementation, test, and finding evidence. The canonical apply capability retains responsibility for loading the standard OpenSpec apply instructions and artifacts, performing the task work, and updating standard task completion markers. The wrapper does not maintain a second task queue, copy task prose into generated state, invent a separate completion model, or reproduce the apply loop.

If the canonical apply capability encounters a technical error, ambiguity, or apparent planning defect, the wrapper records or reconciles a stable finding and returns it to planner triage within the active `/opsx:do` loop. Only a material intent decision, unavailable required capability, exhausted convergence bound, or other defined terminal condition interrupts the developer.

The initial invocation still requires current approval and directs an unplanned change to `/opsx:plan`. After `/opsx:do` starts, technical findings and artifact revisions re-enter planning internally; the developer does not manually reinvoke the lifecycle command. Intent findings pause for human discussion and then resume through the same planning capability.

Canonical events and existing projections record finding disposition, repair or replan attempt, approval revision, resume point, and terminal result. No second execution-loop store is added. `/opsx:status` projects the complete durable lifecycle; it reports discussion information only when present in the active interaction and does not imply persisted discussion state.

### 10. Verify against artifacts, not the transcript

The goal verifier receives the current proposal/spec/design/tasks, semantic classifications, approval revision, execution evidence, findings, and human dispositions. It does not receive a discussion transcript as a normative input and cannot accept executor self-report as independent evidence.

If verification exposes any blocking gap, it creates or reconciles a stable finding and submits it to the shared planning capability. An omitted or contradictory material decision receives an `intent` disposition. Targeted discussion updates the authoritative artifacts, which invalidates approval; `/opsx:do` then reuses planning and plan review before execution or verification resumes.

### 11. Extend the existing aggregate assurance gate

Add subordinate checks for:

- proposal handoff fidelity when a handoff is present in the active workflow;
- semantic classification completeness and achieved level;
- plan approval presence and freshness;
- plan-review provenance and unresolved findings;
- accepted assurance downgrades;
- semantic evidence required by verification.

Only durable checks participate in later archive evaluation. Conversational handoff confirmation is not required for changes that legitimately bypassed discussion. Stale approval, unresolved required semantics, or blocking findings fail `gsd.assurance`; a missing required human disposition produces `human_needed`. Existing audited archive override behavior remains unchanged.

### 12. Add no persistent rigor configuration in v1

Automatic classification establishes the normal minimum. Quick, guarded, and full modes may change execution strategy and optional checker breadth but cannot lower the semantic minimum. A human can accept a lower achieved level only through the existing explicit disposition mechanism with a reason.

This avoids introducing configuration before real use identifies repeatable project-level policies.

## Risks / Trade-offs

- **Conversational handoffs are harder to resume across sessions** → Emit a self-contained handoff that can be passed intact to proposal generation; leave generalized pause/resume state for a later increment.
- **Agent classification may be inconsistent** → Require rationale, fresh-context review when available, explicit self-review provenance otherwise, revision binding, and audited downgrades.
- **Formal-method vocabulary could burden developers** → Keep jargon behind the interaction boundary, use controlled plain language, and ask only material questions.
- **Level 3 analysis may look stronger than it is** → Restrict assurance vocabulary to achieved evidence and explicitly prohibit FRET/PVS/formal-verification claims without future tool evidence.
- **Planning could become another bookkeeping layer** → Store only derived events/projections, omit empty modeling sections, and prohibit new maintained plan/state artifacts.
- **Pathfinders could expand scope or mutate truth** → Limit them to planning, disposable experiments, structured evidence, and no authoritative writes.
- **Review convergence could become endless** → Preserve stable findings, cap repair/re-review at two cycles, and stop on repeated or scope-expanding feedback.
- **Gap fixes could duplicate planning, executor, or apply machinery** → Route every blocking finding through the same planning capability and stable finding lifecycle used by `/opsx:plan`, then use the existing executor wrapper and canonical OpenSpec apply capability when the current plan is adequate; prohibit separate gap-plan, repair-schema, repair-prompt, repair-executor, task-queue, or apply-loop models.
- **Ordinary apply context may omit approved planner constraints** → Make the executor wrapper responsible for supplying the approved revision, planner instructions, semantic obligations, task scope, and evidence contract without taking over apply's task-tracking mechanics.
- **Command renaming breaks existing private invocations** → Reconcile extension-owned files explicitly, update documentation and local installation together, and make the clean break before broader distribution.
- **Tier 0 self-review is not independent** → Label it accurately, warn the developer, and require a continue-or-feedback decision.
- **Automated non-macOS tests may not prove host compatibility** → Treat them as portability evidence only; manually qualify macOS/Pi and make no broader support claim.
- **A companion-only design may uncover a missing core seam** → Require evidence that the seam is generic and unavoidable before proposing a separate minimal core change.

## Migration Plan

1. Extend companion schemas and canonical events compatibly so existing v2 run data remains readable.
2. Add semantic compilation, plan projections, role routing, and approval revision support behind unit tests.
3. Add planner/reviewer/pathfinder orchestration and the `plan` workflow.
4. Add the conversational `discuss` workflow and proposal handoff protocol.
5. Rename `run`/`run-status` contributions and CLI surfaces to `do`/`status`, then reconcile extension-owned generated host files.
6. Update `check`, verification, status projection, and `gsd.assurance` to consume plan and semantic results.
7. Run the full companion test suite and automated operating-system CI where practical.
8. Link the updated companion into the OpenSpec fork, regenerate Pi workflows, and perform the macOS/Pi dogfood scenario from discussion through archive.
9. Obtain fresh independent scope/code/goal review before installing the evaluated private version for normal use.

Rollback relinks the previously qualified companion revision and reconciles its earlier workflow contributions. Existing canonical events remain readable; newly introduced event types are ignored by older replaceable projections rather than requiring destructive state migration.
