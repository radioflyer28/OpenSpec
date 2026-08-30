import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
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

function manifest(id: string, workflowId = 'fixture-run', replaces: string[] = []) {
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
        replaces,
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
    options: { enabled?: boolean; workflowId?: string; body?: string; replaces?: string[] } = {}
  ) {
    const root = path.join(projectRoot, 'extensions', id);
    await mkdir(root, { recursive: true });
    await writeFile(
      path.join(root, 'openspec-extension.json'),
      JSON.stringify(manifest(id, options.workflowId, options.replaces))
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

  async function replaceWorkflow(
    extensionRoot: string,
    extensionId: string,
    workflowId: string,
    replaces: string[]
  ): Promise<void> {
    await writeFile(
      path.join(extensionRoot, 'openspec-extension.json'),
      JSON.stringify(manifest(extensionId, workflowId, replaces))
    );
  }

  it('is byte-inert when a project has no extension lock or reconciliation record', async () => {
    const builtInPath = path.join(projectRoot, '.claude', 'commands', 'opsx-apply.md');
    const builtIn = Buffer.from('byte-stable built-in workflow\n');
    await mkdir(path.dirname(builtInPath), { recursive: true });
    await writeFile(builtInPath, builtIn);

    const result = await reconcileProjectExtensionWorkflows(projectRoot, '1.8.0-gsd.1', {
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

  it('keeps replaced workflow identifiers out of discovery and generated surfaces', async () => {
    await addExtension('fixture-extension', {
      workflowId: 'fixture-do',
      replaces: ['fixture-run'],
      body: 'Execute the approved fixture change.\n',
    });

    const registry = await snapshot();
    const normalized = await normalizeExtensionWorkflows(registry);
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

    expect(registry.workflows.map((item) => item.contribution.id)).toEqual(['fixture-do']);
    expect(registry.workflows[0].contribution.replaces).toEqual(['fixture-run']);
    expect(normalized.map((item) => item.command.id)).toEqual(['fixture-do']);
    expect(normalized.map((item) => item.skill.name)).toEqual(['openspec-fixture-do']);
    expect(result.artifacts.map((item) => item.workflowId)).not.toContain('fixture-run');
    await expect(readFile(path.join(projectRoot, '.cursor', 'commands', 'opsx-fixture-run.md')))
      .rejects.toMatchObject({ code: 'ENOENT' });
    await expect(readFile(path.join(
      projectRoot,
      '.agents',
      'skills',
      'openspec-fixture-run',
      'SKILL.md'
    ))).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('recoverably retires an ownership-marked predecessor missing from the ledger', async () => {
    const root = await addExtension('fixture-extension');
    const context = {
      projectRoot,
      coreVersion: '1.9.0',
      hostCapabilities,
      lockfile: await import('../../../src/core/extensions/index.js').then((m) =>
        m.readExtensionLockfile(projectRoot)
      ),
    };
    const legacyPath = path.join(projectRoot, '.cursor', 'commands', 'opsx-fixture-run.md');
    await reconcileExtensionWorkflows(context, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });
    const legacyContent = await readFile(legacyPath, 'utf8');
    await replaceWorkflow(root, 'fixture-extension', 'fixture-do', ['fixture-run']);

    const replaced = await reconcileExtensionWorkflows(context, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });

    await expect(readFile(legacyPath)).rejects.toMatchObject({ code: 'ENOENT' });
    expect(replaced.diagnostics).toContainEqual(expect.stringContaining(
      'Recovered retired extension artifact from .cursor/commands/opsx-fixture-run.md to '
    ));
    const diagnostic = replaced.diagnostics.find((item) => item.startsWith(
      'Recovered retired extension artifact from .cursor/commands/opsx-fixture-run.md to '
    ));
    const recoveryPath = diagnostic?.slice(diagnostic.indexOf(' to ') + 4, -1);
    expect(recoveryPath).toBeTruthy();
    expect(await readFile(path.join(projectRoot, recoveryPath!), 'utf8')).toBe(legacyContent);
    expect(replaced.artifacts.map((item) => item.workflowId)).toEqual(['fixture-do']);
  });

  it('deletes a tracked unchanged predecessor instead of creating recovery content', async () => {
    const root = await addExtension('fixture-extension');
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
      lockDigest: 'legacy-digest',
      status: 'ok',
      updatedAt: new Date().toISOString(),
      diagnostics: [],
      artifacts: generated.artifacts,
    });
    await replaceWorkflow(root, 'fixture-extension', 'fixture-do', ['fixture-run']);

    const replaced = await reconcileExtensionWorkflows(context, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });

    await expect(readFile(path.join(projectRoot, generated.artifacts[0].path)))
      .rejects.toMatchObject({ code: 'ENOENT' });
    expect(replaced.diagnostics).toContain(
      'Deleted unchanged retired extension artifact at .cursor/commands/opsx-fixture-run.md.'
    );
    await expect(readFile(path.join(
      projectRoot,
      'openspec',
      'extension-recovery',
      'fixture-extension',
      'fixture-run',
      'cursor',
      'command'
    ))).rejects.toMatchObject({ code: expect.any(String) });
  });

  it('recoverably retires a modified tracked predecessor', async () => {
    const root = await addExtension('fixture-extension');
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
      lockDigest: 'legacy-digest',
      status: 'ok',
      updatedAt: new Date().toISOString(),
      diagnostics: [],
      artifacts: generated.artifacts,
    });
    const legacyPath = path.join(projectRoot, generated.artifacts[0].path);
    const modified = `${await readFile(legacyPath, 'utf8')}user modification\n`;
    await writeFile(legacyPath, modified);
    await replaceWorkflow(root, 'fixture-extension', 'fixture-do', ['fixture-run']);

    const replaced = await reconcileExtensionWorkflows(context, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });

    const diagnostic = replaced.diagnostics.find((item) => item.startsWith(
      'Recovered retired extension artifact from .cursor/commands/opsx-fixture-run.md to '
    ));
    const recoveryPath = diagnostic?.slice(diagnostic.indexOf(' to ') + 4, -1);
    await expect(readFile(legacyPath)).rejects.toMatchObject({ code: 'ENOENT' });
    expect(await readFile(path.join(projectRoot, recoveryPath!), 'utf8')).toBe(modified);
  });

  it('is idempotent and reuses an identical recovery copy when the predecessor reappears', async () => {
    const root = await addExtension('fixture-extension');
    const context = {
      projectRoot,
      coreVersion: '1.9.0',
      hostCapabilities,
      lockfile: await import('../../../src/core/extensions/index.js').then((m) =>
        m.readExtensionLockfile(projectRoot)
      ),
    };
    const legacyPath = path.join(projectRoot, '.cursor', 'commands', 'opsx-fixture-run.md');
    await reconcileExtensionWorkflows(context, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });
    const legacyContent = await readFile(legacyPath, 'utf8');
    await replaceWorkflow(root, 'fixture-extension', 'fixture-do', ['fixture-run']);
    const first = await reconcileExtensionWorkflows(context, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });
    await writeExtensionReconciliationRecord(projectRoot, {
      version: 1,
      lockDigest: 'replacement-digest',
      status: 'ok',
      updatedAt: new Date().toISOString(),
      diagnostics: first.diagnostics,
      artifacts: first.artifacts,
    });
    const firstDiagnostic = first.diagnostics.find((item) => item.startsWith(
      'Recovered retired extension artifact from .cursor/commands/opsx-fixture-run.md to '
    ));
    const recoveryPath = firstDiagnostic?.slice(firstDiagnostic.indexOf(' to ') + 4, -1);

    const absent = await reconcileExtensionWorkflows(context, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });
    expect(absent.diagnostics.some((item) => item.startsWith('Recovered retired'))).toBe(false);

    await mkdir(path.dirname(legacyPath), { recursive: true });
    await writeFile(legacyPath, legacyContent);
    const recreated = await reconcileExtensionWorkflows(context, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });

    await expect(readFile(legacyPath)).rejects.toMatchObject({ code: 'ENOENT' });
    expect(await readFile(path.join(projectRoot, recoveryPath!), 'utf8')).toBe(legacyContent);
    expect(recreated.diagnostics).toContainEqual(expect.stringContaining(
      `Recovered retired extension artifact from .cursor/commands/opsx-fixture-run.md to ${recoveryPath}`
    ));
  });

  it.each([
    ['unmarked user file', 'user-owned content\n'],
    ['malformed marker', 'content\n<!-- openspec-extension:not-valid -->\n'],
    [
      'marker with malformed version',
      'content\n<!-- openspec-extension:fixture-extension@not-semver/fixture-run/cursor/command -->\n',
    ],
    [
      'different extension marker',
      'content\n<!-- openspec-extension:other-extension@1.0.0/fixture-run/cursor/command -->\n',
    ],
  ])('preserves a %s at the exact retired path', async (_name, content) => {
    const root = await addExtension('fixture-extension', {
      workflowId: 'fixture-do',
      replaces: ['fixture-run'],
    });
    const retiredPath = path.join(projectRoot, '.cursor', 'commands', 'opsx-fixture-run.md');
    await mkdir(path.dirname(retiredPath), { recursive: true });
    await writeFile(retiredPath, content);

    const result = await reconcileExtensionWorkflows({
      projectRoot,
      coreVersion: '1.9.0',
      hostCapabilities,
      lockfile: await import('../../../src/core/extensions/index.js').then((m) =>
        m.readExtensionLockfile(projectRoot)
      ),
    }, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });

    expect(await readFile(retiredPath, 'utf8')).toBe(content);
    expect(result.diagnostics).toContain(
      'Preserved retired-path entry at .cursor/commands/opsx-fixture-run.md; matching extension ownership was not established.'
    );
    expect(root).toBeTruthy();
  });

  it('preserves a retired-path directory as an unsafe entry', async () => {
    await addExtension('fixture-extension', {
      workflowId: 'fixture-do',
      replaces: ['fixture-run'],
    });
    const retiredPath = path.join(projectRoot, '.cursor', 'commands', 'opsx-fixture-run.md');
    await mkdir(retiredPath, { recursive: true });

    const result = await reconcileExtensionWorkflows({
      projectRoot,
      coreVersion: '1.9.0',
      hostCapabilities,
      lockfile: await import('../../../src/core/extensions/index.js').then((m) =>
        m.readExtensionLockfile(projectRoot)
      ),
    }, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });

    expect(result.diagnostics).toContain(
      'Preserved unsafe retired extension entry at .cursor/commands/opsx-fixture-run.md; expected a regular generated file.'
    );
  });

  it.skipIf(process.platform === 'win32')('preserves a retired-path filesystem alias', async () => {
    await addExtension('fixture-extension', {
      workflowId: 'fixture-do',
      replaces: ['fixture-run'],
    });
    const target = path.join(projectRoot, 'user-target.md');
    const retiredPath = path.join(projectRoot, '.cursor', 'commands', 'opsx-fixture-run.md');
    await writeFile(target, 'user target\n');
    await mkdir(path.dirname(retiredPath), { recursive: true });
    await symlink(target, retiredPath);

    const result = await reconcileExtensionWorkflows({
      projectRoot,
      coreVersion: '1.9.0',
      hostCapabilities,
      lockfile: await import('../../../src/core/extensions/index.js').then((m) =>
        m.readExtensionLockfile(projectRoot)
      ),
    }, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });

    expect(await readFile(retiredPath, 'utf8')).toBe('user target\n');
    expect(result.diagnostics).toContainEqual(expect.stringContaining(
      'Preserved unsafe retired extension entry at .cursor/commands/opsx-fixture-run.md'
    ));
  });

  it('preserves a candidate that collides with another active generated workflow', async () => {
    await addExtension('successor-extension', {
      workflowId: 'fixture-do',
      replaces: ['fixture-run'],
    });
    await addExtension('current-owner', { workflowId: 'fixture-run' });

    const result = await reconcileExtensionWorkflows({
      projectRoot,
      coreVersion: '1.9.0',
      hostCapabilities,
      lockfile: await import('../../../src/core/extensions/index.js').then((m) =>
        m.readExtensionLockfile(projectRoot)
      ),
    }, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });

    const activePath = path.join(projectRoot, '.cursor', 'commands', 'opsx-fixture-run.md');
    expect(await readFile(activePath, 'utf8')).toContain(
      '<!-- openspec-extension:current-owner@1.0.0/fixture-run/cursor/command -->'
    );
    expect(result.diagnostics).toContain(
      'Preserved retired-path entry at .cursor/commands/opsx-fixture-run.md; the path is active for another generated workflow.'
    );
  });

  it('does not overwrite a non-identical recovery collision', async () => {
    const root = await addExtension('fixture-extension');
    const context = {
      projectRoot,
      coreVersion: '1.9.0',
      hostCapabilities,
      lockfile: await import('../../../src/core/extensions/index.js').then((m) =>
        m.readExtensionLockfile(projectRoot)
      ),
    };
    const retiredPath = path.join(projectRoot, '.cursor', 'commands', 'opsx-fixture-run.md');
    await reconcileExtensionWorkflows(context, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });
    const retiredContent = await readFile(retiredPath, 'utf8');
    const recoveryPath = path.join(
      projectRoot,
      'openspec',
      'extension-recovery',
      'fixture-extension',
      'fixture-run',
      'cursor',
      'command',
      `${createHash('sha256').update(retiredContent).digest('hex')}-opsx-fixture-run.md`
    );
    await mkdir(path.dirname(recoveryPath), { recursive: true });
    await writeFile(recoveryPath, 'collision content\n');
    await replaceWorkflow(root, 'fixture-extension', 'fixture-do', ['fixture-run']);

    const result = await reconcileExtensionWorkflows(context, {
      configuredTools: ['cursor'],
      delivery: 'commands',
    });

    expect(await readFile(retiredPath, 'utf8')).toBe(retiredContent);
    expect(await readFile(recoveryPath, 'utf8')).toBe('collision content\n');
    expect(result.diagnostics).toContainEqual(expect.stringContaining(
      'recovery collision at openspec/extension-recovery/fixture-extension/fixture-run/cursor/command/'
    ));
  });

  it('derives exact command and skill retirement paths for configured hosts', async () => {
    await addExtension('fixture-extension', {
      workflowId: 'fixture-do',
      replaces: ['fixture-run'],
    });
    const marker = (tool: string, surface: string) =>
      `legacy\n<!-- openspec-extension:fixture-extension@0.9.0/fixture-run/${tool}/${surface} -->\n`;
    const retiredPaths = [
      [path.join('.cursor', 'commands', 'opsx-fixture-run.md'), marker('cursor', 'command')],
      [path.join('.cursor', 'skills', 'openspec-fixture-run', 'SKILL.md'), marker('cursor', 'skill')],
      [path.join('.pi', 'prompts', 'opsx-fixture-run.md'), marker('pi', 'command')],
      [path.join('.pi', 'skills', 'openspec-fixture-run', 'SKILL.md'), marker('pi', 'skill')],
    ] as const;
    for (const [relativePath, content] of retiredPaths) {
      const absolutePath = path.join(projectRoot, relativePath);
      await mkdir(path.dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, content);
    }

    await reconcileExtensionWorkflows({
      projectRoot,
      coreVersion: '1.9.0',
      hostCapabilities,
      lockfile: await import('../../../src/core/extensions/index.js').then((m) =>
        m.readExtensionLockfile(projectRoot)
      ),
    }, {
      configuredTools: ['cursor', 'pi'],
      delivery: 'both',
    });

    for (const [relativePath] of retiredPaths) {
      await expect(readFile(path.join(projectRoot, relativePath)))
        .rejects.toMatchObject({ code: 'ENOENT' });
    }
    expect(await readFile(path.join(projectRoot, '.cursor', 'commands', 'opsx-fixture-do.md'), 'utf8'))
      .toContain('fixture-do');
    expect(await readFile(path.join(projectRoot, '.pi', 'prompts', 'opsx-fixture-do.md'), 'utf8'))
      .toContain('fixture-do');
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
