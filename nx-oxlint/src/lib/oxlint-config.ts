import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Default oxlint config filenames under a project directory, first match wins.
 * Documented auto-discovery: `.oxlintrc.json`, `oxlint.config.ts`
 * @see https://oxc.rs/docs/guide/usage/linter/config
 * @see https://oxc.rs/docs/guide/usage/linter/config-file-reference
 */
export const DEFAULT_OXLINT_CONFIG_FILENAMES = [
  '.oxlintrc.json',
  'oxlint.config.ts',
  '.oxlintrc',
  'oxlint.json',
] as const;

/**
 * Returns the absolute path to the first existing default oxlint config under
 * `directory`, or undefined if none exist.
 */
export function findOxlintConfigFile(directory: string): string | undefined {
  for (const name of DEFAULT_OXLINT_CONFIG_FILENAMES) {
    const fullPath = join(directory, name);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }
  return undefined;
}
