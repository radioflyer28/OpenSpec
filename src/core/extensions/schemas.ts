import { valid as validVersion, validRange } from 'semver';
import { z } from 'zod';
import { isKebabId } from '../id.js';

export const EXTENSION_API_V1 = 'openspec.dev/extensions/v1' as const;

export const HostCapabilityV1Schema = z.enum([
  'agentDispatch',
  'parallelism',
  'worktrees',
  'git',
  'structuredResults',
  'humanInteraction',
]);

const KebabIdSchema = (label: string): z.ZodString =>
  z.string().superRefine((value, ctx) => {
    if (!isKebabId(value)) {
      ctx.addIssue({
        code: 'custom',
        message: `${label} must be kebab-case with lowercase letters, numbers, and single hyphen separators`,
      });
    }
  });

const RelativeEntrySchema = z
  .string()
  .min(1)
  .refine((value) => !value.includes('\0'), 'entry path cannot contain a null byte');

const HostCapabilityRequirementsV1Schema = z
  .object({
    required: z.array(HostCapabilityV1Schema).default([]),
    optional: z.array(HostCapabilityV1Schema).default([]),
  })
  .strict()
  .superRefine((value, ctx) => {
    const required = new Set(value.required);
    for (const [index, capability] of value.optional.entries()) {
      if (required.has(capability)) {
        ctx.addIssue({
          code: 'custom',
          path: ['optional', index],
          message: `host capability '${capability}' cannot be both required and optional`,
        });
      }
    }
  });

export const WorkflowContributionV1Schema = z
  .object({
    id: KebabIdSchema('workflow id'),
    name: z.string().min(1),
    description: z.string().min(1),
    entry: RelativeEntrySchema,
    artifactRequirements: z.array(z.string().min(1)).default([]),
    gateDependencies: z.array(z.string().min(1)).default([]),
    requiredHostCapabilities: z.array(HostCapabilityV1Schema).default([]),
  })
  .strict();

export const GateContributionV1Schema = z
  .object({
    id: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/, 'gate id must use lowercase dot or hyphen separators'),
    module: RelativeEntrySchema,
    export: z.string().min(1).default('default'),
    timeoutMs: z.number().int().positive().max(300_000).default(30_000),
    requiredHostCapabilities: z.array(HostCapabilityV1Schema).default([]),
  })
  .strict();

const ContributionsV1Schema = z
  .object({
    workflows: z.array(WorkflowContributionV1Schema).default([]),
    gates: z.array(GateContributionV1Schema).default([]),
  })
  .strict()
  .superRefine((contributions, ctx) => {
    for (const kind of ['workflows', 'gates'] as const) {
      const seen = new Set<string>();
      for (const [index, contribution] of contributions[kind].entries()) {
        if (seen.has(contribution.id)) {
          ctx.addIssue({
            code: 'custom',
            path: [kind, index, 'id'],
            message: `duplicate ${kind} contribution id '${contribution.id}'`,
          });
        }
        seen.add(contribution.id);
      }
    }
  });

export const ExtensionManifestV1Schema = z
  .object({
    apiVersion: z.literal(EXTENSION_API_V1),
    id: KebabIdSchema('extension id'),
    version: z
      .string()
      .refine((value) => validVersion(value) !== null, 'version must be a valid semantic version'),
    requires: z
      .object({
        openspec: z
          .string()
          .min(1)
          .refine((value) => validRange(value) !== null, 'openspec must be a valid semantic version range'),
        hostCapabilities: HostCapabilityRequirementsV1Schema.default({
          required: [],
          optional: [],
        }),
      })
      .strict(),
    contributes: ContributionsV1Schema,
  })
  .strict();

export const GateStatusV1Schema = z.enum(['pass', 'fail', 'warn', 'human_needed', 'error']);

export const GateResultV1Schema = z
  .object({
    gateId: z.string().min(1),
    status: GateStatusV1Schema,
    summary: z.string().min(1),
    evidence: z.array(z.string().min(1)).default([]),
    remediation: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const HostCapabilitiesV1Schema = z
  .object({
    agentDispatch: z.boolean(),
    parallelism: z.boolean(),
    worktrees: z.boolean(),
    git: z.boolean(),
    structuredResults: z.boolean(),
    humanInteraction: z.boolean(),
  })
  .strict();

export const GateContextV1Schema = z
  .object({
    projectRoot: z.string().min(1),
    changeName: z.string().min(1),
    changeDir: z.string().min(1),
    requestedAt: z.string().datetime(),
    hostCapabilities: HostCapabilitiesV1Schema,
    priorRecord: z.unknown().optional(),
  })
  .strict();
