/**
 * The fenced-code highlighter: Prism tokenization for an admitted grammar,
 * wrapped as the highlighter package's markdown-it `highlight` option wraps
 * it (`@11ty/eleventy-plugin-syntaxhighlight`, whose function cannot be
 * imported without its dynamic grammar loader). With the options this
 * pipeline always passes (none), that wrapper reduces to: tokenize, split on
 * newlines, drop one trailing empty line, join with `<br>`, and wrap in
 * `<pre class="language-X"><code class="language-X">`.
 */

import Prism from './prism-grammars.js';
import { HIGHLIGHT_GRAMMARS } from './render-policy-content.js';

/**
 * @param {string} code the fenced code block's exact text
 * @param {string} grammar an admitted grammar name (a
 *   {@link HIGHLIGHT_GRAMMARS} entry)
 * @returns {string} the `<pre><code>` markup with Prism token spans
 */
export function highlightWithPrism(code, grammar) {
  if (!HIGHLIGHT_GRAMMARS.includes(grammar)) {
    throw new RangeError(`"${grammar}" is not an admitted highlight grammar`);
  }
  const html = Prism.highlight(code, Prism.languages[grammar], grammar);
  let lines = html.split('\n');
  if (lines[lines.length - 1] === '') {
    lines = lines.slice(0, -1);
  }
  return `<pre class="language-${grammar}"><code class="language-${grammar}">${lines.join('<br>')}</code></pre>`;
}
