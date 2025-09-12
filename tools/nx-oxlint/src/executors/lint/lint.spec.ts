import { ExecutorContext } from '@nx/devkit';
import { execSync } from 'child_process';
import { join } from 'path';
import { vi } from 'vitest';

import { LintExecutorSchema } from './schema';
import executor from './lint';

vi.mock('child_process');
const mockExecSync = vi.mocked(execSync);

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
    'oxlint'
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecSync.mockReturnValue('');
    console.log = vi.fn();
    console.error = vi.fn();
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
        }
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
        expect.any(Object)
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
        expect.any(Object)
      );
    });
  });

  describe('option handling', () => {
    it('should add --fix flag when fix option is true', async () => {
      const options: LintExecutorSchema = { fix: true };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --fix`,
        expect.any(Object)
      );
    });

    it('should add --format flag when format option is provided', async () => {
      const options: LintExecutorSchema = { format: 'json' };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --format=json`,
        expect.any(Object)
      );
    });

    it('should add --quiet flag when quiet option is true', async () => {
      const options: LintExecutorSchema = { quiet: true };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --quiet`,
        expect.any(Object)
      );
    });

    it('should add --max-warnings flag when maxWarnings option is provided', async () => {
      const options: LintExecutorSchema = { maxWarnings: 5 };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --max-warnings=5`,
        expect.any(Object)
      );
    });

    it('should handle maxWarnings=0', async () => {
      const options: LintExecutorSchema = { maxWarnings: 0 };

      await executor(options, mockContext);

      expect(mockExecSync).toHaveBeenCalledWith(
        `${expectedBinaryPath} apps/test-project --max-warnings=0`,
        expect.any(Object)
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
        expect.any(Object)
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
          expect.any(Object)
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
        'Running oxlint for project: test-project'
      );
      expect(console.log).toHaveBeenCalledWith(
        'Project root: apps/test-project'
      );
      expect(console.log).toHaveBeenCalledWith(
        `Executing: ${expectedBinaryPath} apps/test-project`
      );
      expect(console.log).toHaveBeenCalledWith(
        '✅ oxlint completed successfully for test-project'
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
        '❌ oxlint found issues in test-project'
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
        '❌ oxlint found issues in test-project'
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
        expect.any(Object)
      );
    });
  });
});
