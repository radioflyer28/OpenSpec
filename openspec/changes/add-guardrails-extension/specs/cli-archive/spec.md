## ADDED Requirements

### Requirement: Required extension gates
Before changing specs or moving a change, the archive command SHALL evaluate every required gate recorded by an active extension workflow for that change.

#### Scenario: All required gates pass
- **WHEN** every required gate returns `pass` or has valid recorded human acceptance
- **THEN** archive continues with its existing validation, confirmation, spec update, and move behavior

#### Scenario: Required gate fails
- **WHEN** any required gate returns `fail`
- **THEN** archive stops before changing specs or moving the change
- **AND** reports the gate identifier, summary, evidence references, and remediation guidance

#### Scenario: Required gate errors
- **WHEN** a required gate cannot complete and returns `error`
- **THEN** archive fails closed before changing files
- **AND** distinguishes the gate execution error from an assurance failure

#### Scenario: Required gate needs human action
- **WHEN** a required gate returns `human_needed` without valid recorded acceptance
- **THEN** archive blocks and reports the required human action

#### Scenario: Required gate provider unavailable
- **WHEN** a change records a required gate but its extension is disabled, incompatible, missing, or cannot load
- **THEN** archive treats the gate as unavailable and blocks
- **AND** suggests restoring or diagnosing the extension or using an audited override

#### Scenario: Warning result
- **WHEN** a required gate returns `warn`
- **THEN** archive displays or returns the warning
- **AND** does not block solely because of that warning

### Requirement: Audited gate overrides
The archive command SHALL require both a gate identifier and a non-empty reason to override a blocking required gate.

#### Scenario: Complete override
- **WHEN** a user passes `--override-gate <id> --reason <text>` for a currently blocking gate
- **THEN** archive records the gate result, reason, timestamp, and actor when available
- **AND** may continue past that named gate

#### Scenario: Missing override reason
- **WHEN** `--override-gate` is provided without `--reason`
- **THEN** archive rejects the override before changing files

#### Scenario: Reason without gate identifier
- **WHEN** `--reason` is provided without `--override-gate`
- **THEN** archive rejects the override before changing files

#### Scenario: Override does not cover another gate
- **WHEN** one gate has a valid override but another required gate remains blocking
- **THEN** archive remains blocked by the other gate

#### Scenario: Unknown gate identifier
- **WHEN** the requested override identifier is not a required blocking gate for the change
- **THEN** archive rejects the override and lists the currently blocking gate identifiers

### Requirement: Recorded human gate acceptance
The archive command SHALL recognize explicit human acceptance tied to the current gate result and change state.

#### Scenario: Current acceptance
- **WHEN** a `human_needed` gate has acceptance recorded for its current result and evidence state
- **THEN** archive treats that gate as satisfied

#### Scenario: Stale acceptance
- **WHEN** the gate result or referenced change evidence has changed since acceptance was recorded
- **THEN** archive treats the acceptance as stale and blocks for renewed acceptance

### Requirement: Gate results in archive output
Archive SHALL expose gate evaluation and override information in human-readable and JSON output.

#### Scenario: Human-readable blocked archive
- **WHEN** a required gate blocks archival in human-readable mode
- **THEN** output identifies each blocking gate and provides a recovery action

#### Scenario: JSON blocked archive
- **WHEN** a required gate blocks `archive --json`
- **THEN** stdout contains one JSON document with no archive result, a non-zero status, and structured gate diagnostics

#### Scenario: Successful overridden archive
- **WHEN** archive succeeds with one or more gate overrides
- **THEN** its result identifies the overridden gates
- **AND** the audit record moves with the archived change
