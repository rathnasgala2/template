/**
 * The Node-only half of the policy defaults: reading the schemas package's
 * default policy text from disk. Kept apart so `policy-defaults.js` (the
 * check of a defaults document) imports nothing from `node:` and runs in a
 * browser, where the caller supplies the document itself.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { SPECIFIER, readSitePolicyDefaults } from './policy-defaults.js';

/** @type {Readonly<import('./policy-defaults.js').SitePolicyDefaults> | undefined} */
let loaded;

/**
 * Read the schemas package's default policy text once per process.
 *
 * @returns {Readonly<import('./policy-defaults.js').SitePolicyDefaults>} the defaults, checked
 * @throws {import('../errors.js').RenderPolicyViolationError} when the export is missing or not the
 *   documented shape
 */
export function loadSitePolicyDefaults() {
  if (loaded !== undefined) return loaded;
  loaded = readSitePolicyDefaults(() =>
    readFileSync(fileURLToPath(import.meta.resolve(SPECIFIER)), 'utf8'),
  );
  return loaded;
}
