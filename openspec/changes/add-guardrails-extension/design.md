## Context

OpenSpec currently owns a fixed set of workflows and generates their skills and commands through built-in templates and tool adapters. Archive validates the change and tasks, optionally updates main specs, and moves the change, but it has no extension gate boundary. See `proposal.md` for motivation and the delta specs for observable requirements.

The work has two release units:

1. A generic extension seam in the OpenSpec repository and `@fission-ai/openspec` package.
2. An independently versioned `openspec-guardrails` companion package/repository that consumes only the public seam.

OpenSpec runs on macOS, Linux, and Windows, including non-Node application repositories. Extension state therefore cannot depend on the consuming project using a particular package manager, shell, or path separator.

## Goals / Non-Goals

**Goals:**

- Keep the OpenSpec patch small enough to propose upstream independently of Guardrails.
- Make extension resolution deterministic and diagnosable at project scope.
- Generate extension workflows through the existing tool adapter surfaces.
- Enforce change-local archive gates even if the originating extension is later disabled or unavailable.
- Give Guardrails a portable Tier 0 baseline with stronger host capabilities used only as optional accelerators.
- Preserve OpenSpec artifacts as the sole human-maintained planning truth.

**Non-Goals:**

- General-purpose runtime hooks around every OpenSpec command.
- Sandboxing untrusted JavaScript extensions; installation is a trust decision.
- A plugin marketplace or dependency solver beyond one pinned version per extension ID.
- Replacing host-native permissions, agent dispatch, Git, or worktree implementations.
- Importing GSD planning or state documents into Guardrails.
- Making the Guardrails companion package part of the OpenSpec release train.

## Decisions

### 1. Use a declarative manifest plus narrow executable gate modules

Each extension package contains `openspec-extension.json` at its root. Version 1 uses this shape:

```json
{
  "apiVersion": "openspec.dev/extensions/v1",
  "id": "guardrails",
  "version": "0.1.0",
  "requires": {
    "openspec": ">=1.8.0 <2.0.0",
    "hostCapabilities": []
  },
  "contributes": {
    "workflows": [],
    "schemas": [],
    "commands": [],
    "gates": []
  }
}
```

Workflow and schema entries point to contained data or Markdown files. A gate entry points to a contained ESM module and named export implementing `GateProviderV1`. OpenSpec validates the full manifest before loading any contribution and canonicalizes every referenced path before enforcing root containment.

The public package exports `ExtensionManifestV1`, `WorkflowContributionV1`, `HostCapabilitiesV1`, `GateContextV1`, `GateProviderV1`, and `GateResultV1`. Zod schemas used internally are also exported so companion packages and conformance tests validate the same wire contract.

**Why:** Most contributions remain inspectable data, while gates still have a small, testable execution boundary. A completely code-driven plugin API would enlarge the compatibility surface; a data-only API could not calculate fresh assurance results.

**Alternative considered:** lifecycle hooks for arbitrary commands. Rejected for v1 because ordering, failure isolation, and security semantics would make the core patch much larger.

### 2. Pin project intent in `openspec/extensions.lock.yaml`; cache packages outside the project

The lockfile is machine-managed and committed with the project. Entries are keyed by extension ID and contain source package spec, exact version, integrity when available, manifest API version, OpenSpec compatibility range, enabled state, and either a cache key or canonical development link.

Registry packages are downloaded without running install scripts and extracted into the OpenSpec global data directory, keyed by integrity. Local links remain external and are revalidated on every load. Lockfile replacement uses a temporary sibling file and atomic rename. YAML keys and list output use stable identifier order.

`install` resolves one package and updates one entry; it is not a transitive extension dependency solver. `link` canonicalizes existing paths with the same filesystem identity utilities used elsewhere in OpenSpec. Lifecycle mutations reconcile generated extension skills/commands for configured tools after the lockfile update succeeds; reconciliation failure leaves the extension recorded but makes `doctor` and command output report drift.

**Why:** Projects that are not Node packages can still use extensions, and extension installation does not churn their application dependency files.

**Alternative considered:** adding extensions to the consuming project's `package.json`. Rejected because OpenSpec supports repositories with other ecosystems and because package-manager selection would become part of the public contract.

### 3. Build one registry snapshot per command

An `ExtensionRegistry` resolves the project lockfile, validates manifests, detects identifier conflicts, and produces an immutable snapshot. Extension-aware commands receive that snapshot rather than reading extension state repeatedly. Built-in workflows always register first; an extension collision never shadows a built-in identifier.

Optional broken extensions emit diagnostics but do not break unrelated core operations. A command that needs a broken contribution fails closed. `extension doctor` exercises resolution, referenced-file containment, compatibility, capability matching, and generation conflicts without executing gates.

**Why:** A snapshot gives deterministic behavior within a command and makes conflicts independently testable.

### 4. Extend the existing workflow-generation pipeline instead of adding a second generator

Resolved workflow contributions are normalized into the existing tool-agnostic command/skill content shape, then passed through the same tool adapters, invocation-reference transforms, configured delivery mode, and explicit generated-artifact tracking as core workflows.

Extension artifacts are tracked by the tuple `(extension id, extension version, workflow id, tool id, delivery surface)`. Removal and drift repair use those explicit records rather than directory or filename patterns. Extension schemas enter schema resolution only after conflict checking.

**Why:** One adapter path preserves host parity and avoids duplicating OpenSpec's substantial command spelling and tool-directory knowledge.

**Alternative considered:** letting each extension write directly into tool directories. Rejected because it would bypass profiles, delivery settings, command-reference transforms, cleanup, and compatibility diagnostics.

### 5. Persist required gates independently of extension enablement

When an extension workflow begins a gated run, the extension registers each required gate in a core-owned, generated change record at `.openspec-gates.json`. Each record includes extension ID and version, gate ID, source workflow, registration time, last result digest, and any acceptance or override audit entry. Guardrails keeps its richer `run.json`, `assurance.json`, and reports under `.guardrails/`; the core gate file contains only what archive needs.

Archive resolves the change and validates required gates before validation, spec updates, confirmations, or filesystem moves. Gate providers receive a read-only `GateContextV1` containing resolved project/change paths, change identity, host capabilities, and the prior gate record. Results are schema-validated and have a bounded timeout. `fail`, `error`, unresolved `human_needed`, missing providers, and invalid results block. `warn` is reported but does not block.

Acceptance binds to the digest of the current gate result and referenced evidence. An override requires `--override-gate <id>` and `--reason <text>`; it covers one currently blocking result only. Audit writes happen before archive moves the directory, so the record moves with the change. JSON mode includes structured gate diagnostics while preserving the existing one-document stdout contract.

**Why:** Disabling or losing an extension must not erase an assurance obligation already attached to an active change.

**Alternative considered:** discover gates only from currently enabled manifests. Rejected because disablement would become an accidental bypass.

### 6. Keep Guardrails orchestration in its own package

`openspec-guardrails` has a peer dependency on the supported `@fission-ai/openspec` range and contains:

- `openspec-extension.json` with extension ID `guardrails`.
- Markdown workflow entries for `run`, `check`, and `run-status`.
- A cross-platform CLI/library that compiles execution graphs and atomically manages `.guardrails` records.
- Pure assurance policy modules for mode selection, risk/TDD classification, checker routing, evidence validation, repair limits, and tier negotiation.
- A gate provider that evaluates current assurance state and returns `GateResultV1`.
- A conformance suite run against the minimum and maximum supported OpenSpec versions.

The OpenSpec repository carries only generic contract fixtures. Companion development occurs in its own repository after the core API is available from a package build or local link. Cross-repository tasks below explicitly identify ownership; applying only the OpenSpec-owned tasks yields the upstreamable core seam, while the complete change is not considered delivered until companion conformance passes.

**Why:** This lets the fork regularly merge upstream OpenSpec while Guardrails evolves and releases independently.

**Alternative considered:** adding Guardrails as a built-in OpenSpec workflow. Rejected because its policy surface and release cadence would continuously widen the fork diff.

### 7. Tier negotiation changes execution strategy, not assurance policy

Guardrails defines:

- Tier 0: sequential current-host execution.
- Tier 1: isolated executor/reviewer/verifier contexts.
- Tier 2: dependency-safe parallel waves in isolated worktrees.

The host capability record and explicit user configuration choose the highest permitted tier. Guarded sequential execution with Git automation off is the default. Missing optional capabilities cause a reported downgrade; a requested mode is rejected when downgrading would omit a required assurance outcome.

Execution graph nodes reference OpenSpec task IDs and include dependencies, risk, verification, and write sets. Parallel scheduling rejects cycles and serializes overlapping write sets. Git commits, branches, and worktrees require independent opt-in flags.

**Why:** Small/local models, full-size cloud models, and hosts without subagents can share one correctness contract.

### 8. Make TDD and assurance evidence structured and source-bound

Project and change configuration support `tdd: auto | always | off`; task metadata can override it. `auto` classifies behavior, defect, public-contract, and security work as TDD-required and records exemptions for non-executable work.

RED, GREEN, and REFACTOR evidence includes task ID, command/check ID, time, exit/result, source-state identifier, and output digest. RED must precede the implementation source state and fail for a task-relevant reason. Scenario coverage maps requirement/scenario identifiers to automated evidence or `human_needed` records.

Specialist checkers are selected by explicit configuration plus deterministic signals from changed areas and artifacts. Reviewers and the final verifier operate under read-only contracts and cannot satisfy a requirement from the executor's completion claim alone. Repairs are capped at two by default and must change relevant source or evidence before a rerun counts as another attempt.

**Why:** The important contract is evidence provenance, not merely whether a test eventually passed.

## Risks / Trade-offs

- **[Extension modules execute with the OpenSpec process's permissions]** → Treat install/enable as a trust decision, display package identity and integrity, reject path escapes, skip install scripts, and document that v1 is not a sandbox.
- **[A generic extension API can become difficult to evolve]** → Version the manifest and public result types, keep contributions declarative, reject unknown API versions, and maintain conformance fixtures.
- **[Archive latency or hangs from gates]** → Evaluate only recorded required gates, impose timeouts, distinguish `error` from `fail`, and permit reasoned audited override.
- **[Broken extensions could disrupt core workflows]** → Use immutable registry snapshots, isolate optional diagnostics, and fail closed only for operations that depend on the broken contribution.
- **[Generated workflow cleanup could delete user files]** → Track every generated artifact explicitly and remove only exact tracked paths whose ownership marker still matches.
- **[Cross-repository delivery can drift]** → Publish shared types from OpenSpec, run the companion conformance matrix against a version range, and keep an OpenSpec core fixture extension in CI.
- **[Host capability claims may be inaccurate]** → Distinguish reported, probed, and unavailable capabilities; never silently promote a tier.
- **[Parallel execution can corrupt overlapping changes]** → Validate dependency cycles and write sets before dispatch, default to sequential execution, and require explicit Tier 2 opt-in.
- **[Gate records and richer Guardrails state can disagree]** → Bind core gate results to an assurance digest and have `run-status` report mismatch as a blocking error.
- **[Lockfile paths differ across platforms]** → Store project-relative links when possible, canonicalize for identity, and test Windows drives, separators, aliases, and case behavior.

## Migration Plan

1. Land the public v1 types, manifest validation, lockfile reader, registry snapshot, and fixture extension without changing default workflows.
2. Add lifecycle commands and extension-aware workflow generation behind the presence of a project extension lockfile.
3. Add the change-local gate registry and archive enforcement; projects without required gate records retain existing archive behavior.
4. Publish an OpenSpec prerelease containing the extension seam and run its conformance suite on macOS, Linux, and Windows.
5. Bootstrap the separate `openspec-guardrails` package against that prerelease, then add workflows, state management, assurance policy, and its gate provider in vertical slices.
6. Test the companion against the full declared OpenSpec version range and exercise Tier 0 before enabling optional Tier 1 or Tier 2 adapters.
7. Release Guardrails independently. Existing OpenSpec projects opt in by installing and enabling it; no automatic migration occurs.

Rollback is additive: disable new extension installation surfaces in a patch release while continuing to read lockfiles and enforce already-recorded gates. Removing archive enforcement without an explicit migration is not safe because it would silently discard active obligations.
