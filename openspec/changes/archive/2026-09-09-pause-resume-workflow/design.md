## Context

See `proposal.md` for motivation. Relay already has the essential recovery inputs: OpenSpec artifacts and task checkboxes, a canonical per-change event history, revision-bound plan approval, task transitions, stable findings, dispatch receipts, debug sessions, UAT state, and a status projection that recommends `plan`, `do`, or `none`. The missing behavior is a deliberate safe-stop record and a broader deterministic router for fresh contexts.

The implementation belongs primarily in the `openspec-relay` companion. OpenSpec artifacts remain authoritative, the Relay orchestrator remains the sole writer of canonical execution state, and host capabilities affect execution strategy without weakening assurance. A user can request pause through a conversational host while a workflow is active, but a standalone CLI cannot preempt an unrelated process reliably; the contract must distinguish cooperative pause from forced process control.

## Goals / Non-Goals

**Goals:**

- Make a deliberate pause more precise than reconstructing state after an accidental interruption.
- Resume through existing Relay and OpenSpec workflows using current evidence rather than replaying a stored instruction transcript.
- Preserve truthful state for outstanding Pi role dispatches and external activities.
- Support discussion continuity before an OpenSpec change exists without creating competing planning truth.
- Keep the feature useful at Tier 0 and enrich it when qualified host dispatch is available.

**Non-Goals:**

- GSD `STATE.md`, `PROJECT.md`, `ROADMAP.md`, phase, milestone, plan-summary, or global project-progress machinery.
- Persisting raw conversation, private model reasoning, source-file contents, or duplicated OpenSpec prose.
- Preemptively killing arbitrary operating-system processes or guaranteeing cancellation outside a qualified host adapter.
- Automatically committing, branching, stashing, resetting, or creating worktrees.
- A second execution queue, planner, repair loop, reviewer, verifier, or archive implementation.
- Cross-machine synchronization beyond state already committed or otherwise transferred by the developer.

## Decisions

### 1. Pause and resume are orchestration operations, not new lifecycle roles

Add `pause` and `resume` operations to the Relay CLI, generated workflows, Pi tool, and extension manifest. The existing Relay orchestrator performs both operations. Discussion, planning, execution, review, verification, debugging, and UAT roles continue producing their existing structured outputs and never write pause state directly.

This avoids creating a “handoff agent” with authority overlapping every existing role. It also ensures resume invokes the current implementation of `discuss`, OpenSpec proposal/update, `plan`, `do`, `debug`, `uat`, or archive rather than copying those workflows.

**Alternative considered:** Give every role its own handoff format. Rejected because formats would diverge and role self-reports could become a competing source of truth.

### 2. Change-scoped pause state is projected from two canonical events

Extend the existing versioned event union with `workflow.paused` and `workflow.resumed`. A pause payload contains:

- stable pause ID and timestamp;
- change and run identity;
- authoritative artifact/plan revision;
- lifecycle stage and bounded activity kind;
- active OpenSpec task IDs;
- repository revision when Git evidence is available;
- normalized workspace entries containing path, status, and optional content digest—not contents;
- validated role dispatch or external-job references and their observed states;
- unresolved human-action and stable-finding IDs;
- derived resume route and the state fingerprint used to derive it.

The run projection exposes at most one effective pause: the latest `workflow.paused` event not superseded by a matching `workflow.resumed` event or a later pause. Pause itself is not an assurance pass or failure. Existing incomplete tasks, findings, stale evidence, UAT, and gates continue deciding archive readiness.

Repeated pause computes a fingerprint from the current authoritative revision, task IDs, activity, workspace snapshot, dispatch states, findings, and human actions. If the effective checkpoint has that fingerprint, the operation returns it without appending a duplicate event.

**Alternative considered:** Store `HANDOFF.json` and a prose `.continue-here.md`. Rejected because they duplicate canonical state and invite narrative drift.

### 3. Pause is cooperative and reports incomplete quiescence honestly

The pause workflow stops scheduling additional tasks or assurance roles. When invoked inside the active orchestrator, it waits only for the current atomic record/artifact write to finish and asks a qualified host adapter to cancel outstanding roles at their supported boundary. It does not wait indefinitely.

Each outstanding activity is classified from evidence already controlled by the orchestrator or returned by the host:

- `stopped`: cancellation was acknowledged;
- `running`: a referenced external activity intentionally continues;
- `interrupted`: the owning session ended or cancellation became terminal;
- `unknown`: the host cannot establish its state.

If mutation-capable activity remains running or unknown, the result is `human_needed` and says that a safe pause could not be established. Read-only external jobs may remain running when their immutable request identity and reconciliation contract are preserved. Late results from stopped, interrupted, stale-session, or stale-revision dispatches remain diagnostic only under the existing provenance rules.

A separate CLI invocation does not claim to preempt an unrelated Relay process. It snapshots observable state and reports any inaccessible activity as unknown. This is a bounded limitation, not a reason to add a runtime-wide process manager.

**Alternative considered:** Durable pause-request files polled by every operation. Deferred because Relay operations are currently bounded and adding cross-process signalling, leases, and ownership recovery would outweigh the initial value. Real usage can justify that later.

### 4. Resume is a pure decision over freshly loaded state

Implement one deterministic route evaluator used by `resume` and `status`. Inputs are freshly loaded OpenSpec artifact status/digests, task state, canonical Relay projection/integrity, effective pause, repository/workspace snapshot, host dispatch observations, and pre-proposal discussion registry when applicable.

The evaluator returns a route plus reasons, required authority, and whether continuation is automatic:

1. Projection or containment failure → `check`/repair state before other work.
2. Multiple candidate changes or discussion checkpoints → developer selection.
3. Material discussion questions or intent-routed findings → `discuss`.
4. Missing/incoherent proposal artifacts → OpenSpec proposal/update workflow.
5. Missing or stale semantic plan approval → `plan`.
6. Active verified debug session → `debug`.
7. Pending implementation, review, repair, or verification → `do`.
8. Pending human acceptance → `uat`.
9. Complete work with satisfied assurance → archive workflow.

When a unique route needs no new authority or material decision, `resume` reports the restored state and enters that existing workflow directly. A routed workflow retains its own safety and confirmation contract; resume does not bypass it. Ambiguity, drift, or new authority stops at status with a specific next action.

If no checkpoint exists, the same evaluator reconstructs the route and labels it reconstructed. A successful checkpoint-based continuation appends `workflow.resumed` before the routed workflow mutates state, bound to the pause ID and current fingerprint. If the routed workflow then fails, its normal status remains visible; the old pause is not silently reactivated.

**Alternative considered:** Store the exact next prompt or command and replay it. Rejected because commands, artifacts, and host capabilities can change while paused.

### 5. Workspace validation is bounded and non-destructive

Use the repository evidence abstractions already used by planning and execution. The snapshot records the Git revision when available and only relevant modified/untracked paths with stable status and optional digest. Relevant paths come from the active task write set, recorded execution evidence, and explicit repository status entries; the implementation does not copy file contents into generated state.

Resume recomputes the snapshot. A changed revision or entry produces a structured drift reason and blocks automatic mutation. It never restores, deletes, stages, stashes, or overwrites files. On non-Git hosts, Relay uses available file evidence and clearly reports that revision comparison is unavailable.

All generated paths use Node path utilities and existing contained-write/read primitives. Explicit schema fields and recorded path lists drive reads, cleanup, and migration; no wildcard deletion or name-pattern ownership inference is introduced.

### 6. Pre-proposal discussion uses one small ephemeral registry

There is no per-change event stream before a change exists. Store pre-proposal checkpoints in one atomically replaced, versioned registry at `openspec/.openspec-relay/discussions.json`. Entries are keyed by a validated working discussion ID and contain only:

- confirmed material decisions and their concise rationale;
- rejected major alternatives;
- unresolved material questions;
- the current prerequisite-aware design-tree frontier;
- suggested change name and next discussion action;
- creation/update timestamps and a content fingerprint.

The discusser translates the checkpoint into plain product language. It does not expose FRET/PVS jargon unless needed and does not repeat settled questions. Resume with no change selects the only active entry automatically; multiple active entries require selection rather than recency inference.

After proposal handoff confirmation proves the settled decisions have destinations in current OpenSpec artifacts, the entry is marked consumed. Cleanup uses its exact registry key. Consumed entries can be compacted by an explicit maintenance operation later; they are never planning or assurance evidence.

**Alternative considered:** Create an incomplete OpenSpec change solely to host discussion state. Rejected because OpenSpec would treat that directory as a real change before proposal intent is settled.

### 7. Git automation remains independent of pause

Default pause records/reports repository and changed-path evidence only. It never creates GSD-style WIP commits. Existing Relay capability negotiation and user configuration remain the sole authority for Git operations; this increment does not add a pause-specific `--commit` shortcut because that would couple continuity to Git and create a second authorization path.

If the developer separately performs or authorizes a Git operation, a later pause can record the resulting revision and resume validates it normally.

### 8. Existing Relay package boundaries remain intact

Implementation stays in the companion repository unless a failing contract test demonstrates a missing generic OpenSpec seam. Expected companion changes include schemas, event replay/projection, status route evaluation, orchestration operations, CLI, Pi adapter/tool schema, extension manifest contributions, generated skills/workflows, built distribution, and tests.

The package minor version advances from `0.2.x` to `0.3.0` because pause/resume add public pre-1.0 workflows. Distribution remains through the public Git repository or inspected local package artifact; npm publication is not required.

## Risks / Trade-offs

- **A user may request pause while an inaccessible process is mutating files** → Report incomplete quiescence and require that process to stop; never claim a safe pause from file observation alone.
- **Workspace snapshots can become large** → Limit them to relevant changed paths and store digests rather than contents.
- **A pause can immediately become stale** → Bind it to artifact, repository, workspace, and dispatch fingerprints and revalidate every resume.
- **Discussion checkpoints could become shadow specifications** → Restrict fields, label them non-authoritative, and consume them only after confirmed proposal mapping.
- **Older Relay versions cannot interpret new canonical event kinds** → Keep additive event-version behavior fail-closed with upgrade guidance; rollback requires returning to a pre-pause snapshot or upgrading the reader.
- **Automatic routing could surprise the developer** → Continue automatically only for one unique route requiring no new authority; otherwise present the material ambiguity.
- **Pause/resume may be mistaken for cross-machine persistence** → Status reports whether uncommitted workspace state is required and warns when another checkout cannot reproduce it.

## Migration Plan

1. Add schemas and projection support while retaining current behavior for histories without pause events.
2. Add the deterministic route evaluator and make current status use it before exposing new commands.
3. Add change-scoped pause/resume operations, then the bounded discussion registry.
4. Add CLI, Pi, extension workflow, generated skill, documentation, and package surfaces.
5. Regenerate and verify committed distribution artifacts, pack the candidate, and test a clean Pi/OpenSpec installation against `1.11.0-relay.1`.
6. Roll back by reinstalling `0.2.x` only for projects with no new pause events; otherwise restore the prior package after removing no records and follow fail-closed upgrade guidance.

