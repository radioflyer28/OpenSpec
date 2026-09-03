## ADDED Requirements

### Requirement: Pi exposes the canonical Relay package surface

The Pi package SHALL register `openspec_relay_workflow`, place the `openspec-relay` CLI on the hosted command path, and generate the established `/opsx:*` workflows under the OpenSpec Relay identity without changing capability qualification, role authority, provenance, concurrency, or fallback semantics.

#### Scenario: Relay is loaded by Pi
- **WHEN** Pi loads the package from the public Relay repository or a local Relay checkout
- **THEN** `openspec_relay_workflow` is available for plan, do, check, and status operations
- **AND** its result reports the same qualified capability profile required by the existing Pi adapter contract

#### Scenario: Pi package surface is inspected after replacement
- **WHEN** the old local Pi package link has been removed and OpenSpec Relay is installed
- **THEN** Pi registers `openspec_relay_workflow`
- **AND** does not retain `openspec_gsd_workflow` as an executable alias
