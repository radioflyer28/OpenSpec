## MODIFIED Requirements

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
