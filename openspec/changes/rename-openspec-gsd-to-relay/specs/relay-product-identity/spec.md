## Purpose

Give the public extension one coherent, distinctive identity while safely carrying existing users and active assurance records from the pre-Relay names.

## ADDED Requirements

### Requirement: Public surfaces use the Relay identity

The project SHALL present itself as **OpenSpec Relay** through the canonical repository `radioflyer28/openspec-relay`, package `openspec-relay`, CLI `openspec-relay`, extension ID `relay`, Pi tool `openspec_relay_workflow`, generated-record directory `.openspec-relay`, assurance gate `relay.assurance`, and patched OpenSpec version `1.11.0-relay.1`.

#### Scenario: User installs from the public repository
- **WHEN** a user runs `pi install https://github.com/radioflyer28/openspec-relay`
- **THEN** Pi loads the OpenSpec Relay package and its workflows
- **AND** package diagnostics identify the product as OpenSpec Relay

#### Scenario: Package surfaces are inspected
- **WHEN** the repository, packed artifact, CLI metadata, manifest, Pi extension, or generated diagnostics are inspected
- **THEN** each canonical public identifier matches the Relay identity assigned to that surface

### Requirement: Lifecycle entry points remain stable

OpenSpec Relay SHALL continue to provide `/opsx:discuss`, `/opsx:plan`, `/opsx:do`, `/opsx:check`, `/opsx:uat`, `/opsx:debug`, and `/opsx:status` without requiring users to learn product-prefixed replacements.

#### Scenario: Existing workflow is reconciled after rename
- **WHEN** an existing project links and enables OpenSpec Relay
- **THEN** the established `/opsx:*` lifecycle entry points remain available with Relay-owned generated content
- **AND** reconciliation does not create duplicate GSD-prefixed workflow entry points

### Requirement: Legacy execution records migrate without losing authority

OpenSpec Relay SHALL recognize a change's existing `.openspec-gsd` records, validate their integrity, and migrate them to `.openspec-relay` before writing new execution events. The migration SHALL select one canonical record set and SHALL preserve event identity, evidence, findings, dispositions, approvals, and audit history on macOS, Linux, and Windows.

#### Scenario: Active change contains valid legacy records
- **WHEN** Relay first operates on an active change containing `.openspec-gsd` and no `.openspec-relay`
- **THEN** the validated legacy state is migrated to `.openspec-relay`
- **AND** subsequent writes target only `.openspec-relay`
- **AND** status identifies the migration without changing the achieved assurance result

#### Scenario: Both record directories exist
- **WHEN** an active change contains both `.openspec-gsd` and `.openspec-relay`
- **THEN** Relay refuses to combine or overwrite the records automatically
- **AND** reports deterministic recovery guidance identifying both paths using the host platform's path conventions

#### Scenario: Legacy records fail integrity validation
- **WHEN** `.openspec-gsd` contains invalid or tampered execution state
- **THEN** migration fails closed
- **AND** the invalid records remain available for diagnosis

### Requirement: Legacy assurance gates remain enforceable

OpenSpec Relay SHALL register `relay.assurance` for new runs and SHALL continue to honor a required `gsd.assurance` result recorded for an active or archived legacy run. Migration SHALL preserve gate results, acceptances, overrides, actors, timestamps, reasons, and evidence digests.

#### Scenario: Legacy gate is unresolved
- **WHEN** archive is requested for an active change whose required `gsd.assurance` result is blocking or unresolved
- **THEN** archive remains blocked after installing Relay
- **AND** the user receives remediation that does not require disabling the legacy extension to bypass the gate

#### Scenario: Legacy gate has an audited disposition
- **WHEN** a valid acceptance or override was recorded for `gsd.assurance`
- **THEN** migration preserves that disposition and its audit evidence
- **AND** does not require the user to manufacture a second approval under `relay.assurance`

### Requirement: Upgrade guidance covers every persisted integration surface

OpenSpec Relay SHALL document a bounded upgrade procedure for the renamed Git repository, Pi package source, OpenSpec extension link and lockfile, CLI, active execution records, and rollback. Doctor output SHALL identify an enabled legacy `gsd` link or unresolved identity conflict and provide specific remediation.

#### Scenario: Existing project still links the legacy extension ID
- **WHEN** Relay doctor examines a project whose lockfile or generated contributions still resolve `gsd`
- **THEN** it reports the exact relink, enable, reconcile, and verification actions required for `relay`
- **AND** it does not silently discard a required legacy gate

#### Scenario: Upgrade does not qualify
- **WHEN** package, migration, doctor, workflow, or archive-gate qualification fails
- **THEN** the documented rollback restores the prior checkout or packed artifact and its compatible extension link

### Requirement: Public documentation describes provenance accurately

OpenSpec Relay SHALL credit the GSD and grilling sources that materially inspired or were incorporated into its workflows while clearly stating that Relay uses selected workflow ideas without adopting GSD milestone, phase, roadmap, or persistent project-state machinery.

#### Scenario: User evaluates project scope
- **WHEN** a user reads the public README and third-party notices
- **THEN** the documents explain the OpenSpec source-of-truth boundary, Relay's role-based lifecycle, relevant attribution, and the absence of claimed affiliation with upstream OpenSpec or GSD projects
