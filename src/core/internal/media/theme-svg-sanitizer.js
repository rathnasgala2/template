/**
 * The closed admission grammar a theme-declared passive SVG asset must pass
 * before it is copied into a published artifact (TPL-C2, prerequisite for
 * TPL-H6's iconography decision).
 *
 * Author-supplied SVG is unconditionally rejected by the media pipeline
 * (`internal/media/sniff.js`'s `'svg'` classification, `MEDIA_SVG_REJECTED`
 * in `internal/media/pipeline.js`) — SVG is active content (it admits
 * `<script>`, event-handler attributes and external references) and the
 * render-policy's own residual-active-content scan explicitly forbids it in
 * markdown-derived HTML. A theme package is a lower-trust supply-chain input
 * than the repository owner's own authored content, so it cannot be held to
 * a looser standard: this module is the one path an SVG byte sequence may
 * take to reach a published artifact, and it applies its own closed
 * tag/attribute/scheme allowlist — independent of, and strictly narrower
 * than, `sanitize-html`'s author-content configuration in
 * `internal/content-security.js` — followed by the same class of fail-closed
 * residual-scan backstop that pipeline uses.
 *
 * Scope: this grammar targets exactly one use case — a small, static,
 * decorative icon or mark referenced from theme CSS (`::before`/`::after`
 * `content: url(...)`, `background-image`, or an `<img>`/`<use>` a future
 * theme ships). It is deliberately conservative: no `<script>`, no `<style>`
 * (inline CSS can itself carry `url()` external references), no
 * `<foreignObject>` (arbitrary embedded HTML), no `<image>` (a raster/SVG
 * reference of its own, which would need this same admission recursively),
 * no event-handler attribute of any kind, and no attribute whose value is a
 * URL reference other than a same-document `#fragment` (so `<use href="#id">`
 * referencing a `<symbol>` defined earlier in the same file works; anything
 * that could reach off-document content does not).
 */

import sanitizeHtml from 'sanitize-html';

import { ThemeAssetError } from '../../errors.js';

/** @type {string} the reason code every rejection in this module carries. */
export const THEME_SVG_REJECTED_CODE = 'THEME_ASSET_SVG_REJECTED';

/**
 * The closed SVG element allowlist: structural/grouping and shape elements,
 * gradients/clipping used for flat icon artwork, and `<title>`/`<desc>` for
 * accessible names. No scripting, styling, foreign-content or
 * external-media element is admitted.
 *
 * @type {readonly string[]}
 */
const ALLOWED_SVG_TAGS = Object.freeze([
  'svg',
  'g',
  'defs',
  'symbol',
  'use',
  'title',
  'desc',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'clipPath',
  'mask',
  'linearGradient',
  'radialGradient',
  'stop',
]);

/** @type {readonly string[]} presentation/geometry attributes admitted on
 * every allowed tag (a closed union, not per-tag — {@link assertNoResidualActiveSvgContent}
 * is the fail-closed backstop for anything this allowlist under-restricts). */
const COMMON_SVG_ATTRIBUTES = Object.freeze([
  'id',
  'class',
  'role',
  'aria-hidden',
  'aria-label',
  'focusable',
  'viewBox',
  'width',
  'height',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'd',
  'points',
  'transform',
  'fill',
  'fill-rule',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'stroke-opacity',
  'opacity',
  'clip-path',
  'clip-rule',
  'mask',
  'offset',
  'stop-color',
  'stop-opacity',
  'gradientUnits',
  'gradientTransform',
  'preserveAspectRatio',
  'xmlns',
]);

/** @type {import('sanitize-html').IOptions} */
const SVG_SANITIZE_OPTIONS = {
  allowedTags: [...ALLOWED_SVG_TAGS],
  allowedAttributes: Object.fromEntries(
    ALLOWED_SVG_TAGS.map((tag) => [
      tag,
      tag === 'use'
        ? [...COMMON_SVG_ATTRIBUTES, 'href', 'xlink:href']
        : [...COMMON_SVG_ATTRIBUTES],
    ]),
  ),
  // `href`/`xlink:href` are only ever admitted on `use` above, and only a
  // same-document fragment reference is a legal value (enforced below by
  // {@link assertNoResidualActiveSvgContent}, since sanitize-html's own
  // scheme allowlist does not distinguish "no scheme" from "fragment-only").
  allowedSchemesByTag: { use: [] },
  allowProtocolRelative: false,
  nonTextTags: [
    'script',
    'style',
    'foreignObject',
    'image',
    'animate',
    'animateTransform',
    'animateMotion',
    'set',
    'iframe',
  ],
  disallowedTagsMode: 'discard',
  parser: { xmlMode: true, decodeEntities: true },
};

/** @type {readonly RegExp[]} fail-closed backstop patterns; a hit here is
 * this module's own configuration defect, never expected of admitted
 * content — mirrors `content-security.js`'s
 * `RESIDUAL_ACTIVE_CONTENT_PATTERNS` backstop pattern. */
const RESIDUAL_ACTIVE_SVG_PATTERNS = Object.freeze([
  /<script[\s>/]/i,
  /<style[\s>/]/i,
  /<foreignobject[\s>/]/i,
  /<image[\s>/]/i,
  /<iframe[\s>/]/i,
  /\son[a-z]+\s*=/i,
  /url\(\s*['"]?(?:https?:)?\/\//i,
  /url\(\s*['"]?data:/i,
]);

/**
 * @param {string} sanitized the sanitize-html output
 * @returns {void}
 */
function assertNoResidualActiveSvgContent(sanitized) {
  for (const pattern of RESIDUAL_ACTIVE_SVG_PATTERNS) {
    if (pattern.test(sanitized)) {
      throw new ThemeAssetError(
        THEME_SVG_REJECTED_CODE,
        `sanitized theme SVG still matches a forbidden pattern (${pattern})`,
      );
    }
  }
  // Every href/xlink:href that survived sanitization must be a same-document
  // fragment reference; sanitize-html's own scheme allowlist admits a
  // schemeless value (including a bare fragment) without distinguishing it
  // from, say, a schemeless relative path, so this is checked explicitly.
  for (const match of sanitized.matchAll(
    /(?:href|xlink:href)\s*=\s*"([^"]*)"/gi,
  )) {
    if (!match[1].startsWith('#')) {
      throw new ThemeAssetError(
        THEME_SVG_REJECTED_CODE,
        `theme SVG href must be a same-document fragment reference, got ${JSON.stringify(match[1])}`,
      );
    }
  }
}

/**
 * Reject, rather than silently strip, any of the specific constructs the
 * fix requires an SVG sanitizer to police (no script, no event handlers, no
 * external references): a theme package is untrusted supply-chain input, so
 * a file that *contains* one of these is treated as a rejected asset, not
 * quietly laundered into a smaller, safe file the theme author never
 * reviewed. The allowlist pass below is defense-in-depth on top of this,
 * narrowing an already-clean file to the admitted tag/attribute vocabulary.
 *
 * @param {string} source the raw SVG text
 * @returns {void}
 */
function assertNoForbiddenSvgConstructs(source) {
  if (/<!doctype/i.test(source) || /<!entity/i.test(source)) {
    throw new ThemeAssetError(
      THEME_SVG_REJECTED_CODE,
      'theme SVG must not declare a DOCTYPE or an XML entity',
    );
  }
  if (/<\s*(script|style|foreignobject|image|iframe|animate\w*|set)[\s>/]/i.test(
    source,
  )) {
    throw new ThemeAssetError(
      THEME_SVG_REJECTED_CODE,
      'theme SVG must not contain a <script>, <style>, <foreignObject>, ' +
        '<image>, <iframe>, animation or <set> element',
    );
  }
  if (/\son[a-z]+\s*=/i.test(source)) {
    throw new ThemeAssetError(
      THEME_SVG_REJECTED_CODE,
      'theme SVG must not carry an event-handler attribute',
    );
  }
  for (const match of source.matchAll(
    /(?:href|xlink:href)\s*=\s*(['"])(.*?)\1/gis,
  )) {
    if (!match[2].startsWith('#')) {
      throw new ThemeAssetError(
        THEME_SVG_REJECTED_CODE,
        `theme SVG href must be a same-document fragment reference, got ${JSON.stringify(match[2])}`,
      );
    }
  }
  if (/url\(\s*['"]?(?:https?:)?\/\//i.test(source)) {
    throw new ThemeAssetError(
      THEME_SVG_REJECTED_CODE,
      'theme SVG must not reference an external url()',
    );
  }
  if (/url\(\s*['"]?data:/i.test(source)) {
    throw new ThemeAssetError(
      THEME_SVG_REJECTED_CODE,
      'theme SVG must not embed a data: url()',
    );
  }
}

/**
 * Sanitize one theme-declared SVG passive asset's exact bytes against the
 * closed grammar above, failing closed on anything it does not admit.
 *
 * @param {Buffer} bytes the file's raw bytes (already sniffed as `'svg'` by
 *   {@link ../media/sniff.js})
 * @returns {Buffer} the sanitized UTF-8 SVG bytes, safe to publish
 */
export function sanitizeThemeSvg(bytes) {
  const source = bytes.toString('utf8');
  assertNoForbiddenSvgConstructs(source);
  const sanitized = sanitizeHtml(source, SVG_SANITIZE_OPTIONS);
  if (sanitized.trim().length === 0 || !/<svg[\s>]/i.test(sanitized)) {
    throw new ThemeAssetError(
      THEME_SVG_REJECTED_CODE,
      'theme SVG did not survive sanitization as a root <svg> element',
    );
  }
  // Fail-closed backstop over the allowlist pass above — a hit here is this
  // module's own configuration defect, never expected of admitted content
  // (the explicit rejection checks above should already have caught it).
  assertNoResidualActiveSvgContent(sanitized);
  return Buffer.from(sanitized, 'utf8');
}
