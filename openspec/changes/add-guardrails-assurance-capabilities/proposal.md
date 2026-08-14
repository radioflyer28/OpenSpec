## Why

Guardrails can validate artifact structure and execute an assurance pipeline, but it does not yet establish that a change plan is capable of achieving its goal, preserve structured investigations when repair fails, or prove that every review and human-acceptance concern reached a durable disposition. Recent cross-repository packaging and private-install verification also showed that package and CLI changes need verification against the artifact users will actually install, not only the source workspace.

## What Changes

- Add an independent pre-execution readiness check before `/opsx:run` that evaluates requirement coverage, task sufficiency, dependency and write-set plausibility, compatibility obligations, risky assumptions, and the ability of planned evidence to prove completion.
- Compile a lightweight repository context record containing relevant implementation analogs, expected affected modules, test conventions, architectural boundaries, and likely downstream consumers for use by the execution graph.
- Enter a persistent scientific-debugging workflow after bounded repair is exhausted, recording hypotheses, experiments, observations, root-cause conclusions, resume state, and regression-test evidence.
- Give review and verification findings stable identities and an auditable lifecycle through repair, independent verification, accepted risk, or required human action; unresolved blocking findings continue to block archive.
- Add conversational UAT that presents acceptance scenarios individually, records evidence and disposition, converts failures into repair work, and requires explicit acceptance before satisfying human gates.
- Conditionally verify distributable packages, CLIs, plugins, and public artifacts by packing, inspecting, clean-installing, exercising public entry points, and checking applicable release metadata.
- Contribute `/opsx:debug <change> [--finding <id>]` for starting or resuming scientific investigations and `/opsx:uat <change>` for guided human acceptance; plan readiness and release assurance remain automatic stages of `/opsx:run` and `/opsx:check`.
- Keep all generated analysis, debugging, finding, UAT, and release records under `.guardrails/`, subordinate to OpenSpec requirements, design, and tasks.
- Make one Guardrails orchestrator the canonical generated-state writer; agents and checkers return structured results that the orchestrator validates, orders, and records atomically.
- Keep canonical replay, projection comparison, stale-evidence invalidation, explicit generated paths, and ordinary path and symbolic-link containment while treating generated state as durable workflow evidence rather than a tamper-proof audit ledger.
- Assign reviewer, verifier, executor, and human provenance through orchestrated workflow roles and explicit user actions rather than accepting caller-selected privileged role labels; stronger identity remains a host capability.
- Require fail-before-pass regression evidence from existing canonical checks for the same check and task or defect subject, with relevant ordering and revisions, and invalidate dependent conclusions when controlling evidence changes.
- Recompute readiness and invalidate finding, UAT, and release evidence whenever controlling OpenSpec or repository inputs materially change.
- Promote explicitly configured release surfaces into applicable assurance candidates even when discovery already produced a matching non-applicable candidate, unless configuration explicitly disables the surface with a recorded reason.
- Derive `/opsx:run-status` from canonical event replay and report canonical or projection-integrity errors instead of accepting mutually consistent generated projections as authoritative.
- Retain private pack, artifact inspection, clean-install, public-entry-point, and host-discovery verification while delegating strong filesystem, network, process, and identity isolation to host capabilities and reporting `human_needed` when genuinely required isolation is unavailable.
- Simplify the current unpublished state format and redundant generated reports in place rather than introducing version 3 or permanent compatibility obligations for intermediate generated-state schemas.
- Define Guardrails' assurance boundary explicitly: it protects against incomplete work, ordinary self-certification, stale or inconsistent evidence, accidental state corruption, accidental path escape, and unsafe default side effects, but not a malicious repository owner or same-user process, coordinated forgery of writable local state, or a compromised host.
- Keep the implementation in `openspec-guardrails` and use the existing generic extension and archive-gate APIs; this increment does not expand OpenSpec core with Guardrails-specific policy.
- Exclude the deferred Little Coder mechanisms, additional specialist-checker backlog, and GSD phase, milestone, roadmap, workstream, or persistent project-state machinery.

## Capabilities

### New Capabilities

- `guardrails-plan-readiness`: Independent goal-backward plan checking and explicit assumption assessment before execution begins.
- `guardrails-repository-context`: Machine-generated repository pattern and change-impact analysis used as execution input.
- `guardrails-debug-sessions`: Persistent scientific debugging, bounded resume state, and regression-proof requirements after failed repair.
- `guardrails-finding-lifecycle`: Stable finding identities, disposition states, convergence rules, and archive enforcement.
- `guardrails-conversational-uat`: Scenario-by-scenario human acceptance, evidence attachment, failure-to-repair routing, and gate satisfaction.
- `guardrails-release-assurance`: Conditional package, CLI, plugin, private-install, public-surface, and release-metadata verification against distributable artifacts.

### Modified Capabilities

None.

## Impact

- Primarily affects the separately maintained `openspec-guardrails` companion package: workflow instructions, schemas, generated records, execution graph compilation, assurance routing, CLI commands, gate evaluation, and reports.
- Adds generated records beneath `openspec/changes/<change>/.guardrails/` while preserving OpenSpec artifacts as the sole human-maintained planning truth.
- May invoke repository search, deterministic tests, packaging tools, clean temporary installations, and human interaction when the corresponding capability is applicable and supported.
- Treats package code and configured release commands as untrusted execution: credentials, source-workspace access, publication authority, and persisted command output must be minimized or explicitly authorized.
- May require one-time conversion or regeneration of intermediate local generated state; the unpublished format does not create a permanent public compatibility obligation.
- Requires portable path handling and equivalent assurance behavior on Linux, macOS, and Windows; unsupported optional host capabilities must fall back without weakening required outcomes.
- Depends on the Guardrails v1 extension seam, Tier 0 protocol, stable task identity, reconciliation, and archive-gate behavior established by the preceding Guardrails changes.
