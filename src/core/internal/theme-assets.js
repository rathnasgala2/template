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
 *
 * Passive-asset admission (TPL-C2 fix): a declared `theme.json.assets[]` row
 * is a lower-trust supply-chain input than the repository owner's own
 * authored content, so it is held to at least the same bar as author media:
 * its bytes are sniffed with `internal/media/sniff.js` (never trusted from
 * the declared `mediaType` string), classified against a closed allowlist
 * (raster formats, or SVG only after {@link sanitizeThemeSvg}'s closed
 * admission grammar — see that module and TPL-H6's iconography decision),
 * checked against `theme.json.budgets`'s per-file/total/count ceilings, and
 * verified byte-for-byte against its own declared `byteLength`/`sha256`
 * before it is ever copied into a published artifact. The manifest
 * `mediaType` this module records is always the *sniffed* type, never the
 * theme's own declaration.
 */

import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';

import { validateGalaDocument } from '@rathnasgala2/schemas';

import { ThemeAssetError } from '../errors.js';
import { digestBytes } from './canonical-jcs.js';
import {
  buildTemplateStylingContract,
  ORDERED_LAYERS,
  TEMPLATE_STYLING_CONTRACT_TEMPLATE_VERSION,
} from './appearance/styling-contract.js';
import { MEDIA_TYPE_BY_FORMAT, sniffMediaFormat } from './media/sniff.js';
import { sanitizeThemeSvg } from './media/theme-svg-sanitizer.js';
import { projectFixedAssetPath } from './route.js';
import { satisfiesTemplateRange } from './semver-range.js';
import { escapeHtml } from './skeleton.js';

/** @type {string} the `urn:gala:schema:theme-contract:2.0.0` schema id
 * every consumed `theme.json` is validated against (TPL-H1). */
const THEME_CONTRACT_SCHEMA_ID = 'urn:gala:schema:theme-contract:2.0.0';

/** @type {number} the hard byte ceiling for one passive asset when a
 * theme's own `theme.json.budgets.maximumFileBytes` is absent or larger
 * (belt-and-suspenders; every real theme package declares a tighter budget
 * of its own, enforced below). */
const DEFAULT_MAXIMUM_PASSIVE_ASSET_BYTES = 262144;

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
export function assertSafeThemeRelativePath(candidate) {
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
export async function assertContainedThemePath(themeDirectory, relativePath) {
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

/** @type {{maximumFileBytes: number, maximumTotalBytes: number, maximumFiles: number}} */
const FALLBACK_BUDGETS = Object.freeze({
  maximumFileBytes: DEFAULT_MAXIMUM_PASSIVE_ASSET_BYTES,
  maximumTotalBytes: DEFAULT_MAXIMUM_PASSIVE_ASSET_BYTES,
  maximumFiles: 8,
});

/**
 * Parse and validate `theme.json.budgets` (TPL-C2/THD-M3: the declared
 * ceilings are now load-bearing, not decorative). An absent or malformed
 * `budgets` object falls back to {@link FALLBACK_BUDGETS} rather than
 * failing closed outright, since a missing budgets object is a shape defect
 * TPL-H1's schema validation already rejects for a real theme package; this
 * fallback only matters for this repository's own minimal test fixtures.
 *
 * @param {unknown} candidate the parsed `theme.json.budgets` value
 * @returns {{maximumFileBytes: number, maximumTotalBytes: number, maximumFiles: number}}
 *   the effective numeric budgets
 */
function assertThemeBudgetsShape(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return FALLBACK_BUDGETS;
  }
  const row = /** @type {Record<string, unknown>} */ (candidate);
  const maximumFileBytes = Number(row.maximumFileBytes);
  const maximumTotalBytes = Number(row.maximumTotalBytes);
  const maximumFiles = Number(row.maximumFiles);
  if (
    !Number.isInteger(maximumFileBytes) ||
    maximumFileBytes <= 0 ||
    !Number.isInteger(maximumTotalBytes) ||
    maximumTotalBytes <= 0 ||
    !Number.isInteger(maximumFiles) ||
    maximumFiles <= 0
  ) {
    throw new ThemeAssetError(
      'THEME_ASSET_BUDGET_EXCEEDED',
      'theme.json.budgets must declare positive integer maximumFileBytes, maximumTotalBytes and maximumFiles',
    );
  }
  return { maximumFileBytes, maximumTotalBytes, maximumFiles };
}

/**
 * Verify a declared passive-asset row's own `byteLength`/`sha256` against
 * the bytes actually read (TPL-C2: the digest chain becomes load-bearing at
 * consume time, not merely computed and republished).
 *
 * @param {{path: string, byteLength?: unknown, sha256?: unknown}} asset the
 *   declared `theme.json.assets[]` row
 * @param {Buffer} bytes the bytes actually read from disk
 * @returns {void}
 */
function assertPassiveAssetIntegrity(asset, bytes) {
  if (
    asset.byteLength !== undefined &&
    String(asset.byteLength) !== String(bytes.byteLength)
  ) {
    throw new ThemeAssetError(
      'THEME_ASSET_DIGEST_MISMATCH',
      `${asset.path}: declared byteLength ${asset.byteLength} does not match ${bytes.byteLength} actual bytes`,
    );
  }
  const actualDigest = digestBytes(bytes);
  if (asset.sha256 !== undefined && asset.sha256 !== actualDigest) {
    throw new ThemeAssetError(
      'THEME_ASSET_DIGEST_MISMATCH',
      `${asset.path}: declared sha256 does not match its actual bytes (expected ${actualDigest}, got ${asset.sha256})`,
    );
  }
}

/**
 * Sniff, allowlist and (for SVG) sanitize one passive asset's bytes,
 * deriving its published `mediaType` from the sniffed format, never from the
 * theme's own declaration (TPL-C2).
 *
 * @param {string} relativePath the declared, already-validated theme-relative
 *   path (for error messages only)
 * @param {Buffer} bytes the bytes actually read from disk
 * @returns {{mediaType: string, publishedBytes: Buffer}} the manifest media
 *   type and the exact bytes to publish (sanitized, for SVG)
 */
function admitPassiveAssetBytes(relativePath, bytes) {
  const format = sniffMediaFormat(bytes);
  if (format === 'svg') {
    // Author SVG is unconditionally rejected (media/sniff.js's own module
    // documentation); a theme-declared SVG is admitted only after it
    // survives the closed sanitization grammar below (TPL-H6's iconography
    // decision: this is the mechanism that makes icon assets safe to ship).
    return {
      mediaType: 'image/svg+xml',
      publishedBytes: sanitizeThemeSvg(bytes),
    };
  }
  const mediaType =
    format === 'unknown' ? undefined : MEDIA_TYPE_BY_FORMAT[format];
  if (!mediaType) {
    throw new ThemeAssetError(
      'THEME_ASSET_FORMAT_INVALID',
      `${relativePath}: bytes do not sniff as an admitted passive-asset format (png, jpeg, webp, avif, or sanitizable svg)`,
    );
  }
  return { mediaType, publishedBytes: bytes };
}

/**
 * The full TPL-H1 fix: schema-validate the parsed `theme.json` against
 * `urn:gala:schema:theme-contract:2.0.0` (the same validator this
 * repository's own tests already use), then make the digest chain and
 * version negotiation load-bearing rather than parsed-and-ignored:
 * `contractVersion` must byte-equal this renderer's own published styling
 * contract version, `stylingContractDigest` must byte-equal that contract's
 * own `catalogDigest`, and `templateRange` must admit this renderer's own
 * published version. Fails closed with a {@link ThemeAssetError} on the
 * first violation.
 *
 * @param {Record<string, unknown>} themeJson the parsed `theme.json` document
 * @returns {void}
 */
function assertThemeContractIntegrity(themeJson) {
  const validation = validateGalaDocument(THEME_CONTRACT_SCHEMA_ID, themeJson);
  if (!validation.valid) {
    throw new ThemeAssetError(
      'THEME_CONTRACT_SCHEMA_INVALID',
      `theme.json failed urn:gala:schema:theme-contract:2.0.0 validation ` +
        `(${validation.diagnostics.length} diagnostic(s)): ` +
        JSON.stringify(validation.diagnostics),
    );
  }

  const publishedContract = buildTemplateStylingContract();
  if (themeJson.contractVersion !== publishedContract.contractVersion) {
    throw new ThemeAssetError(
      'THEME_CONTRACT_VERSION_MISMATCH',
      `theme.json.contractVersion (${themeJson.contractVersion}) does not ` +
        `byte-equal the published styling contract version ` +
        `(${publishedContract.contractVersion})`,
    );
  }
  if (themeJson.stylingContractDigest !== publishedContract.catalogDigest) {
    throw new ThemeAssetError(
      'THEME_CONTRACT_VERSION_MISMATCH',
      `theme.json.stylingContractDigest does not byte-equal the published ` +
        `styling contract's own catalogDigest (this theme was built ` +
        `against a different template styling contract)`,
    );
  }
  let templateRangeSatisfied;
  try {
    templateRangeSatisfied = satisfiesTemplateRange(
      TEMPLATE_STYLING_CONTRACT_TEMPLATE_VERSION,
      /** @type {string} */ (themeJson.templateRange),
    );
  } catch (error) {
    throw new ThemeAssetError(
      'THEME_CONTRACT_VERSION_MISMATCH',
      `theme.json.templateRange is not admitted: ${/** @type {Error} */ (error).message}`,
    );
  }
  if (!templateRangeSatisfied) {
    throw new ThemeAssetError(
      'THEME_CONTRACT_VERSION_MISMATCH',
      `theme.json.templateRange (${themeJson.templateRange}) does not admit ` +
        `this renderer's own published version ` +
        `(${TEMPLATE_STYLING_CONTRACT_TEMPLATE_VERSION})`,
    );
  }
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
  /** @type {Record<string, unknown> & {stylesheets: unknown, cssLayers: unknown, assets?: {path: string, mediaType: string, byteLength?: string, sha256?: string}[]}} */
  const themeJson = JSON.parse(themeJsonBytes.toString('utf8'));

  assertThemeContractIntegrity(themeJson);

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

  const declaredAssetsByPath = new Map(
    (themeJson.assets ?? []).map((asset) => [asset.path, asset]),
  );
  for (const filename of /** @type {string[]} */ (themeJson.stylesheets)) {
    const { relativePath, bytes } = await readDeclaredThemeFile(
      themeDirectory,
      filename,
    );
    // TPL-H1: the schema requires every stylesheet to also carry its own
    // `assets[]` digest row; verify it here rather than parsing and
    // ignoring it.
    const declaredRow = declaredAssetsByPath.get(relativePath);
    if (declaredRow) assertPassiveAssetIntegrity(declaredRow, bytes);
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

  // TPL-M2 fix: partition by the already-shape-validated `stylesheets` list
  // itself, not by comparing `asset.mediaType` against the literal string
  // `'text/css'` — a theme declaring its own stylesheet rows with the same
  // `'text/css; charset=utf-8'` spelling this function's own manifest rows
  // above use would otherwise be classified as a passive asset and copied a
  // second time under the same output path.
  const declaredStylesheetPaths = new Set(themeJson.stylesheets);
  const passiveAssets = (themeJson.assets ?? []).filter(
    (asset) => !declaredStylesheetPaths.has(asset.path),
  );

  const budgets = assertThemeBudgetsShape(themeJson.budgets);
  let totalPassiveBytes = 0;
  if (passiveAssets.length > budgets.maximumFiles) {
    throw new ThemeAssetError(
      'THEME_ASSET_BUDGET_EXCEEDED',
      `theme declares ${passiveAssets.length} passive assets, exceeding budgets.maximumFiles (${budgets.maximumFiles})`,
    );
  }

  for (const asset of passiveAssets) {
    const { relativePath, bytes } = await readDeclaredThemeFile(
      themeDirectory,
      asset.path,
    );
    assertPassiveAssetIntegrity(asset, bytes);
    if (bytes.byteLength > budgets.maximumFileBytes) {
      throw new ThemeAssetError(
        'THEME_ASSET_BUDGET_EXCEEDED',
        `${relativePath} is ${bytes.byteLength} bytes, exceeding budgets.maximumFileBytes (${budgets.maximumFileBytes})`,
      );
    }
    totalPassiveBytes += bytes.byteLength;
    if (totalPassiveBytes > budgets.maximumTotalBytes) {
      throw new ThemeAssetError(
        'THEME_ASSET_BUDGET_EXCEEDED',
        `passive assets total ${totalPassiveBytes} bytes, exceeding budgets.maximumTotalBytes (${budgets.maximumTotalBytes})`,
      );
    }

    const { mediaType, publishedBytes } = admitPassiveAssetBytes(
      relativePath,
      bytes,
    );
    const outputPath = joinedThemeOutputPath(basePath, relativePath);
    files.push({ path: outputPath, bytes: publishedBytes });
    assets.push({
      path: outputPath,
      mediaType,
      byteLength: String(publishedBytes.byteLength),
      sha256: digestBytes(publishedBytes),
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
