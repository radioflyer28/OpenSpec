## 1. Baseline and isolated branches

- [x] 1.1 Record the current OpenSpec core, companion, installed CLI, Pi package/link, extension lock, active `.openspec-gsd` fixtures, repository visibility, and exact rollback refs or artifacts in implementation evidence; verify every recorded revision and checksum resolves.
- [x] 1.2 Create dedicated rename branches or isolated worktrees for the patched OpenSpec 1.11 core and companion without cleaning unrelated work; verify both worktrees start from the qualified revisions and are clean.
- [x] 1.3 Inventory all case-sensitive `GSD`, `gsd`, `guardrails`, repository URL, CLI, extension ID, gate ID, Pi tool, and record-directory occurrences; classify each as rename, compatibility, attribution, historical evidence, or unrelated before editing.

## 2. Canonical companion identity

- [x] 2.1 Add failing package-surface tests for `openspec-relay@0.2.0`, CLI `openspec-relay`, extension ID `relay`, gate `relay.assurance`, Pi tool `openspec_relay_workflow`, canonical repository URL, and absence of unintended old executable aliases; verify the tests fail against the GSD-named baseline.
- [x] 2.2 Rename companion package metadata, executable and wrapper filenames, manifest ownership, schemas/constants, diagnostics, and generated contribution provenance; verify the package-surface tests pass and the build exports only the intended canonical identities.
- [x] 2.3 Rename internal source symbols and user-facing messages where they express product identity while retaining neutral or historically attributed terminology where appropriate; verify an explicit old-name allowlist accounts for every remaining occurrence.
- [x] 2.4 Commit the canonical companion identity separately and verify the commit contains no record migration, core seam redesign, npm publication, or unrelated files.

## 3. Pre-release cleanup

- [x] 3.1 Verify the maintained repositories, installed development pairing, and known projects contain no deployed or active durable `.openspec-gsd` records or unresolved `gsd.assurance` obligations; record the result and preserve rollback refs without inventing migration support.
- [x] 3.2 Add or update tests proving new runs use only `.openspec-relay` and `relay.assurance`, package and Pi surfaces expose no executable legacy aliases, and the established event replay, projection integrity, and atomic-write behavior remains unchanged.
- [x] 3.3 Remove partial or obsolete runtime record-migration, receipt, journal, and legacy-gate code and tests; run the focused state, gate, and identity suites, then commit the pre-release cleanup separately.

## 5. Pi and workflow reconciliation

- [x] 5.1 Add or update Pi tests for `openspec_relay_workflow`, the hosted `openspec-relay` CLI, stable `/opsx:*` entry points, old-tool remediation, capability negotiation, sequential fallback, fresh read-only roles, and deterministic bounded parallelism.
- [x] 5.2 Rename the Pi extension and hosted CLI surface without changing assurance authority or execution semantics; verify Pi 0.84.x loads one canonical Relay workflow tool and does not register a competing GSD tool.
- [x] 5.3 Reconcile all seven Relay-owned workflows against clean, legacy-owned, and user-owned project fixtures; verify generation is idempotent, declared replacements remain correct, stale extension-owned files are removed, and user-owned files are preserved.
- [x] 5.4 Commit Pi and workflow reconciliation changes separately and verify no Git/worktree write authority or GSD phase/milestone state was introduced.

## 6. Patched OpenSpec pairing

- [x] 6.1 Update the isolated patched core package and lock metadata from `1.11.0-gsd.1` to `1.11.0-relay.1`; verify root and `./extensions` exports, CLI entry point, extension lifecycle, workflow reconciliation, and archive-gate contracts remain unchanged.
- [x] 6.2 Update seam qualification metadata and tests only where the old suffix or fixture identity is intentional; run the seam budget and inspect `v1.11.0..HEAD` to verify the core remains generic and within its bounded allowlist.
- [x] 6.3 Run core lint, type-check, build, focused extension suites, complete tests, package inspection, and upstream-main survivability; record results and the locally packed `1.11.0-relay.1` checksum without publishing.
- [x] 6.4 Commit and push the Relay-suffixed core pairing in logical commits, then verify Linux, macOS, Windows, Windows extension regression, and Nix CI complete successfully.

## 7. Public documentation and repository rename

- [x] 7.1 Rewrite README, compatibility contract, maintenance runbook, third-party notices, examples, installation commands, badges, package metadata, and repository links for OpenSpec Relay; verify documentation states the OpenSpec source-of-truth boundary, selected GSD inspiration, grilling attribution, no upstream affiliation, and no phase/milestone machinery.
- [x] 7.2 Add an upgrade and rollback procedure covering Git remotes, Pi package source, extension link/lock reconciliation, CLI pairing, deliberate inspection/removal/regeneration of disposable local pre-release records, and exact prior artifacts; verify every command against a disposable copy rather than the user's only working installation.
- [x] 7.3 Run an old-name audit and require every remaining GSD/guardrails occurrence to match the reviewed compatibility, attribution, or historical-evidence allowlist; verify canonical user-facing paths contain only Relay naming.
- [x] 7.4 After local and isolated qualification passes, rename the public GitHub repository to `radioflyer28/openspec-relay`, keep it public, update local and documented remotes, and verify the canonical repository URL plus GitHub redirect behavior.

## 8. Packaging, migration, and installed qualification

- [x] 8.1 Pack `openspec-relay@0.2.0` locally and inspect filenames, executable permissions, Pi resources, manifest identity, runtime dependencies, notices, and absence of registry-publication scripts or unintended legacy executables; record its checksum.
- [x] 8.2 Install the exact packed `1.11.0-relay.1` core and Relay companion into an isolated prefix; verify dependency resolution, CLI versions, extension link/enable/list/doctor, and idempotent workflow generation.
- [x] 8.3 Exercise a clean project through propose/status, discuss, plan, do, check, UAT, status, and archive enforcement far enough to prove all installed Relay routes and the `relay.assurance` gate operate together.
- [x] 8.4 Exercise the documented pre-release cleanup against a disposable copy, verify no automatic `.openspec-gsd` migration or legacy executable/gate alias is present, and confirm a fresh Relay run creates only `.openspec-relay` with `relay.assurance` archive enforcement.
- [x] 8.5 Run the companion lint, type-check, build, complete suite, conformance suite, macOS/Pi qualification, package safety checks, and automated cross-platform CI; investigate every difference from the qualified GSD-named baseline.
- [x] 8.6 Install from `https://github.com/radioflyer28/openspec-relay` using Pi in a clean disposable environment and verify the public source is independently usable without npm publication.
- [x] 8.7 Replace the user's installed pairing and project links only after all required checks pass; verify `openspec --version`, `openspec-relay --version`, Pi package listing, extension lock resolution, doctor, live capability negotiation, and a new-project archive smoke test, restoring the prior pairing on any required failure.
- [x] 8.8 Record qualified revisions, checksums, CI/test results, installed versions, pre-release cleanup results, repository visibility, canonical URLs, known limitations, and rollback refs; verify every completed task against that evidence before declaring the change ready to archive.
