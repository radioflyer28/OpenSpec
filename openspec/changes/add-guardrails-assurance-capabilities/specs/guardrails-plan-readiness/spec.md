## Purpose

Establishes whether an OpenSpec change is sufficiently complete, coherent, and verifiable to begin guarded execution.

## ADDED Requirements

### Requirement: Execution begins with independent readiness evaluation
Before `/opsx:run` executes or resumes implementation tasks, Guardrails SHALL independently evaluate the current OpenSpec proposal, specifications, design, tasks, and relevant repository evidence. Required readiness SHALL be the default for new version 2 configurations. The evaluator SHALL be read-only and its result SHALL NOT be satisfied by executor claims.

#### Scenario: Ready change proceeds to execution
- **WHEN** every blocking readiness check passes for the current artifact revision
- **THEN** Guardrails records a passing readiness result and permits execution to begin

#### Scenario: Unready change is stopped before implementation
- **WHEN** a blocking readiness check fails or cannot be established
- **THEN** Guardrails stops before implementation writes and reports the unresolved issue with remediation guidance

#### Scenario: Existing run is resumed after controlling input changes
- **WHEN** a run already exists and a controlling OpenSpec or repository input has changed since its passing readiness evaluation
- **THEN** Guardrails recomputes readiness and blocks implementation writes until the current result passes

### Requirement: Requirements, tasks, and evidence form a complete chain
The readiness evaluator SHALL establish that every requirement and acceptance scenario maps to implementation tasks and planned observable evidence, and that the complete task set covers the declared change goal without relying on unmapped executor work.

#### Scenario: Requirement has no implementing task
- **WHEN** a requirement or scenario has no task capable of delivering it
- **THEN** readiness fails and identifies the uncovered requirement or scenario

#### Scenario: Verification cannot prove a requirement
- **WHEN** planned checks would execute successfully without demonstrating a declared behavior
- **THEN** readiness fails and identifies the evidence gap

### Requirement: Execution structure is plausible
The readiness evaluator SHALL assess task dependencies, ordering, declared write sets, architectural boundaries, and expected affected modules for contradictions, cycles, unsafe overlap, or missing prerequisite work.

#### Scenario: Tasks contain a dependency cycle
- **WHEN** task dependencies cannot be ordered into an executable graph
- **THEN** readiness fails and reports the cycle using stable task identifiers

#### Scenario: Concurrent tasks have unsafe overlapping write sets
- **WHEN** tasks proposed for the same execution wave may modify the same protected files or boundaries
- **THEN** readiness fails for parallel execution and reports a safe sequential or replanning alternative

### Requirement: Assumptions and compatibility obligations are explicit
The readiness evaluator SHALL identify material assumptions and public-contract changes. Each risky assumption SHALL have supporting evidence, a validation task, or an explicit human disposition, and each public-contract change SHALL include applicable compatibility, migration, documentation, and consumer-verification work.

#### Scenario: Risky assumption lacks a validation path
- **WHEN** successful implementation depends on an unsupported material assumption
- **THEN** readiness blocks and records the assumption and the evidence or decision needed to resolve it

#### Scenario: Public contract changes without compatibility work
- **WHEN** a public API, CLI, schema, configuration, or stored format changes without applicable compatibility handling
- **THEN** readiness fails and identifies the missing obligation

### Requirement: Readiness results become stale when controlling inputs change
Guardrails SHALL associate readiness evidence with the exact controlling OpenSpec and repository revisions evaluated. A material change to those inputs SHALL invalidate the prior passing result and require reevaluation.

#### Scenario: Tasks change after readiness passes
- **WHEN** `tasks.md` is materially revised after a passing readiness result
- **THEN** Guardrails marks that result stale and reruns readiness before execution continues

#### Scenario: Readiness records use portable paths
- **WHEN** the same change is evaluated on Windows, macOS, or Linux
- **THEN** evidence references resolve to the same logical artifacts using platform-correct paths
