/**
 * `buildGeneratedPages(..., { only })` builds one record's page and nothing else.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { getMessages } from '../src/core/internal/messages.js';
import { buildGeneratedPages } from '../src/core/internal/page-kinds.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';

test('only: one record yields exactly its own page, equal to the full build', async () => {
  const input = /** @type {any} */ (await buildRichFixture());
  const all = buildGeneratedPages(input, {
    getMessages,
    pageBody: (/** @type {string} */ body) => body,
  });
  const article = input.content.find(
    (/** @type {any} */ record) => record.frontmatter.kind === 'article',
  );
  assert.ok(article);
  const one = buildGeneratedPages(input, {
    getMessages,
    pageBody: (/** @type {string} */ body) => body,
    only: article.frontmatter.id,
  });
  assert.equal(one.length, 1);
  assert.notEqual(one[0].kind, 'policy');
  const same = all.find((page) => page.route === one[0].route);
  assert.deepEqual(one[0], same);
});

test('only: an unknown id yields no pages', async () => {
  const input = /** @type {any} */ (await buildRichFixture());
  assert.deepEqual(
    buildGeneratedPages(input, {
      getMessages,
      pageBody: (/** @type {string} */ body) => body,
      only: 'no-such-id',
    }),
    [],
  );
});
