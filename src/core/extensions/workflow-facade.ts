import type { Delivery } from '../global-config.js';
import {
  DEFAULT_EXTENSION_HOST_CAPABILITIES,
  type ExtensionReconcileContext,
  type ExtensionReconcileResult,
} from './lifecycle.js';
import { readExtensionLockfile } from './lockfile.js';
import {
  extensionLockDigest,
  readExtensionReconciliationRecord,
  writeExtensionReconciliationRecord,
} from './reconciliation.js';

export interface ReconcileProjectExtensionOptions {
  configuredTools?: string[];
  delivery?: Delivery;
}

/** Lifecycle-facing facade used after an extension lock mutation. */
export async function reconcileExtensionLifecycleWorkflows(
  context: ExtensionReconcileContext
): Promise<ExtensionReconcileResult> {
  const { reconcileExtensionWorkflows } = await import('./workflows.js');
  return reconcileExtensionWorkflows(context);
}

/** Update-facing facade that owns collection, reconciliation, and drift records. */
export async function reconcileProjectExtensionWorkflows(
  projectRoot: string,
  coreVersion: string,
  options: ReconcileProjectExtensionOptions = {}
): Promise<ExtensionReconcileResult | undefined> {
  const lockfile = await readExtensionLockfile(projectRoot);
  const prior = await readExtensionReconciliationRecord(projectRoot);
  if (Object.keys(lockfile.extensions).length === 0 && !prior) return undefined;
  const lockDigest = extensionLockDigest(lockfile);
  try {
    const { reconcileExtensionWorkflows } = await import('./workflows.js');
    const result = await reconcileExtensionWorkflows(
      {
        projectRoot,
        coreVersion,
        hostCapabilities: DEFAULT_EXTENSION_HOST_CAPABILITIES,
        lockfile,
      },
      options
    );
    await writeExtensionReconciliationRecord(projectRoot, {
      version: 1,
      lockDigest,
      status: 'ok',
      updatedAt: new Date().toISOString(),
      diagnostics: result.diagnostics,
      artifacts: result.artifacts,
    });
    return result;
  } catch (error) {
    await writeExtensionReconciliationRecord(projectRoot, {
      version: 1,
      lockDigest,
      status: 'error',
      updatedAt: new Date().toISOString(),
      error: (error as Error).message,
      diagnostics: [],
      artifacts: prior?.artifacts ?? [],
    });
    throw error;
  }
}
