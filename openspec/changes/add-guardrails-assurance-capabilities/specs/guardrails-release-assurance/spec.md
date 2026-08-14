## Purpose

Verifies that release-relevant changes produce installable private artifacts whose contents, metadata, installation behavior, and public surfaces match the OpenSpec contract.

## ADDED Requirements

### Requirement: Release assurance activates conditionally and transparently
Guardrails SHALL derive changed artifacts and release surfaces from current repository state, OpenSpec metadata, manifests, and explicit user configuration, and SHALL activate release assurance when that evidence identifies a package, CLI, plugin, or other public distribution. Candidates SHALL use a simple identity composed of surface kind and manifest or configured identity. Explicit disablement with a reason takes precedence over enabled configuration, and enabled configuration takes precedence over automatic discovery. Configuration matching an automatically discovered non-applicable candidate SHALL promote that candidate to applicable without creating a duplicate. The activation reason and selected checks SHALL be reported.

#### Scenario: Package metadata changes
- **WHEN** a change modifies a distributable package or its public entry points
- **THEN** Guardrails activates the applicable release checks and records the triggering evidence

#### Scenario: Change is not distributable
- **WHEN** no configured or detected release surface is affected
- **THEN** Guardrails records release assurance as not applicable without running packaging commands

#### Scenario: CLI caller does not supply changed files
- **WHEN** a production run or check is invoked without an explicit changed-file list
- **THEN** Guardrails derives current change impact rather than treating affected package and CLI surfaces as not applicable

#### Scenario: Enabled configuration matches a non-applicable discovery candidate
- **WHEN** enabled configuration identifies the same surface kind and manifest or configured identity as an automatically discovered non-applicable candidate
- **THEN** Guardrails promotes that candidate to applicable and records configuration as the activation reason

#### Scenario: Surface is explicitly disabled
- **WHEN** configuration explicitly disables a detected or configured release surface and provides a reason
- **THEN** Guardrails preserves the surface as non-applicable with the disablement reason visible in release status

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

### Requirement: Release assurance avoids unapproved external publication
Release verification SHALL use a temporary workspace, a minimal environment, bounded and redacted durable output, argument-vector command execution, and package lifecycle scripts disabled unless explicitly authorized. It SHALL NOT publish packages, create releases, modify remote registries, or perform destructive external actions. Strong filesystem, network, process, or identity isolation is a host capability; when a required release claim depends on unavailable host isolation, Guardrails SHALL report `human_needed` rather than claim that operational hygiene provides containment.

#### Scenario: Candidate passes all release checks
- **WHEN** release assurance completes successfully
- **THEN** Guardrails reports readiness to publish without publishing automatically

#### Scenario: Candidate build script requests inherited credentials or source access
- **WHEN** package code executes during release verification
- **THEN** lifecycle scripts remain disabled unless explicitly authorized, inherited environment is minimized, and secret-bearing output is redacted before persistence

#### Scenario: Configured driver requests broader authority
- **WHEN** a configured release command requires credentials, network access, external mutation, or other authority beyond ordinary private verification
- **THEN** Guardrails reports the requirement and requires separate explicit authorization without treating argument filtering or a temporary directory as isolation

#### Scenario: Required strong isolation is unavailable
- **WHEN** a declared release requirement depends on strong filesystem, network, or process isolation that the host cannot provide
- **THEN** Guardrails reports `human_needed` and does not claim the isolated behavior was established

### Requirement: Required release evidence is portable or explicitly escalated
Applicable deterministic release checks SHALL run equivalently on supported operating systems. When a required platform, registry, credential, or human environment is unavailable, Guardrails SHALL return `human_needed` or fail according to policy rather than silently passing.

#### Scenario: Platform-specific CLI artifact is affected
- **WHEN** a release declares support for Windows, macOS, and Linux behavior
- **THEN** release assurance requires evidence for each applicable platform or records the missing platform as unresolved
