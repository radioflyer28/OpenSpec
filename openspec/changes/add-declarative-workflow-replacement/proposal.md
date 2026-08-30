## Why

Extensions can rename or retire contributed workflows, but OpenSpec can currently remove the old generated host artifacts only when they appear in the immediately previous reconciliation record. Installations that predate, lose, or replace that record can therefore retain obsolete extension-owned commands and skills alongside their replacements.

## What Changes

- Add optional declarative replacement metadata to extension workflow contributions so an extension can identify workflow IDs that the contribution supersedes.
- Reconcile retired workflow artifacts at their exact generated host paths without retaining compatibility aliases or scanning by filename pattern.
- Automatically delete retired artifacts only when the reconciliation ledger proves they are unchanged.
- Remove ownership-marked artifacts without usable ledger proof from active host paths while preserving them in a recoverable project-local location and reporting the action.
- Preserve unmarked, ambiguously owned, conflicting, or unsafe filesystem entries and report an actionable reconciliation diagnostic instead of overwriting or deleting them.
- Keep manifests without replacement metadata and ordinary tracked extension upgrades behaviorally unchanged.

## Capabilities

### New Capabilities

- `extension-workflow-reconciliation`: Declarative workflow replacement and safe retirement of extension-generated host commands and skills.

### Modified Capabilities

None.

## Impact

- Extends the version 1 workflow contribution schema with backwards-compatible optional replacement metadata.
- Affects extension manifest validation, registry normalization, generated workflow reconciliation records, lifecycle diagnostics, and extension conformance tests.
- Adds a recoverable project-local holding area only when an explicitly replaced, ownership-marked artifact cannot be proven unchanged.
- Does not add extension-specific policy, retain executable aliases, change built-in workflows, or require companion orchestration logic in OpenSpec core.
