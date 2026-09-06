## Purpose

Keep the OpenSpec extension seam and Guardrails companion independently upgradeable while preserving OpenSpec artifacts as the only planning and task-tracking authority.

## ADDED Requirements

### Requirement: OpenSpec remains the live planning authority
Guardrails SHALL derive scope, requirements, scenarios, and task progress from the current OpenSpec proposal, specs, design, and tasks whenever a run is checked or reported.

#### Scenario: Tasks change after a run starts
- **WHEN** a user updates task completion in the authoritative OpenSpec `tasks.md` after Guardrails created a run
- **THEN** the next Guardrails check or status operation reports the current OpenSpec task progress
- **AND** a stale generated task snapshot does not override that progress

#### Scenario: Controlling artifacts change
- **WHEN** a proposal, spec, design, or task referenced by a run changes
- **THEN** Guardrails detects the changed artifact state
- **AND** re-evaluates or marks stale any assurance evidence whose controlling source no longer matches

#### Scenario: Guardrails records execution state
- **WHEN** Guardrails records execution waves, evidence, deviations, repairs, or assurance results
- **THEN** those records reference stable OpenSpec identifiers and source-state digests
- **AND** remain derived execution evidence rather than replacement scope or progress documents

### Requirement: Durable evidence uses stable OpenSpec identifiers
Guardrails SHALL require stable task identifiers and stable requirement or scenario references before binding durable assurance evidence to them.

#### Scenario: Explicit task identifiers
- **WHEN** a guarded change contains explicitly identified checklist tasks
- **THEN** Guardrails preserves those identifiers across checks and status operations

#### Scenario: Unstable fallback task identifier
- **WHEN** a task lacks an explicit stable identifier and durable evidence would depend on its list position
- **THEN** Guardrails blocks evidence registration for that task
- **AND** explains how to assign a stable identifier

### Requirement: Extension compatibility identifies the actual API provider
OpenSpec and Guardrails SHALL determine compatibility from both the declared extension API version and an OpenSpec distribution that actually provides that API.

#### Scenario: Compatible fork or upstream release
- **WHEN** Guardrails is installed with an OpenSpec distribution that exports the declared extension API and falls within its supported compatibility range
- **THEN** extension installation and doctor report the pair as compatible

#### Scenario: Official version lacks the extension API
- **WHEN** an OpenSpec package satisfies a broad semantic version range but does not provide the declared extension API
- **THEN** Guardrails installation or doctor reports it as incompatible
- **AND** identifies the required distribution or API-bearing version

#### Scenario: Fork seam has not been accepted upstream
- **WHEN** the extension seam is available only from the maintained fork
- **THEN** the fork package or version is distinguishable from the official package with the same upstream version
- **AND** Guardrails does not claim compatibility with an indistinguishable official build

### Requirement: Upstream survivability is verified against the official repository
The fork SHALL verify its generic extension-seam patch against a freshly fetched official OpenSpec main branch before treating an upstream update as compatible.

#### Scenario: Fork CI runs
- **WHEN** upstream-survivability verification runs from the fork
- **THEN** it fetches `Fission-AI/OpenSpec` independently of the fork's `origin`
- **AND** reports the exact official revision tested

#### Scenario: Patch no longer applies
- **WHEN** the extension seam cannot be applied cleanly to the fetched official revision
- **THEN** verification fails before release
- **AND** identifies the conflicting integration files

#### Scenario: Patched upstream is compatible
- **WHEN** the seam applies successfully
- **THEN** the patched upstream build, extension conformance tests, archive-gate tests, and platform matrix pass before release readiness is reported

### Requirement: Guardrails has an independent release lifecycle
The Guardrails companion SHALL be versioned, tested, packaged, and released independently from the OpenSpec fork while declaring the exact supported OpenSpec extension API range.

#### Scenario: Companion change is released
- **WHEN** Guardrails behavior changes without changing the public core seam
- **THEN** the companion can be released without publishing a new OpenSpec fork build

#### Scenario: Core seam changes
- **WHEN** the public extension API changes
- **THEN** Guardrails conformance runs against the minimum and maximum supported API-bearing OpenSpec versions
- **AND** installation and upgrade documentation gives the required release order

#### Scenario: Cross-platform release candidate
- **WHEN** either release unit is prepared for publication
- **THEN** Linux, macOS, and Windows build, conformance, packaging, and Tier 0 checks pass for that release candidate

### Requirement: The supported core seam stays generic and bounded
The OpenSpec fork SHALL keep Guardrails policy in the companion and expose only versioned generic extension behavior required by supported extensions.

#### Scenario: Guardrails policy changes
- **WHEN** TDD classification, checker routing, repair policy, or execution strategy changes
- **THEN** the change is implemented and released in `openspec-guardrails`
- **AND** the OpenSpec fork remains unchanged unless the public generic contract must evolve

#### Scenario: Contribution type is not supported in v1
- **WHEN** a contribution type is unused and not part of the declared stable v1 contract
- **THEN** OpenSpec does not advertise it as supported merely for possible future use

#### Scenario: Core integration changes upstream hot spots
- **WHEN** the seam integrates with archive, artifact resolution, workflow generation, update, or command transformation
- **THEN** the integration delegates through a narrow extension boundary
- **AND** generic extension logic remains isolated from those existing modules
