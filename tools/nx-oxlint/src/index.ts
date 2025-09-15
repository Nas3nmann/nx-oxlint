import {
  CreateNodesContextV2,
  createNodesFromFiles,
  CreateNodesV2,
  joinPathFragments,
  TargetConfiguration,
} from '@nx/devkit';
import { readdirSync } from 'fs';
import { dirname, join } from 'path';

export type OxlintFormatOption =
  | 'checkstyle'
  | 'default'
  | 'github'
  | 'gitlab'
  | 'json'
  | 'junit'
  | 'stylish'
  | 'unix';

export interface OxlintPluginOptions {
  lintTargetName?: string;
  projectRoot?: string;
  configFile?: string;
  fix?: boolean;
  format?: OxlintFormatOption;
  quiet?: boolean;
  maxWarnings?: number;
}

export const oxlintConfigGlob = '**/oxlintrc.json';

export const createNodesV2: CreateNodesV2<OxlintPluginOptions> = [
  oxlintConfigGlob,
  async (configFiles, options, context) => {
    return await createNodesFromFiles(
      (configFile, options, context) =>
        createNodesInternal(configFile, options || {}, context),
      configFiles,
      options,
      context
    );
  },
];

const DEFAULT_LINT_TARGET_NAME = 'lint';

async function createNodesInternal(
  configFilePath: string,
  options: OxlintPluginOptions,
  context: CreateNodesContextV2
) {
  const projectRoot = dirname(configFilePath);

  // Do not consider directory if package.json or project.json isn't there.
  const siblingFiles = readdirSync(join(context.workspaceRoot, projectRoot));
  if (
    !siblingFiles.includes('package.json') &&
    !siblingFiles.includes('project.json')
  ) {
    return {};
  }

  const lintTarget: TargetConfiguration = {
    executor: 'nx-oxlint:lint',
    options: {
      cwd: projectRoot,
      ...options,
    },
    cache: true,
    inputs: [
      '{projectRoot}/oxlintrc.json',
      joinPathFragments('{projectRoot}', '**', '*'),
      {
        externalDependencies: ['oxlint'],
      },
    ],
  };

  return {
    projects: {
      [projectRoot]: {
        targets: {
          [options.lintTargetName || DEFAULT_LINT_TARGET_NAME]: lintTarget,
        },
      },
    },
  };
}
