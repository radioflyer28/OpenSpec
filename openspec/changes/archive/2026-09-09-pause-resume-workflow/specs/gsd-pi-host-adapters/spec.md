## MODIFIED Requirements

### Requirement: Pi exposes the canonical Relay package surface

The Pi package SHALL register `openspec_relay_workflow`, place the `openspec-relay` CLI on the hosted command path, and generate the established `/opsx:*` workflows under the OpenSpec Relay identity without changing capability qualification, role authority, provenance, concurrency, pause/resume truthfulness, or fallback semantics.

#### Scenario: Relay is loaded by Pi
- **WHEN** Pi loads the package from the public Relay repository or a local Relay checkout
- **THEN** `openspec_relay_workflow` is available for plan, do, check, status, pause, and resume operations
- **AND** its result reports the same qualified capability profile required by the existing Pi adapter contract

#### Scenario: Pi package surface is inspected after replacement
- **WHEN** the old local Pi package link has been removed and OpenSpec Relay is installed
- **THEN** Pi registers `openspec_relay_workflow`
- **AND** does not retain `openspec_gsd_workflow` as an executable alias

#### Scenario: Pi pauses with outstanding role dispatches
- **WHEN** pause is requested while Pi roles are outstanding
- **THEN** the adapter uses qualified host evidence to report each request as safely stopped, still running, interrupted, or unknown
- **AND** resume cannot accept stale-session results as current assurance
