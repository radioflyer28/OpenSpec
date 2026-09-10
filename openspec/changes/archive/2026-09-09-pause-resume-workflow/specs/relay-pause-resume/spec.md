## Purpose

Let developers deliberately suspend and safely continue an OpenSpec Relay lifecycle across fresh agent contexts without duplicating authoritative OpenSpec planning state.

## ADDED Requirements

### Requirement: Pause settles work at a safe boundary
OpenSpec Relay SHALL provide `/opsx:pause [change]` to stop scheduling new work, preserve already completed task and assurance evidence, and settle the current activity at an observable safe boundary before reporting the lifecycle as paused.

#### Scenario: Current atomic activity settles
- **WHEN** pause is requested while an artifact or generated record is being updated
- **THEN** Relay finishes or safely rejects that atomic update before recording the pause
- **AND** reports which activity and OpenSpec task remain incomplete

#### Scenario: Pause cannot establish a safe boundary
- **WHEN** an active mutation or external operation cannot be stopped or observed safely
- **THEN** Relay does not claim that the lifecycle is fully paused
- **AND** reports the continuing or unknown activity and the action needed before safe resumption

#### Scenario: Pause is repeated
- **WHEN** the developer pauses an already paused lifecycle without intervening progress
- **THEN** Relay preserves the existing checkpoint without duplicating task, evidence, or dispatch state
- **AND** returns the same effective resume route

### Requirement: Pause records a bounded non-authoritative checkpoint
Relay SHALL record the change and run identity, authoritative plan revision, lifecycle stage, active task identifiers, activity identity, repository revision, changed-file paths, outstanding dispatch references, unresolved human actions, and next existing workflow needed to continue. The checkpoint SHALL reference rather than reproduce OpenSpec requirement, design, or task prose.

#### Scenario: Implementation pauses with workspace changes
- **WHEN** a developer pauses during an incomplete implementation task
- **THEN** the checkpoint identifies the task and changed-file paths without copying file contents or task prose
- **AND** OpenSpec task state remains the authoritative record of completion

#### Scenario: Planning or review pauses
- **WHEN** planning, pathfinding, code review, or goal verification pauses
- **THEN** the checkpoint references the current revision, stable finding identifiers, and any validated dispatch receipt
- **AND** does not persist private reasoning or an executor or reviewer self-assessment as authoritative evidence

#### Scenario: Checkpoint path is rendered on any supported platform
- **WHEN** Relay creates or reads a pause checkpoint on macOS, Linux, or Windows
- **THEN** it resolves the path within the selected project and change using the host platform's path rules
- **AND** rejects an alias or traversal that resolves outside the owned generated-state root

### Requirement: Active dispatch state remains truthful across pause
Relay SHALL classify every outstanding role or external activity as safely stopped, still running, terminally interrupted, or unknown using host evidence and SHALL NOT convert an unavailable or stale dispatch into completed assurance.

#### Scenario: Host confirms cancellation
- **WHEN** a qualified host acknowledges cancellation at a safe role boundary
- **THEN** Relay records the dispatch as safely stopped
- **AND** a later result from that cancelled dispatch cannot satisfy current assurance

#### Scenario: External activity continues
- **WHEN** an external activity cannot or should not be cancelled
- **THEN** Relay retains its dispatch or job reference as still running
- **AND** resume checks that activity before scheduling replacement work

#### Scenario: Host session disappears
- **WHEN** Relay cannot establish whether an outstanding role stopped
- **THEN** it records the role as interrupted or unknown
- **AND** requires a newly validated session or fresh-context replacement before accepting further role evidence

### Requirement: Resume validates state before continuing
OpenSpec Relay SHALL provide `/opsx:resume [change]` to compare the checkpoint with current OpenSpec artifacts, task state, Relay canonical history, repository revision, workspace changes, human actions, and dispatch state before continuing.

#### Scenario: One safe resume route exists
- **WHEN** checkpoint identities remain current and exactly one existing workflow is the safe next action
- **THEN** Relay reports the restored context and continues through that discuss, propose or update, plan, do, debug, UAT, or archive workflow without requiring a redundant confirmation
- **AND** records that the checkpoint was resumed

#### Scenario: Authoritative artifacts changed while paused
- **WHEN** proposal, specification, design, or task content no longer matches the checkpoint's authoritative revision
- **THEN** Relay refuses to continue from stale instructions
- **AND** routes the change through status and planning or discussion as required by the changed intent

#### Scenario: Workspace no longer matches
- **WHEN** the repository revision or relevant workspace changes differ from the checkpoint
- **THEN** Relay reports the drift and does not overwrite or discard current files
- **AND** requires reconciliation before mutation resumes

#### Scenario: No checkpoint exists
- **WHEN** resume is requested for a change without a deliberate pause record
- **THEN** Relay reconstructs the safest next action from current OpenSpec and canonical Relay state
- **AND** clearly labels the result as reconstructed rather than checkpoint-restored

#### Scenario: Multiple changes or routes are plausible
- **WHEN** Relay cannot uniquely identify the intended change or safe next workflow
- **THEN** it presents the material alternatives and waits for developer selection
- **AND** does not infer scope from recency alone

### Requirement: Pre-proposal discussion can pause without becoming planning truth
During `/opsx:discuss`, Relay SHALL allow a pause checkpoint to preserve only confirmed material decisions, rejected major alternatives, unresolved material questions, and the current design-tree frontier under a working discussion identity. It SHALL NOT persist a raw transcript or treat the checkpoint as an approved proposal.

#### Scenario: Discussion pauses before a change exists
- **WHEN** a developer pauses after confirming some material decisions but before `openspec-propose` creates a change
- **THEN** Relay records a bounded ephemeral discussion checkpoint and provides a resume identity
- **AND** leaves unconfirmed branches visibly unresolved

#### Scenario: Discussion resumes
- **WHEN** a fresh agent resumes a current discussion checkpoint
- **THEN** it presents the confirmed understanding and next material decision in plain product language
- **AND** continues the existing grilling-style design tree without repeating settled questions

#### Scenario: Proposal absorbs the discussion
- **WHEN** the developer confirms that current OpenSpec artifacts faithfully incorporate the settled discussion
- **THEN** Relay marks the discussion checkpoint consumed or removes it from active resume candidates
- **AND** the proposal, specifications, design, and tasks become the durable planning truth

### Requirement: Pause preserves explicit Git authority
Pause and resume SHALL report relevant Git and workspace state but SHALL NOT create commits, branches, or worktrees unless the developer separately grants that authority through an existing supported capability.

#### Scenario: Default pause has uncommitted changes
- **WHEN** pause detects modified or untracked files without Git automation opt-in
- **THEN** Relay records or reports their paths and leaves them unchanged
- **AND** does not create a WIP commit

#### Scenario: Resume follows a recorded Git operation
- **WHEN** an explicitly authorized Git operation occurred while pausing
- **THEN** resume validates the resulting revision before continuing
- **AND** does not assume that repository mutation proves task completion
