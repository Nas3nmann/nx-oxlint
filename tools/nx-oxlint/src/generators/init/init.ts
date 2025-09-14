import {
  addDependenciesToPackageJson,
  formatFiles,
  getProjects,
  logger,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';

export async function initGenerator(tree: Tree) {
  const installTask = addDependenciesToPackageJson(
    tree,
    {},
    { 'nx-oxlint': 'latest' }
  );

  const projects = getProjects(tree);

  for (const [projectName, projectConfig] of projects) {
    try {
      const currentConfig = readProjectConfiguration(tree, projectName);

      const updatedConfig = {
        ...currentConfig,
        targets: {
          ...currentConfig.targets,
          lint: {
            executor: 'nx-oxlint:lint',
            cache: true,
            inputs: ['default', '^default'],
            options: {
              projectRoot: projectConfig.root,
            },
          },
        },
      };

      updateProjectConfiguration(tree, projectName, updatedConfig);

      if (currentConfig.targets?.lint) {
        logger.info(`Replaced existing lint target in project: ${projectName}`);
      } else {
        logger.info(`Added lint target to project: ${projectName}`);
      }
    } catch (error) {
      logger.warn(
        `Failed to update project ${projectName}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  await formatFiles(tree);

  return () => {
    installTask();
  };
}

export default initGenerator;
