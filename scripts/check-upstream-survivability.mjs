#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const config = JSON.parse(readFileSync(new URL('./upstream-survivability.json', import.meta.url), 'utf8'));
const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};
const prepareOnly = args.includes('--prepare-only');
const upstreamUrl = valueAfter('--upstream-url') ?? config.upstreamUrl;
const upstreamBranch = valueAfter('--upstream-branch') ?? config.upstreamBranch;
const pathsPath = valueAfter('--paths');
const allowedPaths = pathsPath
  ? JSON.parse(readFileSync(path.resolve(pathsPath), 'utf8')).paths
  : config.paths;

function git(commandArgs, options = {}) {
  return execFileSync('git', commandArgs, {
    cwd: options.cwd ?? process.cwd(),
    encoding: options.encoding ?? 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  });
}

function run(command, commandArgs, cwd) {
  const result = spawnSync(command, commandArgs, { cwd, stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${commandArgs.join(' ')} failed with exit code ${result.status}.`);
  }
}

let tempRoot;
let worktree;
try {
  const originUrl = git(['remote', 'get-url', 'origin']).trim();
  if (originUrl === upstreamUrl) {
    throw new Error(
      `origin and upstream must be distinct; both resolve to '${upstreamUrl}'. ` +
      'Run this check from the maintained fork.'
    );
  }
  try {
    git(['remote', 'get-url', 'upstream']);
    git(['remote', 'set-url', 'upstream', upstreamUrl]);
  } catch {
    git(['remote', 'add', 'upstream', upstreamUrl]);
  }
  git([
    'fetch', '--no-tags', 'upstream',
    `+refs/heads/${upstreamBranch}:refs/remotes/upstream/${upstreamBranch}`,
  ], { stdio: 'inherit' });
  const upstreamRef = `upstream/${upstreamBranch}`;
  const upstreamRevision = git(['rev-parse', '--verify', `${upstreamRef}^{commit}`]).trim();
  const mergeBase = git(['merge-base', 'HEAD', upstreamRef]).trim();
  // A one-revision diff includes staged hardening files during local verification
  // and is identical to mergeBase..HEAD in clean CI checkouts.
  const patch = git(['diff', '--binary', mergeBase, '--', ...allowedPaths]);
  if (patch.length === 0) {
    throw new Error(
      `Generated extension seam patch is empty (merge base ${mergeBase}, HEAD ` +
      `${git(['rev-parse', 'HEAD']).trim()}).`
    );
  }

  tempRoot = mkdtempSync(path.join(os.tmpdir(), 'openspec-upstream-survivability-'));
  worktree = path.join(tempRoot, 'upstream');
  const patchPath = path.join(tempRoot, 'extension-seam.patch');
  writeFileSync(patchPath, patch);
  git(['worktree', 'add', '--detach', worktree, upstreamRevision], { stdio: 'inherit' });
  try {
    git(['apply', '--check', '--verbose', patchPath], { cwd: worktree });
  } catch (error) {
    throw new Error(
      `Extension seam patch does not apply to ${upstreamRef} (${upstreamRevision}). ` +
      `${error instanceof Error ? error.message : String(error)}`
    );
  }
  git(['apply', patchPath], { cwd: worktree });

  if (!prepareOnly) {
    for (const [command, ...commandArgs] of config.verificationCommands) {
      run(command, commandArgs, worktree);
    }
  }
  console.log(JSON.stringify({
    originUrl,
    upstreamUrl,
    upstreamRef,
    upstreamRevision,
    mergeBase,
    patchBytes: Buffer.byteLength(patch),
    paths: allowedPaths,
    verified: !prepareOnly,
  }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  if (worktree) {
    try {
      git(['worktree', 'remove', '--force', worktree], { stdio: 'ignore' });
    } catch {
      // The temp path is removed below; a later `git worktree prune` can clear
      // metadata if Git itself could not unregister an interrupted worktree.
    }
  }
  if (tempRoot) rmSync(tempRoot, { recursive: true, force: true });
}
