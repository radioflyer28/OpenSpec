import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getGlobalDataDir } from '../global-config.js';
import { readExtensionLockfile, type ExtensionLockEntryV1 } from './lockfile.js';
import { loadExtensionManifestV1 } from './manifest.js';
import { resolveContainedExtensionPath, resolveLocalExtensionLink } from './paths.js';
import type {
  CommandContributionV1,
  ExtensionManifestV1,
  GateContributionV1,
  HostCapabilitiesV1,
  SchemaContributionV1,
  WorkflowContributionV1,
} from './types.js';

export type ExtensionContributionKind = 'workflows' | 'schemas' | 'commands' | 'gates';

export interface ExtensionRegistryDiagnostic {
  code:
    | 'extension_source_unavailable'
    | 'extension_manifest_invalid'
    | 'extension_lock_mismatch'
    | 'extension_required_capability_unavailable'
    | 'extension_optional_capability_unavailable'
    | 'extension_contribution_capability_unavailable'
    | 'extension_contribution_conflict'
    | 'extension_builtin_conflict';
  extensionId: string;
  message: string;
  contributionKind?: ExtensionContributionKind;
  contributionId?: string;
}

export interface ResolvedExtensionV1 {
  root: string;
  manifest: ExtensionManifestV1;
  lockEntry: ExtensionLockEntryV1;
}

export interface ResolvedContributionV1<T> {
  extensionId: string;
  extensionVersion: string;
  extensionRoot: string;
  contribution: T;
}

export interface ExtensionRegistrySnapshot {
  extensions: readonly ResolvedExtensionV1[];
  workflows: readonly ResolvedContributionV1<WorkflowContributionV1>[];
  schemas: readonly ResolvedContributionV1<SchemaContributionV1>[];
  commands: readonly ResolvedContributionV1<CommandContributionV1>[];
  gates: readonly ResolvedContributionV1<GateContributionV1>[];
  diagnostics: readonly ExtensionRegistryDiagnostic[];
  requireGate(id: string): ResolvedContributionV1<GateContributionV1>;
}

export interface BuildExtensionRegistryOptions {
  projectRoot: string;
  coreVersion: string;
  hostCapabilities: HostCapabilitiesV1;
  globalDataDir?: string;
  builtinIds?: Partial<Record<ExtensionContributionKind, readonly string[]>>;
}

function missingCapabilities(required: readonly string[], available: HostCapabilitiesV1): string[] {
  return required.filter((capability) => !available[capability as keyof HostCapabilitiesV1]);
}

async function extensionRoot(
  projectRoot: string,
  globalDataDir: string,
  entry: ExtensionLockEntryV1
): Promise<string> {
  if (entry.source.kind === 'link') {
    return (await resolveLocalExtensionLink(projectRoot, entry.source.path)).canonicalPath;
  }
  if (!entry.cacheKey) throw new Error('Registry lock entry has no cache key.');
  return fs.realpath(path.join(globalDataDir, 'extensions', 'cache', entry.cacheKey));
}

export async function validateExtensionContributionPaths(
  root: string,
  manifest: ExtensionManifestV1
): Promise<void> {
  for (const workflow of manifest.contributes.workflows) {
    await resolveContainedExtensionPath(root, workflow.entry);
  }
  for (const schema of manifest.contributes.schemas) {
    await resolveContainedExtensionPath(root, schema.path);
  }
  for (const command of manifest.contributes.commands) {
    await resolveContainedExtensionPath(root, command.entry);
  }
  for (const gate of manifest.contributes.gates) {
    await resolveContainedExtensionPath(root, gate.module);
  }
}

function resolveContributionConflicts<T extends { id: string }>(
  kind: ExtensionContributionKind,
  candidates: ResolvedContributionV1<T>[],
  builtinIds: readonly string[],
  diagnostics: ExtensionRegistryDiagnostic[]
): readonly ResolvedContributionV1<T>[] {
  const builtins = new Set(builtinIds);
  const byId = new Map<string, ResolvedContributionV1<T>[]>();
  for (const candidate of candidates) {
    const existing = byId.get(candidate.contribution.id) ?? [];
    existing.push(candidate);
    byId.set(candidate.contribution.id, existing);
  }

  const resolved: ResolvedContributionV1<T>[] = [];
  for (const [id, providers] of [...byId.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    if (builtins.has(id)) {
      for (const provider of providers) {
        diagnostics.push({
          code: 'extension_builtin_conflict',
          extensionId: provider.extensionId,
          contributionKind: kind,
          contributionId: id,
          message: `Extension '${provider.extensionId}' cannot shadow built-in ${kind} contribution '${id}'.`,
        });
      }
      continue;
    }
    if (providers.length > 1) {
      diagnostics.push({
        code: 'extension_contribution_conflict',
        extensionId: providers.map((provider) => provider.extensionId).sort().join(','),
        contributionKind: kind,
        contributionId: id,
        message: `Multiple extensions contribute ${kind} identifier '${id}': ${providers
          .map((provider) => provider.extensionId)
          .sort()
          .join(', ')}.`,
      });
      continue;
    }
    resolved.push(providers[0]);
  }
  return Object.freeze(resolved.map((item) => Object.freeze(item)));
}

export async function buildExtensionRegistrySnapshot(
  options: BuildExtensionRegistryOptions
): Promise<ExtensionRegistrySnapshot> {
  const lockfile = await readExtensionLockfile(options.projectRoot);
  const dataRoot = options.globalDataDir ?? getGlobalDataDir();
  const diagnostics: ExtensionRegistryDiagnostic[] = [];
  const extensions: ResolvedExtensionV1[] = [];
  const candidates = {
    workflows: [] as ResolvedContributionV1<WorkflowContributionV1>[],
    schemas: [] as ResolvedContributionV1<SchemaContributionV1>[],
    commands: [] as ResolvedContributionV1<CommandContributionV1>[],
    gates: [] as ResolvedContributionV1<GateContributionV1>[],
  };

  for (const [extensionId, entry] of Object.entries(lockfile.extensions)) {
    if (!entry.enabled) continue;
    let root: string;
    let rawManifest: unknown;
    try {
      root = await extensionRoot(options.projectRoot, dataRoot, entry);
      rawManifest = JSON.parse(await fs.readFile(path.join(root, 'openspec-extension.json'), 'utf8'));
    } catch (error) {
      diagnostics.push({
        code: 'extension_source_unavailable',
        extensionId,
        message: `Extension '${extensionId}' source is unavailable: ${(error as Error).message}`,
      });
      continue;
    }

    const loaded = loadExtensionManifestV1(rawManifest, options.coreVersion);
    if (!loaded.manifest) {
      diagnostics.push(
        ...loaded.diagnostics.map((diagnostic) => ({
          code: 'extension_manifest_invalid' as const,
          extensionId,
          message: `${diagnostic.path}: ${diagnostic.message}`,
        }))
      );
      continue;
    }
    const manifest = loaded.manifest;
    if (manifest.id !== extensionId || manifest.version !== entry.version) {
      diagnostics.push({
        code: 'extension_lock_mismatch',
        extensionId,
        message: `Lock entry '${extensionId}' ${entry.version} does not match manifest '${manifest.id}' ${manifest.version}.`,
      });
      continue;
    }

    try {
      await validateExtensionContributionPaths(root, manifest);
    } catch (error) {
      diagnostics.push({
        code: 'extension_manifest_invalid',
        extensionId,
        message: (error as Error).message,
      });
      continue;
    }

    const missingRequired = missingCapabilities(
      manifest.requires.hostCapabilities.required,
      options.hostCapabilities
    );
    if (missingRequired.length > 0) {
      diagnostics.push({
        code: 'extension_required_capability_unavailable',
        extensionId,
        message: `Extension '${extensionId}' requires unavailable host capabilities: ${missingRequired.join(', ')}.`,
      });
      continue;
    }
    const missingOptional = missingCapabilities(
      manifest.requires.hostCapabilities.optional,
      options.hostCapabilities
    );
    if (missingOptional.length > 0) {
      diagnostics.push({
        code: 'extension_optional_capability_unavailable',
        extensionId,
        message: `Extension '${extensionId}' optional host capabilities are unavailable: ${missingOptional.join(', ')}.`,
      });
    }

    const resolvedExtension = Object.freeze({ root, manifest, lockEntry: entry });
    extensions.push(resolvedExtension);
    for (const kind of ['workflows', 'schemas', 'commands', 'gates'] as const) {
      for (const contribution of manifest.contributes[kind]) {
        const required = 'requiredHostCapabilities' in contribution
          ? contribution.requiredHostCapabilities
          : [];
        const missing = missingCapabilities(required, options.hostCapabilities);
        if (missing.length > 0) {
          diagnostics.push({
            code: 'extension_contribution_capability_unavailable',
            extensionId,
            contributionKind: kind,
            contributionId: contribution.id,
            message: `${kind} contribution '${contribution.id}' requires unavailable host capabilities: ${missing.join(', ')}.`,
          });
          continue;
        }
        (candidates[kind] as ResolvedContributionV1<typeof contribution>[]).push({
          extensionId,
          extensionVersion: manifest.version,
          extensionRoot: root,
          contribution,
        });
      }
    }
  }

  const workflows = resolveContributionConflicts(
    'workflows',
    candidates.workflows,
    options.builtinIds?.workflows ?? [],
    diagnostics
  );
  const schemas = resolveContributionConflicts(
    'schemas',
    candidates.schemas,
    options.builtinIds?.schemas ?? [],
    diagnostics
  );
  const commands = resolveContributionConflicts(
    'commands',
    candidates.commands,
    options.builtinIds?.commands ?? [],
    diagnostics
  );
  const gates = resolveContributionConflicts(
    'gates',
    candidates.gates,
    options.builtinIds?.gates ?? [],
    diagnostics
  );

  const snapshot: ExtensionRegistrySnapshot = {
    extensions: Object.freeze(extensions),
    workflows,
    schemas,
    commands,
    gates,
    diagnostics: Object.freeze(diagnostics),
    requireGate(id) {
      const gate = gates.find((candidate) => candidate.contribution.id === id);
      if (!gate) throw new Error(`Required gate '${id}' is unavailable in the extension registry.`);
      return gate;
    },
  };
  return Object.freeze(snapshot);
}
