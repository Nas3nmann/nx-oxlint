import {
  formatFiles,
  PluginConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';

export async function initGenerator(tree: Tree) {
  removePluginIfPresent(tree, '@nx/eslint/plugin');
  addPluginIfNotPresent(tree);
  await formatFiles(tree);
}

function addPluginIfNotPresent(tree: Tree) {
  const nxJson = readNxJson(tree) || {};
  const hasOxlintPluginAlready = nxJson.plugins?.some((plugin) => {
    return pluginHasName(plugin, 'nx-oxlint');
  });
  if (!hasOxlintPluginAlready) {
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
  }
}

function removePluginIfPresent(tree: Tree, pluginName: string) {
  const nxJson = readNxJson(tree) || {};
  nxJson.plugins = nxJson.plugins?.filter((plugin) => {
    return !pluginHasName(plugin, pluginName);
  });
  updateNxJson(tree, nxJson);
}

function pluginHasName(plugin: PluginConfiguration, pluginName: string) {
  return typeof plugin === 'string'
    ? plugin === pluginName
    : plugin.plugin === pluginName;
}

export default initGenerator;
