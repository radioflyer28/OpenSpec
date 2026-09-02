## Purpose

Connect OpenSpec GSD to Pi's qualified agent runtime so assurance roles can use fresh contexts and safe concurrency without weakening role authority, provenance, or fallback behavior.

## ADDED Requirements

### Requirement: Pi capabilities are advertised from runtime evidence
The OpenSpec GSD Pi package SHALL advertise a host capability only when the active Pi runtime passes a capability-specific probe and the corresponding adapter is available for the current session.

#### Scenario: Pi supports isolated structured dispatch
- **WHEN** the active Pi runtime can create a fresh agent context with the required restricted authority and return a validated structured result
- **THEN** the adapter advertises `agentDispatch`

#### Scenario: Concurrent dispatch is independently qualified
- **WHEN** isolated dispatch succeeds but the runtime cannot safely run multiple bounded read-only requests concurrently
- **THEN** the adapter advertises `agentDispatch` without advertising `parallelism`

#### Scenario: An installed tool is not integrated
- **WHEN** a subagent, Git, or worktree tool is merely installed or callable from a shell but has no qualified OpenSpec GSD adapter
- **THEN** the corresponding host capability remains unavailable

#### Scenario: Pi version is outside the qualified range
- **WHEN** the active Pi runtime version is unsupported or its adapter contract cannot be probed successfully
- **THEN** OpenSpec GSD reports the compatibility reason and preserves Tier 0 availability

### Requirement: Assurance roles receive fresh isolated contexts
When `agentDispatch` is available and enabled, OpenSpec GSD SHALL dispatch plan reviewers, pathfinders, code reviewers, and goal verifiers into fresh contexts containing only their role contract, authoritative artifact references, applicable repository evidence, revision identity, and requested evidence outputs.

#### Scenario: Plan review is dispatched
- **WHEN** planning requests an independent plan review on a qualified Pi host
- **THEN** the reviewer runs in a fresh context without the planner's private reasoning or self-assessment
- **AND** receives read-only access sufficient to evaluate the current proposal, specs, design, tasks, and repository evidence

#### Scenario: Pathfinder is dispatched
- **WHEN** planning identifies a consequential technical or modeling uncertainty
- **THEN** the pathfinder receives the focused question, model boundary, authoritative references, and a disposable experiment allowance when applicable
- **AND** cannot approve the plan or edit authoritative OpenSpec artifacts

#### Scenario: Review and verification follow execution
- **WHEN** implementation reaches code review or goal verification
- **THEN** each role runs in a fresh context distinct from the executor and from the other assurance role
- **AND** executor claims alone cannot satisfy either result

### Requirement: Role authority is enforced by the host boundary
The Pi adapter SHALL enforce each dispatched role's allowed tools, write roots, and interaction authority at the host boundary and SHALL not represent prompt-only instructions as enforced isolation.

#### Scenario: Read-only role requests mutation authority
- **WHEN** a plan reviewer, pathfinder, code reviewer, or goal verifier attempts to modify project or OpenSpec files
- **THEN** the host rejects the mutation
- **AND** the dispatched result records an authority violation

#### Scenario: Pathfinder receives a disposable experiment workspace
- **WHEN** an approved pathfinder request permits an isolated experiment
- **THEN** writes are limited to the explicitly assigned disposable workspace
- **AND** the experiment cannot mutate the project checkout or authoritative planning artifacts

#### Scenario: Enforced restriction is unavailable
- **WHEN** Pi cannot restrict a requested read-only role to its declared authority
- **THEN** the adapter does not claim independently enforced dispatch for that role
- **AND** the workflow applies its existing self-review or human-decision policy

### Requirement: Dispatched results are validated and provenance-bound
OpenSpec GSD SHALL accept a Pi-dispatched role result only when it conforms to the expected structured schema and is bound to the current session, dispatch identity, role, change, authoritative revision, and requested evidence contract.

#### Scenario: Valid result returns from Pi
- **WHEN** a dispatched role returns a schema-valid result for the current request and revision
- **THEN** OpenSpec GSD records an orchestrator-issued receipt and makes the result available to the requesting workflow

#### Scenario: Result identity does not match
- **WHEN** a result names another role, change, revision, session, or dispatch request
- **THEN** OpenSpec GSD rejects the result as an error
- **AND** does not use its claims to satisfy an assurance gate

#### Scenario: Result omits required evidence
- **WHEN** a passing result lacks evidence required by its dispatch contract
- **THEN** OpenSpec GSD rejects or blocks the result with remediation

#### Scenario: Late result follows cancellation or staleness
- **WHEN** a result arrives after its dispatch was cancelled, timed out, or made stale by an authoritative artifact revision
- **THEN** OpenSpec GSD retains it only as non-authoritative diagnostic evidence
- **AND** does not apply it to the current assurance state

### Requirement: Read-only concurrency is bounded and deterministic
When `parallelism` is available and enabled, OpenSpec GSD SHALL run only dependency-independent read-only role requests concurrently, within a configured concurrency budget, and SHALL reconcile their results in deterministic request order.

#### Scenario: Independent analyses are ready
- **WHEN** multiple read-only analyses have no dependency or shared-mutation relationship
- **THEN** OpenSpec GSD may dispatch them concurrently within the configured limit

#### Scenario: One request depends on another
- **WHEN** an analysis requires a result or decision from another request
- **THEN** OpenSpec GSD waits for the prerequisite before dispatching the dependent request

#### Scenario: Concurrent results complete out of order
- **WHEN** Pi returns parallel results in a nondeterministic completion order
- **THEN** OpenSpec GSD validates each result independently and reconciles them in stable request order

#### Scenario: Parallel request fails
- **WHEN** one concurrent role errors, times out, or returns invalid evidence
- **THEN** the failure remains visible and cannot be erased by successful sibling results
- **AND** workflow convergence follows the same bounded policy used for sequential execution

### Requirement: Capability loss preserves assurance semantics
Loss or failure of a Pi adapter SHALL change execution strategy without silently lowering the assurance required by the current OpenSpec change.

#### Scenario: Dispatch is unavailable before work begins
- **WHEN** isolated dispatch is disabled or unavailable before a workflow stage starts
- **THEN** OpenSpec GSD selects the supported lower tier and clearly labels review provenance

#### Scenario: Independent review is required but dispatch fails
- **WHEN** a workflow requires independent evidence and the qualified dispatcher fails or becomes unavailable
- **THEN** OpenSpec GSD reports the unresolved evidence and follows the existing warning or `human_needed` policy
- **AND** does not substitute executor self-report as independent review

#### Scenario: Pi session ends during dispatch
- **WHEN** the hosting Pi session closes while requests are outstanding
- **THEN** outstanding requests become terminally interrupted or resumable only through a newly validated session
- **AND** no stale session result can complete the current gate

### Requirement: Tier 2 and Git authority remain unavailable in this increment
The Pi adapter delivered by this change SHALL NOT advertise worktree or broad Git automation capabilities and SHALL NOT use agent concurrency for parallel project-writing task execution.

#### Scenario: User enables parallel analysis
- **WHEN** `parallelism` is enabled for a qualified Pi session
- **THEN** concurrency is limited to read-only analysis roles
- **AND** project-writing executor tasks remain sequential in the current workspace

#### Scenario: User requests worktree or commit automation
- **WHEN** a workflow requests automated worktrees, branches, or commits
- **THEN** OpenSpec GSD reports that the capability is unavailable in this increment
- **AND** does not infer permission from the presence of Git
