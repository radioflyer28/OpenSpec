# gsd-execution Specification

## Purpose
Carry approved OpenSpec changes through implementation, review, bounded repair, and goal verification while routing each gap to the role authorized to resolve it.
## Requirements
### Requirement: Do carries an approved change through assurance
OpenSpec GSD SHALL provide `/opsx:do <change>` to carry a current approved plan through a closed implementation, code-review, planner-disposition, bounded repair or replanning, and goal-verification loop until all required review and verification pass or a terminal human decision is required. For implementation and repair, `/opsx:do` SHALL dispatch the existing OpenSpec GSD executor wrapper, which SHALL preserve the approved planner instructions and assurance context while delegating ordinary implementation and task tracking to the canonical OpenSpec apply capability used by `$openspec-apply-change`.

#### Scenario: Approved change is performed
- **WHEN** the developer invokes `/opsx:do <change>` with a current approved plan
- **THEN** OpenSpec GSD provides the executor wrapper with the approved plan revision, planner instructions, semantic obligations, task scope, and required evidence
- **AND** the executor wrapper delegates the planned task work through the canonical OpenSpec apply capability
- **AND** automatically routes blocking review and verification findings through planning until the change passes or reaches a bounded terminal condition

#### Scenario: Apply context alone omits planner obligations
- **WHEN** ordinary OpenSpec apply instructions do not contain an approved planner constraint, risk treatment, semantic obligation, or evidence requirement
- **THEN** the executor wrapper supplies that context to the implementation agent
- **AND** the canonical apply capability does not supersede or discard the approved planner instructions

#### Scenario: Executor delegates without duplicating apply state
- **WHEN** the executor wrapper begins implementation or repair
- **THEN** it uses standard OpenSpec pending and completed task state
- **AND** does not maintain a second task queue, copy task prose into generated execution state, invent separate completion status, or reimplement the canonical apply loop

#### Scenario: Initial plan is absent or stale
- **WHEN** `/opsx:do` receives a change without current revision-bound approval
- **THEN** execution is refused
- **AND** the developer is directed to `/opsx:plan <change>`

#### Scenario: Plan becomes stale during do
- **WHEN** a planner disposition updates an authoritative artifact during an active `/opsx:do` loop
- **THEN** `/opsx:do` internally re-enters the existing planning workflow
- **AND** resumes execution only after the revised plan passes review and receives current approval

### Requirement: Status reports the complete lifecycle
OpenSpec Relay SHALL provide `/opsx:status <change>` to report discussion handoff or pause state when available, proposal confirmation, plan revision and approval, execution, review, repair, verification, assurance, outstanding or interrupted activity, validated resume action, and outstanding human actions without treating conversational discussion or a pause checkpoint as persistent planning truth.

#### Scenario: Plan approval is stale
- **WHEN** the developer requests status after an authoritative artifact changes
- **THEN** status identifies the stale approval and the next required planning action

#### Scenario: Human action is outstanding
- **WHEN** a semantic obligation, review fallback, accepted-risk decision, or UAT scenario requires human input
- **THEN** status reports the specific action and affected requirement or finding

#### Scenario: Lifecycle is deliberately paused
- **WHEN** the developer requests status for a paused change
- **THEN** status reports the paused stage, incomplete task or activity, relevant drift, outstanding dispatch state, and validated resume route

#### Scenario: No pause checkpoint exists
- **WHEN** status can infer a unique next action from current OpenSpec and Relay state without a pause record
- **THEN** it reports that reconstructed action and does not imply that a deliberate checkpoint was restored

### Requirement: Legacy run names are replaced
OpenSpec GSD SHALL contribute `do` and `status` in place of `run` and `run-status` and SHALL reconcile extension-owned generated commands and skills so the removed names do not remain active.

#### Scenario: Extension is upgraded
- **WHEN** a project reconciles the updated private OpenSpec GSD extension
- **THEN** generated `do` and `status` entry points are available
- **AND** extension-owned `run` and `run-status` entry points are removed

### Requirement: Every blocking assurance finding receives planner disposition
OpenSpec GSD SHALL submit every blocking code-review or goal-verification finding to the existing planner capability, which SHALL classify whether the finding is covered by the current plan, requires technical replanning, exposes material intent, needs planning-stage pathfinding, or lacks verification evidence before routing the resulting work.

#### Scenario: Implementation contradicts settled behavior
- **WHEN** review or verification finds that code violates an approved requirement
- **THEN** the planner determines whether the existing approved task already covers the defect
- **AND** when it does, associates the same finding with the original task, returns that task to pending state when necessary, and routes it back to the executor wrapper
- **AND** the wrapper delegates the repair through the canonical OpenSpec apply capability without inventing a duplicate gap plan or repair mechanism

#### Scenario: Plan cannot achieve a requirement
- **WHEN** execution or verification exposes an inadequate design, task, dependency, or verification strategy
- **THEN** the same planning capability used by `/opsx:plan` revises the authoritative artifacts as needed
- **AND** obtains plan review and renewed revision-bound approval
- **AND** returns control to the active `/opsx:do` loop automatically

#### Scenario: Finding requires a product decision
- **WHEN** resolving a finding would change observable behavior, scope, non-goals, compatibility, or an accepted semantic obligation
- **THEN** the planner routes the affected branch to `/opsx:discuss <change>` and requires human input
- **AND** after confirmed artifact updates, `/opsx:do` resumes through the existing planning workflow rather than a separate repair planner

### Requirement: Technical gaps repair without unnecessary human interruption
Within configured repair bounds, OpenSpec GSD SHALL allow the planner to triage whether the current plan remains adequate and the existing executor wrapper to repair findings within its authority through the canonical OpenSpec apply capability without asking the developer to choose safe technical details or manually reinvoke `/opsx:plan`.

#### Scenario: Executor can repair a bounded defect
- **WHEN** a defect can be fixed without changing authoritative intent
- **THEN** the planner confirms that the existing plan covers the defect and routes the same finding and original task to the executor wrapper
- **AND** the wrapper preserves the planner's repair and evidence instructions while delegating implementation through the canonical OpenSpec apply capability
- **AND** submits the stable finding for review or verification after repair

#### Scenario: Repair would change intent
- **WHEN** a proposed repair would weaken or alter an authoritative product commitment
- **THEN** automated repair stops and the finding routes to discussion

### Requirement: Do convergence is bounded and terminal
OpenSpec GSD SHALL continue technical planning, repair, review, and verification loops automatically while progress is possible and SHALL stop when all required review and verification pass, a material human decision is required, a required capability is unavailable, or bounded convergence is exhausted.

#### Scenario: Repair passes re-review
- **WHEN** a planner-dispositioned repair is independently verified and no blocking findings remain
- **THEN** `/opsx:do` continues to final goal verification or completes successfully

#### Scenario: Replanning converges
- **WHEN** a revised plan is approved and its repair passes code review and goal verification
- **THEN** `/opsx:do` completes without requiring the developer to invoke another lifecycle command

#### Scenario: Convergence is exhausted
- **WHEN** a blocking finding repeats unchanged, exceeds its bounded repair or replan attempts, or cannot be resolved with available capabilities
- **THEN** `/opsx:do` stops with `human_needed`
- **AND** reports the finding history, attempted dispositions, and next decision

### Requirement: Goal verification uses authoritative artifacts
The goal verifier SHALL establish completion against the current confirmed proposal, specs, design commitments, tasks, scenarios, invariants, and achieved assurance evidence and SHALL not treat a raw discussion transcript or executor self-report as a competing completion contract.

#### Scenario: Discussion result was compiled successfully
- **WHEN** proposal handoff confirmation succeeded and the artifacts remain current
- **THEN** the verifier uses those artifacts as the durable expression of the discussion result

#### Scenario: Verification exposes missing intent
- **WHEN** observable evidence reveals that the authoritative artifacts omit or contradict a material product decision
- **THEN** verification records an intent finding and routes it to targeted discussion
- **AND** does not choose between the transcript and artifacts itself

### Requirement: Semantic obligations participate in aggregate assurance
While a required semantic obligation, stale plan, blocking finding, or unresolved human disposition remains, the aggregate OpenSpec Relay assurance result SHALL prevent successful archive unless an allowed audited override is recorded. Relay runs SHALL use `relay.assurance`.

#### Scenario: Required semantic obligation is unresolved
- **WHEN** archive is requested before required semantic or modeling assurance is completed or accepted at a lower level
- **THEN** the aggregate assurance gate blocks archive and reports remediation

#### Scenario: Human accepts lower assurance
- **WHEN** the developer records an allowed downgrade with its reason and achieved level
- **THEN** verification and archive report the disposition accurately
- **AND** do not report the missing evidence as completed
