## Purpose

Preserves disciplined, resumable investigations when bounded repair cannot resolve a failed check, finding, or acceptance scenario.

## ADDED Requirements

### Requirement: Exhausted repair transitions into a scientific debugging session
When the configured repair limit is exhausted without resolving a blocking failure, Guardrails SHALL create or resume a debugging session linked to the originating task, requirement, scenario, or finding. Users MAY also explicitly start a session for an unresolved failure.

#### Scenario: Repair attempts are exhausted
- **WHEN** a blocking failure remains after the allowed repair attempts
- **THEN** Guardrails preserves the failed evidence and opens a debugging session instead of repeating the same repair loop

#### Scenario: Existing investigation is resumed
- **WHEN** an unresolved failure already has an active debugging session
- **THEN** Guardrails resumes that session with its prior hypotheses and experiments rather than creating a duplicate investigation

### Requirement: Sessions distinguish hypotheses, experiments, observations, and conclusions
Each debugging session SHALL record testable hypotheses, planned experiments, executed actions, observed results, conclusions, root-cause claims, changed evidence references, and the evidence supporting or rejecting each hypothesis. A root-cause conclusion SHALL be distinct from the original symptom and SHALL cite the observations that support it.

#### Scenario: Experiment rejects a hypothesis
- **WHEN** observed evidence contradicts the active hypothesis
- **THEN** Guardrails records the hypothesis as rejected and preserves the experiment and observation that rejected it

#### Scenario: Root cause is claimed without evidence
- **WHEN** a participant proposes a root cause that is not supported by a recorded experiment or observation
- **THEN** the session remains unresolved and requests supporting evidence

#### Scenario: Controlling evidence changes during investigation
- **WHEN** a source, specification, task, or other evidence reference material to the active investigation changes
- **THEN** Guardrails records the changed reference and reevaluates affected hypotheses, conclusions, and next actions

### Requirement: Repeated unsuccessful experiments are detected
Guardrails SHALL identify materially repeated experiments against unchanged relevant state and SHALL require a new hypothesis, changed evidence, or human direction before continuing.

#### Scenario: Same unsuccessful experiment is proposed again
- **WHEN** a proposed experiment is materially equivalent to a recorded unsuccessful experiment and relevant evidence has not changed
- **THEN** Guardrails blocks the repetition and presents the earlier result

### Requirement: Debugging sessions are safely resumable
Guardrails SHALL persist sufficient session state to resume after process exit or host-context loss, including the failure under investigation, current hypotheses, experiments, observations, changed files, unresolved questions, and next safe action.

#### Scenario: Process exits during investigation
- **WHEN** the debugging workflow is restarted for the same change and session
- **THEN** Guardrails reconstructs the investigation state without relying on conversation history

#### Scenario: Session is resumed on another supported platform
- **WHEN** a session created on one supported operating system is read on another
- **THEN** its logical evidence references remain valid or are reported as unavailable with remediation guidance

### Requirement: Defect resolution includes regression proof
A debugging session resolving a behavior defect SHALL require a relevant regression test or deterministic check that fails for the defect and passes after the fix. A non-applicable exemption SHALL include a recorded reason and independent acceptance.

#### Scenario: Defect is fixed with regression evidence
- **WHEN** the root cause is corrected and the associated regression check passes
- **THEN** Guardrails may resolve the debugging session after independent verification of the evidence

#### Scenario: Fix lacks regression proof
- **WHEN** implementation changes appear to remove the symptom but no applicable regression evidence exists
- **THEN** the debugging session remains unresolved

#### Scenario: Archive requested with unresolved debugging
- **WHEN** a blocking failure has an active, unresolved, or human-needed debugging session
- **THEN** archive remains blocked and reports the investigation action still required
