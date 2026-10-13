/**
 * The first body image a card shows when a post has no hero: the first
 * repository-relative `assets/` image of the rendered body, never a remote,
 * `data:` or code-sample one.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { normalizeAuthoredMarkdown } from '../src/core/internal/content-security.js';
import {
  cardMediaOf,
  firstBodyImage,
} from '../src/core/internal/first-body-image.js';

/**
 * @param {string} markdown authored Markdown
 * @returns {{path: string, alt: string} | undefined} its first body image
 */
const firstOf = (markdown) =>
  firstBodyImage(normalizeAuthoredMarkdown(markdown).html);

test('a plain image and its alt text', () => {
  assert.deepEqual(firstOf('Intro.\n\n![A cat](assets/content-p-cat.png)\n'), {
    path: 'assets/content-p-cat.png',
    alt: 'A cat',
  });
});

test('a ./assets/ prefix is normalised away', () => {
  assert.deepEqual(firstOf('![x](./assets/a.jpg)'), {
    path: 'assets/a.jpg',
    alt: 'x',
  });
});

test('the first qualifying image wins; remote and data: images are skipped', () => {
  assert.deepEqual(
    firstOf(
      '![r](https://example.com/r.png)\n\n![d](data:image/png;base64,AAAA)\n\n' +
        '![one](assets/one.png)\n\n![two](assets/two.png)\n',
    ),
    { path: 'assets/one.png', alt: 'one' },
  );
  assert.equal(firstOf('![r](https://example.com/r.png)'), undefined);
  assert.equal(
    firstBodyImage('<p><img src="data:image/png;base64,AAAA" alt=""></p>'),
    undefined,
  );
});

test('an image shown inside a fenced code block is skipped', () => {
  assert.equal(firstOf('```md\n![x](assets/x.png)\n```\n'), undefined);
  assert.deepEqual(
    firstOf('```md\n![x](assets/x.png)\n```\n\n![y](assets/y.png)'),
    {
      path: 'assets/y.png',
      alt: 'y',
    },
  );
});

test('a reference-style image resolves through its definition', () => {
  assert.deepEqual(firstOf('![Ref alt][ref]\n\n[ref]: assets/x.png\n'), {
    path: 'assets/x.png',
    alt: 'Ref alt',
  });
});

test('a path outside assets/ and a body with no image give undefined', () => {
  assert.equal(firstOf('![x](images/x.png)'), undefined);
  assert.equal(firstOf('Just words.'), undefined);
});

test('cardMediaOf: hero wins; else the inventoried body image; a remote-only body has none', () => {
  const file = {
    path: 'assets/h.png',
    sourceDigest: 'sha256:' + 'a'.repeat(64),
  };
  const inventoried = {
    path: 'assets/p.png',
    sourceDigest: 'sha256:' + 'b'.repeat(64),
    mediaType: 'image/png',
  };
  const record = (/** @type {any} */ over) =>
    /** @type {any} */ ({ frontmatter: {}, body: '', media: [], ...over });
  const hero = { file, alt: 'h', role: 'informative' };
  assert.equal(
    cardMediaOf(
      record({
        frontmatter: { hero },
        body: '<img src="assets/p.png" alt="p">',
        media: [inventoried],
      }),
    ),
    hero,
  );
  assert.deepEqual(
    cardMediaOf(
      record({
        body: '<p><img src="assets/p.png" alt="p &amp; q"></p>',
        media: [inventoried],
      }),
    ),
    {
      file: { path: 'assets/p.png', sourceDigest: inventoried.sourceDigest },
      alt: 'p & q',
      role: 'informative',
    },
  );
  assert.equal(
    cardMediaOf(record({ body: '<p><img src="assets/p.png" alt="p"></p>' })),
    undefined,
    'an image the record does not inventory is not a card picture',
  );
  assert.equal(
    cardMediaOf(
      record({
        body: normalizeAuthoredMarkdown('![r](https://example.com/r.png)').html,
      }),
    ),
    undefined,
  );
});
