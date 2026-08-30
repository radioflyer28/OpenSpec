# gsd-behavioral-semantics Specification

## Purpose

Apply concise, risk-proportional behavioral semantics to OpenSpec requirements so agents can plan and verify difficult behavior without mandatory formal-method tooling.

## Requirements

### Requirement: Every requirement receives a semantic level
During planning, OpenSpec GSD SHALL classify every requirement as `simple`, `behavioral`, or `modeling`, explain the evidence for the classification, and preserve the highest level required by the requirement's observable behavior and risk.

#### Scenario: Ordinary outcome is adequately specified
- **WHEN** a requirement and its scenarios establish a simple observable outcome without material temporal, stateful, or invariant ambiguity
- **THEN** OpenSpec GSD classifies it as `simple`

#### Scenario: Behavior depends on events or state
- **WHEN** a requirement depends materially on triggers, modes, ordering, deadlines, cancellation, retries, recovery, or state
- **THEN** OpenSpec GSD classifies it as at least `behavioral`

#### Scenario: Correctness requires deeper modeling
- **WHEN** a requirement contains subtle concurrency, high-consequence invariants, authorization state, irreversible transitions, or behavior poorly established by ordinary scenarios
- **THEN** OpenSpec GSD classifies it as `modeling`

### Requirement: Behavioral requirements use concise controlled semantics
For each `behavioral` or `modeling` requirement, the authoritative OpenSpec spec SHALL identify the responsible component and required response and SHALL make applicable scope, condition, trigger, timing, and prohibition semantics explicit in readable controlled language.

#### Scenario: One sentence is sufficient
- **WHEN** the applicable behavior can be stated unambiguously in one controlled-language sentence
- **THEN** the spec expresses the semantics concisely without adding a labeled field block

#### Scenario: Behavior has interacting modes or exceptions
- **WHEN** one sentence would obscure multiple scopes, triggers, timing obligations, or exceptions
- **THEN** the spec uses a compact labeled behavior block and scenarios to expose those distinctions

#### Scenario: Timing is not contractually material
- **WHEN** a concrete timing value is a safe delegated technical choice rather than an observable commitment
- **THEN** the requirement does not elevate that value into a human decision or unnecessary specification obligation

### Requirement: Modeling requirements expose reviewable state reasoning
For each `modeling` requirement, OpenSpec GSD SHALL place observable invariants and prohibited behavior in the spec, applicable abstract state, transitions, assumptions, model boundaries, and proof obligations in design, and required implementation and verification work in tasks.

#### Scenario: Modeling analysis identifies an invariant
- **WHEN** planning determines that an invariant is required to establish the product contract
- **THEN** the observable invariant appears in the spec
- **AND** its supporting model and verification strategy appear in design and tasks without creating a parallel formal-plan artifact

#### Scenario: Formal sections are not applicable
- **WHEN** a change contains only `simple` requirements
- **THEN** OpenSpec GSD does not add empty state-model, invariant, or proof-obligation sections

### Requirement: Semantic authority remains in OpenSpec artifacts
OpenSpec GSD SHALL treat proposal, specs, design, and tasks as the only maintained planning truth and SHALL treat classifications, analysis results, and assurance projections as derived records that reference authoritative requirement identifiers without reproducing a second requirement corpus.

#### Scenario: Derived classification is regenerated
- **WHEN** an authoritative requirement changes
- **THEN** OpenSpec GSD regenerates or invalidates the affected semantic classification
- **AND** does not preserve the prior derived record as a competing contract

### Requirement: Assurance claims describe achieved evidence accurately
Without corresponding official tool evidence, OpenSpec GSD SHALL describe results as semantically structured, reviewed, counterexample-analyzed, scenario-tested, or human-accepted and SHALL not report FRET validity, PVS proof, or formal verification.

#### Scenario: V1 completes modeling analysis
- **WHEN** a pathfinder and reviewer complete PVS-inspired state and invariant reasoning without a theorem prover
- **THEN** OpenSpec GSD reports the performed analysis and evidence
- **AND** does not label the requirement PVS-proven or formally verified

### Requirement: V1 has no formal-tool runtime requirement
OpenSpec GSD SHALL provide its v1 semantic workflow without requiring installation or invocation of FRET, PVS, Electron, theorem provers, or solver stacks.

#### Scenario: Formal tools are absent
- **WHEN** a developer uses discussion, planning, execution, and verification on a supported macOS/Pi environment without formal tools installed
- **THEN** all v1 semantic levels remain available

### Requirement: Required semantic assurance cannot silently downgrade
While a requirement's current classification requires semantic or modeling evidence, OpenSpec GSD SHALL never report a lower level as sufficient without an explicit recorded human disposition.

#### Scenario: Required analysis remains unresolved
- **WHEN** planning or verification cannot establish a required semantic obligation
- **THEN** OpenSpec GSD reports `human_needed` with the uncertainty and consequences

#### Scenario: Human accepts lower assurance
- **WHEN** the developer explicitly accepts a lower assurance level and supplies a reason
- **THEN** OpenSpec GSD records the achieved level, required level, reason, and acceptance
- **AND** does not represent the missing assurance as completed

### Requirement: Execution modes preserve semantic minimums
Quick, guarded, and full execution modes SHALL NOT reduce the semantic level required by the authoritative requirements.

#### Scenario: Quick mode is requested for a modeling requirement
- **WHEN** a developer requests quick execution for a change containing a required `modeling` obligation
- **THEN** OpenSpec GSD preserves the modeling obligation or requests an explicit human disposition
