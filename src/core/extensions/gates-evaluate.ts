import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { buildExtensionRegistrySnapshot } from './registry.js';
import { resolveContainedExtensionPath } from './paths.js';
import {
  bindGateResult,
  hasFreshGateAcceptance,
  readRequiredGateRecord,
  writeRequiredGateRecord,
  type RequiredGateV1,
} from './gates-record.js';
import { GateResultV1Schema } from './schemas.js';
import type { GateContextV1, GateProviderV1, GateResultV1, HostCapabilitiesV1 } from './types.js';

export interface EvaluateRequiredGatesOptions {
  projectRoot: string;
  changeName: string;
  coreVersion: string;
  hostCapabilities: HostCapabilitiesV1;
}

export interface RequiredGateEvaluation {
  results: GateResultV1[];
  blocking: GateResultV1[];
  warnings: GateResultV1[];
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  return value;
}

function errorResult(gateId: string, summary: string): GateResultV1 {
  return {
    gateId,
    status: 'error',
    summary,
    evidence: [],
    remediation: [
      `Run openspec extension doctor and restore the provider for required gate '${gateId}'.`,
    ],
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, gateId: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Gate '${gateId}' timed out after ${timeoutMs}ms.`)),
          timeoutMs
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function evaluateOne(
  gate: RequiredGateV1,
  options: EvaluateRequiredGatesOptions,
  registry: Awaited<ReturnType<typeof buildExtensionRegistrySnapshot>>
): Promise<GateResultV1> {
  const resolved = registry.gates.find((candidate) => candidate.contribution.id === gate.gateId);
  if (!resolved) return errorResult(gate.gateId, `Required gate provider '${gate.gateId}' is unavailable.`);
  if (
    resolved.extensionId !== gate.extensionId ||
    resolved.extensionVersion !== gate.extensionVersion
  ) {
    return errorResult(
      gate.gateId,
      `Required gate '${gate.gateId}' was registered by ${gate.extensionId}@${gate.extensionVersion}, ` +
        `but the available provider is ${resolved.extensionId}@${resolved.extensionVersion}.`
    );
  }

  try {
    const modulePath = await resolveContainedExtensionPath(
      resolved.extensionRoot,
      resolved.contribution.module
    );
    const moduleUrl = `${pathToFileURL(modulePath).href}?openspec_gate=${Date.now()}-${Math.random()}`;
    const imported = await import(moduleUrl) as Record<string, unknown>;
    const provider = imported[resolved.contribution.export] as GateProviderV1 | undefined;
    if (!provider || typeof provider !== 'object' || typeof provider.evaluate !== 'function') {
      throw new Error(
        `Export '${resolved.contribution.export}' does not implement GateProviderV1.evaluate().`
      );
    }
    const changeDir = path.join(options.projectRoot, 'openspec', 'changes', options.changeName);
    const context = deepFreeze<GateContextV1>({
      projectRoot: options.projectRoot,
      changeName: options.changeName,
      changeDir,
      requestedAt: new Date().toISOString(),
      hostCapabilities: { ...options.hostCapabilities },
      priorRecord: structuredClone(gate),
    });
    const raw = await withTimeout(
      Promise.resolve(provider.evaluate(context)),
      resolved.contribution.timeoutMs,
      gate.gateId
    );
    const parsed = GateResultV1Schema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Gate '${gate.gateId}' returned an invalid result: ${parsed.error.message}`);
    }
    if (parsed.data.gateId !== gate.gateId) {
      throw new Error(
        `Gate provider '${gate.gateId}' returned result for '${parsed.data.gateId}'.`
      );
    }
    return parsed.data;
  } catch (error) {
    return errorResult(gate.gateId, (error as Error).message);
  }
}

export async function evaluateRequiredGates(
  options: EvaluateRequiredGatesOptions
): Promise<RequiredGateEvaluation> {
  const changeDir = path.join(options.projectRoot, 'openspec', 'changes', options.changeName);
  const record = await readRequiredGateRecord(changeDir);
  if (record.gates.length === 0) return { results: [], blocking: [], warnings: [] };
  const registry = await buildExtensionRegistrySnapshot({
    projectRoot: options.projectRoot,
    coreVersion: options.coreVersion,
    hostCapabilities: options.hostCapabilities,
  });
  const results: GateResultV1[] = [];
  const blocking: GateResultV1[] = [];
  const warnings: GateResultV1[] = [];

  for (const gate of record.gates) {
    const result = await evaluateOne(gate, options, registry);
    gate.lastResult = bindGateResult(result);
    results.push(result);
    if (result.status === 'warn') warnings.push(result);
    if (
      result.status === 'fail' ||
      result.status === 'error' ||
      (result.status === 'human_needed' && !hasFreshGateAcceptance(gate))
    ) {
      blocking.push(result);
    }
  }
  await writeRequiredGateRecord(changeDir, record);
  return { results, blocking, warnings };
}
