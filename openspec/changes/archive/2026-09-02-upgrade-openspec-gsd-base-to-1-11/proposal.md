## Why

The maintained OpenSpec GSD fork is based on OpenSpec 1.8.0 while the official stable release is 1.11.0. Updating now keeps the fork close to upstream, adopts relevant workflow and validation fixes, and tests that the generic extension seam remains maintainable before divergence grows.

## What Changes

- Rebase the minimal generic extension and archive-gate seam onto the official OpenSpec `v1.11.0` release baseline.
- Preserve OpenSpec 1.9–1.11 behavior while retaining the existing OpenSpec GSD extension contract, workflow reconciliation, and archive-gate integration.
- Version and privately install the patched fork as `1.11.0-gsd.1`.
- Update the companion package's tested compatibility baseline and verify it against the patched fork.
- Run core, seam, conformance, companion, Pi, and installed archive-gate qualification before replacing the currently installed `1.8.0-gsd.1` build.
- Keep current upstream `main` as a forward-survivability target, but do not base the release on unreleased commits.
- Do not publish either package to a registry.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This change updates and qualifies the upstream implementation baseline without changing OpenSpec GSD's specified behavior.

## Impact

The OpenSpec fork history, package and lockfile versions, overlapping upstream core files, extension-seam patch metadata, CI qualification, companion compatibility declarations, and local OpenSpec/Pi installation are affected. Existing OpenSpec planning artifacts and generated OpenSpec GSD assurance records remain compatible unless qualification identifies an explicit migration need.
