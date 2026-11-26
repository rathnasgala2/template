/**
 * The `quote` fence: a testimonial becomes one `figure.g-quote` (quote, then
 * who said it); malformed stays a code block; the photo resolves through the
 * media pipeline like a video poster; no structured data is added; the feed,
 * email and `llms` forms are the plain figure; the styling adds no class.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { GALA_BASE_COMPONENT_CSS } from '../src/core/internal/appearance/base-layer.js';
import { COMPONENT_CLASS_GROUPS } from '../src/core/internal/appearance/styling-contract.js';
import {
  assertPolicyConformantHtml,
  computeBodyDigest,
  normalizeAuthoredMarkdown,
} from '../src/core/internal/content-security.js';
import { leanBlocks } from '../src/core/internal/content-blocks.js';
import { toEmailSafeHtml } from '../src/core/internal/email-fragment.js';
import { htmlToText } from '../src/core/internal/llms.js';
import {
  ALLOWED_ATTRIBUTES_BY_TAG,
  FENCED_BLOCKS,
  QUOTE_LIMITS,
  renderPolicyDocument,
} from '../src/core/internal/render-policy-content.js';
import { render, setBody } from './helpers/body-render.js';
import { buildTestPng } from './helpers/media-fixtures.js';

/**
 * @param {string} body the lines inside a fence
 * @returns {string} the rendered HTML
 */
function renderQuote(body) {
  return normalizeAuthoredMarkdown(`\`\`\`quote\n${body}\n\`\`\`\n`).html;
}

/**
 * @param {string} html a rendered fence
 * @returns {boolean} whether it is an ordinary code block
 */
const isCodeBlock = (html) => html.startsWith('<pre><code>');

const FULL =
  'text: It paid for itself in a week.\nname: Jane Roe\nrole: Founder, Example Co\nurl: https://example.com/jane\nphoto: images/people/jane.jpg';

test('a full quote: blockquote, then a caption with the photo, the linked name and the role', () => {
  assert.equal(
    renderQuote(FULL),
    '<figure class="g-quote" data-gala-block="quote"><blockquote><p>It paid for itself in a week.</p></blockquote>' +
      '<figcaption><img src="images/people/jane.jpg" alt="" /><a href="https://example.com/jane" rel="noopener noreferrer">Jane Roe</a>, Founder, Example Co</figcaption></figure>\n',
  );
});

test('text and name only: plain name, no comma, no image; role without a link; keys in any case', () => {
  assert.equal(
    renderQuote('Name: Jane\nTEXT: Good.'),
    '<figure class="g-quote" data-gala-block="quote"><blockquote><p>Good.</p></blockquote><figcaption>Jane</figcaption></figure>\n',
  );
  assert.match(
    renderQuote('text: Good.\nname: Jane\nrole: CTO'),
    /<figcaption>Jane, CTO<\/figcaption>/,
  );
});

test('everything is escaped', () => {
  const html = renderQuote(
    'text: <script>x</script> & "y"\nname: <b>Jo</b>\nrole: A & B',
  );
  assert.ok(!/<script|<b>/.test(html));
  assert.match(html, /&lt;script&gt;x&lt;\/script&gt; &amp; "y"/);
  assert.match(html, /&lt;b&gt;Jo&lt;\/b&gt;, A &amp; B/);
});

test('malformed quotes stay code blocks', () => {
  const long = (/** @type {number} */ n) => 'x'.repeat(n);
  const cases = [
    'name: Jane',
    'text: Good.',
    'text: Good.\nname:',
    'text: Good.\nname: Jane\nname: Again',
    'text: Good.\nname: Jane\nnot a key value line',
    `text: ${long(601)}\nname: Jane`,
    `text: Good.\nname: ${long(81)}`,
    `text: Good.\nname: Jane\nrole: ${long(81)}`,
    'text: Good.\nname: Jane\nurl: http://example.com',
    'text: Good.\nname: Jane\nurl: javascript:alert(1)',
    'text: Good.\nname: Jane\nurl: https://u:p@example.com',
    `text: Good.\nname: Jane\nurl: https://example.com/${long(QUOTE_LIMITS.urlMax)}`,
    'text: Good.\nname: Jane\nphoto: https://example.com/a.jpg',
    'text: Good.\nname: Jane\nphoto: ../a.jpg',
    'text: Good.\nname: Jane\nphoto: images/a.pdf',
    'text: Good.\nname: Jane\nphoto: a.jpg?x=1',
  ];
  for (const body of cases) assert.ok(isCodeBlock(renderQuote(body)), body);
  assert.ok(
    !isCodeBlock(
      renderQuote(`text: ${long(600)}\nname: ${long(80)}\nrole: ${long(80)}`),
    ),
  );
});

test('the rendered quote is stable under the sanitizer and conformant', () => {
  for (const html of [renderQuote(FULL), renderQuote('text: a\nname: b')]) {
    assertPolicyConformantHtml(html, computeBodyDigest(html), 'test');
  }
});

test('a received quote figure with a foreign class or marker loses its attributes', () => {
  const bad =
    '<figure class="g-quote" data-gala-block="video"><blockquote><p>x</p></blockquote></figure>\n';
  assert.throws(() =>
    assertPolicyConformantHtml(bad, computeBodyDigest(bad), 'test'),
  );
});

test('the policy publishes the quote block and adds no attribute for it', async () => {
  assert.deepEqual(FENCED_BLOCKS.quote, {
    className: 'g-quote',
    required: ['text', 'name'],
    optional: ['role', 'url', 'photo'],
  });
  assert.equal(QUOTE_LIMITS.textMax, 600);
  assert.deepEqual(ALLOWED_ATTRIBUTES_BY_TAG.figure, [
    'class',
    'data-gala-block',
    'data-gala-video',
    'data-gala-poll',
  ]);
  const document = /** @type {any} */ (renderPolicyDocument());
  assert.ok(document.fencedBlocks.figureClasses.includes('g-quote'));
});

test('the feed, email and llms forms are the plain figure and "— name, role"', () => {
  const html = renderQuote(FULL);
  const resolve = () => undefined;
  assert.equal(leanBlocks(html, resolve), html);
  const email = toEmailSafeHtml(html, 'https://blog.example/notes/a/');
  assert.match(
    email,
    /<blockquote[^>]*><p>It paid for itself in a week\.<\/p><\/blockquote>/,
  );
  assert.match(
    email,
    /<figcaption><img [^>]*src="https:\/\/blog\.example\/notes\/a\/images\/people\/jane\.jpg"/,
  );
  assert.match(
    email,
    /<a href="https:\/\/example\.com\/jane"[^>]*>Jane Roe<\/a>, Founder, Example Co/,
  );
  assert.equal(
    htmlToText(`<p>Before.</p>${html}<p>After.</p>`),
    'Before.\n\nIt paid for itself in a week.\n\n— Jane Roe, Founder, Example Co\n\nAfter.',
  );
  assert.equal(
    htmlToText(renderQuote('text: Good.\nname: Jane')),
    'Good.\n\n— Jane',
  );
});

test('the page: photo goes through the media pipeline, no JSON-LD node is added', async () => {
  const FIRST = 'fixture-1/first-article/index.html';
  const jsonLd = (/** @type {string} */ page) =>
    [
      ...page.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      ),
    ].map((m) => m[1]);
  const plain = await render((input, source) =>
    setBody(input, source, 0, 'Intro.', []),
  );
  const withQuote = await render((input, source) =>
    setBody(input, source, 0, `Intro.\n\n\`\`\`quote\n${FULL}\n\`\`\`\n`, [
      {
        path: 'images/people/jane.jpg',
        bytes: buildTestPng(300, 300),
        mediaType: 'image/jpeg',
      },
    ]),
  );
  try {
    const before = await plain.read(FIRST);
    const page = await withQuote.read(FIRST);
    assert.match(
      page,
      /<figure class="g-quote" data-gala-block="quote"><blockquote><p>It paid for itself in a week\.<\/p><\/blockquote><figcaption><img [^>]*src="[^"]*assets\/media\/[^"]*"[^>]*>/,
    );
    const nodes = (/** @type {string} */ html) =>
      jsonLd(html).flatMap((text) => JSON.parse(text)['@graph']);
    assert.deepEqual(
      nodes(page).map((node) => node['@type']),
      nodes(before).map((node) => node['@type']),
    );
    for (const type of ['Review', 'AggregateRating', 'Quotation']) {
      assert.ok(!page.includes(type), `${type} is not emitted`);
    }
  } finally {
    await plain.cleanup();
    await withQuote.cleanup();
  }
});

test('the quote is styled from existing tokens, with a round photo and no new public class', () => {
  const css = GALA_BASE_COMPONENT_CSS;
  assert.match(
    css,
    /\.g-quote figcaption img \{[^}]*width: 2\.75rem; height: 2\.75rem;[^}]*border-radius: 50%/,
  );
  assert.ok(!css.includes('--gala-quote-mark:'), 'no token is defined here');
  const contract = Object.values(COMPONENT_CLASS_GROUPS).flat();
  assert.ok(!contract.includes('g-quote'));
});
