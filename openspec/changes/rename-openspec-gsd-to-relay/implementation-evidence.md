# Implementation Evidence

## Baseline

- Recorded: 2026-09-02 (America/New_York).
- Qualified patched core: `6f264be3ccf414d4e2505b212d4de78b6ebb34df`, branch `codex/upgrade-openspec-gsd-base-to-1-11`.
- Qualified companion: `b83044cee6f72aaa8980940392b575d8e5bf3f79`; maintained installed checkout has equivalent compatibility commit `ddd153d`.
- Installed OpenSpec: `1.11.0-gsd.1`; installed Pi: `0.84.4`; Pi links `/Users/akriz/code/openspec-guardrails`.
- Public companion repository before rename: `https://github.com/radioflyer28/openspec-guardrails`.
- Project extension identity before rename: `gsd@0.1.0`; gate `gsd.assurance`; record directory `.openspec-gsd`; Pi tool `openspec_gsd_workflow`.
- A filesystem inventory under `/Users/akriz/code` found no `.openspec-gsd` directories and no `.openspec-gates.json` files. Old `gsd.assurance` strings occur only in source/tests and historical OpenSpec planning evidence, not persisted gate state.
- The installed development pairing is the expected pre-rename link: OpenSpec extension `gsd@0.1.0` and Pi link `/Users/akriz/code/openspec-guardrails`. These are installation metadata to replace, not active execution records to migrate.
- Rollback artifacts:
  - `fission-ai-openspec-1.11.0-gsd.1.tgz`: `8828da075226b09562aa99e7dff97bbadda06b88d988525b3c60abbb96157460`
  - `fission-ai-openspec-1.8.0-gsd.1.tgz`: `db7ebe4b79b0b81701ab0f839492e587b058228f4b0c01c7c3861fa916fffefc`
  - `openspec-gsd-0.1.0.tgz`: `874d71f1330d1761b23eeb88e557b62ff13b9687b3bd20165e5c47789e76f518`

## Isolated Worktrees

- Core: `/private/tmp/openspec-relay-core`, branch `codex/rename-openspec-gsd-to-relay`, based on `6f264be`.
- Companion: `/private/tmp/openspec-relay`, branch `codex/rename-openspec-gsd-to-relay`, based on `b83044c`.
- Both began clean; the original dirty OpenSpec checkout and installed companion checkout were not cleaned or reset.

## Identity Inventory

The baseline audit found 62 companion files containing one or more old product identities outside dependencies/build output. They are classified as follows:

- **Rename:** package metadata and lockfiles; manifest and gate registration; CLI and wrapper names; state paths and schemas; source diagnostics; Pi extension/tool; generated workflows/skills/prompts; tests and snapshots; README, compatibility, and maintenance documentation.
- **Compatibility:** explicit `.openspec-gsd`, `gsd.assurance`, `openspec-gsd`, extension `gsd`, and `openspec_gsd_workflow` inputs required only to detect, validate, migrate, or explain legacy installations and records.
- **Attribution:** GSD inspiration and vendored grilling provenance in README, notices, and source notices; these references retain their proper upstream names.
- **Historical evidence:** pre-Relay fixture names and recorded baseline/rollback identifiers where changing the text would falsify history.
- **Unrelated:** generic OpenSpec extension, assurance, workflow, host-capability, and role terminology remains unchanged.

The final audit must reduce remaining old product-name occurrences to an explicit compatibility/attribution/historical allowlist.

## Canonical companion identity

- Added package-surface coverage before the rename and observed the expected RED failure because `pi/extensions/openspec-relay.ts` did not exist.
- Renamed the package to `openspec-relay@0.2.0`, CLI to `openspec-relay`, extension to `relay`, aggregate gate to `relay.assurance`, Pi tool to `openspec_relay_workflow`, generated-record root to `.openspec-relay`, and public source URL to `https://github.com/radioflyer28/openspec-relay`.
- Focused package, Pi, and identity tests pass (7/7); build, type-check, and lint pass.
- Current old-name allowlist: README GSD attribution, negative assertions that obsolete executable aliases are absent, and historical planning/rollback evidence. `.git` worktree metadata, dependencies, build output, and vendored third-party source are excluded from the product audit.

## Pre-release cleanup

- Confirmed there are no `.openspec-gsd` directories or persisted `.openspec-gates.json` obligations under the known `/Users/akriz/code` projects. The installed `gsd@0.1.0` OpenSpec link and `/Users/akriz/code/openspec-guardrails` Pi link are installation metadata awaiting replacement.
- Removed the uncommitted migration/receipt experiment after the plan adopted a clean pre-1.0 break; no runtime migration or legacy gate evaluator remains.
- Added a clean-break test proving a Relay run leaves an unrelated `.openspec-gsd` sentinel untouched, creates only the three registered `.openspec-relay` records, and registers only `relay.assurance`.
- Focused state, event, gate, package identity, and Pi package suites pass: 6 files, 18 tests.
- The packed-candidate installation test passes against the isolated `1.11.0-relay.1` core. It installs `openspec-relay@0.2.0`, reconciles all seven Relay workflows, removes only declared extension-owned legacy workflow files, preserves a similarly named user-owned file, validates extension list/doctor output, and loads one Relay Pi package.
- Both cross-repository archive tests pass when explicitly paired with `/private/tmp/openspec-relay-core`, covering gate rejection and audited override behavior.
- The Pi/workflow authority audit found no Git commit, branch, checkout, or worktree mutation commands and no GSD phase/milestone state. References to `PLAN.md` are prohibitions that preserve OpenSpec `tasks.md` as the sole maintained execution plan.
- Patched core identity commit: `5557beb` (`@fission-ai/openspec@1.11.0-relay.1`). The root export, `./extensions` export, CLI entry point, lint, build, and version smoke checks pass.
- Core qualification: 154 test files and 4,319 tests pass. The extension-focused suite previously passed 68 tests, the seam budget passes with zero violations, and the full `v1.11.0..HEAD` path inspection remains confined to the generic extension seam and its qualification infrastructure. Remaining `1.8.0-gsd.1` strings are deliberate opaque prerelease-version fixtures in generic compatibility tests, not product identity.
- Upstream survivability reapplied the generic seam to official upstream main `db03c6c4b0ef8a05308497482bdc5fc4dd151569` and passed 8 files / 87 extension tests.
- Local core artifact: `/private/tmp/openspec-relay-artifacts/fission-ai-openspec-1.11.0-relay.1.tgz`; SHA-256 `f9112007b810aac39e8a242f7303756dc243de89f05b8398e202b5b8426be98b`; npm pack reported 421 entries, executable mode on `bin/openspec.js`, and the self-install version check passed. Nothing was published.
- Public documentation now uses Relay identity throughout, explains the OpenSpec source-of-truth and no-phase/milestone boundary, credits current GSD Core and its earlier lineage, preserves the pinned grilling notice, and documents local/GitHub Pi installation without npm publication.
- The pre-1.0 cleanup procedure was exercised in disposable project `/private/tmp/relay-cleanup-doc-test.7PzHuv`: old `gsd@0.1.0` linked and disabled; Relay linked/enabled; all seven workflows generated; user configuration update completed; the old lock mapping was deliberately removed; relinking refreshed the digest; final list/doctor reported only compatible `relay@0.2.0` with reconciliation `ok`.
- Final companion old-name audit allowlist: GSD attribution and no-affiliation statements; explicit pre-release cleanup/rollback commands and identifiers; and the `.openspec-gsd` sentinel in the clean-break regression test. No canonical CLI, package, extension, gate, Pi tool, generated path, repository URL, or CI label retains Guardrails/GSD product identity.
- Packed companion artifact: `/private/tmp/openspec-relay-artifacts/openspec-relay-0.2.0.tgz`; SHA-256 `927e7045cfe1db1afa4f5438b16effd445a14d86cd00ae011f33fec252a39682`; 204 entries. Inspection confirmed executable modes for `dist/cli.js` and `pi/bin/openspec-relay`, all seven workflows/skills/prompts, the manifest and third-party notice, no publication script, only the canonical executable, and the exact patched-core release dependency used by public source installs.
- The first isolated install exposed a stale `RELAY_VERSION` constant: package metadata was `0.2.0` while the CLI reported `0.1.0`. A RED product-identity assertion reproduced it, commit `169062f` fixed the constant, the regression passed, and a fresh exact-artifact install reports core `1.11.0-relay.1` and companion `0.2.0`.
- Exact artifacts installed offline into `/private/tmp/relay-prefix.Au5xVK`. In disposable project `/private/tmp/relay-installed-project.TIJGMN`, link/enable/list/doctor passed and a second link remained idempotent with reconciliation `ok`.
- Installed lifecycle smoke: OpenSpec created and validated `relay-smoke`; the generated discussion skill was present; Relay plan passed with explicit Tier 0 self-review, `do` returned the approved revision, the exact fixture was implemented and its task recorded complete, and `check`, `uat`, and `status` executed. Archive correctly failed closed on `relay.assurance`, naming missing repository-check, targeted-test, scenario, and goal-verification evidence. This deliberately proves route integration and enforcement rather than overriding a failing qualification gate.
- Clean-break qualification combines the disposable old-link cleanup rehearsal with the state regression: no automatic legacy migration or executable/gate alias exists, fresh runs create `.openspec-relay`, and archive enforcement names only `relay.assurance`.
- Patched-core branch `codex/rename-openspec-gsd-to-relay` was pushed to `radioflyer28/OpenSpec`. GitHub Actions run `33684893662` passed Linux, macOS, Windows, the Windows extension regression, three-platform upstream survivability, lint/type-check, and Nix flake validation.
- Final local companion qualification passes: build, type-check, lint, discussion contract, 52 test files / 249 tests, macOS qualification (4 tests), and conformance (4 tests). The two intermediate full-suite failures were stale documentation-exclusion expectations found after the rename; the expectation was corrected to protect the same exclusion under accurate GSD/project-state terminology, and the complete rerun passed.
- Hosted companion CI run `33688313244` passed on Ubuntu, macOS, and Windows at revision `ef8c99c23ef95127f63d4c4ef45cbd1c1e8c3fb1`. Windows qualification exposed and drove fixes for command-shim execution, path-API composition, and separator-neutral boundary assertions; all 249 tests and the 4-test conformance suite pass on that host. Rebase qualification run `33690184060`, source-install run `33691215958`, and paired-core install run `33691938303` also passed all three operating-system jobs. The full suite, type-check, lint, and final pack were rerun after the portability fixes.

## Public promotion and installed qualification

- The public repository is `https://github.com/radioflyer28/openspec-relay`, visibility `PUBLIC`, default branch `main`, at qualified revision `ef9c4cd99ec087bd9f0852761e3264f31cd116cf`. The prior `https://github.com/radioflyer28/openspec-guardrails` URL redirects to the canonical repository, and the development remote uses the canonical URL.
- Rename PR `#2` merged as `9d9174b034806b086b5aff325c9899880fe9e236`; Git-source artifact PR `#3` merged as `5df15785b3d7ced8d10247a4e95403d2c27a8c9f`; exact patched-core pairing PR `#4` merged as the qualified `ef9c4cd` revision.
- Patched core release `https://github.com/radioflyer28/OpenSpec/releases/tag/v1.11.0-relay.1` provides `fission-ai-openspec-1.11.0-relay.1.tgz` with SHA-256 `f9112007b810aac39e8a242f7303756dc243de89f05b8398e202b5b8426be98b`; the qualified core source revision is `5557beb12f6016711177aada71582d4899dad13c`.
- A clean disposable Pi home at `/private/tmp/relay-public-pi-paired.hGWUyJ` installed `https://github.com/radioflyer28/openspec-relay` without npm publication. Pi listed the public URL, the hosted CLI reported `0.2.0`, and its runtime resolved `@fission-ai/openspec@1.11.0-relay.1`. No third-party lifecycle script was approved or required.
- The user's active pairing now reports `openspec 1.11.0-relay.1`, `openspec-relay 0.2.0`, and Pi `0.84.4`. Pi lists `https://github.com/radioflyer28/openspec-relay` at `/Users/akriz/.pi/agent/git/github.com/radioflyer28/openspec-relay`. The root project lock enables only compatible `relay@0.2.0`; `openspec extension doctor relay` reports a valid manifest, no conflicts, and reconciliation `ok`. All seven generated Codex, Pi, and GitHub workflow contributions carry `openspec-extension:relay@0.2.0` provenance, with no stale `gsd@0.1.0` markers.
- Live Pi qualification in disposable project `/private/tmp/relay-live-smoke.tR3Luy` used model `openai-codex/gpt-5.6-sol` and Pi session `01a06457-ed30-7ffc-aa99-179de3b7f589`. The installed `openspec_relay_workflow` tool reported adapter `openspec-relay/pi` v1, Pi `0.84.4`, `usedAdapter: true`, isolated agent dispatch `available`, bounded read-only parallelism `available`, and the deliberately constrained capabilities `worktrees: false` and `git: false`.
- The same fresh project initialized OpenSpec, linked and enabled Relay from the public Pi checkout, validated a new change, and created `.openspec-relay` projections plus `relay.assurance`. `openspec archive relay-live-smoke --yes --json` exited 1 with `archive_gate_blocked`, identifying `relay.assurance`, the blocking repository-context/readiness checks, evidence digests, and remediation. No override was supplied.
- The live raw OpenSpec doctor cannot observe ephemeral Pi-session capabilities and therefore reports the four optional static capabilities unavailable; this is expected and documented. Pi workflow status is the authoritative live negotiation check. Global `npm ls --depth=0` resolves both installed packages, while deeper npm inspection labels the Relay-nested core URL dependency `invalid` despite its package metadata and CLI both resolving version `1.11.0-relay.1`; this npm URL-spec diagnostic is a known packaging limitation, not a runtime mismatch.
- The immutable companion tag `v0.2.0` predates the two source-install follow-up merges. Until a later versioned release is cut, Pi installation is qualified from canonical `main`, exactly as documented and tested; no npm registry package was published.
- Exact rollback refs and artifact checksums remain recorded in the Baseline section. Because every required live check passed, rollback was not performed.
