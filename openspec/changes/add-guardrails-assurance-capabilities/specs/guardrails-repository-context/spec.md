## Purpose

Provides a lightweight, evidence-backed view of repository patterns and likely change impact for planning and execution assurance.

## ADDED Requirements

### Requirement: OpenSpec GSD compiles repository context before plan readiness
OpenSpec GSD SHALL derive current changed files from repository evidence and generate a repository context record containing relevant implementation analogs, expected affected modules, test conventions, architectural boundaries, and likely downstream consumers before final readiness evaluation. Absence of caller-supplied paths SHALL NOT silently produce an empty impact analysis.

#### Scenario: Existing implementation analog is found
- **WHEN** the repository contains behavior structurally similar to the proposed change
- **THEN** the context record identifies the analog and cites the repository evidence supporting the match

#### Scenario: No reliable analog is found
- **WHEN** repository evidence does not support a credible analog
- **THEN** the context record states that the area is unknown rather than inventing a pattern

#### Scenario: Repository analysis runs through a negotiated higher tier
- **WHEN** a Tier 1 or Tier 2 host provides a read-only repository-analysis adapter
- **THEN** OpenSpec GSD invokes that adapter through the runner and validates the same evidence and result schema used by Tier 0

#### Scenario: Feature branch work is already committed
- **WHEN** the current workspace is clean but the active branch contains commits relative to its configured or discovered comparison base
- **THEN** OpenSpec GSD includes those committed changes in impact analysis or reports the comparison base as unresolved instead of producing an empty impact set

### Requirement: Context findings are traceable and confidence-aware
Every generated context claim SHALL reference inspectable repository evidence and SHALL distinguish directly observed facts from inferred impact. Uncertain or conflicting findings SHALL be reported as such.

#### Scenario: Downstream consumer is inferred
- **WHEN** a public symbol or contract appears to have downstream consumers
- **THEN** the context record cites the observed references and labels the projected impact as an inference

#### Scenario: Repository conventions conflict
- **WHEN** relevant modules use incompatible implementation or test conventions
- **THEN** the context record reports the conflict and does not select a convention without rationale

### Requirement: Repository context informs but does not replace OpenSpec artifacts
OpenSpec proposal, specification, design, and task artifacts SHALL remain the only human-maintained planning and development-tracking truth. Generated context SHALL reference controlling requirement, design, and task identifiers and MAY recommend affected areas or verification targets. It SHALL NOT reproduce their planning prose, create new scope, silently rewrite OpenSpec artifacts, or become a human-maintained plan.

#### Scenario: Analysis discovers likely additional work
- **WHEN** repository impact analysis indicates that an unplanned consumer must change
- **THEN** OpenSpec GSD reports a readiness issue requiring an explicit OpenSpec artifact update before execution

#### Scenario: Generated context conflicts with a design decision
- **WHEN** an observed repository pattern conflicts with an explicit design decision
- **THEN** OpenSpec GSD surfaces the conflict for disposition and keeps the design authoritative until it is deliberately revised

#### Scenario: A selected GSD-derived capability is used
- **WHEN** OpenSpec GSD invokes an adopted skill or harness mechanism
- **THEN** it consumes OpenSpec artifacts and repository evidence without requiring the complete GSD runtime or creating GSD project-management state

#### Scenario: Generated execution evidence is persisted
- **WHEN** OpenSpec GSD records context, findings, debugging progress, UAT, or verification results beneath `.openspec-gsd/`
- **THEN** the record references OpenSpec identities and contains only the evidence needed to execute, resume, or verify the change rather than duplicating a plan

#### Scenario: A workflow attempts to initialize GSD planning artifacts
- **WHEN** an adopted mechanism would create `PROJECT.md`, `ROADMAP.md`, `PLAN.md`, `STATE.md`, `.planning/`, milestone, phase, roadmap, or workstream state
- **THEN** OpenSpec GSD does not create or require that state and continues to use the controlling OpenSpec artifacts

### Requirement: Context is refreshed when relevant repository evidence changes
OpenSpec GSD SHALL associate repository context with the evaluated source revision and cited evidence-content digests and SHALL refresh affected findings when relevant files, symbols, configurations, or tests change.

#### Scenario: Relevant module changes during a run
- **WHEN** execution modifies evidence used by the context record
- **THEN** OpenSpec GSD marks affected context entries stale before they are reused for later verification

#### Scenario: Context uses portable identities on macOS
- **WHEN** repository context is compiled from different macOS project roots
- **THEN** file references and module identities remain logically equivalent and platform-correct
