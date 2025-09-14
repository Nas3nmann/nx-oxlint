# nx-oxlint

An Nx plugin for [oxlint](https://oxc-project.github.io/docs/guide/usage/linter.html) - a fast ESLint alternative written in Rust.

## Quick Setup with generator

The easiest way to set up nx-oxlint in your workspace is to use the init generator:

```bash
npx nx g nx-oxlint:init
```

This command will:

- Add `nx-oxlint` as a devDependency to your workspace
- Configure the `lint` target for all existing projects in your workspace
- Overwrite any existing lint targets (like ESLint) with nx-oxlint configuration

This command will **not**:

- Create an `.oxlintrc.json`, so running `lint` will use the default config. Feel free to add a config file and modify the rules as needed

## Manual Setup

### Install

```bash
npm install nx-oxlint
```

### Add executor to `project.json`:

```json
{
  "targets": {
    "lint": {
      "executor": "nx-oxlint:lint"
    }
  }
}
```

## Run Linting with Executor:

```bash
nx lint your-project
```

or

```bash
nx run-many --target lint
```

## Executor Options

All options are optional. The executor will work with minimal configuration.

- `projectRoot` _(optional)_ - Project root directory (defaults to current project root)
- `configFile` _(optional)_ - Path to oxlint configuration file (auto-detected by oxlint if not specified, if specified other config files are ignored)
- `fix` _(optional)_ - Automatically fix problems (default: `false`)
- `format` _(optional)_ - Output format (default: `"default"`)
  - Available formats: `checkstyle`, `default`, `github`, `gitlab`, `json`, `junit`, `stylish`, `unix`
- `quiet` _(optional)_ - Report errors only, disable warnings (default: `false`)
- `maxWarnings` _(optional)_ - Number of warnings to trigger nonzero exit code (minimum: 0)

## Configuration

The executor automatically looks for configuration files in this order:

1. `.oxlintrc.json`
2. `.oxlintrc`
3. `oxlint.json`

See [oxlint documentation](https://oxc-project.github.io/docs/guide/usage/linter.html) for configuration options.
