## Why

OpenSpec can define and validate change artifacts, but it has no portable way for independently maintained extensions to add workflows or enforce completion gates. Teams that want stronger execution discipline must either maintain a broad fork or rely on host-specific prompts that cannot reliably block an incomplete change from being archived.

## What Changes

- Add a versioned, declarative extension contract for contributed workflows, schemas, commands, archive gates, and required host capabilities.
- Add project-scoped extension lifecycle commands for installing, linking, enabling, disabling, listing, and diagnosing extensions, backed by a deterministic lockfile.
- Extend archive with required extension gates, fail-closed unavailable-gate behavior, recorded human acceptance, and reasoned, auditable overrides.
- Define a separately maintained `openspec-guardrails` extension that contributes `/opsx:run`, `/opsx:check`, and `/opsx:run-status` workflows.
- Define portable quick, guarded, and full assurance modes covering risk-aware RED–GREEN–REFACTOR evidence, scenario coverage, independent review and verification, conditional specialist checkers, and bounded repair.
- Keep OpenSpec proposal, specs, design, and tasks as the sole human-maintained planning source; Guardrails run and assurance files are generated evidence records only.

## Capabilities

### New Capabilities

- `extension-management`: Versioned extension manifests, compatibility checks, lifecycle commands, lockfile state, and host-capability reporting.
- `extension-workflows`: Portable discovery and generation of extension-contributed workflows, schemas, commands, and gate dependencies.
- `guardrails-assurance`: Guardrails execution modes, plan compilation, TDD evidence, checker routing, portable execution tiers, repair limits, and generated assurance records.

### Modified Capabilities

- `cli-archive`: Invoke required extension gates before archival, block unresolved results, and support audited human acceptance and explicit overrides.

## Impact

- Affects CLI registration, project configuration and lockfile handling, workflow generation, archive execution, JSON output, and command completion.
- Introduces a small public TypeScript extension API exported by `@fission-ai/openspec`.
- Adds a separately versioned companion package/repository for `openspec-guardrails`; OpenSpec core remains independent of Guardrails-specific orchestration.
- Requires cross-platform filesystem and process handling on Node.js 20.19 or newer.
- Adds compatibility, lifecycle, archive-gate, workflow-generation, assurance-routing, TDD-evidence, and portability tests.
