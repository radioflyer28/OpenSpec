import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { valid as validVersion } from 'semver';
import { AI_TOOLS } from '../config.js';
import {
  CommandAdapterRegistry,
  generateCommand,
  type CommandContent,
  type ToolCommandAdapter,
} from '../command-generation/index.js';
import {
  resolveCommandInvocation,
  resolveCommandSurfaceCapability,
  shouldGenerateCommandsForTool,
  shouldGenerateSkillsForTool,
} from '../command-surface.js';
import { getGlobalConfig, type Delivery } from '../global-config.js';
import { isKebabId } from '../id.js';
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

interface RetirementCandidate {
  extensionId: string;
  workflowId: string;
  toolId: string;
  surface: 'command' | 'skill';
  path: string;
  absolutePath: string;
}

interface ResolvedToolSurfaces {
  toolId: string;
  skillsDir: string;
  skills: boolean;
  commands: boolean;
  adapter?: ToolCommandAdapter;
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

function ownershipMarkerExtensions(
  content: string,
  candidate: RetirementCandidate
): Set<string> {
  const extensions = new Set<string>();
  const prefix = '<!-- openspec-extension:';
  const suffix = `/${candidate.workflowId}/${candidate.toolId}/${candidate.surface} -->`;
  for (const line of content.split(/\r?\n/)) {
    if (!line.startsWith(prefix) || !line.endsWith(suffix)) continue;
    const identity = line.slice(prefix.length, line.length - suffix.length);
    const separator = identity.lastIndexOf('@');
    if (separator <= 0) continue;
    const extensionId = identity.slice(0, separator);
    const version = identity.slice(separator + 1);
    if (isKebabId(extensionId) && validVersion(version) !== null) extensions.add(extensionId);
  }
  return extensions;
}

function recoveryPath(
  projectRoot: string,
  candidate: RetirementCandidate,
  content: string
): string {
  return path.join(
    projectRoot,
    'openspec',
    'extension-recovery',
    candidate.extensionId,
    candidate.workflowId,
    candidate.toolId,
    candidate.surface,
    `${contentDigest(content)}-${path.basename(candidate.absolutePath)}`
  );
}

async function assertRecoveryPathHasNoFilesystemAliases(
  projectRoot: string,
  recoveryArtifactPath: string
): Promise<void> {
  const root = path.resolve(projectRoot);
  const target = path.resolve(recoveryArtifactPath);
  FileSystemUtils.assertProjectArtifactPath(root, target);

  let current = root;
  for (const segment of path.relative(root, target).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    try {
      const stats = await fs.lstat(current);
      if (stats.isSymbolicLink()) {
        throw new Error(`Filesystem alias is not allowed in recovery path: ${current}`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    }
  }
}

function resolveToolSurfaces(toolId: string, delivery: Delivery): ResolvedToolSurfaces | undefined {
  const tool = AI_TOOLS.find((candidate) => candidate.value === toolId);
  if (!tool?.skillsDir) return undefined;
  return {
    toolId,
    skillsDir: tool.skillsDir,
    skills: shouldGenerateSkillsForTool(toolId, delivery),
    commands: shouldGenerateCommandsForTool(toolId, delivery),
    adapter: CommandAdapterRegistry.get(toolId),
  };
}

function commandArtifactPath(
  projectRoot: string,
  adapter: ToolCommandAdapter,
  workflowId: string
): string {
  const generatedPath = adapter.getFilePath(workflowId);
  return path.isAbsolute(generatedPath) ? generatedPath : path.join(projectRoot, generatedPath);
}

function skillArtifactPath(
  projectRoot: string,
  skillsDir: string,
  workflowId: string
): string {
  return path.join(projectRoot, skillsDir, 'skills', `openspec-${workflowId}`, 'SKILL.md');
}

function retirementCandidateKey(candidate: RetirementCandidate): string {
  return JSON.stringify([
    candidate.path,
    candidate.extensionId,
    candidate.workflowId,
    candidate.toolId,
    candidate.surface,
  ]);
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
    const surfaces = resolveToolSurfaces(toolId, delivery);
    if (!surfaces) {
      diagnostics.push(`Tool '${toolId}' has no supported skill directory; extension workflows were skipped.`);
      continue;
    }
    if (!surfaces.skills && !surfaces.commands) {
      diagnostics.push(
        `Tool '${toolId}' cannot represent extension workflows with delivery '${delivery}'.`
      );
      continue;
    }

    for (const workflow of workflows) {
      if (surfaces.commands) {
        if (!surfaces.adapter) {
          diagnostics.push(
            `Tool '${toolId}' has no command adapter for workflow '${workflow.workflow.id}'.`
          );
        } else {
          const generated = generateCommand(
            workflow.command,
            surfaces.adapter,
            Object.keys(extensionSkillNames)
          );
          const absolutePath = commandArtifactPath(
            context.projectRoot,
            surfaces.adapter,
            workflow.workflow.id
          );
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
      if (surfaces.skills) {
        const skillFile = skillArtifactPath(
          context.projectRoot,
          surfaces.skillsDir,
          workflow.workflow.id
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

function buildRetirementCandidates(
  context: ExtensionReconcileContext,
  workflows: NormalizedExtensionWorkflow[],
  configuredTools: string[],
  delivery: Delivery
): RetirementCandidate[] {
  const candidates = new Map<string, RetirementCandidate>();
  for (const toolId of configuredTools) {
    const surfaces = resolveToolSurfaces(toolId, delivery);
    if (!surfaces) continue;
    for (const workflow of workflows) {
      for (const workflowId of workflow.workflow.replaces) {
        if (surfaces.commands && surfaces.adapter) {
            const absolutePath = commandArtifactPath(
              context.projectRoot,
              surfaces.adapter,
              workflowId
            );
            const candidate: RetirementCandidate = {
              extensionId: workflow.extensionId,
              workflowId,
              toolId,
              surface: 'command',
              path: trackedPath(context.projectRoot, absolutePath),
              absolutePath,
            };
            candidates.set(retirementCandidateKey(candidate), candidate);
        }
        if (surfaces.skills) {
          const absolutePath = skillArtifactPath(
            context.projectRoot,
            surfaces.skillsDir,
            workflowId
          );
          const candidate: RetirementCandidate = {
            extensionId: workflow.extensionId,
            workflowId,
            toolId,
            surface: 'skill',
            path: trackedPath(context.projectRoot, absolutePath),
            absolutePath,
          };
          candidates.set(retirementCandidateKey(candidate), candidate);
        }
      }
    }
  }
  return [...candidates.values()].sort((left, right) => left.path.localeCompare(right.path));
}

async function retireCandidate(
  context: ExtensionReconcileContext,
  candidate: RetirementCandidate,
  prior: ExtensionGeneratedArtifactV1 | undefined,
  priorDiagnostics: readonly string[],
  diagnostics: string[]
): Promise<void> {
  let entry: Awaited<ReturnType<typeof fs.lstat>>;
  try {
    entry = await fs.lstat(candidate.absolutePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const priorOutcome = priorDiagnostics.find((diagnostic) =>
        diagnostic === `Deleted unchanged retired extension artifact at ${candidate.path}.`
        || diagnostic.startsWith(`Recovered retired extension artifact from ${candidate.path} to `)
      );
      if (priorOutcome) diagnostics.push(priorOutcome);
      return;
    }
    throw error;
  }
  if (!entry.isFile() || entry.isSymbolicLink()) {
    diagnostics.push(`Preserved unsafe retired extension entry at ${candidate.path}; expected a regular generated file.`);
    return;
  }
  const content = await fs.readFile(candidate.absolutePath, 'utf8');
  const priorMatches = prior !== undefined
    && prior.extensionId === candidate.extensionId
    && prior.workflowId === candidate.workflowId
    && prior.toolId === candidate.toolId
    && prior.surface === candidate.surface
    && contentDigest(content) === prior.contentDigest
    && content.includes(prior.ownershipMarker);
  if (priorMatches) {
    await fs.rm(candidate.absolutePath);
    await fs.rmdir(path.dirname(candidate.absolutePath)).catch(() => undefined);
    diagnostics.push(`Deleted unchanged retired extension artifact at ${candidate.path}.`);
    return;
  }
  const markerExtensions = ownershipMarkerExtensions(content, candidate);
  const conflictingExtension = [...markerExtensions].find(
    (extensionId) => extensionId !== candidate.extensionId
  );
  if (conflictingExtension !== undefined) {
    diagnostics.push(
      `Preserved retired-path ownership conflict at ${candidate.path}; `
      + `expected extension '${candidate.extensionId}' but found '${conflictingExtension}'.`
    );
    return;
  }
  if (!markerExtensions.has(candidate.extensionId)) {
    diagnostics.push(`Preserved retired-path entry at ${candidate.path}; matching extension ownership was not established.`);
    return;
  }

  const absoluteRecoveryPath = recoveryPath(context.projectRoot, candidate, content);
  const recovery = trackedPath(context.projectRoot, absoluteRecoveryPath);
  try {
    await assertRecoveryPathHasNoFilesystemAliases(
      context.projectRoot,
      absoluteRecoveryPath
    );
  } catch (error) {
    diagnostics.push(
      `Preserved retired extension artifact at ${candidate.path}; recovery path is unsafe: `
      + `${(error as Error).message}`
    );
    return;
  }
  await fs.mkdir(path.dirname(absoluteRecoveryPath), { recursive: true });
  let existingRecovery: string | undefined;
  try {
    existingRecovery = await fs.readFile(absoluteRecoveryPath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  if (existingRecovery !== undefined && existingRecovery !== content) {
    diagnostics.push(`Preserved retired extension artifact at ${candidate.path}; recovery collision at ${recovery}.`);
    return;
  }
  if (existingRecovery === undefined) {
    try {
      await fs.writeFile(absoluteRecoveryPath, content, { flag: 'wx' });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      existingRecovery = await fs.readFile(absoluteRecoveryPath, 'utf8');
      if (existingRecovery !== content) {
        diagnostics.push(`Preserved retired extension artifact at ${candidate.path}; recovery collision at ${recovery}.`);
        return;
      }
    }
  }
  await fs.rm(candidate.absolutePath);
  await fs.rmdir(path.dirname(candidate.absolutePath)).catch(() => undefined);
  diagnostics.push(`Recovered retired extension artifact from ${candidate.path} to ${recovery}.`);
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
  const retirementCandidates = buildRetirementCandidates(
    context,
    workflows,
    configuredTools,
    delivery
  );
  const previous = await readExtensionReconciliationRecord(context.projectRoot);
  const previousByPath = new Map(
    (previous?.artifacts ?? []).map((artifact) => [artifact.path, artifact] as const)
  );
  const desiredPaths = new Set(desired.map((artifact) => artifact.record.path));
  const retirementPaths = new Set(retirementCandidates.map((candidate) => candidate.path));
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

  for (const candidate of retirementCandidates) {
    if (desiredPaths.has(candidate.path)) {
      diagnostics.push(`Preserved retired-path entry at ${candidate.path}; the path is active for another generated workflow.`);
      continue;
    }
    await retireCandidate(
      context,
      candidate,
      previousByPath.get(candidate.path),
      previous?.diagnostics ?? [],
      diagnostics
    );
  }

  for (const prior of previous?.artifacts ?? []) {
    if (desiredPaths.has(prior.path) || retirementPaths.has(prior.path)) continue;
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
