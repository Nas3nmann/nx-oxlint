import { PromiseExecutor, ExecutorContext } from '@nx/devkit';
import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import { findOxlintConfigFile } from '../../lib/oxlint-config';
import { LintExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<LintExecutorSchema> = async (
  options,
  context: ExecutorContext,
) => {
  const projectName = context.projectName ?? '';
  const projectRoot =
    options.projectRoot ||
    context.projectsConfigurations?.projects[projectName]?.root ||
    '';

  const oxlintBinaryPath = join(context.root, 'node_modules', '.bin', 'oxlint');

  let configFilePath: string | undefined;

  if (options.configFile) {
    configFilePath = join(context.root, options.configFile);
    if (!existsSync(configFilePath)) {
      console.warn(
        `Warning: Specified config file not found: ${configFilePath}`,
      );
      configFilePath = undefined;
    }
  } else {
    configFilePath = findOxlintConfigFile(
      join(context.root, projectRoot),
    );
  }

  console.log(`Running oxlint for project: ${context.projectName}`);
  console.log(`Project root: ${projectRoot}`);
  if (configFilePath) {
    console.log(`Using config file: ${configFilePath}`);
  } else {
    console.log('No configuration file found, using default settings');
  }

  try {
    const args: string[] = [];

    if (projectRoot) {
      args.push(projectRoot);
    }

    if (options.fix) {
      args.push('--fix');
    }

    if (options.format) {
      args.push(`--format=${options.format}`);
    }

    if (options.quiet) {
      args.push('--quiet');
    }

    if (options.maxWarnings !== undefined) {
      args.push(`--max-warnings=${options.maxWarnings}`);
    }

    if (configFilePath) {
      args.push(`--config=${configFilePath}`);
    }

    if (options.additionalArguments) {
      args.push(options.additionalArguments);
    }

    const command = `${oxlintBinaryPath} ${args.join(' ')}`;
    console.log(`Executing: ${command}`);

    const result = execSync(command, {
      cwd: context.root,
      stdio: 'pipe',
      encoding: 'utf8',
    });

    if (result) {
      console.log(result);
    }

    console.log(`✅ oxlint completed successfully for ${context.projectName}`);
    return {
      success: true,
    };
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string };
    if (execError.stdout) {
      console.log(execError.stdout);
    }
    if (execError.stderr) {
      console.error(execError.stderr);
    }

    console.log(`❌ oxlint found issues in ${context.projectName}`);
    return {
      success: false,
    };
  }
};

export default runExecutor;
