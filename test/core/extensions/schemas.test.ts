import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getSchemaDir,
  listSchemas,
  listSchemasWithInfo,
  resolveSchema,
} from '../../../src/core/artifact-graph/index.js';
import {
  buildExtensionRegistrySnapshot,
  materializeExtensionSchemas,
  updateExtensionLockfile,
} from '../../../src/core/extensions/index.js';

const hostCapabilities = {
  agentDispatch: false,
  parallelism: false,
  worktrees: false,
  git: false,
  structuredResults: true,
  humanInteraction: true,
};

function schemaYaml(name: string) {
  return `name: ${name}\nversion: 1\ndescription: Extension schema ${name}\nartifacts:\n  - id: brief\n    generates: brief.md\n    description: A short brief\n    template: brief.md\n    requires: []\napply:\n  requires: [brief]\n  tracks: null\n`;
}

describe('extension schema contributions', () => {
  let projectRoot: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(path.join(os.tmpdir(), 'openspec-extension-schemas-'));
    await mkdir(path.join(projectRoot, 'openspec', 'changes'), { recursive: true });
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  async function addSchemaExtension(
    extensionId: string,
    schemaId: string,
    options: { enabled?: boolean; writeSchema?: boolean } = {}
  ) {
    const extensionRoot = path.join(projectRoot, 'extensions', extensionId);
    const schemaRoot = path.join(extensionRoot, 'schemas', schemaId);
    await mkdir(schemaRoot, { recursive: true });
    if (options.writeSchema ?? true) {
      await writeFile(path.join(schemaRoot, 'schema.yaml'), schemaYaml(schemaId));
      await writeFile(path.join(schemaRoot, 'brief.md'), '# Brief template\n');
    }
    await writeFile(path.join(extensionRoot, 'workflow.md'), '# workflow\n');
    await writeFile(path.join(extensionRoot, 'openspec-extension.json'), JSON.stringify({
      apiVersion: 'openspec.dev/extensions/v1',
      id: extensionId,
      version: '1.0.0',
      requires: {
        openspec: '>=1.8.0 <2.0.0',
        hostCapabilities: { required: [], optional: [] },
      },
      contributes: {
        workflows: [],
        schemas: [{ id: schemaId, path: path.join('schemas', schemaId, 'schema.yaml') }],
        commands: [],
        gates: [],
      },
    }));
    await updateExtensionLockfile(projectRoot, extensionId, {
      source: { kind: 'link', path: path.relative(projectRoot, extensionRoot) },
      version: '1.0.0',
      apiVersion: 'openspec.dev/extensions/v1',
      openspec: '>=1.8.0 <2.0.0',
      enabled: options.enabled ?? true,
    });
  }

  async function snapshot() {
    return buildExtensionRegistrySnapshot({
      projectRoot,
      coreVersion: '1.9.0',
      hostCapabilities,
      builtinIds: { schemas: ['spec-driven'] },
    });
  }

  it('resolves an enabled schema through status/instruction shared resolution surfaces', async () => {
    await addSchemaExtension('review-extension', 'review-flow');
    await materializeExtensionSchemas(await snapshot(), projectRoot);

    expect(listSchemas(projectRoot)).toContain('review-flow');
    expect(getSchemaDir('review-flow', projectRoot)).toBe(
      path.join(projectRoot, 'openspec', '.extensions', 'schemas', 'review-flow')
    );
    expect(resolveSchema('review-flow', projectRoot)).toMatchObject({
      name: 'review-flow',
      artifacts: [{ id: 'brief', template: 'brief.md' }],
    });
    expect(listSchemasWithInfo(projectRoot)).toContainEqual(
      expect.objectContaining({ name: 'review-flow', source: 'extension' })
    );
  });

  it('omits disabled providers and rejects built-in and extension conflicts', async () => {
    await addSchemaExtension('disabled-extension', 'disabled-flow', { enabled: false });
    await addSchemaExtension('core-shadow', 'spec-driven');
    await addSchemaExtension('first-shared', 'shared-flow');
    await addSchemaExtension('second-shared', 'shared-flow');
    const registry = await snapshot();

    expect(registry.schemas).toEqual([]);
    expect(registry.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'extension_builtin_conflict', contributionId: 'spec-driven' }),
      expect.objectContaining({ code: 'extension_contribution_conflict', contributionId: 'shared-flow' }),
    ]));
    await materializeExtensionSchemas(registry, projectRoot);
    expect(listSchemas(projectRoot)).not.toContain('disabled-flow');
    expect(listSchemas(projectRoot)).not.toContain('shared-flow');
  });

  it('reports a missing contained schema file without affecting built-in schemas', async () => {
    await addSchemaExtension('missing-schema', 'missing-flow', { writeSchema: false });
    const registry = await snapshot();

    expect(registry.schemas).toEqual([]);
    expect(registry.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'extension_manifest_invalid', extensionId: 'missing-schema' })
    );
    expect(resolveSchema('spec-driven', projectRoot).name).toBe('spec-driven');
  });

  it('removes a generated schema after its provider is disabled', async () => {
    await addSchemaExtension('review-extension', 'review-flow');
    await materializeExtensionSchemas(await snapshot(), projectRoot);
    expect(listSchemas(projectRoot)).toContain('review-flow');

    const { readExtensionLockfile, writeExtensionLockfile } = await import(
      '../../../src/core/extensions/index.js'
    );
    const lockfile = await readExtensionLockfile(projectRoot);
    lockfile.extensions['review-extension'].enabled = false;
    await writeExtensionLockfile(projectRoot, lockfile);
    await materializeExtensionSchemas(await snapshot(), projectRoot);

    expect(listSchemas(projectRoot)).not.toContain('review-flow');
  });
});
