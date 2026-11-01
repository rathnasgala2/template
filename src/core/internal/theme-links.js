/**
 * The pure half of theme asset handling: output paths, Subresource Integrity,
 * and the assembly of the theme's stylesheet rows, the publication palette
 * sheet and the ordered `<link>` markup, from bytes already in memory. No
 * file access and no `node:` import, so it runs in a browser;
 * `theme-assets.js` reads and validates the theme package from disk and calls
 * it.
 */

import { digestBytes } from './canonical-jcs.js';
import {
  buildPaletteStylesheet,
  PALETTE_STYLESHEET_DIRECTORY,
  PALETTE_STYLESHEET_MEDIA_TYPE,
} from './appearance/palette-sheet.js';
import { projectFixedAssetPath } from './route.js';
import { sha256Base64 } from './sha256.js';
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
 * Assemble the theme stylesheet rows, the palette sheet and the `<link>`
 * markup, in the order a build emits them: the theme's stylesheets in
 * declared order, then the content-addressed palette sheet.
 *
 * @param {object} options the inputs, already read and validated
 * @param {Record<string, unknown>} options.themeJson the parsed `theme.json`
 * @param {readonly {filename: string, relativePath: string, bytes: Uint8Array}[]} options.stylesheets
 *   the declared stylesheets' bytes, in `theme.json.stylesheets` order
 * @param {string} options.basePath the build input's `basePath`
 * @param {string} options.publicBasePath the base path emitted `<link href>`
 *   values use
 * @param {unknown} options.appearanceTokens `appearance.tokens`
 * @returns {{
 *   files: {path: string, bytes: Uint8Array}[],
 *   assets: import('../../../types/index.d.ts').ManifestAssetEntry[],
 *   linkTagsHtml: string,
 *   canvas: {light: string, dark: string} | undefined,
 * }} the files to write (already `basePath`-joined), their manifest rows and
 *   the ready-to-insert `<link>` markup
 */
export function assembleThemeLinks({
  themeJson,
  stylesheets,
  basePath,
  publicBasePath,
  appearanceTokens,
}) {
  /** @type {{path: string, bytes: Uint8Array}[]} */
  const files = [];
  /** @type {import('../../../types/index.d.ts').ManifestAssetEntry[]} */
  const assets = [];
  /** @type {string[]} */
  const linkTags = [];
  for (const { filename, relativePath, bytes } of stylesheets) {
    const outputPath = joinedThemeOutputPath(basePath, relativePath);
    files.push({ path: outputPath, bytes });
    assets.push({
      path: outputPath,
      mediaType: 'text/css; charset=utf-8',
      byteLength: String(bytes.byteLength),
      sha256: digestBytes(bytes),
      immutable: false,
    });
    const mediaAttribute = filename === 'print.css' ? ' media="print"' : '';
    // TPL-M1 fix: emit Subresource Integrity so a mutated stylesheet in a
    // published artifact is detectable by the browser itself, not only by
    // re-running manifest verification. `digestBytes` returns a hex-prefixed
    // `sha256:` tag for the manifest; SRI needs the same digest re-encoded as
    // base64, computed fresh from these exact bytes.
    const integrity = subresourceIntegrityAttribute(bytes);
    linkTags.push(
      `<link rel="stylesheet" href="${escapeHtml(themeHref(publicBasePath, relativePath))}" integrity="${integrity}" crossorigin="anonymous"${mediaAttribute}>`,
    );
  }

  // Template 4.1.0: the publication palette sheet, derived on every build
  // (`{}` selects the theme's default palette), content-addressed, linked
  // last with SRI and manifested like every theme stylesheet.
  const paletteSheet = buildPaletteStylesheet(themeJson, appearanceTokens);
  const paletteRelativePath = `${PALETTE_STYLESHEET_DIRECTORY}/${paletteSheet.fileName}`;
  const paletteOutputPath = projectFixedAssetPath(
    basePath,
    `/${paletteRelativePath}`,
  );
  files.push({ path: paletteOutputPath, bytes: paletteSheet.bytes });
  assets.push({
    path: paletteOutputPath,
    mediaType: PALETTE_STYLESHEET_MEDIA_TYPE,
    byteLength: String(paletteSheet.bytes.byteLength),
    sha256: digestBytes(paletteSheet.bytes),
    immutable: false,
  });
  linkTags.push(
    `<link rel="stylesheet" href="${escapeHtml(`/${projectFixedAssetPath(publicBasePath, `/${paletteRelativePath}`)}`)}" integrity="${subresourceIntegrityAttribute(paletteSheet.bytes)}" crossorigin="anonymous">`,
  );
  return {
    files,
    assets,
    linkTagsHtml: linkTags.join(''),
    canvas: paletteSheet.canvas,
  };
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
