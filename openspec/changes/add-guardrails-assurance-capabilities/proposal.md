## Why

Guardrails can validate artifact structure and execute an assurance pipeline, but it does not yet establish that a change plan is capable of achieving its goal, preserve structured investigations when repair fails, or prove that every review and human-acceptance concern reached a durable disposition. Recent cross-repository packaging and private-install verification also showed that package and CLI changes need verification against the artifact users will actually install, not only the source workspace.

## What Changes

- Add an independent pre-execution readiness check before `/opsx:run` that evaluates requirement coverage, task sufficiency, dependency and write-set plausibility, compatibility obligations, risky assumptions, and the ability of planned evidence to prove completion.
- Compile a lightweight repository context record containing relevant implementation analogs, expected affected modules, test conventions, architectural boundaries, and likely downstream consumers for use by the execution graph.
- Enter a persistent scientific-debugging workflow after bounded repair is exhausted, recording hypotheses, experiments, observations, root-cause conclusions, resume state, and regression-test evidence.
- Give review and verification findings stable identities and an auditable lifecycle through repair, independent verification, accepted risk, or required human action; unresolved blocking findings continue to block archive.
- Add conversational UAT that presents acceptance scenarios individually, records evidence and disposition, converts failures into repair work, and requires explicit acceptance before satisfying human gates.
- Conditionally verify distributable packages, CLIs, plugins, and public artifacts by packing, inspecting, clean-installing, exercising public entry points, checking release metadata, and evaluating upgrade and rollback evidence.
- Contribute `/opsx:debug <change> [--finding <id>]` for starting or resuming scientific investigations and `/opsx:uat <change>` for guided human acceptance; plan readiness and release assurance remain automatic stages of `/opsx:run` and `/opsx:check`.
- Keep all generated analysis, debugging, finding, UAT, and release records under `.guardrails/`, subordinate to OpenSpec requirements, design, and tasks.
- Make canonical assurance history authoritative at archive time, preserve every concurrent event, and prevent generated-state paths from escaping the active change workspace.
- Recompute readiness and invalidate finding, UAT, and release evidence whenever controlling OpenSpec or repository inputs materially change.
- Run release candidates with explicitly bounded authority and report `human_needed` when the host cannot provide the isolation needed to establish a release claim safely.
- Keep the implementation in `openspec-guardrails` and use the existing generic extension and archive-gate APIs; this increment does not expand OpenSpec core with Guardrails-specific policy.
- Exclude the deferred Little Coder mechanisms, additional specialist-checker backlog, and GSD phase, milestone, roadmap, workstream, or persistent project-state machinery.

## Capabilities

### New Capabilities

- `guardrails-plan-readiness`: Independent goal-backward plan checking and explicit assumption assessment before execution begins.
- `guardrails-repository-context`: Machine-generated repository pattern and change-impact analysis used as execution input.
- `guardrails-debug-sessions`: Persistent scientific debugging, bounded resume state, and regression-proof requirements after failed repair.
- `guardrails-finding-lifecycle`: Stable finding identities, disposition states, convergence rules, and archive enforcement.
- `guardrails-conversational-uat`: Scenario-by-scenario human acceptance, evidence attachment, failure-to-repair routing, and gate satisfaction.
- `guardrails-release-assurance`: Conditional package, CLI, plugin, upgrade, rollback, and release-metadata verification against distributable artifacts.

### Modified Capabilities

None.

## Impact

- Primarily affects the separately maintained `openspec-guardrails` companion package: workflow instructions, schemas, generated records, execution graph compilation, assurance routing, CLI commands, gate evaluation, and reports.
- Adds generated records beneath `openspec/changes/<change>/.guardrails/` while preserving OpenSpec artifacts as the sole human-maintained planning truth.
- May invoke repository search, deterministic tests, packaging tools, clean temporary installations, and human interaction when the corresponding capability is applicable and supported.
- Treats package code and configured release commands as untrusted execution: credentials, source-workspace access, publication authority, and persisted command output must be minimized or explicitly authorized.
- Requires portable path handling and equivalent assurance behavior on Linux, macOS, and Windows; unsupported optional host capabilities must fall back without weakening required outcomes.
- Depends on the Guardrails v1 extension seam, Tier 0 protocol, stable task identity, reconciliation, and archive-gate behavior established by the preceding Guardrails changes.
