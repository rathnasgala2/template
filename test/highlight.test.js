/**
 * The owned fenced-code highlighter: Prism with statically imported grammars.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { highlightWithPrism } from '../src/core/internal/highlight.js';
import { HIGHLIGHT_GRAMMARS } from '../src/core/internal/render-policy-content.js';

test('every admitted grammar is registered and wraps its output', () => {
  for (const grammar of HIGHLIGHT_GRAMMARS) {
    const html = highlightWithPrism('a < b && "c"\nsecond\n', grammar);
    assert.ok(
      html.startsWith(
        `<pre class="language-${grammar}"><code class="language-${grammar}">`,
      ),
      grammar,
    );
    assert.ok(html.endsWith('</code></pre>'), grammar);
    assert.ok(!html.includes('<b '), `${grammar} escapes markup in code`);
    assert.ok(html.includes('<br>'), `${grammar} joins lines with <br>`);
  }
});

test('one trailing empty line is dropped, a blank interior line is kept', () => {
  assert.equal(
    highlightWithPrism('x = 1\n\ny = 2\n', 'python').split('<br>').length,
    3,
  );
});

test('a grammar outside the admitted set is refused', () => {
  assert.throws(() => highlightWithPrism('x', 'cobol'), RangeError);
});

test('an embedded fence in markdown is highlighted whatever ran before', () => {
  const html = highlightWithPrism(
    '```javascript\nconst a = 1;\n```\n',
    'markdown',
  );
  assert.ok(html.includes('<span class="token keyword">const</span>'));
});
