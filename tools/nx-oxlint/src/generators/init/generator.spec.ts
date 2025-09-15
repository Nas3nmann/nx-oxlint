import { Tree, readNxJson, updateNxJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { initGenerator } from './generator';

describe('init generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should add nx-oxlint plugin to nx.json if not present', async () => {
    await initGenerator(tree);

    const nxJson = readNxJson(tree);
    expect(nxJson?.plugins).toContainEqual({
      plugin: 'nx-oxlint',
      options: {
        lintTargetName: 'lint',
      },
    });
  });

  it('should not add nx-oxlint plugin if already present', async () => {
    const nxJson = readNxJson(tree) || {};
    nxJson.plugins = [
      ...(nxJson.plugins || []),
      {
        plugin: 'nx-oxlint',
        options: {
          lintTargetName: 'lint',
        },
      },
    ];
    updateNxJson(tree, nxJson);

    await initGenerator(tree);

    const updatedNxJson = readNxJson(tree);
    const oxlintPlugins = updatedNxJson?.plugins?.filter((plugin) => {
      return typeof plugin === 'string'
        ? plugin === 'nx-oxlint'
        : plugin.plugin === 'nx-oxlint';
    });
    expect(oxlintPlugins).toHaveLength(1);
  });

  it('should remove @nx/eslint/plugin if present', async () => {
    const nxJson = readNxJson(tree) || {};
    nxJson.plugins = [
      ...(nxJson.plugins || []),
      '@nx/eslint/plugin',
      {
        plugin: 'some-other-plugin',
        options: {},
      },
    ];
    updateNxJson(tree, nxJson);

    await initGenerator(tree);

    const updatedNxJson = readNxJson(tree);
    const eslintPlugins = updatedNxJson?.plugins?.filter((plugin) => {
      return typeof plugin === 'string'
        ? plugin === '@nx/eslint/plugin'
        : plugin.plugin === '@nx/eslint/plugin';
    });
    expect(eslintPlugins).toHaveLength(0);
    expect(updatedNxJson?.plugins).toContainEqual({
      plugin: 'some-other-plugin',
      options: {},
    });
  });
});
