import assert from 'node:assert/strict';
import { loadSitePolicyDefaults } from '../src/core/internal/policy-defaults-node.js';
import test from 'node:test';

import { getMessages } from '../src/core/internal/messages.js';
import { CATALOGS } from '../src/core/internal/messages/registry.js';

const PROBES = ['71', '82', '93', '104'];

/**
 * @param {unknown} value a catalog value
 * @returns {string} "string", or "fn:<arity>:<probe indexes present>"
 */
function shape(value) {
  if (typeof value === 'string') return 'string';
  assert.equal(typeof value, 'function');
  const fn = /** @type {(...args: string[]) => string} */ (value);
  const out = fn(...PROBES.slice(0, fn.length));
  const used = PROBES.slice(0, fn.length)
    .map((p, i) => (out.includes(p) ? i : -1))
    .filter((i) => i >= 0);
  return `fn:${fn.length}:${used.join(',')}`;
}

const en = CATALOGS.en;
const enKeys = Object.keys(en).sort();

for (const [tag, catalog] of Object.entries(CATALOGS)) {
  test(`catalog ${tag} has exactly the en keys, placeholders and non-empty text`, () => {
    assert.deepEqual(Object.keys(catalog).sort(), enKeys);
    for (const key of enKeys) {
      const value = catalog[key];
      if (key === 'formatDate') {
        assert.equal(typeof value, 'function');
        const out = /** @type {(iso: string) => string} */ (value)(
          '2026-10-29',
        );
        assert.ok(out.trim() !== '', 'formatDate renders a date');
        continue;
      }
      assert.equal(shape(value), shape(en[key]), `${tag}.${key} placeholders`);
      if (typeof value === 'string') {
        assert.ok(value.trim() !== '', `${tag}.${key} is non-empty`);
      } else {
        const fn = /** @type {(...args: string[]) => string} */ (value);
        assert.ok(
          fn(...PROBES.slice(0, fn.length)).trim() !== '',
          `${tag}.${key} renders non-empty`,
        );
      }
    }
  });
}

test('lookup: exact, script, primary, alias, then en', () => {
  assert.equal(getMessages('ta'), CATALOGS.ta);
  assert.equal(getMessages('TA-in'), CATALOGS.ta);
  assert.equal(getMessages('ta_IN'), CATALOGS.ta);
  assert.equal(getMessages('xx'), CATALOGS.en);
  assert.equal(getMessages(''), CATALOGS.en);
  assert.equal(getMessages(undefined), CATALOGS.en);
  assert.equal(getMessages('en-GB'), CATALOGS.en);
  assert.equal(getMessages('zh'), CATALOGS['zh-hans'] ?? CATALOGS.en);
  assert.equal(
    getMessages('zh-TW'),
    CATALOGS['zh-hant'] ?? CATALOGS['zh-hans'] ?? CATALOGS.en,
  );
  assert.equal(getMessages('no'), CATALOGS.nb ?? CATALOGS.en);
});

test('a site without variants renders its chrome in the defaultLanguage catalog', async () => {
  const { buildRichFixture } = await import('./helpers/page-kind-fixtures.js');
  const { buildGeneratedPages } =
    await import('../src/core/internal/page-kinds.js');
  const input = /** @type {any} */ (await buildRichFixture());
  input.content = input.content.filter(
    (/** @type {any} */ r) => r.frontmatter.slug !== 'contact',
  );
  input.publication.contactForm = { enabled: true, fields: {} };
  input.publication.defaultLanguage = 'ta';
  const pages = buildGeneratedPages(input, {
    getMessages,
    loadPolicyDefaults: loadSitePolicyDefaults,
    pageBody: (/** @type {string} */ b) => b,
  });
  const contact = pages.find((/** @type {any} */ p) =>
    p.route.includes('contact'),
  );
  assert.ok(contact, 'contact page generated');
  assert.ok(contact.bodyHtml.includes('தொடர்பு'), 'Tamil chrome');
});

test('CATALOG_KEYS, the registry and the single-locale loaders agree', async () => {
  const { CATALOG_KEYS } =
    await import('../src/core/internal/messages-core.js');
  const { loadCatalog } = await import('../src/core/internal/messages-load.js');
  assert.deepEqual([...CATALOG_KEYS].sort(), Object.keys(CATALOGS).sort());
  for (const key of CATALOG_KEYS) {
    assert.equal(await loadCatalog(key), CATALOGS[key], `${key} loads`);
  }
  await assert.rejects(() => loadCatalog('xx'), RangeError);
});

test('getMessages is the registry lookup for every tag shape', async () => {
  const { resolveCatalogKey } =
    await import('../src/core/internal/messages-core.js');
  for (const tag of [
    '',
    'en',
    'EN_us',
    'ta',
    'zh',
    'zh-TW',
    'zh-Hant-HK',
    'zh-Hans-CN',
    'sr-Latn-RS',
    'no',
    'nn-NO',
    'iw',
    'pt-BR',
    'xx-YY',
    'ta-IN',
  ]) {
    assert.equal(getMessages(tag), CATALOGS[resolveCatalogKey(tag)], tag);
  }
  assert.equal(resolveCatalogKey('zh-TW'), 'zh-hant');
  assert.equal(resolveCatalogKey('nn'), 'nb');
  assert.equal(resolveCatalogKey(undefined), 'en');
});

test('loadMessagesFor serves only the loaded locales and fails loudly otherwise', async () => {
  const { loadMessagesFor } =
    await import('../src/core/internal/messages-load.js');
  const get = await loadMessagesFor(['ta-IN']);
  assert.equal(get('ta'), CATALOGS.ta);
  assert.equal(get('xx'), CATALOGS.en);
  assert.throws(() => get('fr'), /"fr" message catalog is not loaded/);
});

const BLOCK_AND_COMMENT_KEYS = [
  'videoPlayLabel',
  'videoOpenOnLabel',
  'bookmarkReadOnLabel',
  'fileDownloadLabel',
  'recommendationsHeading',
  'recommendationVisitLabel',
  'commentLikeLabel',
  'commentUnlikeLabel',
  'commentPinnedLabel',
  'commentSortLabel',
  'commentSortNewestLabel',
  'commentSortOldestLabel',
];

test('the block, recommendation and comment sentences are translated, not copied from English', () => {
  const english = (/** @type {string} */ key) => {
    const value = en[key];
    return typeof value === 'function' ? value('X') : value;
  };
  assert.equal(english('videoOpenOnLabel'), 'Watch on X');
  assert.equal(english('fileDownloadLabel'), 'Download PDF (X)');
  for (const [tag, catalog] of Object.entries(CATALOGS)) {
    if (tag === 'en') continue;
    const same = BLOCK_AND_COMMENT_KEYS.filter((key) => {
      const value = catalog[key];
      const text = typeof value === 'function' ? value('X') : value;
      return text === english(key);
    });
    // A few short words are the same in some languages (for example "Visit");
    // a catalog that copies most of the set was not translated.
    assert.ok(same.length <= 2, `${tag} keeps English for ${same.join(', ')}`);
  }
  for (const [tag, catalog] of Object.entries(CATALOGS)) {
    for (const key of [
      'videoOpenOnLabel',
      'bookmarkReadOnLabel',
      'recommendationsHeading',
    ]) {
      const out = /** @type {(a: string) => string} */ (catalog[key])('SITE-X');
      assert.ok(out.includes('SITE-X'), `${tag}.${key} names the site`);
    }
    const size = /** @type {(a: string) => string} */ (
      catalog.fileDownloadLabel
    )('9 KB');
    assert.ok(
      size.includes('9 KB') && size.includes('PDF'),
      `${tag}.fileDownloadLabel`,
    );
  }
});
