## 1. Canonical Pause State

- [x] 1.1 Add fail-first schema tests for bounded pause checkpoints, workspace entries, activity/dispatch states, resume routes, and `workflow.paused`/`workflow.resumed` payloads; verify malformed identities, paths, duplicated prose fields, and unsupported enum values are rejected.
- [x] 1.2 Implement the versioned pause/resume schemas and event union additions in the companion, then verify the new schema tests pass without weakening existing event validation.
- [x] 1.3 Add fail-first replay tests for effective-pause projection, matching resume, later-pause precedence, idempotent repeated pause, old histories without pause events, and unsupported-event fail-closed behavior.
- [x] 1.4 Implement pause/resume replay and projection fields with stable state fingerprints, then verify the focused replay tests and the existing canonical-state suite pass.

## 2. Deterministic Resume Routing and Status

- [x] 2.1 Add fail-first route-evaluator tests covering integrity failure, ambiguous changes, discussion, incomplete proposal/update, stale plan, active debug, do/review/repair/verification, UAT, archive-ready, no-checkpoint reconstruction, and routes requiring new authority.
- [x] 2.2 Implement one pure resume-route evaluator over freshly loaded OpenSpec, Relay, workspace, and dispatch evidence; verify every priority and automatic-versus-human decision passes the focused tests.
- [x] 2.3 Add fail-first status tests for deliberate pause, incomplete quiescence, interrupted and continuing dispatches, workspace/artifact drift, checkpoint-restored versus reconstructed state, and precise next actions.
- [x] 2.4 Extend the existing status projection to consume the shared route evaluator and expose pause/resume state without duplicating routing logic; verify existing status output remains backward compatible.

## 3. Change-Scoped Pause and Resume

- [x] 3.1 Add fail-first pause tests for stopping new scheduling, settling or rejecting an atomic operation, preserving completed task/evidence state, incomplete-task reporting, bounded wait behavior, and repeated-pause idempotency.
- [x] 3.2 Implement orchestrator-owned change pause using existing atomic canonical-state operations and explicit task/finding/dispatch references; verify it never marks incomplete tasks complete or changes assurance outcomes.
- [x] 3.3 Add fail-first workspace tests for Git and non-Git revisions, relevant modified/untracked entries, content digests without contents, path aliases/traversal, macOS/Linux/Windows path semantics, and unchanged default Git state.
- [x] 3.4 Implement bounded workspace snapshot and validation using existing repository evidence and contained-path primitives; verify pause/resume never stages, commits, branches, stashes, resets, deletes, or overwrites workspace files.
- [x] 3.5 Add fail-first resume tests for matching state, stale OpenSpec artifacts, changed plan/task revisions, repository movement, changed workspace entries, successful resume-event binding, routed-workflow failure, and absence of a checkpoint.
- [x] 3.6 Implement change resume so one safe route enters the existing workflow, while drift, ambiguity, or new authority stops with exact remediation; verify no existing discuss/plan/do/debug/UAT/archive implementation is duplicated.

## 4. Dispatch Quiescence and Pi Integration

- [x] 4.1 Add fail-first dispatch tests for acknowledged cancellation, intentionally continuing read-only work, interrupted sessions, unknown state, mutation-capable activity that prevents safe pause, and late results after cancellation or revision drift.
- [x] 4.2 Extend the qualified host/analysis scheduler boundary with bounded pause observation and cancellation where supported; verify lower-tier and standalone CLI operation reports unavailable control honestly instead of claiming quiescence.
- [x] 4.3 Add fail-first Pi tool tests for `pause` and `resume` operation schemas, current-session identity, structured result validation, capability fallback, and preservation of existing plan/do/check/status behavior.
- [x] 4.4 Implement Pi pause/resume operations and wire them to the same companion orchestrator functions used by the CLI; verify no prompt-only restriction is represented as enforced host cancellation.

## 5. Pre-Proposal Discussion Continuity

- [x] 5.1 Add fail-first registry tests for atomic `openspec/.openspec-relay/discussions.json` updates, validated working IDs, confirmed decisions, rejected alternatives, material open questions, design-tree frontier, fingerprints, explicit-key cleanup, containment, and concurrent replacement failure.
- [x] 5.2 Implement the bounded discussion checkpoint registry without raw transcripts, private reasoning, requirement/task copies, recency-only selection, wildcard cleanup, or creation of an incomplete OpenSpec change; verify the focused registry tests pass across platform path fixtures.
- [x] 5.3 Add fail-first workflow tests for pausing before proposal, resuming one checkpoint automatically, selecting among multiple checkpoints, continuing grilling-style discussion without repeating settled questions, and retaining unresolved branches.
- [x] 5.4 Integrate discussion pause/resume and proposal-handoff consumption, then verify a checkpoint becomes inactive only after confirmed mapping into current OpenSpec artifacts.

## 6. Public Relay Surfaces

- [x] 6.1 Add fail-first CLI tests for `openspec-relay pause [change]` and `resume [change]`, JSON/text output, omitted or ambiguous change selection, reconstructed routing, non-zero unsafe-pause results, and no implicit Git mutation.
- [x] 6.2 Implement CLI commands and public TypeScript exports while keeping orchestration behind the existing narrow operation boundary; verify existing CLI and package-boundary tests pass.
- [x] 6.3 Add `pause` and `resume` workflow contributions, user-facing workflow instructions, Pi prompts, and agent skills; regenerate them through the existing build pipeline and verify product-identity, invocation, replacement, and generated-content tests.
- [x] 6.4 Update Relay README, compatibility/maintenance guidance, and status examples with cooperative-pause limitations, ephemeral discussion state, explicit Git authority, drift behavior, and fresh-context resume commands; verify documentation names only current Relay surfaces.

## 7. Integration, Packaging, and Completion

- [x] 7.1 Add Tier 0 end-to-end tests that pause and resume discussion, planning, implementation, review, debug, UAT, and archive-ready states; verify OpenSpec artifacts remain the sole human-maintained planning truth and no GSD administrative artifacts are created.
- [x] 7.2 Add failure-injection tests for interrupted atomic writes, corrupt checkpoints, projection mismatch, stale dispatch receipts, unavailable Git evidence, unsafe paths, repeated pause/resume, and rollback through unsupported events; verify every failure is visible and non-destructive.
- [x] 7.3 Run the full companion typecheck, lint, build, and test suite locally; verify committed `dist/`, generated workflows, manifest contents, and source maps match the `0.3.0` source.
- [x] 7.4 Run automated GitHub Actions qualification on macOS, Linux, and Windows, including path handling and Pi package tests; verify all required jobs pass without requiring manual cross-platform machines.
- [x] 7.5 Pack the `openspec-relay@0.3.0` candidate, inspect its file list and metadata, install it with the compatible `1.11.0-relay.1` OpenSpec build in a clean Pi workspace, and verify discuss/pause/resume/plan/do/status are usable without npm publication.
- [x] 7.6 Run one bounded fresh-context code, security, and goal review against the current change requirements; resolve all reproducible blocking findings, rerun affected and full tests, and record the final passing evidence without expanding scope for optional hardening.
- [x] 7.7 Validate the OpenSpec change strictly, confirm every task and observable scenario has evidence, and prepare the completed change for archive only after a canonical Relay status is clean or—when the authoritative OpenSpec change and companion implementation intentionally live in separate repositories—the full companion suite and fresh independent review establish the equivalent absence of unresolved blocking findings or human actions without duplicating planning artifacts.

## Completion Evidence

- Strict OpenSpec validation: pass on 2026-09-09.
- Companion implementation: `openspec-relay` commit `6a6e3df`.
- Local verification: typecheck, lint, generated-artifact build, and 59 test files with 294 tests passed.
- Cross-platform qualification: macOS, Ubuntu, and Windows passed in GitHub Actions run `34428198447`.
- Fresh-context code, security, and goal review: PASS at exact commit `6a6e3df`; no reproducible blocking finding remains.
