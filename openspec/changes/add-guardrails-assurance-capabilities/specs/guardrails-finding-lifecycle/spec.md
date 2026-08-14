## Purpose

Ensures every assurance finding retains a stable identity and reaches an explicit, independently verified or human-approved disposition.

## ADDED Requirements

### Requirement: Findings have stable identities and provenance
Guardrails SHALL assign each finding a stable identity and retain its source checker or verifier, severity, blocking status, summary, requirement and task references, source locations where applicable, and evidence references across reruns.

#### Scenario: Checker reports the same issue again
- **WHEN** a later checker run reports the same underlying issue against the same logical scope
- **THEN** Guardrails updates the existing finding rather than creating an unrelated duplicate

#### Scenario: Similar issues have different logical scopes
- **WHEN** two findings share wording but affect different requirements, locations, or contracts
- **THEN** Guardrails preserves them as distinct findings

### Requirement: Finding transitions follow an auditable lifecycle
A finding SHALL begin as `open` and MAY transition to `repaired`, `independently_verified`, `accepted_risk`, or `human_needed` only when the evidence required for that transition is recorded. Prior states and transition reasons SHALL remain auditable.

#### Scenario: Executor reports a repair
- **WHEN** an executor links implementation and check evidence to an open finding
- **THEN** Guardrails records the finding as repaired but not independently verified

#### Scenario: Independent verifier confirms the repair
- **WHEN** a read-only verifier evaluates the original concern against current observable evidence and confirms resolution
- **THEN** Guardrails transitions the finding to independently verified

### Requirement: Finding transition provenance comes from the orchestrated workflow
Guardrails SHALL assign executor, reviewer, verifier, and human provenance from the workflow stage or explicit user action that produced a result. Domain results and caller-provided actor names or role labels SHALL NOT select their own privileged provenance. An `independently_verified` transition SHALL come from a verifier stage distinct from execution. An `accepted_risk` or other human disposition SHALL come from a dedicated user action or negotiated human-interaction result. When required human interaction is unavailable, Guardrails SHALL leave the finding blocking and report `human_needed`.

#### Scenario: Caller claims to be an independent verifier
- **WHEN** a CLI caller or domain result supplies an independent-verifier role or identity outside a verifier stage dispatched by the orchestrator
- **THEN** Guardrails may retain useful attribution but does not transition the finding to independently verified

#### Scenario: Human interaction is unavailable
- **WHEN** a finding requires accepted risk or another human disposition but the host cannot obtain an explicit user action
- **THEN** Guardrails reports `human_needed` and leaves the finding unresolved

#### Scenario: Executor result reaches a verifier transition
- **WHEN** an executor result is submitted to an independently verified transition without a distinct orchestrator-dispatched verifier stage
- **THEN** Guardrails rejects the transition regardless of the actor name carried by the result

### Requirement: Accepted risk and human-needed findings require explicit human disposition
An `accepted_risk` transition SHALL record the accepting human, reason, scope, timestamp, and any expiry or follow-up condition available. A `human_needed` finding SHALL remain blocking until the required human decision is recorded.

#### Scenario: User accepts a known residual risk
- **WHEN** an authorized human explicitly accepts a finding with a reason
- **THEN** Guardrails records the acceptance without representing the finding as technically repaired

#### Scenario: Automated role attempts to accept risk
- **WHEN** an executor, reviewer, or verifier attempts to satisfy a human disposition on its own
- **THEN** Guardrails rejects the transition

### Requirement: Finding verification is invalidated by relevant change
Guardrails SHALL associate repair and verification evidence with the relevant source and artifact revisions. A subsequent material change to the verified scope SHALL reopen or mark the finding stale until it is independently reevaluated.

#### Scenario: Verified code changes again
- **WHEN** files or contracts material to an independently verified finding change
- **THEN** Guardrails marks the verification stale and requires reevaluation

### Requirement: Unresolved blocking findings prevent archive
The Guardrails assurance gate SHALL fail closed while any blocking finding is open, merely repaired, stale, or awaiting human action. Only independent verification, explicit accepted risk, or an audited gate override MAY satisfy the archive requirement.

#### Scenario: Repaired finding has not been verified
- **WHEN** archive is requested while a blocking finding is in the repaired state
- **THEN** archive is blocked and identifies the missing independent verification

#### Scenario: Non-blocking warning remains open
- **WHEN** archive is requested with an unresolved non-blocking warning
- **THEN** Guardrails reports the warning without blocking unless project policy elevates it

#### Scenario: Passing projections disagree with canonical history
- **WHEN** replaceable run or assurance projections report success but canonical Guardrails history remains incomplete, stale, corrupt, or cannot reproduce those projections
- **THEN** archive is blocked and reports a canonical-state error

#### Scenario: Intermediate canonical state is no longer supported
- **WHEN** Guardrails encounters an unpublished intermediate state format that the current companion cannot replay
- **THEN** archive and status report an explicit conversion-or-regeneration action instead of trusting its projections

#### Scenario: Status projections agree with one another but canonical replay fails
- **WHEN** `run.json` and `assurance.json` mutually report success but canonical history is missing, corrupt, or cannot reproduce their state
- **THEN** `/opsx:run-status` reports the canonical or projection-integrity error and does not report a passing run

### Requirement: Canonical assurance history is durable and workspace-contained
Guardrails SHALL use one orchestrator as the canonical generated-state writer. Agents, checkers, reviewers, and verifiers SHALL return structured domain results rather than writing canonical events or projections. The orchestrator SHALL validate and append results in deterministic input order, persist canonical state through atomic replacement, and access only explicitly registered generated paths contained by the resolved active change workspace.

#### Scenario: Parallel roles complete in different orders
- **WHEN** supported roles execute concurrently and return structured results
- **THEN** the orchestrator serializes their validated results into one deterministic canonical order without granting the roles direct generated-state write access

#### Scenario: Caller timestamps differ from completion order
- **WHEN** structured results carry caller timestamps that differ from their orchestrator acceptance order
- **THEN** canonical replay follows the orchestrator's recorded order rather than resorting events by caller time

#### Scenario: Atomic state replacement is interrupted
- **WHEN** canonical-state replacement is interrupted before commit
- **THEN** Guardrails retains the prior valid canonical store or reports an explicit state error without treating a partial file as valid

#### Scenario: Generated-state directory redirects outside the change
- **WHEN** an existing generated-state path is a symbolic link, junction, non-directory, or other path that resolves outside the active change workspace
- **THEN** Guardrails fails closed without reading, writing, or deleting the external target

#### Scenario: Windows junction redirects an existing generated path
- **WHEN** an existing generated-state path is a Windows junction or equivalent reparse point that resolves outside the active change workspace
- **THEN** Guardrails rejects the path before accessing the external target
