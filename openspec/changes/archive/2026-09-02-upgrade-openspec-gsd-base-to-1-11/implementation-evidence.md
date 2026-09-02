# Implementation Evidence

## Baseline

- Recorded: 2026-09-02 (America/New_York)
- OpenSpec fork checkout: `codex/harden-guardrails-maintainability` at `75182cac390e97071f36539c400bb7f1d35690fa`
- The source checkout was dirty before this change; its unrelated modified and untracked files were left untouched.
- OpenSpec GSD companion: `codex/harden-guardrails-maintainability` at `c296313bd53dee22a02b40d78af25ed9bc77903f` with a clean worktree.
- Installed OpenSpec: `/opt/homebrew/bin/openspec`, version `1.8.0-gsd.1`.
- Installed Pi: `/opt/homebrew/bin/pi`, version `0.84.4`.
- Enabled extension: `gsd@0.1.0`, linked from `/Users/akriz/code/openspec-guardrails`, compatible, manifest valid, reconciliation healthy.
- Baseline doctor reports optional host capabilities unavailable in the plain OpenSpec CLI (`agentDispatch`, `parallelism`, `worktrees`, and `git`); this is expected outside the Pi host adapter.
- Rollback source refs: OpenSpec `75182cac390e97071f36539c400bb7f1d35690fa`; companion `c296313bd53dee22a02b40d78af25ed9bc77903f`. A packed rollback artifact will be retained before the installed CLI is replaced.

## Upstream 1.11 Baseline

- Official tag: `v1.11.0`
- Tag commit: `a0ddb60d040c61f4907436a9d91310934b1dda63`
- Tag package version: `1.11.0`
- Upstream forward-survivability ref at start: `d0071d7326689a0269332a500c8f56b3f2218ba9`
- Integration branch: `codex/upgrade-openspec-gsd-base-to-1-11`
- Isolated worktree: `/private/tmp/openspec-gsd-1.11`
- Toolchain: Node `v22.23.2`, pnpm `11.19.0`.
- Clean upstream build: passed.
- Clean upstream tests: 145 files passed; 4,229 tests passed.

## Qualification

- Reconstructed seam commit: `abde2e2` (`feat: rebase extension seam onto OpenSpec 1.11`).
- Generated seam patch: 230,872 bytes; 38 declared files; no OpenSpec GSD orchestration or planning artifacts.
- The seam and maintenance patches applied to `v1.11.0` without conflicts.
- Focused build and type-check: passed.
- Focused seam suite: 9 files passed; 90 tests passed.
- Seam budget from `v1.11.0`: +172/-21 integration lines, exactly within the recorded budget; no violations and no newly allowed production paths.

## Core Verification and Package

- Qualified core revision: `6f264be` on `codex/upgrade-openspec-gsd-base-to-1-11`; pushed to `origin/codex/upgrade-openspec-gsd-base-to-1-11`.
- Additional bounded commits: `2cd1d9e` accepts the package's prerelease version in generated metadata tests; `6f264be` updates the Nix dependency hash for the regenerated 1.11 lockfile.
- Lint, type-check, build, and generated-file checks: passed.
- Full patched OpenSpec suite: 145 files plus extension coverage, 4,319 tests passed.
- Focused extension seam suite: 9 files, 90 tests passed, including lifecycle, reconciliation, capability, conflict, recovery, and archive-gate cases.
- Forward survivability: the seam applied to and verified against upstream `6911f551752faac446934a2974e546eb287f8068`; 87 configured verification tests passed and no forward conflict was found. No unreleased upstream code was incorporated into the candidate.
- CI: [run 33675481091](https://github.com/radioflyer28/OpenSpec/actions/runs/33675481091) passed. Linux, macOS, Windows, Windows extension regression, Nix, lint/type-check, and all three upstream-survivability jobs succeeded.
- Packed core: `/private/tmp/openspec-gsd-artifacts/fission-ai-openspec-1.11.0-gsd.1.tgz`.
- Packed core SHA-256: `8828da075226b09562aa99e7dff97bbadda06b88d988525b3c60abbb96157460`.
- Package inspection confirmed the CLI, root export, `./extensions` export, extension lifecycle implementation, schemas, and standard OpenSpec assets. Packing was local only; no registry publication or release mutation occurred.

## Companion Qualification

- Qualified companion revision: `b83044c` on the isolated upgrade branch; the same change is applied as `ddd153d` in the maintained `/Users/akriz/code/openspec-guardrails` checkout.
- Compatibility range is `>=1.11.0-gsd.1 <2.0.0`; documentation states that official semver alone is insufficient and the extension API probe remains mandatory.
- An official `1.11.0` fixture without the extension API was rejected by conformance tests.
- The exact packed core was installed into the isolated companion environment and resolved as `1.11.0-gsd.1`, not the registry's official package.
- Companion lint, type-check, build, full suite, and conformance suite passed: 36 files and 250 tests; conformance 4/4.
- Packed companion: `/private/tmp/openspec-gsd-artifacts/openspec-gsd-0.1.0.tgz`.
- Packed companion SHA-256: `874d71f1330d1761b23eeb88e557b62ff13b9687b3bd20165e5c47789e76f518`.
- Package and tests preserve the no-publication constraint; no npm package was published.
- Reconciliation generated the seven OpenSpec GSD workflows alongside the core workflows, respected declared replacements and user-owned files, and was byte-idempotent on a second doctor run.
- No GSD phase, milestone, roadmap, or duplicate planning-state artifact was added.

## Pi and Installed-System Qualification

- Installed Pi version: `0.84.4`, within the supported `>=0.84.0 <0.85.0` adapter range.
- A live non-interactive Pi invocation loaded the linked package and called `openspec_gsd_workflow` with `usedAdapter: true`.
- Live capability result: agent dispatch available, bounded read-only parallelism available, structured results available, human interaction available; Git and worktrees remain unavailable through the deliberately read-only Pi assurance adapter. Tier 0 sequential fallback and these capability states are covered by the passing companion suite.
- Isolated prefix: `/private/tmp/openspec-gsd-isolated`; disposable project: `/private/tmp/openspec-gsd-smoke`.
- The isolated project passed init, extension link/enable/list/doctor, strict proposal validation, plan, do-delegation readiness, check, status, workflow generation, and idempotent reconciliation.
- Installed workflow routing was present for discuss, plan, do, check, UAT, and status; the live Pi status call exercised the installed host adapter, while focused and full workflow tests covered the remaining routing and handoff contracts.
- Archive enforcement was observed directly: unresolved `gsd.assurance` returned exit 1 and `archive_gate_blocked`; the focused cross-repository and Tier 0 end-to-end suites also proved that legitimately resolved passing assurance archives with preserved gate evidence. A separate audited-override smoke confirmed override reason, actor, result digest, and evidence digest preservation.
- The actual system commands were repeated in `/private/tmp/openspec-gsd-system-smoke.DUZbf0`: init, link, enable, list, doctor, change creation, validation, gate rejection, and audited archive all behaved as expected.

## Installed Pairing and Rollback

- Installed OpenSpec: `1.11.0-gsd.1` at `/opt/homebrew/bin/openspec`.
- Installed OpenSpec GSD: `0.1.0`, linked in Pi from `/Users/akriz/code/openspec-guardrails` and rebuilt from the qualified compatibility commit.
- Installed doctor: manifest valid, compatibility compatible, conflicts none, reconciliation OK, workflows 7, gates 1. Plain CLI reports optional agent/Git/worktree/parallel capabilities unavailable as expected; the live Pi adapter separately qualified dispatch and parallelism.
- Rollback core artifact: `/private/tmp/openspec-gsd-artifacts/fission-ai-openspec-1.8.0-gsd.1.tgz`.
- Rollback core SHA-256: `db7ebe4b79b0b81701ab0f839492e587b058228f4b0c01c7c3861fa916fffefc`.
- Rollback source refs remain OpenSpec `75182cac390e97071f36539c400bb7f1d35690fa` and companion `c296313bd53dee22a02b40d78af25ed9bc77903f`.
- Rollback command: `npm install --global /private/tmp/openspec-gsd-artifacts/fission-ai-openspec-1.8.0-gsd.1.tgz`, then restore the companion checkout to the recorded ref and rebuild it before reusing the existing Pi link.
- No required installed-system check failed, so rollback was not performed.
