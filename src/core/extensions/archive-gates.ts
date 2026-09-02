import path from 'node:path';
import { evaluateRequiredGates } from './gates-evaluate.js';
import { recordGateOverride } from './gates-record.js';
import type { GateResultV1, HostCapabilitiesV1 } from './types.js';

export interface ExtensionArchiveGateDiagnostic {
  code: 'archive_gate_blocked' | 'archive_gate_override_invalid';
  message: string;
  fix?: string;
  gateId?: string;
  gateStatus?: GateResultV1['status'];
  evidence?: string[];
  remediation?: string[];
  blockingGates: string[];
}

export class ExtensionArchiveGateError extends Error {
  readonly diagnostic: ExtensionArchiveGateDiagnostic;

  constructor(diagnostic: ExtensionArchiveGateDiagnostic) {
    super(diagnostic.message);
    this.name = 'ExtensionArchiveGateError';
    this.diagnostic = diagnostic;
  }
}

export interface EnforceExtensionArchiveGatesOptions {
  projectRoot: string;
  changeName: string;
  coreVersion: string;
  hostCapabilities: HostCapabilitiesV1;
  overrideGate?: string | string[];
  reason?: string;
  actor?: string;
}

export interface ExtensionArchiveGateDecision {
  warnings: GateResultV1[];
  overridden: string[];
  messages: string[];
}

function invalidOverride(
  message: string,
  blockingGates: string[],
  fix: string
): ExtensionArchiveGateError {
  return new ExtensionArchiveGateError({
    code: 'archive_gate_override_invalid',
    message,
    blockingGates,
    fix,
  });
}

/**
 * Generic archive boundary for extension gates. Core archive orchestration
 * receives only an allow/block decision, human messages, and result summaries;
 * extension discovery, evaluation, override validation, and audit writes stay
 * behind this facade.
 */
export async function enforceExtensionArchiveGates(
  options: EnforceExtensionArchiveGatesOptions
): Promise<ExtensionArchiveGateDecision> {
  const overrideIds = options.overrideGate === undefined
    ? []
    : Array.isArray(options.overrideGate)
      ? options.overrideGate
      : [options.overrideGate];
  const hasOverride = overrideIds.length > 0;
  const reasonProvided = options.reason !== undefined;
  const reason = typeof options.reason === 'string' ? options.reason.trim() : '';
  if (hasOverride !== reasonProvided || (hasOverride && reason.length === 0)) {
    throw invalidOverride(
      'Gate overrides require both --override-gate <id> and --reason <text>.',
      [],
      'Pass both options together, or remove both.'
    );
  }

  const evaluation = await evaluateRequiredGates({
    projectRoot: options.projectRoot,
    changeName: options.changeName,
    coreVersion: options.coreVersion,
    hostCapabilities: options.hostCapabilities,
  });
  const blockingIds = evaluation.blocking.map((result) => result.gateId);
  const overridden = [...new Set(overrideIds)];
  if (hasOverride) {
    const unknown = overridden.filter((id) => !blockingIds.includes(id));
    if (unknown.length > 0) {
      throw invalidOverride(
        `Gate override targets are not currently blocking: ${unknown.join(', ')}. ` +
          `Currently blocking gates: ${blockingIds.join(', ') || 'none'}.`,
        blockingIds,
        'Override only a currently blocking required gate.'
      );
    }
    const actor = options.actor ?? process.env.OPENSPEC_ACTOR ?? process.env.GIT_AUTHOR_NAME
      ?? process.env.USER ?? process.env.USERNAME;
    const changeDir = path.join(options.projectRoot, 'openspec', 'changes', options.changeName);
    for (const gateId of overridden) {
      await recordGateOverride(changeDir, gateId, {
        reason,
        ...(actor ? { actor } : {}),
      });
    }
  }

  const remaining = evaluation.blocking.filter((result) => !overridden.includes(result.gateId));
  if (remaining.length > 0) {
    const first = remaining[0];
    throw new ExtensionArchiveGateError({
      code: 'archive_gate_blocked',
      message: `Archive blocked by required gate${remaining.length === 1 ? '' : 's'}: ` +
        remaining.map((result) => `${result.gateId} (${result.status}): ${result.summary}`).join('; '),
      gateId: first.gateId,
      gateStatus: first.status,
      evidence: first.evidence,
      remediation: first.remediation,
      blockingGates: remaining.map((result) => result.gateId),
      fix: `Restore or satisfy the gate, run openspec extension doctor, or rerun with --override-gate ${first.gateId} --reason <text>.`,
    });
  }

  return {
    warnings: evaluation.warnings,
    overridden,
    messages: [
      ...evaluation.warnings.map((warning) =>
        `Gate warning ${warning.gateId}: ${warning.summary}`
      ),
      ...overridden.map((gateId) => `Gate override recorded for ${gateId}: ${reason}`),
    ],
  };
}
