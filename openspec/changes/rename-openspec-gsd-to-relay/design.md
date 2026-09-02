## Context

The companion is currently public as `radioflyer28/openspec-guardrails`, packaged as `openspec-gsd`, linked into Pi from that checkout, and paired with `@fission-ai/openspec@1.11.0-gsd.1`. Runtime state uses `.openspec-gsd`, extension ID `gsd`, gate `gsd.assurance`, and Pi tool `openspec_gsd_workflow`. See `proposal.md` and the three delta specs for the new public contract.

The rename crosses two repositories and persisted project state. Existing active changes must not lose assurance authority merely because the extension identity changes.

## Goals / Non-Goals

**Goals:**

- Establish one coherent Relay identity across source, packages, runtime diagnostics, generated files, installation instructions, and the patched OpenSpec pairing.
- Preserve existing active-run evidence and archive blocking through a deterministic, testable migration.
- Keep OpenSpec artifacts as the only human-maintained planning truth and keep `/opsx:*` entry points stable.
- Publish source through the existing public GitHub repositories without publishing either package to npm.

**Non-Goals:**

- Rebrand upstream OpenSpec, upstream GSD, or Matt Pocock's grilling skill.
- Add GSD milestones, phases, roadmaps, project-state machinery, or aliases that operate as a second workflow implementation.
- Redesign assurance, role boundaries, Pi capability negotiation, or the generic OpenSpec extension seam.
- Promise npm publication in this change.

## Decisions

### 1. Rename the full pre-1.0 identity now

Use OpenSpec Relay, `openspec-relay`, `relay`, `openspec-relay`, `openspec_relay_workflow`, `.openspec-relay`, `relay.assurance`, and core suffix `1.11.0-relay.1` as the canonical names. Bump the companion from `0.1.0` to `0.2.0` because this is a breaking pre-1.0 public-surface change.

Keeping `gsd` as an internal wire identity would reduce edits but leave the same ambiguity in diagnostics, project records, and future support. A brand-only rename is therefore rejected.

### 2. Preserve neutral lifecycle entry points

Keep the seven `/opsx:*` workflows unchanged. They describe user intent, are already reconciled through OpenSpec, and do not expose the old product name. Only generated ownership metadata and prose change from GSD to Relay.

Product-prefixed slash commands were rejected because they would add migration cost without improving the workflow vocabulary.

### 3. Use one-way, receipt-backed record migration

When Relay encounters only `.openspec-gsd`, it validates the legacy event log and projections, copies them into a staging directory using Node path APIs, rewrites only the explicitly enumerated identity-bearing fields and references, validates the staged Relay records, then promotes the staging directory to `.openspec-relay`. It retains the legacy directory as rollback and reference evidence and writes a migration receipt into `.openspec-relay` containing source and destination digests.

When both directories exist, Relay accepts `.openspec-relay` as canonical only when its valid receipt matches the retained legacy source. Otherwise it fails closed with recovery guidance. New events are written only to Relay records. Explicit filename lists and schemas govern migration; recursive textual replacement is prohibited.

Deleting the legacy directory immediately was rejected because existing gate evidence may still reference it and rollback would become harder.

### 4. Treat the legacy gate as a migration input, not a second assurance system

The Relay extension registers `relay.assurance` for new runs and a migration-aware evaluator for unresolved legacy `gsd.assurance` records. It preserves legacy results and dispositions and prevents extension relinking from bypassing archive enforcement. After successful record migration, one canonical Relay aggregate result governs new work; any retained legacy gate record remains auditable rather than independently recomputed.

Registering two fully active aggregate gates was rejected because their projections could diverge and require duplicate dispositions.

### 5. Do not preserve executable CLI or Pi aliases by default

The package exposes only `openspec-relay` and `openspec_relay_workflow`. Doctor and startup diagnostics recognize old configured names and provide exact remediation. This makes accidental use visible and avoids two entry points writing the same run.

Long-lived aliases were rejected because the project has not reached 1.0 and currently has one known installation to migrate. Read compatibility is retained where data loss or gate bypass would otherwise be possible.

### 6. Keep the generic OpenSpec seam product-neutral

The core fork changes its build suffix and qualification fixtures from GSD to Relay, but extension discovery, manifests, reconciliation, host capabilities, and archive gates remain generic. Companion policy and migration logic remain in the companion repository.

### 7. Rename GitHub only after qualification

First land and test the source rename, pack both projects locally, install them into an isolated prefix, migrate a copied legacy fixture, qualify Pi and archive gates, and retain rollback artifacts. Then rename `radioflyer28/openspec-guardrails` to `radioflyer28/openspec-relay`, update canonical Git remotes and documentation, and confirm installation from the public URL. GitHub's redirect is a convenience, not the documented canonical location.

## Risks / Trade-offs

- **[Legacy state rewriting corrupts evidence]** → Migrate from schemas and explicit fields into staging, verify digests and projections, retain the source, and test tampered and dual-directory cases.
- **[Renaming the extension bypasses an active gate]** → Keep a migration-aware legacy gate evaluator and require archive-blocking regression tests before relinking the installed package.
- **[Generated ownership reconciliation deletes user files]** → Reconcile by declared contribution ownership and test user-owned collisions before and after the manifest ID change.
- **[Repository rename breaks installations]** → Update Pi to the canonical Git URL after qualification, verify a clean Git install, and retain the old checkout and packed artifacts until the new pairing passes.
- **[Attribution disappears during rebrand]** → Preserve source notices and explain inspiration without calling Relay a GSD distribution.
- **[The two repositories expose mixed versions]** → Qualify and install `1.11.0-relay.1` with `openspec-relay@0.2.0` as an exact pair.

## Migration Plan

1. Capture current core, companion, installed package, Pi link, extension lock, and active legacy-record fixtures; retain the qualified GSD-named tarballs as rollback artifacts.
2. Implement the companion identity and explicit record/gate migration on an isolated branch; update tests and documentation.
3. Rebuild the OpenSpec 1.11 seam package as `1.11.0-relay.1` without changing the generic seam contract.
4. Run complete core, companion, migration, reconciliation, Pi, archive-gate, package, and upstream-survivability qualification without publication.
5. Install both Relay-named artifacts in an isolated prefix and prove fresh-project and copied-legacy-project workflows.
6. Rename the public companion GitHub repository, update source remotes and canonical links, then verify `pi install https://github.com/radioflyer28/openspec-relay` in a clean environment.
7. Replace the user's installed pairing and relink existing projects only after doctor and archive enforcement pass; keep the prior tarballs and Git refs for rollback.
