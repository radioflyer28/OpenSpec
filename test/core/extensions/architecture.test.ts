import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('generic extension integration boundaries', () => {
  it('keeps lifecycle, update reconciliation, and archive gates behind dedicated modules', async () => {
    const source = async (relative: string) =>
      readFile(path.join(process.cwd(), relative), 'utf8');
    const cli = await source('src/cli/index.ts');
    const update = await source('src/core/update.ts');
    const archive = await source('src/core/archive.ts');
    const production = [cli, update, archive].join('\n');

    expect(cli).toContain("../commands/extension.js");
    expect(update).toContain("./extensions/workflow-facade.js");
    expect(update).not.toContain("./extensions/workflows.js");
    expect(archive).toContain('enforceExtensionArchiveGates');
    expect(archive).not.toContain('evaluateRequiredGates');
    expect(production).not.toContain('openspec-guardrails');
  });
});
