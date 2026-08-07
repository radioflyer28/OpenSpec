import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  buildExtensionRegistrySnapshot,
  readExtensionReconciliationRecord,
  reconcileProjectExtensionWorkflows,
  updateExtensionLockfile,
  writeExtensionReconciliationRecord,
} from '../../../src/core/extensions/index.js';
import {
  normalizeExtensionWorkflows,
  reconcileExtensionWorkflows,
} from '../../../src/core/extensions/workflows.js';

const hostCapabilities = {
  agentDispatch: false,
  parallelism: false,
  worktrees: false,
  git: false,
  structuredResults: true,
  humanInteraction: true,
};

function manifest(id: string, workflowId = 'fixture-run') {
  return {
    apiVersion: 'openspec.dev/extensions/v1',
    id,
    version: '1.0.0',
    requires: {
      openspec: '>=1.8.0 <2.0.0',
      hostCapabilities: { required: [], optional: [] },
    },
    contributes: {
      workflows: [{
        id: workflowId,
        name: 'Fixture run',
        description: 'Run fixture assurance',
        entry: 'workflow.md',
        artifactRequirements: ['tasks'],
        gateDependencies: ['fixture.gate'],
        requiredHostCapabilities: [],
      }],
      gates: [],
    },
  };
}

describe('extension workflow contributions', () => {
  let projectRoot: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(path.join(os.tmpdir(), 'openspec-extension-workflows-'));
    await mkdir(path.join(projectRoot, 'openspec', 'changes'), { recursive: true });
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  async function addExtension(
    id: string,
    options: { enabled?: boolean; workflowId?: string; body?: string } = {}
  ) {
    const root = path.join(projectRoot, 'extensions', id);
    await mkdir(root, { recursive: true });
    await writeFile(
      path.join(root, 'openspec-extension.json'),
      JSON.stringify(manifest(id, options.workflowId))
    );
    await writeFile(
      path.join(root, 'workflow.md'),
      options.body ?? 'Run this workflow, then invoke /opsx:fixture-run and /opsx:apply.\n'
    );
    await updateExtensionLockfile(projectRoot, id, {
      source: { kind: 'link', path: path.relative(projectRoot, root) },
      version: '1.0.0',
      apiVersion: 'openspec.dev/extensions/v1',
      openspec: '>=1.8.0 <2.0.0',
      enabled: options.enabled ?? true,
    });
    return root;
  }

  async function snapshot() {
    return buildExtensionRegistrySnapshot({
      projectRoot,
      coreVersion: '1.9.0',
      hostCapabilities,
      builtinIds: { workflows: ['apply'] },
    });
  }

  it('is byte-inert when a project has no extension lock or reconciliation record', async () => {
    const builtInPath = path.join(projectRoot, '.claude', 'commands', 'opsx-apply.md');
    const builtIn = Buffer.from('byte-stable built-in workflow\n');
    await mkdir(path.dirname(builtInPath), { recursive: true });
    await writeFile(builtInPath, builtIn);

    const result = await reconcileProjectExtensionWorkflows(projectRoot, '1.8.0-guardrails.1', {
      configuredTools: ['claude'],
      delivery: 'both',
    });

    expect(result).toBeUndefined();
    expect(await readFile(builtInPath)).toEqual(builtIn);
    await expect(readFile(path.join(projectRoot, 'openspec', 'extensions.generated.yaml')))
      .rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('normalizes enabled workflows and omits disabled, conflicted, and unavailable ones', async () => {
    await addExtension('enabled-extension');
    await addExtension('disabled-extension', { enabled: false, workflowId: 'disabled-run' });
    await addExtension('first-conflict', { workflowId: 'shared-run' });
    await addExtension('second-conflict', { workflowId: 'shared-run' });
    await addExtension('core-shadow', { workflowId: 'apply' });
    await updateExtensionLockfile(projectRoot, 'missing-extension', {
      source: { kind: 'link', path: 'missing-extension' },
      version: '1.0.0',
      apiVersion: 'openspec.dev/extensions/v1',
      openspec: '>=1.8.0 <2.0.0',
      enabled: true,
    });

    const normalized = await normalizeExtensionWorkflows(await snapshot());

    expect(normalized).toHaveLength(1);
    expect(normalized[0]).toMatchObject({
      extensionId: 'enabled-extension',
      extensionVersion: '1.0.0',
      workflow: {
        id: 'fixture-run',
        artifactRequirements: ['tasks'],
        gateDependencies: ['fixture.gate'],
      },
      command: {
        id: 'fixture-run',
        name: 'Fixture run',
        description: 'Run fixture assurance',
      },
      skill: { name: 'openspec-fixture-run' },
    });
    expect(normalized[0].command.body).toContain('/opsx:fixture-run');
    expect(normalized[0].skill.instructions).toBe(normalized[0].command.body);
  });

  it('generates through command and skill surfaces with invocation transforms', async () => {
    await addExtension('fixture-extension');
    const builtIn = path.join(projectRoot, '.cursor', 'commands', 'opsx-apply.md');
    await mkdir(path.dirname(builtIn), { recursive: true });
    await writeFile(builtIn, 'user-visible built-in sentinel\n');

    const result = await reconcileExtensionWorkflows({
      projectRoot,
      coreVersion: '1.9.0',
      hostCapabilities,
      lockfile: await import('../../../src/core/extensions/index.js').then((m) =>
        m.readExtensionLockfile(projectRoot)
      ),
    }, {
      configuredTools: ['cursor', 'codex'],
      delivery: 'commands',
    });

    const cursorPath = path.join(projectRoot, '.cursor', 'commands', 'opsx-fixture-run.md');
    const codexPath = path.join(
      projectRoot,
      '.agents',
      'skills',
      'openspec-fixture-run',
      'SKILL.md'
    );
    expect(await readFile(cursorPath, 'utf8')).toContain('/opsx-fixture-run');
    expect(await readFile(cursorPath, 'utf8')).toContain('/opsx-apply');
    expect(await readFile(codexPath, 'utf8')).toContain('$openspec-fixture-run');
    expect(await readFile(codexPath, 'utf8')).toContain('$openspec-apply-change');
    expect(await readFile(builtIn, 'utf8')).toBe('user-visible built-in sentinel\n');
    expect(result.artifacts.map((artifact) => artifact.path).sort()).toEqual(
      [path.relative(projectRoot, cursorPath), path.relative(projectRoot, codexPath)].sort()
    );
    expect(result.artifacts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        extensionId: 'fixture-extension',
        extensionVersion: '1.0.0',
        workflowId: 'fixture-run',
        toolId: 'cursor',
        surface: 'command',
      }),
      expect.objectContaining({ toolId: 'codex', surface: 'skill' }),
    ]));
  });

  it('cleans only unchanged tracked artifacts and preserves modified or untracked files', async () => {
    await addExtension('fixture-extension');
    const context = {
      projectRoot,
      coreVersion: '1.9.0',
      hostCapabilities,
      lockfile: await import('../../../src/core/extensions/index.js').then((m) =>
        m.readExtensionLockfile(projectRoot)
      ),
    };
    const generated = await reconcileExtensionWorkflows(context, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });
    await writeExtensionReconciliationRecord(projectRoot, {
      version: 1,
      lockDigest: 'test-digest',
      status: 'ok',
      updatedAt: new Date().toISOString(),
      diagnostics: [],
      artifacts: generated.artifacts,
    });
    const generatedPath = path.join(projectRoot, generated.artifacts[0].path);
    await writeFile(generatedPath, `${await readFile(generatedPath, 'utf8')}user modification\n`);
    const untrackedPath = path.join(projectRoot, '.cursor', 'commands', 'opsx-untracked.md');
    await writeFile(untrackedPath, 'untracked\n');

    const lockfile = await import('../../../src/core/extensions/index.js').then((m) =>
      m.readExtensionLockfile(projectRoot)
    );
    lockfile.extensions['fixture-extension'].enabled = false;
    await import('../../../src/core/extensions/index.js').then((m) =>
      m.writeExtensionLockfile(projectRoot, lockfile)
    );
    const cleaned = await reconcileExtensionWorkflows({ ...context, lockfile }, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });

    expect(await readFile(generatedPath, 'utf8')).toContain('user modification');
    expect(await readFile(untrackedPath, 'utf8')).toBe('untracked\n');
    expect(cleaned.artifacts).toEqual([]);
    expect(cleaned.diagnostics).toContainEqual(expect.stringContaining('preserved modified'));
    expect((await readExtensionReconciliationRecord(projectRoot))?.artifacts).toHaveLength(1);
  });
});
