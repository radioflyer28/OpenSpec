import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  acquireRegistryExtension,
  buildExtensionRegistrySnapshot,
  updateExtensionLockfile,
} from '../../../src/core/extensions/index.js';

const hostCapabilities = {
  agentDispatch: false,
  parallelism: false,
  worktrees: false,
  git: true,
  structuredResults: true,
  humanInteraction: true,
};

function manifest(id: string, workflowId = `${id}-run`) {
  return {
    apiVersion: 'openspec.dev/extensions/v1',
    id,
    version: '1.0.0',
    requires: {
      openspec: '>=1.7.0 <2.0.0',
      hostCapabilities: { required: [], optional: ['parallelism'] },
    },
    contributes: {
      workflows: [
        {
          id: workflowId,
          name: workflowId,
          description: `Workflow ${workflowId}`,
          entry: 'workflow.md',
          artifactRequirements: [],
          gateDependencies: [],
          requiredHostCapabilities: [],
        },
      ],
      schemas: [],
      commands: [],
      gates: [
        {
          id: `${id}.gate`,
          module: 'gate.mjs',
          export: 'default',
          timeoutMs: 1000,
          requiredHostCapabilities: [],
        },
      ],
    },
  };
}

describe('extension registry snapshot', () => {
  let projectRoot: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(path.join(os.tmpdir(), 'openspec-extension-registry-'));
    await mkdir(path.join(projectRoot, 'openspec'), { recursive: true });
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  async function linkFixture(
    id: string,
    input = manifest(id),
    enabled = true
  ): Promise<string> {
    const root = path.join(projectRoot, 'fixtures', id);
    await mkdir(root, { recursive: true });
    await writeFile(path.join(root, 'openspec-extension.json'), JSON.stringify(input));
    await writeFile(path.join(root, 'workflow.md'), '# Workflow\n');
    await writeFile(path.join(root, 'gate.mjs'), 'export default () => ({})\n');
    await updateExtensionLockfile(projectRoot, id, {
      source: { kind: 'link', path: path.relative(projectRoot, root) },
      version: '1.0.0',
      apiVersion: 'openspec.dev/extensions/v1',
      openspec: '>=1.7.0 <2.0.0',
      enabled,
    });
    return root;
  }

  it('loads enabled extensions, omits disabled ones, and reports optional capability degradation', async () => {
    await linkFixture('enabled-extension');
    await linkFixture('disabled-extension', manifest('disabled-extension'), false);

    const snapshot = await buildExtensionRegistrySnapshot({
      projectRoot,
      coreVersion: '1.7.0',
      hostCapabilities,
    });

    expect(snapshot.extensions.map((item) => item.manifest.id)).toEqual(['enabled-extension']);
    expect(snapshot.workflows.map((item) => item.contribution.id)).toEqual(['enabled-extension-run']);
    expect(snapshot.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'extension_optional_capability_unavailable' })
    );
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it('removes extension-to-extension workflow conflicts from the snapshot', async () => {
    await linkFixture('first-extension', manifest('first-extension', 'shared-run'));
    await linkFixture('second-extension', manifest('second-extension', 'shared-run'));

    const snapshot = await buildExtensionRegistrySnapshot({ projectRoot, coreVersion: '1.7.0', hostCapabilities });

    expect(snapshot.workflows).toEqual([]);
    expect(snapshot.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'extension_contribution_conflict', contributionId: 'shared-run' })
    );
  });

  it('does not allow an extension workflow to shadow a built-in workflow', async () => {
    await linkFixture('shadow-extension', manifest('shadow-extension', 'apply'));

    const snapshot = await buildExtensionRegistrySnapshot({
      projectRoot,
      coreVersion: '1.7.0',
      hostCapabilities,
      builtinIds: { workflows: ['apply'] },
    });

    expect(snapshot.workflows).toEqual([]);
    expect(snapshot.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'extension_builtin_conflict', contributionId: 'apply' })
    );
  });

  it('fails closed when a manifest-level required capability is unavailable', async () => {
    const required = manifest('parallel-extension');
    required.requires.hostCapabilities.required = ['parallelism'];
    required.requires.hostCapabilities.optional = [];
    await linkFixture('parallel-extension', required);

    const snapshot = await buildExtensionRegistrySnapshot({ projectRoot, coreVersion: '1.7.0', hostCapabilities });

    expect(snapshot.extensions).toEqual([]);
    expect(snapshot.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'extension_required_capability_unavailable' })
    );
  });

  it('reports missing linked packages without breaking unrelated core operations', async () => {
    await updateExtensionLockfile(projectRoot, 'missing-extension', {
      source: { kind: 'link', path: 'missing' },
      version: '1.0.0',
      apiVersion: 'openspec.dev/extensions/v1',
      openspec: '>=1.7.0 <2.0.0',
      enabled: true,
    });

    const snapshot = await buildExtensionRegistrySnapshot({ projectRoot, coreVersion: '1.7.0', hostCapabilities });

    expect(snapshot.extensions).toEqual([]);
    expect(snapshot.diagnostics).toContainEqual(expect.objectContaining({ code: 'extension_source_unavailable' }));
    expect(() => snapshot.requireGate('missing.gate')).toThrow(/required gate/i);
  });
});

describe('registry package acquisition', () => {
  let dataRoot: string;

  beforeEach(async () => {
    dataRoot = await mkdtemp(path.join(os.tmpdir(), 'openspec-extension-cache-'));
  });

  afterEach(async () => {
    await rm(dataRoot, { recursive: true, force: true });
  });

  it('uses ignore-scripts and caches the package by integrity', async () => {
    const calls: string[][] = [];
    const runner = async (command: string, args: string[]) => {
      calls.push([command, ...args]);
      if (args[0] === 'pack') {
        await writeFile(path.join(args[args.indexOf('--pack-destination') + 1], 'fixture.tgz'), 'fixture');
        return JSON.stringify([
          {
            filename: 'fixture.tgz',
            integrity: 'sha512-fixture-integrity',
            name: 'fixture-extension',
            version: '1.0.0',
          },
        ]);
      }

      const prefix = args[args.indexOf('--prefix') + 1];
      const packageRoot = path.join(prefix, 'node_modules', 'fixture-extension');
      await mkdir(packageRoot, { recursive: true });
      await writeFile(path.join(packageRoot, 'openspec-extension.json'), '{}');
      return '';
    };

    const acquired = await acquireRegistryExtension({
      packageSpec: 'fixture-extension@1.0.0',
      globalDataDir: dataRoot,
      runner,
    });

    expect(acquired.integrity).toBe('sha512-fixture-integrity');
    expect(await readFile(path.join(acquired.packageRoot, 'openspec-extension.json'), 'utf8')).toBe('{}');
    expect(calls.flat()).toContain('--ignore-scripts');
    expect(calls.flat()).not.toContain('run-script');
  });
});
