import { satisfies, valid as validVersion } from 'semver';
import { OPEN_SPEC_EXTENSION_API_V1, providesExtensionApiV1 } from './api.js';
import { EXTENSION_API_V1, ExtensionManifestV1Schema } from './schemas.js';
import type {
  ExtensionDiagnosticV1,
  ExtensionManifestLoadResultV1,
} from './types.js';

function issuePath(path: PropertyKey[]): string {
  return path.map(String).join('.');
}

export function loadExtensionManifestV1(
  input: unknown,
  coreVersion: string,
  extensionApiProvider: unknown = OPEN_SPEC_EXTENSION_API_V1
): ExtensionManifestLoadResultV1 {
  const apiVersion =
    typeof input === 'object' && input !== null && 'apiVersion' in input
      ? (input as { apiVersion?: unknown }).apiVersion
      : undefined;

  if (apiVersion !== EXTENSION_API_V1) {
    return {
      diagnostics: [
        {
          code: 'extension_api_unsupported',
          path: 'apiVersion',
          message: `Unsupported extension API version '${String(apiVersion)}'; expected '${EXTENSION_API_V1}'.`,
        },
      ],
    };
  }

  if (!providesExtensionApiV1(extensionApiProvider)) {
    return {
      diagnostics: [
        {
          code: 'extension_api_unavailable',
          path: 'apiVersion',
          message: `The installed OpenSpec distribution does not provide '${EXTENSION_API_V1}'. Install an API-bearing OpenSpec distribution before installing or enabling this extension.`,
        },
      ],
    };
  }

  const contributes = typeof input === 'object' && input !== null
    && 'contributes' in input && typeof input.contributes === 'object'
    && input.contributes !== null
    ? input.contributes as Record<string, unknown>
    : undefined;
  for (const unsupported of ['schemas', 'commands'] as const) {
    if (contributes && Object.prototype.hasOwnProperty.call(contributes, unsupported)) {
      return {
        diagnostics: [{
          code: 'extension_manifest_invalid',
          path: `contributes.${unsupported}`,
          message: `Contribution collection '${unsupported}' is not supported by ${EXTENSION_API_V1}.`,
        }],
      };
    }
  }

  const parsed = ExtensionManifestV1Schema.safeParse(input);
  if (!parsed.success) {
    return {
      diagnostics: parsed.error.issues.map((issue): ExtensionDiagnosticV1 => ({
        code: 'extension_manifest_invalid',
        path: issuePath(issue.path),
        message: issue.message,
      })),
    };
  }

  if (validVersion(coreVersion) === null) {
    return {
      diagnostics: [
        {
          code: 'extension_core_incompatible',
          path: 'requires.openspec',
          message: `Running OpenSpec version '${coreVersion}' is not a valid semantic version.`,
        },
      ],
    };
  }

  if (!satisfies(coreVersion, parsed.data.requires.openspec, { includePrerelease: true })) {
    return {
      diagnostics: [
        {
          code: 'extension_core_incompatible',
          path: 'requires.openspec',
          message: `Extension '${parsed.data.id}' ${parsed.data.version} requires OpenSpec '${parsed.data.requires.openspec}', but the running version is '${coreVersion}'.`,
        },
      ],
    };
  }

  return { manifest: parsed.data, diagnostics: [] };
}
