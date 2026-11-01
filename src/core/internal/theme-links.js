/**
 * The pure half of theme asset handling: output paths, Subresource Integrity,
 * and the assembly of the theme's stylesheet rows, the publication palette
 * sheet and the ordered `<link>` markup, from bytes already in memory. No
 * file access and no `node:` import, so it runs in a browser;
 * `theme-assets.js` reads and validates the theme package from disk and calls
 * it, supplying the schema-validated palette builder. Without one, the palette
 * is derived without the token-grammar check (and without the schema
 * validator), which is what the browser article preview does.
 */

import { digestBytes } from './canonical-jcs.js';
import {
  derivePaletteSheet,
  PALETTE_STYLESHEET_DIRECTORY,
  PALETTE_STYLESHEET_MEDIA_TYPE,
} from './appearance/palette-derive.js';
import { projectFixedAssetPath } from './route.js';
import {
  joinedThemeOutputPath,
  subresourceIntegrityAttribute,
  themeHref,
} from './theme-paths.js';
import { escapeHtml } from './skeleton.js';

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
 * @param {(themeJson: Record<string, unknown>, appearanceTokens: unknown) => ReturnType<typeof derivePaletteSheet>} [options.buildPalette]
 *   derives the palette sheet (default: {@link derivePaletteSheet} without the
 *   token-grammar check)
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
  buildPalette = derivePaletteSheet,
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
  const paletteSheet = buildPalette(themeJson, appearanceTokens);
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
