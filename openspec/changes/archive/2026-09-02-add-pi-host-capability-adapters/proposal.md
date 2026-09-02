## Why

OpenSpec GSD already defines isolated planning, pathfinder, review, and verification roles, but its Pi package currently exposes only the bundled CLI path. As a result, OpenSpec capability negotiation selects Tier 0 even when Pi can create fresh agent contexts, weakening independence and leaving safe concurrency unused.

## What Changes

- Add a Pi-specific host adapter that exposes isolated agent dispatch to OpenSpec GSD through a validated structured-result boundary.
- Use the adapter for fresh-context plan review, pathfinder analysis, code review, and goal verification while preserving each role's read-only and authority constraints.
- Support bounded parallel execution of independent read-only role requests when Pi actually provides concurrent dispatch.
- Negotiate capabilities from successful runtime probes rather than assuming that installed tools or shell commands are usable adapters.
- Preserve deterministic Tier 0 fallback when dispatch or concurrency is unavailable, fails qualification, or is disabled.
- Keep parallel task execution, worktree lifecycle automation, branches, commits, and broad Git authority outside this increment.

## Capabilities

### New Capabilities

- `gsd-pi-host-adapters`: Pi runtime capability negotiation, isolated role dispatch, structured result validation, safe read-only concurrency, and deterministic fallback for OpenSpec GSD workflows.

### Modified Capabilities

None. Existing planning and execution contracts already define how OpenSpec GSD uses independently dispatched roles when a host provides them.

## Impact

- Companion package: `openspec-gsd` Pi runtime extension, role-dispatch integration, capability negotiation, workflow instructions, tests, and installation documentation.
- OpenSpec core: no new API is expected; the implementation uses the existing versioned host-capability and structured-result contracts.
- Pi: the supported version range and runtime APIs must be probed and qualified on macOS before `agentDispatch` or `parallelism` is advertised.
- Security and authority: reviewer, verifier, plan-reviewer, and pathfinder contexts remain read-only; dispatched results are untrusted until schema, provenance, role, revision, and evidence validation succeeds.
