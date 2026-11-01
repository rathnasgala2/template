/**
 * The Node-only half of the Listen module: reading the browser script's
 * bytes from the template package. Kept apart so `listen.js` (markup and
 * constants) imports nothing from `node:` and runs in a browser.
 */

import { readFile } from 'node:fs/promises';

const LISTEN_SCRIPT_SOURCE_URL = new URL(
  '../../modules/interactions/browser/gala-listen.js',
  import.meta.url,
);

/**
 * Read the Listen script's bytes from the template package.
 *
 * @returns {Promise<Buffer>} the script bytes
 */
export function loadListenScript() {
  return readFile(LISTEN_SCRIPT_SOURCE_URL);
}
