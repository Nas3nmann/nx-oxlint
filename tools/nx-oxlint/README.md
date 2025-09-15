# nx-oxlint

An Nx plugin for [oxlint](https://oxc-project.github.io/docs/guide/usage/linter.html) - a fast ESLint alternative written in Rust.

## Quick Setup with generator

The easiest way to set up nx-oxlint in your workspace is to use the init generator:

```bash
npx nx add nx-oxlint
```

This command will:

- Add `nx-oxlint` as a devDependency to your workspace
- Remove existing `@nx/eslint/plugin` configuration in your `nx.json`
- Add a plugin configuration for `nx-oxlint` with an interferred `lint` target to your `nx.json`

This command will **not**:

- Create an `.oxlintrc.json`, so running `lint` will use the default config. Feel free to add a config file and modify the rules as needed

You might need to update the nx deamon and cache using

```bash
nx reset
```

## Manual Setup

### Install

```bash
npm install nx-oxlint
```

### Add plugin to your `nx.json` OR

````json
{
  plugins: [
    {
      "plugin": "nx-oxlint",
      "options": {
        "lintTargetName": "lint"
      }
    },
  ]
}

### Add the executor to `project.json`:

```json
{
  "targets": {
    "lint": {
      "executor": "nx-oxlint:lint"
    }
  }
}
````

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
- `configFile` _(optional)_ - Path to oxlint configuration file (auto-detected by oxlint if not specified, if specified other config files are ignored)
- `fix` _(optional)_ - Automatically fix problems (default: `false`)
- `format` _(optional)_ - Output format (default: `"default"`)
  - Available formats: `checkstyle`, `default`, `github`, `gitlab`, `json`, `junit`, `stylish`, `unix`
- `quiet` _(optional)_ - Report errors only, disable warnings (default: `false`)
- `maxWarnings` _(optional)_ - Number of warnings to trigger nonzero exit code (minimum: 0)

## Configuration

If no config file is passed to the plugin/executor, Oxlint will automatically look for configuration files and even consider nested configs with name `.oxlintrc.json`

See [oxlint documentation](https://oxc-project.github.io/docs/guide/usage/linter.html) for configuration options.
