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

#### Scenario: Legacy canonical history disagrees with projections
- **WHEN** a supported version 1 canonical history and its replaceable run or assurance projections disagree
- **THEN** archive is blocked until Guardrails can reconcile or safely migrate the canonical history, regardless of which projection reports success

### Requirement: Canonical assurance history is durable and workspace-contained
Guardrails SHALL preserve every successfully appended assurance event under concurrent writers and SHALL read, write, migrate, restore, or remove generated state only within the resolved active change workspace. Version compatibility operations SHALL preserve canonical version 2 history without destructive replacement.

#### Scenario: Concurrent roles append distinct results
- **WHEN** multiple supported execution roles append unique events concurrently
- **THEN** every successful append is present exactly once in the replayable canonical history

#### Scenario: A live writer exceeds the normal lock interval
- **WHEN** a live event writer holds serialization longer than the normal lock interval while another writer attempts to append
- **THEN** Guardrails preserves ownership safely or rejects a writer without allowing both writers to report success for history that omits either event

#### Scenario: Generated-state directory redirects outside the change
- **WHEN** the generated-state path is a symbolic link, junction, replaced ancestor, or other path that resolves outside the active change workspace
- **THEN** Guardrails fails closed without reading, writing, or deleting the external target

#### Scenario: Previous companion version is needed
- **WHEN** a user needs a version 1-compatible state after version 2 history exists
- **THEN** Guardrails creates or restores a separate compatible representation while preserving the readable canonical version 2 history
