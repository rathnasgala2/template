/**
 * SEO/localization metadata assembly: canonical share and copy affordances,
 * localization metadata, SEO metadata.
 *
 * This module resolves the per-page facts `internal/page-kinds.js` already
 * decided (`description`, `ogType`, `socialImageRef`, `robotsContent`) into
 * the concrete absolute-URL strings a page's `<head>` needs. It is kept
 * separate from `page-kinds.js` because resolving a `socialImageRef` into an
 * absolute derivative URL needs two facts only `src/core/index.js` has at
 * that point: the media pipeline's own finished `assets` list (so the exact
 * derivative file extension a given source image produced is known —
 * `page-kinds.js` never decodes an image) and `buildInput.baseUrl` (the
 * origin every absolute URL this renderer emits is resolved against).
 *
 * basePath fix: every derivative-asset URL this module resolves is
 * `basePath`-joined through `internal/route.js`'s shared
 * {@link import('./route.js').joinBasePathAndRoute} before being resolved
 * against `baseUrl`, exactly like every other renderer-derived route
 * (`internal/page-kinds.js`, `internal/print-stylesheet.js`). Without this,
 * {@link resolveSocialImageUrl} would join a bare root-absolute
 * `/${derivativePath}` against `baseUrl`, which 404s under a non-root
 * `basePath` publication (`internal/theme-assets.js` applies the equivalent
 * fix for the theme/print stylesheet and appearance-script hrefs).
 *
 * hreflang note (documented scope decision, not a silent omission):
 * `build-input:2.0.0` has no translation/locale-variant linkage between
 * distinct `content[]` records (checked against
 * `node_modules/@rathnasgala2/schemas/schemas/build-input.schema.json`: no
 * `$defs` entry named anything like `translation`/`localizedContent`/
 * `alternateLanguage` exists anywhere in the schema; `authorNormalized`'s own
 * `localized` array carries only a translated author bio, never a route). A
 * page's own `<html lang>` already carries its resolved language, which is
 * the entire localization signal this build-input shape declares.
 * `<link rel="alternate" hreflang="...">` is therefore correctly *empty*
 * here — the requirement to emit hreflang/localization metadata where the
 * input declares translations is satisfied vacuously, since the input never
 * declares one. This module has no `hreflang` export for that reason; a
 * later build-input major version that adds translation linkage is the
 * natural place to add one, at which point every page-kind call site below
 * gains a `translations` field the same way `socialImageRef` was added here.
 */

import { joinBasePathAndRoute } from './route.js';

/**
 * Derive the content-addressed derivative output path
 * `internal/media/pipeline.js`'s `derivativePath(sourceDigest, 'original',
 * extension)` would have produced for a given `resolvedFile` reference,
 * independent of that module (this renderer's one other module permitted to
 * know this path shape, so a change to either stays a one-place fix).
 *
 * @param {readonly {path: string, mediaType: string}[]} mediaAssets the
 *   media pipeline's own finished `assets` list
 * @param {{path: string, sourceDigest: string} | undefined} reference a
 *   `resolvedFile`-shaped reference (`publication.defaultImage`,
 *   `author.avatar`, `frontmatter.socialImage`, `frontmatter.hero.file`)
 * @returns {string | undefined} the derivative asset's own output-relative
 *   path (never the raw source path), or `undefined` when no reference was
 *   supplied or the media pipeline produced no matching derivative (an image
 *   this renderer's own media pipeline was never asked to process, e.g. a
 *   test fixture exercising SEO metadata without the media pipeline)
 */
export function resolveOriginalDerivativePath(mediaAssets, reference) {
  if (!reference) return undefined;
  const hex = reference.sourceDigest.replace(/^sha256:/, '');
  const prefix = `assets/media/${hex}/original.`;
  const match = mediaAssets.find((asset) => asset.path.startsWith(prefix));
  return match?.path;
}

/**
 * Resolve one `og:image`/`twitter:image` absolute URL from a
 * `resolvedFile`-shaped reference, or `undefined` when there is none to
 * resolve.
 *
 * @param {object} options resolution options
 * @param {readonly {path: string, mediaType: string}[]} options.mediaAssets
 *   the media pipeline's own finished `assets` list
 * @param {{path: string, sourceDigest: string} | undefined} options.reference
 *   the candidate `resolvedFile` reference
 * @param {string} options.baseUrl the build input's origin-only `baseUrl`
 * @param {string} options.basePath the build input's `basePath` (the
 *   derivative path is joined with this before being resolved against
 *   `baseUrl`, so a non-root publication's social-image URL is correct)
 * @returns {string | undefined} the absolute derivative image URL, or
 *   `undefined`
 */
export function resolveSocialImageUrl({
  mediaAssets,
  reference,
  baseUrl,
  basePath,
}) {
  const derivativePath = resolveOriginalDerivativePath(mediaAssets, reference);
  if (!derivativePath) return undefined;
  return new URL(
    joinBasePathAndRoute(basePath, `/${derivativePath}`),
    baseUrl,
  ).toString();
}

/**
 * The Twitter Card type this renderer emits: `summary_large_image` when a
 * social image resolved, `summary` otherwise. Never `app`/`player` (this
 * renderer never emits an application or media-player card).
 *
 * @param {boolean} hasImage whether a social image URL resolved for this page
 * @returns {'summary' | 'summary_large_image'} the card type
 */
export function twitterCardType(hasImage) {
  return hasImage ? 'summary_large_image' : 'summary';
}
