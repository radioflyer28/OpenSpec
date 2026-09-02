import { promises as fs } from 'node:fs';
import path from 'node:path';

function isContainedWith(pathApi: typeof path.posix | typeof path.win32, root: string, target: string): boolean {
  const relative = pathApi.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${pathApi.sep}`) && relative !== '..' && !pathApi.isAbsolute(relative));
}

export function isExtensionPathContained(root: string, target: string): boolean {
  const pathApi = /^[A-Za-z]:[\\/]/.test(root) || root.startsWith('\\\\') ? path.win32 : path;
  return isContainedWith(pathApi, pathApi.resolve(root), pathApi.resolve(target));
}

export interface ResolvedLocalExtensionLink {
  canonicalPath: string;
  lockPath: string;
}

export async function resolveLocalExtensionLink(
  projectRoot: string,
  inputPath: string
): Promise<ResolvedLocalExtensionLink> {
  const resolvedProject = await fs.realpath(projectRoot);
  const candidate = path.isAbsolute(inputPath) ? inputPath : path.resolve(projectRoot, inputPath);
  const canonicalPath = await fs.realpath(candidate);
  const stat = await fs.stat(canonicalPath);
  if (!stat.isDirectory()) {
    throw new Error(`Extension link target is not a directory: ${inputPath}`);
  }

  const lockPath = isExtensionPathContained(resolvedProject, canonicalPath)
    ? path.relative(resolvedProject, canonicalPath) || '.'
    : canonicalPath;
  return { canonicalPath, lockPath };
}

export async function resolveContainedExtensionPath(
  extensionRoot: string,
  referencedPath: string
): Promise<string> {
  if (referencedPath.includes('\0')) {
    throw new Error('Extension path contains a null byte.');
  }
  const canonicalRoot = await fs.realpath(extensionRoot);
  const candidate = path.resolve(canonicalRoot, referencedPath);
  const canonicalTarget = await fs.realpath(candidate).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') {
      throw new Error(`Extension path does not exist: ${referencedPath}`);
    }
    throw error;
  });

  if (!isExtensionPathContained(canonicalRoot, canonicalTarget)) {
    throw new Error(`Extension path resolves outside its package root: ${referencedPath}`);
  }
  return canonicalTarget;
}
