# OpenSpec Relay: Future Assurance Capabilities

## Status

Research and possible future work only. None of the capabilities in this document are required by OpenSpec Relay's current release line, active changes, acceptance criteria, or archive gates.

Captured: 2026-08-07

Any selected capability should be proposed through a separate OpenSpec change with explicit activation rules, evidence contracts, and acceptance scenarios.

## Additional Specialist Checkers

The current checker set could eventually expand with the following specialists.

### Reliability

Evaluate retries, timeouts, cancellation, concurrency, idempotency, partial failure, and recovery behavior.

### Performance

Evaluate changed hot paths, resource bounds, query growth, bundle size, and benchmark regressions.

### Privacy and Data Governance

Evaluate personally identifiable information, retention, deletion, telemetry, redaction, and data-residency concerns.

### Operations and Observability

Evaluate useful logs, metrics, traces, health checks, and actionable failure messages.

### Migration Safety

Evaluate forward migration, rollback, mixed-version operation, and irreversible transformations.

### Dependency and Supply Chain

Evaluate lockfile changes, provenance, licensing, published package contents, and install scripts.

These checkers should remain conditional. Relay should activate them from changed files, task metadata, design content, repository evidence, and explicit configuration. Running every specialist for every change would add noise and cost without improving assurance proportionally.

## Useful Later, but Easy to Overbuild

### Lightweight Post-Run Learnings

Inspired by `gsd-extract-learnings`, capture concise decisions, surprises, recurring failures, and reusable patterns after a run. Generated learnings must not become a competing planning source; durable project decisions should be promoted deliberately into the relevant OpenSpec artifact.

### Pause and Resume Handoffs

Inspired by `gsd-pause-work` and `gsd-resume-work`, preserve a bounded handoff containing current task identity, execution state, unresolved findings, evidence references, and the next safe action.

### Change Health Diagnostics

Inspired by `gsd-health`, diagnose missing or inconsistent generated run data, stale evidence, unresolved gates, incompatible extension state, and recoverable execution-record problems.

### Cross-Change Integration Audits

Inspired by `gsd-integration-checker`, examine interactions among related active changes, shared public contracts, overlapping write sets, migrations, and end-to-end workflows.

### Safe Automated Rollback

Inspired by `gsd-undo`, provide narrowly scoped, dependency-aware recovery for Relay-managed mutations. Any future design must distinguish source rollback from migrations, external side effects, releases, and other operations that cannot be safely reversed automatically.

## Post-v1 Pi Subagents Host Adapter

Current compatibility is coexistence only. OpenSpec Relay can run in Pi at Tier 0
while the `pi-subagents` package is installed, but it does not currently
negotiate `pi-subagents` as an OpenSpec Relay host dispatcher. Installing both
packages therefore does not, by itself, authorize Tier 1 independent-role
execution or turn subagent output into trusted review or verification evidence.

After v1 is stable, consider a separate OpenSpec change for an optional Pi host
adapter that:

1. Probes the installed `pi-subagents` API and version instead of inferring
   capability from package presence.
2. Maps isolated executor, reviewer, verifier, and specialist-checker dispatch
   onto OpenSpec Relay's negotiated Tier 1 contracts.
3. Gives reviewer and verifier roles read-only instructions and prevents them
   from writing canonical `.openspec-relay` state directly.
4. Validates structured role results and converts them into orchestrator-issued
   opaque dispatch receipts; free-form or caller-labeled output must not satisfy
   independent assurance gates.
5. Preserves deterministic readiness blockers, repository unknowns, and Tier 0
   assurance semantics regardless of subagent output.
6. Handles timeouts, cancellation, malformed results, unavailable models, and
   partial dispatch failure without falsely reporting higher-tier assurance.
7. Keeps concurrency bounded and treats Tier 2 parallel/worktree support as a
   separate capability requiring its own explicit probe and opt-in.
8. Adds compatibility tests for supported and unsupported `pi-subagents`
   versions, absent packages, read-only-role enforcement, malformed results,
   receipt provenance, fallback behavior, and assurance equivalence with Tier 0.

This integration is explicitly not required for OpenSpec Relay's current release line. It must not add
GSD milestone, phase, roadmap, or persistent project-state artifacts.

## Explicitly Out of Scope

Relay should not adopt GSD milestone summaries, roadmaps, phase management, project statistics, workstreams, or persistent project-state machinery. Those capabilities support GSD administration but do not materially improve Relay assurance.

OpenSpec proposals, specifications, designs, and tasks remain the sole human-maintained planning and development-tracking truth. Future Relay records should be machine-generated evidence or operational state that references those artifacts without duplicating or superseding them.

## Revisit Criteria

Revisit a candidate when at least one of the following is true:

1. Real Relay runs demonstrate a recurring assurance gap that the candidate would address.
2. A project explicitly requires the relevant specialist domain.
3. The capability can be activated deterministically and conditionally without weakening portable Tier 0 behavior.
4. Its generated records can remain subordinate to OpenSpec artifacts.
5. The expected assurance benefit justifies its runtime, maintenance, and interaction cost.
