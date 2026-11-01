/**
 * Where theme files go and how they are linked: output paths, hrefs,
 * Subresource Integrity and the default print-stylesheet link. No file access
 * and no heavy dependency (the palette sheet and its schema validation live in
 * `theme-links.js`), so the page assembly imports this without them.
 */

import { sha256Base64 } from './sha256.js';
import { projectFixedAssetPath } from './route.js';
import { escapeHtml } from './skeleton.js';

/** @type {string} the fixed, non-content-addressed output directory every
 * theme asset (stylesheet or passive file) is copied under, relative to
 * `basePath`. */
export const THEME_ASSET_DIRECTORY = 'assets/theme';

/**
 * The `basePath`-joined output-relative path (no leading slash, safe to
 * both `path.join(outputDirectory, ...)` and a `manifestAsset.path`) for
 * one theme-owned file. `href` is always derived from this exact same
 * value, never computed independently, so the emitted `<link>` and the
 * physical/manifest path can never drift apart.
 *
 * @param {string} basePath the build input's `basePath`
 * @param {string} themeRelativePath the file's path relative to
 *   `THEME_ASSET_DIRECTORY` (e.g. `"tokens.css"` or `"assets/mark.svg"`)
 * @returns {string} the joined output-relative path
 */
export function joinedThemeOutputPath(basePath, themeRelativePath) {
  return projectFixedAssetPath(
    basePath,
    `/${THEME_ASSET_DIRECTORY}/${themeRelativePath}`,
  );
}

/**
 * The public `<link href>` for one theme file: the same joined path as
 * {@link joinedThemeOutputPath}, but under the public base path.
 *
 * @param {string} publicBasePath the public base path
 * @param {string} themeRelativePath the file's path relative to
 *   `THEME_ASSET_DIRECTORY`
 * @returns {string} the root-absolute href
 */
export function themeHref(publicBasePath, themeRelativePath) {
  return `/${joinedThemeOutputPath(publicBasePath, themeRelativePath)}`;
}

/**
 * TPL-M1 fix: compute a Subresource Integrity attribute value
 * (`sha256-<base64>`) from exact file bytes, so a theme stylesheet `<link>`
 * can be verified by the browser itself.
 *
 * @param {Uint8Array} bytes exact file bytes
 * @returns {string} an `integrity` attribute value, e.g. `sha256-AAAA...`
 */
export function subresourceIntegrityAttribute(bytes) {
  return `sha256-${sha256Base64(bytes)}`;
}

/**
 * The default theme stylesheet markup, used only when
 * `renderPublication` is not given a resolved `options.themeDirectory`
 * (this repository's own tests, and any caller that has not yet resolved a
 * theme package): one `media="print"` `<link>` at the fixed conventional
 * `<basePath>/assets/theme/print.css` path, matching
 * `internal/print-stylesheet.js`'s pre-existing convention exactly. No
 * file is written for this fallback path — see the module's own "purely
 * additive" documentation above.
 *
 * @param {string} basePath the build input's `basePath`
 * @returns {string} the `<link>` HTML fragment
 */
export function defaultThemeStylesheetLinksHtml(basePath) {
  const outputPath = joinedThemeOutputPath(basePath, 'print.css');
  return `<link rel="stylesheet" href="${escapeHtml(`/${outputPath}`)}" media="print">`;
}
