import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseSchema } from '../artifact-graph/schema.js';
import { loadExtensionManifestV1 } from './manifest.js';
import { resolveContainedExtensionPath, isExtensionPathContained } from './paths.js';
import type { ExtensionManifestV1 } from './types.js';

export interface ExtensionConformanceDiagnosticV1 {
  code: 'manifest' | 'workflow' | 'schema' | 'command' | 'gate';
  path: string;
  message: string;
}

export interface ExtensionConformanceResultV1 {
  valid: boolean;
  manifest?: ExtensionManifestV1;
  diagnostics: ExtensionConformanceDiagnosticV1[];
}

export async function checkExtensionConformanceV1(options: {
  extensionRoot: string;
  coreVersion: string;
}): Promise<ExtensionConformanceResultV1> {
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
  const loaded = loadExtensionManifestV1(raw, options.coreVersion);
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
  for (const command of loaded.manifest.contributes.commands) {
    try {
      const entry = await resolveContainedExtensionPath(options.extensionRoot, command.entry);
      await fs.readFile(entry, 'utf8');
    } catch (error) {
      diagnostics.push({ code: 'command', path: command.entry, message: (error as Error).message });
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
  for (const contribution of loaded.manifest.contributes.schemas) {
    try {
      const contributedPath = await resolveContainedExtensionPath(
        options.extensionRoot,
        contribution.path
      );
      const stat = await fs.stat(contributedPath);
      const schemaPath = stat.isDirectory()
        ? path.join(contributedPath, 'schema.yaml')
        : contributedPath;
      const schemaDir = path.dirname(schemaPath);
      const schema = parseSchema(await fs.readFile(schemaPath, 'utf8'));
      if (schema.name !== contribution.id) {
        throw new Error(
          `Contribution id '${contribution.id}' does not match schema name '${schema.name}'.`
        );
      }
      for (const artifact of schema.artifacts) {
        const templatePath = await fs.realpath(path.resolve(schemaDir, artifact.template));
        const canonicalDir = await fs.realpath(schemaDir);
        if (!isExtensionPathContained(canonicalDir, templatePath)) {
          throw new Error(`Template escapes the contributed schema directory: ${artifact.template}`);
        }
      }
    } catch (error) {
      diagnostics.push({
        code: 'schema',
        path: contribution.path,
        message: (error as Error).message,
      });
    }
  }

  return {
    valid: diagnostics.length === 0,
    manifest: loaded.manifest,
    diagnostics,
  };
}

export async function assertExtensionConformanceV1(options: {
  extensionRoot: string;
  coreVersion: string;
}): Promise<ExtensionManifestV1> {
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
