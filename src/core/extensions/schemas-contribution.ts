import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseSchema } from '../artifact-graph/schema.js';
import { getExtensionSchemasRoot } from './schema-index.js';
import { isExtensionPathContained, resolveContainedExtensionPath } from './paths.js';
import type { ExtensionRegistrySnapshot } from './registry.js';

export async function materializeExtensionSchemas(
  snapshot: ExtensionRegistrySnapshot,
  projectRoot: string
): Promise<void> {
  const targetRoot = getExtensionSchemasRoot(projectRoot);
  const parent = path.dirname(targetRoot);
  const suffix = `${process.pid}-${Math.random().toString(36).slice(2)}`;
  const stageRoot = path.join(parent, `schemas.stage-${suffix}`);
  const backupRoot = path.join(parent, `schemas.backup-${suffix}`);
  const index: {
    version: 1;
    schemas: Record<string, { extensionId: string; extensionVersion: string; directory: string }>;
  } = { version: 1, schemas: {} };

  await fs.mkdir(stageRoot, { recursive: true });
  try {
    for (const resolved of snapshot.schemas) {
      const contributedPath = await resolveContainedExtensionPath(
        resolved.extensionRoot,
        resolved.contribution.path
      );
      const stat = await fs.stat(contributedPath);
      const sourceDir = stat.isDirectory() ? contributedPath : path.dirname(contributedPath);
      const schemaPath = stat.isDirectory()
        ? path.join(contributedPath, 'schema.yaml')
        : contributedPath;
      const schema = parseSchema(await fs.readFile(schemaPath, 'utf8'));
      if (schema.name !== resolved.contribution.id) {
        throw new Error(
          `Extension schema contribution '${resolved.contribution.id}' declares schema name '${schema.name}'.`
        );
      }

      const destination = path.join(stageRoot, resolved.contribution.id);
      await fs.mkdir(destination, { recursive: true });
      await fs.copyFile(schemaPath, path.join(destination, 'schema.yaml'));
      for (const artifact of schema.artifacts) {
        const templatePath = await fs.realpath(path.resolve(sourceDir, artifact.template));
        const canonicalSourceDir = await fs.realpath(sourceDir);
        if (!isExtensionPathContained(canonicalSourceDir, templatePath)) {
          throw new Error(
            `Extension schema template resolves outside its schema directory: ${artifact.template}`
          );
        }
        const destinationTemplate = path.resolve(destination, artifact.template);
        if (!isExtensionPathContained(destination, destinationTemplate)) {
          throw new Error(`Extension schema template path escapes generated schema: ${artifact.template}`);
        }
        await fs.mkdir(path.dirname(destinationTemplate), { recursive: true });
        await fs.copyFile(templatePath, destinationTemplate);
      }
      await fs.writeFile(
        path.join(destination, '.openspec-extension-owner.json'),
        `${JSON.stringify({
          extensionId: resolved.extensionId,
          extensionVersion: resolved.extensionVersion,
          schemaId: resolved.contribution.id,
        }, null, 2)}\n`
      );
      index.schemas[resolved.contribution.id] = {
        extensionId: resolved.extensionId,
        extensionVersion: resolved.extensionVersion,
        directory: resolved.contribution.id,
      };
    }

    index.schemas = Object.fromEntries(
      Object.entries(index.schemas).sort(([left], [right]) => left.localeCompare(right))
    );
    await fs.writeFile(path.join(stageRoot, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
    await fs.mkdir(parent, { recursive: true });
    let hadPrevious = false;
    try {
      await fs.rename(targetRoot, backupRoot);
      hadPrevious = true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    try {
      await fs.rename(stageRoot, targetRoot);
    } catch (error) {
      if (hadPrevious) await fs.rename(backupRoot, targetRoot).catch(() => undefined);
      throw error;
    }
    if (hadPrevious) await fs.rm(backupRoot, { recursive: true, force: true });
  } finally {
    await fs.rm(stageRoot, { recursive: true, force: true });
    await fs.rm(backupRoot, { recursive: true, force: true });
  }
}
