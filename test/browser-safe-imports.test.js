/**
 * The article-page modules, and the browser entry point `src/core/preview.js`,
 * reach nothing Node-only: walking their static and literal dynamic imports,
 * no module imports a `node:` built-in, Eleventy or the schemas validator, and
 * no source line uses `import.meta.resolve`, `require`, `createRequire`,
 * `process.` or `Buffer`. The preview may reach only the schemas package's
 * browser-safe `palette` export. (A browser bundle is probed separately; this
 * keeps the property from regressing.)
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
/** Third-party packages the browser entry may import. */
const PREVIEW_PACKAGES = new Set([
  'markdown-it',
  'sanitize-html',
  'prismjs',
  '@rathnasgala2/schemas/palette',
]);
/**
 * @param {string} specifier a bare import
 * @param {ReadonlySet<string>} allow allowed packages
 * @returns {boolean} whether it is one of them (or a file inside one)
 */
const isAllowed = (specifier, allow) =>
  [...allow].some(
    (pkg) => specifier === pkg || specifier.startsWith(`${pkg}/`),
  );
const NODE_ONLY_SOURCE =
  /\bimport\.meta\.resolve\b|\brequire\s*\(|\bcreateRequire\b|\bprocess\.|\bBuffer\b/;

/**
 * @param {string[]} entries absolute entry files
 * @param {{allow?: ReadonlySet<string>, source?: boolean}} [options] bare
 *   specifiers allowed, and whether to scan source text for Node-only names
 * @returns {Promise<{offences: string[], seen: Set<string>}>} what was found
 */
async function walk(entries, { allow = new Set(), source = false } = {}) {
  /** @type {Set<string>} */
  const seen = new Set();
  const queue = [...entries];
  /** @type {string[]} */
  const offences = [];
  while (queue.length > 0) {
    const file = /** @type {string} */ (queue.pop());
    if (seen.has(file)) continue;
    seen.add(file);
    const text = await readFile(file, 'utf8');
    const name = path.relative(INTERNAL, file);
    if (source) {
      const code = text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      if (NODE_ONLY_SOURCE.test(code))
        offences.push(`${name} uses a Node-only name`);
    }
    const specifiers = [
      ...text.matchAll(/^(?:import|export)\s[^'"]*?from\s+'([^']+)';/gmu),
      ...text.matchAll(/^import\s+'([^']+)';/gmu),
      ...text.matchAll(/\bimport\(\s*'([^']+)'\s*\)/gu),
    ].map((match) => match[1]);
    for (const specifier of specifiers) {
      if (specifier.startsWith('.')) {
        queue.push(path.resolve(path.dirname(file), specifier));
      } else if (
        !isAllowed(specifier, allow) &&
        (FORBIDDEN.test(specifier) || source)
      ) {
        offences.push(`${name} imports ${specifier}`);
      }
    }
  }
  return { offences, seen };
}

test('the article-page modules import nothing Node-only, transitively', async () => {
  const { offences, seen } = await walk(
    ENTRIES.map((name) => path.join(INTERNAL, name)),
  );
  assert.deepEqual(offences, []);
  assert.ok(seen.size > 40, `walked ${seen.size} modules`);
});

test('the browser entry reaches no Node-only module, validator, Eleventy or require', async () => {
  const { offences, seen } = await walk(
    [path.resolve(INTERNAL, '../preview.js')],
    { allow: PREVIEW_PACKAGES, source: true },
  );
  assert.deepEqual(offences, []);
  const reached = [...seen].map((file) => path.relative(INTERNAL, file));
  assert.ok(reached.includes('article-preview.js'));
  assert.ok(reached.includes('appearance/palette-derive.js'));
  for (const heavy of [
    'appearance/palette-sheet.js',
    'theme-assets.js',
    'messages.js',
    'eleventy-render.js',
  ]) {
    assert.ok(!reached.includes(heavy), `${heavy} is out of the preview graph`);
  }
});
