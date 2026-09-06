## Purpose

Provide a stable project-level contract for installing, resolving, enabling, and diagnosing independently maintained OpenSpec extensions.

## ADDED Requirements

### Requirement: Versioned extension manifest
OpenSpec SHALL accept extension manifests whose declared API version is supported and whose identifier, package version, compatible OpenSpec range, contributions, and required host capabilities are valid.

#### Scenario: Compatible manifest is resolved
- **WHEN** an installed extension declares manifest API version 1 and a core compatibility range containing the running OpenSpec version
- **THEN** OpenSpec exposes the extension identifier, resolved version, contributions, and capability requirements

#### Scenario: Unsupported manifest API
- **WHEN** an extension declares a manifest API version OpenSpec does not support
- **THEN** OpenSpec rejects the extension with a diagnostic naming the unsupported version
- **AND** does not load any contribution from that extension

#### Scenario: Incompatible core version
- **WHEN** the running OpenSpec version is outside the extension's declared compatibility range
- **THEN** OpenSpec reports the incompatibility and the versions involved
- **AND** does not load any contribution from that extension

#### Scenario: Invalid contribution
- **WHEN** a manifest omits a required field or contains an invalid contribution
- **THEN** OpenSpec rejects the complete manifest with field-specific diagnostics
- **AND** does not partially load the extension

### Requirement: Project extension lifecycle
OpenSpec SHALL provide project-scoped commands to install, link, enable, disable, list, and diagnose extensions.

#### Scenario: Install a package
- **WHEN** a user runs `openspec extension install <package>` in a resolved OpenSpec project
- **THEN** OpenSpec resolves a compatible package version
- **AND** records the extension as installed and enabled for that project

#### Scenario: Link a local extension
- **WHEN** a user runs `openspec extension link <path>` with a directory containing a valid extension manifest
- **THEN** OpenSpec records a development link using a project-relative path when the target is inside the project
- **AND** reports the canonical resolved target

#### Scenario: Link paths are cross-platform
- **WHEN** a local link contains platform-specific separators, a Windows drive, or an existing path alias
- **THEN** OpenSpec resolves path identity using platform filesystem semantics
- **AND** does not create duplicate entries for alternate spellings of the same target

#### Scenario: Enable an installed extension
- **WHEN** a user enables a compatible installed extension
- **THEN** its contributions become available on the next extension-aware command

#### Scenario: Disable an installed extension
- **WHEN** a user disables an extension
- **THEN** new workflows and gates are no longer contributed by that extension
- **AND** any required gates already recorded for an active run remain enforceable during archival

#### Scenario: Diagnose one extension
- **WHEN** a user runs `openspec extension doctor <id>`
- **THEN** OpenSpec reports manifest validity, core compatibility, installation source, enablement, host capability availability, and contribution conflicts

#### Scenario: Diagnose all extensions
- **WHEN** a user runs `openspec extension doctor` without an identifier
- **THEN** OpenSpec reports diagnostics for every recorded extension
- **AND** returns a non-zero result if any enabled extension cannot load correctly

### Requirement: Deterministic extension lockfile
OpenSpec SHALL maintain a project lockfile that records each extension's identifier, resolved package and version or canonical link, manifest API version, compatibility range, enablement, and integrity information when available.

#### Scenario: Repeat resolution is stable
- **WHEN** the lockfile and installed extension sources have not changed
- **THEN** repeated commands resolve the same extension set and versions in stable identifier order

#### Scenario: Version upgrade
- **WHEN** an install operation resolves a newer compatible version of an existing extension
- **THEN** OpenSpec updates that extension's lock entry atomically
- **AND** preserves unrelated extension entries

#### Scenario: Interrupted lockfile update
- **WHEN** an extension operation fails before the replacement lockfile is complete
- **THEN** the previous valid lockfile remains readable

### Requirement: Extension listing
OpenSpec SHALL list installed extensions with their identifier, resolved version or link, enabled state, compatibility state, and contribution summary.

#### Scenario: Human-readable list
- **WHEN** a user runs `openspec extension list`
- **THEN** OpenSpec displays one stable entry per recorded extension

#### Scenario: No extensions installed
- **WHEN** the project has no extension lockfile or recorded extensions
- **THEN** OpenSpec reports that no project extensions are installed without treating it as an error

### Requirement: Host capability reporting
OpenSpec SHALL represent host support for agent dispatch, parallel execution, worktrees, Git operations, structured results, and human interaction without claiming unsupported capabilities.

#### Scenario: Optional capability is unavailable
- **WHEN** an enabled extension declares an optional host capability that is unavailable
- **THEN** OpenSpec loads the extension and reports the degraded capability

#### Scenario: Required capability is unavailable
- **WHEN** a contribution requires a host capability that is unavailable
- **THEN** OpenSpec marks that contribution unavailable with a remediation diagnostic
- **AND** a required archive gate contributed by it fails closed
