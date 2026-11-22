/**
 * The `poll` fence: a question and two to six options become one
 * `figure.g-poll` (the page without scripts, a feed and an email show its
 * list); a malformed or repeated poll stays a code block; the sanitizer keeps
 * the poll attributes only where they are well formed.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  assertPolicyConformantHtml,
  computeBodyDigest,
  normalizeAuthoredMarkdown,
} from '../src/core/internal/content-security.js';
import {
  ALLOWED_ATTRIBUTES_BY_TAG,
  FENCED_BLOCKS,
  renderPolicyDocument,
} from '../src/core/internal/render-policy-content.js';

/**
 * @param {string} body the lines inside a fence
 * @returns {string} the rendered HTML
 */
function render(body) {
  return normalizeAuthoredMarkdown(`\`\`\`poll\n${body}\n\`\`\`\n`).html;
}

/**
 * @param {string} html a rendered fence
 * @returns {boolean} whether it is an ordinary code block
 */
const isCodeBlock = (html) => html.startsWith('<pre><code>');

const POLL =
  'id: best-day\nquestion: Which day is best?\noption1: Monday\noption2: Friday';

test('a poll is a figure with the question and the options as a list', () => {
  assert.equal(
    render(POLL),
    '<figure class="g-poll" data-gala-block="poll" data-gala-poll="best-day">' +
      '<figcaption>Which day is best?</figcaption><ul>' +
      '<li data-gala-option="0">Monday</li><li data-gala-option="1">Friday</li>' +
      '</ul></figure>\n',
  );
});

test('six options, keys in any order and case, text escaped', () => {
  const html = render(
    'OPTION2: <b>B</b>\nQuestion: A & B?\noption1: A\nid: x1\noption3: C\noption4: D\noption5: E\noption6: F',
  );
  assert.match(html, /<figcaption>A &amp; B\?<\/figcaption>/);
  assert.match(html, /<li data-gala-option="1">&lt;b&gt;B&lt;\/b&gt;<\/li>/);
  assert.equal(html.match(/<li /g)?.length, 6);
  assert.match(html, /data-gala-option="5">F<\/li>/);
});

test('malformed polls render as code blocks', () => {
  const long = (/** @type {number} */ n) => 'x'.repeat(n);
  const cases = [
    'id: p\nquestion: Q?\noption1: only one',
    'id: p\nquestion: Q?\noption1: a\noption3: c',
    'id: p\nquestion: Q?\noption1: a\noption2: b\noption7: g',
    'id: p\nquestion: Q?\noption1: a\noption2: b\noption2: again',
    'question: Q?\noption1: a\noption2: b',
    'id: P\nquestion: Q?\noption1: a\noption2: b',
    '' + `id: ${long(32)}\nquestion: Q?\noption1: a\noption2: b`,
    `id: p\nquestion: ${long(201)}\noption1: a\noption2: b`,
    `id: p\nquestion: Q?\noption1: ${long(81)}\noption2: b`,
    'id: p\nquestion: Q?\noption1: a\noption2:',
    'id: p\nquestion: Q?\noption1: a\nnot a key value line\noption2: b',
  ];
  for (const body of cases) assert.ok(isCodeBlock(render(body)), body);
  assert.ok(
    !isCodeBlock(
      render(
        `id: ${long(31)}\nquestion: ${long(200)}\noption1: ${long(80)}\noption2: b`,
      ),
    ),
  );
});

test('a poll id is unique in a post: the second use stays a code block', () => {
  const fence = (/** @type {string} */ id) =>
    `\`\`\`poll\nid: ${id}\nquestion: Q?\noption1: a\noption2: b\n\`\`\`\n`;
  const html = normalizeAuthoredMarkdown(
    fence('one') + fence('one') + fence('two'),
  ).html;
  assert.equal(html.match(/<figure /g)?.length, 2);
  assert.equal(html.match(/<pre>/g)?.length, 1);
  const again = normalizeAuthoredMarkdown(fence('one')).html;
  assert.ok(again.startsWith('<figure '), 'a new post starts fresh');
});

test('the rendered poll is stable under the sanitizer and conformant', () => {
  const html = render(POLL);
  assertPolicyConformantHtml(html, computeBodyDigest(html), 'test');
});

test('a received body with poll attributes outside a well-formed poll is not conformant', () => {
  const bad = [
    '<figure class="g-poll" data-gala-block="poll" data-gala-poll="Bad Id"><ul><li data-gala-option="0">a</li></ul></figure>\n',
    '<figure class="g-poll" data-gala-block="poll"><ul><li data-gala-option="0">a</li></ul></figure>\n',
    '<ul><li data-gala-option="x">a</li></ul>\n',
    '<figure class="g-poll" data-gala-block="poll" data-gala-poll="ok"><ul><li data-gala-option="9">a</li></ul></figure>\n',
    '<figure class="g-bookmark" data-gala-block="bookmark" data-gala-poll="ok"></figure>\n',
  ];
  for (const html of bad) {
    assert.throws(
      () => assertPolicyConformantHtml(html, computeBodyDigest(html), 'test'),
      undefined,
      html,
    );
  }
});

test('the policy publishes the poll block and its attributes', () => {
  assert.deepEqual(FENCED_BLOCKS.poll.required, [
    'id',
    'question',
    'option1',
    'option2',
  ]);
  assert.ok(ALLOWED_ATTRIBUTES_BY_TAG.figure.includes('data-gala-poll'));
  assert.deepEqual(ALLOWED_ATTRIBUTES_BY_TAG.li, ['data-gala-option']);
  const document = /** @type {any} */ (renderPolicyDocument());
  assert.ok(JSON.stringify(document).includes('g-poll'));
});
