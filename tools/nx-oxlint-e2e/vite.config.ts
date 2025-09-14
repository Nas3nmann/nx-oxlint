/// <reference types='vitest' />
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/tools/nx-oxlint-e2e',
  plugins: [],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    name: 'nx-oxlint-e2e',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
    globalSetup: '../../tools/scripts/start-local-registry.ts',
    globalTeardown: '../../tools/scripts/stop-local-registry.ts',
    testTimeout: 300000, // 5 minutes for individual tests
    hookTimeout: 600000, // 10 minutes for setup/teardown hooks
  },
}));
