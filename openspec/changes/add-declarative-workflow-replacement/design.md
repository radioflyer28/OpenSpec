## Context

OpenSpec records generated extension artifacts in `openspec/extensions.generated.yaml` and removes obsolete artifacts only when the previous record proves their marker and digest still match. That is the safest normal upgrade path, but it cannot retire artifacts created before the ledger existed or after the ledger was lost. The existing ownership marker still identifies the extension, workflow, tool, and surface, but it cannot prove that the file was never edited.

The solution must remain a generic, bounded extension seam. It must support macOS, Linux, and Windows, preserve modified content, avoid filename-pattern cleanup, and let OpenSpec GSD make a clean private `run` to `do` and `run-status` to `status` migration.

## Goals / Non-Goals

**Goals:**

- Give an active workflow contribution a backwards-compatible way to declare retired predecessor IDs.
- Remove retired extension-owned artifacts from executable host locations even when the immediately previous ledger cannot prove their content.
- Delete only content proven unchanged and preserve all other marker-owned content recoverably.
- Keep ownership conflicts visible and nondestructive.
- Reuse current workflow adapters, ownership markers, reconciliation records, and lifecycle diagnostics.

**Non-Goals:**

- General filesystem cleanup or migration hooks for arbitrary extension files.
- Compatibility aliases or invocation forwarding for retired workflows.
- Extension-provided scripts, deletion callbacks, or unrestricted lifecycle code.
- Pattern scanning for historical workflow names.
- Guardrails- or GSD-specific behavior in OpenSpec core.

## Decisions

### 1. Add `replaces` to `WorkflowContributionV1`

`WorkflowContributionV1` gains an optional `replaces: string[]` field. Missing values normalize to an empty list. Manifest validation requires valid unique workflow IDs, excludes the contribution's own ID, and rejects any replacement ID still actively contributed elsewhere in the same manifest.

The replacement declaration is metadata on the successor, not a contribution. Registry discovery and generated help therefore expose only the successor.

This is preferred over a top-level migration script because it is declarative, host-portable, and incapable of arbitrary writes. It is preferred over permanent aliases because the goal is retirement rather than compatibility routing.

### 2. Derive retirement candidates through known host surfaces

For every configured tool and enabled successor, reconciliation derives each predecessor's command and skill path using the same tool registry, delivery selection, command adapter path logic, skill-directory constants, and Node path APIs used for active artifacts. The predecessor ID is the only historical input needed to derive its path; no directory enumeration, glob, or fuzzy name comparison is allowed.

Retirement candidates carry extension ID, retired workflow ID, tool ID, surface, and exact project-relative or absolute path. Duplicate candidates are collapsed by this identity. A candidate that collides with an active desired artifact is preserved and diagnosed rather than retired.

### 3. Use evidence strength to choose delete, recover, or preserve

Reconciliation applies this ordered decision table to a retirement candidate:

| Evidence at exact path | Outcome |
|---|---|
| Entry absent | No-op |
| Prior record matches identity, marker, and content digest | Delete unchanged artifact |
| Regular file has exact same-extension predecessor marker but ledger proof is absent or content differs | Move content to recovery, then remove the active entry |
| Matching recovery content already exists | Retain recovery copy and remove the duplicate active entry |
| Marker is absent, malformed, mismatched, or belongs to another extension | Preserve active entry and diagnose |
| Entry is a directory, filesystem alias, or unsupported type | Preserve active entry and diagnose |

This preserves the current strongest automatic deletion rule while allowing older marker-owned files to stop being executable without losing edits. Treating every ownership marker as deletion authority was rejected because the marker does not detect user modification. Leaving modified marker-owned files active was rejected because the retired command would continue to shadow or confuse the replacement.

### 4. Store recovery copies under an explicit project-local root

Recovery files live below `openspec/extension-recovery/`, partitioned by validated extension ID, retired workflow ID, tool ID, and surface. The filename includes a digest of the preserved bytes and the original basename. All path construction uses Node path APIs.

Before moving content, reconciliation creates the recovery parent, refuses filesystem aliases and non-regular entries, and checks for a destination collision. An identical destination makes the operation idempotent; a non-identical collision is preserved and reported without overwriting either file. The diagnostic reports both original and recovery paths. Empty generated skill directories may be removed only after their tracked file leaves the active path.

A central recovery root is preferred over an adjacent `.old` file because adjacent files may still be discovered by host tooling and collide with user conventions.

### 5. Keep reconciliation records authoritative for active artifacts

The existing reconciliation record continues to list active generated artifacts. Replacement outcomes are retained as diagnostics rather than active artifact entries. The lifecycle facade writes the record only after reconciliation returns, as it does today.

If an ambiguous entry remains at a retired active path, diagnostics must say it was preserved. Extension doctor surfaces those diagnostics. The core does not claim that the retired entry point is absent unless the exact path is absent after reconciliation.

### 6. Bound the core and compatibility impact

Implementation is confined to extension manifest types and validation, workflow normalization/reconciliation, reconciliation diagnostics, and their tests. The optional field remains within extension API v1 because existing manifests parse and behave identically. No companion policy enters core.

Conformance fixtures cover an extension using `replaces`; upstream survivability and the existing seam-budget check must pass. If the field cannot remain backwards-compatible or the core patch exceeds the maintained generic seam budget, implementation stops for explicit API-version or budget review.

## Risks / Trade-offs

- **Recovery files add project-local state** → Create the recovery root only when unverifiable marker-owned content must be retired, use content-addressed names, and report the exact location.
- **A user may intentionally keep using a modified retired skill** → Preserve it in recovery and report the migration; restoring it to an active host path becomes an explicit user action.
- **A forged ownership marker could cause a file to move** → Limit action to an exact declared predecessor path and make the operation recoverable rather than destructive.
- **A user-owned unmarked file can keep the retired invocation active** → Preserve it to avoid data loss and report the unresolved collision accurately.
- **Host adapters may evolve path rules** → Derive paths through existing adapter and tool registries and cover all configured surfaces in cross-platform tests.
- **Two successors could claim the same predecessor** → Reject duplicates within one extension manifest and collapse identical normalized candidates defensively.

## Migration Plan

1. Add schema and validation tests for optional `replaces` metadata, including old manifests.
2. Add RED reconciliation tests for tracked, untracked marker-owned, modified, conflicting, unsafe, repeated, and cross-platform retirement cases.
3. Implement explicit candidate derivation, evidence classification, recovery moves, and diagnostics.
4. After this generic seam change passes and is available, resume the downstream OpenSpec GSD change to add its `replaces` declarations.
5. In that downstream change, reconcile the local installation and verify old extension-owned `run` and `run-status` entry points are absent while `do` and `status` remain discoverable.

Rollback removes the declarations from the companion manifest and relinks the earlier OpenSpec core revision. Recovery content remains available for manual inspection; rollback never deletes it.
