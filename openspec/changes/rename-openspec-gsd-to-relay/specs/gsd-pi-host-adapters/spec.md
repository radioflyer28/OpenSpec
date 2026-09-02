## ADDED Requirements

### Requirement: Pi exposes the canonical Relay package surface

The Pi package SHALL register `openspec_relay_workflow`, place the `openspec-relay` CLI on the hosted command path, and generate the established `/opsx:*` workflows under the OpenSpec Relay identity without changing capability qualification, role authority, provenance, concurrency, or fallback semantics.

#### Scenario: Relay is loaded by Pi
- **WHEN** Pi loads the package from the public Relay repository or a local Relay checkout
- **THEN** `openspec_relay_workflow` is available for plan, do, check, and status operations
- **AND** its result reports the same qualified capability profile required by the existing Pi adapter contract

#### Scenario: Legacy Pi tool name is requested
- **WHEN** a host or generated instruction requests `openspec_gsd_workflow` after the migration compatibility window
- **THEN** Relay reports the canonical `openspec_relay_workflow` replacement
- **AND** does not register two independently operating workflow tools that could produce competing execution state
