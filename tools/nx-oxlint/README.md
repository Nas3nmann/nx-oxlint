# nx-oxlint

An Nx executor plugin for [oxlint](https://oxc-project.github.io/docs/guide/usage/linter.html) - a fast ESLint alternative written in Rust.

## Installation

```bash
npm install nx-oxlint
```

## Usage

Add the executor to your project's `project.json`:

**Minimal setup** (all options are optional):

```json
{
  "targets": {
    "lint": {
      "executor": "nx-oxlint:lint"
    }
  }
}
```

**With custom options**:

```json
{
  "targets": {
    "lint": {
      "executor": "nx-oxlint:lint",
      "options": {
        "projectRoot": ".",
        "configFile": ".oxlintrc.json",
        "fix": true,
        "format": "json"
      }
    }
  }
}
```

Run linting:

```bash
nx lint your-project
```

## Options

All options are optional. The executor will work with minimal configuration.

- `projectRoot` _(optional)_ - Project root directory (defaults to current project root)
- `configFile` _(optional)_ - Path to oxlint configuration file (auto-detected if not specified)
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
