## Purpose

Verifies that release-relevant changes produce installable artifacts whose public behavior, metadata, upgrade path, and rollback evidence match the OpenSpec contract.

## ADDED Requirements

### Requirement: Release assurance activates conditionally and transparently
Guardrails SHALL activate release assurance when changed artifacts, OpenSpec metadata, repository configuration, or explicit user configuration identifies a package, CLI, plugin, or other public distribution. The activation reason and selected checks SHALL be reported.

#### Scenario: Package metadata changes
- **WHEN** a change modifies a distributable package or its public entry points
- **THEN** Guardrails activates the applicable release checks and records the triggering evidence

#### Scenario: Change is not distributable
- **WHEN** no configured or detected release surface is affected
- **THEN** Guardrails records release assurance as not applicable without running packaging commands

### Requirement: Verification uses the distributable artifact
Guardrails SHALL build or pack the release candidate, record an artifact identity, inspect its published contents and dependency metadata, install it in a clean temporary environment, and exercise applicable public exports, binaries, commands, or plugin entry points.

#### Scenario: Source tests pass but package omits a required file
- **WHEN** the packed artifact lacks a file required by a declared public entry point
- **THEN** release assurance fails despite source-workspace tests passing

#### Scenario: Clean installation succeeds
- **WHEN** the artifact installs in a clean environment and its declared public entry points behave as specified
- **THEN** Guardrails records passing installation and public-surface evidence against that artifact identity

### Requirement: Release metadata matches the public change
Guardrails SHALL verify applicable versioning, compatibility ranges, release notes or changesets, package metadata, and documented installation instructions against the declared public-contract impact.

#### Scenario: Public behavior changes without release tracking
- **WHEN** repository policy requires a changeset or release note for the affected public surface and none exists
- **THEN** release assurance fails with the missing release obligation

#### Scenario: Compatibility range excludes the tested dependency
- **WHEN** the candidate was tested against a dependency version outside its declared compatibility range
- **THEN** release assurance fails and identifies the metadata mismatch

### Requirement: Upgrade and rollback behavior is evaluated when applicable
For changes affecting stored data, configuration, protocols, or installed state, Guardrails SHALL exercise an applicable upgrade path and SHALL require rollback evidence or an explicit, human-approved statement that rollback is unavailable or destructive.

#### Scenario: Upgrade preserves supported user state
- **WHEN** a previous supported artifact is upgraded to the release candidate in an isolated environment
- **THEN** Guardrails verifies the declared state and public behavior after upgrade

#### Scenario: Rollback is irreversible
- **WHEN** the change performs a transformation that cannot be safely reversed
- **THEN** release assurance requires an explicit migration warning and human disposition rather than claiming rollback support

### Requirement: Release assurance avoids unapproved external publication
Release verification SHALL operate on local or isolated release candidates and SHALL NOT publish packages, create releases, modify remote registries, or perform destructive rollback against user data without separate explicit authorization.

#### Scenario: Candidate passes all release checks
- **WHEN** release assurance completes successfully
- **THEN** Guardrails reports readiness to publish without publishing automatically

### Requirement: Required release evidence is portable or explicitly escalated
Applicable deterministic release checks SHALL run equivalently on supported operating systems. When a required platform, registry, credential, or human environment is unavailable, Guardrails SHALL return `human_needed` or fail according to policy rather than silently passing.

#### Scenario: Platform-specific CLI artifact is affected
- **WHEN** a release declares support for Windows, macOS, and Linux behavior
- **THEN** release assurance requires evidence for each applicable platform or records the missing platform as unresolved

