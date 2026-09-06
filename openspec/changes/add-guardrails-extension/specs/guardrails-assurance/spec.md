## Purpose

Provide portable, evidence-based execution and verification workflows that strengthen OpenSpec changes without creating a second human-maintained planning system.

## ADDED Requirements

### Requirement: Guardrails workflow surface
The Guardrails extension SHALL contribute run, check, and run-status workflows for an OpenSpec change.

#### Scenario: Start a guarded run
- **WHEN** a user invokes `/opsx:run <change>` without selecting a mode
- **THEN** Guardrails uses guarded mode
- **AND** defaults to sequential execution without automated Git mutations

#### Scenario: Check an existing change
- **WHEN** a user invokes `/opsx:check <change>`
- **THEN** Guardrails evaluates the applicable assurance pipeline without implementing unrelated tasks

#### Scenario: Request bounded repair
- **WHEN** a user invokes `/opsx:check <change> --repair`
- **THEN** Guardrails may attempt repairs within the configured attempt limit and change scope
- **AND** stops for user direction after the limit is exhausted

#### Scenario: Inspect run status
- **WHEN** a user invokes `/opsx:run-status <change>`
- **THEN** Guardrails reports mode, execution tier, task progress, gate results, repair attempts, deviations, and unresolved human actions

### Requirement: OpenSpec artifacts remain authoritative
Guardrails SHALL use the change's proposal, delta specs, design, and tasks as the human-maintained source of scope and intent.

#### Scenario: Generate run records
- **WHEN** Guardrails compiles or executes a change
- **THEN** generated run and assurance records reference artifact, requirement, scenario, and task identifiers
- **AND** do not create replacement project, roadmap, plan, or state documents

#### Scenario: Record a deviation
- **WHEN** execution discovers work outside the original task description
- **THEN** Guardrails records the deviation against the affected OpenSpec task and requirement
- **AND** does not silently expand the change scope

### Requirement: Execution graph validation
Guardrails SHALL compile tasks and supporting change artifacts into an execution graph containing dependencies, risk, expected verification, and write sets.

#### Scenario: Valid dependency graph
- **WHEN** task dependencies form an acyclic graph and write sets are compatible
- **THEN** Guardrails produces deterministic execution waves

#### Scenario: Dependency cycle
- **WHEN** declared or inferred task dependencies contain a cycle
- **THEN** Guardrails blocks execution and reports the cycle

#### Scenario: Unsafe overlapping write sets
- **WHEN** tasks in the same proposed parallel wave can modify the same file or incompatible paths
- **THEN** Guardrails serializes those tasks or blocks the wave with a conflict diagnostic

### Requirement: Assurance modes
Guardrails SHALL provide quick, guarded, and full modes with consistent final goal verification.

#### Scenario: Quick mode
- **WHEN** quick mode is selected
- **THEN** Guardrails performs OpenSpec validation, applicable deterministic checks, targeted tests, and independent goal verification

#### Scenario: Guarded mode
- **WHEN** guarded mode is selected
- **THEN** Guardrails performs quick-mode checks plus risk-classified TDD evidence, code review, scenario coverage, and applicable specialist checks

#### Scenario: Full mode
- **WHEN** full mode is selected
- **THEN** Guardrails performs guarded-mode checks plus every applicable specialist check
- **AND** may use parallel or worktree execution only when supported and explicitly enabled

### Requirement: Risk-aware TDD policy
Guardrails SHALL support `tdd` values `auto`, `always`, and `off` at project and change scope, with a task-level override taking highest precedence.

#### Scenario: Automatic TDD for behavior work
- **WHEN** `tdd` resolves to `auto` and a task adds behavior, fixes a defect, changes a public contract, or is security-sensitive
- **THEN** the task requires RED–GREEN–REFACTOR evidence

#### Scenario: Automatic exemption
- **WHEN** `tdd` resolves to `auto` and a task changes only documentation, formatting, generated output, or non-executable configuration
- **THEN** Guardrails may exempt it with a recorded reason

#### Scenario: Always mode
- **WHEN** `tdd` resolves to `always`
- **THEN** every executable implementation task requires RED–GREEN–REFACTOR evidence unless a human records an explicit exception

#### Scenario: Off mode
- **WHEN** `tdd` resolves to `off`
- **THEN** Guardrails does not require fail-first evidence
- **AND** still requires the deterministic checks and goal verification selected by the run mode

### Requirement: TDD evidence integrity
Guardrails SHALL distinguish fail-first evidence from tests or checks first executed after implementation.

#### Scenario: Valid RED evidence
- **WHEN** a relevant test or check fails before the implementation change for the expected reason
- **THEN** Guardrails records the command, result, time, source state, and failure digest as RED evidence

#### Scenario: Valid GREEN and REFACTOR evidence
- **WHEN** the same relevant test or check passes after implementation and remains passing after cleanup
- **THEN** Guardrails records GREEN and REFACTOR evidence tied to the same task

#### Scenario: Missing fail-first evidence
- **WHEN** a required task has only a passing test first observed after implementation
- **THEN** the TDD gate fails

#### Scenario: Pre-existing unrelated failure
- **WHEN** the RED command also exposes a failure unrelated to the task
- **THEN** Guardrails identifies it separately
- **AND** does not represent that unrelated failure as task-specific RED evidence

### Requirement: Assurance checker routing
Guardrails SHALL always perform artifact validation, applicable deterministic checks, scenario coverage, and independent goal verification, and SHALL route additional checks from observable change risk.

#### Scenario: Security-sensitive change
- **WHEN** a change affects trust boundaries, authentication, authorization, secrets, cryptography, dependencies, shell execution, or untrusted input
- **THEN** Guardrails requires a security check

#### Scenario: Integration-sensitive change
- **WHEN** a change affects APIs, persistence, messaging, packages, migrations, or workflow boundaries
- **THEN** Guardrails requires an integration check

#### Scenario: User-interface change
- **WHEN** a change affects user-facing frontend behavior
- **THEN** Guardrails requires UI behavior, accessibility, and responsive checks applicable to the changed surface

#### Scenario: AI-system change
- **WHEN** a change affects prompts, models, retrieval, tool use, datasets, graders, or AI monitoring
- **THEN** Guardrails requires an AI evaluation check

#### Scenario: Compatibility-sensitive change
- **WHEN** a change affects public APIs, schemas, CLI contracts, configuration, stored formats, or migrations
- **THEN** Guardrails requires a compatibility check

#### Scenario: Human validation required
- **WHEN** a requirement cannot be established reliably from automated evidence
- **THEN** Guardrails records a `human_needed` result with explicit acceptance instructions

### Requirement: Independent review and verification
Guardrails SHALL separate implementation claims from the evidence used for code review and final goal verification.

#### Scenario: Executor self-report only
- **WHEN** the only evidence for a requirement is the executor's completion claim
- **THEN** independent review or verification does not pass that requirement

#### Scenario: Read-only verifier
- **WHEN** final goal verification runs
- **THEN** the verifier receives the controlling OpenSpec artifacts and observable evidence under a read-only contract
- **AND** reports pass, fail, warning, or human-needed results per requirement

### Requirement: Bounded repair
Guardrails SHALL limit automatic repair attempts for each failed assurance result, defaulting to two attempts.

#### Scenario: Repair succeeds
- **WHEN** a permitted repair changes the relevant implementation or evidence and the checker passes on rerun
- **THEN** Guardrails records the repair and passing result

#### Scenario: Repair attempts exhausted
- **WHEN** the configured attempt limit is reached without a passing result
- **THEN** Guardrails stops automatic repair and requests user direction

### Requirement: Portable execution tiers
Guardrails SHALL preserve the same assurance requirements across sequential, isolated-agent, and parallel-worktree execution tiers.

#### Scenario: Tier 0 host
- **WHEN** the host does not support subagents or isolated worktrees
- **THEN** Guardrails runs sequentially and reports Tier 0

#### Scenario: Tier 1 host
- **WHEN** the host supports isolated executor, reviewer, and verifier contexts but not safe worktree parallelism
- **THEN** Guardrails may use those isolated contexts and reports Tier 1

#### Scenario: Tier 2 host
- **WHEN** the host supports safe parallel execution and worktrees and the user enables them
- **THEN** Guardrails may execute dependency-safe waves in isolated worktrees and reports Tier 2

#### Scenario: Unsupported requested tier
- **WHEN** the user requests a capability the host does not support
- **THEN** Guardrails reports the missing capability and falls back only when the requested assurance outcome is preserved

### Requirement: Git mutations require opt-in
Guardrails SHALL require explicit user or project opt-in before creating commits, branches, or worktrees.

#### Scenario: Default execution
- **WHEN** no Git automation preference is configured
- **THEN** Guardrails does not create commits, branches, or worktrees

#### Scenario: Git automation enabled
- **WHEN** Git automation is enabled and supported
- **THEN** Guardrails reports the intended Git operations before using them

### Requirement: Generated assurance records
Guardrails SHALL store generated run, assurance, and report data under the selected change's `.guardrails` directory.

#### Scenario: Record a run
- **WHEN** a run starts or changes state
- **THEN** Guardrails records mode, tier, source artifact references, tasks, gates, evidence references, deviations, repairs, and timestamps atomically

#### Scenario: Cross-platform change path
- **WHEN** a change is resolved through a path containing platform-specific separators or aliases
- **THEN** Guardrails writes records under that resolved change directory
- **AND** reports portable change-relative references where possible

#### Scenario: Archive carries evidence
- **WHEN** a gated change is archived successfully
- **THEN** its `.guardrails` records move with the change and remain available for audit
