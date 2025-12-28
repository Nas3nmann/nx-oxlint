import { ExecutorContext } from '@nx/devkit';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

import { LintExecutorSchema } from './schema';
import executor from './lint';

jest.mock('child_process');
jest.mock('fs');
const mockExecSync = jest.mocked(execSync);
const mockExistsSync = jest.mocked(existsSync);

describe('Lint Executor', () => {
  const mockContext: ExecutorContext = {
    root: '/workspace',
    cwd: '/workspace',
    isVerbose: false,
    projectName: 'test-project',
    projectGraph: {
      nodes: {},
      dependencies: {},
    },
    projectsConfigurations: {
      projects: {
        'test-project': {
          root: 'apps/test-project',
        },
      },
      version: 2,
    },
    nxJsonConfiguration: {},
  };

  const expectedBinaryPath = join(
    '/workspace',
    'node_modules',
    '.bin',
    'oxlint',
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockExecSync.mockReturnValue('');
    mockExistsSync.mockReturnValue(false);
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  describe('successful execution', () => {
    it('should run with minimal options', async () => {
      const options: LintExecutorSchema = {};

      const result = await executor(options, mockContext);

      expect(result.success).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project`,
        {
          cwd: '/workspace',
          stdio: 'pipe',
          encoding: 'utf8',
        },
      );
    });

    it('should use custom projectRoot when provided', async () => {
      const options: LintExecutorSchema = {
        projectRoot: 'custom/path',
      };

      const result = await executor(options, mockContext);

      expect(result.success).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} custom/path`,
        expect.any(Object),
      );
    });

    it('should run without project root when not available', async () => {
      const contextWithoutProject = {
        ...mockContext,
        projectsConfigurations: {
          projects: {},
          version: 2,
        },
      };
      const options: LintExecutorSchema = {};

      const result = await executor(options, contextWithoutProject);

      expect(result.success).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} `,
        expect.any(Object),
      );
    });
  });

  describe('option handling', () => {
    it('should add --fix flag when fix option is true', async () => {
      const options: LintExecutorSchema = { fix: true };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --fix`,
        expect.any(Object),
      );
    });

    it('should add --format flag when format option is provided', async () => {
      const options: LintExecutorSchema = { format: 'json' };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --format=json`,
        expect.any(Object),
      );
    });

    it('should add --quiet flag when quiet option is true', async () => {
      const options: LintExecutorSchema = { quiet: true };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --quiet`,
        expect.any(Object),
      );
    });

    it('should add --max-warnings flag when maxWarnings option is provided', async () => {
      const options: LintExecutorSchema = { maxWarnings: 5 };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --max-warnings=5`,
        expect.any(Object),
      );
    });

    it('should handle maxWarnings=0', async () => {
      const options: LintExecutorSchema = { maxWarnings: 0 };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --max-warnings=0`,
        expect.any(Object),
      );
    });

    it('should combine multiple options correctly', async () => {
      const options: LintExecutorSchema = {
        fix: true,
        format: 'stylish',
        quiet: true,
        maxWarnings: 10,
      };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --fix --format=stylish --quiet --max-warnings=10`,
        expect.any(Object),
      );
    });
  });

  describe('additional arguments handling', () => {
    it('should add additional arguments when provided', async () => {
      const options: LintExecutorSchema = {
        additionalArguments: '--type-aware',
      };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --type-aware`,
        expect.any(Object),
      );
    });

    it('should add multiple additional arguments when provided', async () => {
      const options: LintExecutorSchema = {
        additionalArguments: '--type-aware --type-check',
      };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --type-aware --type-check`,
        expect.any(Object),
      );
    });

    it('should combine additional arguments with other options', async () => {
      const options: LintExecutorSchema = {
        fix: true,
        format: 'json',
        additionalArguments: '--type-aware',
      };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --fix --format=json --type-aware`,
        expect.any(Object),
      );
    });
  });

  describe('format options', () => {
    const formats = [
      'checkstyle',
      'default',
      'github',
      'gitlab',
      'json',
      'junit',
      'stylish',
      'unix',
    ];

    formats.forEach((format) => {
      it(`should handle ${format} format`, async () => {
        const options: LintExecutorSchema = {
          format: format as LintExecutorSchema['format'],
        };

        await executor(options, mockContext);

        expect(mockExecSync).toHaveBeenCalledWith(
          `${expectedBinaryPath} apps/test-project --format=${format}`,
          expect.any(Object),
        );
      });
    });
  });

  describe('output handling', () => {
    it('should log output when execSync returns result', async () => {
      const mockOutput = 'Linting completed successfully';
      mockExecSync.mockReturnValue(mockOutput);
      const options: LintExecutorSchema = {};

      await executor(options, mockContext);

      expect(console.log).toHaveBeenCalledWith(mockOutput);
    });

    it('should not log when execSync returns empty result', async () => {
      mockExecSync.mockReturnValue('');
      const options: LintExecutorSchema = {};

      await executor(options, mockContext);

      expect(console.log).toHaveBeenCalledWith(
        'Running oxlint for project: test-project',
      );
      expect(console.log).toHaveBeenCalledWith(
        'Project root: apps/test-project',
      );
      expect(console.log).toHaveBeenCalledWith(
        `Executing: ${expectedBinaryPath} apps/test-project`,
      );
      expect(console.log).toHaveBeenCalledWith(
        '✅ oxlint completed successfully for test-project',
      );
    });
  });

  describe('error handling', () => {
    it('should handle execution errors and return failure', async () => {
      const mockError = new Error('Execution failed') as Error & {
        stdout?: string;
        stderr?: string;
      };
      mockError.stdout = 'stdout content';
      mockError.stderr = 'stderr content';
      mockExecSync.mockImplementation(() => {
        throw mockError;
      });

      const options: LintExecutorSchema = {};

      const result = await executor(options, mockContext);

      expect(result.success).toBe(false);
      expect(console.log).toHaveBeenCalledWith('stdout content');
      expect(console.error).toHaveBeenCalledWith('stderr content');
      expect(console.log).toHaveBeenCalledWith(
        '❌ oxlint found issues in test-project',
      );
    });

    it('should handle errors without stdout/stderr', async () => {
      const mockError = new Error('Execution failed');
      mockExecSync.mockImplementation(() => {
        throw mockError;
      });

      const options: LintExecutorSchema = {};

      const result = await executor(options, mockContext);

      expect(result.success).toBe(false);
      expect(console.log).toHaveBeenCalledWith(
        '❌ oxlint found issues in test-project',
      );
    });

    it('should handle errors with only stdout', async () => {
      const mockError = new Error('Execution failed') as Error & {
        stdout?: string;
        stderr?: string;
      };
      mockError.stdout = 'stdout only';
      mockExecSync.mockImplementation(() => {
        throw mockError;
      });

      const options: LintExecutorSchema = {};

      const result = await executor(options, mockContext);

      expect(result.success).toBe(false);
      expect(console.log).toHaveBeenCalledWith('stdout only');
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle errors with only stderr', async () => {
      const mockError = new Error('Execution failed') as Error & {
        stdout?: string;
        stderr?: string;
      };
      mockError.stderr = 'stderr only';
      mockExecSync.mockImplementation(() => {
        throw mockError;
      });

      const options: LintExecutorSchema = {};

      const result = await executor(options, mockContext);

      expect(result.success).toBe(false);
      expect(console.error).toHaveBeenCalledWith('stderr only');
    });
  });

  describe('configuration file handling', () => {
    it('should use explicitly provided config file when it exists', async () => {
      const configPath = '/workspace/custom-config.json';
      mockExistsSync.mockImplementation((path) => path === configPath);

      const options: LintExecutorSchema = {
        configFile: 'custom-config.json',
      };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --config=${configPath}`,
        expect.any(Object),
      );
      expect(console.log).toHaveBeenCalledWith(
        `Using config file: ${configPath}`,
      );
    });

    it('should warn when explicitly provided config file does not exist', async () => {
      mockExistsSync.mockReturnValue(false);

      const options: LintExecutorSchema = {
        configFile: 'non-existent-config.json',
      };

      await executor(options, mockContext);

      expect(console.warn).toHaveBeenCalledWith(
        'Warning: Specified config file not found: /workspace/non-existent-config.json',
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project`,
        expect.any(Object),
      );
    });

    it('should find and use default .oxlintrc.json in project root', async () => {
      const defaultConfigPath = '/workspace/apps/test-project/.oxlintrc.json';
      mockExistsSync.mockImplementation((path) => path === defaultConfigPath);

      const options: LintExecutorSchema = {};

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --config=${defaultConfigPath}`,
        expect.any(Object),
      );
      expect(console.log).toHaveBeenCalledWith(
        `Using config file: ${defaultConfigPath}`,
      );
    });

    it('should find and use default .oxlintrc in project root when .oxlintrc.json does not exist', async () => {
      const defaultConfigPath = '/workspace/apps/test-project/.oxlintrc';
      mockExistsSync.mockImplementation((path) => path === defaultConfigPath);

      const options: LintExecutorSchema = {};

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --config=${defaultConfigPath}`,
        expect.any(Object),
      );
      expect(console.log).toHaveBeenCalledWith(
        `Using config file: ${defaultConfigPath}`,
      );
    });

    it('should find and use oxlint.json when other config files do not exist', async () => {
      const defaultConfigPath = '/workspace/apps/test-project/oxlint.json';
      mockExistsSync.mockImplementation((path) => path === defaultConfigPath);

      const options: LintExecutorSchema = {};

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --config=${defaultConfigPath}`,
        expect.any(Object),
      );
      expect(console.log).toHaveBeenCalledWith(
        `Using config file: ${defaultConfigPath}`,
      );
    });

    it('should run without config when no config files are found', async () => {
      mockExistsSync.mockReturnValue(false);

      const options: LintExecutorSchema = {};

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project`,
        expect.any(Object),
      );
      expect(console.log).toHaveBeenCalledWith(
        'No configuration file found, using default settings',
      );
    });

    it('should prioritize .oxlintrc.json over other config files', async () => {
      const oxlintrcJson = '/workspace/apps/test-project/.oxlintrc.json';
      const oxlintrc = '/workspace/apps/test-project/.oxlintrc';
      const oxlintJson = '/workspace/apps/test-project/oxlint.json';

      mockExistsSync.mockImplementation((path) => {
        return (
          path === oxlintrcJson || path === oxlintrc || path === oxlintJson
        );
      });

      const options: LintExecutorSchema = {};

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --config=${oxlintrcJson}`,
        expect.any(Object),
      );
    });

    it('should combine config file with other options', async () => {
      const configPath = '/workspace/apps/test-project/.oxlintrc.json';
      mockExistsSync.mockImplementation((path) => path === configPath);

      const options: LintExecutorSchema = {
        fix: true,
        format: 'json',
        quiet: true,
      };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --fix --format=json --quiet --config=${configPath}`,
        expect.any(Object),
      );
    });
  });

  describe('context variations', () => {
    it('should handle missing project name', async () => {
      const contextWithoutProjectName = {
        ...mockContext,
        projectName: undefined,
      };
      const options: LintExecutorSchema = {};

      const result = await executor(options, contextWithoutProjectName);

      expect(result.success).toBe(true);
    });

    it('should handle missing projectsConfigurations', async () => {
      const contextWithoutConfigs: ExecutorContext = {
        ...mockContext,
        projectsConfigurations: {
          projects: {},
          version: 2,
        },
      };
      const options: LintExecutorSchema = {};

      const result = await executor(options, contextWithoutConfigs);

      expect(result.success).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} `,
        expect.any(Object),
      );
    });
  });
});
