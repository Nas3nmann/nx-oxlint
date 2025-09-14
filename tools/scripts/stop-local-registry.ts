/**
 * This script stops the local registry for e2e testing purposes.
 * It is meant to be called in vitest's globalTeardown.
 */

import './registry.d.ts';

export default () => {
  if (global.stopLocalRegistry) {
    global.stopLocalRegistry();
  }
};
