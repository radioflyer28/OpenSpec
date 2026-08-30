## Purpose

Help developers and agents reach shared understanding of consequential product intent before OpenSpec proposal artifacts are created or materially revised.

## ADDED Requirements

### Requirement: Discussion is an explicit proportional entry point
OpenSpec GSD SHALL provide `/opsx:discuss` as the standard entry point for uncertain or behavior-bearing work without requiring discussion ceremony for trivial or already-complete specifications.

#### Scenario: Developer starts from an idea
- **WHEN** a developer invokes `/opsx:discuss` with a new idea
- **THEN** OpenSpec GSD starts a conversational discovery session before creating proposal artifacts

#### Scenario: Trivial change bypasses discussion
- **WHEN** a developer proposes a trivial or already-precise change without a discussion handoff
- **THEN** OpenSpec GSD permits proposal creation
- **AND** later planning may require targeted discussion only if it finds unresolved material intent

### Requirement: Discussion preserves the upstream grilling base contract
The generated `/opsx:discuss` skill SHALL include the upstream `grilling` instruction body verbatim from pinned revision `85f83d3fde1d3a90d5c9a657f6998c79a6c37308` before an appended OpenSpec GSD supplement. The supplement SHALL preserve the design tree, prerequisite-aware frontier, recommendation-bearing rounds, agent-owned fact finding, exhaustive coverage of material human decisions, and final shared-understanding confirmation while limiting its adaptations to materiality classification, coherent clustering of an overwhelming frontier, concrete-candidate guidance, proposal handoff, and targeted re-entry.

#### Scenario: Generated discussion skill preserves the pinned body
- **WHEN** OpenSpec GSD generates or reconciles the `/opsx:discuss` skill
- **THEN** the vendored upstream instruction body matches the pinned source exactly
- **AND** the OpenSpec GSD supplement follows rather than rewrites that body

#### Scenario: Supplement specializes user-owned decisions
- **WHEN** the upstream base refers to decisions, the whole frontier, or every branch
- **THEN** the supplement defines these as material human-owned decisions after fact finding and materiality classification
- **AND** safe technical choices remain assigned to repository research, planning, or implementation
- **AND** every material branch remains represented even when an overwhelming ready frontier is presented in coherent clusters

#### Scenario: Supplement attempts to weaken grilling
- **WHEN** generated supplemental instructions remove a design-tree branch, ask dependent questions prematurely, omit recommendations, shift discoverable facts to the developer, leave a material branch silently assumed, or act before shared-understanding confirmation
- **THEN** discussion-skill validation fails

#### Scenario: Upstream grilling changes after the pin
- **WHEN** the upstream skill differs from the pinned vendored body
- **THEN** the packaged discussion behavior remains unchanged
- **AND** adopting the newer upstream text requires an explicit reviewed update

### Requirement: Vendored grilling instructions retain attribution
OpenSpec GSD SHALL retain Matt Pocock's copyright and MIT license notice for the vendored upstream instruction body in the distributed companion package.

#### Scenario: Companion package is assembled
- **WHEN** the private OpenSpec GSD package or generated discussion skill is prepared for installation
- **THEN** the pinned source revision and required third-party license notice are present

### Requirement: Discussion grills only material human decisions
During discussion, OpenSpec GSD SHALL map decisions and their dependencies, investigate discoverable facts itself, and ask the developer only about choices whose plausible answers could materially change product behavior, scope, compatibility, data treatment, safety, irreversibility, architecture, cost, or another outcome the developer is likely to care about.

#### Scenario: Repository fact is discoverable
- **WHEN** a ready decision depends on a fact available from the repository or host environment
- **THEN** the discussion role investigates that fact without asking the developer to supply it

#### Scenario: Safe technical detail is underspecified
- **WHEN** several conventional technical choices are safe and effectively indistinguishable to the developer
- **THEN** the discussion role selects or delegates a reasonable choice without interrupting the developer

#### Scenario: Plausible answers imply different products
- **WHEN** an unresolved choice would materially change observable behavior or a consequential commitment
- **THEN** the discussion role asks the developer and explains its recommended answer

### Requirement: Discussion works in dependency-aware rounds
OpenSpec GSD SHALL ask only decisions whose prerequisites are settled, recompute the remaining decision frontier after each response, and divide an unusually large frontier into coherent domain clusters rather than overwhelming the developer.

#### Scenario: Question depends on an unsettled answer
- **WHEN** one material question cannot be answered without first settling another decision
- **THEN** the dependent question is deferred to a later round

#### Scenario: Material frontier is large
- **WHEN** many material questions are simultaneously ready
- **THEN** the discussion role presents a coherent subset
- **AND** retains the remaining material branches for later rounds

### Requirement: Discussion uses concrete candidates adaptively
When recognition is more reliable than abstract specification, OpenSpec GSD SHALL present a focused example, contrast, counterexample, trace, output, or sketch that isolates one material distinction and SHALL interpret feedback only for that distinction.

#### Scenario: Developer has an incomplete vision
- **WHEN** the developer cannot yet state a preference but can evaluate a concrete behavioral candidate
- **THEN** the discussion role presents a focused candidate and uses the response to refine the affected decision branch

#### Scenario: Developer answers yes to a candidate
- **WHEN** a candidate contains incidental details unrelated to the material distinction being tested
- **THEN** a positive response confirms only the tested distinction
- **AND** does not silently approve the incidental details

### Requirement: Discussion produces a proposal-ready handoff
After the material frontier is empty, OpenSpec GSD SHALL provide a plain-language teach-back and a self-contained handoff covering the goal, observable outcomes, non-goals, material decisions, examples and counterexamples, consequential commitments, semantic-classification candidates, planning uncertainties, pathfinder candidates, and delegated technical choices.

#### Scenario: Shared understanding is reached
- **WHEN** all material branches are settled and the developer confirms the teach-back
- **THEN** the discussion role emits a proposal-ready handoff
- **AND** does not create a separate maintained discussion or planning artifact

### Requirement: Proposal compilation confirms handoff fidelity automatically
When a confirmed handoff is supplied to proposal generation, OpenSpec GSD SHALL map every material decision to the resulting proposal, specs, design, or tasks and SHALL complete the confirmation without human intervention when the mapping is complete and consistent.

#### Scenario: Handoff is faithfully compiled
- **WHEN** every material handoff decision has a consistent destination in the generated OpenSpec artifacts
- **THEN** OpenSpec GSD records successful handoff confirmation automatically
- **AND** the artifacts become the authoritative planning truth

#### Scenario: Material decision is missing or contradicted
- **WHEN** proposal compilation cannot map a material decision or generates a conflicting contract
- **THEN** OpenSpec GSD returns the affected branch to discussion
- **AND** does not automatically confirm the handoff

### Requirement: Existing changes receive targeted discussion
OpenSpec GSD SHALL allow `/opsx:discuss <change>` to reopen material intent for an existing change while preserving settled, unaffected branches.

#### Scenario: Planning exposes a material ambiguity
- **WHEN** planning records a finding that changes or questions product intent
- **THEN** discussion starts from the affected decision and its dependents rather than restarting the entire interview

#### Scenario: Targeted discussion changes the contract
- **WHEN** the developer confirms a revised material decision for an existing change
- **THEN** the standard OpenSpec update workflow reconciles the affected artifacts
- **AND** any prior plan approval becomes stale
