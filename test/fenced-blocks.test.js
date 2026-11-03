/**
 * Fenced blocks (`video`, `bookmark`, `file`): the markdown pipeline turns a
 * well-formed fence into one `<figure>` card using only tags and attributes
 * the render policy admits, and leaves a malformed one an ordinary code block.
 * The sanitizer admits no figure attribute that is not part of a block, and
 * the published policy carries the grammar and the video frame hosts.
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import {
  assertPolicyConformantHtml,
  computeBodyDigest,
  normalizeAuthoredMarkdown,
} from '../src/core/internal/content-security.js';
import {
  ALLOWED_ATTRIBUTES_BY_TAG,
  CONTENT_SECURITY_POLICY_COMPLETE,
  CONTENT_SECURITY_POLICY_META_BASELINE,
  FENCED_BLOCKS,
  renderPolicyDocument,
} from '../src/core/internal/render-policy-content.js';

/**
 * @param {string} body the lines inside a fence
 * @param {string} [info] the fence info string
 * @returns {string} the rendered HTML
 */
function render(body, info = 'video') {
  return normalizeAuthoredMarkdown(`\`\`\`${info}\n${body}\n\`\`\`\n`).html;
}

/**
 * @param {string} html a rendered fence
 * @returns {boolean} whether it is an ordinary code block
 */
const isCodeBlock = (html) => html.startsWith('<pre><code>');

const VIDEO = 'provider: youtube\nid: dQw4w9WgXcQ\ntitle: A talk';

test('video: a link card to the watch page with the title, no poster', () => {
  assert.equal(
    render(VIDEO),
    '<figure class="g-video" data-gala-block="video" data-gala-video="youtube:dQw4w9WgXcQ">' +
      '<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" rel="noopener noreferrer">' +
      '<strong>A talk</strong></a></figure>\n',
  );
});

test('video: Vimeo, a repository poster encoded like a Markdown image, unknown keys ignored', () => {
  assert.equal(
    render(
      'Provider: Vimeo\nid: 123456\ntitle: Short film\nposter: ./assets/my poster.png\nautoplay: yes',
    ),
    '<figure class="g-video" data-gala-block="video" data-gala-video="vimeo:123456">' +
      '<a href="https://vimeo.com/123456" rel="noopener noreferrer">' +
      '<img src="./assets/my%20poster.png" alt="" /><strong>Short film</strong></a></figure>\n',
  );
});

test('bookmark: title, description and the site name or the hostname', () => {
  assert.equal(
    render(
      'url: https://www.example.com/a?b=1&c=2\ntitle: Example <one>\ndescription: A page',
      'bookmark',
    ),
    '<figure class="g-bookmark" data-gala-block="bookmark">' +
      '<a href="https://www.example.com/a?b=1&amp;c=2" rel="noopener noreferrer">' +
      '<strong>Example &lt;one&gt;</strong><small>A page</small><em>example.com</em></a></figure>\n',
  );
  assert.match(
    render('url: http://a.test/\ntitle: T\nsite: The Site', 'bookmark'),
    /<em>The Site<\/em>/,
  );
});

test('file: a link to the repository PDF with title and description', () => {
  assert.equal(
    render(
      'path: docs/Report 2026.pdf\ntitle: Report: 2026\ndescription: All of it',
      'file',
    ),
    '<figure class="g-file" data-gala-block="file">' +
      '<a href="docs/Report%202026.pdf"><strong>Report: 2026</strong><small>All of it</small></a></figure>\n',
  );
});

test('the fence info string may carry more words, and other fences are untouched', () => {
  assert.match(render(VIDEO, 'video extra words'), /^<figure class="g-video"/);
  assert.match(render('x: 1', 'json'), /^<pre class="language-json">/);
  assert.ok(isCodeBlock(render('provider: youtube', 'text')));
});

test('a malformed block is an ordinary code block with its text escaped', () => {
  const malformed = [
    ['provider: youtube\nid: dQw4w9WgXcQ', 'video'],
    ['provider: dailymotion\nid: x\ntitle: T', 'video'],
    ['provider: youtube\nid: short\ntitle: T', 'video'],
    ['provider: vimeo\nid: 12ab\ntitle: T', 'video'],
    [`${VIDEO}\nposter: ../secret.png`, 'video'],
    [`${VIDEO}\nposter: https://x.test/p.png`, 'video'],
    [`${VIDEO}\nposter: poster.txt`, 'video'],
    [`${VIDEO}\ntitle: again`, 'video'],
    [`${VIDEO}\nthis line is not a pair`, 'video'],
    [`provider: youtube\nid: dQw4w9WgXcQ\ntitle: ${'x'.repeat(201)}`, 'video'],
    ['url: javascript:alert(1)\ntitle: T', 'bookmark'],
    ['url: ftp://a.test/\ntitle: T', 'bookmark'],
    ['url: https://user:pw@a.test/\ntitle: T', 'bookmark'],
    [
      'url: https://a.test/\ntitle: T\ndescription: ' + 'x'.repeat(501),
      'bookmark',
    ],
    ['title: T', 'bookmark'],
    ['path: docs/a.txt\ntitle: T', 'file'],
    ['path: ../a.pdf\ntitle: T', 'file'],
    ['path: https://a.test/a.pdf\ntitle: T', 'file'],
    ['path: docs/a.pdf', 'file'],
  ];
  for (const [body, info] of malformed) {
    const html = render(body, info);
    assert.ok(isCodeBlock(html), `${info}: ${body}`);
    assert.ok(!html.includes('<figure'), body);
  }
  assert.match(
    render('provider: <b>x</b>', 'video'),
    /^<pre><code>provider: &lt;b&gt;x&lt;\/b&gt;\n<\/code><\/pre>/,
  );
});

test('a block inside a list and a quote renders, and the page text around it is kept', () => {
  const html = normalizeAuthoredMarkdown(
    `Before.\n\n> \`\`\`bookmark\n> url: https://a.test/\n> title: Quoted\n> \`\`\`\n\nAfter.\n`,
  ).html;
  assert.match(html, /<blockquote>\s*<figure class="g-bookmark"/);
  assert.match(html, /<p>Before\.<\/p>/);
  assert.match(html, /<p>After\.<\/p>/);
});

test('every emitted body is stable under the policy sanitizer (the renderer re-checks it)', () => {
  const markdown = [
    '```video\n' + VIDEO + '\nposter: assets/p.png\n```',
    '```bookmark\nurl: https://a.test/x\ntitle: T\ndescription: D\nsite: S\n```',
    '```file\npath: a/b.pdf\ntitle: T\n```',
  ].join('\n\n');
  const { html, bodyDigest } = normalizeAuthoredMarkdown(markdown);
  assertPolicyConformantHtml(html, bodyDigest, 'test');
  assert.equal(bodyDigest, computeBodyDigest(html));
});

test('a received body whose figure carries attributes outside a block is not conformant', () => {
  const body = (/** @type {string} */ figure) =>
    `<p>x</p>\n${figure}<a href="https://a.test/" rel="noopener noreferrer"><strong>T</strong></a></figure>\n`;
  const nonConformant = [
    '<figure class="evil" data-gala-block="video" data-gala-video="youtube:dQw4w9WgXcQ">',
    '<figure class="g-video" data-gala-block="video" data-gala-video="youtube:short">',
    '<figure class="g-video" data-gala-block="video" data-gala-video="javascript:alert(1)">',
    '<figure class="g-video" data-gala-block="video">',
    '<figure class="g-bookmark" data-gala-block="video">',
    '<figure class="g-bookmark" data-gala-block="bookmark" data-gala-video="youtube:dQw4w9WgXcQ">',
    '<figure style="x:y" class="g-bookmark" data-gala-block="bookmark">',
    '<figure onclick="x()">',
    '<figure id="a">',
  ];
  for (const figure of nonConformant) {
    const html = body(figure);
    assert.throws(
      () => assertPolicyConformantHtml(html, computeBodyDigest(html), 'test'),
      /not idempotent/,
      figure,
    );
  }
  const good = body('<figure class="g-bookmark" data-gala-block="bookmark">');
  assertPolicyConformantHtml(good, computeBodyDigest(good), 'test');
});

test('the policy publishes figure attributes, the block grammar, the frame hosts and frame-src in both CSP forms', async () => {
  assert.deepEqual(ALLOWED_ATTRIBUTES_BY_TAG.figure, [
    'class',
    'data-gala-block',
    'data-gala-video',
  ]);
  const frame =
    'frame-src https://player.vimeo.com https://www.youtube-nocookie.com; ';
  assert.ok(CONTENT_SECURITY_POLICY_META_BASELINE.includes(frame));
  assert.ok(CONTENT_SECURITY_POLICY_COMPLETE.includes(frame));
  const document = /** @type {any} */ (renderPolicyDocument());
  assert.deepEqual(document.fencedBlocks.figureClasses, [
    'g-bookmark',
    'g-file',
    'g-video',
  ]);
  assert.deepEqual(Object.keys(document.fencedBlocks.blocks), [
    'bookmark',
    'file',
    'video',
  ]);
  assert.deepEqual(Object.keys(FENCED_BLOCKS), ['bookmark', 'file', 'video']);
  assert.deepEqual(document.fencedBlocks.videoProviders, ['vimeo', 'youtube']);
  const published = JSON.parse(
    await readFile(
      new URL('../contracts/render-policy.jcs', import.meta.url),
      'utf8',
    ),
  );
  assert.deepEqual(published, JSON.parse(JSON.stringify(document)));
  assert.ok(published.contentSecurityPolicy.includes(frame));
  assert.ok(published.contentSecurityPolicyMeta.includes(frame));
  assert.deepEqual(published.sanitizer.allowedAttributes.figure, [
    'class',
    'data-gala-block',
    'data-gala-video',
  ]);
});
