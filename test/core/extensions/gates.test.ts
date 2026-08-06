import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  acceptRequiredGate,
  evaluateRequiredGates,
  readRequiredGateRecord,
  recordGateOverride,
  registerRequiredGate,
  hasFreshGateAcceptance,
  updateExtensionLockfile,
  writeRequiredGateRecord,
} from '../../../src/core/extensions/index.js';

const hostCapabilities = {
  agentDispatch: false,
  parallelism: false,
  worktrees: false,
  git: false,
  structuredResults: true,
  humanInteraction: true,
};

describe('durable extension gates', () => {
  let projectRoot: string;
  let changeDir: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(path.join(os.tmpdir(), 'openspec-extension-gates-'));
    changeDir = path.join(projectRoot, 'openspec', 'changes', 'gated-change');
    await mkdir(changeDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  async function installGateExtension(
    gates: Array<{ id: string; source: string; timeoutMs?: number }>
  ) {
    const root = path.join(projectRoot, 'extensions', 'gate-extension');
    await mkdir(root, { recursive: true });
    for (const gate of gates) {
      await writeFile(path.join(root, `${gate.id}.mjs`), gate.source);
    }
    await writeFile(path.join(root, 'openspec-extension.json'), JSON.stringify({
      apiVersion: 'openspec.dev/extensions/v1',
      id: 'gate-extension',
      version: '1.0.0',
      requires: {
        openspec: '>=1.8.0 <2.0.0',
        hostCapabilities: { required: [], optional: [] },
      },
      contributes: {
        workflows: [],
        schemas: [],
        commands: [],
        gates: gates.map((gate) => ({
          id: gate.id,
          module: `${gate.id}.mjs`,
          export: 'default',
          timeoutMs: gate.timeoutMs ?? 1000,
          requiredHostCapabilities: [],
        })),
      },
    }));
    await updateExtensionLockfile(projectRoot, 'gate-extension', {
      source: { kind: 'link', path: path.relative(projectRoot, root) },
      version: '1.0.0',
      apiVersion: 'openspec.dev/extensions/v1',
      openspec: '>=1.8.0 <2.0.0',
      enabled: true,
    });
  }

  async function register(gateId: string) {
    return registerRequiredGate(changeDir, {
      extensionId: 'gate-extension',
      extensionVersion: '1.0.0',
      gateId,
      workflowId: 'fixture-run',
      registeredAt: '2026-08-04T12:00:00.000Z',
    });
  }

  it('registers and serializes gates stably without losing unrelated entries', async () => {
    await register('z.gate');
    await register('a.gate');
    const content = await readFile(path.join(changeDir, '.openspec-gates.json'), 'utf8');
    const record = await readRequiredGateRecord(changeDir);

    expect(content.indexOf('a.gate')).toBeLessThan(content.indexOf('z.gate'));
    expect(record.gates.map((gate) => gate.gateId)).toEqual(['a.gate', 'z.gate']);
    expect(record.gates[0]).toMatchObject({
      extensionId: 'gate-extension',
      extensionVersion: '1.0.0',
      workflowId: 'fixture-run',
    });
  });

  it('binds human acceptance and override audits to current result and evidence digests', async () => {
    await register('human.gate');
    const record = await readRequiredGateRecord(changeDir);
    record.gates[0].lastResult = {
      gateId: 'human.gate',
      status: 'human_needed',
      summary: 'Inspect the release manually',
      evidence: ['report-a'],
      remediation: ['Approve the report'],
      evaluatedAt: '2026-08-04T12:01:00.000Z',
      resultDigest: 'result-one',
      evidenceDigest: 'evidence-one',
    };
    await writeRequiredGateRecord(changeDir, record);

    await acceptRequiredGate(changeDir, 'human.gate', { actor: 'reviewer' });
    await recordGateOverride(changeDir, 'human.gate', {
      reason: 'Emergency release',
      actor: 'operator',
      overriddenAt: '2026-08-04T12:02:00.000Z',
    });
    let current = await readRequiredGateRecord(changeDir);
    expect(current.gates[0].acceptance).toMatchObject({
      resultDigest: 'result-one',
      evidenceDigest: 'evidence-one',
      actor: 'reviewer',
    });
    expect(current.gates[0].overrides[0]).toMatchObject({
      reason: 'Emergency release',
      resultDigest: 'result-one',
      actor: 'operator',
    });

    current.gates[0].lastResult!.evidenceDigest = 'evidence-two';
    await writeRequiredGateRecord(changeDir, current);
    const stale = (await readRequiredGateRecord(changeDir)).gates[0];
    expect(stale.acceptance?.evidenceDigest).not.toBe(stale.lastResult?.evidenceDigest);
    expect(hasFreshGateAcceptance(stale)).toBe(false);
  });

  it('evaluates pass, warn, fail, and human-needed results in stable order', async () => {
    await installGateExtension([
      { id: 'pass.gate', source: `export default { evaluate: () => ({ gateId: 'pass.gate', status: 'pass', summary: 'ok', evidence: ['pass'], remediation: [] }) };` },
      { id: 'warn.gate', source: `export default { evaluate: () => ({ gateId: 'warn.gate', status: 'warn', summary: 'warning', evidence: [], remediation: [] }) };` },
      { id: 'fail.gate', source: `export default { evaluate: () => ({ gateId: 'fail.gate', status: 'fail', summary: 'failed', evidence: ['report'], remediation: ['fix it'] }) };` },
      { id: 'human.gate', source: `export default { evaluate: () => ({ gateId: 'human.gate', status: 'human_needed', summary: 'review', evidence: ['report'], remediation: ['accept'] }) };` },
      { id: 'readonly.gate', source: `export default { evaluate: (context) => { let readOnly = Object.isFrozen(context) && Object.isFrozen(context.priorRecord); try { context.changeName = 'mutated'; readOnly = false; } catch {} return { gateId: 'readonly.gate', status: 'pass', summary: readOnly ? 'read-only context' : 'mutable context', evidence: [], remediation: [] }; } };` },
    ]);
    for (const id of ['warn.gate', 'pass.gate', 'human.gate', 'fail.gate', 'readonly.gate']) await register(id);

    const evaluation = await evaluateRequiredGates({
      projectRoot,
      changeName: 'gated-change',
      coreVersion: '1.9.0',
      hostCapabilities,
    });

    expect(evaluation.results.map((result) => result.gateId)).toEqual([
      'fail.gate', 'human.gate', 'pass.gate', 'readonly.gate', 'warn.gate',
    ]);
    expect(evaluation.blocking.map((result) => result.gateId)).toEqual(['fail.gate', 'human.gate']);
    expect(evaluation.warnings.map((result) => result.gateId)).toEqual(['warn.gate']);
    expect(evaluation.results[0]).toMatchObject({ evidence: ['report'], remediation: ['fix it'] });
    expect(evaluation.results.find((result) => result.gateId === 'readonly.gate')?.summary)
      .toBe('read-only context');
  });

  it('fails closed when a required gate extension is disabled after registration', async () => {
    await installGateExtension([
      { id: 'pass.gate', source: `export default { evaluate: () => ({ gateId: 'pass.gate', status: 'pass', summary: 'ok', evidence: [], remediation: [] }) };` },
    ]);
    await register('pass.gate');
    const { readExtensionLockfile, writeExtensionLockfile } = await import(
      '../../../src/core/extensions/index.js'
    );
    const lockfile = await readExtensionLockfile(projectRoot);
    lockfile.extensions['gate-extension'].enabled = false;
    await writeExtensionLockfile(projectRoot, lockfile);

    const evaluation = await evaluateRequiredGates({
      projectRoot,
      changeName: 'gated-change',
      coreVersion: '1.9.0',
      hostCapabilities,
    });

    expect(evaluation.blocking).toEqual([
      expect.objectContaining({ gateId: 'pass.gate', status: 'error' }),
    ]);
  });

  it('turns provider errors, timeouts, invalid results, missing providers, and version mismatches into blocking errors', async () => {
    await installGateExtension([
      { id: 'throw.gate', source: `export default { evaluate: () => { throw new Error('boom'); } };` },
      { id: 'timeout.gate', timeoutMs: 10, source: `export default { evaluate: () => new Promise(() => {}) };` },
      { id: 'invalid.gate', source: `export default { evaluate: () => ({ gateId: 'invalid.gate', status: 'maybe' }) };` },
    ]);
    for (const id of ['throw.gate', 'timeout.gate', 'invalid.gate', 'missing.gate']) await register(id);
    const record = await readRequiredGateRecord(changeDir);
    record.gates.push({
      extensionId: 'gate-extension',
      extensionVersion: '9.0.0',
      gateId: 'version.gate',
      workflowId: 'fixture-run',
      registeredAt: '2026-08-04T12:00:00.000Z',
      overrides: [],
    });
    await writeRequiredGateRecord(changeDir, record);

    const evaluation = await evaluateRequiredGates({
      projectRoot,
      changeName: 'gated-change',
      coreVersion: '1.9.0',
      hostCapabilities,
    });

    expect(evaluation.blocking.map((result) => result.gateId)).toEqual([
      'invalid.gate', 'missing.gate', 'throw.gate', 'timeout.gate', 'version.gate',
    ]);
    expect(evaluation.blocking.every((result) => result.status === 'error')).toBe(true);
    expect(evaluation.blocking.find((result) => result.gateId === 'timeout.gate')?.summary)
      .toContain('timed out');
  });
});
