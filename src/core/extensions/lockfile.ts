import { promises as fs } from 'node:fs';
import path from 'node:path';
import { valid as validVersion, validRange } from 'semver';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { z } from 'zod';
import { isKebabId } from '../id.js';
import { EXTENSION_API_V1 } from './schemas.js';

const ExtensionIdSchema = z.string().superRefine((value, ctx) => {
  if (!isKebabId(value)) {
    ctx.addIssue({ code: 'custom', message: 'extension id must be kebab-case' });
  }
});

const RegistrySourceSchema = z
  .object({
    kind: z.literal('registry'),
    spec: z.string().min(1),
  })
  .strict();

const LinkSourceSchema = z
  .object({
    kind: z.literal('link'),
    path: z.string().min(1),
  })
  .strict();

export const ExtensionLockEntryV1Schema = z
  .object({
    source: z.discriminatedUnion('kind', [RegistrySourceSchema, LinkSourceSchema]),
    version: z
      .string()
      .refine((value) => validVersion(value) !== null, 'version must be a valid semantic version'),
    integrity: z.string().min(1).optional(),
    cacheKey: z.string().min(1).optional(),
    apiVersion: z.literal(EXTENSION_API_V1),
    openspec: z
      .string()
      .refine((value) => validRange(value) !== null, 'openspec must be a valid semantic version range'),
    enabled: z.boolean(),
  })
  .strict()
  .superRefine((entry, ctx) => {
    if (entry.source.kind === 'registry') {
      if (!entry.integrity) {
        ctx.addIssue({ code: 'custom', path: ['integrity'], message: 'registry entries require integrity' });
      }
      if (!entry.cacheKey) {
        ctx.addIssue({ code: 'custom', path: ['cacheKey'], message: 'registry entries require cacheKey' });
      }
    }
  });

export const ExtensionLockfileV1Schema = z
  .object({
    version: z.literal(1),
    extensions: z.record(ExtensionIdSchema, ExtensionLockEntryV1Schema),
  })
  .strict();

export type ExtensionLockEntryV1 = z.infer<typeof ExtensionLockEntryV1Schema>;
export type ExtensionLockfileV1 = z.infer<typeof ExtensionLockfileV1Schema>;

export const EMPTY_EXTENSION_LOCKFILE: ExtensionLockfileV1 = Object.freeze({
  version: 1,
  extensions: Object.freeze({}),
});

export function extensionLockfilePath(projectRoot: string): string {
  return path.join(projectRoot, 'openspec', 'extensions.lock.yaml');
}

function zodMessage(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.map(String).join('.') || '<root>'}: ${issue.message}`)
    .join('; ');
}

function sortedLockfile(lockfile: ExtensionLockfileV1): ExtensionLockfileV1 {
  return {
    version: 1,
    extensions: Object.fromEntries(
      Object.entries(lockfile.extensions).sort(([left], [right]) => left.localeCompare(right))
    ),
  };
}

export async function readExtensionLockfile(projectRoot: string): Promise<ExtensionLockfileV1> {
  const lockPath = extensionLockfilePath(projectRoot);
  let content: string;
  try {
    content = await fs.readFile(lockPath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { version: 1, extensions: {} };
    }
    throw error;
  }

  let input: unknown;
  try {
    input = parseYaml(content);
  } catch (error) {
    throw new Error(`Invalid extension lockfile YAML at ${lockPath}: ${(error as Error).message}`);
  }

  const parsed = ExtensionLockfileV1Schema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid extension lockfile at ${lockPath}: ${zodMessage(parsed.error)}`);
  }
  return sortedLockfile(parsed.data);
}

export async function writeExtensionLockfile(
  projectRoot: string,
  input: ExtensionLockfileV1
): Promise<void> {
  const parsed = ExtensionLockfileV1Schema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid extension lockfile replacement: ${zodMessage(parsed.error)}`);
  }

  const lockPath = extensionLockfilePath(projectRoot);
  const lockDir = path.dirname(lockPath);
  const tempPath = path.join(
    lockDir,
    `.${path.basename(lockPath)}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`
  );
  const content = stringifyYaml(sortedLockfile(parsed.data), { lineWidth: 0 });

  await fs.mkdir(lockDir, { recursive: true });
  try {
    await fs.writeFile(tempPath, content, { encoding: 'utf8', flag: 'wx' });
    await fs.rename(tempPath, lockPath);
  } finally {
    await fs.rm(tempPath, { force: true }).catch(() => undefined);
  }
}

export async function updateExtensionLockfile(
  projectRoot: string,
  extensionId: string,
  entry: ExtensionLockEntryV1
): Promise<ExtensionLockfileV1> {
  if (!isKebabId(extensionId)) {
    throw new Error(`Invalid extension id '${extensionId}'.`);
  }
  const current = await readExtensionLockfile(projectRoot);
  const next: ExtensionLockfileV1 = {
    version: 1,
    extensions: { ...current.extensions, [extensionId]: entry },
  };
  await writeExtensionLockfile(projectRoot, next);
  return sortedLockfile(next);
}
