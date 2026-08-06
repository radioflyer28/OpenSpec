## Context

See `proposal.md` for motivation and the two delta specs for the behavioral contract. This change follows `add-guardrails-extension` and spans the OpenSpec fork plus the sibling `openspec-guardrails` repository.

The current fork adds approximately 2,825 production lines: about 2,360 are isolated under `src/core/extensions`, while the remainder includes new lifecycle command code and modifications to archive, artifact resolution, workflow generation, update, completion, and command-reference modules. The first merge from official upstream conflicted in five of those integration files. The companion currently imports the fork's public extension subpath but advertises compatibility with official OpenSpec versions that do not contain it.

Guardrails currently compiles `tasks.md` into `run.json` when a run starts, and `run-status` later reads progress from that snapshot. Its CLI initializes and evaluates state but does not expose a complete mutation protocol for hosts to record execution and assurance evidence. The companion repository also has not yet been committed, connected to a remote, or verified by a hosted release matrix.

## Goals / Non-Goals

**Goals:**

- Make routine official OpenSpec updates a repeatable, tested patch-rebase operation.
- Keep existing OpenSpec integration files thin while retaining fail-closed archive gates.
- Give fork builds an identity that cannot be confused with API-incompatible official packages.
- Make current OpenSpec artifacts authoritative on every check and status read.
- Provide a complete sequential protocol whose projections can be rebuilt from OpenSpec artifacts plus recorded execution events.
- Establish the companion as a real independent release unit with cross-platform conformance.

**Non-Goals:**

- Add GSD phases, milestones, roadmaps, project state, or planning documents.
- Make Tier 1 or Tier 2 execution generally available before host adapters exist.
- Add a general extension marketplace, dependency solver, or arbitrary command hooks.
- Sandbox trusted extension code inside the OpenSpec process.
- Preserve unreleased schema or standalone-command contribution surfaces solely for hypothetical future extensions.

## Decisions

### 1. Narrow the supported v1 contribution surface to workflows and gates

The stable v1 manifest will support lifecycle metadata, workflow contributions, required host capabilities, and archive gate providers. Schema contributions and a separate standalone `commands` collection will be removed from the advertised v1 contract before release. Workflow contributions already generate the appropriate command or skill through OpenSpec's existing adapters, and Guardrails does not contribute a schema.

OpenSpec lifecycle commands remain `install`, `link`, `enable`, `disable`, `list`, and `doctor`. Manifest parsing remains strict and versioned so deferred contribution types can return in a later API version without silently changing v1.

**Why:** This keeps the upstream proposal centered on the two extension behaviors Guardrails actually requires. It reduces resolution, conflict, testing, and compatibility surface before any external extension can depend on the unreleased types.

**Alternative considered:** Keep all implemented contribution types because the code already exists. Rejected because implemented-but-unused public surface still creates permanent compatibility and merge obligations.

### 2. Existing OpenSpec modules call narrow extension facades

Generic behavior remains under `src/core/extensions`. Existing modules receive small integration calls:

- Archive calls one `enforceArchiveGates` facade before validation or mutation and one result formatter when producing output.
- Artifact and schema resolution no longer contain extension-specific branching after schema contributions are removed.
- Workflow generation asks one extension facade for normalized workflow content, then uses the existing generator unchanged where possible.
- Update invokes one reconciliation facade.
- CLI registration delegates the extension command group to its own module.

The survivability test records both the total production diff and the lines changed outside new extension-owned files. It fails when an unapproved existing source module enters the seam patch or when the configured integration-line budget is exceeded. The initial budget will be set from the hardened patch and may only decrease in v1 patch releases unless a public contract change justifies an explicit update.

**Why:** Absolute line count is less predictive than edits in upstream hot spots. Keeping those call sites thin makes structural upstream work less likely to conflict and makes the generic seam reviewable as an independent proposal.

**Alternative considered:** Generate Guardrails skills directly from the companion and avoid OpenSpec workflow integration. Rejected because it would duplicate tool directory, delivery, invocation, and cleanup behavior.

### 3. Distinguish fork builds until the seam is upstream

Before upstream acceptance, distributed fork builds retain OpenSpec's package contract but use a fork-specific prerelease version such as `1.8.0-guardrails.1` and a source/integrity identity in the extension lockfile. They are installed from the maintained fork release rather than represented as the official package with the same stable version.

The extension manifest requires both `openspec.dev/extensions/v1` and a compatibility range beginning at the first API-bearing fork prerelease. `extension doctor` feature-probes the public extension entry point and reports a package that matches semver but lacks the API as incompatible. The companion's development dependency and conformance matrix use the same boundary.

If the seam is accepted upstream, the companion moves its minimum to the first official API-bearing release and drops the fork-only source requirement without changing Guardrails state formats.

**Why:** Semantic version ranges cannot distinguish two distributions with the same name and version but different exports. A prerelease plus API feature check makes the temporary fork relationship explicit.

**Alternative considered:** Publish a permanently renamed OpenSpec package. Rejected because it would create an avoidable migration in projects once the generic seam is upstream.

### 4. Test a non-empty seam patch against an explicit official remote

CI adds or fetches an `upstream` remote fixed to `https://github.com/Fission-AI/OpenSpec.git`, resolves `upstream/main`, and records the tested revision. It generates a path-allowlisted seam patch from the fork's divergence, asserts that the patch is non-empty, creates a detached worktree at the fetched official revision, and runs `git apply --check` before applying it.

The patched worktree runs build, type checking, core extension conformance, workflow generation, and archive-gate regressions. A Linux/macOS/Windows matrix repeats the path and filesystem-sensitive subset. The companion CI then installs or builds that patched OpenSpec unit and runs its own conformance, Tier 0, packaging, and cross-repository archive suites.

**Why:** On a fork, `origin/main` names the fork and can make an upstream test vacuous. An explicit remote and non-empty assertion make the tested relationship observable.

**Alternative considered:** Rely on manual upstream merges. Rejected because the first merge already demonstrated conflicts and manual success does not protect subsequent releases.

### 5. Treat OpenSpec artifacts plus an execution event log as inputs; treat run and assurance files as projections

The companion adds `.guardrails/events.json`, a versioned, ordered collection of idempotent structured events. Tier 0 is sequential, so an atomic read-validate-replace operation is sufficient for v1. Every event has an immutable event ID, run ID, kind, timestamp, actor/provenance, relevant OpenSpec identifiers, and a content digest. Reusing an ID with identical content is a successful retry; reusing it with different content is a conflict.

`run.json` and `assurance.json` become rebuildable projections. Every `check` and `run-status` operation recompiles current OpenSpec artifacts, calculates their source digests, reconciles events by stable identifiers, and regenerates the projections before reporting. Removed or materially changed controlling artifacts mark dependent evidence stale rather than silently retaining a pass.

Task descriptions and completion remain in `tasks.md`. The run projection may contain task IDs, dependency/risk annotations, execution observations, and the current derived completion value, but that value is never read as the authority on the next reconciliation.

**Why:** This gives Guardrails durable audit evidence without turning generated state into a second plan or task tracker.

**Alternative considered:** Continue updating task status directly in `run.json`. Rejected because it can disagree with `tasks.md` and violates the architectural boundary.

### 6. Require explicit task IDs for durable guarded execution

The compiler continues to accept unnumbered tasks for a preview, but a guarded run cannot record task-bound evidence until each actionable task has an explicit stable identifier. Positional fallback IDs are reported as unstable. Requirement and scenario references use OpenSpec's machine-readable artifact output when available; the companion's Markdown parser remains a compatibility fallback protected by conformance fixtures.

The compiler records source digests for proposal, design, tasks, and each delta spec. Paths are resolved with Node's path APIs and stored change-relative with `/` separators only after containment has been established using platform semantics.

**Why:** Reordering an unnumbered checklist must not rebind security, TDD, or verification evidence to another task.

**Alternative considered:** Hash task prose as identity. Rejected because normal wording edits would unnecessarily invalidate identity while identical duplicate tasks would remain ambiguous.

### 7. Add a structured Tier 0 recording command group

The companion CLI adds a `record` command group for task transitions, evidence, findings, deviations, and repairs, plus an `accept` operation for current human-needed results. Each command supports JSON input and one-document JSON output for host automation. Human-oriented flags are thin translations into the same event schemas.

Representative operations are:

```text
openspec-guardrails record task <change> <task-id> --status in_progress|complete|blocked
openspec-guardrails record evidence <change> --input <json-file|->
openspec-guardrails record finding <change> --input <json-file|->
openspec-guardrails record deviation <change> --input <json-file|->
openspec-guardrails record repair <change> --input <json-file|->
openspec-guardrails accept <change> <gate-or-check-id> --actor <text>
```

The skill drives Tier 0 by calling `run`, requesting the next task, executing it in the current workspace, recording observations through this protocol, updating the authoritative OpenSpec checkbox when work is complete, and calling `check`. Direct generated-file editing is never part of the workflow.

`--repair` is offered only when a registered host repair adapter exists. Otherwise the check reports the bounded repair instructions and requires user or host action; it does not imply that the CLI repaired code.

**Why:** A small, explicit event API is portable across model sizes and hosts and makes evidence fabrication or accidental state corruption easier to detect.

**Alternative considered:** One unrestricted `state patch` command. Rejected because it would let hosts bypass provenance, ordering, and independence validation.

### 8. Keep higher execution tiers as adapters over the same protocol

Tier 1 and Tier 2 dispatchers emit the same validated events as Tier 0. CLI flags express user permission but do not claim host capability. A host adapter must provide probed capabilities to the library before negotiation can select a higher tier. Without such an adapter, the CLI honestly selects Tier 0 and reports the downgrade.

Git commits, branches, and worktrees remain separate opt-ins. A worktree adapter cannot be selected solely because `--enable-worktrees` was passed.

**Why:** This prevents configuration intent from being confused with runtime capability and ensures every tier shares one assurance contract.

### 9. Make `openspec-guardrails` an independently governed repository

The companion is committed with its own remote, protected main branch, changesets or equivalent release notes, cross-platform CI, package provenance, and release instructions. Its CI consumes released API-bearing OpenSpec builds plus a local patched-upstream build. OpenSpec core fixtures remain generic and never import Guardrails policy.

The two repositories use an explicit release order when the seam changes: OpenSpec fork prerelease, companion conformance, Guardrails release. Guardrails-only policy changes skip the OpenSpec release.

**Why:** A sibling directory without history or hosted automation is not an independent release unit in practice.

## Risks / Trade-offs

- **[Removing unreleased contribution types may discard working code]** → Preserve design notes and tests outside the stable API change if useful, but remove the compatibility promise until a real consumer justifies a later version.
- **[A line budget can reward moving code without simplifying it]** → Measure both hot-file edits and end-to-end seam behavior; review dependency direction and public types, not only counts.
- **[Event replay adds state-model complexity]** → Keep v1 sequential, schemas strict, projections deterministic, and replay covered by golden and failure-injection tests.
- **[Artifact edits invalidate previously passing evidence]** → Invalidate only evidence whose controlling identifiers or source digests changed and explain the required rerun.
- **[Fork prerelease installation is less convenient]** → Document exact install/upgrade commands and remove the fork identity once an official API-bearing release exists.
- **[Markdown fallback parsing can drift]** → Prefer OpenSpec machine output and run compatibility fixtures against every supported version.
- **[Cross-repository CI increases release time]** → Run narrow conformance on every change and reserve full packaging/platform matrices for main and release candidates.
- **[Human acceptance can be misused as a bypass]** → Bind acceptance to current evidence/result digests, require actor attribution, and keep reasoned archive override as a separate audited operation.

## Migration Plan

1. Complete and verify the remaining release-readiness work in `add-guardrails-extension`; do not archive this follow-up first.
2. Commit and push the existing companion baseline without changing its behavior, then enable independent CI.
3. Correct the fork prerelease/API compatibility identity and align the companion package, manifest, lockfile, and conformance boundaries.
4. Fix upstream-survivability CI to fetch the explicit official remote, assert a non-empty patch, enforce the integration allowlist/budget, and run the platform matrix.
5. Narrow the unreleased v1 surface and refactor existing OpenSpec hot-file integrations behind extension facades while preserving current gate and workflow behavior.
6. Add stable task-ID validation, artifact digests, the event schema/store, projection reconciliation, and stale-evidence handling in the companion.
7. Add Tier 0 recording and acceptance commands, update the workflows to use them, and make repair/capability reporting honest.
8. Run core, companion, cross-repository archive, failure-injection, packaging, and Linux/macOS/Windows suites.
9. Publish an API-bearing OpenSpec fork prerelease, validate Guardrails against it, then publish Guardrails independently.

Rollback preserves safety: a companion rollback continues reading v1 events and projections; a core rollback must continue enforcing already-recorded required gates. If a newer event kind is unsupported, Guardrails fails closed with upgrade guidance rather than discarding it. The fork-specific distribution identity remains until an official release demonstrably provides the same API.
