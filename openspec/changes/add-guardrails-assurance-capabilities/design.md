## Context

See `proposal.md` for motivation. Guardrails v1 already compiles OpenSpec artifacts into a task graph, selects assurance checks, negotiates portable execution tiers, records append-only events, materializes `run.json` and `assurance.json`, bounds repair attempts, requires independent review and verification evidence, and exposes a durable `guardrails.assurance` archive gate.

The companion package is the policy owner. OpenSpec core discovers workflows and invokes gates through the generic extension API; this change must not add Guardrails-specific logic to core. Tier 0 remains the portability baseline, so every new role must have a sequential structured-recording protocol even when subagents or parallel execution are unavailable.

The existing state schema is version 1. Its finding type represents the latest checker observation rather than a lifecycle, human acceptance is gate-wide, and repair exhaustion stops for user direction. New behavior therefore requires an explicit generated-state migration rather than overloading current fields ambiguously.

## Goals / Non-Goals

**Goals:**

- Fail early when a change is not implementation-ready, using goal-backward independent evaluation rather than artifact syntax alone.
- Give executors evidence-backed repository context without creating a second plan.
- Preserve investigations and human acceptance across process or host-context loss.
- Track every finding from discovery to a durable disposition and invalidate stale verification.
- Verify release-relevant behavior against the candidate users install.
- Preserve equivalent assurance outcomes across Tier 0, Tier 1, and Tier 2 hosts.

**Non-Goals:**

- Adding phases, milestones, roadmaps, workstreams, project state, or human-maintained Guardrails planning artifacts.
- Implementing the deferred Little Coder context, cache, compaction, permission, or model-profile mechanisms.
- Adding the separately deferred reliability, performance, privacy, operations, migration, or supply-chain specialist checkers.
- Automatically rewriting OpenSpec artifacts, publishing releases, mutating registries, or rolling back external user data.
- Replacing repository-specific tests, package managers, release policy, or human product judgment.

## Decisions

### 1. Keep the increment entirely in the companion extension

The new workflows, schemas, adapters, reports, and gate policy will live in `openspec-guardrails`. The manifest will add `debug` and `uat` workflow contributions using the existing public extension contract. Plan readiness and release assurance will be stages of the existing `run` and `check` workflows.

The minimum compatible OpenSpec API-bearing version remains unchanged unless conformance tests expose a generic API gap. A gap must be proposed independently rather than patched into core as Guardrails policy.

**Alternative considered:** add first-class plan, debug, or UAT concepts to OpenSpec core. Rejected because these are assurance policies and would increase upstream conflict surface.

### 2. Use a single event history with deterministic projections

Generated state will move to schema version 2. `events.json` remains the canonical Guardrails execution history. New event families will represent:

- repository-context compilation and invalidation;
- readiness evaluations and issue dispositions;
- finding discovery and lifecycle transitions;
- debugging hypotheses, experiments, observations, conclusions, and session status;
- UAT scenario presentation and human disposition;
- release applicability, artifact identity, checks, and human escalation.

`run.json`, `assurance.json`, and the new status/report views remain replaceable projections. Larger structured views may be written beneath `reports/`, but they must be reproducible from events plus current OpenSpec and repository evidence. A constant, explicit generated-file registry will define every path that Guardrails owns; cleanup and migration will use this registry rather than filename patterns.

Every gate evaluation replays and validates `events.json` before consulting projections. This rule applies to every supported canonical state version, including read-only version 1 compatibility. A projection that is missing, stale, digest-inconsistent, ahead of canonical history, or not reproducible from canonical events yields `error` and blocks archive. If a legacy history cannot be replayed precisely enough to establish projection equality, Guardrails requires safe migration or human remediation rather than trusting the projection. Projections can accelerate reads but can never independently satisfy a gate.

Event appends use a cross-process serialization protocol with bounded lock acquisition, stale-lock recovery tied to an owning process or renewable lease, and atomic replacement after re-reading the latest canonical store. Elapsed age alone never makes a demonstrably live owner stale. Lease renewal and a fencing generation prevent a displaced writer from committing over a newer owner. An append succeeds only when its unique event is present in the validated resulting store at the fencing generation that committed it; contention cannot report success for a lost event. Tier 2 adapters must still submit results through this serialized Tier 0 commit boundary.

Before creating or reading generated state, Guardrails resolves the change directory and every existing generated-path ancestor without following a `.guardrails` symlink outside the change. Creation uses a directory owned beneath the resolved change root. Generated-state mutation and cleanup use descriptor-relative operations or an equivalently race-safe platform primitive that binds the validated ancestor through commit; a pre-write check followed by an ordinary pathname rename is insufficient. A symlink, junction, non-directory collision, ancestor replacement, or later containment mismatch fails closed without reading, writing, or deleting the external target.

All project-relative references use portable forward-slash identities in records and Node path APIs at filesystem boundaries. Atomic rename-based writes remain mandatory on Windows, macOS, and Linux.

**Alternative considered:** make separate mutable `findings.json`, `debug.json`, `uat.json`, and `release.json` stores authoritative. Rejected because concurrent mutable truths would make recovery and reconciliation harder.

### 3. Migrate version 1 records rather than interpreting them opportunistically

On first mutation, Guardrails will deterministically migrate valid version 1 state to version 2 events:

- current findings become discovered findings with their original provenance;
- recorded repairs become repair-linked transitions without fabricating verification;
- gate-wide human decisions remain gate decisions and do not become scenario acceptance automatically;
- existing scenario coverage seeds unresolved UAT scenarios where human evidence is required;
- current run and assurance files are regenerated from the migrated event history.

Migration will be idempotent, preserve the original event payload digests where possible, and stop with remediation guidance on corrupt or ambiguous input. Read-only status may inspect version 1 state, but new capability events require successful migration.

**Alternative considered:** add optional fields while retaining schema version 1. Rejected because changed state-machine meaning would be indistinguishable from older producers.

### 4. Insert repository context and readiness before implementation writes

The run pipeline becomes:

```text
OpenSpec validation
        ↓
repository evidence compilation
        ↓
independent plan readiness
        ↓ pass
task execution and TDD
        ↓
review/checkers → finding lifecycle → bounded repair
                                      ↓ exhausted
                               scientific debugging
        ↓
independent goal verification
        ↓
conditional UAT and release assurance
        ↓
archive gate
```

Repository context compilation will have two parts:

1. A deterministic collector identifies explicit manifests, affected modules, imports/exports, tests, changed files, and configured architectural boundaries.
2. A read-only analyzer selects relevant analogs, conventions, and likely consumers, with evidence references and an observed-versus-inferred classification.

The plan checker consumes compiled OpenSpec identities and repository context. It emits structured issues for requirement/task/evidence coverage, dependency or write-set contradictions, assumptions, compatibility obligations, and unverifiable success criteria. It may recommend an OpenSpec update but cannot perform one.

All modes require a current readiness pass before implementation writes. Quick mode may collect less optional context, but it cannot omit evidence required for a readiness conclusion. Changes to controlling artifacts or cited repository evidence invalidate affected results.

Every invocation of `run` refreshes repository inputs and readiness before returning an executable action, including an invocation that resumes an existing run. The report-only setting exists only as an explicit migration compatibility choice; required readiness is the default for new version 2 configuration. A stale or unavailable required result sets `blockedBeforeExecution` and prevents executor dispatch.

Tier 0 exposes deterministic collection plus a read-only recording contract for the independent analysis. Tier 1 and Tier 2 may dispatch isolated analyzers, but use the same result schema.

Tier 1 and Tier 2 repository-analysis adapters are passed through the runner when negotiated. Tier 0 derives changed files deterministically from uncommitted state and committed branch changes relative to an explicit configured base or a validated upstream/merge-base selection. When no comparison base can be established, it records an explicit unknown that blocks any conclusion depending on an empty impact set. Absence of caller-supplied paths or a clean worktree cannot silently produce an empty impact analysis. Context revisions hash the evidence contents that support every claim.

**Alternative considered:** allow the executor to self-certify readiness during task compilation. Rejected because it would not challenge missing work or unverifiable assumptions independently.

### 5. Reconcile findings by logical identity, not report text

A finding identity is namespaced by producer and based on stable rule/category plus logical scope: requirement, scenario, task, public contract, source symbol, or portable source location. Summary wording and current line number are not identity inputs. Providers may supply a stable native identifier; Guardrails will validate its namespace and scope.

The lifecycle is:

```text
open ──repair evidence──▶ repaired ──read-only verification──▶ independently_verified
  │                              │
  ├──explicit human decision────▶ accepted_risk
  └──human judgment required────▶ human_needed
```

Every transition is append-only and includes actor, reason, evidence, and source revisions. Repeated checker output reconciles with the same finding; disappearance from a later report does not close it. Relevant source or artifact changes mark prior repair or verification stale and reopen the blocking obligation.

The production `run` and `check` paths compute a material-input revision and invoke the same invalidation rules used by lifecycle helpers. This revision includes controlling OpenSpec artifact digests and all cited repository-evidence digests, not only claim identifiers or a repository-context envelope revision. Lifecycle records retain the exact relevant evidence digests so a later context refresh can invalidate only affected findings and UAT dispositions. Finding verification and UAT acceptance therefore cannot survive a material change merely because a helper was not called by an orchestration path.

`accepted_risk` records technical non-resolution. It requires an explicit human actor and reason and never masquerades as `independently_verified`. The archive gate blocks `open`, `repaired`, stale, and unresolved `human_needed` blocking findings.

**Alternative considered:** infer resolution when a later checker no longer emits a finding. Rejected because tool drift, routing changes, or partial scans could silently erase unresolved risk.

### 6. Start scientific debugging only from a concrete failure

Repair exhaustion creates one active debug session per logical failure unless the user selects another existing session. `/opsx:debug <change> [--finding <id>]` starts or resumes the session. Sessions reference an originating finding, task, requirement, scenario, or failed check; they do not create speculative project-wide investigations.

The debug state machine records hypotheses, experiments, observations, conclusions, and next action separately. An experiment fingerprint combines its stated hypothesis, action identity, targeted evidence, and relevant source revisions. A matching unsuccessful fingerprint is rejected until inputs change or a human records why repetition is meaningful. This is scoped debug convergence, not the deferred generic runtime livelock mechanism.

Debug mutations still use the existing executor/write-set and Git opt-in policies. Reviewer and verifier roles remain read-only. Resolution is a verifier-authorized transition distinct from executor conclusions: it records the verifier identity, current evidence digests, and the independently verified linked finding or equivalent check. An executor-supplied portable reference cannot close its own session. Resolution of a defect requires regression evidence tied to the original symptom and independent confirmation, or a human-approved exemption when regression automation is genuinely inapplicable.

Debug events model hypotheses, experiments, observations, conclusions, root-cause claims, changed references, unresolved questions, next actions, verifier confirmation, and resolution as distinct records. Production recording operations and CLI/adapter contracts exist for every record type required to resume the state machine; schema and replay support alone do not establish the workflow. A root-cause conclusion cites the observations that support it. Active, unresolved, or `human_needed` sessions linked to blocking failures are subordinate archive obligations and cannot disappear behind a passing aggregate check.

**Alternative considered:** extend the normal repair counter indefinitely. Rejected because repairs do not preserve hypotheses or distinguish symptom suppression from root-cause evidence.

### 7. Model UAT as scenario dispositions linked to findings

`/opsx:uat <change>` projects applicable human scenarios from OpenSpec coverage and `human_needed` findings. It presents one scenario at a time with prerequisites, action, expected observable result, and the four allowed dispositions: `passed`, `failed`, `blocked`, and `accepted_limitation`.

Scenario coverage is canonical event state, not a transient evaluator return value. Readiness/check reconciliation persists the complete current OpenSpec scenario set and explicitly invalidates removed or changed scenarios. UAT always derives its queue from that replayed set plus applicable findings; a required UAT configuration with no projected scenarios is an error unless current evidence establishes that no human scenario applies.

Interactive hosts may collect the response directly. Other Tier 0 hosts print the next scenario and accept a structured human event through the CLI. Evidence attachments are references with digests or stable external identifiers; Guardrails does not copy arbitrary user files into planning artifacts.

A failed scenario creates or updates a blocking finding. Repair and independent verification return that scenario to awaiting-retest rather than passing it. `accepted_limitation` maps to an explicit human risk disposition and stays visible in status and archive evidence. Scenario evidence becomes stale when its controlling requirement or relevant implementation changes.

**Alternative considered:** treat any gate-wide human acceptance as satisfying all UAT scenarios. Rejected because it loses which behavior was observed and which limitation was accepted.

### 8. Route release assurance from explicit release surfaces

Release applicability uses an explicit registry of supported manifest names and parsed metadata fields, plus OpenSpec task/design metadata and project configuration. Initial drivers will support Node packages and CLIs, OpenSpec/Codex-style packaged extensions or plugins, and a configured-command driver for other public distributions. A driver reports why it applies and which checks it can establish.

Every applicable driver follows the same safety boundary:

1. Build or pack into a newly created temporary directory.
2. Record the candidate artifact digest and inspected file/dependency metadata.
3. Install the candidate into a separate clean temporary project.
4. Exercise declared exports, binaries, commands, or plugin entry points.
5. Evaluate version, compatibility, release-note/changeset, and documented-install metadata.
6. Exercise upgrade and rollback in isolated state when the public contract makes them applicable.

Changed files and release surfaces are derived in production from repository state, including committed changes relative to the selected comparison base, OpenSpec metadata, manifests, and explicit configuration; they are not optional caller hints. An unresolved base yields an unresolved applicability decision rather than `not_applicable`. Configured `surfaces` and `requiredPlatforms` participate in applicability and gate obligations. Repository-policy, mode-selection, compatibility, and rollback evaluations are invoked by the production pipeline rather than existing only as standalone helpers.

Temporary directories isolate outputs, not hostile code. Package build scripts, installed exports, binaries, and configured drivers execute only through a constrained release runner that:

- supplies an allowlisted environment without inherited credentials;
- does not reveal or mount the original source-workspace path;
- captures bounded, redacted output suitable for durable evidence;
- disables lifecycle scripts unless a separately disclosed build command is explicitly authorized;
- runs public-entry smoke checks out of process;
- denies network access or publication-capable credentials where the host supports that control; and
- returns `human_needed` instead of claiming safe non-publication when required isolation cannot be established.

Configured commands remain an explicit user-authorized escape hatch, but their declared authority, environment, source access, network access, and expected outputs are recorded. Command-token filtering is defense in depth and is not treated as a sandbox.

Working-directory confinement, environment filtering, and output redaction alone are not strong isolation. Any release step that executes candidate-supplied code requires a host capability that enforces the declared filesystem and network boundary. Without that capability the check becomes `human_needed`; configuration cannot relabel the weaker execution as isolated. Durable output is treated as potentially secret-bearing and is bounded and redacted before any summary, error, or evidence event is persisted.

Upgrade and rollback checks validate a driver- or project-declared state contract and public behavior before and after each transition. The contract identifies actual package-owned configuration, stored data, or consumer-observable state plus the commands or observations that establish preservation. A verifier-created sentinel cannot establish state compatibility. Merely installing two artifacts does not establish migration or rollback correctness. Extension/plugin checks validate the installed manifest contract and generated workflow discovery through the actual host integration.

Release assurance never publishes or mutates a remote registry. Rollback tests operate only on disposable isolated state. Missing credentials, platforms, baselines, or human environments yield `human_needed` or failure according to configured policy.

Quick mode performs applicable pack, content, clean-install, and public-surface smoke checks. Guarded mode additionally runs applicable metadata, upgrade, and rollback checks. Full mode expands configured platform and compatibility matrices. A mode cannot claim a required release behavior passed when it omitted the evidence; omitted required coverage remains unresolved.

**Alternative considered:** rely on workspace tests plus `npm pack --dry-run`. Rejected because that does not establish clean installation or installed public behavior.

### 9. Keep role contracts and host capabilities explicit

Repository analyzers, plan checkers, reviewers, and verifiers receive read-only contracts. Debug executors use scoped write contracts. UAT decisions require a human actor. Release drivers receive only temporary-workspace mutation authority unless the user separately authorizes an external action.

The existing host-capability negotiation remains authoritative. Lack of subagents or parallelism changes scheduling, not result schemas or archive requirements. Lack of human interaction or an external environment produces a resumable `human_needed` result.

### 10. Expose all new state through existing status and gate surfaces

`/opsx:run-status` and `openspec-guardrails run-status --json` will include readiness, repository-context freshness, finding lifecycle counts, active debug sessions, pending UAT scenarios, release applicability, and unresolved actions. `/opsx:check` will reconcile events, rerun applicable deterministic checks, and evaluate convergence.

The existing `guardrails.assurance` gate remains the single archive obligation. It summarizes subordinate results rather than registering a separate durable gate per capability, avoiding orphaned gate records when routing changes.

## Risks / Trade-offs

- **Subjective plan analysis could block valid work** → Separate deterministic failures from judgment, require evidence and remediation, and use `human_needed` for genuinely undecidable assumptions.
- **Repository analysis could produce noisy or fabricated impact** → Require traceable evidence, observed/inferred labels, and explicit unknowns; never convert inference directly into scope.
- **Stable finding reconciliation could merge distinct issues** → Include logical scope in identity, diagnose collisions, and preserve separate provider identities when ambiguity remains.
- **Version 2 migration could corrupt active evidence** → Use fixtures from real version 1 states, make migration idempotent, retain the original files until the new event store validates, and fail closed on ambiguity.
- **Debug logs could grow without convergence** → Scope sessions to concrete failures, reject repeated unchanged experiments, and expose explicit unresolved or human-needed terminal states.
- **Human acceptance could become a rubber stamp** → Present individual scenarios, require explicit dispositions, keep accepted limitations distinct from passes, and invalidate stale evidence.
- **Release checks could execute unsafe package scripts** → Run in newly created temporary projects, expose command plans in evidence, use repository configuration for allowed drivers, and never publish automatically.
- **Temporary directories do not sandbox untrusted code** → Use the constrained runner, an allowlisted environment, out-of-process smoke checks, no original-workspace reference, redaction, and `human_needed` when network or filesystem authority cannot be bounded.
- **Multiple writers could lose canonical events** → Serialize cross-process appends, re-read under the commit boundary, verify the appended identity after replacement, and stress concurrent writers on every supported platform.
- **Generated-state symlinks could redirect writes or cleanup** → Resolve and validate every owned ancestor beneath the real change root and reject symlinked or replaced `.guardrails` directories.
- **Cross-platform behavior may diverge** → Use Node path APIs, portable record identities, disposable platform-native directories, and hosted Linux/macOS/Windows tests for state, UAT references, packaging, and clean install.
- **Six capabilities increase the initial increment size** → Build them on one shared event/finding foundation and deliver in dependency order with independent tests and checkpoints.

## Migration Plan

1. Complete and verify the locally installable Guardrails v1 baseline—an API-bearing OpenSpec fork prerelease plus a linked or packed companion—so version 1 fixtures and compatibility behavior are stable.
2. Add version 2 schemas, event payloads, generated-path constants, and read-only migration previews.
3. Verify idempotent migration and deterministic projection replay before enabling version 2 writes.
4. Add repository context and readiness as pre-execution stages, initially report-only behind a development flag, then make blocking behavior the default after conformance tests pass.
5. Replace latest-observation findings with lifecycle reconciliation and connect repair, verification, UAT, and gate evaluation.
6. Add debug and UAT workflows, then release drivers and mode routing.
7. Run cross-platform compatibility, migration, package, and clean-install matrices against the supported OpenSpec range.
8. Prepare the companion as a new minor version for private link or packed-artifact installation. Verify the installed artifact and retain the preceding local revision or package artifact for rollback. Downgrade creates a separate version 1-compatible export or restores into a separate target; it never overwrites or deletes canonical version 2 history. Package-registry publication remains deferred.
