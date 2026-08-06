import { Command } from 'commander';
import { resolveRootForCommand } from '../core/root-selection.js';
import {
  DEFAULT_EXTENSION_HOST_CAPABILITIES,
  ExtensionLifecycleService,
  type ExtensionInspection,
  type ExtensionLifecycleOptions,
} from '../core/extensions/index.js';
import { COMMAND_REGISTRY } from '../core/completions/command-registry.js';

export type RegisterExtensionCommandOptions = Omit<ExtensionLifecycleOptions, 'projectRoot'>;

function sourceLabel(inspection: ExtensionInspection): string {
  const source = inspection.entry.source;
  return source.kind === 'link' ? `link:${source.path}` : `package:${source.spec}`;
}

function contributionsLabel(inspection: ExtensionInspection): string {
  const contributions = inspection.manifest?.contributes;
  if (!contributions) return 'workflows=?, gates=?';
  return [
    `workflows=${contributions.workflows.length}`,
    `gates=${contributions.gates.length}`,
  ].join(', ');
}

function listLine(inspection: ExtensionInspection): string {
  const state = inspection.entry.enabled ? 'enabled' : 'disabled';
  return `${inspection.id}@${inspection.entry.version} [${state}] ${sourceLabel(inspection)} ` +
    `compatibility=${inspection.compatibility} contributions: ${contributionsLabel(inspection)}`;
}

function doctorLine(inspection: ExtensionInspection): string {
  const state = inspection.entry.enabled ? 'enabled' : 'disabled';
  const source = inspection.sourceState === 'available' ? sourceLabel(inspection) : 'source unavailable';
  const capabilityDiagnostics = inspection.registryDiagnostics.filter((item) =>
    item.code.includes('capability')
  );
  const capabilityState = capabilityDiagnostics.length === 0
    ? 'available'
    : capabilityDiagnostics.map((item) => item.message).join(' | ');
  const conflictDiagnostics = inspection.registryDiagnostics.filter((item) =>
    item.code.includes('conflict')
  );
  const conflicts = conflictDiagnostics.length === 0
    ? 'none'
    : conflictDiagnostics.map((item) => item.message).join(' | ');
  const driftDetail = inspection.reconciliation.detail
    ? ` (${inspection.reconciliation.detail})`
    : '';
  return `${inspection.id}@${inspection.entry.version}: ${state}; ${source}; ` +
    `manifest=${inspection.manifest ? 'valid' : 'invalid'}; compatibility=${inspection.compatibility}; ` +
    `capabilities=${capabilityState}; conflicts=${conflicts}; ` +
    `reconciliation: ${inspection.reconciliation.state}${driftDetail}`;
}

function printFailure(error: unknown): void {
  console.error(`Error: ${(error as Error).message}`);
  process.exitCode = 1;
}

async function serviceForProject(
  options: RegisterExtensionCommandOptions
): Promise<ExtensionLifecycleService | undefined> {
  const root = await resolveRootForCommand({}, { allowImplicitRoot: false });
  if (!root) return undefined;
  return new ExtensionLifecycleService({
    projectRoot: root.path,
    coreVersion: options.coreVersion,
    hostCapabilities: options.hostCapabilities ?? DEFAULT_EXTENSION_HOST_CAPABILITIES,
    ...(options.globalDataDir ? { globalDataDir: options.globalDataDir } : {}),
    ...(options.acquire ? { acquire: options.acquire } : {}),
    ...(options.reconcile ? { reconcile: options.reconcile } : {}),
    ...(Object.prototype.hasOwnProperty.call(options, 'extensionApiProvider')
      ? { extensionApiProvider: options.extensionApiProvider }
      : {}),
  });
}

export function registerExtensionCommand(
  program: Command,
  options: RegisterExtensionCommandOptions
): void {
  const registryEntry = COMMAND_REGISTRY.find((entry) => entry.name === 'extension');
  const extension = program
    .command('extension')
    .description(registryEntry?.description ?? 'Install and manage project extensions');

  extension
    .command('install <package>')
    .description('Install a registry extension into this project')
    .action(async (packageSpec: string) => {
      try {
        const service = await serviceForProject(options);
        if (!service) return;
        const inspection = await service.install(packageSpec);
        console.log(`Installed ${listLine(inspection)}`);
      } catch (error) {
        printFailure(error);
      }
    });

  extension
    .command('link <path>')
    .description('Link a local extension into this project')
    .action(async (inputPath: string) => {
      try {
        const service = await serviceForProject(options);
        if (!service) return;
        const inspection = await service.link(inputPath);
        console.log(`Linked ${listLine(inspection)} -> ${inspection.root ?? inputPath}`);
      } catch (error) {
        printFailure(error);
      }
    });

  extension
    .command('enable <id>')
    .description('Enable an installed project extension')
    .action(async (id: string) => {
      try {
        const service = await serviceForProject(options);
        if (!service) return;
        const inspection = await service.enable(id);
        console.log(`Enabled ${inspection.id}@${inspection.entry.version}.`);
      } catch (error) {
        printFailure(error);
      }
    });

  extension
    .command('disable <id>')
    .description('Disable a project extension without removing recorded gate obligations')
    .action(async (id: string) => {
      try {
        const service = await serviceForProject(options);
        if (!service) return;
        const inspection = await service.disable(id);
        console.log(`Disabled ${inspection.id}@${inspection.entry.version}.`);
      } catch (error) {
        printFailure(error);
      }
    });

  extension
    .command('list')
    .alias('ls')
    .description('List project extensions')
    .action(async () => {
      try {
        const service = await serviceForProject(options);
        if (!service) return;
        const inspections = await service.list();
        if (inspections.length === 0) {
          console.log('No project extensions are installed.');
          return;
        }
        for (const inspection of inspections) console.log(listLine(inspection));
      } catch (error) {
        printFailure(error);
      }
    });

  extension
    .command('doctor [id]')
    .description('Diagnose one or all project extensions')
    .action(async (id?: string) => {
      try {
        const service = await serviceForProject(options);
        if (!service) return;
        const inspections = await service.doctor(id);
        if (inspections.length === 0) {
          console.log('No project extensions are installed.');
          return;
        }
        for (const inspection of inspections) {
          console.log(doctorLine(inspection));
          for (const diagnostic of inspection.diagnostics) console.log(`  - ${diagnostic}`);
          for (const diagnostic of inspection.registryDiagnostics) {
            console.log(`  - ${diagnostic.code}: ${diagnostic.message}`);
          }
        }
        if (inspections.some((inspection) => !service.isHealthy(inspection))) {
          process.exitCode = 1;
        }
      } catch (error) {
        printFailure(error);
      }
    });

  const subcommands = extension.commands.map((command) => command.name()).join(', ');
  extension.action(() => {
    console.error(`Error: missing or unknown extension subcommand. Available: ${subcommands}.`);
    process.exitCode = 1;
  });
}
