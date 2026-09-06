## Context

See proposal.md for motivation. OpenSpec GSD already compiles OpenSpec artifacts into a task graph, selects assurance checks, negotiates portable execution tiers, records canonical events, materializes run and assurance projections, bounds repair attempts, and exposes the `gsd.assurance` archive gate.

The companion package owns assurance policy. OpenSpec core discovers workflows and invokes gates through the generic extension API; this change does not add OpenSpec GSD-specific behavior to core. Tier 0 remains the portability baseline, while higher tiers may dispatch isolated or parallel roles.

Implementation of this increment introduced valuable readiness, finding, debugging, UAT, and install-assurance behavior together with disproportionate execution-record concurrency, filesystem-adversary, compatibility, and release-isolation machinery. An independent de-complexity audit concluded that OpenSpec GSD should remain an assurance coordinator rather than become a local security runtime. The current version 2 execution-record format is unpublished and may be simplified without creating a permanent compatibility ladder.

## Goals / Non-Goals

**Goals:**

- Fail early when a change plan cannot establish its stated goal.
- Give executors evidence-backed repository context without creating another human-maintained plan.
- Keep OpenSpec proposal, specification, design, and task artifacts as the sole human-maintained planning and development-tracking truth.
- Adopt selected GSD skills and harness mechanisms without requiring the complete GSD runtime or its project-state model.
- Preserve structured investigations, findings, and human acceptance across ordinary process or host-context loss.
- Require relevant fail-before-pass evidence and independent verifier-stage confirmation for behavior-defect resolution.
- Verify private distributable artifacts on macOS through packing, inspection, clean installation, and declared installed-interface checks.
- Make canonical gate and status results reproducible from one orchestrator-owned event history.
- Reduce implementation and maintenance complexity while preserving equivalent assurance outcomes across supported tiers.

**Non-Goals:**

- Protecting against a malicious repository owner or same-user process with arbitrary workspace or shell access.
- Detecting coordinated forgery of every locally writable OpenSpec GSD execution-evidence file.
- Protecting against a compromised host, runtime, filesystem, or operating system.
- Providing cryptographic human or agent identity.
- Building a general-purpose filesystem, network, or process sandbox.
- Maintaining permanent compatibility for unpublished intermediate execution-record schemas.
- Adding GSD `PROJECT.md`, `ROADMAP.md`, `PLAN.md`, `STATE.md`, `.planning/`, phases, milestones, roadmaps, workstreams, project state, or other GSD administration.
- Installing or operating the complete GSD runtime.
- Implementing deferred Little Coder mechanisms or the deferred specialist-checker backlog.
- Publishing packages, creating releases, mutating registries, or performing destructive actions against external user data.

## Decisions

### 1. Keep assurance policy in the companion extension and planning truth in OpenSpec

The workflows, schemas, adapters, reports, and gate policy remain in openspec-gsd. The manifest contributes debug and UAT workflows through the existing public extension contract. Plan readiness and release assurance remain stages of run and check.

The compatible OpenSpec API range changes only when conformance testing identifies a generic extension-seam gap. OpenSpec GSD policy does not enter OpenSpec core.

OpenSpec GSD selects and adapts individual GSD skills and harness mechanisms; it does not depend on the complete GSD runtime. OpenSpec artifacts remain authoritative for scope, requirements, design, and tasks. Machine-generated context, findings, debugging sessions, UAT dispositions, and verification evidence live beneath `.openspec-gsd/`, reference OpenSpec requirement and task identities, and contain only the operational detail needed to execute, resume, or verify work. They do not reproduce OpenSpec planning prose or form a parallel plan.

The companion never creates or requires GSD milestones, phases, roadmaps, workstreams, `.planning/`, `PROJECT.md`, `ROADMAP.md`, `PLAN.md`, or `STATE.md`. When execution evidence indicates that scope or planning must change, the workflow stops for an explicit OpenSpec artifact update.

**Alternative considered:** add first-class readiness, debugging, or UAT policy to OpenSpec core. Rejected because it expands upstream conflict surface and weakens the companion boundary.

### 2. Adopt an explicit cooperative assurance boundary

OpenSpec GSD protects against incomplete implementation, ordinary executor self-certification, stale or internally inconsistent evidence, accidental execution-record corruption, accidental path escape, unsafe default side effects, and unsupported capabilities being represented as successful assurance.

Generated execution records are durable and reconstructable workflow evidence, not planning state or a tamper-proof audit ledger. OpenSpec GSD validates schemas and content digests, replays canonical events, compares projections, invalidates stale evidence, and fails closed on malformed records. It accepts the risk that a malicious workspace owner or same-user process can coordinate changes to source, tests, specifications, configuration, commands, and generated evidence.

Strong identity or isolation is accepted only when supplied by a negotiated host capability. When a requirement genuinely depends on an unavailable capability, OpenSpec GSD returns human_needed rather than emulating it.

**Alternative considered:** harden local state against hostile same-user mutation. Rejected because meaningful protection would require host or operating-system trust infrastructure outside the extension and would not secure the rest of the writable repository.

### 3. Use one orchestrator-owned canonical writer

Agents, checkers, reviewers, verifiers, and worktree executors return structured domain results. They do not write events.json, run.json, assurance.json, or other canonical execution records.

The OpenSpec GSD orchestrator validates returned results, assigns workflow provenance, accepts them in deterministic orchestration order, appends them to canonical history, and updates projections. Caller timestamps are evidence metadata and never reorder accepted events. Stable event identities retain idempotency for retried result delivery.

Tier behavior is:

    Tier 0: roles execute sequentially and return results to the orchestrator.
    Tier 1: isolated roles may execute concurrently but return results to one writer.
    Tier 2: worktree executors may run safe waves in parallel; merges and state commits remain serialized.

Accidental simultaneous mutating commands may be rejected by host serialization or a coarse command-level busy marker. Such a marker has no lease, heartbeat, PID-liveness inference, automatic stale stealing, quarantine, or fencing. Recovery from a stale marker is explicit.

**Alternative considered:** allow each role or process to append canonical events directly. Rejected because optional parallel execution does not justify treating local execution evidence as a multi-writer database.

### 4. Keep one canonical history and two replaceable projections

The current unpublished schema remains version 2; this change does not introduce version 3. events.json is canonical. run.json and assurance.json are replaceable projections. Additional per-domain report files are removed unless a demonstrated independent consumer requires one.

One read-only canonical loader performs path validation, schema validation, event replay, projection regeneration, and projection comparison. Gate evaluation, check, run-status, and projection repair use this shared path. A missing, malformed, stale, digest-inconsistent, or irreproducible projection cannot establish a passing gate or status.

Array append order is canonical. Replay does not sort completed events by caller timestamps. Atomic file replacement prevents interrupted writes from replacing the prior valid store with a partial file. Coordinated rewriting of canonical execution history and its projections remains outside the accepted threat model.

**Alternative considered:** add hash chains, an external expected-tail anchor, transaction markers, or branch recovery. Rejected because those mechanisms create a local audit-ledger protocol without protecting against an actor able to rewrite every workspace file.

### 5. Simplify generated-path containment

Every OpenSpec GSD-owned generated path is listed in one explicit constant registry. Filesystem boundaries use Node path APIs and portable record identities. OpenSpec GSD resolves the active change root, verifies ordinary containment, rejects an existing `.openspec-gsd/` symbolic link, redirect, or non-directory that escapes the change, writes to a unique temporary file, and replaces the target atomically.

These controls prevent accidental escape and unsafe pre-existing path layouts. They do not claim protection against hostile path replacement after validation. Subprocess ancestor-identity checks, native descriptor-relative APIs, handle-identity layers, and lock-lifecycle race defenses are removed.

**Alternative considered:** preserve workspace identity through every read, rename, migration, and cleanup operation. Rejected because Node does not expose a uniform cross-platform primitive and the stronger guarantee belongs to a trusted host filesystem boundary.

### 6. Collapse unpublished schema compatibility

The version 2 execution-record schema may change in place while the package remains private and unpublished. Before removing runtime version 1 support, implementation inventories actual active version 1 execution records. If needed, a one-time conversion command preserves relevant evidence; otherwise users receive explicit regeneration and human-reconfirmation guidance.

Permanent dual readers, version 1 compatibility exports, downgrade bundles, and restoration over newer canonical execution history are removed. Git history and retained local package revisions provide implementation rollback; execution-record downgrade is not a public contract.

**Alternative considered:** retain every intermediate schema indefinitely. Rejected because it converts development artifacts into an unsupported public compatibility obligation.

### 7. Compile repository context and readiness before implementation writes

A deterministic collector identifies manifests, affected modules, imports and exports, tests, changed files, configured architectural boundaries, and OpenSpec references. A read-only analyzer records relevant analogs, conventions, consumers, conflicts, and unknowns with evidence references and observed-versus-inferred classification.

The plan checker evaluates requirement, scenario, task, and evidence coverage; dependency and write-set plausibility; assumptions; compatibility obligations; and whether planned verification can prove completion. It may recommend an OpenSpec update but cannot perform one.

Every run or resume refreshes current repository inputs and readiness before implementation writes. Missing comparison-base evidence remains an explicit unknown rather than silently producing an empty impact set. Tier 1 and Tier 2 analyzers return structured results to the same orchestrator-owned commit path.

### 8. Reconcile findings through orchestrator-assigned provenance

Finding identity is namespaced by producer and stable logical scope rather than summary wording. The lifecycle remains:

    open -> repaired -> independently_verified
      |         |
      |         +-> stale after relevant change
      +-> accepted_risk
      +-> human_needed

The orchestrator assigns executor, reviewer, verifier, and human provenance from the stage or explicit action that produced a result. Domain results and CLI actor labels cannot choose privileged provenance. An executor may establish repaired state but cannot establish independent verification. A verifier transition must originate from a distinct orchestrator-dispatched verifier stage.

Accepted risk and other human dispositions use dedicated UAT or risk actions or a negotiated human-interaction result. When explicit human interaction is unavailable, the obligation remains human_needed. Stronger identity, if required by a host, remains host-provided rather than implemented with signatures, keys, nonces, or issuer registries.

Material OpenSpec, source, check, or cited repository-evidence changes make affected repair, verification, and acceptance evidence stale.

### 9. Preserve scientific debugging with semantically bound regression evidence

Repair exhaustion creates or resumes one debug session for the logical failure. Sessions record hypotheses, experiments, observations, conclusions, changed references, unresolved questions, and next actions separately. Repeated materially equivalent unsuccessful experiments against unchanged evidence require a new hypothesis, changed input, or human direction.

Resolution of a behavior defect links existing canonical RED and GREEN evidence. The pair must identify the same stable check and task or defect subject, show failure before the fix and success against the resulting revision, and remain current with controlling evidence. Caller-authored portable strings cannot substitute for evidence records. A distinct verifier stage confirms resolution. A regression exemption requires an explicit human action and otherwise remains human_needed.

### 10. Model UAT as explicit scenario dispositions

UAT projects applicable human scenarios from current OpenSpec coverage and human-needed findings, presents one scenario at a time, and records passed, failed, blocked, or accepted_limitation.

Passing and accepted-limitation dispositions require the dedicated UAT action or a negotiated human-interaction stage. Generic executor, reviewer, verifier, or domain-result paths cannot submit them. Actor identity is optional attribution, not cryptographic authority.

Failed UAT creates a blocking finding. Repair and independent verification return the original scenario to awaiting retest. Material requirement, implementation, or evidence changes invalidate prior acceptance. If no explicit human interaction path is available, the scenario remains human_needed.

### 11. Limit release assurance to private artifact and install outcomes

Release candidates are keyed by surface kind and manifest or configured identity. Precedence is explicit disablement with a reason, enabled configuration, then discovery. Enabled configuration promotes a matching automatically non-applicable candidate.

Applicable checks may:

1. Build or pack into a temporary location.
2. Record the artifact digest and inspect files and dependency metadata.
3. Install into a clean temporary project.
4. Exercise declared exports, binaries, commands, or extension or plugin host discovery.
5. Evaluate applicable package metadata, compatibility ranges, repository-required release notes or changesets, and installation guidance.

Operational hygiene includes a minimal environment, bounded and redacted output, argument-vector execution, disabled lifecycle scripts unless explicitly authorized, and no publication or external destructive action. These measures do not constitute a sandbox. Strong filesystem, network, process, or identity isolation is delegated to the host. A requirement that depends on unavailable isolation becomes human_needed.

Generic previous-artifact compatibility contracts, synthetic upgrade sentinels, generalized upgrade and rollback drivers, and claims that OpenSpec GSD contains arbitrary candidate code are removed. A concrete future OpenSpec requirement may add product-specific migration verification separately.

Quick mode performs applicable pack, inspection, clean-install, and declared installed-interface smoke checks on macOS. Guarded mode adds applicable metadata and compatibility policy. Full mode may expand explicitly configured compatibility or future platform requirements, but this increment configures and qualifies macOS only. An explicitly configured requirement still remains unresolved when its evidence is unavailable; Linux and Windows qualification are not default archive obligations for this private-use increment.

### 12. Expose one assurance truth through workflows and gates

run-status and its JSON form use the same canonical loader as the archive gate. Status includes readiness, repository-context freshness, finding states, active debug sessions, pending UAT, release applicability, and next actions. Canonical or projection-integrity errors are explicit blocking status results.

The `gsd.assurance` gate remains the single archive obligation and summarizes subordinate readiness, finding, debugging, UAT, release, review, and goal-verification outcomes. Disabling or rerouting a workflow does not erase an already recorded required obligation.

### 13. Freeze the private macOS completion boundary

This increment is complete when its current OpenSpec requirements and regression suites pass, the packed companion installs in a clean macOS project, its declared installed interfaces and five contributed workflows are discovered and exercised, and one bounded acceptance review reports no reproducible blocking defect within the accepted assurance boundary.

The acceptance review may block only for a concrete violation of a current requirement within the frozen threat model, supported by a reproducible execution path and observable impact. Speculative hardening, new security boundaries, additional features, and Linux or Windows qualification are future work unless deliberately introduced by a later OpenSpec change. Passing macOS evidence does not imply support for unqualified hosts.

An explicit project configuration may still request additional platform evidence and remain unresolved when it is unavailable. This does not make Linux or Windows qualification a completion requirement for the companion's own private macOS installation.

## Risks / Trade-offs

- **Single-writer serialization may reduce peak throughput** -> Canonical commits are small; roles may still execute concurrently and return results asynchronously.
- **A crashed command may leave a coarse busy marker** -> Recovery is explicit and diagnostic rather than inferred from unreliable elapsed time or PID reuse.
- **Removing runtime schema compatibility may invalidate local execution evidence** -> Inventory actual records first, convert once when needed, otherwise require explicit regeneration and human reconfirmation.
- **Accepting hostile local execution-record mutation may permit deliberate forgery** -> State the boundary honestly and rely on repository ownership and host security; rerun independent checks when provenance is uncertain.
- **Operational release hygiene does not contain arbitrary code** -> Delegate required isolation to the host and return human_needed when unavailable.
- **Deleting reports or compatibility APIs may affect unknown consumers** -> Search repository and installed private usage before deletion; retain only consumers with concrete evidence.
- **Simplification could weaken useful assurance behavior** -> Preserve outcome-focused tests for canonical gate replay, atomic replacement, existing symlink rejection, readiness staleness, serialized higher-tier result merging, debug independence, UAT retest, installed artifacts, and the OpenSpec core boundary.
- **Behavior on unqualified hosts may diverge** -> Preserve portable identities and Node path APIs, make no Linux or Windows support claim in this increment, and qualify additional hosts through future changes before advertising support.

## Migration Plan

1. Record the accepted assurance boundary and reject the proposed version 3, trusted-authority, native-filesystem, and sandbox directions.
2. Inventory active generated execution records and private consumers of compatibility APIs and per-domain reports.
3. Route structured role results through one orchestrator writer, then remove event-level leases, heartbeat, liveness, quarantine, fencing, and direct role writes.
4. Collapse the unpublished schema and generated files, retaining a one-time importer only when actual version 1 execution records require it.
5. Share canonical loading across gate, check, status, and projection regeneration.
6. Fix orchestrator-owned provenance, semantically bound regression evidence, and configured release-surface precedence.
7. Trim release assurance to private artifact and install outcomes and delegate stronger isolation to host capabilities.
8. Remove incidental security-runtime tests and preserve the outcome-focused regression suite.
9. Update documentation, capability maps, package exports, and CLI guidance.
10. Run companion, core-seam, conformance, installed-artifact, upstream-survivability, and macOS qualification tests.
11. Request one bounded acceptance review against the explicit threat model and completion boundary.
12. Link or install the verified private companion on the user's macOS environment, run extension diagnostics, and exercise its declared installed interfaces before archiving the change.
