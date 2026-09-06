## 1. Establish the Two-Repository Baseline

- [x] 1.1 Verify `add-guardrails-extension` task 9.6 or explicitly transfer its remaining release-readiness obligations into this change before implementation begins.
- [x] 1.2 Record the current official OpenSpec revision, fork revision, production diff, modified-existing-file allowlist, and existing integration-line count as the hardening baseline.
- [x] 1.3 Commit the current `openspec-guardrails` baseline atomically without mixing hardening behavior changes into the baseline commit.
- [x] 1.4 Create and configure the companion remote repository, push its baseline, protect its main branch, and document its ownership and release authority.
- [x] 1.5 Add companion CI that installs dependencies without running untrusted extension install scripts, then builds, type-checks, lints, tests, runs conformance, and packs the package.

## 2. Correct Distribution and API Compatibility

- [x] 2.1 Add fail-first core and companion tests for an official OpenSpec version that satisfies semver but lacks `openspec.dev/extensions/v1`.
- [x] 2.2 Add a public extension-API feature probe and make install, registry resolution, and `extension doctor` report missing API support separately from semantic-version incompatibility.
- [x] 2.3 Give fork distributions a fork-specific prerelease version and record their package source and integrity without representing them as the equivalent official stable build.
- [x] 2.4 Align the companion peer dependency, development dependency, manifest range, conformance fixtures, and gate registration version with the first API-bearing fork prerelease.
- [x] 2.5 Add installation and upgrade documentation for fork prereleases and the transition to a future official API-bearing OpenSpec release.

## 3. Narrow and Isolate the OpenSpec Core Seam

- [x] 3.1 Add fail-first manifest tests establishing workflows and gates as the supported v1 contribution types and rejecting unadvertised contribution collections with field-specific diagnostics.
- [x] 3.2 Remove unreleased schema-contribution and standalone-command public types, resolution code, fixtures, tests, documentation, and artifact-graph integration while preserving built-in schema behavior.
- [x] 3.3 Extract archive gate evaluation, override validation, audit recording, diagnostics, and result formatting behind a generic extension facade, leaving only narrow calls in `src/core/archive.ts`.
- [x] 3.4 Refactor extension workflow collection and reconciliation behind extension-owned facades while preserving the existing OpenSpec generator, delivery modes, tool paths, and command invocation transforms.
- [x] 3.5 Keep extension lifecycle command registration and update reconciliation behind dedicated modules with no Guardrails policy imported into OpenSpec core.
- [x] 3.6 Add regression tests proving projects without an extension lockfile or gate record retain byte-equivalent built-in workflow generation and existing archive behavior.
- [x] 3.7 Add a checked integration allowlist and budget report that measures production changes outside extension-owned files and fails on unapproved paths or budget growth.
- [x] 3.8 Recalculate the hardened seam patch, lower the integration budget to the achieved value, and document why every remaining existing-file edit is necessary.

## 4. Verify Against the Real Official Upstream

- [x] 4.1 Add test coverage for the upstream-survivability script using temporary repositories where `origin` is the fork and `upstream` is a distinct official repository.
- [x] 4.2 Fetch `https://github.com/Fission-AI/OpenSpec.git` as an explicit `upstream` remote, resolve and print `upstream/main`, and fail if the generated seam patch is empty.
- [x] 4.3 Generate the seam patch from the explicit path allowlist, run `git apply --check` against a detached worktree at the fetched official revision, and report conflicting files on failure.
- [x] 4.4 Build and type-check the patched upstream worktree and run core extension, workflow-generation, lifecycle, and archive-gate suites.
- [x] 4.5 Run the patched-upstream filesystem and path-sensitive suite on Linux, macOS, and Windows using Node path APIs for every generated test path.
- [x] 4.6 Enable hosted Actions on the fork and verify a real push or pull request produces non-vacuous successful matrix and upstream-survivability runs.
- [x] 4.7 Prepare an upstreamable core-seam commit stack or pull request containing only generic API, integration, tests, documentation, and changeset material.

## 5. Add Stable Artifact Identity and Live Reconciliation in the Companion

- [x] 5.1 Add fail-first compiler tests that distinguish explicit stable task IDs from positional fallback IDs and reject task-bound evidence for unstable identifiers.
- [x] 5.2 Add artifact source-state schemas containing contained change-relative paths, stable OpenSpec identifiers, and content digests for proposal, design, tasks, and each delta spec.
- [x] 5.3 Prefer stable OpenSpec machine-readable artifact output for requirements, scenarios, and tasks, retaining a version-tested Markdown compatibility adapter only where no public output exists.
- [x] 5.4 Implement explicit task-ID validation and cross-platform artifact resolution for Windows drives, separators, spaces, aliases, and case behavior.
- [x] 5.5 Add fail-first reconciliation tests for checked tasks, newly added tasks, removed tasks, reordered tasks, changed requirements, changed scenarios, and unchanged artifacts.
- [x] 5.6 Recompile current OpenSpec artifacts during every `check` and `run-status`, derive task progress from the current `tasks.md`, and mark source-dependent evidence stale when its controlling digest changes.
- [x] 5.7 Remove generated task status as an input to later decisions and prove run and assurance projections cannot supersede current OpenSpec scope or progress.

## 6. Implement the Tier 0 Event Store and Projections

- [x] 6.1 Define versioned event-envelope and payload schemas for task transitions, evidence, findings, deviations, repairs, and human decisions with run, source, actor, provenance, and digest fields.
- [x] 6.2 Add fail-first event-store tests for atomic replacement, interrupted writes, valid retries, conflicting duplicate IDs, corrupt state, unknown event versions, and stable ordering.
- [x] 6.3 Implement the sequential `.guardrails/events.json` store with idempotent append semantics and explicit generated-file ownership.
- [x] 6.4 Implement deterministic replay from current OpenSpec artifacts plus events into `run.json` and `assurance.json`, including stale-evidence diagnostics and digest binding.
- [x] 6.5 Add golden replay tests proving identical inputs create byte-stable projections and that direct projection edits are detected and repaired or blocked through reconciliation.
- [x] 6.6 Migrate existing v1 run and assurance records into event-backed projections without losing gate obligations, evidence references, deviations, repairs, or audit history.

## 7. Complete the Host-Neutral Tier 0 CLI Protocol

- [x] 7.1 Add CLI parsing and JSON-contract tests for `record task`, `record evidence`, `record finding`, `record deviation`, `record repair`, and `accept` operations.
- [x] 7.2 Implement task transition recording with dependency validation, blocker propagation, authoritative checkbox reconciliation, and next-action reporting.
- [x] 7.3 Implement evidence recording with command/check identity, observed source state, output digest, exit result, relevance, pre-existing-failure distinction, and provenance validation.
- [x] 7.4 Add end-to-end RED–GREEN–REFACTOR tests proving late, unchanged-state, irrelevant, fabricated, or pre-existing RED evidence cannot satisfy the TDD gate.
- [x] 7.5 Implement reviewer, verifier, specialist-checker, and human finding recording while ensuring executor-origin evidence alone cannot pass independent gates.
- [x] 7.6 Implement deviation disposition and repair-attempt recording with task/requirement scope, relevant-change enforcement, bounded attempts, rerun results, and user escalation.
- [x] 7.7 Implement human acceptance through the portable protocol by invoking the core acceptance API and binding actor, result digest, evidence digest, and controlling artifact state.
- [x] 7.8 Make every recording operation atomic and idempotent with one-document JSON output, actionable conflict diagnostics, and no requirement to edit generated JSON directly.
- [x] 7.9 Update `run`, `check`, and `run-status` workflows to drive Tier 0 exclusively through the supported commands and to update OpenSpec task checkboxes as the planning authority.
- [x] 7.10 Expose `--repair` only when a repair adapter is available; otherwise report bounded repair instructions without claiming a repair was performed.

## 8. Keep Optional Tiers Honest and Non-Mutating

- [x] 8.1 Add fail-first tests distinguishing user permission flags from reported or probed host capabilities during tier negotiation.
- [x] 8.2 Require a registered host dispatcher before selecting Tier 1 and both dispatcher and worktree adapters before selecting Tier 2; otherwise report an assurance-preserving Tier 0 downgrade.
- [x] 8.3 Route Tier 1 and Tier 2 outcomes through the same validated event schemas and projection replay used by Tier 0.
- [x] 8.4 Verify commits, branches, and worktrees remain independently disabled on all platforms unless both user permission and adapter capability are present.

## 9. Cross-Repository Release Readiness

- [x] 9.1 Run core build, type-check, lint, full regression, extension conformance, archive-gate, built-in parity, and package tests after seam reduction.
- [x] 9.2 Run companion build, type-check, lint, full regression, Tier 0 protocol, event replay, stale evidence, specialist routing, TDD, repair, acceptance, and package tests.
- [x] 9.3 Run cross-repository install, link, doctor, workflow generation, guarded execution, human acceptance, audited override, and final archive scenarios.
- [x] 9.4 Verify fork and companion release candidates on Linux, macOS, and Windows, including platform-specific paths and atomic state updates.
- [x] 9.5 Pack both release units, inspect their published file lists and dependency metadata, and prove the companion imports only the public extension API.
- [x] 9.6 Document routine upstream update, seam rebase, compatibility diagnosis, release order, rollback, and transition-to-official-upstream procedures.
- [x] 9.7 Confirm no Guardrails workflow creates `PROJECT.md`, `ROADMAP.md`, `PLAN.md`, `STATE.md`, phases, or milestones and that current OpenSpec artifacts remain the sole human-maintained planning truth.
- [x] 9.8 Publish the API-bearing fork prerelease, run companion conformance against the published artifact, pack Guardrails, and verify private installation through an extension link or local artifact without publishing to a package registry.
