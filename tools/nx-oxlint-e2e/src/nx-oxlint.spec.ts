import { execSync } from 'child_process';
import { readFileSync, rmSync } from 'fs';
import { join } from 'path';

describe('nx-oxlint', () => {
  let projectDirectory: string;
  const testAppName = 'test-app';
  const testReactLibName = 'test-react-lib';
  const testTsLibName = 'test-ts-lib';

  beforeAll(() => {
    // The plugin has been built and published to a local registry in the vitest globalSetup

    // Create new nx workspace
    projectDirectory = createTestProject(testAppName);
    createTestLib(projectDirectory, testReactLibName, 'react');
    createTestLib(projectDirectory, testTsLibName, 'js');

    execSync(`npx nx add nx-oxlint@e2e`, {
      cwd: projectDirectory,
      stdio: 'inherit',
      env: {
        ...process.env,
        npm_config_registry: 'http://localhost:4873',
      },
    });
  });

  afterAll(() => {
    if (projectDirectory) {
      // Cleanup the test project
      // rmSync(projectDirectory, {
      //   recursive: true,
      //   force: true,
      // });
    }
  });

  it('should add nx-oxlint as dev dependency', () => {
    const packageJson = JSON.parse(
      readFileSync(join(projectDirectory, 'package.json'), 'utf-8')
    );

    expect(packageJson.devDependencies).toHaveProperty('nx-oxlint');
  });

  it('should install nx-oxlint', () => {
    const result = execSync('npm ls nx-oxlint', {
      cwd: projectDirectory,
      stdio: 'inherit',
    });

    expect(result).toContain('nx-oxlint');
  });

  it('should set nx-oxlint as default executor for all projects lint target', () => {
    const appProjectJson = JSON.parse(
      readFileSync(
        join(projectDirectory, 'apps', testAppName, 'project.json'),
        'utf-8'
      )
    );
    expect(appProjectJson.targets.lint.executor).toBe('nx-oxlint:lint');

    const reactLibProjectJson = JSON.parse(
      readFileSync(
        join(projectDirectory, 'libs', testReactLibName, 'project.json'),
        'utf-8'
      )
    );
    expect(reactLibProjectJson.targets.lint.executor).toBe('nx-oxlint:lint');

    const tsLibProjectJson = JSON.parse(
      readFileSync(
        join(projectDirectory, 'libs', testTsLibName, 'project.json'),
        'utf-8'
      )
    );
    expect(tsLibProjectJson.targets.lint.executor).toBe('nx-oxlint:lint');
  });
});

/**
 * Creates a test project with create-nx-workspace and installs the plugin
 * @returns The directory where the test project was created
 */
function createTestProject(projectName: string) {
  execSync(
    `npx -y create-nx-workspace@latest ${projectName} --preset react-monorepo --nxCloud=skip --no-interactive`,
    {
      stdio: 'inherit',
      env: process.env,
      timeout: 300000,
    }
  );

  return join(process.cwd(), projectName);
}

function createTestLib(
  projectDirectory: string,
  libName: string,
  libType: 'react' | 'js'
) {
  execSync(
    `npx -y nx g @nx/${libType}:library ${libName} --directory=libs/${libName} --nxCloud=skip --no-interactive`,
    {
      cwd: projectDirectory,
      stdio: 'inherit',
      env: process.env,
      timeout: 120000,
    }
  );
}
