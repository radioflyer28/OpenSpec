# Extension Seam Maintenance

This document records how the maintained OpenSpec fork carries the generic
extension seam while continuing to consume official OpenSpec updates. OpenSpec GSD
policy belongs in the separate `openspec-gsd` repository; this fork owns
only the generic lifecycle, workflow, compatibility, and archive-gate contract.

## Hardening baseline

Recorded before `harden-guardrails-maintainability` implementation:

| Item | Baseline |
|---|---|
| Official `Fission-AI/OpenSpec` revision | `d57889664cab4f2f061d236ec3ff82a5578701bb` |
| Fork revision | `a7cb2c668ffeba96114c61924a31c97c379bef89` |
| Production source delta | 2,825 additions, 23 deletions |
| Extension-owned source delta | 2,360 additions, 0 deletions |
| Source delta outside `src/core/extensions/` | 465 additions, 23 deletions |

The modified or added source paths outside `src/core/extensions/` were:

- `src/cli/index.ts`
- `src/commands/extension.ts`
- `src/core/archive.ts`
- `src/core/artifact-graph/resolver.ts`
- `src/core/command-generation/generator.ts`
- `src/core/completions/command-registry.ts`
- `src/core/index.ts`
- `src/core/update.ts`
- `src/utils/command-references.ts`

The first official-upstream merge after the seam was introduced conflicted in
`docs/cli.md`, `pnpm-lock.yaml`, `src/core/archive.ts`, `src/core/update.ts`, and
`src/utils/command-references.ts`. The hardening work uses this baseline to
reduce the hot-file integration surface and establishes a checked allowlist and
budget so later growth is explicit.

## Hardened integration budget

Run `pnpm check:extension-seam` after rebasing the fork. The checked report uses
the recorded official revision unless `OPENSPEC_SEAM_BASE` explicitly selects a
new fetched upstream commit. Extension-owned files are
`src/core/extensions/**` and `src/commands/extension.ts`; production changes
outside them are allowlisted and capped at the achieved hardened total of 172
additions and 21 deletions. Any new path or per-file/total growth fails.

The remaining existing-file edits are necessary for these narrow reasons:

- `src/cli/index.ts` registers the generic extension lifecycle command and
  passes the running distribution version.
- `src/core/archive.ts` exposes archive options/diagnostics and makes one call
  to the archive-gate facade before any ordinary archive work.
- `src/core/command-generation/generator.ts` lets declarative workflow IDs use
  the existing adapter and invocation transformation path.
- `src/core/completions/command-registry.ts` describes the lifecycle command to
  the existing help and completion machinery.
- `src/core/index.ts` exposes the versioned public extension sub-API.
- `src/core/update.ts` calls the workflow-reconciliation facade with the same
  tool and delivery selection as built-in generation.
- `src/utils/command-references.ts` applies existing per-host invocation rules
  to declarative workflow identifiers while retaining byte-equivalent behavior
  for built-in-only calls.

## Ownership boundary

OpenSpec owns the versioned manifest contract, project extension lockfile,
workflow generation integration, required-gate record, and archive enforcement.
The companion owns risk classification, TDD policy, checker routing, execution
events, repair policy, review, verification, and host adapters. OpenSpec
proposal, specs, design, and tasks remain the only human-maintained planning
truth.

## Distribution identity

Until the extension seam is available in an official OpenSpec release, fork
packages use a `-gsd.N` prerelease version and identify
`radioflyer28/OpenSpec` as their package source. They must never be published as
the equivalent official stable version. Registry-installed extensions retain
their requested package spec, resolved version, cache key, and package-manager
integrity in `openspec/extensions.lock.yaml`; linked development extensions are
identified by their canonicalized link path and manifest version.

The first API-bearing fork line is `1.8.0-gsd.1`. Compatibility also
requires the public `OPEN_SPEC_EXTENSION_API_V1` feature marker, so semver alone
cannot cause an official API-incompatible package to be accepted.

Install or upgrade the fork explicitly and confirm its prerelease identity:

```bash
npm install --global github:radioflyer28/OpenSpec#v1.8.0-gsd.1
openspec --version
openspec extension doctor gsd
```

After the seam ships officially, replace the GitHub fork dependency with the
first documented API-bearing `@fission-ai/openspec` release. Run doctor before
removing the fork. A missing feature marker is an API-provider failure even when
the version satisfies the manifest range; restore the supported fork build and
leave existing gate obligations enabled until compatibility is restored.
