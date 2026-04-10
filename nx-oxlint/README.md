[![Weekly E2E Tests](https://github.com/Nas3nmann/nx-oxlint/actions/workflows/weekly-e2e.yml/badge.svg)](https://github.com/Nas3nmann/nx-oxlint/actions/workflows/weekly-e2e.yml)

# nx-oxlint

An Nx plugin for [oxlint](https://oxc.rs/docs/guide/usage/linter/) — a fast ESLint alternative written in Rust.

## Quick Setup with generator

The easiest way to set up nx-oxlint in your workspace is to use the init generator:

```bash
npx nx add nx-oxlint
```

This command will:

- Add `nx-oxlint` as a devDependency to your workspace
- Remove existing `@nx/eslint/plugin` configuration in your `nx.json`
- Add a plugin entry for `nx-oxlint` in your `nx.json` so inferred `lint` targets can be registered (see [Lint target inference](#lint-target-inference))

This command will **not**:

- Create an oxlint configuration file. Without a config file next to each `package.json` / `project.json`, the plugin will not infer a `lint` target for that directory (see [Lint target inference](#lint-target-inference))

You might need to update the nx daemon and cache using

```bash
nx reset
```

## Lint target inference

The plugin considers each workspace file that matches `**/{package,project}.json` (every `package.json` or `project.json`). The directory containing that file is treated as a **candidate project root**.

Nx merges an inferred **`lint`** target for that root **only if** an oxlint config file exists in the **same** directory. Resolution order (first match wins, and is used for Nx cache `inputs` and for `--config` when the executor runs without `configFile`):

1. `.oxlintrc.json`
2. `oxlint.config.ts`
3. `.oxlintrc`
4. `oxlint.json`

The first two are the [documented default filenames](https://oxc.rs/docs/guide/usage/linter/config); the last two are extra fallbacks supported by this plugin.

If none of these files are present, that directory does not receive an inferred `lint` target. You can still add an `nx-oxlint:lint` target by hand in `project.json` or under `nx` / `targets` in `package.json`.

## Manual Setup

### Install

```bash
npm install nx-oxlint
```

### Add plugin to your `nx.json`

```json
{
  "plugins": [
    {
      "plugin": "nx-oxlint",
      "options": {
        "lintTargetName": "lint"
      }
    }
  ]
}
```

### Add the executor to `project.json`:

```json
{
  "targets": {
    "lint": {
      "executor": "nx-oxlint:lint"
    }
  }
}
```

## Run Linting:

```bash
nx run your-project:lint
```

or

```bash
nx run-many --target lint
```

## Plugin Options

All options are optional. The plugin will use `lint` as default target

- `lintTargetName` _(optional)_ - target name for running oxlint, with this you can even keep using eslint as backup
- All other options that the executor provides. See below

## Executor Options

All options are optional. The executor will work with minimal configuration.

- `projectRoot` _(optional)_ - Project root directory (defaults to current project root)
- `configFile` _(optional)_ - Path to the oxlint configuration file, relative to the workspace root. If omitted, the executor uses the same [default filenames](#lint-target-inference) as the plugin. If set and the file exists, it is passed as `--config`. If set but the file is missing, a warning is printed and oxlint runs without `--config` (no fallback to the default filenames)
- `fix` _(optional)_ - Automatically fix problems (default: `false`)
- `format` _(optional)_ - Output format (default: `"default"`)
  - Available formats: `checkstyle`, `default`, `github`, `gitlab`, `json`, `junit`, `stylish`, `unix`
- `quiet` _(optional)_ - Report errors only, disable warnings (default: `false`)
- `maxWarnings` _(optional)_ - Number of warnings to trigger nonzero exit code (minimum: 0)
- `additionalArguments` _(optional)_ - Additional arguments to pass to oxlint (e.g., `--type-aware` or `--type-check`)

## Configuration

When `configFile` is not set on the executor, this package resolves a config in the project root using the [same rule as inference](#lint-target-inference) and passes it to oxlint. Oxlint also supports features such as [nested configs](https://oxc.rs/docs/guide/usage/linter/nested-config) and the options described in the upstream docs.

See the [Oxlint configuration guide](https://oxc.rs/docs/guide/usage/linter/config) and [config file reference](https://oxc.rs/docs/guide/usage/linter/config-file-reference).
