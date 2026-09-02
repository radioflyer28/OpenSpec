import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { GateResultV1Schema } from './schemas.js';
import type { GateResultV1 } from './types.js';

const DigestSchema = z.string().min(1);

const RecordedGateResultSchema = GateResultV1Schema.extend({
  evaluatedAt: z.string().datetime(),
  resultDigest: DigestSchema,
  evidenceDigest: DigestSchema,
}).strict();

const GateAcceptanceSchema = z.object({
  resultDigest: DigestSchema,
  evidenceDigest: DigestSchema,
  acceptedAt: z.string().datetime(),
  actor: z.string().min(1).optional(),
}).strict();

const GateOverrideSchema = z.object({
  resultDigest: DigestSchema,
  evidenceDigest: DigestSchema,
  reason: z.string().trim().min(1),
  overriddenAt: z.string().datetime(),
  actor: z.string().min(1).optional(),
  result: GateResultV1Schema,
}).strict();

const RequiredGateSchema = z.object({
  extensionId: z.string().min(1),
  extensionVersion: z.string().min(1),
  gateId: z.string().min(1),
  workflowId: z.string().min(1),
  registeredAt: z.string().datetime(),
  lastResult: RecordedGateResultSchema.optional(),
  acceptance: GateAcceptanceSchema.optional(),
  overrides: z.array(GateOverrideSchema).default([]),
}).strict();

const RequiredGateRecordSchema = z.object({
  version: z.literal(1),
  gates: z.array(RequiredGateSchema),
}).strict();

export type RecordedGateResultV1 = z.infer<typeof RecordedGateResultSchema>;
export type RequiredGateV1 = z.infer<typeof RequiredGateSchema>;
export type RequiredGateRecordV1 = z.infer<typeof RequiredGateRecordSchema>;

export interface RegisterRequiredGateInput {
  extensionId: string;
  extensionVersion: string;
  gateId: string;
  workflowId: string;
  registeredAt?: string;
}

export function requiredGateRecordPath(changeDir: string): string {
  return path.join(changeDir, '.openspec-gates.json');
}

function sortRecord(record: RequiredGateRecordV1): RequiredGateRecordV1 {
  return {
    version: 1,
    gates: [...record.gates]
      .map((gate) => ({
        ...gate,
        overrides: [...gate.overrides].sort((left, right) =>
          left.overriddenAt.localeCompare(right.overriddenAt)
        ),
      }))
      .sort((left, right) => left.gateId.localeCompare(right.gateId)),
  };
}

export async function readRequiredGateRecord(changeDir: string): Promise<RequiredGateRecordV1> {
  const recordPath = requiredGateRecordPath(changeDir);
  let input: unknown;
  try {
    input = JSON.parse(await fs.readFile(recordPath, 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { version: 1, gates: [] };
    throw new Error(`Invalid required gate record at ${recordPath}: ${(error as Error).message}`);
  }
  const parsed = RequiredGateRecordSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid required gate record at ${recordPath}: ${parsed.error.message}`);
  }
  return sortRecord(parsed.data);
}

export async function writeRequiredGateRecord(
  changeDir: string,
  input: RequiredGateRecordV1
): Promise<void> {
  const record = sortRecord(RequiredGateRecordSchema.parse(input));
  const recordPath = requiredGateRecordPath(changeDir);
  const tempPath = path.join(
    changeDir,
    `.${path.basename(recordPath)}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`
  );
  await fs.mkdir(changeDir, { recursive: true });
  try {
    await fs.writeFile(tempPath, `${JSON.stringify(record, null, 2)}\n`, { flag: 'wx' });
    await fs.rename(tempPath, recordPath);
  } finally {
    await fs.rm(tempPath, { force: true }).catch(() => undefined);
  }
}

export async function registerRequiredGate(
  changeDir: string,
  input: RegisterRequiredGateInput
): Promise<RequiredGateRecordV1> {
  const record = await readRequiredGateRecord(changeDir);
  const existing = record.gates.find((gate) => gate.gateId === input.gateId);
  const next: RequiredGateV1 = {
    extensionId: input.extensionId,
    extensionVersion: input.extensionVersion,
    gateId: input.gateId,
    workflowId: input.workflowId,
    registeredAt: input.registeredAt ?? new Date().toISOString(),
    overrides: existing?.overrides ?? [],
    ...(existing?.lastResult ? { lastResult: existing.lastResult } : {}),
    ...(existing?.acceptance ? { acceptance: existing.acceptance } : {}),
  };
  const index = record.gates.findIndex((gate) => gate.gateId === input.gateId);
  if (index >= 0) record.gates[index] = next;
  else record.gates.push(next);
  await writeRequiredGateRecord(changeDir, record);
  return readRequiredGateRecord(changeDir);
}

function digest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function bindGateResult(
  result: GateResultV1,
  evaluatedAt = new Date().toISOString()
): RecordedGateResultV1 {
  const validated = GateResultV1Schema.parse(result);
  return {
    ...validated,
    evaluatedAt,
    resultDigest: digest(validated),
    evidenceDigest: digest(validated.evidence),
  };
}

export function hasFreshGateAcceptance(gate: RequiredGateV1): boolean {
  return Boolean(
    gate.lastResult?.status === 'human_needed' &&
    gate.acceptance &&
    gate.acceptance.resultDigest === gate.lastResult.resultDigest &&
    gate.acceptance.evidenceDigest === gate.lastResult.evidenceDigest
  );
}

export async function acceptRequiredGate(
  changeDir: string,
  gateId: string,
  options: { actor?: string; acceptedAt?: string } = {}
): Promise<void> {
  const record = await readRequiredGateRecord(changeDir);
  const gate = record.gates.find((candidate) => candidate.gateId === gateId);
  if (!gate) throw new Error(`Unknown required gate '${gateId}'.`);
  if (!gate.lastResult || gate.lastResult.status !== 'human_needed') {
    throw new Error(`Gate '${gateId}' has no current human-needed result to accept.`);
  }
  gate.acceptance = {
    resultDigest: gate.lastResult.resultDigest,
    evidenceDigest: gate.lastResult.evidenceDigest,
    acceptedAt: options.acceptedAt ?? new Date().toISOString(),
    ...(options.actor ? { actor: options.actor } : {}),
  };
  await writeRequiredGateRecord(changeDir, record);
}

export async function recordGateOverride(
  changeDir: string,
  gateId: string,
  options: { reason: string; actor?: string; overriddenAt?: string }
): Promise<void> {
  const record = await readRequiredGateRecord(changeDir);
  const gate = record.gates.find((candidate) => candidate.gateId === gateId);
  if (!gate) throw new Error(`Unknown required gate '${gateId}'.`);
  if (!gate.lastResult) throw new Error(`Gate '${gateId}' has no current result to override.`);
  if (!options.reason.trim()) throw new Error('A non-empty gate override reason is required.');
  const { evaluatedAt: _evaluatedAt, resultDigest, evidenceDigest, ...result } = gate.lastResult;
  gate.overrides.push({
    resultDigest,
    evidenceDigest,
    reason: options.reason.trim(),
    overriddenAt: options.overriddenAt ?? new Date().toISOString(),
    ...(options.actor ? { actor: options.actor } : {}),
    result,
  });
  await writeRequiredGateRecord(changeDir, record);
}
