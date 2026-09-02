import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { z } from 'zod';
import type { ExtensionLockfileV1 } from './lockfile.js';

const ReconciliationRecordSchema = z
  .object({
    version: z.literal(1),
    lockDigest: z.string().min(1),
    status: z.enum(['ok', 'error']),
    updatedAt: z.string().datetime(),
    error: z.string().min(1).optional(),
    diagnostics: z.array(z.string()).default([]),
    artifacts: z.array(
      z.object({
        extensionId: z.string().min(1),
        extensionVersion: z.string().min(1),
        workflowId: z.string().min(1),
        toolId: z.string().min(1),
        surface: z.enum(['command', 'skill']),
        path: z.string().min(1),
        contentDigest: z.string().min(1),
        ownershipMarker: z.string().min(1),
      }).strict()
    ).default([]),
  })
  .strict();

export type ExtensionReconciliationRecordV1 = z.infer<typeof ReconciliationRecordSchema>;
export type ExtensionGeneratedArtifactV1 = ExtensionReconciliationRecordV1['artifacts'][number];

export function extensionReconciliationPath(projectRoot: string): string {
  return path.join(projectRoot, 'openspec', 'extensions.generated.yaml');
}

export function extensionLockDigest(lockfile: ExtensionLockfileV1): string {
  const ordered = Object.fromEntries(
    Object.entries(lockfile.extensions).sort(([left], [right]) => left.localeCompare(right))
  );
  return createHash('sha256')
    .update(JSON.stringify({ version: lockfile.version, extensions: ordered }))
    .digest('hex');
}

export async function readExtensionReconciliationRecord(
  projectRoot: string
): Promise<ExtensionReconciliationRecordV1 | undefined> {
  const recordPath = extensionReconciliationPath(projectRoot);
  let content: string;
  try {
    content = await fs.readFile(recordPath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
  const parsed = ReconciliationRecordSchema.safeParse(parseYaml(content));
  if (!parsed.success) {
    throw new Error(`Invalid extension reconciliation record at ${recordPath}: ${parsed.error.message}`);
  }
  return parsed.data;
}

export async function writeExtensionReconciliationRecord(
  projectRoot: string,
  record: ExtensionReconciliationRecordV1
): Promise<void> {
  const parsed = ReconciliationRecordSchema.parse(record);
  const recordPath = extensionReconciliationPath(projectRoot);
  const tempPath = path.join(
    path.dirname(recordPath),
    `.${path.basename(recordPath)}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`
  );
  await fs.mkdir(path.dirname(recordPath), { recursive: true });
  try {
    await fs.writeFile(tempPath, stringifyYaml(parsed, { lineWidth: 0 }), { flag: 'wx' });
    await fs.rename(tempPath, recordPath);
  } finally {
    await fs.rm(tempPath, { force: true }).catch(() => undefined);
  }
}

export function reconciliationState(
  lockfile: ExtensionLockfileV1,
  record: ExtensionReconciliationRecordV1 | undefined
): { state: 'ok' | 'drifted'; detail?: string } {
  if (!record) return { state: 'drifted', detail: 'no reconciliation record' };
  if (record.lockDigest !== extensionLockDigest(lockfile)) {
    return { state: 'drifted', detail: 'lockfile changed after reconciliation' };
  }
  if (record.status === 'error') {
    return { state: 'drifted', detail: record.error ?? 'reconciliation failed' };
  }
  return { state: 'ok' };
}
