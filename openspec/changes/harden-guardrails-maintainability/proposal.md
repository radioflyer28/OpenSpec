## Why

The Guardrails architecture correctly keeps OpenSpec artifacts authoritative, but the first implementation still creates avoidable fork conflicts, claims compatibility with OpenSpec builds that lack the extension API, and leaves Tier 0 hosts without a complete way to record execution evidence. Hardening these boundaries now is necessary before additional GSD-derived assurance features make the fork and generated state harder to maintain.

## What Changes

- Reduce the OpenSpec fork's upstream conflict surface by isolating extension behavior behind narrow integration calls and deferring unused contribution types from the supported v1 surface.
- Give fork builds and the companion extension an unambiguous package/API compatibility identity until the generic extension seam is accepted upstream.
- Make upstream-survivability CI fetch and test against the official `Fission-AI/OpenSpec` main branch on Linux, macOS, and Windows.
- Make `openspec-guardrails` an independently versioned, committed, remotely hosted release unit with its own conformance and packaging matrix.
- Reconcile task progress from the current OpenSpec `tasks.md` during check and status operations so generated Guardrails records cannot become competing planning truth.
- Add a host-neutral Tier 0 protocol for recording task execution, RED–GREEN–REFACTOR evidence, checker results, deviations, repairs, verification findings, and human acceptance.
- Consume stable OpenSpec machine-readable artifact data where available and require explicit, stable task identifiers for durable evidence references.
- Keep Tier 1 and Tier 2 adapters optional; do not add phases, milestones, roadmaps, or replacement planning documents.

## Capabilities

### New Capabilities

- `guardrails-maintainability`: Fork isolation, compatibility identity, real-upstream verification, companion release independence, and live OpenSpec source-of-truth reconciliation.
- `guardrails-tier0-protocol`: Portable commands and records for executing and evidencing a guarded change sequentially on any supported host.

### Modified Capabilities

None.

## Impact

- Affects the generic extension seam and its integration points in the OpenSpec CLI, archive flow, artifact resolution, workflow generation, update behavior, and CI.
- Affects the `openspec-guardrails` manifest, package identity, CLI, state reconciliation, evidence recording, human acceptance, conformance tests, and release automation.
- May narrow the initial extension API to contribution types required by Guardrails v1; any removed unreleased surface is treated as pre-release API refinement.
- Establishes an explicit dependency on completing `add-guardrails-extension` before this follow-up is implemented and released.
