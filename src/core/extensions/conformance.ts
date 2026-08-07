import { promises as fs } from 'node:fs';
import path from 'node:path';
import { loadExtensionManifestV1 } from './manifest.js';
import { resolveContainedExtensionPath } from './paths.js';
import type { ExtensionManifestV1 } from './types.js';

export interface ExtensionConformanceDiagnosticV1 {
  code: 'manifest' | 'workflow' | 'gate';
  path: string;
  message: string;
}

export interface ExtensionConformanceResultV1 {
  valid: boolean;
  manifest?: ExtensionManifestV1;
  diagnostics: ExtensionConformanceDiagnosticV1[];
}

export interface ExtensionConformanceOptionsV1 {
  extensionRoot: string;
  coreVersion: string;
  extensionApiProvider?: unknown;
}

export async function checkExtensionConformanceV1(
  options: ExtensionConformanceOptionsV1
): Promise<ExtensionConformanceResultV1> {
  const diagnostics: ExtensionConformanceDiagnosticV1[] = [];
  let raw: unknown;
  try {
    raw = JSON.parse(
      await fs.readFile(path.join(options.extensionRoot, 'openspec-extension.json'), 'utf8')
    );
  } catch (error) {
    return {
      valid: false,
      diagnostics: [{
        code: 'manifest',
        path: 'openspec-extension.json',
        message: (error as Error).message,
      }],
    };
  }
  const loaded = loadExtensionManifestV1(
    raw,
    options.coreVersion,
    Object.prototype.hasOwnProperty.call(options, 'extensionApiProvider')
      ? options.extensionApiProvider
      : undefined
  );
  if (!loaded.manifest) {
    return {
      valid: false,
      diagnostics: loaded.diagnostics.map((diagnostic) => ({
        code: 'manifest' as const,
        path: diagnostic.path,
        message: diagnostic.message,
      })),
    };
  }

  for (const workflow of loaded.manifest.contributes.workflows) {
    try {
      const entry = await resolveContainedExtensionPath(options.extensionRoot, workflow.entry);
      await fs.readFile(entry, 'utf8');
    } catch (error) {
      diagnostics.push({ code: 'workflow', path: workflow.entry, message: (error as Error).message });
    }
  }
  for (const gate of loaded.manifest.contributes.gates) {
    try {
      const modulePath = await resolveContainedExtensionPath(options.extensionRoot, gate.module);
      const stat = await fs.stat(modulePath);
      if (!stat.isFile()) throw new Error('Gate module is not a file.');
    } catch (error) {
      diagnostics.push({ code: 'gate', path: gate.module, message: (error as Error).message });
    }
  }
  return {
    valid: diagnostics.length === 0,
    manifest: loaded.manifest,
    diagnostics,
  };
}

export async function assertExtensionConformanceV1(
  options: ExtensionConformanceOptionsV1
): Promise<ExtensionManifestV1> {
  const result = await checkExtensionConformanceV1(options);
  if (!result.valid || !result.manifest) {
    throw new Error(
      `Extension conformance failed: ${result.diagnostics
        .map((diagnostic) => `${diagnostic.code}:${diagnostic.path}: ${diagnostic.message}`)
        .join('; ')}`
    );
  }
  return result.manifest;
}
