/**
 * The output-security pipeline: markdown parsing, sanitization, syntax
 * highlighting, the check of a received render-policy identity, and the
 * per-artifact CSP baseline ("Markdown, sanitizer,
 * highlighter" and "Per-artifact CSP baseline"; the shared
 * `renderPolicyIdentity` digest specification).
 *
 * Division of labour (corrected after independent review; the shared
 * render-policy identity specification:
 * "their body path is replaced by a `renderableBody` carrying that exact
 * path/raw digest and *the deterministic policy output/digest*", and
 * `build-input.schema.json`'s `renderableBody.bodyMediaType` is fixed
 * `const: "text/html"`): `renderableBody.body` inside a validated
 * `build-input:2.0.0` instance is **already** the render policy's output —
 * markdown-it-parsed, sanitized and highlighted HTML — produced once at
 * normalization time, upstream of this renderer (`publish-kernel`/
 * `publish-action`). This module therefore exposes two distinct, separately
 * documented surfaces:
 *
 * 1. {@link normalizeAuthoredMarkdown}, the **public** normalization step
 *    (exported from this package's one public entry point, `src/core/index.js`
 *    /`@rathnasgala2/template`) that an upstream caller runs exactly once per
 *    authored Markdown source to produce that `renderableBody.body` and its
 *    `bodyDigest`. It is the markdown-it → sanitize-html → highlighter
 *    pipeline described below.
 * 2. {@link assertPolicyConformantHtml}, what **this renderer** itself runs
 *    on a `renderableBody.body` it receives: verify `bodyDigest` against the
 *    body bytes, then re-run the sanitizer once as a defence-in-depth
 *    idempotence check (sanitizing already-conformant output must reproduce
 *    it byte-for-byte) — never markdown-it. Re-running markdown-it on
 *    already-rendered HTML would be a double-encoding defect: with
 *    `html:false`, every tag in the input would be escaped as literal text
 *    (`<p>` becoming `&lt;p&gt;`) instead of being inserted as markup.
 *
 * Every other module reaches policy-conformant HTML only through
 * {@link assertPolicyConformantHtml} (renderer path) or
 * {@link normalizeAuthoredMarkdown} (upstream normalization path); neither
 * calls the other.
 *
 * Markdown-to-HTML defense layering inside {@link normalizeAuthoredMarkdown},
 * deliberately redundant:
 *  1. markdown-it is constructed with `{ html: false, linkify: false,
 *     typographer: false }`, so literal `<...>` in source is never parsed
 *     as an element — it is always escaped text. The only elements this
 *     pipeline ever emits are the ones markdown-it's own CommonMark grammar
 *     generates (headings, lists, emphasis, links, images, code, tables,
 *     block quotes) plus this module's own generated heading `id`s.
 *  2. `validateLink` is replaced with a closed scheme allowlist (`https`,
 *     `http`, `mailto`, or no scheme at all for a relative path/fragment),
 *     rejecting `javascript:`, `data:`, `blob:`, `vbscript:` and
 *     protocol-relative (`//`) URLs before a link or image element is even
 *     produced. markdown-it's own fallback for a rejected link is to render
 *     the literal escaped source text, never a rewritten, still-unsafe URL.
 *  3. The fenced-code highlighter (`highlight.js`, Prism with the markup the
 *     `@11ty/eleventy-plugin-syntaxhighlight` markdown highlighter gives)
 *     only ever runs for a fence language in the closed
 *     {@link HIGHLIGHT_GRAMMARS} catalog (which always HTML-escapes code text
 *     as it tokenizes). Every other fence language returns an empty string,
 *     deferring to markdown-it's own `escapeHtml` fallback — this pipeline
 *     never reaches that plugin's unescaped raw-passthrough branches.
 *  4. `sanitize-html` runs a final allowlist pass over the complete
 *     fragment: closed tag/attribute/class/scheme catalogs, `nonTextTags`
 *     extended so a discarded element's own text content (e.g. a stripped
 *     `<script>`/`<style>`/`<iframe>`) can never leak, and `img`/`a`
 *     restricted per-tag URL schemes (repository-relative only for `img`;
 *     `https`/`http`/`mailto` for `a`, with `rel="noopener noreferrer"`
 *     added to every absolute link and no `target` ever emitted).
 *  5. A final residual-active-content scan asserts none of the constructs
 *     the policy forbids survived; any hit is this pipeline's own defect,
 *     not the author's content, and fails closed with
 *     {@link RenderPolicyViolationError} rather than emitting the bytes.
 *
 * `img[src]` is restricted to repository-relative paths only, deferring
 * full manifest-coverage verification ("`src` only for manifest-covered
 * repository assets") to the media pipeline, which is out of this
 * module's scope; this module never resolves, decodes or rewrites a media
 * reference.
 */

import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

import { RenderPolicyViolationError } from '../errors.js';
import { digestBytes } from './canonical-jcs.js';
import { renderFencedBlock } from './fenced-blocks.js';
import { highlightWithPrism } from './highlight.js';
import { utf8Bytes } from './utf8.js';
import {
  ADMITTED_LANGUAGE_CLASSES,
  ADMITTED_TOKEN_CLASSES,
  ALLOWED_ATTRIBUTES_BY_TAG,
  ALLOWED_TAGS,
  ALLOWED_URL_SCHEMES,
  CONTENT_SECURITY_POLICY_META_BASELINE,
  contentSecurityPolicyMeta,
  CSP_HEADER_ONLY_DIRECTIVES,
  FENCED_BLOCKS,
  HIGHLIGHT_GRAMMARS,
  VIDEO_PROVIDERS,
} from './render-policy-content.js';

/**
 * Assert one `renderableBody.renderPolicy` reference byte-equals the
 * current published render-policy identity. Fails closed before any
 * rendering: an absent policy file, wrong name/version/digest, or mixed
 * identity between records rejects.
 *
 * @param {{name?: unknown, version?: unknown, digest?: unknown}} candidate
 *   a `renderableBody.renderPolicy` value from the build input
 * @param {{name: string, version: string, digest: string}} identity the
 *   current published identity from {@link computeRenderPolicyIdentity}
 * @param {string} location a human-readable pointer for the error message
 * @returns {void}
 */
export function assertRenderPolicyIdentity(candidate, identity, location) {
  if (
    !candidate ||
    typeof candidate !== 'object' ||
    candidate.name !== identity.name ||
    candidate.version !== identity.version ||
    candidate.digest !== identity.digest
  ) {
    throw new RenderPolicyViolationError(
      `${location}: renderPolicy does not byte-equal the published ` +
        `render-policy identity (expected ${JSON.stringify(identity)}, ` +
        `got ${JSON.stringify(candidate)})`,
    );
  }
}

/**
 * The exact per-artifact CSP baseline actually deliverable inside a `<meta>`
 * tag (TPL-H4 fix: excludes `frame-ancestors`, which CSP's own specification
 * ignores when delivered via `<meta http-equiv>`).
 *
 * @returns {string} the meta-safe CSP directive string
 */
export function contentSecurityPolicyBaseline() {
  return CONTENT_SECURITY_POLICY_META_BASELINE;
}

/**
 * The header-only CSP directives (TPL-H4 fix): directives the specification
 * ignores when delivered via `<meta>`, so they are never included in
 * {@link contentSecurityPolicyMetaTag}'s output. A hosting adapter/deployment
 * is required to add these to the actual `Content-Security-Policy` response
 * header (or, for `frame-ancestors` specifically, an equivalent
 * `X-Frame-Options` header) for the protection they describe to take effect.
 *
 * @returns {readonly string[]} the header-only directive strings
 */
export function contentSecurityPolicyHeaderOnlyDirectives() {
  return CSP_HEADER_ONLY_DIRECTIVES;
}

/**
 * A byte-exact `<meta>` element carrying the meta-safe CSP baseline, for
 * insertion into every rendered page's `<head>` (brief S2 section 3: "one CSP
 * per artifact"; S2 materializes no module package/configuration/output/
 * runtime, so this is byte-identical on every route). TPL-H4: excludes
 * `frame-ancestors`, which browsers ignore here and would otherwise log a
 * console warning about — see {@link contentSecurityPolicyHeaderOnlyDirectives}
 * for that protection's actual home.
 *
 * @param {string | undefined} [apiOrigin] the interactions module's
 *   `apiOrigin` when it differs from production (local stack only)
 * @param {string | undefined} [analyticsProviderKind] the analytics module's
 *   `provider.kind` when the module is on
 * @returns {string} one `<meta http-equiv="Content-Security-Policy" ...>` tag
 */
export function contentSecurityPolicyMetaTag(apiOrigin, analyticsProviderKind) {
  return `<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicyMeta(apiOrigin, analyticsProviderKind)}">`;
}

/**
 * Reproduce the WHATWG URL Standard's own preprocessing (strip leading and
 * trailing C0-control-or-space, then remove every ASCII tab/newline/carriage
 * return anywhere in the string) before scheme detection, exactly as a
 * browser's URL parser does. Skipping this step is an exploitable gap: a
 * scheme obfuscated as `"java\tscript:alert(1)"` would not match a naive
 * scheme regex at all and would otherwise fall through this module's
 * schemeless-URL allowance, while a browser still parses it as `javascript:`.
 *
 * @param {string} url raw URL text from markdown link/image syntax
 * @returns {string} the same text with URL-parsing whitespace removed
 */
function normalizeUrlForSchemeDetection(url) {
  let start = 0;
  let end = url.length;
  while (start < end && url.charCodeAt(start) <= 0x20) start += 1;
  while (end > start && url.charCodeAt(end - 1) <= 0x20) end -= 1;
  const trimmed = url.slice(start, end);
  let normalized = '';
  for (const character of trimmed) {
    if (character === '\t' || character === '\n' || character === '\r') {
      continue;
    }
    normalized += character;
  }
  return normalized;
}

/**
 * markdown-it's default `validateLink` admits protocol-relative URLs and
 * (for images) `data:` URIs. This replacement admits only a closed scheme
 * catalog plus schemeless relative paths and same-document fragments,
 * rejecting `javascript:`, `data:`, `blob:`, `vbscript:` and
 * protocol-relative URLs before any link/image element is produced.
 *
 * @param {string} url the raw URL text from markdown link/image syntax
 * @returns {boolean} `true` when the URL may become an `href`/`src`
 */
function validateGalaLink(url) {
  const normalized = normalizeUrlForSchemeDetection(url);
  if (normalized.startsWith('//')) return false;
  const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(normalized);
  if (!schemeMatch) return true;
  return ALLOWED_URL_SCHEMES.includes(schemeMatch[1].toLowerCase());
}

/**
 * Deterministically slugify one heading's plain-text content: NFC-normalize,
 * lower-case, strip everything but letters/numbers/whitespace/hyphen, and
 * collapse whitespace to single hyphens. Never empty.
 *
 * @param {string} text plain heading text
 * @returns {string} a non-empty slug
 */
function slugifyHeadingText(text) {
  const collapsed = text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
  return collapsed.length > 0 ? collapsed : 'section';
}

/**
 * A markdown-it core rule that assigns each heading a deterministic,
 * collision-free `id` attribute derived from its own rendered text, in
 * document order (brief S2 section 3: "deterministic heading and slug
 * rules"). This is the only source of the `id` attribute the sanitizer
 * admits on heading elements.
 *
 * @param {import('markdown-it/lib/rules_core/state_core.mjs').default} state
 *   markdown-it's core rule state
 * @returns {void}
 */
function assignDeterministicHeadingIds(state) {
  /** @type {Map<string, number>} */
  const seenSlugCounts = new Map();
  for (let index = 0; index < state.tokens.length; index += 1) {
    const token = state.tokens[index];
    if (token.type !== 'heading_open') continue;
    const inlineToken = state.tokens[index + 1];
    const text =
      inlineToken && inlineToken.type === 'inline' ? inlineToken.content : '';
    const baseSlug = slugifyHeadingText(text);
    const occurrence = seenSlugCounts.get(baseSlug) ?? 0;
    seenSlugCounts.set(baseSlug, occurrence + 1);
    const slug = occurrence === 0 ? baseSlug : `${baseSlug}-${occurrence + 1}`;
    token.attrSet('id', slug);
  }
}

/**
 * markdown-it's `highlight` option: for a fence language in the closed
 * {@link HIGHLIGHT_GRAMMARS} catalog, delegate to the owned highlighter
 * (Prism always HTML-escapes text as it tokenizes for a known grammar).
 * For every other language — unknown, absent, or the upstream plugin's own
 * unsafe raw-passthrough special cases (`"text"`, an unloadable grammar) —
 * return an empty string so markdown-it falls back to its own
 * `escapeHtml`-wrapped `<pre><code>` rendering, never highlighting a grammar
 * this pipeline has not admitted (brief S2 section 3:
 * "falls back to escaped unhighlighted code for an unknown grammar").
 *
 * @param {string} code the fenced code block's exact text
 * @param {string} language the fence's declared language token
 * @returns {string} highlighted HTML, or `""` to defer to markdown-it
 */
function highlightFence(code, language) {
  const grammar = (language ?? '').trim().toLowerCase();
  if (!HIGHLIGHT_GRAMMARS.includes(grammar)) {
    return '';
  }
  return highlightWithPrism(code, grammar);
}

const markdownRenderer = new MarkdownIt({
  html: false,
  linkify: false,
  typographer: false,
  highlight: highlightFence,
});
markdownRenderer.validateLink = validateGalaLink;
// A fence whose info string names a block (`video`, `bookmark`, `file`) and
// whose body is well formed becomes a card; anything else stays the ordinary
// code block markdown-it renders.
const ordinaryFence = /** @type {any} */ (
  markdownRenderer.renderer.rules.fence
);
markdownRenderer.renderer.rules.fence = (
  /** @type {any} */ tokens,
  /** @type {number} */ index,
  /** @type {any} */ options,
  /** @type {any} */ env,
  /** @type {any} */ self,
) => {
  const token = tokens[index];
  const name = String(token.info ?? '')
    .trim()
    .split(/\s+/)[0];
  return (
    renderFencedBlock(name, token.content, (url) =>
      markdownRenderer.normalizeLink(url),
    ) ?? ordinaryFence(tokens, index, options, env, self)
  );
};
markdownRenderer.core.ruler.push(
  'gala_deterministic_heading_ids',
  assignDeterministicHeadingIds,
);

/**
 * Add `rel="noopener noreferrer"` to every absolute `http`/`https` link and
 * strip every other attribute (in particular, `target` is never emitted;
 * brief S2 section 3: "adds `rel=\"noopener noreferrer\"` to cross-origin
 * links and otherwise omits `target`").
 *
 * @param {string} tagName always `"a"`
 * @param {Record<string, string>} attribs the tag's sanitized-so-far attributes
 * @returns {{tagName: string, attribs: Record<string, string>}} the transformed tag
 */
function transformAnchorTag(tagName, attribs) {
  const href = attribs.href ?? '';
  /** @type {Record<string, string>} */
  const nextAttribs = {};
  if (attribs.href !== undefined) nextAttribs.href = attribs.href;
  if (/^https?:\/\//i.test(href)) {
    nextAttribs.rel = 'noopener noreferrer';
  }
  return { tagName: 'a', attribs: nextAttribs };
}

/** A well-formed `data-gala-video` value: `<provider>:<id>`. */
const VIDEO_REFERENCE = new RegExp(
  `^(${Object.keys(VIDEO_PROVIDERS).join('|')}):(.+)$`,
);

/**
 * Keep a `figure`'s attributes only when they form one block this policy
 * defines (`class` names a block, `data-gala-block` agrees, and a video
 * carries a valid `data-gala-video`); otherwise the figure loses them all.
 * This is what keeps a received body (re-sanitized, never trusted) from
 * carrying a class or data attribute the policy does not admit.
 *
 * @param {string} tagName always `"figure"`
 * @param {Record<string, string>} attribs the tag's attributes
 * @returns {{tagName: string, attribs: Record<string, string>}} the figure
 */
function transformFigureTag(tagName, attribs) {
  const name = attribs['data-gala-block'];
  const block =
    name !== undefined && Object.hasOwn(FENCED_BLOCKS, name)
      ? FENCED_BLOCKS[name]
      : undefined;
  if (!block || attribs.class !== block.className) {
    return { tagName: 'figure', attribs: {} };
  }
  /** @type {Record<string, string>} */
  const kept = { class: block.className, 'data-gala-block': name };
  if (name === 'video') {
    const match = VIDEO_REFERENCE.exec(attribs['data-gala-video'] ?? '');
    if (!match || !VIDEO_PROVIDERS[match[1]].idPattern.test(match[2])) {
      return { tagName: 'figure', attribs: {} };
    }
    kept['data-gala-video'] = attribs['data-gala-video'];
  }
  return { tagName: 'figure', attribs: kept };
}

/** @type {import('sanitize-html').IOptions} */
const SANITIZE_HTML_OPTIONS = {
  allowedTags: [...ALLOWED_TAGS],
  allowedAttributes: Object.fromEntries(
    Object.entries(ALLOWED_ATTRIBUTES_BY_TAG).map(([tag, attrs]) => [
      tag,
      [...attrs],
    ]),
  ),
  allowedSchemesByTag: {
    a: [...ALLOWED_URL_SCHEMES],
    // Repository-relative only: no scheme is ever admitted for `src`.
    img: [],
  },
  allowProtocolRelative: false,
  allowedClasses: {
    pre: [...ADMITTED_LANGUAGE_CLASSES],
    code: [...ADMITTED_LANGUAGE_CLASSES],
    span: [...ADMITTED_TOKEN_CLASSES],
    figure: Object.values(FENCED_BLOCKS).map((block) => block.className),
  },
  // Extend the default so a discarded tag's own text content can never
  // leak as plain text (e.g. a stripped `<script>`, `<style>`, `<iframe>`,
  // `<template>` or `<noscript>` body).
  nonTextTags: [
    'script',
    'style',
    'textarea',
    'option',
    'template',
    'noscript',
    'iframe',
    'object',
    'embed',
    'svg',
    'math',
  ],
  disallowedTagsMode: 'discard',
  transformTags: { a: transformAnchorTag, figure: transformFigureTag },
};

/**
 * Forbidden tags that must never survive sanitization as *real, unescaped
 * markup*. Present only as a fail-closed integrity backstop over the
 * configuration above — a hit here is this pipeline's own defect, not
 * expected author content.
 *
 * Anchored to an actual unescaped `<tagname` opening exactly because HTML
 * text-node serialization always re-escapes a literal `<` as `&lt;`
 * (unlike, say, a bare `"`, which needs no escaping outside an attribute
 * value) — so this can never fire on inert text that merely mentions one of
 * these words, only on a real element the sanitizer configuration above
 * should have already made unreachable. Attribute-shaped checks
 * (`on*="..."`, a `javascript:`/`data:` scheme in a quoted value, `srcdoc=`)
 * are deliberately not duplicated here: they would fire on exactly this
 * kind of safely re-serialized text (a literal, author-authored `"` next to
 * escaped `&lt;...&gt;` markup), and the allowlisted
 * `allowedAttributes`/`allowedSchemesByTag` configuration above already
 * makes them structurally unreachable in real markup.
 *
 * @type {readonly RegExp[]}
 */
const RESIDUAL_ACTIVE_CONTENT_PATTERNS = Object.freeze([
  /<script[\s>/]/i,
  /<style[\s>/]/i,
  /<iframe[\s>/]/i,
  /<object[\s>/]/i,
  /<embed[\s>/]/i,
  /<svg[\s>/]/i,
  /<math[\s>/]/i,
  /<template[\s>/]/i,
]);

/**
 * @param {string} sanitized the fully sanitized HTML fragment
 * @returns {void}
 */
function assertNoResidualActiveContent(sanitized) {
  for (const pattern of RESIDUAL_ACTIVE_CONTENT_PATTERNS) {
    if (pattern.test(sanitized)) {
      throw new RenderPolicyViolationError(
        `sanitized output still matches a forbidden pattern (${pattern}); ` +
          'this is a render-policy pipeline defect, not admitted content',
      );
    }
  }
}

/**
 * Run the markdown-it → sanitize-html → highlighter pipeline once over raw
 * Markdown source, with no digest verification (there is nothing yet to
 * verify against — this *produces* the policy output, it does not consume
 * one).
 *
 * @param {string} markdownSource the author-authored Markdown source
 * @returns {string} the sanitized, render-policy-conformant HTML fragment
 */
function sanitizeAndHighlightMarkdown(markdownSource) {
  const rawHtml = markdownRenderer.render(markdownSource);
  const sanitized = sanitizeHtml(rawHtml, SANITIZE_HTML_OPTIONS);
  assertNoResidualActiveContent(sanitized);
  return sanitized;
}

/**
 * Compute a `renderableBody.bodyDigest`: a plain (not domain-separated)
 * tagged SHA-256 digest of a body's exact UTF-8 bytes (the shared
 * render-policy identity specification:
 * "`bodyDigest` is the digest of the exact normalized UTF-8 body string
 * supplied to the renderer"), matching `sourceDigest`/`resolvedFile` digests
 * elsewhere in this build-input shape, which are likewise plain content
 * digests rather than `GALA-*-V2`-domain-separated ones.
 *
 * @param {string} html the exact policy-conformant HTML body
 * @returns {string} `sha256:` plus 64 lowercase hexadecimal characters
 */
export function computeBodyDigest(html) {
  return digestBytes(utf8Bytes(html));
}

/**
 * **Public, upstream normalization step.** Run one authored Markdown source
 * string through the complete render-policy pipeline — markdown-it
 * (`html:false`, `linkify:false`, `typographer:false`, closed link-scheme
 * validation, deterministic heading IDs, owned highlighter) followed by the
 * owned `sanitize-html` allowlist, followed by a fail-closed residual-content
 * check — and return the exact `{ html, bodyDigest }` pair a
 * `build-input:2.0.0` producer (`publish-kernel`/`publish-action`) places
 * into a `renderableBody`'s `body`/`bodyDigest` fields.
 *
 * This renderer package (`renderPublication`) never calls this function on a
 * body it receives: by the time a `build-input:2.0.0` instance reaches this
 * renderer, every `renderableBody.body` is already this function's output, and
 * the renderer instead verifies that fact with
 * {@link assertPolicyConformantHtml}. Its one call is on the shipped default
 * policy Markdown (`policy-pages.js`), which is source, not a received body.
 *
 * @param {string} markdownSource the author-authored Markdown source
 * @returns {{html: string, bodyDigest: string}} the policy-conformant HTML
 *   body and its digest
 */
export function normalizeAuthoredMarkdown(markdownSource) {
  if (typeof markdownSource !== 'string') {
    throw new RenderPolicyViolationError(
      'authored Markdown source must be a string',
    );
  }
  const html = sanitizeAndHighlightMarkdown(markdownSource);
  return { html, bodyDigest: computeBodyDigest(html) };
}

/**
 * **Renderer-side verification step.** Assert that a `renderableBody.body`
 * this renderer received is exactly what {@link normalizeAuthoredMarkdown}
 * would have produced, without re-running markdown-it on it (`body` is
 * already HTML, not Markdown source; re-parsing it under `html:false` would
 * double-escape every tag). Two independent, fail-closed checks:
 *
 * 1. `bodyDigest` byte-equals a fresh {@link computeBodyDigest} of `body`
 *    (catches any tampering or transport corruption of the body bytes
 *    themselves).
 * 2. Sanitizing `body` again reproduces it byte-for-byte (catches a `body`
 *    that was never actually run through this exact sanitizer allowlist —
 *    genuinely policy-conformant output is idempotent under re-sanitization
 *    by construction; anything that changes on a second pass was not
 *    conformant to begin with) — followed by the same residual-active-
 *    content backstop {@link normalizeAuthoredMarkdown} runs.
 *
 * @param {unknown} body the candidate `renderableBody.body` value
 * @param {unknown} bodyDigest the candidate `renderableBody.bodyDigest` value
 * @param {string} location a human-readable pointer for the error message
 * @returns {void}
 */
export function assertPolicyConformantHtml(body, bodyDigest, location) {
  if (typeof body !== 'string') {
    throw new RenderPolicyViolationError(`${location}: body must be a string`);
  }
  const expectedDigest = computeBodyDigest(body);
  if (bodyDigest !== expectedDigest) {
    throw new RenderPolicyViolationError(
      `${location}: bodyDigest does not byte-equal SHA-256 of the body ` +
        `bytes (expected ${expectedDigest}, got ${JSON.stringify(bodyDigest)})`,
    );
  }
  const reSanitized = sanitizeHtml(body, SANITIZE_HTML_OPTIONS);
  if (reSanitized !== body) {
    throw new RenderPolicyViolationError(
      `${location}: body is not idempotent under the render policy's ` +
        'sanitizer allowlist, so it was not produced by ' +
        'normalizeAuthoredMarkdown under the current policy',
    );
  }
  assertNoResidualActiveContent(reSanitized);
}
