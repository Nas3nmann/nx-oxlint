# Contributing to nx-oxlint

## Setup

1. Clone and install dependencies:

   ```bash
   git clone https://github.com/Nas3nmann/nx-oxlint.git
   cd nx-oxlint
   npm install
   ```

2. Build the plugin:
   ```bash
   nx build nx-oxlint
   ```

## Development

**Build & Test:**

```bash
nx build nx-oxlint        # Build plugin
nx lint nx-oxlint         # Lint code
nx test nx-oxlint         # Run tests
nx e2e nx-oxlint-e2e         # Run e2e tests
```

**Test locally with Verdaccio:**

You can test the plugin in any local Nx project by publishing it to a local npm registry:

1. Start Verdaccio and publish the plugin:

   ```bash
   npx tsx tools/scripts/publish-local.ts
   ```

   This starts a local registry at `http://localhost:4873` and publishes the plugin as version `0.0.0-e2e`.

2. In your test project, create an `.npmrc` file to use the local registry:

   ```
   registry=http://localhost:4873
   ```

3. Install and use the plugin:

   ```bash
   npm install nx-oxlint@e2e
   ```

## Submitting Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test thoroughly**

   ```bash
   nx build nx-oxlint && nx test nx-oxlint && nx lint nx-oxlint
   ```

3. **Commit using conventional format**

   ```bash
   git commit -m "feat: your change description"
   ```

   Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

4. **Create Pull Request**
   - Clear description of changes
   - Include test results
   - Ensure CI passes

## Code Guidelines

- Follow TypeScript best practices
- Write tests for new functionality
- Update `schema.json` and `schema.d.ts` for new executor options
- Update README.md for new features

## License

Contributions are licensed under MIT.
