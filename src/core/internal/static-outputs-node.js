/**
 * The Node-only half of the static outputs: reading an article's Markdown
 * file from the repository tree. Kept apart so `static-outputs.js` (the
 * documents built from a build input) imports nothing from `node:` and runs
 * in a browser.
 */

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { markdownBodyOf } from './static-outputs.js';

/**
 * @typedef {import('../../../types/index.d.ts').ContentBuildRecord} ContentBuildRecord
 */

/**
 * Read an article's Markdown body from the repository tree.
 *
 * @param {string} sourceDirectory the caller-mounted repository root
 * @param {ContentBuildRecord} record an article
 * @returns {Promise<string | undefined>} the body, or `undefined` when the
 *   file is missing, outside the tree, not the file the build input digested,
 *   or has no front matter fence
 */
export async function readMarkdownBody(sourceDirectory, record) {
  const root = path.resolve(sourceDirectory) + path.sep;
  const resolved = path.resolve(sourceDirectory, record.sourcePath);
  if (!resolved.startsWith(root)) return undefined;
  let bytes;
  try {
    bytes = await readFile(resolved);
  } catch {
    return undefined;
  }
  const digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
  if (digest !== record.sourceDigest) return undefined;
  return markdownBodyOf(bytes.toString('utf8'));
}
