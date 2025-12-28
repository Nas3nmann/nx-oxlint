import { execSync } from 'child_process';
import { readFileSync, rmSync } from 'fs';
import { join } from 'path';

describe('nx-oxlint', () => {
  let projectDirectory: string;
  const workspaceName = 'test-workspace';
  const testAppName = 'test-app';
  const testReactLibName = 'test-react-lib';
  const testTsLibName = 'test-ts-lib';

  beforeAll(() => {
    // The plugin has been built and published to a local registry in the jest globalSetup

    // Create new nx workspace with React preset (includes a React app)
    projectDirectory = createTestWorkspace(workspaceName, testAppName);
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

    // Reset the workspace to ensure new targets are added
    execSync('nx reset', {
      cwd: projectDirectory,
      stdio: 'inherit',
    });
  });

  afterAll(() => {
    if (projectDirectory) {
      rmSync(projectDirectory, {
        recursive: true,
        force: true,
      });
    }
  });

  it('should add nx-oxlint as dev dependency', () => {
    const packageJson = JSON.parse(
      readFileSync(join(projectDirectory, 'package.json'), 'utf-8'),
    );

    expect(packageJson.devDependencies).toHaveProperty('nx-oxlint');
  });

  it('should install nx-oxlint', () => {
    const result = execSync('npm ls nx-oxlint', {
      cwd: projectDirectory,
      stdio: 'pipe',
    }).toString();

    expect(result).toMatch(/nx-oxlint@(\d+\.\d+\.\d+-e2e)/);
  });

  it('should configure nx-oxlint as plugin in nx.json', () => {
    const nxJson = JSON.parse(
      readFileSync(join(projectDirectory, 'nx.json'), 'utf-8'),
    );
    expect(nxJson.plugins).toContainEqual({
      plugin: 'nx-oxlint',
      options: {
        lintTargetName: 'lint',
      },
    });
  });

  it.each([
    { projectName: `@${workspaceName}/source`, projectType: 'app' },
    { projectName: testReactLibName, projectType: 'lib' },
    { projectName: testTsLibName, projectType: 'lib' },
  ])(
    'should infer the lint target for $projectName',
    ({ projectName, projectType }) => {
      const projectDetails = JSON.parse(
        execSync(`npx nx show project ${projectName} --json`, {
          cwd: projectDirectory,
        }).toString(),
      );

      expect(projectDetails.targets.lint).toEqual(
        expect.objectContaining({
          executor: 'nx-oxlint:lint',
          cache: true,
          inputs: ['{projectRoot}/**/*', { externalDependencies: ['oxlint'] }],
          options: {
            cwd: projectType === 'app' ? '.' : `libs/${projectName}`,
            lintTargetName: 'lint',
          },
        }),
      );
    },
  );

  it('should run lint with type-check successfully', () => {
    const result = execSync(
      `npx nx lint ${testTsLibName} --additionalArguments="--type-check"`,
      {
        cwd: projectDirectory,
        stdio: 'pipe',
        encoding: 'utf-8',
      },
    );

    expect(result).toContain('oxlint completed successfully');
  });
});

function createTestWorkspace(projectName: string, appName: string) {
  execSync(
    `npx -y create-nx-workspace@latest ${projectName} --preset react --appName=${appName} --nxCloud=skip --skipGit --unitTestRunner=none --e2eTestRunner=none --no-interactive --packageManager=npm`,
    {
      stdio: 'inherit',
      env: process.env,
      timeout: 300000,
    },
  );

  return join(process.cwd(), projectName);
}

function createTestLib(
  projectDirectory: string,
  libName: string,
  libType: 'react' | 'js',
) {
  execSync(
    `npx -y nx g @nx/${libType}:library ${libName} --directory=libs/${libName} --nxCloud=skip --unitTestRunner=none --no-interactive`,
    {
      cwd: projectDirectory,
      stdio: 'inherit',
      env: process.env,
      timeout: 120000,
    },
  );
}
