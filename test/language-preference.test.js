/**
 * The remembered-language script: it runs the exact emitted source against a
 * minimal fake window, then checks the build wiring (asset, `<head>` tag,
 * manifest row, CSP) for a bilingual fixture and its absence otherwise.
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import {
  LANGUAGE_REDIRECT_KEY,
  LANGUAGE_SCRIPT_PATH,
  LANGUAGE_SCRIPT_SOURCE,
  LANGUAGE_STORAGE_KEY,
} from '../src/core/internal/language-preference.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import {
  addEditions,
  buildRichFixture,
  stableId,
} from './helpers/page-kind-fixtures.js';

const ORIGIN = 'https://site.example.com';

/**
 * Run the script against a fake page.
 *
 * @param {object} [options] the page
 * @returns {{replaced: string[], local: Map<string, string>, session: Map<string, string>, listeners: Map<string, Function>}} what happened
 */
function run(options = {}) {
  const {
    lang = 'en-US',
    pathname = '/post/',
    search = '',
    hash = '',
    stored,
    marker,
    links = [],
    throwingStorage = false,
  } = options;
  const local = new Map();
  const session = new Map();
  if (stored !== undefined) local.set(LANGUAGE_STORAGE_KEY, stored);
  if (marker !== undefined) session.set(LANGUAGE_REDIRECT_KEY, marker);
  const store = (map) => ({
    getItem: (key) => {
      if (throwingStorage) throw new Error('blocked');
      return map.has(key) ? map.get(key) : null;
    },
    setItem: (key, value) => {
      if (throwingStorage) throw new Error('blocked');
      map.set(key, String(value));
    },
    removeItem: (key) => {
      if (throwingStorage) throw new Error('blocked');
      map.delete(key);
    },
  });
  const replaced = [];
  const listeners = new Map();
  const location = {
    origin: ORIGIN,
    href: `${ORIGIN}${pathname}${search}${hash}`,
    pathname,
    search,
    hash,
    replace: (url) => replaced.push(url),
  };
  const document = {
    documentElement: { lang },
    addEventListener: (type, fn) => listeners.set(type, fn),
    querySelectorAll: () =>
      links.map((link) => ({
        hasAttribute: (name) => name === 'type' && link.type !== undefined,
        getAttribute: (name) =>
          name === 'hreflang' ? link.hreflang : link.href,
      })),
  };
  new Function(
    'document',
    'location',
    'localStorage',
    'sessionStorage',
    LANGUAGE_SCRIPT_SOURCE,
  )(document, location, store(local), store(session));
  return { replaced, local, session, listeners };
}

const TA = { hreflang: 'ta', href: `${ORIGIN}/ta/post/` };

/**
 * @param {string | null} lang the chip's lang attribute
 * @returns {object} a click event on a chip
 */
const chipClick = (lang) => ({
  target: {
    closest: (selector) =>
      selector === 'a.g-lang-chip'
        ? { getAttribute: (name) => (name === 'lang' ? lang : null) }
        : null,
  },
});

test('language script: a chip click stores its lang and never prevents default', () => {
  const { listeners, local } = run();
  const event = { ...chipClick('ta'), preventDefault: () => assert.fail() };
  listeners.get('click')(event);
  assert.equal(local.get(LANGUAGE_STORAGE_KEY), 'ta');
  listeners.get('click')({ target: { closest: () => null } });
  listeners.get('click')({ target: {} });
  assert.equal(local.get(LANGUAGE_STORAGE_KEY), 'ta');
});

test('language script: a click with throwing storage is swallowed', () => {
  const { listeners } = run({ throwingStorage: true });
  assert.doesNotThrow(() => listeners.get('click')(chipClick('ta')));
});

test('language script: merely visiting never writes the preference', () => {
  const { local } = run({ links: [TA] });
  assert.equal(local.has(LANGUAGE_STORAGE_KEY), false);
});

test('language script: redirects to the stored language, keeping search and hash', () => {
  const { replaced, session } = run({
    stored: 'TA',
    search: '?a=1',
    hash: '#h',
    links: [{ hreflang: 'en-US', href: `${ORIGIN}/post/` }, TA],
  });
  assert.deepEqual(replaced, ['/ta/post/?a=1#h']);
  assert.equal(session.get(LANGUAGE_REDIRECT_KEY), '/ta/post/');
});

test('language script: no redirect when the preference equals the page language', () => {
  const { replaced, session } = run({
    lang: 'ta',
    stored: 'TA',
    marker: '/ta/post/',
    links: [TA],
  });
  assert.deepEqual(replaced, []);
  assert.equal(session.has(LANGUAGE_REDIRECT_KEY), false);
});

test('language script: nothing stored, no alternate, x-default and same-path do nothing', () => {
  assert.deepEqual(run({ links: [TA] }).replaced, []);
  assert.deepEqual(run({ stored: 'ta' }).replaced, []);
  assert.deepEqual(
    run({
      stored: 'x-default',
      links: [{ hreflang: 'x-default', href: `${ORIGIN}/ta/post/` }],
    }).replaced,
    [],
  );
  assert.deepEqual(
    run({ stored: 'ta', links: [{ hreflang: 'ta', href: `${ORIGIN}/post/` }] })
      .replaced,
    [],
  );
});

test('language script: a cross-origin alternate is ignored', () => {
  const { replaced } = run({
    stored: 'ta',
    links: [{ hreflang: 'ta', href: 'https://other.example.org/ta/post/' }],
  });
  assert.deepEqual(replaced, []);
});

test('language script: a feed alternate (has type) is ignored', () => {
  const { replaced } = run({
    stored: 'ta',
    links: [{ ...TA, type: 'application/atom+xml' }],
  });
  assert.deepEqual(replaced, []);
});

test('language script: throwing storage never redirects or throws', () => {
  const { replaced } = run({
    stored: 'ta',
    links: [TA],
    throwingStorage: true,
  });
  assert.deepEqual(replaced, []);
});

test('language script: the loop guard refuses a second redirect to the same target', () => {
  const { replaced } = run({
    stored: 'ta',
    marker: '/ta/post/',
    links: [TA],
  });
  assert.deepEqual(replaced, []);
});

test('language script: stays under 1 KB minified and is ES5-style', () => {
  assert.ok(Buffer.byteLength(LANGUAGE_SCRIPT_SOURCE) < 1100);
  assert.ok(!/=>|\blet\b|\bconst\b|`/.test(LANGUAGE_SCRIPT_SOURCE));
});

/**
 * @param {object} buildInput the build input
 * @returns {Promise<{dir: string, manifest: any, cleanup: Function}>} a build
 */
async function build(buildInput) {
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  const { manifest } = await renderPublication(buildInput, {
    outputDirectory,
    workDirectory,
    sourceDirectory,
    provenance: testProvenance(),
  });
  return { dir: outputDirectory, manifest, cleanup };
}

test('language script: emitted and wired only for a bilingual build', async (t) => {
  const plain = await build(await buildRichFixture());
  t.after(plain.cleanup);
  const rich = await buildRichFixture();
  const first = JSON.parse(JSON.stringify(rich.content[0]));
  first.frontmatter = {
    ...first.frontmatter,
    id: stableId(601),
    series: undefined,
    seriesOrder: undefined,
    route: undefined,
    hero: undefined,
    socialImage: undefined,
    redirects: [],
    title: 'முதல்',
    slug: 'first-ta',
    language: 'ta',
    translationOf: rich.content[0].frontmatter.slug,
  };
  delete first.media;
  const bilingualInput = await addEditions(rich, [first]);
  const bi = await build(bilingualInput);
  t.after(bi.cleanup);

  const assetPath = `fixture-1/${LANGUAGE_SCRIPT_PATH}`;
  const tag = `<script src="/fixture-1/${LANGUAGE_SCRIPT_PATH}"></script>`;
  const listed = (manifest) =>
    manifest.assets.filter((asset) =>
      asset.path.endsWith('gala-language-v1.js'),
    );

  assert.equal(listed(plain.manifest).length, 0);
  for (const route of plain.manifest.routes) {
    if (!route.path.endsWith('.html')) continue;
    const html = await readFile(path.join(plain.dir, route.path), 'utf8');
    assert.ok(!html.includes('gala-language'), route.path);
  }

  assert.equal(listed(bi.manifest).length, 1);
  assert.equal(listed(bi.manifest)[0].path, assetPath);
  assert.equal(
    await readFile(path.join(bi.dir, assetPath), 'utf8'),
    LANGUAGE_SCRIPT_SOURCE,
  );
  let pages = 0;
  for (const route of bi.manifest.routes) {
    if (!route.path.endsWith('index.html')) continue;
    const html = await readFile(path.join(bi.dir, route.path), 'utf8');
    assert.ok(html.includes(tag), route.path);
    assert.match(html, /script-src 'self'/);
    pages += 1;
  }
  assert.ok(pages > 3);
});
