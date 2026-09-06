# relay-product-identity Specification

## Purpose

Give the public extension one coherent, distinctive identity through a bounded pre-1.0 replacement of its earlier development names.

## Requirements

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

### Requirement: Upgrade guidance covers every persisted integration surface

OpenSpec Relay SHALL document a bounded upgrade procedure for the renamed Git repository, Pi package source, OpenSpec extension link and lockfile, CLI, disposable pre-release execution records, and rollback. Because no pre-Relay execution records were deployed, Relay SHALL use `.openspec-relay` only and SHALL direct developers to verify, remove, and regenerate any local `.openspec-gsd` development records rather than providing runtime record or gate migration. Doctor output SHALL identify an enabled legacy `gsd` link or unresolved identity conflict and provide specific installation remediation.

#### Scenario: Existing project still links the legacy extension ID
- **WHEN** Relay doctor examines a project whose lockfile or generated contributions still resolve `gsd`
- **THEN** it reports the exact relink, enable, reconcile, and verification actions required for `relay`
- **AND** it directs the developer to inspect disposable pre-release records before removing the old installation

#### Scenario: Local pre-release records are replaced
- **WHEN** a developer finds `.openspec-gsd` records created during local development
- **THEN** the upgrade procedure requires confirmation that no active work depends on them before removal
- **AND** a fresh Relay run regenerates evidence under `.openspec-relay`

#### Scenario: Upgrade does not qualify
- **WHEN** package, doctor, workflow, or archive-gate qualification fails
- **THEN** the documented rollback restores the prior checkout or packed artifact and its compatible extension link

### Requirement: Public documentation describes provenance accurately

OpenSpec Relay SHALL credit the GSD and grilling sources that materially inspired or were incorporated into its workflows while clearly stating that Relay uses selected workflow ideas without adopting GSD milestone, phase, roadmap, or persistent project-state machinery.

#### Scenario: User evaluates project scope
- **WHEN** a user reads the public README and third-party notices
- **THEN** the documents explain the OpenSpec source-of-truth boundary, Relay's role-based lifecycle, relevant attribution, and the absence of claimed affiliation with upstream OpenSpec or GSD projects
