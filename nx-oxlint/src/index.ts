import {
  CreateNodesContextV2,
  createNodesFromFiles,
  CreateNodesV2,
  joinPathFragments,
  TargetConfiguration,
} from '@nx/devkit';
import { basename, dirname, join } from 'path';

import { findOxlintConfigFile } from './lib/oxlint-config';

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

export const nxProjectConfigGlob = '**/{package,project}.json';

export const createNodesV2: CreateNodesV2<OxlintPluginOptions> = [
  nxProjectConfigGlob,
  async (configFiles, options, context) => {
    return await createNodesFromFiles(
      (configFile, options, context) =>
        createNodesInternal(configFile, options || {}, context),
      configFiles,
      options,
      context,
    );
  },
];

const DEFAULT_LINT_TARGET_NAME = 'lint';

async function createNodesInternal(
  configFilePath: string,
  options: OxlintPluginOptions,
  context: CreateNodesContextV2,
) {
  const projectRoot = dirname(configFilePath);
  const oxlintConfigPath = findOxlintConfigFile(
    join(context.workspaceRoot, projectRoot),
  );

  if (!oxlintConfigPath) {
    return { projects: {} };
  }

  const lintTarget: TargetConfiguration = {
    executor: 'nx-oxlint:lint',
    options: {
      cwd: projectRoot,
      ...options,
    },
    cache: true,
    inputs: [
      joinPathFragments('{projectRoot}', basename(oxlintConfigPath)),
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
