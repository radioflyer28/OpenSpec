import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArchiveCommand } from '../../src/core/archive.js';
import {
  acceptRequiredGate,
  evaluateRequiredGates,
  readRequiredGateRecord,
  registerRequiredGate,
  updateExtensionLockfile,
} from '../../src/core/extensions/index.js';
import { Validator } from '../../src/core/validation/validator.js';

const hostCapabilities = {
  agentDispatch: false,
  parallelism: false,
  worktrees: false,
  git: false,
  structuredResults: true,
  humanInteraction: true,
};

describe('archive extension gate enforcement', () => {
  let projectRoot: string;
  let originalCwd: string;
  let log: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    projectRoot = await mkdtemp(path.join(os.tmpdir(), 'openspec-archive-gates-'));
    await mkdir(path.join(projectRoot, 'openspec', 'changes', 'archive'), { recursive: true });
    await mkdir(path.join(projectRoot, 'openspec', 'specs'), { recursive: true });
    await writeFile(path.join(projectRoot, 'openspec', 'config.yaml'), 'schema: spec-driven\n');
    originalCwd = process.cwd();
    process.chdir(projectRoot);
    process.exitCode = undefined;
    log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    process.exitCode = undefined;
    log.mockRestore();
    vi.restoreAllMocks();
    await rm(projectRoot, { recursive: true, force: true });
  });

  async function createChange(name: string) {
    const changeDir = path.join(projectRoot, 'openspec', 'changes', name);
    await mkdir(changeDir, { recursive: true });
    await writeFile(path.join(changeDir, 'proposal.md'), '# Proposal\n');
    await writeFile(path.join(changeDir, 'tasks.md'), '- [x] done\n');
    return changeDir;
  }

  async function installGate(gateId: string, status: string, summary = status) {
    const extensionRoot = path.join(projectRoot, 'extensions', 'archive-gates');
    await mkdir(extensionRoot, { recursive: true });
    await writeFile(
      path.join(extensionRoot, 'gate.mjs'),
      `export default { evaluate: () => ({ gateId: '${gateId}', status: '${status}', summary: '${summary}', evidence: ['report.json'], remediation: ['resolve ${gateId}'] }) };`
    );
    await writeFile(path.join(extensionRoot, 'openspec-extension.json'), JSON.stringify({
      apiVersion: 'openspec.dev/extensions/v1',
      id: 'archive-gates',
      version: '1.0.0',
      requires: {
        openspec: '>=1.7.0 <2.0.0',
        hostCapabilities: { required: [], optional: [] },
      },
      contributes: {
        workflows: [], schemas: [], commands: [],
        gates: [{
          id: gateId,
          module: 'gate.mjs',
          export: 'default',
          timeoutMs: 1000,
          requiredHostCapabilities: [],
        }],
      },
    }));
    await updateExtensionLockfile(projectRoot, 'archive-gates', {
      source: { kind: 'link', path: path.relative(projectRoot, extensionRoot) },
      version: '1.0.0',
      apiVersion: 'openspec.dev/extensions/v1',
      openspec: '>=1.7.0 <2.0.0',
      enabled: true,
    });
  }

  async function requireGate(changeDir: string, gateId: string) {
    await registerRequiredGate(changeDir, {
      extensionId: 'archive-gates',
      extensionVersion: '1.0.0',
      gateId,
      workflowId: 'run',
    });
  }

  it('preserves existing archive behavior when no gate record exists', async () => {
    await createChange('ungated');

    await new ArchiveCommand().execute('ungated', {
      yes: true, noValidate: true, skipSpecs: true,
    });

    await expect(readFile(path.join(projectRoot, 'openspec', 'changes', 'ungated', 'proposal.md')))
      .rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('blocks a failing gate before validation or any archive mutation', async () => {
    const changeDir = await createChange('failing');
    await installGate('assurance.gate', 'fail', 'Assurance is incomplete');
    await requireGate(changeDir, 'assurance.gate');
    const validation = vi.spyOn(Validator.prototype, 'validateChangeDeltaSpecs');

    await expect(new ArchiveCommand().execute('failing', { yes: true, skipSpecs: true }))
      .rejects.toMatchObject({
        diagnostic: expect.objectContaining({
          code: 'archive_gate_blocked',
          gateId: 'assurance.gate',
          gateStatus: 'fail',
        }),
      });

    expect(validation).not.toHaveBeenCalled();
    expect(await readFile(path.join(changeDir, 'proposal.md'), 'utf8')).toContain('Proposal');
  });

  it('continues for pass and warn results and moves the gate audit with the change', async () => {
    const changeDir = await createChange('warning');
    await installGate('warning.gate', 'warn', 'Review recommended');
    await requireGate(changeDir, 'warning.gate');

    await new ArchiveCommand().execute('warning', {
      yes: true, noValidate: true, skipSpecs: true,
    });

    const archiveRoot = path.join(projectRoot, 'openspec', 'changes', 'archive');
    const archivedName = (await import('node:fs/promises')).readdir(archiveRoot).then((names) =>
      names.find((name) => name.endsWith('-warning'))!
    );
    const archivedRecord = await readRequiredGateRecord(path.join(archiveRoot, await archivedName));
    expect(archivedRecord.gates[0].lastResult?.status).toBe('warn');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('warning.gate'));
  });

  it('honors only fresh human acceptance', async () => {
    const changeDir = await createChange('human');
    await installGate('human.gate', 'human_needed', 'Manual review required');
    await requireGate(changeDir, 'human.gate');
    await evaluateRequiredGates({
      projectRoot,
      changeName: 'human',
      coreVersion: '1.7.0',
      hostCapabilities,
    });
    await acceptRequiredGate(changeDir, 'human.gate', { actor: 'reviewer' });

    await expect(new ArchiveCommand().execute('human', {
      yes: true, noValidate: true, skipSpecs: true,
    })).resolves.toBeUndefined();
  });

  it('requires paired override options and rejects unknown or partial coverage', async () => {
    const changeDir = await createChange('override-invalid');
    await installGate('blocking.gate', 'fail');
    await requireGate(changeDir, 'blocking.gate');

    await expect(new ArchiveCommand().execute('override-invalid', {
      yes: true, noValidate: true, skipSpecs: true, overrideGate: 'blocking.gate',
    })).rejects.toMatchObject({ diagnostic: expect.objectContaining({ code: 'archive_gate_override_invalid' }) });
    await expect(new ArchiveCommand().execute('override-invalid', {
      yes: true, noValidate: true, skipSpecs: true, reason: 'because',
    })).rejects.toMatchObject({ diagnostic: expect.objectContaining({ code: 'archive_gate_override_invalid' }) });
    await expect(new ArchiveCommand().execute('override-invalid', {
      yes: true, noValidate: true, skipSpecs: true, overrideGate: 'blocking.gate', reason: '   ',
    })).rejects.toMatchObject({ diagnostic: expect.objectContaining({ code: 'archive_gate_override_invalid' }) });
    await expect(new ArchiveCommand().execute('override-invalid', {
      yes: true, noValidate: true, skipSpecs: true,
      overrideGate: 'unknown.gate', reason: 'because',
    })).rejects.toMatchObject({
      diagnostic: expect.objectContaining({
        code: 'archive_gate_override_invalid',
        blockingGates: ['blocking.gate'],
      }),
    });
  });

  it('records a reasoned override and actor before moving the change', async () => {
    const changeDir = await createChange('overridden');
    await installGate('blocking.gate', 'fail', 'Known release exception');
    await requireGate(changeDir, 'blocking.gate');
    process.env.OPENSPEC_ACTOR = 'release-operator';
    try {
      await new ArchiveCommand().execute('overridden', {
        yes: true,
        noValidate: true,
        skipSpecs: true,
        overrideGate: 'blocking.gate',
        reason: 'Approved emergency release',
      });
    } finally {
      delete process.env.OPENSPEC_ACTOR;
    }

    const archiveRoot = path.join(projectRoot, 'openspec', 'changes', 'archive');
    const archivedName = (await (await import('node:fs/promises')).readdir(archiveRoot))
      .find((name) => name.endsWith('-overridden'))!;
    const record = await readRequiredGateRecord(path.join(archiveRoot, archivedName));
    expect(record.gates[0].overrides[0]).toMatchObject({
      reason: 'Approved emergency release',
      actor: 'release-operator',
      result: expect.objectContaining({ status: 'fail', summary: 'Known release exception' }),
    });
  });

  it('keeps archive blocked when an override covers only one of multiple blockers', async () => {
    const changeDir = await createChange('partially-overridden');
    await installGate('blocking.gate', 'fail');
    await requireGate(changeDir, 'blocking.gate');
    await requireGate(changeDir, 'missing.gate');

    await expect(new ArchiveCommand().execute('partially-overridden', {
      yes: true,
      noValidate: true,
      skipSpecs: true,
      overrideGate: 'blocking.gate',
      reason: 'Only this exception is approved',
    })).rejects.toMatchObject({
      diagnostic: expect.objectContaining({
        code: 'archive_gate_blocked',
        gateId: 'missing.gate',
        blockingGates: ['missing.gate'],
      }),
    });
    expect(await readFile(path.join(changeDir, 'proposal.md'), 'utf8')).toContain('Proposal');
  });

  it('returns one structured JSON document for gate blocking', async () => {
    const changeDir = await createChange('json-blocked');
    await installGate('blocking.gate', 'fail', 'Not ready');
    await requireGate(changeDir, 'blocking.gate');

    await new ArchiveCommand().execute('json-blocked', {
      yes: true, noValidate: true, skipSpecs: true, json: true,
    });

    expect(log).toHaveBeenCalledTimes(1);
    const output = JSON.parse(String(log.mock.calls[0][0]));
    expect(output.archive).toBeNull();
    expect(output.status).toEqual([expect.objectContaining({
      code: 'archive_gate_blocked',
      gateId: 'blocking.gate',
      gateStatus: 'fail',
      evidence: ['report.json'],
      remediation: ['resolve blocking.gate'],
    })]);
    expect(process.exitCode).toBe(1);
  });
});
