/**
 * The single source of truth for `contracts/render-policy.jcs`'s content
 * (brief S2 section 3 "Markdown, sanitizer, highlighter" and "Per-artifact
 * CSP baseline"; DEC-097 section 5 `renderPolicyIdentity`).
 *
 * `scripts/generate-contracts.mjs` emits this exact document as compact JCS
 * to `contracts/render-policy.jcs`; `src/core/internal/content-security.js`
 * consumes the same constants to build the actual markdown-it, sanitize-html
 * and highlighter configuration this renderer runs, and to compute the
 * `renderPolicyIdentity` every `renderableBody.renderPolicy` in a
 * `build-input:2.0.0` instance must byte-equal. Keeping both in one module
 * makes drift between "the policy we publish" and "the policy we enforce"
 * structurally impossible.
 */

/** @type {string} */
export const RENDER_POLICY_NAME = 'gala-render-policy';

/**
 * Byte-equal to the template lock's `contractVersion` (DEC-097 section 5),
 * which every S2 `build-input:2.0.0` fixture carries as the literal string
 * `"2.0.0"` (matches `manifest.js`'s `buildInputContractVersion`).
 *
 * @type {string}
 */
export const RENDER_POLICY_VERSION = '2.0.0';

/** @type {string} */
export const MARKDOWN_IT_PACKAGE = 'markdown-it';
/** @type {string} */
export const MARKDOWN_IT_VERSION = '14.3.1';

/**
 * The exact markdown-it construction options brief S2 section 3 requires.
 *
 * @type {{html: false, linkify: false, typographer: false}}
 */
export const MARKDOWN_IT_OPTIONS = Object.freeze({
  html: false,
  linkify: false,
  typographer: false,
});

/** @type {string} */
export const SANITIZER_PACKAGE = 'sanitize-html';
/** @type {string} */
export const SANITIZER_VERSION = '2.17.7';

/**
 * URL schemes admitted for `a[href]`. Same-document fragments and
 * repository-relative paths carry no scheme and are handled separately.
 *
 * @type {readonly string[]}
 */
export const ALLOWED_URL_SCHEMES = Object.freeze(['https', 'http', 'mailto']);

/**
 * The closed allowlist of tags this renderer ever emits from author
 * markdown: "semantic text and content tags" only (brief S2 section 3).
 * No form, frame, SVG, MathML, script, style, object or template element is
 * ever admitted.
 *
 * @type {readonly string[]}
 */
export const ALLOWED_TAGS = Object.freeze([
  'p',
  'br',
  'hr',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'strong',
  'em',
  'b',
  'i',
  'u',
  's',
  'del',
  'ins',
  'sub',
  'sup',
  'mark',
  'small',
  'wbr',
  'a',
  'img',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'dl',
  'dt',
  'dd',
  'figure',
  'figcaption',
  'span',
]);

/**
 * The closed per-tag attribute allowlist. `id` is admitted only on headings
 * (this renderer's own generated heading IDs); `style`, every `on*` handler,
 * `srcdoc` and every other undeclared attribute is always stripped (brief S2
 * section 3).
 *
 * @type {Readonly<Record<string, readonly string[]>>}
 */
export const ALLOWED_ATTRIBUTES_BY_TAG = Object.freeze({
  h1: Object.freeze(['id']),
  h2: Object.freeze(['id']),
  h3: Object.freeze(['id']),
  h4: Object.freeze(['id']),
  h5: Object.freeze(['id']),
  h6: Object.freeze(['id']),
  a: Object.freeze(['href', 'rel']),
  img: Object.freeze(['src', 'alt']),
  ol: Object.freeze(['start']),
  pre: Object.freeze(['class']),
  code: Object.freeze(['class']),
  span: Object.freeze(['class']),
});

/** @type {string} */
export const HIGHLIGHTER_PACKAGE = '@11ty/eleventy-plugin-syntaxhighlight';
/** @type {string} */
export const HIGHLIGHTER_VERSION = '5.0.2';

/**
 * The closed grammar-name catalog the owned highlighter accepts. A fence
 * language outside this list always falls back to escaped, unhighlighted
 * code (brief S2 section 3).
 *
 * @type {readonly string[]}
 */
export const HIGHLIGHT_GRAMMARS = Object.freeze(
  [
    'bash',
    'css',
    'diff',
    'java',
    'javascript',
    'json',
    'jsx',
    'markdown',
    'markup',
    'python',
    'sql',
    'tsx',
    'typescript',
    'yaml',
  ].sort(),
);

/**
 * The closed `span.class` token-class catalog admitted on highlighted code,
 * grounded in the actual Prism.js token classes {@link HIGHLIGHT_GRAMMARS}
 * can produce (Prism's documented generic token set plus this
 * repository's own empirical sample across every admitted grammar). `token`
 * itself is always the base class; every other admitted value is a
 * secondary token-class (brief S2 section 3: "`span` elements carrying
 * `token` and admitted token-class values").
 *
 * @type {readonly string[]}
 */
export const ADMITTED_TOKEN_CLASSES = Object.freeze(
  [
    'token',
    'atrule',
    'attr-equals',
    'attr-name',
    'attr-value',
    'bold',
    'boolean',
    'builtin',
    'cdata',
    'char',
    'class-name',
    'comment',
    'constant',
    'content',
    'coord',
    'deleted',
    'deleted-sign',
    'doctype',
    'entity',
    'for-or-select',
    'function',
    'function-variable',
    'important',
    'inserted',
    'inserted-sign',
    'interpolation',
    'interpolation-punctuation',
    'italic',
    'key',
    'keyword',
    'namespace',
    'null',
    'number',
    'operator',
    'prefix',
    'prolog',
    'property',
    'punctuation',
    'regex',
    'rule',
    'selector',
    'shebang',
    'string',
    'symbol',
    'tag',
    'template-punctuation',
    'template-string',
    'title',
    'url',
    'variable',
  ].sort(),
);

/**
 * The closed `pre.class`/`code.class` catalog for highlighted fences: one
 * `language-<grammar>` value per {@link HIGHLIGHT_GRAMMARS} entry. An
 * unknown fence language's own `language-<arbitrary>` class (emitted by
 * markdown-it's own escaped fallback renderer) is not in this list and is
 * stripped by the sanitizer, matching the "escaped fallback" contract.
 *
 * @type {readonly string[]}
 */
export const ADMITTED_LANGUAGE_CLASSES = Object.freeze(
  HIGHLIGHT_GRAMMARS.map((grammar) => `language-${grammar}`),
);

/**
 * The exact per-artifact CSP baseline (brief S2 section 3). Directive order
 * is byte-exact as written in the brief; every directive's value list is
 * already sorted bytewise and duplicate-free because S2 materializes no
 * module package, configuration, output or runtime, so this string is
 * byte-identical on every route.
 *
 * @type {string}
 */
export const CONTENT_SECURITY_POLICY_BASELINE =
  "default-src 'none'; base-uri 'none'; object-src 'none'; " +
  "frame-ancestors 'none'; form-action 'none'; script-src 'self'; " +
  "style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; " +
  "media-src 'self'; manifest-src 'self'; worker-src 'none'";

/**
 * Build the exact plain-object document `contracts/render-policy.jcs`
 * publishes: `name`, `version` byte-equal to the template lock's
 * `contractVersion`, a closed sanitizer/parser catalog, and no self-digest
 * (DEC-097 section 5).
 *
 * @returns {Record<string, unknown>} the render-policy document
 */
export function renderPolicyDocument() {
  return {
    name: RENDER_POLICY_NAME,
    version: RENDER_POLICY_VERSION,
    contentSecurityPolicy: CONTENT_SECURITY_POLICY_BASELINE,
    markdownIt: {
      package: MARKDOWN_IT_PACKAGE,
      version: MARKDOWN_IT_VERSION,
      options: { ...MARKDOWN_IT_OPTIONS },
    },
    sanitizer: {
      package: SANITIZER_PACKAGE,
      version: SANITIZER_VERSION,
      allowedTags: [...ALLOWED_TAGS],
      allowedAttributes: Object.fromEntries(
        Object.entries(ALLOWED_ATTRIBUTES_BY_TAG).map(([tag, attrs]) => [
          tag,
          [...attrs],
        ]),
      ),
      allowedUrlSchemes: [...ALLOWED_URL_SCHEMES],
    },
    highlighter: {
      package: HIGHLIGHTER_PACKAGE,
      version: HIGHLIGHTER_VERSION,
      grammars: [...HIGHLIGHT_GRAMMARS],
      tokenClasses: [...ADMITTED_TOKEN_CLASSES],
    },
  };
}
