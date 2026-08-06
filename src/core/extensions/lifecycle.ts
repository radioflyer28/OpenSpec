import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getGlobalDataDir } from '../global-config.js';
import { ALL_WORKFLOWS } from '../profiles.js';
import {
  acquireRegistryExtension,
  type AcquiredRegistryExtension,
  type AcquireRegistryExtensionOptions,
} from './acquire.js';
import {
  readExtensionLockfile,
  writeExtensionLockfile,
  type ExtensionLockEntryV1,
  type ExtensionLockfileV1,
} from './lockfile.js';
import { loadExtensionManifestV1 } from './manifest.js';
import { resolveLocalExtensionLink } from './paths.js';
import {
  buildExtensionRegistrySnapshot,
  validateExtensionContributionPaths,
  type ExtensionRegistryDiagnostic,
} from './registry.js';
import {
  extensionLockDigest,
  readExtensionReconciliationRecord,
  reconciliationState,
  writeExtensionReconciliationRecord,
} from './reconciliation.js';
import type { ExtensionManifestV1, HostCapabilitiesV1 } from './types.js';

export const DEFAULT_EXTENSION_HOST_CAPABILITIES: HostCapabilitiesV1 = Object.freeze({
  agentDispatch: false,
  parallelism: false,
  worktrees: false,
  git: false,
  structuredResults: true,
  humanInteraction: true,
});

export interface ExtensionReconcileContext {
  projectRoot: string;
  coreVersion: string;
  hostCapabilities: HostCapabilitiesV1;
  lockfile: ExtensionLockfileV1;
}

export interface ExtensionReconcileResult {
  artifacts: import('./reconciliation.js').ExtensionGeneratedArtifactV1[];
  diagnostics: string[];
}

export type ExtensionWorkflowReconciler = (
  context: ExtensionReconcileContext
) => Promise<ExtensionReconcileResult | void>;

export interface ExtensionLifecycleOptions {
  projectRoot: string;
  coreVersion: string;
  hostCapabilities?: HostCapabilitiesV1;
  globalDataDir?: string;
  acquire?: (options: AcquireRegistryExtensionOptions) => Promise<AcquiredRegistryExtension>;
  reconcile?: ExtensionWorkflowReconciler;
}

export interface ExtensionInspection {
  id: string;
  entry: ExtensionLockEntryV1;
  root?: string;
  manifest?: ExtensionManifestV1;
  sourceState: 'available' | 'unavailable';
  compatibility: 'compatible' | 'incompatible' | 'invalid' | 'unavailable';
  diagnostics: string[];
  registryDiagnostics: ExtensionRegistryDiagnostic[];
  reconciliation: { state: 'ok' | 'drifted'; detail?: string };
}

function manifestError(id: string, diagnostics: { path: string; message: string }[]): Error {
  return new Error(
    `Invalid extension '${id}': ${diagnostics
      .map((diagnostic) => `${diagnostic.path}: ${diagnostic.message}`)
      .join('; ')}`
  );
}

async function readRawManifest(root: string): Promise<unknown> {
  const manifestPath = path.join(root, 'openspec-extension.json');
  try {
    return JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read extension manifest at ${manifestPath}: ${(error as Error).message}`);
  }
}

async function resolvedSourceRoot(
  projectRoot: string,
  globalDataDir: string,
  entry: ExtensionLockEntryV1
): Promise<string> {
  if (entry.source.kind === 'link') {
    return (await resolveLocalExtensionLink(projectRoot, entry.source.path)).canonicalPath;
  }
  if (!entry.cacheKey) throw new Error('Registry extension has no cache key.');
  return fs.realpath(path.join(globalDataDir, 'extensions', 'cache', entry.cacheKey));
}

async function loadValidManifest(
  root: string,
  coreVersion: string,
  expectedId?: string
): Promise<ExtensionManifestV1> {
  const loaded = loadExtensionManifestV1(await readRawManifest(root), coreVersion);
  if (!loaded.manifest) throw manifestError(expectedId ?? '<unknown>', loaded.diagnostics);
  if (expectedId && loaded.manifest.id !== expectedId) {
    throw new Error(
      `Extension lock id '${expectedId}' does not match manifest id '${loaded.manifest.id}'.`
    );
  }
  await validateExtensionContributionPaths(root, loaded.manifest);
  return loaded.manifest;
}

export class ExtensionLifecycleService {
  private readonly projectRoot: string;
  private readonly coreVersion: string;
  private readonly hostCapabilities: HostCapabilitiesV1;
  private readonly globalDataDir: string;
  private readonly acquirePackage: NonNullable<ExtensionLifecycleOptions['acquire']>;
  private readonly reconcileWorkflows: ExtensionWorkflowReconciler;

  constructor(options: ExtensionLifecycleOptions) {
    this.projectRoot = options.projectRoot;
    this.coreVersion = options.coreVersion;
    this.hostCapabilities = options.hostCapabilities ?? DEFAULT_EXTENSION_HOST_CAPABILITIES;
    this.globalDataDir = options.globalDataDir ?? getGlobalDataDir();
    this.acquirePackage = options.acquire ?? acquireRegistryExtension;
    this.reconcileWorkflows = options.reconcile ?? (async (context) => {
      const { reconcileExtensionWorkflows } = await import('./workflows.js');
      return reconcileExtensionWorkflows(context);
    });
  }

  async install(packageSpec: string): Promise<ExtensionInspection> {
    const acquired = await this.acquirePackage({
      packageSpec,
      globalDataDir: this.globalDataDir,
    });
    const manifest = await loadValidManifest(acquired.packageRoot, this.coreVersion);
    if (manifest.version !== acquired.version) {
      throw new Error(
        `Package version '${acquired.version}' does not match extension manifest version '${manifest.version}'.`
      );
    }
    const entry: ExtensionLockEntryV1 = {
      source: { kind: 'registry', spec: packageSpec },
      version: manifest.version,
      integrity: acquired.integrity,
      cacheKey: acquired.cacheKey,
      apiVersion: manifest.apiVersion,
      openspec: manifest.requires.openspec,
      enabled: true,
    };
    await this.replaceEntry(manifest.id, entry);
    return this.inspectOne(manifest.id);
  }

  async link(inputPath: string): Promise<ExtensionInspection> {
    const resolved = await resolveLocalExtensionLink(this.projectRoot, inputPath);
    const manifest = await loadValidManifest(resolved.canonicalPath, this.coreVersion);
    const current = await readExtensionLockfile(this.projectRoot);
    for (const [otherId, entry] of Object.entries(current.extensions)) {
      if (otherId === manifest.id || entry.source.kind !== 'link') continue;
      try {
        const other = await resolveLocalExtensionLink(this.projectRoot, entry.source.path);
        if (other.canonicalPath === resolved.canonicalPath) {
          throw new Error(
            `Extension path is already recorded as '${otherId}', but its manifest declares '${manifest.id}'.`
          );
        }
      } catch (error) {
        if ((error as Error).message.includes('already recorded')) throw error;
        // A stale unrelated link is diagnosed by doctor and must not block this link.
      }
    }
    const entry: ExtensionLockEntryV1 = {
      source: { kind: 'link', path: resolved.lockPath },
      version: manifest.version,
      apiVersion: manifest.apiVersion,
      openspec: manifest.requires.openspec,
      enabled: true,
    };
    await this.replaceEntry(manifest.id, entry);
    return this.inspectOne(manifest.id);
  }

  async enable(id: string): Promise<ExtensionInspection> {
    const lockfile = await readExtensionLockfile(this.projectRoot);
    const entry = lockfile.extensions[id];
    if (!entry) throw new Error(`Unknown extension '${id}'.`);
    const root = await resolvedSourceRoot(this.projectRoot, this.globalDataDir, entry);
    const manifest = await loadValidManifest(root, this.coreVersion, id);
    if (manifest.version !== entry.version) {
      throw new Error(
        `Extension '${id}' lock version '${entry.version}' does not match manifest version '${manifest.version}'.`
      );
    }
    await this.replaceEntry(id, { ...entry, enabled: true });
    return this.inspectOne(id);
  }

  async disable(id: string): Promise<ExtensionInspection> {
    const lockfile = await readExtensionLockfile(this.projectRoot);
    const entry = lockfile.extensions[id];
    if (!entry) throw new Error(`Unknown extension '${id}'.`);
    // Gate obligations are change-local core records. This mutation deliberately
    // touches only the project lockfile and generated workflow reconciliation.
    await this.replaceEntry(id, { ...entry, enabled: false });
    return this.inspectOne(id);
  }

  async list(): Promise<ExtensionInspection[]> {
    const lockfile = await readExtensionLockfile(this.projectRoot);
    return Promise.all(Object.keys(lockfile.extensions).sort().map((id) => this.inspectOne(id)));
  }

  async doctor(id?: string): Promise<ExtensionInspection[]> {
    const lockfile = await readExtensionLockfile(this.projectRoot);
    if (id && !lockfile.extensions[id]) throw new Error(`Unknown extension '${id}'.`);
    const ids = id ? [id] : Object.keys(lockfile.extensions).sort();
    return Promise.all(ids.map((extensionId) => this.inspectOne(extensionId)));
  }

  isHealthy(inspection: ExtensionInspection): boolean {
    if (!inspection.entry.enabled) return true;
    if (inspection.sourceState !== 'available' || inspection.compatibility !== 'compatible') return false;
    if (inspection.reconciliation.state !== 'ok') return false;
    return !inspection.registryDiagnostics.some((diagnostic) =>
      diagnostic.code !== 'extension_optional_capability_unavailable'
    );
  }

  private async replaceEntry(id: string, entry: ExtensionLockEntryV1): Promise<void> {
    const current = await readExtensionLockfile(this.projectRoot);
    const next: ExtensionLockfileV1 = {
      version: 1,
      extensions: { ...current.extensions, [id]: entry },
    };
    await writeExtensionLockfile(this.projectRoot, next);
    const lockDigest = extensionLockDigest(next);
    try {
      const result = await this.reconcileWorkflows({
        projectRoot: this.projectRoot,
        coreVersion: this.coreVersion,
        hostCapabilities: this.hostCapabilities,
        lockfile: next,
      });
      await writeExtensionReconciliationRecord(this.projectRoot, {
        version: 1,
        lockDigest,
        status: 'ok',
        updatedAt: new Date().toISOString(),
        diagnostics: result?.diagnostics ?? [],
        artifacts: result?.artifacts ?? [],
      });
    } catch (error) {
      await writeExtensionReconciliationRecord(this.projectRoot, {
        version: 1,
        lockDigest,
        status: 'error',
        updatedAt: new Date().toISOString(),
        error: (error as Error).message,
        diagnostics: [],
        artifacts: [],
      });
      throw new Error(
        `Extension '${id}' was recorded, but workflow reconciliation failed: ${(error as Error).message}`
      );
    }
  }

  private async inspectOne(id: string): Promise<ExtensionInspection> {
    const lockfile = await readExtensionLockfile(this.projectRoot);
    const entry = lockfile.extensions[id];
    if (!entry) throw new Error(`Unknown extension '${id}'.`);
    const record = await readExtensionReconciliationRecord(this.projectRoot).catch(() => undefined);
    const reconciliation = reconciliationState(lockfile, record);
    const diagnostics: string[] = [];
    let root: string | undefined;
    let manifest: ExtensionManifestV1 | undefined;
    let sourceState: ExtensionInspection['sourceState'] = 'available';
    let compatibility: ExtensionInspection['compatibility'] = 'compatible';

    try {
      root = await resolvedSourceRoot(this.projectRoot, this.globalDataDir, entry);
      const loaded = loadExtensionManifestV1(await readRawManifest(root), this.coreVersion);
      if (!loaded.manifest) {
        diagnostics.push(...loaded.diagnostics.map((item) => `${item.path}: ${item.message}`));
        compatibility = loaded.diagnostics.some((item) => item.code === 'extension_core_incompatible')
          ? 'incompatible'
          : 'invalid';
      } else {
        manifest = loaded.manifest;
        if (manifest.id !== id || manifest.version !== entry.version) {
          compatibility = 'invalid';
          diagnostics.push(
            `lock entry '${id}' ${entry.version} does not match manifest '${manifest.id}' ${manifest.version}`
          );
        }
        await validateExtensionContributionPaths(root, manifest);
      }
    } catch (error) {
      sourceState = 'unavailable';
      compatibility = 'unavailable';
      diagnostics.push((error as Error).message);
    }

    const snapshot = await buildExtensionRegistrySnapshot({
      projectRoot: this.projectRoot,
      coreVersion: this.coreVersion,
      hostCapabilities: this.hostCapabilities,
      globalDataDir: this.globalDataDir,
      builtinIds: { workflows: ALL_WORKFLOWS },
    });
    const registryDiagnostics = snapshot.diagnostics.filter((item) =>
      item.extensionId.split(',').includes(id)
    );
    return {
      id,
      entry,
      ...(root ? { root } : {}),
      ...(manifest ? { manifest } : {}),
      sourceState,
      compatibility,
      diagnostics,
      registryDiagnostics,
      reconciliation,
    };
  }
}
