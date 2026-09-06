## Purpose

Verifies that release-relevant changes produce installable private artifacts whose contents, metadata, installation behavior, and public surfaces match the OpenSpec contract.

## ADDED Requirements

### Requirement: Release assurance activates conditionally and transparently
OpenSpec GSD SHALL derive changed artifacts and release surfaces from current repository state, OpenSpec metadata, manifests, and explicit user configuration, and SHALL activate release assurance when that evidence identifies a package, CLI, plugin, or other public distribution. Candidates SHALL use a simple identity composed of surface kind and manifest or configured identity. Explicit disablement with a reason takes precedence over enabled configuration, and enabled configuration takes precedence over automatic discovery. Configuration matching an automatically discovered non-applicable candidate SHALL promote that candidate to applicable without creating a duplicate. The activation reason and selected checks SHALL be reported.

#### Scenario: Package metadata changes
- **WHEN** a change modifies a distributable package or its declared installed interfaces
- **THEN** OpenSpec GSD activates the applicable release checks and records the triggering evidence

#### Scenario: Change is not distributable
- **WHEN** no configured or detected release surface is affected
- **THEN** OpenSpec GSD records release assurance as not applicable without running packaging commands

#### Scenario: CLI caller does not supply changed files
- **WHEN** a production run or check is invoked without an explicit changed-file list
- **THEN** OpenSpec GSD derives current change impact rather than treating affected package and CLI surfaces as not applicable

#### Scenario: Enabled configuration matches a non-applicable discovery candidate
- **WHEN** enabled configuration identifies the same surface kind and manifest or configured identity as an automatically discovered non-applicable candidate
- **THEN** OpenSpec GSD promotes that candidate to applicable and records configuration as the activation reason

#### Scenario: Surface is explicitly disabled
- **WHEN** configuration explicitly disables a detected or configured release surface and provides a reason
- **THEN** OpenSpec GSD preserves the surface as non-applicable with the disablement reason visible in release status

### Requirement: Verification uses the distributable artifact
OpenSpec GSD SHALL build or pack the release candidate, record an artifact identity, inspect its packaged contents and dependency metadata, install it in a clean temporary environment, and exercise applicable declared installed interfaces such as package exports, binaries, commands, extension manifests, gates, or contributed workflows.

#### Scenario: Source tests pass but package omits a required file
- **WHEN** the packed artifact lacks a file required by a declared installed interface
- **THEN** release assurance fails despite source-workspace tests passing

#### Scenario: Clean installation succeeds
- **WHEN** the artifact installs in a clean environment and its declared installed interfaces behave as specified
- **THEN** OpenSpec GSD records passing installation and installed-interface evidence against that artifact identity

### Requirement: Release metadata matches the public change
OpenSpec GSD SHALL verify applicable versioning, compatibility ranges, release notes or changesets, package metadata, and documented installation instructions against the declared public-contract impact.

#### Scenario: Public behavior changes without release tracking
- **WHEN** repository policy requires a changeset or release note for the affected public surface and none exists
- **THEN** release assurance fails with the missing release obligation

#### Scenario: Compatibility range excludes the tested dependency
- **WHEN** the candidate was tested against a dependency version outside its declared compatibility range
- **THEN** release assurance fails and identifies the metadata mismatch

### Requirement: Release assurance avoids unapproved external publication
Release verification SHALL use a temporary workspace, a minimal environment, bounded and redacted durable output, argument-vector command execution, and package lifecycle scripts disabled unless explicitly authorized. It SHALL NOT publish packages, create releases, modify remote registries, or perform destructive external actions. Strong filesystem, network, process, or identity isolation is a host capability; when a required release claim depends on unavailable host isolation, OpenSpec GSD SHALL report `human_needed` rather than claim that operational hygiene provides containment.

#### Scenario: Candidate passes all release checks
- **WHEN** release assurance completes successfully
- **THEN** OpenSpec GSD reports readiness to publish without publishing automatically

#### Scenario: Candidate build script requests inherited credentials or source access
- **WHEN** package code executes during release verification
- **THEN** lifecycle scripts remain disabled unless explicitly authorized, inherited environment is minimized, and secret-bearing output is redacted before persistence

#### Scenario: Configured driver requests broader authority
- **WHEN** a configured release command requires credentials, network access, external mutation, or other authority beyond ordinary private verification
- **THEN** OpenSpec GSD reports the requirement and requires separate explicit authorization without treating argument filtering or a temporary directory as isolation

#### Scenario: Required strong isolation is unavailable
- **WHEN** a declared release requirement depends on strong filesystem, network, or process isolation that the host cannot provide
- **THEN** OpenSpec GSD reports `human_needed` and does not claim the isolated behavior was established

### Requirement: Private release evidence is qualified on macOS
For this private-use increment, applicable deterministic release checks SHALL run on macOS. Passing artifact creation, inspection, clean installation, declared installed-interface, and host-discovery checks on macOS SHALL satisfy the platform qualification required for archive and private installation. OpenSpec GSD SHALL NOT infer Linux or Windows qualification from macOS evidence. If a future change explicitly configures another required platform, unavailable evidence for that platform SHALL remain unresolved rather than silently passing.

#### Scenario: Private macOS artifact is verified
- **WHEN** the candidate passes its applicable packaging, clean-install, declared installed-interface, and host-discovery checks on macOS
- **THEN** OpenSpec GSD records the candidate as qualified for private macOS installation without claiming Linux or Windows support

#### Scenario: Another platform is explicitly required later
- **WHEN** a future change explicitly requires Linux or Windows evidence that is unavailable
- **THEN** OpenSpec GSD records that platform requirement as unresolved without invalidating the completed macOS-only scope of this increment
