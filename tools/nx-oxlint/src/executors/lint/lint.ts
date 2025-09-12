import { PromiseExecutor, ExecutorContext } from '@nx/devkit';
import { execSync } from 'child_process';
import { join } from 'path';
import { LintExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<LintExecutorSchema> = async (
  options,
  context: ExecutorContext
) => {
  const projectRoot =
    options.projectRoot ||
    context.projectsConfigurations?.projects[context.projectName!]?.root ||
    '';

  const oxlintBinaryPath = join(context.root, 'node_modules', '.bin', 'oxlint');

  console.log(`Running oxlint for project: ${context.projectName}`);
  console.log(`Project root: ${projectRoot}`);

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
  } catch (error: any) {
    if (error.stdout) {
      console.log(error.stdout);
    }
    if (error.stderr) {
      console.error(error.stderr);
    }

    console.log(`❌ oxlint found issues in ${context.projectName}`);
    return {
      success: false,
    };
  }
};

export default runExecutor;
