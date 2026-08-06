import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { getGlobalDataDir } from '../global-config.js';

export type ExtensionCommandRunner = (command: string, args: string[]) => Promise<string>;

const defaultRunner: ExtensionCommandRunner = async (command, args) =>
  new Promise<string>((resolve, reject) => {
    const executable = process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command;
    const child = spawn(executable, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: false });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (chunk) => (stdout += chunk));
    child.stderr.setEncoding('utf8').on('data', (chunk) => (stderr += chunk));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${command} ${args[0] ?? ''} failed (${code}): ${stderr.trim()}`));
    });
  });

interface NpmPackRecord {
  filename: string;
  integrity: string;
  name: string;
  version: string;
}

export interface AcquireRegistryExtensionOptions {
  packageSpec: string;
  globalDataDir?: string;
  runner?: ExtensionCommandRunner;
}

export interface AcquiredRegistryExtension {
  packageRoot: string;
  cacheKey: string;
  integrity: string;
  name: string;
  version: string;
}

function packageNameSegments(name: string): string[] {
  if (/^@[a-z0-9._-]+\/[a-z0-9._-]+$/i.test(name)) return name.split('/');
  if (/^[a-z0-9._-]+$/i.test(name)) return [name];
  throw new Error(`Registry returned unsafe package name '${name}'.`);
}

export async function acquireRegistryExtension(
  options: AcquireRegistryExtensionOptions
): Promise<AcquiredRegistryExtension> {
  const runner = options.runner ?? defaultRunner;
  const dataRoot = options.globalDataDir ?? getGlobalDataDir();
  const extensionsRoot = path.join(dataRoot, 'extensions');
  const workRoot = await fs.mkdtemp(path.join(extensionsRoot, '.acquire-').replace(/([^/\\]+)$/, '$1'))
    .catch(async (error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
      await fs.mkdir(extensionsRoot, { recursive: true });
      return fs.mkdtemp(path.join(extensionsRoot, '.acquire-'));
    });

  try {
    const packedOutput = await runner('npm', [
      'pack',
      options.packageSpec,
      '--json',
      '--ignore-scripts',
      '--pack-destination',
      workRoot,
    ]);
    const packed = JSON.parse(packedOutput) as NpmPackRecord[];
    const record = packed[0];
    if (!record?.filename || !record.integrity || !record.name || !record.version) {
      throw new Error(`npm pack returned incomplete metadata for '${options.packageSpec}'.`);
    }

    const cacheKey = createHash('sha256').update(record.integrity).digest('hex');
    const cacheRoot = path.join(extensionsRoot, 'cache');
    const packageRoot = path.join(cacheRoot, cacheKey);
    try {
      await fs.access(path.join(packageRoot, 'openspec-extension.json'));
      return { packageRoot, cacheKey, integrity: record.integrity, name: record.name, version: record.version };
    } catch {
      // Install the packed archive into an isolated prefix below.
    }

    const staging = path.join(workRoot, 'staging');
    const tarball = path.join(workRoot, path.basename(record.filename));
    await runner('npm', [
      'install',
      '--ignore-scripts',
      '--no-save',
      '--no-package-lock',
      '--prefix',
      staging,
      tarball,
    ]);
    const stagedPackage = path.join(staging, 'node_modules', ...packageNameSegments(record.name));
    await fs.access(path.join(stagedPackage, 'openspec-extension.json'));
    await fs.mkdir(cacheRoot, { recursive: true });
    try {
      await fs.rename(stagedPackage, packageRoot);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }

    return { packageRoot, cacheKey, integrity: record.integrity, name: record.name, version: record.version };
  } finally {
    await fs.rm(workRoot, { recursive: true, force: true });
  }
}
