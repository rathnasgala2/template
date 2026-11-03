import { readFile } from 'node:fs/promises';

const VIDEO_SCRIPT_SOURCE_URL = new URL(
  '../../modules/interactions/browser/gala-video.js',
  import.meta.url,
);

/**
 * The click-to-play video script's bytes, read from the template package.
 *
 * @returns {Promise<Buffer>} the shipped script
 */
export function loadVideoScript() {
  return readFile(VIDEO_SCRIPT_SOURCE_URL);
}
