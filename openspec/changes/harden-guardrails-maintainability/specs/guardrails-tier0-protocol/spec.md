## Purpose

Provide a complete sequential execution and evidence-recording protocol that works on every supported OpenSpec host without requiring subagents, worktrees, or automated Git operations.

## ADDED Requirements

### Requirement: Tier 0 can execute a complete guarded run
Guardrails SHALL provide a host-neutral Tier 0 protocol for starting, progressing, checking, and completing every task in an OpenSpec change sequentially.

#### Scenario: Start a Tier 0 run
- **WHEN** a user starts a Guardrails run without a supported higher-tier adapter
- **THEN** Guardrails compiles the current OpenSpec artifacts into a dependency-safe sequential order
- **AND** reports the first actionable task and required assurance outcomes

#### Scenario: Complete tasks sequentially
- **WHEN** the host records a task as complete with its required evidence
- **THEN** Guardrails reconciles the authoritative OpenSpec task state
- **AND** reports the next dependency-satisfied task

#### Scenario: Task is blocked
- **WHEN** execution cannot complete the current task
- **THEN** Guardrails records the blocker against that OpenSpec task identifier
- **AND** stops dependent execution without creating a phase or milestone state

### Requirement: Tier 0 exposes structured recording commands
Guardrails SHALL expose stable CLI or library operations for recording task transitions, check evidence, findings, deviations, repair attempts, and human decisions without direct editing of generated JSON files.

#### Scenario: Record an event successfully
- **WHEN** a host submits a valid structured execution or assurance event for the active run
- **THEN** Guardrails validates its run, task, check, and source references
- **AND** atomically updates the generated run or assurance record
- **AND** returns one structured result describing the accepted event

#### Scenario: Duplicate event is retried
- **WHEN** a host repeats an event with the same event identifier and content
- **THEN** Guardrails treats the retry idempotently
- **AND** does not duplicate evidence, findings, deviations, or repairs

#### Scenario: Conflicting duplicate event
- **WHEN** a host reuses an event identifier with different content
- **THEN** Guardrails rejects the event with a conflict diagnostic

#### Scenario: Generated file is edited directly
- **WHEN** generated state no longer matches its recorded digest or schema
- **THEN** Guardrails blocks assurance evaluation
- **AND** directs the user to reconcile through the supported protocol

### Requirement: TDD evidence is source-bound and ordered
Tier 0 SHALL record enough observable evidence to establish relevant RED, GREEN, and REFACTOR states for every task that requires TDD.

#### Scenario: Valid RED evidence
- **WHEN** a task-relevant check fails before implementation begins for a non-pre-existing reason
- **THEN** Guardrails records the command or check identity, result, output digest, observed source state, and time as RED evidence

#### Scenario: GREEN and REFACTOR complete the sequence
- **WHEN** the same relevant check passes in a changed implementation state and still passes after cleanup
- **THEN** Guardrails accepts the ordered RED–GREEN–REFACTOR sequence

#### Scenario: Unbound or fabricated fail-first claim
- **WHEN** evidence lacks observable output, uses an unchanged source state, occurs after implementation began, or represents a pre-existing failure
- **THEN** Guardrails rejects it as satisfying the TDD gate

### Requirement: Independent assurance results have explicit provenance
Tier 0 SHALL record checker and verification results with provenance that distinguishes executor claims, automated checks, reviewers, verifiers, and human decisions.

#### Scenario: Executor records completion
- **WHEN** an executor reports that implementation is complete
- **THEN** Guardrails records the claim as executor-origin evidence
- **AND** does not use that claim alone to pass independent review or goal verification

#### Scenario: Read-only verification is recorded
- **WHEN** a reviewer or verifier evaluates the current OpenSpec requirements and observable evidence under a read-only contract
- **THEN** Guardrails records structured findings, affected requirement identifiers, evidence references, and provenance

#### Scenario: Specialist checker is required
- **WHEN** deterministic routing selects security, integration, UI, AI evaluation, compatibility, documentation, or human UAT
- **THEN** the run cannot pass until a valid result or permitted human decision is recorded for that checker

### Requirement: Deviations and repairs stay within OpenSpec scope
Tier 0 SHALL bind deviations and bounded repair attempts to the controlling OpenSpec task and requirement references.

#### Scenario: Execution discovers additional work
- **WHEN** a host records a deviation outside the current task description
- **THEN** Guardrails records it against the affected task and requirements
- **AND** requires an explicit disposition before silently expanding scope

#### Scenario: Repair changes relevant material
- **WHEN** a failed check is repaired within its attempt limit
- **THEN** Guardrails records the changed source or evidence references and the rerun result

#### Scenario: Repair limit is exhausted
- **WHEN** the configured repair limit is reached without a passing result
- **THEN** Guardrails stops automatic repair and records that user direction is required

### Requirement: Human acceptance is available through the portable protocol
Tier 0 SHALL provide an explicit operation for recording human acceptance of the current human-needed gate result and evidence state.

#### Scenario: Human accepts current evidence
- **WHEN** an authorized human accepts a human-needed result through the supported protocol
- **THEN** Guardrails records the actor and time
- **AND** OpenSpec binds acceptance to the current result and evidence digests

#### Scenario: Accepted evidence changes
- **WHEN** the relevant result, evidence, or controlling OpenSpec artifact changes after acceptance
- **THEN** the prior acceptance becomes stale
- **AND** archive blocks until renewed acceptance or an audited override

### Requirement: Tier 0 is cross-platform and non-mutating by default
Tier 0 SHALL behave consistently on macOS, Linux, and Windows and SHALL not create commits, branches, or worktrees without explicit authorization.

#### Scenario: Change path uses platform-specific syntax
- **WHEN** the project or change path contains Windows separators, drive syntax, spaces, or an existing filesystem alias
- **THEN** Guardrails resolves the same contained OpenSpec change
- **AND** stores portable change-relative evidence references where possible

#### Scenario: Default sequential run
- **WHEN** no Git automation options are enabled
- **THEN** Guardrails completes the Tier 0 protocol without creating commits, branches, or worktrees

#### Scenario: Higher tier is unavailable
- **WHEN** a user requests Tier 1 or Tier 2 but the host cannot provide the required capabilities
- **THEN** Guardrails reports the missing capabilities
- **AND** falls back to Tier 0 only when every requested assurance outcome remains enforceable
