import * as fs from 'node:fs';
import * as path from 'node:path';

export interface ExtensionSchemaIndexEntryV1 {
  extensionId: string;
  extensionVersion: string;
  directory: string;
}

interface ExtensionSchemaIndexV1 {
  version: 1;
  schemas: Record<string, ExtensionSchemaIndexEntryV1>;
}

export function getExtensionSchemasRoot(projectRoot: string): string {
  return path.join(projectRoot, 'openspec', '.extensions', 'schemas');
}

export function getExtensionSchemaIndexPath(projectRoot: string): string {
  return path.join(getExtensionSchemasRoot(projectRoot), 'index.json');
}

export function readExtensionSchemaIndex(projectRoot: string): ExtensionSchemaIndexV1 {
  const indexPath = getExtensionSchemaIndexPath(projectRoot);
  try {
    const input = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as unknown;
    if (
      typeof input !== 'object' ||
      input === null ||
      (input as { version?: unknown }).version !== 1 ||
      typeof (input as { schemas?: unknown }).schemas !== 'object' ||
      (input as { schemas?: unknown }).schemas === null
    ) {
      return { version: 1, schemas: {} };
    }
    return input as ExtensionSchemaIndexV1;
  } catch {
    return { version: 1, schemas: {} };
  }
}

export function getExtensionSchemaDir(projectRoot: string, name: string): string | null {
  const entry = readExtensionSchemaIndex(projectRoot).schemas[name];
  if (!entry || path.isAbsolute(entry.directory) || entry.directory.includes('\0')) return null;
  const root = getExtensionSchemasRoot(projectRoot);
  const directory = path.resolve(root, entry.directory);
  const relative = path.relative(root, directory);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    return null;
  }
  return fs.existsSync(path.join(directory, 'schema.yaml')) ? directory : null;
}

export function listExtensionSchemaNames(projectRoot: string): string[] {
  return Object.keys(readExtensionSchemaIndex(projectRoot).schemas)
    .filter((name) => getExtensionSchemaDir(projectRoot, name) !== null)
    .sort();
}
