/**
 * The browser preview's generated copy of the shipped Terms and Privacy text
 * is the document the build reads from the schemas package.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { loadSitePolicyDefaults } from '../src/core/internal/policy-defaults-node.js';
import { readSitePolicyDefaults } from '../src/core/internal/policy-defaults.js';
import { SITE_POLICY_DEFAULTS_JSON } from '../src/core/internal/policy-defaults-data.js';

test('the generated policy defaults equal the schemas package export', () => {
  assert.deepEqual(
    readSitePolicyDefaults(() => SITE_POLICY_DEFAULTS_JSON),
    loadSitePolicyDefaults(),
    'run node scripts/generate-policy-defaults.mjs and prettier --write on the data module',
  );
});
