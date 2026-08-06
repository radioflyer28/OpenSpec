import type { z } from 'zod';
import type {
  CommandContributionV1Schema,
  ExtensionManifestV1Schema,
  GateContextV1Schema,
  GateContributionV1Schema,
  GateResultV1Schema,
  HostCapabilitiesV1Schema,
  HostCapabilityV1Schema,
  SchemaContributionV1Schema,
  WorkflowContributionV1Schema,
} from './schemas.js';

export type HostCapabilityV1 = z.infer<typeof HostCapabilityV1Schema>;
export type HostCapabilitiesV1 = z.infer<typeof HostCapabilitiesV1Schema>;
export type WorkflowContributionV1 = z.infer<typeof WorkflowContributionV1Schema>;
export type SchemaContributionV1 = z.infer<typeof SchemaContributionV1Schema>;
export type CommandContributionV1 = z.infer<typeof CommandContributionV1Schema>;
export type GateContributionV1 = z.infer<typeof GateContributionV1Schema>;
export type ExtensionManifestV1 = z.infer<typeof ExtensionManifestV1Schema>;
export type GateContextV1 = z.infer<typeof GateContextV1Schema>;
export type GateResultV1 = z.infer<typeof GateResultV1Schema>;

export interface GateProviderV1 {
  evaluate(context: Readonly<GateContextV1>): Promise<GateResultV1> | GateResultV1;
}

export interface ExtensionDiagnosticV1 {
  code:
    | 'extension_api_unsupported'
    | 'extension_manifest_invalid'
    | 'extension_core_incompatible';
  path: string;
  message: string;
}

export interface ExtensionManifestLoadResultV1 {
  manifest?: ExtensionManifestV1;
  diagnostics: ExtensionDiagnosticV1[];
}
