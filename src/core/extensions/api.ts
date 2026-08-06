import { EXTENSION_API_V1 } from './schemas.js';

/**
 * Public, structural feature marker for the v1 extension API.
 *
 * Consumers must probe this export instead of inferring API availability from
 * the OpenSpec package version. Official and fork distributions can otherwise
 * share a semver-compatible version while exposing different public subpaths.
 */
export interface ExtensionApiProviderV1 {
  apiVersion: typeof EXTENSION_API_V1;
  manifestVersion: 1;
  contributionKinds: readonly ['workflows', 'gates'];
}

export const OPEN_SPEC_EXTENSION_API_V1: ExtensionApiProviderV1 = Object.freeze({
  apiVersion: EXTENSION_API_V1,
  manifestVersion: 1,
  contributionKinds: Object.freeze(['workflows', 'gates'] as const),
});

export function providesExtensionApiV1(value: unknown): value is ExtensionApiProviderV1 {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<ExtensionApiProviderV1>;
  return candidate.apiVersion === EXTENSION_API_V1
    && candidate.manifestVersion === 1
    && Array.isArray(candidate.contributionKinds)
    && candidate.contributionKinds.length === 2
    && candidate.contributionKinds[0] === 'workflows'
    && candidate.contributionKinds[1] === 'gates';
}
