## Context

See `proposal.md` for motivation. The companion already has host-neutral `RoleDispatcherV1`, `WorktreeAdapterV1`, tier negotiation, structured dispatch receipts, and plan/do/check orchestration. Its Pi extension currently mutates only `PATH`, so CLI invocations use the conservative default capability profile.

Pi 0.84.x exposes public extension and SDK APIs that are sufficient for a focused adapter: extension tools receive the active context and model, while `createAgentSession()` can create in-memory fresh sessions with an explicit tool list and working directory. Pi intentionally has no built-in subagent policy, so OpenSpec GSD must own the role contract, limits, and result validation rather than treating the presence of another package as capability evidence.

## Goals / Non-Goals

**Goals:**

- Provide a Pi-native entry that invokes the existing plan/do/check orchestration with a qualified `RoleDispatcherV1`.
- Create genuinely fresh role contexts with enforced read-only tools for assurance roles.
- Bind structured results to the current request and semantic artifact revision.
- Permit bounded concurrency only for dependency-independent read-only roles.
- Keep CLI/Tier 0 behavior available when the Pi adapter cannot qualify.

**Non-Goals:**

- A persistent local daemon, network service, general agent framework, or global permission system.
- Parallel project-writing executors, worktree creation or merge, automated commits, or branch management.
- Inheriting arbitrary project extensions, prompts, skills, or tools into assurance sessions.
- Claiming that `openspec extension doctor` run outside a live Pi session can detect ephemeral Pi capabilities.
- Supporting or qualifying Linux and Windows manually in this increment; portable automated tests remain required.

## Decisions

### 1. Run the adapter in the Pi extension process

The Pi package will register one internal OpenSpec GSD workflow tool backed by the existing companion library. The generated Pi workflow prompts call this tool when present and retain the current CLI path as Tier 0 fallback. The tool passes the live capability profile and dispatcher into the same plan/do/check implementations used by the CLI; it does not implement another planning or execution loop.

This keeps access to Pi's active model and extension context without opening an IPC server or trusting environment variables as proof of a live host. A CLI subprocess cannot safely infer the active model, tool restrictions, cancellation signal, or session lifetime from `PI_SESSION_ID` alone.

Alternative considered: run a loopback broker between the Pi extension and CLI. Rejected because authentication, lifecycle, stale endpoints, and cleanup would add runtime machinery without improving the user workflow.

### 2. Create minimal in-memory role sessions through Pi's public SDK

Each dispatch creates a new `SessionManager.inMemory()` session using the active Pi model and thinking level when supported. It uses a package-owned minimal system prompt assembled from the role request and does not load the parent transcript or discover project extensions and skills. The session is disposed after a terminal result, timeout, cancellation, or error.

Read-only roles receive only explicit read/list/search tools. They receive no shell, general write, edit, package-management, Git, messaging, or human-interaction tools. A pathfinder that needs an experiment may receive package-owned, root-confined experiment tools only after those tools pass containment tests; otherwise it remains read-only and reports that the experiment capability is unavailable.

Alternative considered: spawn `pi --print` or depend on the installed `pi-subagents` package. Rejected because subprocess flags and third-party packages do not by themselves establish tool authority, session provenance, or a stable structured-result contract.

### 3. Treat runtime qualification as an executable probe, not configuration

The adapter computes a session-local capability profile from an explicit compatibility table and probes:

- supported Pi package/API version;
- active model and resolvable authentication;
- creation and disposal of an in-memory session;
- exact restricted tool inventory;
- cancellation/timeout support;
- structured-result parsing and request binding; and
- for `parallelism`, successful bounded concurrent read-only sessions without shared mutation authority.

Only the live in-process workflow call receives this profile. Static OpenSpec lifecycle commands retain conservative defaults. The OpenSpec GSD status output will distinguish `available`, `disabled`, `probe_failed`, and `unsupported_version` with remediation.

Alternative considered: persist a capability file when Pi starts. Rejected because it becomes stale when the session ends and could make an external CLI falsely claim a live dispatcher.

### 4. Use a trusted request envelope and orchestrator-issued receipt

The package creates an immutable request envelope containing a random dispatch ID, live Pi session ID where available, role, change, semantic revision, artifact/evidence references, authority profile, deadline, and cancellation identity. The child receives the role-specific content but does not choose these fields.

The child must finish with exactly one schema-valid `RoleResultV1` payload. The adapter validates the result, attaches trusted envelope fields itself, and calls the existing `dispatchRoleV2` boundary to produce the process-local receipt. Text outside the structured result is retained only as diagnostic output. A mismatch, missing required evidence, late response, or stale revision becomes an error result and cannot satisfy assurance.

No cryptographic signature is needed for the in-process boundary: request identity is an opaque object and receipt membership is already process-local. If a future design crosses a process boundary, it requires a separate authenticated protocol proposal.

### 5. Limit parallelism to an explicit analysis scheduler

The adapter will add a bounded scheduler for read-only role requests whose prerequisite set is satisfied. The default concurrency is two, configurable within a small hard maximum. Results are validated independently and reconciled by stable request index rather than completion time. A sibling failure remains visible; cancellation does not rewrite completed results.

The existing task execution graph remains sequential because project-writing concurrency requires worktree and merge semantics that are outside this change. `parallelism: true` therefore means qualified read-only role concurrency, not general parallel execution.

### 6. Preserve proportional fallback and truthful independence

Adapter unavailability before a stage selects Tier 0. Failure after dispatch follows the existing workflow rule for the required evidence: self-review may proceed only with its existing warning and user choice; evidence that is required to be independent remains unresolved. Status and assurance records retain the selected tier, adapter identity, Pi version, model reference, and independent/self-review provenance without copying prompts or model reasoning.

## Risks / Trade-offs

- **[Pi SDK compatibility changes]** → Pin and test a supported version range, use only public exports, probe at runtime, and fail to Tier 0 with a specific reason.
- **[A supposedly read-only child gains mutation authority through inherited resources]** → Use an explicit resource loader and exact tool allowlist; test the actual child tool inventory and reject qualification on drift.
- **[Model output is malformed or attempts to forge provenance]** → Parse one strict result schema and attach trusted identity fields outside the model output.
- **[Nested sessions increase cost and latency]** → Dispatch only roles required by the selected assurance mode, cap concurrency, expose status, and keep the proportional Tier 0 route.
- **[Concurrent provider throttling]** → Bound concurrency, honor retry/timeout policy, and make partial failures visible.
- **[Pi context exposes credentials indirectly]** → Pass the SDK model/runtime references needed for inference, never serialize credentials into prompts, events, or generated records.
- **[macOS qualification is mistaken for cross-platform support]** → Label Linux/Windows CI as portability evidence only and document macOS/Pi as the initial qualified host.

## Migration Plan

1. Add the adapter behind a default-off package setting and retain the current PATH/CLI behavior.
2. Qualify isolated dispatch against the supported Pi version on macOS and enable `agentDispatch` for opted-in local testing.
3. Qualify bounded read-only concurrency separately before enabling `parallelism`.
4. Regenerate/reconcile Pi resources and run installed-package journeys for plan review, pathfinder, code review, verification, cancellation, malformed output, and fallback.
5. Make agent dispatch the Pi default only after the qualification suite passes; retain a single setting that forces Tier 0 rollback.

Rollback disables the Pi adapter setting or installs the prior companion revision. Generated assurance records remain readable because their schemas and source-of-truth model do not change.
