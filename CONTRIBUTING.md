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
nx test nx-oxlint         # Run tests
nx lint nx-oxlint         # Lint code
```

**Test with demo projects:**

```bash
nx lint react-app         # Test React app
nx lint react-lib         # Test React library
nx lint ts-lib            # Test TypeScript library
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
