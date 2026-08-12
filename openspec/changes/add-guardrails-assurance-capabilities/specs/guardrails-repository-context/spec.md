## Purpose

Provides a lightweight, evidence-backed view of repository patterns and likely change impact for planning and execution assurance.

## ADDED Requirements

### Requirement: Guardrails compiles repository context before plan readiness
Guardrails SHALL derive current changed files from repository evidence and generate a repository context record containing relevant implementation analogs, expected affected modules, test conventions, architectural boundaries, and likely downstream consumers before final readiness evaluation. Absence of caller-supplied paths SHALL NOT silently produce an empty impact analysis.

#### Scenario: Existing implementation analog is found
- **WHEN** the repository contains behavior structurally similar to the proposed change
- **THEN** the context record identifies the analog and cites the repository evidence supporting the match

#### Scenario: No reliable analog is found
- **WHEN** repository evidence does not support a credible analog
- **THEN** the context record states that the area is unknown rather than inventing a pattern

#### Scenario: Repository analysis runs through a negotiated higher tier
- **WHEN** a Tier 1 or Tier 2 host provides a read-only repository-analysis adapter
- **THEN** Guardrails invokes that adapter through the runner and validates the same evidence and result schema used by Tier 0

### Requirement: Context findings are traceable and confidence-aware
Every generated context claim SHALL reference inspectable repository evidence and SHALL distinguish directly observed facts from inferred impact. Uncertain or conflicting findings SHALL be reported as such.

#### Scenario: Downstream consumer is inferred
- **WHEN** a public symbol or contract appears to have downstream consumers
- **THEN** the context record cites the observed references and labels the projected impact as an inference

#### Scenario: Repository conventions conflict
- **WHEN** relevant modules use incompatible implementation or test conventions
- **THEN** the context record reports the conflict and does not select a convention without rationale

### Requirement: Repository context informs but does not replace OpenSpec artifacts
The generated context SHALL reference controlling requirement, design, and task identifiers and MAY recommend affected areas or verification targets. It SHALL NOT create new scope, silently rewrite OpenSpec artifacts, or become a human-maintained plan.

#### Scenario: Analysis discovers likely additional work
- **WHEN** repository impact analysis indicates that an unplanned consumer must change
- **THEN** Guardrails reports a readiness issue requiring an explicit OpenSpec artifact update before execution

#### Scenario: Generated context conflicts with a design decision
- **WHEN** an observed repository pattern conflicts with an explicit design decision
- **THEN** Guardrails surfaces the conflict for disposition and keeps the design authoritative until it is deliberately revised

### Requirement: Context is refreshed when relevant repository evidence changes
Guardrails SHALL associate repository context with the evaluated source revision and cited evidence-content digests and SHALL refresh affected findings when relevant files, symbols, configurations, or tests change.

#### Scenario: Relevant module changes during a run
- **WHEN** execution modifies evidence used by the context record
- **THEN** Guardrails marks affected context entries stale before they are reused for later verification

#### Scenario: Context is generated across supported platforms
- **WHEN** repository context is compiled on Windows, macOS, or Linux
- **THEN** file references and module identities remain logically equivalent and platform-correct
