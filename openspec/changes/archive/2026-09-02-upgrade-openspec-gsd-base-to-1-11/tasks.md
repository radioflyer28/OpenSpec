## 1. Establish the baseline and recovery path

- [x] 1.1 Record the current OpenSpec fork revision and status, companion revision and status, installed `openspec` and Pi versions, extension lock/doctor output, and the exact working `1.8.0-gsd.1` rollback refs or artifacts.
- [x] 1.2 Fetch the official OpenSpec tags and verify that `v1.11.0` resolves to an immutable commit whose `package.json` version is `1.11.0`; record the release and current `upstream/main` revisions separately.
- [x] 1.3 Create a dedicated `codex/upgrade-openspec-gsd-base-to-1-11` integration branch and isolated worktree from `v1.11.0`, without modifying or cleaning the current dirty checkout.
- [x] 1.4 Run the unmodified `v1.11.0` build and test suite in the isolated worktree to distinguish upstream/environment failures from seam-induced regressions.

## 2. Reapply the minimal extension seam

- [x] 2.1 Generate the extension-seam patch from the configured prior upstream base and allowlisted paths, then inspect its file list to exclude OpenSpec GSD orchestration, unrelated planning history, and unrelated fork changes.
- [x] 2.2 Apply the inspected patch to the `v1.11.0` worktree and resolve every overlap from the upstream 1.11 implementation outward, adding only the generic extension discovery, workflow reconciliation, capability, command, and archive-gate hooks required by the existing contract.
- [x] 2.3 Update the fork package version to `1.11.0-gsd.1`, regenerate the pnpm lockfile and generated outputs with repository commands, and confirm that no dependency or generated-file change is unrelated to the new base.
- [x] 2.4 Update the seam-budget and upstream-survivability metadata to identify the new upstream base and all intentionally carried paths, with an explicit rationale for any path newly entering the seam.
- [x] 2.5 Build the patched package and verify the root and `./extensions` exports, CLI entry point, extension lifecycle commands, declarative workflow replacement, and archive-gate registration against the existing public extension contract.
- [x] 2.6 Commit the reconstructed core seam in logical, reviewable commits that do not include unrelated files or registry-release operations.

## 3. Qualify the patched OpenSpec core

- [x] 3.1 Run formatting or generated-file checks used by the repository, lint, build, and the complete OpenSpec test suite on the patched worktree; investigate any difference from the clean `v1.11.0` baseline.
- [x] 3.2 Run the focused extension, workflow-reconciliation, command-lifecycle, host-capability, and archive-gate suites, including ownership conflicts, recovery paths, disabled extensions, fail-closed gates, human acceptance, and audited overrides.
- [x] 3.3 Run the extension-seam budget check and inspect the final `v1.11.0..HEAD` diff to confirm that core contains only generic extension infrastructure and maintenance metadata.
- [x] 3.4 Run the seam patch against the latest fetched `upstream/main` in prepare-only mode and run its configured verification when practical; record forward conflicts without incorporating unreleased upstream code into `1.11.0-gsd.1`.
- [x] 3.5 Run or confirm the existing automated Linux, macOS, and Windows CI jobs for the patched branch, including the Windows extension regression suite; do not require manual qualification on additional machines.
- [x] 3.6 Pack `@fission-ai/openspec@1.11.0-gsd.1` without publishing, inspect the archive contents and package metadata, record its checksum, and verify that no release or registry mutation occurred.

## 4. Qualify OpenSpec GSD against the new base

- [x] 4.1 In the companion repository, update the development/test baseline and compatibility documentation for `1.11.0-gsd.1`; ensure startup capability checks reject an official OpenSpec build that lacks the extension API even if its semver fits the declared range.
- [x] 4.2 Install the exact packed core artifact into an isolated companion test environment and verify that dependency resolution uses it rather than the registry's official `1.11.0` package.
- [x] 4.3 Run the companion build, full test suite, OpenSpec conformance suite, packed-package inspection, and no-publication safety checks against the upgraded core.
- [x] 4.4 Exercise Pi capability negotiation on the installed Pi version and verify sequential fallback plus supported generic dispatch, Git, worktree, and parallel capabilities without changing assurance outcomes.
- [x] 4.5 Reconcile the current OpenSpec GSD workflows with the upgraded CLI and confirm idempotent generation, declared workflow replacement, user-owned-file preservation, and absence of unexpected semantic changes in generated artifacts.
- [x] 4.6 Commit any compatibility-only companion changes separately from the core upgrade, without adding phases, milestones, roadmaps, or duplicate planning state.

## 5. Install and accept the upgraded pairing

- [x] 5.1 Install the packed CLI and companion package/link into an isolated prefix, initialize a new temporary project, link and enable OpenSpec GSD, and require `openspec extension doctor gsd` to pass.
- [x] 5.2 In the temporary project, exercise proposal/status plus `/opsx:discuss`, `/opsx:plan`, `/opsx:do`, `/opsx:check`, `/opsx:uat`, and `/opsx:status` entry points far enough to prove that the upgraded CLI exposes and routes the installed workflows.
- [x] 5.3 Prove archive enforcement end to end by showing an unresolved required `gsd.assurance` result blocks archive and a passing, legitimately resolved result permits archive with its audit evidence preserved.
- [x] 5.4 Reconfirm the `1.8.0-gsd.1` rollback procedure, then replace the user's installed OpenSpec CLI and OpenSpec GSD package/link with the qualified pairing and verify `openspec --version`, extension listing, lock resolution, and doctor output.
- [x] 5.5 Repeat the new-project macOS smoke test through archive using the actual installed commands; restore the recorded prior pairing if any required installed-system check fails.
- [x] 5.6 Record the qualified core and companion revisions, artifact checksums, CI/test results, installed versions, known forward-survivability findings, and rollback refs in the change evidence, then verify every completed task against that evidence before declaring the change ready to archive.
