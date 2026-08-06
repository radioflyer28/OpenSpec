import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerExtensionCommand } from '../../src/commands/extension.js';
import { readExtensionLockfile } from '../../src/core/extensions/index.js';

const coreVersion = '1.9.0';
const hostCapabilities = {
  agentDispatch: false,
  parallelism: false,
  worktrees: false,
  git: false,
  structuredResults: true,
  humanInteraction: true,
};

function manifest(id = 'fixture-extension') {
  return {
    apiVersion: 'openspec.dev/extensions/v1',
    id,
    version: '1.2.3',
    requires: {
      openspec: '>=1.8.0 <2.0.0',
      hostCapabilities: { required: [], optional: ['parallelism'] },
    },
    contributes: {
      workflows: [{
        id: 'fixture-run',
        name: 'Fixture run',
        description: 'Run the fixture workflow',
        entry: 'workflow.md',
        artifactRequirements: [],
        gateDependencies: [],
        requiredHostCapabilities: [],
      }],
      gates: [{
        id: 'fixture.gate',
        module: 'gate.mjs',
        export: 'default',
        timeoutMs: 1000,
        requiredHostCapabilities: [],
      }],
    },
  };
}

describe('extension lifecycle CLI', () => {
  let sandbox: string;
  let projectRoot: string;
  let dataRoot: string;
  let originalCwd: string;
  let log: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    sandbox = await mkdtemp(path.join(os.tmpdir(), 'openspec-extension-cli-'));
    projectRoot = path.join(sandbox, 'project');
    dataRoot = path.join(sandbox, 'data');
    await mkdir(path.join(projectRoot, 'openspec', 'changes'), { recursive: true });
    originalCwd = process.cwd();
    process.chdir(projectRoot);
    process.exitCode = undefined;
    log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    process.exitCode = undefined;
    log.mockRestore();
    error.mockRestore();
    await rm(sandbox, { recursive: true, force: true });
  });

  async function createExtension(id = 'fixture-extension', input: unknown = manifest(id)) {
    const root = path.join(projectRoot, 'extensions', id);
    await mkdir(root, { recursive: true });
    await writeFile(path.join(root, 'openspec-extension.json'), JSON.stringify(input));
    await writeFile(path.join(root, 'workflow.md'), '# Fixture workflow\n');
    await writeFile(path.join(root, 'gate.mjs'), 'export default { evaluate: () => ({}) };\n');
    return root;
  }

  async function run(
    args: string[],
    overrides: Partial<Parameters<typeof registerExtensionCommand>[1]> = {}
  ) {
    const program = new Command().name('openspec');
    registerExtensionCommand(program, {
      coreVersion,
      hostCapabilities,
      globalDataDir: dataRoot,
      ...overrides,
    });
    await program.parseAsync(['node', 'openspec', 'extension', ...args]);
  }

  it('lists an empty project without error', async () => {
    await run(['list']);

    expect(process.exitCode).toBeUndefined();
    expect(log).toHaveBeenCalledWith('No project extensions are installed.');
  });

  it('links a valid extension from a nested project directory', async () => {
    const extensionRoot = await createExtension();
    const nested = path.join(projectRoot, 'src', 'nested');
    await mkdir(nested, { recursive: true });
    process.chdir(nested);

    await run(['link', extensionRoot]);

    const lockfile = await readExtensionLockfile(projectRoot);
    expect(lockfile.extensions['fixture-extension']).toMatchObject({
      source: { kind: 'link', path: path.relative(projectRoot, extensionRoot) },
      version: '1.2.3',
      enabled: true,
    });
    expect(log).toHaveBeenCalledWith(expect.stringContaining(await import('node:fs/promises').then((fs) => fs.realpath(extensionRoot))));
  });

  it('rejects an invalid linked extension without mutating the lockfile', async () => {
    const extensionRoot = await createExtension('broken-extension', { apiVersion: 'wrong' });

    await run(['link', extensionRoot]);

    expect(process.exitCode).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('Unsupported extension API'));
    expect((await readExtensionLockfile(projectRoot)).extensions).toEqual({});
  });

  it('rejects installation when semver matches but the OpenSpec API probe is absent', async () => {
    const packageRoot = await createExtension('package-extension', manifest('package-extension'));

    await run(['install', '@example/package-extension@1.2.3'], {
      extensionApiProvider: {},
      acquire: async () => ({
        packageRoot,
        cacheKey: 'abc123',
        integrity: 'sha512-fixture',
        name: '@example/package-extension',
        version: '1.2.3',
      }),
    });

    expect(process.exitCode).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('API-bearing OpenSpec distribution'));
    expect((await readExtensionLockfile(projectRoot)).extensions).toEqual({});
  });

  it('installs an acquired package and records integrity before reconciliation', async () => {
    const packageRoot = await createExtension('package-extension', manifest('package-extension'));
    const reconcile = vi.fn(async () => undefined);

    await run(['install', '@example/package-extension@1.2.3'], {
      acquire: async () => ({
        packageRoot,
        cacheKey: 'abc123',
        integrity: 'sha512-fixture',
        name: '@example/package-extension',
        version: '1.2.3',
      }),
      reconcile,
    });

    expect((await readExtensionLockfile(projectRoot)).extensions['package-extension']).toMatchObject({
      source: { kind: 'registry', spec: '@example/package-extension@1.2.3' },
      integrity: 'sha512-fixture',
      cacheKey: 'abc123',
      enabled: true,
    });
    expect(reconcile).toHaveBeenCalledOnce();
  });

  it('preserves the lock mutation and diagnoses drift when reconciliation fails', async () => {
    const extensionRoot = await createExtension();
    await run(['link', extensionRoot], {
      reconcile: async () => { throw new Error('adapter write failed'); },
    });

    expect(process.exitCode).toBe(1);
    expect((await readExtensionLockfile(projectRoot)).extensions['fixture-extension']).toBeDefined();
    process.exitCode = undefined;
    await run(['doctor', 'fixture-extension']);
    expect(process.exitCode).toBe(1);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('reconciliation: drifted'));
  });

  it('disables and re-enables an extension without deleting active gate obligations', async () => {
    const extensionRoot = await createExtension();
    await run(['link', extensionRoot]);
    const gatesPath = path.join(projectRoot, 'openspec', 'changes', 'active', '.openspec-gates.json');
    await mkdir(path.dirname(gatesPath), { recursive: true });
    await writeFile(gatesPath, '{"version":1,"gates":[]}\n');

    await run(['disable', 'fixture-extension']);
    expect((await readExtensionLockfile(projectRoot)).extensions['fixture-extension'].enabled).toBe(false);
    expect(await readFile(gatesPath, 'utf8')).toContain('"gates"');

    await run(['enable', 'fixture-extension']);
    expect((await readExtensionLockfile(projectRoot)).extensions['fixture-extension'].enabled).toBe(true);
  });

  it('lists stable contribution summaries for enabled and disabled extensions', async () => {
    const first = await createExtension('z-extension', manifest('z-extension'));
    const second = await createExtension('a-extension', manifest('a-extension'));
    await run(['link', first]);
    await run(['link', second]);
    await run(['disable', 'z-extension']);
    log.mockClear();

    await run(['list']);

    const lines = log.mock.calls.map(([line]) => String(line));
    expect(lines[0]).toContain('a-extension');
    expect(lines[0]).toContain('workflows=1');
    expect(lines[1]).toContain('z-extension');
    expect(lines[1]).toContain('disabled');
  });

  it('reports unknown IDs and unhealthy enabled extensions with a non-zero result', async () => {
    await run(['doctor', 'unknown-extension']);
    expect(process.exitCode).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("Unknown extension 'unknown-extension'"));

    process.exitCode = undefined;
    error.mockClear();
    const extensionRoot = await createExtension();
    await run(['link', extensionRoot]);
    await rm(extensionRoot, { recursive: true, force: true });
    process.exitCode = undefined;
    log.mockClear();

    await run(['doctor']);
    expect(process.exitCode).toBe(1);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('source unavailable'));
  });

  it('doctor distinguishes a missing API probe from semantic-version incompatibility', async () => {
    const extensionRoot = await createExtension();
    await run(['link', extensionRoot]);
    process.exitCode = undefined;
    log.mockClear();

    await run(['doctor', 'fixture-extension'], { extensionApiProvider: {} });

    expect(process.exitCode).toBe(1);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('compatibility=api-unavailable'));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('API-bearing OpenSpec distribution'));
  });
});
