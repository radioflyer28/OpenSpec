## MODIFIED Requirements

### Requirement: Lifecycle entry points remain stable

OpenSpec Relay SHALL continue to provide `/opsx:discuss`, `/opsx:plan`, `/opsx:do`, `/opsx:check`, `/opsx:uat`, `/opsx:debug`, `/opsx:status`, `/opsx:pause`, and `/opsx:resume` without requiring users to learn product-prefixed replacements.

#### Scenario: Existing workflow is reconciled after rename
- **WHEN** an existing project links and enables OpenSpec Relay
- **THEN** the established `/opsx:*` lifecycle entry points remain available with Relay-owned generated content
- **AND** reconciliation does not create duplicate GSD-prefixed workflow entry points

#### Scenario: Existing Relay installation gains pause and resume
- **WHEN** a project reconciles a Relay version that contributes pause and resume
- **THEN** generated `/opsx:pause` and `/opsx:resume` workflows are available alongside the established Relay lifecycle
- **AND** existing Relay run and assurance records remain readable
