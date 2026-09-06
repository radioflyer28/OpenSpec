## 1. Baseline and Contract Tests

- [x] 1.1 Record the OpenSpec, companion, Pi SDK, Node.js, and macOS qualification baselines and map every `gsd-pi-host-adapters` scenario to executable evidence.
- [x] 1.2 Add RED tests proving the current Pi extension only adds the CLI to `PATH` and cannot provide runtime-qualified dispatch, fresh assurance roles, or safe concurrency.
- [x] 1.3 Add RED authority and provenance tests covering forbidden writes/shell/Git, path escape, inherited extensions, malformed or forged results, missing evidence, timeout, cancellation, late completion, and stale revisions.
- [x] 1.4 Add exclusions proving the increment creates no daemon, network listener, persistent capability file, `pi-subagents` dependency, duplicate workflow loop, worktree adapter, Git automation, or parallel project-writing executor.

## 2. Pi Capability Qualification

- [x] 2.1 Add the narrowest supported Pi SDK dependency or peer contract and isolate all Pi-specific imports behind a companion-package adapter boundary.
- [x] 2.2 Add versioned capability-profile schemas and status for `available`, `disabled`, `probe_failed`, and `unsupported_version`, with portable remediation.
- [x] 2.3 Implement explicit supported-version and live runtime probes for model/auth availability, in-memory session lifecycle, restricted tools, cancellation, timeout, and structured results.
- [x] 2.4 Qualify `agentDispatch` and `parallelism` independently and prove installed tools, environment variables, shell commands, or stale sessions cannot count as capability evidence.
- [x] 2.5 Complete GREEN/REFACTOR passes for deterministic probe output, failure classification, status reporting, and conservative Tier 0 fallback.

## 3. Isolated Role Sessions and Authority

- [x] 3.1 Build a minimal package-owned resource loader and role prompt compiler that accepts authoritative identifiers/references without copying a second planning corpus into generated state.
- [x] 3.2 Implement fresh in-memory plan-reviewer, pathfinder, code-reviewer, and goal-verifier sessions using the active qualified model, with deterministic disposal on every terminal path.
- [x] 3.3 Enforce an exact read/list/search tool inventory for read-only roles and reject qualification if Pi cannot enforce the requested authority.
- [x] 3.4 Add optional pathfinder experiment tools confined to one tracked disposable workspace and harden them against absolute paths, parent traversal, symlink/case/separator escape, and over-broad cleanup.
- [x] 3.5 Complete GREEN/REFACTOR passes for context freshness, role separation, tool authority, disposable experiments, cleanup, macOS behavior, and portable path handling.

## 4. Structured Dispatch and Provenance

- [x] 4.1 Add immutable session-local request envelopes containing trusted dispatch/session/role/change/revision identity, authority, evidence requirements, deadline, and cancellation identity.
- [x] 4.2 Parse exactly one terminal structured role result, treat extra text as diagnostic-only, attach trusted fields outside model output, and validate schema plus required evidence.
- [x] 4.3 Bind accepted results through the existing `dispatchRoleV2` receipt boundary and make malformed, forged, late, cancelled, timed-out, or revision-stale results incapable of satisfying assurance.
- [x] 4.4 Propagate parent cancellation/session shutdown through child sessions and complete GREEN/REFACTOR tests for evidence sufficiency, provenance, staleness, interruption, and deterministic errors.

## 5. Pi Workflow Integration

- [x] 5.1 Expand the Pi extension from PATH setup to one typed internal workflow tool that passes the live capability profile and dispatcher into the existing plan/do/check/status implementations.
- [x] 5.2 Update generated Pi resources to use the in-process adapter when qualified and retain the existing CLI/Tier 0 fallback without creating another lifecycle or task queue.
- [x] 5.3 Integrate fresh plan-reviewer/pathfinder receipts with existing readiness and planning, preserving deterministic blockers and semantic lower bounds.
- [x] 5.4 Integrate fresh code-reviewer/goal-verifier receipts with existing do/check convergence so executor self-report cannot satisfy independence.
- [x] 5.5 Add default-off adapter enablement, bounded analysis concurrency, force-Tier-0 rollback, and provenance/status projection without storing credentials, prompts, or private reasoning.

## 6. Bounded Read-Only Parallelism

- [x] 6.1 Implement a read-only scheduler with explicit prerequisites, stable request indices, a default concurrency of two, and a small hard maximum.
- [x] 6.2 Run only dependency-independent read-only analyses concurrently; keep every project-writing executor task sequential.
- [x] 6.3 Reconcile results in stable request order and retain each sibling failure, evidence set, timeout, and cancellation independently.
- [x] 6.4 Complete deterministic tests for dependency ordering, concurrency limits, out-of-order completion, partial failure, throttling, cancellation, and sequential fallback.

## 7. Packaging and Portability

- [x] 7.1 Update the Pi manifest, packed-file allowlist, build/generation pipeline, dependency notices if applicable, drift checks, and private installation tests.
- [x] 7.2 Document supported Pi versions, macOS qualification, adapter opt-in, cost/latency, status interpretation, Tier 0 rollback, and why static `extension doctor` cannot see a live Pi adapter.
- [x] 7.3 Add Linux and Windows CI for compilation, packaging, schemas, path containment, and fallback, labeling it portability evidence rather than manual host qualification.
- [x] 7.4 Prove host-neutral modules do not import Pi, OpenSpec is used only through its public extension API, and the implementation requires no enlarged core fork seam.

## 8. Qualification and Handoff

- [x] 8.1 Run formatting, lint, type-check, build, full tests, replay, workflow generation, packed-package inspection, and private Pi installation tests.
- [x] 8.2 In a disposable macOS project, demonstrate qualified fresh plan review, pathfinder analysis, code review, and goal verification with distinct enforced provenance.
- [x] 8.3 Exercise authority violations, malformed/missing evidence, interruption, staleness, probe failure, bounded parallel analysis, partial failure, and Tier 0 fallback; confirm none silently lower assurance or create Git/worktree mutations.
- [x] 8.4 Obtain a bounded independent review of scope, Pi API usage, authority enforcement, provenance, source-of-truth preservation, failure semantics, and goal achievement; block only on reproducible current-scenario violations.
- [x] 8.5 After review passes, link the verified private companion revision into Pi and patched OpenSpec, rerun installed workflow and `gsd.assurance` smoke checks, make logical commits while preserving unrelated work, and do not publish to a registry.
