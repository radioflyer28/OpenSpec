import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const roots: string[] = [];
const script = path.join(process.cwd(), 'scripts', 'check-upstream-survivability.mjs');

function git(cwd: string, args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

async function fixture(withPatch: boolean) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'openspec-upstream-script-'));
  roots.push(root);
  const official = path.join(root, 'official');
  const forkRemote = path.join(root, 'fork.git');
  const fork = path.join(root, 'fork');
  await mkdir(official);
  git(official, ['init', '-b', 'main']);
  git(official, ['config', 'user.name', 'Fixture']);
  git(official, ['config', 'user.email', 'fixture@example.com']);
  await writeFile(path.join(official, 'base.txt'), 'official\n');
  git(official, ['add', 'base.txt']);
  git(official, ['commit', '-m', 'official base']);
  git(root, ['clone', '--bare', official, forkRemote]);
  git(root, ['clone', official, fork]);
  git(fork, ['config', 'user.name', 'Fixture']);
  git(fork, ['config', 'user.email', 'fixture@example.com']);
  git(fork, ['remote', 'set-url', 'origin', forkRemote]);
  if (withPatch) {
    await writeFile(path.join(fork, 'seam.txt'), 'generic seam\n');
    git(fork, ['add', 'seam.txt']);
    git(fork, ['commit', '-m', 'add seam']);
  }
  const paths = path.join(root, 'paths.json');
  await writeFile(paths, `${JSON.stringify({ paths: ['seam.txt'] })}\n`);
  return { official, fork, paths };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('upstream survivability script', () => {
  it('fetches a distinct official upstream and applies a non-empty allowlisted patch', async () => {
    const { official, fork, paths } = await fixture(true);
    const output = execFileSync(process.execPath, [
      script, '--prepare-only', '--upstream-url', official, '--paths', paths,
    ], { cwd: fork, encoding: 'utf8' });
    const report = JSON.parse(output.slice(output.indexOf('{')));

    expect(report.upstreamUrl).toBe(official);
    expect(report.originUrl).not.toBe(report.upstreamUrl);
    expect(report.upstreamRevision).toBe(git(official, ['rev-parse', 'main']));
    expect(report.patchBytes).toBeGreaterThan(0);
    expect(report.strategy).toContain('3way');
    expect(report.verified).toBe(false);
  });

  it('fails when the allowlisted patch is empty', async () => {
    const { official, fork, paths } = await fixture(false);
    const result = spawnSync(process.execPath, [
      script, '--prepare-only', '--upstream-url', official, '--paths', paths,
    ], { cwd: fork, encoding: 'utf8' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('patch is empty');
  });

  it('rejects an origin that is the purported official upstream', async () => {
    const { official, fork, paths } = await fixture(true);
    git(fork, ['remote', 'set-url', 'origin', official]);
    const result = spawnSync(process.execPath, [
      script, '--prepare-only', '--upstream-url', official, '--paths', paths,
    ], { cwd: fork, encoding: 'utf8' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('origin and upstream must be distinct');
  });
});
