/**
 * Deterministic recursive directory listing.
 *
 * Filesystem readdir order is not portable, so every caller that needs a
 * reproducible route/asset ordering must sort explicitly; this module never
 * returns raw enumeration order (brief S2 section 3: "no
 * filesystem-enumeration-order dependence").
 */

import { readdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * List every regular file under `root`, recursively, as POSIX-style
 * (forward-slash) paths relative to `root`, sorted by UTF-8 byte sequence.
 *
 * @param {string} root an absolute directory path
 * @returns {Promise<string[]>} sorted, root-relative, forward-slash paths
 */
export async function listFilesSortedByUtf8Bytes(root) {
  const entries = await readdir(root, { withFileTypes: true });
  /** @type {string[]} */
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFilesSortedByUtf8Bytes(absolute);
      for (const relative of nested) {
        files.push(`${entry.name}/${relative}`);
      }
    } else if (entry.isFile()) {
      files.push(entry.name);
    }
  }
  return files.sort((a, b) =>
    Buffer.compare(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8')),
  );
}
