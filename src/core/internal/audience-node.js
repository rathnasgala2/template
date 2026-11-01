/**
 * The Node-only half of the audience module: reading the browser script's
 * bytes from the template package. Kept apart so `audience.js` (markup and
 * constants) imports nothing from `node:` and runs in a browser.
 */

import { readFile } from 'node:fs/promises';

const AUDIENCE_SCRIPT_SOURCE_URL = new URL(
  '../../modules/interactions/browser/gala-audience.js',
  import.meta.url,
);

/**
 * Read the audience script's bytes from the template package.
 *
 * @returns {Promise<Buffer>} the script bytes
 */
export function loadAudienceScript() {
  return readFile(AUDIENCE_SCRIPT_SOURCE_URL);
}
