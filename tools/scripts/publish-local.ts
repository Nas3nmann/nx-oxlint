#!/usr/bin/env npx tsx
/**
 * CLI script to start local registry and publish packages for local testing.
 */
import startLocalRegistry from './start-local-registry.ts';

(async () => {
  await startLocalRegistry();
})();
