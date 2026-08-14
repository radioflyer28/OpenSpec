## Purpose

Guides human acceptance scenario by scenario and records durable evidence for behaviors automation cannot reliably establish.

## ADDED Requirements

### Requirement: UAT presents one acceptance scenario at a time
For each applicable human acceptance scenario projected from the current canonical OpenSpec scenario set and human-needed findings, Guardrails SHALL present the scenario identity, prerequisites, action to perform, expected observable result, and permitted dispositions before requesting a decision.

#### Scenario: Human begins an acceptance session
- **WHEN** a change has one or more unresolved human acceptance scenarios
- **THEN** Guardrails presents the next scenario without claiming a result on the human's behalf

#### Scenario: Session resumes after interruption
- **WHEN** a prior UAT session contains completed and unresolved scenarios
- **THEN** Guardrails preserves completed dispositions and resumes at the next unresolved scenario

#### Scenario: OpenSpec declares human acceptance scenarios
- **WHEN** current OpenSpec coverage contains applicable human scenarios
- **THEN** Guardrails persists those scenarios in canonical history and includes each unresolved scenario in the real UAT workflow

#### Scenario: Required UAT unexpectedly projects no scenarios
- **WHEN** human acceptance is required but no current evidence establishes either an applicable scenario or that human acceptance is not applicable
- **THEN** Guardrails fails closed with a projection error instead of satisfying the gate with an empty queue

### Requirement: UAT records evidence and explicit disposition
Each scenario SHALL be recorded as `passed`, `failed`, `blocked`, or `accepted_limitation` with human-provided notes and evidence references where available. A passing or accepted-limitation disposition SHALL require explicit human confirmation through the dedicated UAT action or a negotiated human-interaction stage. Actor identity MAY be retained as attribution, but executor, reviewer, verifier, and generic domain-result paths SHALL NOT submit a human disposition.

#### Scenario: User confirms expected behavior
- **WHEN** the human observes the expected result and explicitly marks the scenario passed
- **THEN** Guardrails records the confirmation, timestamp, actor when available, and attached evidence references

#### Scenario: Scenario cannot be performed
- **WHEN** an environmental or access constraint prevents the scenario from being exercised
- **THEN** Guardrails records it as blocked and keeps the associated gate unresolved

#### Scenario: Automated role submits a human disposition
- **WHEN** an executor, reviewer, verifier, or generic domain-result path attempts to mark a UAT scenario passed or accepted limitation
- **THEN** Guardrails rejects the disposition and keeps the scenario unresolved

#### Scenario: Host cannot obtain explicit human interaction
- **WHEN** a passing or accepted-limitation decision is required but the host cannot provide a dedicated user action or negotiated human-interaction stage
- **THEN** Guardrails preserves available notes and evidence, reports `human_needed`, and leaves the scenario unresolved

### Requirement: Failed UAT becomes linked repair work
When a scenario fails, Guardrails SHALL create or update a finding linked to the scenario, controlling requirement, relevant task, human observation, and submitted evidence. After repair, the original scenario SHALL be presented again for human confirmation.

#### Scenario: User observes incorrect behavior
- **WHEN** the human marks a scenario failed and describes the observed result
- **THEN** Guardrails records a blocking finding and routes it through repair and independent verification before retest

#### Scenario: Repair completes
- **WHEN** the linked finding is repaired and independently verified
- **THEN** the original UAT scenario returns to an unresolved state for human retest

### Requirement: Accepted limitations remain visible and auditable
An accepted limitation SHALL record the observed deviation, acceptance reason, scope, actor when available, timestamp, and any follow-up condition. It SHALL NOT be represented as behavior that passed as specified.

#### Scenario: User accepts a bounded limitation
- **WHEN** the human explicitly accepts a known deviation for the current change
- **THEN** Guardrails records the limitation as a human disposition and includes it in final status and archive evidence

### Requirement: Human acceptance gates fail closed
Guardrails SHALL keep a required human acceptance gate unresolved while any applicable scenario is failed, blocked, awaiting retest, or lacks explicit human disposition.

#### Scenario: Archive requested before UAT is complete
- **WHEN** one or more required acceptance scenarios remain unresolved
- **THEN** archive is blocked and reports the remaining human actions

#### Scenario: Attachment paths cross operating systems
- **WHEN** UAT evidence created on one supported platform is viewed on another
- **THEN** Guardrails resolves portable project-relative references or reports unavailable external evidence without losing the recorded disposition

#### Scenario: Accepted implementation or requirement changes materially
- **WHEN** a material controlling OpenSpec artifact or cited implementation revision changes after a UAT disposition
- **THEN** Guardrails invalidates the affected acceptance and requires human retest before archive

#### Scenario: Accepted evidence changes materially
- **WHEN** an evidence attachment or recorded evidence digest associated with a passing or accepted-limitation disposition changes
- **THEN** Guardrails invalidates the affected acceptance and requires renewed explicit human confirmation
