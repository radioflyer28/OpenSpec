#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const configPath = new URL('./extension-seam-budget.json', import.meta.url);
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const baseRevision = process.env.OPENSPEC_SEAM_BASE || config.baseRevision;

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

try {
  git(['cat-file', '-e', `${baseRevision}^{commit}`]);
} catch {
  console.error(`Extension seam budget base '${baseRevision}' is not available locally.`);
  process.exit(1);
}

const output = git(['diff', '--numstat', baseRevision, '--', config.productionRoot]);
const entries = output.trim() === '' ? [] : output.trim().split('\n').map((line) => {
  const [addedText, deletedText, ...pathParts] = line.split('\t');
  return {
    path: pathParts.join('\t'),
    added: addedText === '-' ? Number.POSITIVE_INFINITY : Number(addedText),
    deleted: deletedText === '-' ? Number.POSITIVE_INFINITY : Number(deletedText),
  };
});
const integration = entries.filter((entry) =>
  !config.ownedPaths.some((ownedPath) =>
    ownedPath.endsWith('/') ? entry.path.startsWith(ownedPath) : entry.path === ownedPath
  )
);
const violations = [];
for (const entry of integration) {
  const allowance = config.allowedPaths[entry.path];
  if (!allowance) {
    violations.push(`unapproved production path: ${entry.path}`);
    continue;
  }
  if (entry.added > allowance.maxAdded || entry.deleted > allowance.maxDeleted) {
    violations.push(
      `${entry.path} grew to +${entry.added}/-${entry.deleted}; ` +
      `budget is +${allowance.maxAdded}/-${allowance.maxDeleted}`
    );
  }
}
const added = integration.reduce((total, entry) => total + entry.added, 0);
const deleted = integration.reduce((total, entry) => total + entry.deleted, 0);
if (added > config.maxAddedLines || deleted > config.maxDeletedLines) {
  violations.push(
    `integration total grew to +${added}/-${deleted}; ` +
    `budget is +${config.maxAddedLines}/-${config.maxDeletedLines}`
  );
}

const report = {
  baseRevision,
  ownedPaths: config.ownedPaths,
  totals: { added, deleted },
  budget: { added: config.maxAddedLines, deleted: config.maxDeletedLines },
  files: integration,
  violations,
};
console.log(JSON.stringify(report, null, 2));
if (violations.length > 0) process.exitCode = 1;
