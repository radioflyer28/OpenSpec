## Why

OpenSpec GSD currently begins after proposal, specification, design, and task artifacts already exist, so it cannot help a developer resolve consequential ambiguity before those artifacts are written. The workflow also lacks a proportional way to make temporal, stateful, and invariant-heavy behavior precise without imposing formal-method tooling or GSD-style project-management bookkeeping on every change.

## What Changes

- Add `/opsx:discuss` as the standard pre-proposal entry point. Its generated skill vendors the upstream `grilling` instruction body verbatim from pinned revision `85f83d3fde1d3a90d5c9a657f6998c79a6c37308`, then appends a narrowly scoped OpenSpec GSD supplement for materiality gating, coherent frontier clustering, concrete "show me a rock" examples, proposal handoff, and targeted re-entry without weakening the upstream design-tree, dependency, fact-finding, recommendation, coverage, or shared-understanding rules.
- Let `/opsx:discuss <change>` reopen only the affected decision branches when planning or verification exposes a material intent gap.
- Require automated confirmation that a discussion handoff is faithfully represented by the resulting OpenSpec proposal, specs, design, and tasks; return unresolved mismatches to discussion rather than treating every handoff as human-needed.
- Add risk-proportional behavioral classification with `simple`, `behavioral`, and `modeling` levels. Applicable requirements use concise FRET-inspired behavioral semantics, while high-risk planning may use PVS-inspired state, invariant, assumption, and counterexample analysis without claiming tool-backed formal verification.
- Add `/opsx:plan <change>` to perform repository analysis, semantic compilation, technical refinement, optional isolated pathfinder work, plan review, bounded convergence, and revision-bound approval using only the standard OpenSpec planning artifacts as maintained truth.
- Rename `/opsx:run` to `/opsx:do` and `/opsx:run-status` to `/opsx:status`. `/opsx:do` carries an approved change through a closed implementation, review, planner-disposition, bounded repair or replanning, and goal-verification loop until it passes or requires human direction.
- Delegate every implementation and repair stage from `/opsx:do` to the canonical OpenSpec apply capability used by `$openspec-apply-change`; `/opsx:do` orchestrates convergence without duplicating task selection, context loading, implementation, or completion tracking.
- Route every blocking code-review or goal-verification finding through the existing planner capability for disposition. `/opsx:do` reuses the same planner, pathfinder, plan-review, and approval machinery exposed by `/opsx:plan`; when the current plan remains adequate, the planner associates the same finding with the original task, reopens that task when necessary, and delegates it through the canonical apply capability, while plan gaps receive renewed approval and only material product-intent gaps interrupt the human through discussion.
- Treat task checkbox transitions as execution progress rather than semantic plan changes. Approval remains current when only completion markers change, while changes to task meaning, dependencies, metadata, proposal, specs, or design invalidate the approved plan revision.
- Extend the existing aggregate assurance result so stale plans, unresolved semantic obligations, and unaccepted assurance downgrades block execution or archive as applicable.
- Qualify the workflow manually on macOS with Pi. Run Linux and Windows automation where practical without making manual cross-platform qualification a completion requirement.
- **BREAKING**: Remove the `run` and `run-status` workflow names in favor of `do` and `status`; this private package will not retain permanent compatibility aliases.

## Capabilities

### New Capabilities

- `gsd-discussion`: A pinned and attributed verbatim `grilling` base contract, supplemented with materiality-gated questioning for new ideas and targeted intent gaps, proposal handoff, and automatic handoff-to-artifact confirmation.
- `gsd-behavioral-semantics`: Risk-proportional requirement classification and FRET/PVS-inspired semantic discipline within existing OpenSpec artifacts.
- `gsd-plan`: Repository-grounded planning, planning-stage pathfinders, plan review convergence, and revision-bound approval without a parallel plan document.
- `gsd-execution`: The `/opsx:do` closed convergence loop and `/opsx:status` lifecycle, planner-dispositioned gap routing, reuse of the canonical OpenSpec apply capability and planning skills, and verification against the approved semantic contract.

### Modified Capabilities

<!-- No archived main-spec capability changes. The companion extension's earlier
     Guardrails-named changes remain separate active changes until they are synced
     or archived. -->

## Impact

- Companion package: `openspec-gsd` workflow manifest, generated host skills and commands, CLI/runtime orchestration, artifact compilation, readiness, canonical events, assurance projections, findings, and verification.
- Third-party provenance: the companion package retains Matt Pocock's copyright and MIT license notice for the vendored `grilling` instruction body, records its pinned source revision, and tests the base body against unintended drift.
- OpenSpec fork: proposal and delta specs are tracked here; no core implementation change is expected because the existing generic workflow and gate seams are sufficient.
- User workflow: developers gain explicit discuss and initial-plan stages before execution; `do` delegates implementation to the same apply workflow used directly by OpenSpec, automatically re-enters the existing planning capability for blocking review or verification gaps, and changes existing private `run` and `run-status` invocations to `do` and `status`.
- Dependencies: no runtime dependency on the upstream skills repository, FRET, PVS, Electron, theorem prover, or solver is introduced; the attributed grilling text is vendored into the companion package.
- Planning truth: proposal, specs, design, and tasks remain the only human-maintained planning artifacts; discussion remains conversational and derived execution evidence remains machine-generated under `.openspec-gsd`.
