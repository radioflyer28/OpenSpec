# Extensions

OpenSpec extensions add project-scoped workflows, schemas, commands, and
required archive gates without adding extension-specific policy to OpenSpec
core. The v1 API is declarative except for gate providers, which are explicitly
trusted executable modules.

## Public API and compatibility

Extension packages consume the supported subpath instead of OpenSpec internals:

```ts
import {
  EXTENSION_API_V1,
  assertExtensionConformanceV1,
  registerRequiredGate,
  acceptRequiredGate,
  type ExtensionManifestV1,
  type GateProviderV1,
} from '@fission-ai/openspec/extensions';
```

`openspec-extension.json` is strict and versioned. Unknown fields or an
unsupported `apiVersion` reject the whole manifest; contributions are never
partially loaded. `requires.openspec` is a semantic-version range checked
against the running OpenSpec version, including prereleases. Extensions should
test their minimum and maximum supported OpenSpec releases and the current
integration build with `assertExtensionConformanceV1`:

```ts
await assertExtensionConformanceV1({
  extensionRoot: new URL('..', import.meta.url).pathname,
  coreVersion: process.env.OPENSPEC_TEST_VERSION!,
});
```

The current manifest shape is:

```json
{
  "apiVersion": "openspec.dev/extensions/v1",
  "id": "example-extension",
  "version": "1.0.0",
  "requires": {
    "openspec": ">=1.7.0 <2.0.0",
    "hostCapabilities": {
      "required": ["structuredResults"],
      "optional": ["agentDispatch", "parallelism"]
    }
  },
  "contributes": {
    "workflows": [{
      "id": "example-run",
      "name": "Example Run",
      "description": "Run the example workflow.",
      "entry": "workflows/run.md",
      "artifactRequirements": ["proposal", "tasks"],
      "gateDependencies": ["example.assurance"],
      "requiredHostCapabilities": []
    }],
    "schemas": [{ "id": "example-schema", "path": "schemas/example" }],
    "commands": [{
      "id": "example-status",
      "name": "Example Status",
      "description": "Show example status.",
      "entry": "commands/status.md",
      "requiredHostCapabilities": []
    }],
    "gates": [{
      "id": "example.assurance",
      "module": "dist/gate.js",
      "export": "exampleGate",
      "timeoutMs": 30000,
      "requiredHostCapabilities": ["structuredResults"]
    }]
  }
}
```

V1 host capabilities are `agentDispatch`, `parallelism`, `worktrees`, `git`,
`structuredResults`, and `humanInteraction`. Missing required capabilities make
an extension unavailable. Missing optional capabilities are reported but do not
prevent compatible contributions from loading. All referenced paths must remain
inside the extension package after symbolic links are resolved.

## Lifecycle and generated ownership

Use `openspec extension install`, `link`, `enable`, `disable`, `list`, and
`doctor` as described in the [CLI reference](cli.md#project-extensions).
OpenSpec owns these project files and directories:

- `openspec/extensions.lock.yaml` pins exact versions, integrity, source, core
  compatibility, and enabled state.
- `openspec/extensions.generated.yaml` records the exact extension version,
  workflow, tool, surface, path, and content digest for generated instructions.
- `openspec/.extensions/schemas/` contains materialized schema contributions and
  its generated lookup index.
- `openspec/changes/<change>/.openspec-gates.json` is the durable, change-local
  required-gate record.

Commit the lockfile. Do not hand-edit generated records or materialized schemas.
Reconciliation removes only files whose recorded ownership and digest still
match; modified or untracked files are preserved and reported as drift. A gate
record survives extension disablement and moves with an archived change so a
disable cannot silently erase an existing archive obligation.

## Trust boundary

Installing or linking an extension is a trust decision. OpenSpec validates
manifest shape, package identity, compatibility, conflicts, file containment,
and registry package integrity. Registry packages are acquired without install
scripts. These controls do **not** sandbox gate code: a gate provider executes
with the same operating-system permissions as the OpenSpec process. Providers
receive a deeply frozen, read-only context contract, but the JavaScript runtime
still has ordinary process capabilities.

Gate modules must export an object implementing `GateProviderV1`:

```ts
export const exampleGate: GateProviderV1 = {
  async evaluate(context) {
    return {
      gateId: 'example.assurance',
      status: 'pass',
      summary: `Verified ${context.changeName}`,
      evidence: ['reports/assurance.json'],
      remediation: [],
    };
  },
};
```

Providers are loaded only from contained files, evaluated in stable gate-ID
order, bounded by the manifest timeout, and required to return a valid result
for the registered gate ID. Missing, incompatible, timed-out, throwing, or
invalid providers produce an `error` result and fail closed.

## Gate statuses and archive behavior

| Status | Archive behavior |
|--------|------------------|
| `pass` | Satisfied |
| `warn` | Does not block; warning is included in archive output |
| `fail` | Blocks |
| `error` | Blocks, including unavailable or invalid providers |
| `human_needed` | Blocks until the current result and evidence digests have recorded human acceptance |

Extensions register an obligation when their workflow begins:

```ts
await registerRequiredGate(changeDir, {
  extensionId: 'example-extension',
  extensionVersion: '1.0.0',
  gateId: 'example.assurance',
  workflowId: 'example-run',
});
```

For `human_needed`, a human-facing integration may call
`acceptRequiredGate(changeDir, gateId, { actor })`. Acceptance is bound to both
the result and evidence digests. Any changed result or evidence makes the old
acceptance stale and blocking again.

Archive evaluates required gates before validation, prompts, spec writes, or
moves. A deliberate exception must name every blocking gate and supply a
non-empty reason:

```bash
openspec archive my-change --override-gate example.assurance \
  --reason "Approved emergency exception"
```

Repeat `--override-gate` for multiple blockers. Unknown gates, partial coverage,
an empty reason, or either option without the other is rejected. Each override
records the full gate result, result and evidence digests, reason, timestamp,
and actor when the environment provides one; the audit moves into the archive
with the change.
