## Why

OpenSpec task checkboxes and Relay assurance records make completed work recoverable, but they do not fully describe a deliberately interrupted discussion, planning analysis, role dispatch, review, or partially executed task. Developers need a low-cost way to stop at a safe boundary and let a fresh agent determine the correct existing workflow to continue without introducing GSD-style project, phase, or milestone state.

## What Changes

- Add `/opsx:pause [change]` to stop scheduling new work, settle the current atomic operation, preserve completed evidence, and record a bounded pointer-based interruption checkpoint.
- Add `/opsx:resume [change]` to validate current artifacts, repository state, task progress, Relay evidence, and outstanding dispatches before routing into the existing discuss, propose/update, plan, do, debug, UAT, or archive workflow.
- Extend `/opsx:status` to report deliberate pause state, interrupted or outstanding activity, drift, and the validated resume action.
- Support a minimal ephemeral checkpoint for pre-proposal discussion containing only confirmed material decisions, rejected major alternatives, open material questions, and the current design-tree frontier.
- Keep pause/resume state machine-generated and subordinate to OpenSpec artifacts; do not add `STATE.md`, `PROJECT.md`, `ROADMAP.md`, phase state, duplicated task prose, raw discussion transcripts, or automatic WIP commits.
- Preserve explicit Git authority: pause reports workspace state by default and creates no commit, branch, or worktree unless the user separately opts in through an existing supported capability.
- Extend the qualified Pi package surface with pause/resume operations and safe handling for active, cancelled, interrupted, or externally continuing role dispatches.

## Capabilities

### New Capabilities

- `relay-pause-resume`: Safe deliberate pause, validated fresh-context resume, lifecycle routing, bounded interruption records, and pre-proposal discussion continuity.

### Modified Capabilities

- `gsd-execution`: Extend lifecycle status and execution behavior to expose pause state and route validated resumption through existing workflows.
- `gsd-pi-host-adapters`: Expose pause/resume through the Pi adapter and preserve truthful dispatch state across a host-session interruption.
- `relay-product-identity`: Add stable `/opsx:pause` and `/opsx:resume` Relay entry points.

## Impact

- Companion implementation in `openspec-relay`: canonical event schemas/projections, status and routing, pause/resume orchestration, CLI operations, Pi adapter/tool operations, generated workflows and skills, documentation, and tests.
- OpenSpec remains the sole human-maintained source of proposal, specification, design, and task truth; no new core extension API is expected unless implementation demonstrates a missing generic contribution or host-capability seam.
- Existing projects without pause records continue to infer the next action from current OpenSpec and Relay state.
