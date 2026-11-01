/**
 * The Node-only half of the interactions module: reading the browser
 * scripts' bytes from the template package. Kept apart so `interactions.js`
 * (markup and constants) imports nothing from `node:` and runs in a browser.
 */

import { readFile } from 'node:fs/promises';

const INTERACTIONS_SCRIPT_SOURCE_URL = new URL(
  '../../modules/interactions/browser/gala-interactions.js',
  import.meta.url,
);

const COUNTS_SCRIPT_SOURCE_URL = new URL(
  '../../modules/interactions/browser/gala-counts.js',
  import.meta.url,
);

/**
 * Read the browser script's bytes from the template package.
 *
 * @returns {Promise<Buffer>} the script bytes
 */
export function loadInteractionsScript() {
  return readFile(INTERACTIONS_SCRIPT_SOURCE_URL);
}

/**
 * Read the counts script's bytes from the template package.
 *
 * @returns {Promise<Buffer>} the script bytes
 */
export function loadCountsScript() {
  return readFile(COUNTS_SCRIPT_SOURCE_URL);
}
