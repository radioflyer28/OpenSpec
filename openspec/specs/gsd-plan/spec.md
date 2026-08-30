# gsd-plan Specification

## Purpose
Turn confirmed OpenSpec artifacts into a repository-grounded, semantically complete, independently reviewed, and revision-bound execution plan without introducing a separate plan document.
## Requirements
### Requirement: Planning is an explicit workflow stage
OpenSpec GSD SHALL provide `/opsx:plan <change>` after proposal generation and before initial execution, SHALL expose the same planning capability for internal reuse by `/opsx:do`, and SHALL use the existing OpenSpec proposal, specs, design, and tasks as its only maintained planning inputs and outputs.

#### Scenario: Developer plans a proposed change
- **WHEN** the required OpenSpec artifacts exist and the developer invokes `/opsx:plan <change>`
- **THEN** OpenSpec GSD performs repository analysis, semantic classification, artifact refinement, applicable pathfinder work, plan review, and approval
- **AND** does not create `PLAN.md` or persistent phase or milestone state

#### Scenario: Do requests gap planning
- **WHEN** `/opsx:do` submits a blocking review or verification finding for planner disposition
- **THEN** OpenSpec GSD invokes the same planning capability, contracts, and evidence requirements used by `/opsx:plan`
- **AND** returns a current-plan route to the existing executor wrapper, a revised and approved plan, a discussion route, or a bounded terminal result to `/opsx:do`

### Requirement: Initial and gap planning share one implementation
OpenSpec GSD SHALL reuse the same planner, planning-stage pathfinder, deterministic readiness, plan-review, finding-convergence, and revision-approval implementation for initial plans and gap fixes and SHALL not provide a duplicate or weaker gap-planning path.

#### Scenario: Existing plan already covers a defect
- **WHEN** gap planning determines that an approved task and verification strategy already cover a blocking implementation defect
- **THEN** the planner associates the same stable finding with the original task and returns that task to pending state when necessary
- **AND** routes it to the existing executor wrapper for delegation through the canonical OpenSpec apply capability
- **AND** does not create a repair-plan artifact, repair schema, duplicate apply loop, or duplicate executor path

#### Scenario: Gap requires plan revision
- **WHEN** a blocking finding exposes an inadequate design, task, dependency, write set, assumption, or verification strategy
- **THEN** the shared planning implementation revises the standard artifacts
- **AND** applies the same readiness, review, convergence, and approval requirements as initial planning

### Requirement: Planner authority is limited to technical planning
The planner SHALL be allowed to refine technical design, task decomposition, dependencies, write sets, repository-specific choices, and verification strategy while preserving confirmed observable behavior, scope, non-goals, compatibility commitments, and semantic obligations.

#### Scenario: Planner finds a technical decomposition gap
- **WHEN** the existing tasks cannot collectively implement an authoritative requirement
- **THEN** the planner may revise design and tasks and submit the revised plan for review

#### Scenario: Planner finds a material intent gap
- **WHEN** resolving a finding would change observable behavior or another confirmed material decision
- **THEN** planning blocks the affected branch and routes it to `/opsx:discuss <change>`

### Requirement: Plan readiness proves achievability
Before approval, planning SHALL establish that requirements have observable scenarios, tasks collectively cover requirements, dependencies and write sets are plausible, compatibility work is present when required, risky assumptions have validation paths or dispositions, and the verification strategy can establish completion.

#### Scenario: Requirement lacks capable verification
- **WHEN** the planned checks cannot establish an observable requirement or invariant
- **THEN** plan readiness fails with remediation guidance before execution

#### Scenario: Repository evidence contradicts plan scope
- **WHEN** repository analysis identifies an unresolved affected module, downstream consumer, architectural boundary, or comparison-base conflict
- **THEN** plan readiness retains the uncertainty and does not approve the plan as current

### Requirement: Pathfinder is an isolated planning subrole
Planning SHALL be able to dispatch a fresh-context pathfinder for consequential technical, modeling, or feasibility uncertainty and SHALL permit read-only research and disposable isolated experiments without granting the pathfinder authority to edit the OpenSpec artifacts.

#### Scenario: Planning requires an experiment
- **WHEN** repository evidence and reasoning cannot resolve a consequential planning uncertainty
- **THEN** the planner may dispatch a pathfinder to construct a disposable prototype, state model, invariant analysis, or counterexample exploration

#### Scenario: Pathfinder discovers a product decision
- **WHEN** pathfinder evidence shows that plausible resolutions imply materially different product behavior
- **THEN** the finding routes to discussion rather than being silently selected by the pathfinder or planner

#### Scenario: Pathfinder discovers a technical conclusion
- **WHEN** pathfinder evidence resolves a technical planning question without changing intent
- **THEN** the planner incorporates the supported conclusion into design or tasks and retains the evidence as a derived record

### Requirement: Plan review is fresh-context when available
On a host capable of isolated agent dispatch, OpenSpec GSD SHALL use a fresh-context plan reviewer that evaluates semantic faithfulness, coverage, assumptions, compatibility, feasibility, and verification capability without relying on planner self-claims.

#### Scenario: Independent reviewer is available
- **WHEN** host capabilities support isolated review
- **THEN** planning dispatches a fresh-context reviewer and records independently sourced findings

#### Scenario: Only self-review is available
- **WHEN** the host cannot provide an isolated reviewer
- **THEN** OpenSpec GSD labels the result as self-review
- **AND** warns the developer before proceeding
- **AND** offers the developer the choice to continue or provide feedback

### Requirement: Plan review convergence is bounded
OpenSpec GSD SHALL preserve stable finding identities across plan revisions and SHALL allow at most two repair and re-review cycles by default before requiring human direction.

#### Scenario: Finding is repaired
- **WHEN** the planner repairs an open finding and the reviewer verifies the repair
- **THEN** the finding transitions to independently verified

#### Scenario: Same concern survives two attempts
- **WHEN** a blocking concern remains unresolved after two repair attempts, repeats unchanged, or expands scope beyond the confirmed proposal
- **THEN** planning stops with `human_needed`
- **AND** reports the remaining finding and attempted remediations

### Requirement: Plan approval is bound to authoritative semantic revisions
When planning succeeds, OpenSpec GSD SHALL record approval against deterministic semantic revisions of the proposal, specs, design, and tasks, SHALL treat task completion markers as execution progress rather than planning content, and SHALL invalidate approval when any authoritative semantic input changes.

#### Scenario: Approved plan remains current
- **WHEN** `/opsx:do` receives artifacts whose revisions match the approval record
- **THEN** the plan is eligible for execution

#### Scenario: Task completion progress changes after approval
- **WHEN** only standard task completion markers change between pending and completed states
- **THEN** the canonical semantic revision remains unchanged
- **AND** plan approval remains current

#### Scenario: Semantic artifact content changes after approval
- **WHEN** an approved proposal, spec, or design changes or task meaning, metadata, dependencies, or verification obligations change
- **THEN** plan approval becomes stale
- **AND** an active `/opsx:do` loop internally invokes the shared planning capability to recompile and review the new revision
- **AND** otherwise the developer is directed to `/opsx:plan <change>`

### Requirement: Planning records only derived execution state
Planning SHALL record classifications, findings, pathfinder evidence references, review provenance, and approval revisions in the existing machine-generated OpenSpec GSD state without duplicating maintained proposal or requirement prose.

#### Scenario: Planning completes
- **WHEN** a plan is approved
- **THEN** generated state references the authoritative artifact and requirement identifiers
- **AND** no additional human-maintained planning document is created

