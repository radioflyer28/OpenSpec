import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { AI_TOOLS } from '../config.js';
import {
  CommandAdapterRegistry,
  generateCommand,
  type CommandContent,
} from '../command-generation/index.js';
import {
  resolveCommandInvocation,
  resolveCommandSurfaceCapability,
  shouldGenerateCommandsForTool,
  shouldGenerateSkillsForTool,
} from '../command-surface.js';
import { getGlobalConfig, type Delivery } from '../global-config.js';
import { getConfiguredToolsForProfileSync } from '../profile-sync-drift.js';
import { generateSkillContent } from '../shared/skill-generation.js';
import type { SkillTemplate } from '../templates/types.js';
import { getTransformerForTool } from '../../utils/command-references.js';
import { FileSystemUtils } from '../../utils/file-system.js';
import type { ExtensionReconcileContext, ExtensionReconcileResult } from './lifecycle.js';
import { resolveContainedExtensionPath } from './paths.js';
import type { ExtensionRegistrySnapshot } from './registry.js';
import {
  readExtensionReconciliationRecord,
  type ExtensionGeneratedArtifactV1,
} from './reconciliation.js';
import type { WorkflowContributionV1 } from './types.js';

export interface NormalizedExtensionWorkflow {
  extensionId: string;
  extensionVersion: string;
  extensionRoot: string;
  workflow: WorkflowContributionV1;
  command: CommandContent;
  skill: SkillTemplate;
}

export interface ReconcileExtensionWorkflowOptions {
  configuredTools?: string[];
  delivery?: Delivery;
}

interface DesiredArtifact {
  record: ExtensionGeneratedArtifactV1;
  absolutePath: string;
  content: string;
}

function contentDigest(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function ownershipMarker(
  extensionId: string,
  extensionVersion: string,
  workflowId: string,
  toolId: string,
  surface: 'command' | 'skill'
): string {
  return `<!-- openspec-extension:${extensionId}@${extensionVersion}/${workflowId}/${toolId}/${surface} -->`;
}

function trackedPath(projectRoot: string, absolutePath: string): string {
  const relative = path.relative(projectRoot, absolutePath);
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative)
    ? relative
    : absolutePath;
}

function absoluteTrackedPath(projectRoot: string, artifactPath: string): string {
  return path.isAbsolute(artifactPath) ? artifactPath : path.join(projectRoot, artifactPath);
}

function withOwnership(content: string, marker: string): string {
  return `${content.replace(/\s+$/, '')}\n\n${marker}\n`;
}

export async function normalizeExtensionWorkflows(
  snapshot: ExtensionRegistrySnapshot
): Promise<NormalizedExtensionWorkflow[]> {
  const normalized: NormalizedExtensionWorkflow[] = [];
  for (const resolved of snapshot.workflows) {
    const entryPath = await resolveContainedExtensionPath(
      resolved.extensionRoot,
      resolved.contribution.entry
    );
    const instructions = await fs.readFile(entryPath, 'utf8');
    const command: CommandContent = {
      id: resolved.contribution.id,
      name: resolved.contribution.name,
      description: resolved.contribution.description,
      category: 'Workflow',
      tags: ['openspec', 'extension', resolved.extensionId],
      body: instructions,
    };
    normalized.push({
      extensionId: resolved.extensionId,
      extensionVersion: resolved.extensionVersion,
      extensionRoot: resolved.extensionRoot,
      workflow: resolved.contribution,
      command,
      skill: {
        name: `openspec-${resolved.contribution.id}`,
        description: resolved.contribution.description,
        instructions,
        license: 'MIT',
        compatibility: 'Requires openspec CLI and the contributing extension.',
        metadata: {
          author: resolved.extensionId,
          version: resolved.extensionVersion,
        },
      },
    });
  }
  return normalized;
}

function desiredArtifact(
  context: ExtensionReconcileContext,
  workflow: NormalizedExtensionWorkflow,
  toolId: string,
  surface: 'command' | 'skill',
  absolutePath: string,
  generatedContent: string
): DesiredArtifact {
  const marker = ownershipMarker(
    workflow.extensionId,
    workflow.extensionVersion,
    workflow.workflow.id,
    toolId,
    surface
  );
  const content = withOwnership(generatedContent, marker);
  return {
    absolutePath,
    content,
    record: {
      extensionId: workflow.extensionId,
      extensionVersion: workflow.extensionVersion,
      workflowId: workflow.workflow.id,
      toolId,
      surface,
      path: trackedPath(context.projectRoot, absolutePath),
      contentDigest: contentDigest(content),
      ownershipMarker: marker,
    },
  };
}

async function buildDesiredArtifacts(
  context: ExtensionReconcileContext,
  workflows: NormalizedExtensionWorkflow[],
  configuredTools: string[],
  delivery: Delivery,
  diagnostics: string[]
): Promise<DesiredArtifact[]> {
  const desired: DesiredArtifact[] = [];
  const extensionSkillNames = Object.fromEntries(
    workflows.map((workflow) => [workflow.workflow.id, workflow.skill.name])
  );
  for (const toolId of configuredTools) {
    const tool = AI_TOOLS.find((candidate) => candidate.value === toolId);
    if (!tool?.skillsDir) {
      diagnostics.push(`Tool '${toolId}' has no supported skill directory; extension workflows were skipped.`);
      continue;
    }
    const skills = shouldGenerateSkillsForTool(toolId, delivery);
    const commands = shouldGenerateCommandsForTool(toolId, delivery);
    if (!skills && !commands) {
      diagnostics.push(
        `Tool '${toolId}' cannot represent extension workflows with delivery '${delivery}'.`
      );
      continue;
    }

    for (const workflow of workflows) {
      if (commands) {
        const adapter = CommandAdapterRegistry.get(toolId);
        if (!adapter) {
          diagnostics.push(
            `Tool '${toolId}' has no command adapter for workflow '${workflow.workflow.id}'.`
          );
        } else {
          const generated = generateCommand(
            workflow.command,
            adapter,
            Object.keys(extensionSkillNames)
          );
          const absolutePath = path.isAbsolute(generated.path)
            ? generated.path
            : path.join(context.projectRoot, generated.path);
          desired.push(
            desiredArtifact(
              context,
              workflow,
              toolId,
              'command',
              absolutePath,
              generated.fileContent
            )
          );
        }
      }
      if (skills) {
        const skillFile = path.join(
          context.projectRoot,
          tool.skillsDir,
          'skills',
          workflow.skill.name,
          'SKILL.md'
        );
        const transformer = getTransformerForTool(
          toolId,
          delivery,
          resolveCommandSurfaceCapability(toolId),
          resolveCommandInvocation(toolId),
          extensionSkillNames
        );
        desired.push(
          desiredArtifact(
            context,
            workflow,
            toolId,
            'skill',
            skillFile,
            generateSkillContent(workflow.skill, context.coreVersion, transformer)
          )
        );
      }
    }
  }
  return desired;
}

export async function reconcileExtensionWorkflows(
  context: ExtensionReconcileContext,
  options: ReconcileExtensionWorkflowOptions = {}
): Promise<ExtensionReconcileResult> {
  const { buildExtensionRegistrySnapshot } = await import('./registry.js');
  const { ALL_WORKFLOWS } = await import('../profiles.js');
  const snapshot = await buildExtensionRegistrySnapshot({
    projectRoot: context.projectRoot,
    coreVersion: context.coreVersion,
    hostCapabilities: context.hostCapabilities,
    builtinIds: {
      workflows: ALL_WORKFLOWS,
    },
  });
  const workflows = await normalizeExtensionWorkflows(snapshot);
  const delivery = options.delivery ?? getGlobalConfig().delivery ?? 'both';
  const configuredTools = options.configuredTools ?? getConfiguredToolsForProfileSync(context.projectRoot);
  const diagnostics = snapshot.diagnostics.map((diagnostic) => diagnostic.message);
  const desired = await buildDesiredArtifacts(
    context,
    workflows,
    configuredTools,
    delivery,
    diagnostics
  );
  const previous = await readExtensionReconciliationRecord(context.projectRoot);
  const previousByPath = new Map(
    (previous?.artifacts ?? []).map((artifact) => [artifact.path, artifact] as const)
  );
  const desiredPaths = new Set(desired.map((artifact) => artifact.record.path));
  const artifacts: ExtensionGeneratedArtifactV1[] = [];

  for (const artifact of desired) {
    const prior = previousByPath.get(artifact.record.path);
    let existing: string | undefined;
    try {
      existing = await fs.readFile(artifact.absolutePath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    if (existing !== undefined) {
      if (!prior) {
        diagnostics.push(`Preserved untracked file at ${artifact.record.path}; extension artifact was not generated.`);
        continue;
      }
      if (
        contentDigest(existing) !== prior.contentDigest ||
        !existing.includes(prior.ownershipMarker)
      ) {
        diagnostics.push(`Preserved modified extension artifact at ${artifact.record.path}.`);
        continue;
      }
    }
    await FileSystemUtils.writeFile(artifact.absolutePath, artifact.content);
    artifacts.push(artifact.record);
  }

  for (const prior of previous?.artifacts ?? []) {
    if (desiredPaths.has(prior.path)) continue;
    const absolutePath = absoluteTrackedPath(context.projectRoot, prior.path);
    let content: string;
    try {
      content = await fs.readFile(absolutePath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw error;
    }
    if (
      contentDigest(content) === prior.contentDigest &&
      content.includes(prior.ownershipMarker)
    ) {
      await fs.rm(absolutePath);
      await fs.rmdir(path.dirname(absolutePath)).catch(() => undefined);
    } else {
      diagnostics.push(`Cleanup preserved modified extension artifact at ${prior.path}.`);
    }
  }

  return { artifacts, diagnostics };
}
