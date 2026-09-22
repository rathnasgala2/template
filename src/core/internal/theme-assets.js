/**
 * Theme package asset integration (task packet S2-T12): copy the selected
 * theme package's stylesheets (and any declared passive assets) into the
 * candidate output directory's `<basePath>/assets/theme/`, produce their
 * `manifestAsset` rows, and render the ordered `<link>` elements every
 * generated page's `<head>` inserts, in `cssLayers` order.
 *
 * Scope note (documented, not silently assumed, same style as
 * `internal/print-stylesheet.js`'s own module documentation): this module
 * trusts the theme package's own `theme.json` file-set/`cssLayers`/
 * `stylesheets` declarations to the extent needed to *consume* them —
 * closed stylesheet-list shape, `cssLayers` projection matching the
 * published `contracts/theme-styling-contract.jcs`'s `orderedLayers`, and
 * the declared files actually existing. It does **not** re-implement
 * DEC-097's full CSS Syntax Module admission grammar (selector/property/
 * at-rule closed catalogs, byte/token/rule ceilings, etc.) — that is the
 * shared `theme-release.yml` conformance runner's job (S2-T11), run once
 * per theme package release, not per publication build. Authoring real
 * theme CSS is S2-T13's task, forbidden here; this module only moves bytes
 * an already-conformant theme package supplies.
 *
 * The theme package directory this module reads from (`options.themeDirectory`
 * on `renderPublication`) is optional: a caller that does not yet resolve a
 * theme package (e.g. most of this repository's own S2-T02 through S2-T11
 * tests) gets the S2-T08 default — a `<link>` at the fixed conventional
 * `assets/theme/print.css` path, matching `internal/print-stylesheet.js`'s
 * pre-existing convention — so this task's addition is purely additive.
 *
 * Path-containment hardening (independent-review finding B1): every
 * declared `theme.json` path this module reads — a `stylesheets` entry or a
 * non-CSS `assets[].path` entry — is untrusted input from the selected
 * theme package, not a fixed literal. `assertSafeThemeRelativePath` rejects
 * anything that is not a normalized (NFC), forward-slash, `/`-free,
 * `..`-free, backslash-free, non-absolute relative path with no empty or
 * dot segment, then walks every path component under `themeDirectory` with
 * `lstat` and rejects a symlink at any component (so a symlink planted
 * inside the theme directory cannot be used to escape it), then verifies
 * the fully resolved path still starts inside the resolved `themeDirectory`.
 * Only paths this module itself reads off `theme.json`'s `stylesheets`/
 * `assets` arrays are ever opened or copied — a file physically present in
 * `themeDirectory` but never declared there is never enumerated, so it can
 * never be copied into the candidate output directory.
 *
 * basePath fix (independent-review finding B2, LOCAL-7 follow-up): every
 * file this module writes, and every `manifestAsset.path` it produces, is
 * now `basePath`-joined through `internal/route.js`'s
 * `projectFixedAssetPath` — the exact same join `internal/route.js` already
 * uses for the generated `404.html`/feeds/sitemap/search-index paths — so
 * the physical file the local-directory adapter serves at
 * `<basePath>/assets/theme/<name>` matches the `<link href>` this module
 * also emits. `<link href>` and the physical/manifest path are derived from
 * the exact same joined value, so they cannot drift apart.
 */

import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';

import { ThemeAssetError } from '../errors.js';
import { digestBytes } from './canonical-jcs.js';
import { ORDERED_LAYERS } from './appearance/styling-contract.js';
import { projectFixedAssetPath } from './route.js';
import { escapeHtml } from './skeleton.js';

/** @type {string} the fixed, non-content-addressed output directory every
 * theme asset (stylesheet or passive file) is copied under, relative to
 * `basePath`. */
export const THEME_ASSET_DIRECTORY = 'assets/theme';

/** @type {readonly string[]} the stylesheet-list shape without `utilities.css`. */
const STYLESHEETS_WITHOUT_UTILITIES = Object.freeze([
  'tokens.css',
  'components.css',
  'print.css',
]);

/** @type {readonly string[]} the stylesheet-list shape with `utilities.css`. */
const STYLESHEETS_WITH_UTILITIES = Object.freeze([
  'tokens.css',
  'components.css',
  'utilities.css',
  'print.css',
]);

/** @type {Readonly<Record<string, string>>} theme stylesheet filename to its
 * fixed `@layer` name (DEC-097 section 4). */
const LAYER_BY_STYLESHEET = Object.freeze({
  'tokens.css': 'gala-tokens',
  'components.css': 'gala-components',
  'utilities.css': 'gala-utilities',
  'print.css': 'gala-print',
});

/**
 * @param {readonly unknown[]} candidate
 * @returns {void}
 */
function assertStylesheetListShape(candidate) {
  const withoutUtilities =
    JSON.stringify(candidate) === JSON.stringify(STYLESHEETS_WITHOUT_UTILITIES);
  const withUtilities =
    JSON.stringify(candidate) === JSON.stringify(STYLESHEETS_WITH_UTILITIES);
  if (!withoutUtilities && !withUtilities) {
    throw new ThemeAssetError(
      'THEME_STYLESHEETS_INVALID',
      'theme.json stylesheets must be exactly ["tokens.css","components.css","print.css"] ' +
        'or the same list with "utilities.css" inserted before "print.css"',
    );
  }
}

/**
 * @param {readonly unknown[]} stylesheets the already-shape-validated
 *   stylesheet list
 * @param {unknown} cssLayers the candidate `theme.json.cssLayers`
 * @returns {void}
 */
function assertCssLayersProjection(stylesheets, cssLayers) {
  const expected = /** @type {readonly string[]} */ (stylesheets).map(
    (filename) => LAYER_BY_STYLESHEET[/** @type {string} */ (filename)],
  );
  if (JSON.stringify(cssLayers) !== JSON.stringify(expected)) {
    throw new ThemeAssetError(
      'THEME_CSS_LAYERS_INVALID',
      'theme.json cssLayers must byte-equal the exact ordered layer ' +
        'projection of its own stylesheets list',
    );
  }
  if (
    !expected.every(
      (layer, index) =>
        layer === ORDERED_LAYERS[index] ||
        (layer === 'gala-print' && index === expected.length - 1),
    )
  ) {
    throw new ThemeAssetError(
      'THEME_CSS_LAYERS_INVALID',
      'theme.json cssLayers must be a subsequence of the published ' +
        'templateStylingContract.orderedLayers, in that exact relative order',
    );
  }
}

/** @type {string} the reason code every path-containment rejection below
 * carries. */
const PATH_CONTAINMENT_CODE = 'THEME_ASSET_PATH_UNSAFE';

/**
 * Reject anything that is not a normalized (NFC), forward-slash-only,
 * absolute-free, `..`-free relative path with no empty or dot segment.
 * Purely syntactic — {@link assertContainedThemePath} does the filesystem
 * containment/symlink walk.
 *
 * @param {unknown} candidate a declared `theme.json` path
 * @returns {string} the same value, once it is known to be a syntactically
 *   safe relative path
 */
function assertSafeThemeRelativePath(candidate) {
  if (typeof candidate !== 'string' || candidate.length === 0) {
    throw new ThemeAssetError(
      PATH_CONTAINMENT_CODE,
      `declared path must be a non-empty string (got ${JSON.stringify(candidate)})`,
    );
  }
  if (candidate.normalize('NFC') !== candidate) {
    throw new ThemeAssetError(
      PATH_CONTAINMENT_CODE,
      `declared path must be NFC-normalized: ${candidate}`,
    );
  }
  if (candidate.includes('\\')) {
    throw new ThemeAssetError(
      PATH_CONTAINMENT_CODE,
      `declared path must not contain a backslash: ${candidate}`,
    );
  }
  if (candidate.startsWith('/') || /^[a-zA-Z]:/.test(candidate)) {
    throw new ThemeAssetError(
      PATH_CONTAINMENT_CODE,
      `declared path must be relative, not absolute: ${candidate}`,
    );
  }
  const segments = candidate.split('/');
  for (const segment of segments) {
    if (segment.length === 0 || segment === '.' || segment === '..') {
      throw new ThemeAssetError(
        PATH_CONTAINMENT_CODE,
        `declared path has an empty, "." or ".." segment: ${candidate}`,
      );
    }
  }
  if (path.posix.normalize(candidate) !== candidate) {
    throw new ThemeAssetError(
      PATH_CONTAINMENT_CODE,
      `declared path is not already in normalized form: ${candidate}`,
    );
  }
  return candidate;
}

/**
 * Walk every path component of an already syntactically-safe relative path
 * under `themeDirectory`, rejecting a symlink at any component, then verify
 * the fully resolved path still starts inside the resolved
 * `themeDirectory` (belt-and-suspenders on top of the syntactic check
 * above).
 *
 * @param {string} themeDirectory the absolute, caller-mounted theme package
 *   directory
 * @param {string} relativePath an already syntactically-safe relative path
 *   (see {@link assertSafeThemeRelativePath})
 * @returns {Promise<string>} the absolute, verified-contained path
 */
async function assertContainedThemePath(themeDirectory, relativePath) {
  const resolvedRoot = path.resolve(themeDirectory);
  let current = resolvedRoot;
  for (const segment of relativePath.split('/')) {
    current = path.join(current, segment);
    let stats;
    try {
      stats = await lstat(current);
    } catch {
      throw new ThemeAssetError(
        PATH_CONTAINMENT_CODE,
        `declared theme file does not exist: ${relativePath}`,
      );
    }
    if (stats.isSymbolicLink()) {
      throw new ThemeAssetError(
        PATH_CONTAINMENT_CODE,
        `declared theme file path contains a symlink component: ${relativePath}`,
      );
    }
  }
  const resolved = path.resolve(current);
  if (
    resolved !== resolvedRoot &&
    !resolved.startsWith(resolvedRoot + path.sep)
  ) {
    throw new ThemeAssetError(
      PATH_CONTAINMENT_CODE,
      `declared theme file resolves outside the theme directory: ${relativePath}`,
    );
  }
  return resolved;
}

/**
 * Validate and read one declared theme-package-relative file, failing
 * closed on any traversal, absolute-path, backslash, non-NFC, dot-segment,
 * or symlink-escape attempt.
 *
 * @param {string} themeDirectory the absolute theme package directory
 * @param {unknown} candidatePath the declared `theme.json` path
 * @returns {Promise<{relativePath: string, bytes: Buffer}>} the validated
 *   relative path and the file's bytes
 */
async function readDeclaredThemeFile(themeDirectory, candidatePath) {
  const relativePath = assertSafeThemeRelativePath(candidatePath);
  const absolutePath = await assertContainedThemePath(
    themeDirectory,
    relativePath,
  );
  const bytes = await readFile(absolutePath);
  return { relativePath, bytes };
}

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
function joinedThemeOutputPath(basePath, themeRelativePath) {
  return projectFixedAssetPath(
    basePath,
    `/${THEME_ASSET_DIRECTORY}/${themeRelativePath}`,
  );
}

/**
 * Load and validate a selected theme package's `theme.json`, copy its
 * stylesheets (and any declared non-CSS passive assets) into
 * `<basePath>/assets/theme/`, and build the ordered `<link>` HTML fragment
 * every generated page's `<head>` inserts.
 *
 * @param {object} options load options
 * @param {string} options.themeDirectory an absolute, caller-mounted,
 *   read-only directory holding one extracted theme package (the exact
 *   file set `theme.json.stylesheets`/`assets` and `package.json.files`
 *   name)
 * @param {string} options.basePath the build input's `basePath`
 * @returns {Promise<{
 *   files: {path: string, bytes: Buffer}[],
 *   assets: import('../../../types/index.d.ts').ManifestAssetEntry[],
 *   linkTagsHtml: string,
 * }>} the files to write (already `basePath`-joined), their manifest rows
 *   (same joined paths), and the ready-to-insert `<link>` markup
 */
export async function loadThemeAssets({ themeDirectory, basePath }) {
  const { bytes: themeJsonBytes } = await readDeclaredThemeFile(
    themeDirectory,
    'theme.json',
  );
  /** @type {{stylesheets: unknown, cssLayers: unknown, assets?: {path: string, mediaType: string}[]}} */
  const themeJson = JSON.parse(themeJsonBytes.toString('utf8'));

  if (!Array.isArray(themeJson.stylesheets)) {
    throw new ThemeAssetError(
      'THEME_STYLESHEETS_INVALID',
      'theme.json.stylesheets must be an array',
    );
  }
  assertStylesheetListShape(themeJson.stylesheets);
  assertCssLayersProjection(themeJson.stylesheets, themeJson.cssLayers);

  /** @type {{path: string, bytes: Buffer}[]} */
  const files = [];
  /** @type {import('../../../types/index.d.ts').ManifestAssetEntry[]} */
  const assets = [];
  /** @type {string[]} */
  const linkTags = [];

  for (const filename of /** @type {string[]} */ (themeJson.stylesheets)) {
    const { relativePath, bytes } = await readDeclaredThemeFile(
      themeDirectory,
      filename,
    );
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
    linkTags.push(
      `<link rel="stylesheet" href="${escapeHtml(`/${outputPath}`)}"${mediaAttribute}>`,
    );
  }

  const passiveAssets = (themeJson.assets ?? []).filter(
    (asset) => asset.mediaType !== 'text/css',
  );
  for (const asset of passiveAssets) {
    const { relativePath, bytes } = await readDeclaredThemeFile(
      themeDirectory,
      asset.path,
    );
    const outputPath = joinedThemeOutputPath(basePath, relativePath);
    files.push({ path: outputPath, bytes });
    assets.push({
      path: outputPath,
      mediaType: asset.mediaType,
      byteLength: String(bytes.byteLength),
      sha256: digestBytes(bytes),
      immutable: false,
    });
  }

  return { files, assets, linkTagsHtml: linkTags.join('') };
}

/**
 * The S2-T08 default theme stylesheet markup, used only when
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
