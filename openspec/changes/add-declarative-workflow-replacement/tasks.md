## 1. Establish the Replacement Contract

- [x] 1.1 Add RED manifest tests for a valid `replaces` list, an omitted list, invalid and duplicate IDs, self-replacement, and an ID still actively contributed by the same extension.
- [x] 1.2 Add RED registry and generation tests proving replacement IDs remain retirement metadata and never become discovered workflows, help entries, commands, skills, or compatibility aliases.
- [x] 1.3 Add RED reconciliation tests for unchanged tracked artifacts, modified tracked artifacts, ownership-marked artifacts missing from the ledger, absent artifacts, repeated reconciliation, and recreated identical artifacts.
- [x] 1.4 Add RED safety tests for unmarked user files, malformed markers, different-extension ownership, active-artifact collisions, directories, filesystem aliases, and non-identical recovery collisions.
- [x] 1.5 Add RED cross-host tests proving command and skill candidates use exact configured adapter paths on macOS, Linux, and Windows without globbing or filename-pattern discovery.

## 2. Implement Declarative Retirement

- [x] 2.1 Extend `WorkflowContributionV1` and manifest validation with backwards-compatible optional `replaces` metadata and field-specific validation diagnostics.
- [x] 2.2 Normalize replacement metadata with enabled workflow contributions while excluding predecessor IDs from active registry and generation surfaces.
- [x] 2.3 Derive deduplicated retirement candidates from configured tools, delivery modes, command adapters, skill directory constants, and Node path APIs, and preserve any candidate that collides with an active desired artifact.
- [x] 2.4 Classify exact-path evidence using the prior reconciliation identity, ownership marker, digest, and filesystem entry type without scanning host directories.
- [x] 2.5 Delete only proven unchanged retired artifacts and remove only their empty generated parent directories.
- [x] 2.6 Implement content-addressed project-local recovery for modified or otherwise unverified same-extension marker-owned files, including identical-destination idempotency and non-overwriting collision handling.
- [x] 2.7 Preserve unmarked, ambiguously owned, conflicting, aliased, and unsupported entries and emit actionable diagnostics naming the unresolved path.
- [x] 2.8 Record active artifacts and replacement outcomes coherently so lifecycle reconciliation and extension doctor distinguish deletion, recovery, preservation, and conflict without claiming unresolved aliases were removed.

## 3. Verify the Generic Seam

- [x] 3.1 Complete GREEN and REFACTOR passes for manifest compatibility, exact-path retirement, deletion proof, recovery safety, idempotency, diagnostics, and legacy-manifest behavior.
- [x] 3.2 Add extension conformance fixtures for declarative replacement without introducing extension-specific policy or executable migration hooks.
- [x] 3.3 Document the `replaces` field, recovery location, ownership rules, diagnostics, and downstream adoption sequence for extension authors and operators.
- [x] 3.4 Run formatting, lint, type-check, build, focused extension tests, the full OpenSpec suite, and strict validation of this change.
- [x] 3.5 Run Windows and Linux CI coverage for path and recovery behavior and verify macOS locally.
- [x] 3.6 Run the maintained extension-seam budget and upstream-survivability check; stop for explicit API-version or seam-budget review if the optional v1 field cannot remain backwards-compatible and bounded.
- [x] 3.7 Hand the verified generic seam back to `add-gsd-discussion-and-semantic-planning` so that change—not core—declares the concrete `run`/`run-status` replacements and completes installed migration acceptance.
