import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  assertExtensionConformanceV1,
  checkExtensionConformanceV1,
  EXTENSION_API_V1,
  ExtensionManifestV1Schema,
  loadExtensionManifestV1,
} from '../../../src/core/extensions/index.js';

function validManifest() {
  return {
    apiVersion: EXTENSION_API_V1,
    id: 'fixture-extension',
    version: '1.2.3',
    requires: {
      openspec: '>=1.7.0 <2.0.0',
      hostCapabilities: {
        required: ['structuredResults'],
        optional: ['agentDispatch', 'parallelism'],
      },
    },
    contributes: {
      workflows: [
        {
          id: 'fixture-run',
          name: 'Fixture Run',
          description: 'Exercise the extension workflow contract.',
          entry: 'workflows/run.md',
          artifactRequirements: ['proposal', 'tasks'],
          gateDependencies: ['fixture.assurance'],
        },
      ],
      schemas: [{ id: 'fixture-schema', path: 'schemas/fixture.yaml' }],
      commands: [
        {
          id: 'fixture-status',
          name: 'Fixture Status',
          description: 'Report fixture status.',
          entry: 'commands/status.md',
        },
      ],
      gates: [
        {
          id: 'fixture.assurance',
          module: 'dist/gate.js',
          export: 'evaluateFixture',
          timeoutMs: 15_000,
        },
      ],
    },
  } as const;
}

describe('ExtensionManifestV1', () => {
  it('accepts a complete compatible manifest', () => {
    const result = loadExtensionManifestV1(validManifest(), '1.7.0');

    expect(result.manifest).toMatchObject(validManifest());
    expect(result.diagnostics).toEqual([]);
  });

  it('accepts compatibility range boundaries', () => {
    expect(loadExtensionManifestV1(validManifest(), '1.7.0').manifest).toBeDefined();
    expect(loadExtensionManifestV1(validManifest(), '1.99.0').manifest).toBeDefined();
  });

  it('rejects versions outside the declared core range', () => {
    for (const coreVersion of ['1.6.9', '2.0.0']) {
      const result = loadExtensionManifestV1(validManifest(), coreVersion);

      expect(result.manifest).toBeUndefined();
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({
          code: 'extension_core_incompatible',
          path: 'requires.openspec',
        })
      );
    }
  });

  it('rejects an unsupported manifest API without loading contributions', () => {
    const result = loadExtensionManifestV1(
      { ...validManifest(), apiVersion: 'openspec.dev/extensions/v2' },
      '1.7.0'
    );

    expect(result.manifest).toBeUndefined();
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'extension_api_unsupported',
        path: 'apiVersion',
        message: expect.stringContaining('openspec.dev/extensions/v2'),
      })
    );
  });

  it('reports nested fields and rejects the whole manifest on contribution errors', () => {
    const invalid = structuredClone(validManifest()) as Record<string, any>;
    invalid.contributes.workflows[0].entry = '';
    invalid.contributes.gates[0].timeoutMs = -1;

    const result = loadExtensionManifestV1(invalid, '1.7.0');

    expect(result.manifest).toBeUndefined();
    expect(result.diagnostics.map((diagnostic) => diagnostic.path)).toEqual(
      expect.arrayContaining([
        'contributes.workflows.0.entry',
        'contributes.gates.0.timeoutMs',
      ])
    );
  });

  it('rejects unknown fields instead of silently accepting a wider API', () => {
    const result = ExtensionManifestV1Schema.safeParse({
      ...validManifest(),
      lifecycleHooks: { beforeArchive: 'dist/hook.js' },
    });

    expect(result.success).toBe(false);
  });

  it('rejects duplicate contribution identifiers within one contribution kind', () => {
    const invalid = structuredClone(validManifest()) as Record<string, any>;
    invalid.contributes.workflows.push({ ...invalid.contributes.workflows[0] });

    const result = loadExtensionManifestV1(invalid, '1.7.0');

    expect(result.manifest).toBeUndefined();
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'extension_manifest_invalid',
        path: 'contributes.workflows.1.id',
      })
    );
  });

  it('loads the generic conformance fixture', async () => {
    const fixturePath = path.join(
      process.cwd(),
      'test',
      'fixtures',
      'extensions',
      'complete',
      'openspec-extension.json'
    );
    const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

    const result = loadExtensionManifestV1(fixture, '1.7.0');

    expect(result.diagnostics).toEqual([]);
    expect(result.manifest?.contributes.workflows).toHaveLength(1);
    expect(result.manifest?.contributes.schemas).toHaveLength(1);
    expect(result.manifest?.contributes.commands).toHaveLength(1);
    expect(result.manifest?.contributes.gates).toHaveLength(1);
    expect(result.manifest?.requires.hostCapabilities).toEqual({
      required: ['structuredResults'],
      optional: ['agentDispatch', 'parallelism', 'worktrees'],
    });
  });

  it('exposes a conformance entry point for external extension packages', async () => {
    const extensionRoot = path.join(
      process.cwd(),
      'test',
      'fixtures',
      'extensions',
      'complete'
    );

    const result = await checkExtensionConformanceV1({ extensionRoot, coreVersion: '1.7.0' });
    const asserted = await assertExtensionConformanceV1({ extensionRoot, coreVersion: '1.7.0' });

    expect(result).toMatchObject({ valid: true, diagnostics: [] });
    expect(asserted.id).toBe('fixture-extension');
  });

  it('reports conformance diagnostics instead of partially accepting an incompatible package', async () => {
    const extensionRoot = path.join(
      process.cwd(),
      'test',
      'fixtures',
      'extensions',
      'complete'
    );

    const result = await checkExtensionConformanceV1({ extensionRoot, coreVersion: '2.0.0' });

    expect(result.valid).toBe(false);
    expect(result.manifest).toBeUndefined();
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'manifest', path: 'requires.openspec' })
    );
  });
});
