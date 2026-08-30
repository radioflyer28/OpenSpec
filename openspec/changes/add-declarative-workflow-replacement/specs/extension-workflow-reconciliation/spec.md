## Purpose

Allow extensions to replace contributed workflows without leaving obsolete generated entry points active or risking loss of user-owned and user-modified files.

## ADDED Requirements

### Requirement: Extensions declare workflow replacement explicitly
OpenSpec SHALL accept an optional list of replaced workflow identifiers on a workflow contribution and SHALL treat each identifier as retirement metadata rather than an executable alias.

#### Scenario: Contribution replaces a retired workflow
- **WHEN** an enabled compatible extension contributes workflow `do` with `replaces: [run]`
- **THEN** OpenSpec exposes `do` as the active workflow
- **AND** treats `run` as an explicitly retired workflow of that extension
- **AND** does not generate or advertise `run` from the replacement declaration

#### Scenario: Manifest does not declare replacements
- **WHEN** an extension manifest omits replacement metadata
- **THEN** its validation, discovery, and workflow reconciliation behavior remains unchanged

#### Scenario: Replacement declaration is invalid
- **WHEN** replacement metadata contains an invalid identifier, a duplicate identifier, the contribution's own identifier, or an identifier that remains actively contributed by the same extension
- **THEN** OpenSpec rejects the manifest with a field-specific diagnostic
- **AND** does not partially apply its contributions or retire any artifacts

### Requirement: Reconciliation targets explicit generated paths
OpenSpec SHALL reconcile a retired workflow only at the exact command and skill paths derived for that workflow through configured host adapters and platform path semantics.

#### Scenario: Retired workflow is reconciled across configured surfaces
- **WHEN** an enabled extension declares a replaced workflow and the project reconciles its contributions
- **THEN** OpenSpec evaluates the retired workflow's exact generated command and skill path for each configured host surface
- **AND** generates the replacement workflow normally
- **AND** does not search for similarly named files or delete files selected by a wildcard or filename pattern

#### Scenario: Windows generated paths are reconciled
- **WHEN** replacement reconciliation runs on Windows
- **THEN** OpenSpec resolves active and recovery paths using Windows filesystem semantics
- **AND** identifies the same logical workflow, tool, and surface as on macOS and Linux

#### Scenario: Another extension owns the retired path
- **WHEN** the exact retired path contains an ownership marker for a different extension
- **THEN** OpenSpec preserves the entry at its active path
- **AND** reports the ownership conflict without changing either extension's files

### Requirement: Proven unchanged retired artifacts are removed
OpenSpec SHALL delete an explicitly retired generated artifact only when its prior reconciliation record and current ownership marker and content establish that the artifact is unchanged.

#### Scenario: Tracked artifact is unchanged
- **WHEN** a retired workflow artifact matches its prior recorded digest and ownership marker
- **THEN** OpenSpec removes the artifact from its active host path
- **AND** removes an empty generated parent directory when applicable

#### Scenario: Tracked artifact was modified
- **WHEN** a retired workflow artifact has the expected ownership marker but differs from its prior recorded content
- **THEN** OpenSpec removes it from the active host path without deleting its content
- **AND** preserves it in the extension recovery area
- **AND** reports the recovery location

### Requirement: Unverified owned artifacts are retired recoverably
OpenSpec SHALL remove an explicitly retired artifact with a matching extension ownership marker from its active host path even when no usable prior reconciliation entry exists, while preserving the artifact content recoverably.

#### Scenario: Reconciliation ledger predates the artifact
- **WHEN** the exact retired path has a matching extension, workflow, tool, and surface ownership marker
- **AND** no usable prior reconciliation entry can prove the content unchanged
- **THEN** OpenSpec moves the artifact to a project-local extension recovery location
- **AND** records a diagnostic naming the original and recovery paths
- **AND** the retired entry point is no longer active

#### Scenario: Reconciliation repeats after recovery
- **WHEN** reconciliation repeats without the retired artifact being recreated
- **THEN** OpenSpec does not create another recovery copy
- **AND** reports a stable reconciled result

#### Scenario: Recreated retired artifact has already been preserved
- **WHEN** a matching retired artifact reappears and an identical recovery copy already exists
- **THEN** OpenSpec removes the duplicate from the active path
- **AND** retains the existing recovery copy without overwriting it

### Requirement: Ambiguous and unsafe entries are preserved
OpenSpec SHALL preserve an exact retired-path entry when extension ownership cannot be established safely and SHALL report the action required to resolve the active-path conflict.

#### Scenario: User-owned file occupies retired path
- **WHEN** the retired path contains a file without the matching extension ownership marker
- **THEN** OpenSpec leaves the file unchanged at its active path
- **AND** reports that automatic retirement was skipped because ownership was not established

#### Scenario: Unsafe filesystem entry occupies retired path
- **WHEN** the retired path is a directory, filesystem alias, or other unsupported entry rather than a regular generated artifact
- **THEN** OpenSpec leaves the entry unchanged
- **AND** reports an actionable safety diagnostic

### Requirement: Reconciliation evidence remains inspectable
OpenSpec SHALL record replacement reconciliation outcomes so extension diagnostics distinguish deleted, recoverably retired, preserved, and conflicting artifacts.

#### Scenario: Extension doctor follows replacement reconciliation
- **WHEN** a user runs extension diagnostics after reconciliation
- **THEN** OpenSpec reports any recovery or preservation actions and their relevant paths
- **AND** does not claim an unresolved active-path conflict was removed

#### Scenario: Successful replacement has no legacy executable alias
- **WHEN** every extension-owned artifact for an explicitly replaced workflow is deleted or recoverably retired
- **THEN** generated host discovery exposes the replacement workflow
- **AND** does not expose the retired workflow from extension-owned generated files
