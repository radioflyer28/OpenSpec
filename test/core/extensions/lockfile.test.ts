import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ExtensionLockfileV1Schema,
  extensionLockfilePath,
  isExtensionPathContained,
  readExtensionLockfile,
  resolveContainedExtensionPath,
  resolveLocalExtensionLink,
  updateExtensionLockfile,
  writeExtensionLockfile,
} from '../../../src/core/extensions/index.js';

function registryEntry(version = '1.0.0') {
  return {
    source: { kind: 'registry' as const, spec: 'fixture-extension@^1.0.0' },
    version,
    integrity: 'sha512-fixture',
    cacheKey: 'fixture-cache',
    apiVersion: 'openspec.dev/extensions/v1' as const,
    openspec: '>=1.7.0 <2.0.0',
    enabled: true,
  };
}

describe('extension lockfile', () => {
  let projectRoot: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(path.join(os.tmpdir(), 'openspec-extension-lock-'));
    await mkdir(path.join(projectRoot, 'openspec'), { recursive: true });
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  it('returns an empty v1 lockfile when none exists', async () => {
    await expect(readExtensionLockfile(projectRoot)).resolves.toEqual({
      version: 1,
      extensions: {},
    });
  });

  it('writes entries in stable identifier order', async () => {
    await writeExtensionLockfile(projectRoot, {
      version: 1,
      extensions: {
        'zeta-extension': registryEntry(),
        'alpha-extension': registryEntry(),
      },
    });

    const content = await readFile(extensionLockfilePath(projectRoot), 'utf8');
    expect(content.indexOf('alpha-extension:')).toBeLessThan(content.indexOf('zeta-extension:'));
  });

  it('upgrades one exact version while preserving unrelated entries', async () => {
    await writeExtensionLockfile(projectRoot, {
      version: 1,
      extensions: {
        'alpha-extension': registryEntry('1.0.0'),
        'other-extension': registryEntry('1.5.0'),
      },
    });

    await updateExtensionLockfile(projectRoot, 'alpha-extension', registryEntry('1.1.0'));

    const lockfile = await readExtensionLockfile(projectRoot);
    expect(lockfile.extensions['alpha-extension'].version).toBe('1.1.0');
    expect(lockfile.extensions['other-extension'].version).toBe('1.5.0');
  });

  it('rejects malformed lockfiles', async () => {
    await writeFile(extensionLockfilePath(projectRoot), 'version: 1\nextensions:\n  broken: true\n');

    await expect(readExtensionLockfile(projectRoot)).rejects.toThrow(/extensions\.broken/);
  });

  it('validates a replacement before touching the previous lockfile', async () => {
    await writeExtensionLockfile(projectRoot, {
      version: 1,
      extensions: { 'alpha-extension': registryEntry() },
    });
    const before = await readFile(extensionLockfilePath(projectRoot), 'utf8');

    await expect(
      writeExtensionLockfile(projectRoot, {
        version: 1,
        extensions: { INVALID: registryEntry() },
      } as any)
    ).rejects.toThrow();

    await expect(readFile(extensionLockfilePath(projectRoot), 'utf8')).resolves.toBe(before);
  });

  it('rejects unknown lockfile fields', () => {
    expect(
      ExtensionLockfileV1Schema.safeParse({
        version: 1,
        extensions: {},
        lifecycleHooks: {},
      }).success
    ).toBe(false);
  });

  it('canonicalizes links and stores project-internal links relatively', async () => {
    const extensionRoot = path.join(projectRoot, 'extensions', 'fixture');
    await mkdir(extensionRoot, { recursive: true });

    const resolved = await resolveLocalExtensionLink(projectRoot, extensionRoot);

    expect(resolved.canonicalPath).toBe(await realpath(extensionRoot));
    expect(resolved.lockPath).toBe(path.join('extensions', 'fixture'));
  });

  it('deduplicates a symlink alias by canonical identity', async () => {
    const extensionRoot = path.join(projectRoot, 'external-extension');
    const alias = path.join(projectRoot, 'extension-alias');
    await mkdir(extensionRoot);
    await symlink(extensionRoot, alias, process.platform === 'win32' ? 'junction' : 'dir');

    const direct = await resolveLocalExtensionLink(projectRoot, extensionRoot);
    const viaAlias = await resolveLocalExtensionLink(projectRoot, alias);

    expect(viaAlias.canonicalPath).toBe(direct.canonicalPath);
  });

  it('allows contained files and rejects traversal through aliases', async () => {
    const extensionRoot = path.join(projectRoot, 'extension');
    const outsideRoot = path.join(projectRoot, 'outside');
    await mkdir(path.join(extensionRoot, 'workflows'), { recursive: true });
    await mkdir(outsideRoot);
    await writeFile(path.join(extensionRoot, 'workflows', 'run.md'), '# Run\n');
    await writeFile(path.join(outsideRoot, 'escape.md'), '# Escape\n');
    await symlink(outsideRoot, path.join(extensionRoot, 'alias'), process.platform === 'win32' ? 'junction' : 'dir');

    await expect(resolveContainedExtensionPath(extensionRoot, 'workflows/run.md')).resolves.toBe(
      await realpath(path.join(extensionRoot, 'workflows', 'run.md'))
    );
    await expect(resolveContainedExtensionPath(extensionRoot, '../outside/escape.md')).rejects.toThrow(/outside/i);
    await expect(resolveContainedExtensionPath(extensionRoot, path.join('alias', 'escape.md'))).rejects.toThrow(/outside/i);
  });

  it('uses Windows drive and separator semantics for Windows-shaped paths', () => {
    expect(isExtensionPathContained('C:\\Project', 'C:\\Project\\extensions\\fixture')).toBe(true);
    expect(isExtensionPathContained('C:\\Project', 'C:\\Project-other\\fixture')).toBe(false);
    expect(isExtensionPathContained('C:\\Project', 'D:\\Project\\extensions\\fixture')).toBe(false);
    expect(isExtensionPathContained('C:\\Project', 'c:\\project\\extensions\\fixture')).toBe(true);
  });
});
