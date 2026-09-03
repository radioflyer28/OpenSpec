## Why

The current names `openspec-gsd` and `openspec-guardrails` either imply a direct GSD distribution or sound like a security product. The public package needs a distinct identity that describes its role-based handoffs and feedback loops while keeping OpenSpec artifacts as the sole planning truth.

## What Changes

- Rename the product and public repository to **OpenSpec Relay** and `radioflyer28/openspec-relay`.
- **BREAKING**: Rename the package, CLI, extension manifest identity, Pi workflow tool, generated-record namespace, assurance gate, and patched-core version suffix from their `gsd` names to corresponding `relay` names, including `1.11.0-relay.1`.
- Keep the existing `/opsx:discuss`, `/opsx:plan`, `/opsx:do`, `/opsx:check`, `/opsx:uat`, `/opsx:debug`, and `/opsx:status` workflow entry points because they already describe lifecycle operations without product-specific branding.
- Make a clean pre-1.0 break from `.openspec-gsd` execution records and `gsd.assurance`; no deployed legacy records exist, and disposable local development records are regenerated under Relay rather than migrated.
- Provide explicit upgrade instructions for existing extension links, Pi installations, project lockfiles, local pre-release cleanup, and Git remotes.
- Update documentation, attribution, diagnostics, package inspection, tests, and installed-system qualification to use the Relay identity without claiming GSD phase, milestone, roadmap, or state compatibility.

## Capabilities

### New Capabilities

- `relay-product-identity`: Defines the consistent public identity, installation surface, and bounded pre-release replacement behavior of OpenSpec Relay.

### Modified Capabilities

- `gsd-execution`: Rename execution records and the required assurance gate for Relay runs.
- `gsd-pi-host-adapters`: Expose the Relay-named Pi tool and CLI while preserving the existing host-capability semantics.

## Impact

The companion repository name, npm metadata, binary name, extension manifest, generated workflow content, Pi extension, documentation, compatibility tests, generated-record paths, and gate identifiers are affected. Local pre-release `.openspec-gsd` records are disposable and are not a supported migration input. The generic OpenSpec extension API remains product-neutral and should require no new core behavior beyond validating the renamed manifest. Existing GitHub repository URLs will redirect after the repository rename, but documentation and configured remotes will move to the canonical Relay URL.
