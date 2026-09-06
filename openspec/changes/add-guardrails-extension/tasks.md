## 1. Public Extension Contract (OpenSpec repository)

- [x] 1.1 Add fail-first unit tests for valid, invalid, unsupported, and core-incompatible v1 manifests, including field-specific diagnostics and all-or-nothing loading.
- [x] 1.2 Define and export the v1 manifest, workflow, host-capability, gate-context, gate-provider, and gate-result TypeScript types and runtime schemas.
- [x] 1.3 Add compatibility-range evaluation and tests at the supported range boundaries, then expose one stable public extension API entry point.
- [x] 1.4 Add a generic fixture extension that exercises workflows, schemas, commands, gates, optional capabilities, and required capabilities without containing Guardrails policy.

## 2. Lockfile, Package Resolution, and Registry (OpenSpec repository)

- [x] 2.1 Add fail-first lockfile tests for missing files, stable ordering, exact-version upgrades, unrelated-entry preservation, malformed entries, and interrupted atomic replacement.
- [x] 2.2 Implement `openspec/extensions.lock.yaml` parsing and atomic writing with registry-package, integrity/cache, canonical-link, compatibility, and enabled-state fields.
- [x] 2.3 Implement registry package acquisition into the OpenSpec global data directory without install scripts, keyed by package integrity, with explicit cleanup and error diagnostics.
- [x] 2.4 Add fail-first cross-platform link tests covering relative and absolute paths, Windows drives and separators, aliases, case behavior, and duplicate path identity.
- [x] 2.5 Implement canonical local-link resolution and contained referenced-file resolution using Node path APIs and existing filesystem identity helpers.
- [x] 2.6 Add fail-first registry snapshot tests for built-in collisions, extension-to-extension collisions, disabled entries, missing packages, optional failures, and required capability failures.
- [x] 2.7 Implement immutable per-command registry snapshots, conflict diagnostics, capability states, and fail-closed lookup for required contributions.

## 3. Extension Lifecycle CLI (OpenSpec repository)

- [x] 3.1 Add CLI tests for `extension install`, `link`, `enable`, `disable`, `list`, and `doctor [id]`, including empty projects, unknown IDs, invalid extensions, and non-zero doctor results.
- [x] 3.2 Register the lifecycle command group, resolve the nearest OpenSpec project consistently with other project commands, and implement stable human-readable output.
- [x] 3.3 Implement package install and local link mutations so lockfile success precedes workflow reconciliation and reconciliation drift remains diagnosable.
- [x] 3.4 Implement enable/disable behavior without deleting active change gate obligations and report extension contribution summaries in list output.
- [x] 3.5 Add shell-completion entries and user documentation for lifecycle syntax, lockfile ownership, package trust, cache behavior, and recovery from a broken extension.

## 4. Extension Workflow and Schema Contributions (OpenSpec repository)

- [x] 4.1 Add fail-first tests that normalize enabled extension workflows into tool-agnostic command and skill content while omitting disabled, conflicted, or unavailable contributions.
- [x] 4.2 Integrate extension workflows with existing profile selection, delivery modes, tool adapters, and invocation-reference transforms without changing built-in workflow output.
- [x] 4.3 Track generated extension artifacts by exact extension/version/workflow/tool/surface ownership and add tests proving cleanup preserves untracked or user-modified files.
- [x] 4.4 Add fail-first schema-resolution tests for enabled extension schemas, disabled providers, built-in collisions, extension collisions, and missing contained schema files.
- [x] 4.5 Integrate conflict-free extension schemas into existing status, instruction, template, and validation resolution paths.
- [x] 4.6 Add end-to-end generation tests for at least one command-based tool and one skill-based tool, with Windows-safe path expectations.

## 5. Durable Gate Protocol and Archive Enforcement (OpenSpec repository)

- [x] 5.1 Add fail-first tests for change-local `.openspec-gates.json` registration, stable serialization, extension disablement, result/evidence digests, human acceptance freshness, and override audit entries.
- [x] 5.2 Implement the core-owned required-gate record and public registration/acceptance APIs without depending on extension-specific state formats.
- [x] 5.3 Add fail-first gate invocation tests for pass, warn, fail, error, timeout, invalid result, unresolved human action, missing provider, and incompatible provider.
- [x] 5.4 Implement contained ESM gate-provider loading, read-only gate context construction, bounded invocation, result validation, and deterministic evaluation order.
- [x] 5.5 Add archive tests proving required gates run before validation, spec writes, prompts, or moves and that projects without a gate record retain existing behavior.
- [x] 5.6 Add archive CLI tests for paired `--override-gate` and `--reason`, unknown and partially covered gates, stale acceptance, multiple blockers, actor capture, and audits moving with archived changes.
- [x] 5.7 Integrate gate blocking and overrides into human and JSON archive output while preserving the one-document JSON failure contract and existing store-root behavior.

## 6. OpenSpec Core Hardening and Upstream Delivery

- [x] 6.1 Run manifest, lifecycle, workflow, schema, gate, archive, completion, build, lint, and full regression suites; fix failures without broadening the public extension surface.
- [x] 6.2 Add Windows CI coverage for extension lockfiles, canonical links, contained paths, generated artifacts, change gate records, and archive audits.
- [x] 6.3 Add a conformance test entry point that an external extension can run against a built or published OpenSpec version.
- [x] 6.4 Document the v1 API, trust boundary, compatibility policy, generated-file ownership, gate statuses, human acceptance, and audited override behavior.
- [x] 6.5 Add a changeset and an upstream-survivability CI job that tests the minimal core patch against the supported OpenSpec version range or current upstream integration branch.

## 7. Companion Package Bootstrap (`openspec-guardrails` repository)

- [x] 7.1 Create the separately versioned TypeScript/ESM package with peer dependency on the supported `@fission-ai/openspec` range, extension ID `guardrails`, build/test/lint scripts, and no dependency on OpenSpec internals.
- [x] 7.2 Add `openspec-extension.json` and contained workflow entries for `/opsx:run`, `/opsx:check`, and `/opsx:run-status`, then pass OpenSpec manifest and generation conformance tests.
- [x] 7.3 Define versioned run, assurance, evidence, deviation, repair, task-node, scenario-coverage, and configuration schemas for `.guardrails/run.json`, `.guardrails/assurance.json`, and reports.
- [x] 7.4 Implement cross-platform change resolution and atomic state updates, with tests for aliases, Windows paths, partial writes, resume, and archive relocation.
- [x] 7.5 Add the companion CLI/library entry points used by generated workflows and ensure default invocation performs no Git mutation.

## 8. Guardrails Execution and Assurance (`openspec-guardrails` repository)

- [x] 8.1 Add fail-first graph tests for task dependencies, stable waves, cycles, risk metadata, expected verification, write sets, and overlapping parallel writes.
- [x] 8.2 Implement artifact-to-execution-graph compilation that references OpenSpec artifact, requirement, scenario, and task identifiers without duplicating their prose.
- [x] 8.3 Add fail-first mode tests and implement quick, guarded-default, and full assurance selection with the documented required checks.
- [x] 8.4 Add fail-first tier-negotiation tests and implement Tier 0 sequential execution, Tier 1 isolated-role adapters, and Tier 2 opt-in parallel/worktree adapters without weakening assurance outcomes.
- [x] 8.5 Add tests proving commits, branches, and worktrees are disabled by default and implement independent explicit opt-ins for each supported Git operation.
- [x] 8.6 Add fail-first TDD precedence and risk-classification tests for project, change, and task `auto | always | off` settings and recorded non-executable exemptions.
- [x] 8.7 Implement source-bound RED, GREEN, and REFACTOR evidence validation, including relevant-failure matching, pre-implementation ordering, and separation of pre-existing failures.
- [x] 8.8 Add fail-first checker-routing tests and implement deterministic activation of security, integration, UI, AI evaluation, compatibility, documentation, and human-UAT checks.
- [x] 8.9 Implement scenario coverage, read-only review and goal-verification contracts, structured findings, and rejection of executor self-report as independent evidence.
- [x] 8.10 Add fail-first repair tests and implement the default two-attempt limit, relevant-change requirement, successful rerun recording, exhaustion, and user escalation.
- [x] 8.11 Implement `run-status` output for mode, tier, task progress, checks, evidence, deviations, repairs, gate state, and unresolved human actions.
- [x] 8.12 Implement the Guardrails archive gate provider, register the required gate when a run begins, bind results to assurance digests, and block mismatched core/Guardrails state.

## 9. Cross-Repository Verification and Release Readiness

- [x] 9.1 Run companion conformance against the minimum and maximum supported OpenSpec versions plus a local-link build of the current core change.
- [x] 9.2 Add end-to-end Tier 0 tests for quick, guarded, and full modes; valid and missing TDD evidence; every checker route; human-needed acceptance; bounded repair; and final archive.
- [x] 9.3 Add Tier 1 and Tier 2 adapter tests for capability downgrade, dependency-safe waves, overlapping writes, partial failure, worktree isolation, and deterministic completion reporting.
- [x] 9.4 Add source-of-truth tests proving Guardrails creates no `PROJECT.md`, `ROADMAP.md`, `PLAN.md`, or `STATE.md` and that generated records reference OpenSpec artifacts instead of replacing them.
- [x] 9.5 Add failure-injection tests for missing or disabled extensions, corrupt lockfiles, stale links, invalid manifests, unavailable gate providers, timeouts, stale acceptance, and incomplete overrides.
- [ ] 9.6 Verify macOS, Linux, and Windows matrices; package both release units; document installation and upgrade order; and confirm the OpenSpec fork can merge current upstream with only the generic extension-seam diff. Remaining hosted verification and release-readiness work is explicitly transferred to `harden-guardrails-maintainability` tasks 4.5-4.7 and 9.3-9.8.
