import assert from 'node:assert/strict';
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
    pageBody: (/** @type {string} */ b) => b,
  });
  const contact = pages.find((/** @type {any} */ p) =>
    p.route.includes('contact'),
  );
  assert.ok(contact, 'contact page generated');
  assert.ok(contact.bodyHtml.includes('தொடர்பு'), 'Tamil chrome');
});
