import {
  Tree,
  addProjectConfiguration,
  readJson,
  readProjectConfiguration,
  updateProjectConfiguration,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { initGenerator } from './init';

describe('init generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    addProjectConfiguration(tree, 'test-app', {
      root: 'apps/test-app',
      projectType: 'application',
      sourceRoot: 'apps/test-app/src',
      targets: {
        build: {
          executor: '@nx/vite:build',
        },
      },
    });

    addProjectConfiguration(tree, 'test-lib', {
      root: 'libs/test-lib',
      projectType: 'library',
      sourceRoot: 'libs/test-lib/src',
      targets: {
        build: {
          executor: '@nx/js:tsc',
        },
      },
    });
  });

  it('should add nx-oxlint as devDependency', async () => {
    await initGenerator(tree);

    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.devDependencies['nx-oxlint']).toBe('latest');
  });

  it('should add lint target to existing projects', async () => {
    await initGenerator(tree);

    const appConfig = readProjectConfiguration(tree, 'test-app');
    expect(appConfig.targets?.lint).toEqual({
      executor: 'nx-oxlint:lint',
      cache: true,
      inputs: ['default', '^default'],
      options: {
        projectRoot: 'apps/test-app',
      },
    });

    const libConfig = readProjectConfiguration(tree, 'test-lib');
    expect(libConfig.targets?.lint).toEqual({
      executor: 'nx-oxlint:lint',
      cache: true,
      inputs: ['default', '^default'],
      options: {
        projectRoot: 'libs/test-lib',
      },
    });
  });

  it('should overwrite existing lint target', async () => {
    const existingConfig = readProjectConfiguration(tree, 'test-app');
    updateProjectConfiguration(tree, 'test-app', {
      ...existingConfig,
      targets: {
        ...existingConfig.targets,
        lint: {
          executor: '@nx/eslint:lint',
          options: { lintFilePatterns: ['apps/test-app/**/*.ts'] },
        },
      },
    });

    await initGenerator(tree);

    const appConfig = readProjectConfiguration(tree, 'test-app');
    expect(appConfig.targets?.lint).toEqual({
      executor: 'nx-oxlint:lint',
      cache: true,
      inputs: ['default', '^default'],
      options: {
        projectRoot: 'apps/test-app',
      },
    });
  });

  it('should return install task function', async () => {
    const result = await initGenerator(tree);
    expect(typeof result).toBe('function');
  });
});
