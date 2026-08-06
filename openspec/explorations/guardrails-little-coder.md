# Guardrails: Deferred Little Coder Mechanisms

## Status

Deferred research only. None of the mechanisms in this document are required by the Guardrails v1 proposal, implementation, acceptance criteria, or archive gate.

## Source Reviewed

- Repository: [itayinbarr/little-coder](https://github.com/itayinbarr/little-coder)
- Review date: 2026-08-04
- Reviewed revision: [`0b7234031aabe56163e345792ce7a6ea05af321a`](https://github.com/itayinbarr/little-coder/tree/0b7234031aabe56163e345792ce7a6ea05af321a)
- Relevant areas: `.pi/extensions/skill-inject`, `_shared/inject`, `evidence`, `evidence-compact`, `read-guard`, `read-guard-edit`, `quality-monitor`, `checkpoint`, `tool-gating`, `thinking-budget`, and model profiles in `.pi/settings.json`.

Little Coder is a runtime scaffold optimized for smaller local models. The ideas below are recorded because several improve evidence continuity and context efficiency independently of model size, but adopting them now would expand the Guardrails v1 runtime surface beyond its core assurance goals.

## Candidate Mechanisms

### Evidence capsules

Persist bounded, content-addressed evidence outside the conversation: source, claim or check, digest/snippet, content hash, producing role, and timestamp. After compaction or resume, provide an index and retrieve full entries only when needed.

Potential Guardrails fit: extend `.guardrails` assurance evidence without duplicating OpenSpec planning prose.

### Budgeted skill cards

Split executor, reviewer, verifier, and specialist guidance into compact cards with triggers, capability requirements, priority, and estimated token cost. Select only the cards relevant to the current stage, risk, or failure under a dispatch budget.

Potential Guardrails fit: reduce irrelevant checker instructions while keeping assurance requirements unchanged.

### Context-pack compilation

Build bounded role-specific context from controlling OpenSpec artifacts, the current task, targeted source excerpts, unresolved findings, and evidence references instead of passing full run history.

Potential Guardrails fit: portable dispatch input for Tier 0 through Tier 2 hosts.

### Hash-based read-before-edit

Require an executor to have read the current content hash of a file before mutation. Any intervening write invalidates the read and requires refresh.

Potential Guardrails fit: strengthen write-set safety, especially for parallel execution.

### Read budgets

Prevent a single file or command result from consuming most of a role's available context. Prefer indexes, search, symbols, and targeted ranges over fixed first-line truncation.

Potential Guardrails fit: host-neutral guard in context-pack construction.

### Livelock detection

Detect repeated identical tool or checker calls against unchanged source/evidence, repeated verifier gaps without corrective changes, empty structured results, unavailable-tool requests, and malformed role output. Permit bounded corrective steering before escalation.

Potential Guardrails fit: complement the existing bounded repair contract.

### Capability profiles

Select compact, standard, or extended scaffolding from actual context/output limits, structured-result reliability, tool support, telemetry, subagents, cache behavior, and concurrency capacity rather than model names or local/cloud labels.

Potential Guardrails fit: tune decomposition and context volume without weakening gates.

### Cache-stable injection

Keep invariant role instructions byte-stable and inject change-specific cards late where the host supports prompt-prefix caching. Deduplicate unchanged dynamic blocks.

Potential Guardrails fit: reduce repeated inference cost on long assurance runs.

### Compaction watermarks and resume bridge

Observe context usage where supported, checkpoint before overflow, detect ineffective compaction loops, and rehydrate only a compact evidence/run index after compaction.

Potential Guardrails fit: long-running execution and verification sessions.

### Recoverable checkpoints

Capture a bounded pre-write base hash or Git object reference for files an executor will mutate, with first-write-wins behavior and lifecycle cleanup.

Potential Guardrails fit: optional recovery for non-Git or uncommitted changes.

### Concurrency budgets

Separate host support for parallel agents from inference capacity. Default unknown or resource-constrained local backends to one concurrent model request even when subagents are available.

Potential Guardrails fit: safe Tier 1/Tier 2 scheduling.

## Mechanisms Not Intended for Direct Adoption

- Provider-specific repair of malformed native tool-call syntax. Guardrails should validate its own structured role results, not become a provider protocol parser.
- Forced thinking shutdown after a token threshold. Guardrails may set role budgets through host capabilities but should not abort or rewrite provider reasoning behavior.
- A global runtime permission layer. Guardrails should enforce commands and write scopes it directly launches and report whether broader host enforcement is hard, best-effort, or unavailable.
- Model-name, parameter-count, or local-versus-cloud feature switches. Capability evidence is a better control input.
- In-memory-only evidence, fixed first-N-line read truncation, or automatic disabling of evidence/read/loop disciplines for larger models.

## Revisit Criteria

Re-open this exploration when any of the following is true:

1. Guardrails v1 extension lifecycle, archive gate, and Tier 0 assurance behavior are stable across the supported OpenSpec version range.
2. Dispatch context size, cache behavior, repair loops, or compaction losses can be measured from real Guardrails runs.
3. Small or local model reliability becomes an explicit release priority.
4. A supported host exposes stable context-usage, cache, or compaction hooks suitable for a portable adapter.

Before implementation, convert selected ideas into a separate OpenSpec change with baseline measurements and acceptance criteria. Do not fold them opportunistically into unrelated Guardrails fixes.
