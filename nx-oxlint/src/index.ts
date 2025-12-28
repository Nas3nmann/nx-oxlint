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

export const nxProjectConfigGlob = '**/{package,project}.json';

export const createNodesV2: CreateNodesV2<OxlintPluginOptions> = [
  nxProjectConfigGlob,
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
  const siblingFiles = readdirSync(join(context.workspaceRoot, projectRoot));
  const hasOxlintConfig = siblingFiles.includes('.oxlintrc.json');

  const lintTarget: TargetConfiguration = {
    executor: 'nx-oxlint:lint',
    options: {
      cwd: projectRoot,
      ...options,
    },
    cache: true,
    inputs: [
      ...(hasOxlintConfig ? ['{projectRoot}/.oxlintrc.json'] : []),
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
