/**
 * The article-page modules reach nothing Node-only: walking their static
 * imports, no module imports a `node:` built-in, Eleventy or the schemas
 * package. (A browser bundle of them is probed separately; this keeps the
 * property from regressing.)
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const INTERNAL = path.resolve(import.meta.dirname, '../src/core/internal');

const ENTRIES = [
  'page-kinds.js',
  'skeleton.js',
  'chrome.js',
  'components.js',
  'site-render.js',
  'document-shell.js',
  'content-security.js',
  'messages-load.js',
  'theme-paths.js',
  'audience.js',
  'interactions.js',
  'listen.js',
];

const FORBIDDEN = /^(node:|@11ty\/|@rathnasgala2\/schemas)/;

test('the article-page modules import nothing Node-only, transitively', async () => {
  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {string[]} */
  const queue = ENTRIES.map((name) => path.join(INTERNAL, name));
  /** @type {string[]} */
  const offences = [];
  while (queue.length > 0) {
    const file = /** @type {string} */ (queue.pop());
    if (seen.has(file)) continue;
    seen.add(file);
    const source = await readFile(file, 'utf8');
    const specifiers = [
      ...source.matchAll(/^(?:import|export)\s[^'"]*?from\s+'([^']+)';/gmu),
      ...source.matchAll(/^import\s+'([^']+)';/gmu),
      ...source.matchAll(/\bimport\(\s*'([^']+)'\s*\)/gu),
    ].map((match) => match[1]);
    for (const specifier of specifiers) {
      if (FORBIDDEN.test(specifier)) {
        offences.push(`${path.relative(INTERNAL, file)} imports ${specifier}`);
      } else if (specifier.startsWith('.')) {
        queue.push(path.resolve(path.dirname(file), specifier));
      }
    }
  }
  assert.deepEqual(offences, []);
  assert.ok(seen.size > 40, `walked ${seen.size} modules`);
});
