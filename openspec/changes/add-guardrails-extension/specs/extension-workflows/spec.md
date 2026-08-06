## Purpose

Allow compatible extensions to contribute portable workflows and gates without coupling their implementation to OpenSpec core or a specific AI host.

## ADDED Requirements

### Requirement: Declarative workflow contributions
OpenSpec SHALL discover workflow contributions from every enabled compatible extension and expose each workflow's identifier, artifact requirements, instruction entry point, command metadata, gate dependencies, and host capability requirements.

#### Scenario: Enabled workflow is discovered
- **WHEN** an enabled extension contributes a valid workflow
- **THEN** the workflow is available to OpenSpec workflow generation and diagnostics

#### Scenario: Disabled workflow is omitted
- **WHEN** the contributing extension is disabled
- **THEN** the workflow is not generated or offered for new invocations

#### Scenario: Workflow identifier conflict
- **WHEN** two enabled contributions use the same workflow identifier or an extension shadows a core workflow
- **THEN** OpenSpec reports the conflicting providers
- **AND** generates neither ambiguous contribution until the conflict is resolved

### Requirement: Portable workflow generation
OpenSpec SHALL generate extension workflows through the same configured tool adapters and delivery modes used for compatible core workflows.

#### Scenario: Generate extension skill
- **WHEN** a configured tool receives workflows as skills
- **THEN** each selected extension workflow is generated as a tool-compatible skill with its declared command name and instructions

#### Scenario: Generate extension command
- **WHEN** a configured tool receives workflows as commands
- **THEN** each selected extension workflow is generated through that tool's command adapter
- **AND** internal command references use the invocation spelling registered by that tool

#### Scenario: Tool cannot represent a contribution
- **WHEN** a configured tool cannot represent a required workflow surface
- **THEN** OpenSpec reports the skipped contribution and reason
- **AND** does not generate a misleading partial artifact

#### Scenario: Generated paths are cross-platform
- **WHEN** extension artifacts are generated on macOS, Linux, or Windows
- **THEN** output paths use the target platform's path semantics
- **AND** displayed invocation names remain tool-compatible

### Requirement: Extension instruction containment
OpenSpec SHALL resolve an extension workflow's instruction entry point within the installed package or canonical linked extension root.

#### Scenario: Valid instruction entry point
- **WHEN** the declared instruction entry point resolves to a readable file inside the extension root
- **THEN** OpenSpec loads that instruction content for generation

#### Scenario: Escaping instruction path
- **WHEN** an instruction entry point resolves outside the extension root through traversal or an existing filesystem alias
- **THEN** OpenSpec rejects the contribution with a containment diagnostic

#### Scenario: Missing instruction file
- **WHEN** a declared instruction entry point does not exist or is not readable
- **THEN** OpenSpec marks the workflow unavailable
- **AND** `extension doctor` identifies the missing file

### Requirement: Extension schema contributions
OpenSpec SHALL expose valid, uniquely named extension schemas without changing the semantics of built-in schemas.

#### Scenario: Select extension schema
- **WHEN** a project selects a schema contributed by an enabled compatible extension
- **THEN** artifact status and instructions resolve using that schema

#### Scenario: Schema identifier conflict
- **WHEN** an extension schema conflicts with another extension or built-in schema identifier
- **THEN** OpenSpec rejects the conflicting extension contribution and reports both providers

### Requirement: Gate dependencies are preserved
OpenSpec SHALL preserve the gate dependencies declared by an invoked extension workflow as part of that change's generated run evidence.

#### Scenario: Workflow starts a gated run
- **WHEN** an extension workflow declares required archive gates and creates a run for a change
- **THEN** the run records the required gate identifiers and contributing extension versions

#### Scenario: Extension later disabled
- **WHEN** the contributing extension is disabled after a run records required gates
- **THEN** archive still recognizes those gate requirements
- **AND** reports the extension as unavailable rather than treating the gates as absent

### Requirement: Core remains usable after optional extension failure
OpenSpec SHALL isolate failures in optional extension contributions from unrelated built-in workflows.

#### Scenario: Optional extension fails to load
- **WHEN** an enabled extension has an invalid optional workflow and no active change depends on it
- **THEN** built-in OpenSpec workflows remain available
- **AND** extension-aware commands surface the extension diagnostic

#### Scenario: Required extension fails to load
- **WHEN** an active run or required gate depends on an extension that cannot load
- **THEN** the dependent operation fails closed with recovery guidance
