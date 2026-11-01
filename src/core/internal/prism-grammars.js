/**
 * The admitted syntax-highlighting grammars, loaded with static imports so
 * the markdown pipeline bundles for a browser (`prismjs/components/index.js`
 * and the highlighter plugin's own loader resolve grammar files with dynamic
 * `require`, which a bundler cannot follow).
 *
 * The set is exactly {@link HIGHLIGHT_GRAMMARS}: the Prism core already
 * carries `markup`, `css`, `clike` and `javascript`; the rest follow in the
 * order Prism's own dependency loader loads them for this set, `diff` and
 * its line-prefix plugin first, as the highlighter package loads them.
 *
 * Every grammar is registered once, at import. The highlighter package this
 * replaces registered each grammar the first time a fence used it, so an
 * embedded-language lookup inside a highlighted block (a `javascript` fence
 * inside a `markdown` block, a `<script>` inside `markup`) saw only the
 * grammars earlier fences in the same process had loaded. Here it always
 * sees the full set.
 */

import Prism from './prism-global.js';

import 'prismjs/components/prism-diff.js';
import 'prismjs/plugins/diff-highlight/prism-diff-highlight.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-java.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-tsx.js';

export default Prism;
