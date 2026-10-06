/**
 * Write a minimal, conformant theme package skeleton (TPL-M6): a
 * `theme.json` that passes `urn:gala:schema:theme-contract:2.0.0` and this
 * renderer's own consume-time integrity checks (`assertThemeContractIntegrity`
 * in `src/core/internal/theme-assets.js`), plus `tokens.css` (every required
 * token, scoped only to the two resolved-palette selectors so the
 * server-rendered light default already produces a fully themed page with no
 * script), an empty `components.css`, and a `print.css`.
 *
 * `themeId` (and the derived `package` field) is constrained by the schema
 * to one of the five admitted theme identities
 * (`default`/`amaze`/`flashy`/`minimal`/`zebra`); this scaffold cannot mint a
 * new one, only start (or reset) one of those five from a clean, valid
 * baseline. See `docs/theme-authoring.md` for the full guide this script
 * accompanies.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { validateGalaDocument } from '@rathnasgala2/schemas';

import { digestBytes } from '../src/core/internal/canonical-jcs.js';
import { GALA_BASE_DEFAULT_TOKENS } from '../src/core/internal/appearance/base-layer.js';
import {
  buildTemplateStylingContract,
  RESOLVED_PALETTE_SELECTORS,
  TEMPLATE_STYLING_CONTRACT_TEMPLATE_VERSION,
} from '../src/core/internal/appearance/styling-contract.js';
import { runIfMain } from './run-if-main.mjs';

/** @type {readonly string[]} the five theme identities
 * `urn:gala:schema:theme-contract:2.0.0` admits, in `themeId`/`package`
 * pairing order. */
export const ADMITTED_THEME_IDS = Object.freeze([
  'default',
  'amaze',
  'flashy',
  'minimal',
  'zebra',
]);

/** @type {{key: string, type: string}[]}
 * the closed 116-entry token catalog `urn:gala:schema:theme-contract:2.0.0`'s
 * `tokens` prefix schema requires (contract 3), in the exact key order the
 * schema fixes. Starter values are the template's own `gala-base` defaults
 * (`GALA_BASE_DEFAULT_TOKENS`), so a scaffolded theme looks like the unthemed
 * site. `test/scaffold-theme.test.js` proves the list stays conformant by
 * validating a scaffolded theme against the schema. */
export const THEME_TOKEN_CATALOG = Object.freeze([
  { key: 'border-button', type: 'border' },
  { key: 'border-card', type: 'border' },
  { key: 'border-chip', type: 'border' },
  { key: 'border-code', type: 'border' },
  { key: 'border-media-divider', type: 'border' },
  { key: 'border-quote', type: 'border' },
  { key: 'border-row-divider', type: 'border' },
  { key: 'border-section-rule', type: 'border' },
  { key: 'border-width', type: 'length' },
  { key: 'card-inset', type: 'length' },
  { key: 'card-pad', type: 'box' },
  { key: 'card-title-size', type: 'length' },
  { key: 'chip-pad', type: 'box' },
  { key: 'color-accent', type: 'color' },
  { key: 'color-accent-2', type: 'color' },
  { key: 'color-border', type: 'color' },
  { key: 'color-btn-panel', type: 'color' },
  { key: 'color-btn-panel-text', type: 'color' },
  { key: 'color-btn-text', type: 'color' },
  { key: 'color-canvas', type: 'color' },
  { key: 'color-chip-text', type: 'color' },
  { key: 'color-code-canvas', type: 'color' },
  { key: 'color-code-text', type: 'color' },
  { key: 'color-danger', type: 'color' },
  { key: 'color-focus', type: 'color' },
  { key: 'color-footer', type: 'color' },
  { key: 'color-header', type: 'color' },
  { key: 'color-icon-accent', type: 'color' },
  { key: 'color-input', type: 'color' },
  { key: 'color-input-border', type: 'color' },
  { key: 'color-link', type: 'color' },
  { key: 'color-link-underline', type: 'color' },
  { key: 'color-link-underline-hover', type: 'color' },
  { key: 'color-link-visited', type: 'color' },
  { key: 'color-on-accent', type: 'color' },
  { key: 'color-overlay', type: 'color' },
  { key: 'color-panel-muted', type: 'color' },
  { key: 'color-panel-text', type: 'color' },
  { key: 'color-selection', type: 'color' },
  { key: 'color-success', type: 'color' },
  { key: 'color-surface', type: 'color' },
  { key: 'color-surface-raised', type: 'color' },
  { key: 'color-syntax-comment', type: 'color' },
  { key: 'color-syntax-function', type: 'color' },
  { key: 'color-syntax-keyword', type: 'color' },
  { key: 'color-syntax-number', type: 'color' },
  { key: 'color-syntax-string', type: 'color' },
  { key: 'color-text', type: 'color' },
  { key: 'color-text-faint', type: 'color' },
  { key: 'color-text-muted', type: 'color' },
  { key: 'color-toc-active', type: 'color' },
  { key: 'color-toc-active-text', type: 'color' },
  { key: 'color-warning', type: 'color' },
  { key: 'content-measure', type: 'length' },
  { key: 'decor-size', type: 'keyword' },
  { key: 'display-max', type: 'length' },
  { key: 'display-style', type: 'keyword' },
  { key: 'duration-base', type: 'duration' },
  { key: 'duration-fast', type: 'duration' },
  { key: 'duration-slow', type: 'duration' },
  { key: 'ease-spring', type: 'easing' },
  { key: 'ease-standard', type: 'easing' },
  { key: 'focus-width', type: 'length' },
  { key: 'font-body', type: 'font-family' },
  { key: 'font-display', type: 'font-family' },
  { key: 'font-label', type: 'font-family' },
  { key: 'font-mono', type: 'font-family' },
  { key: 'font-ui', type: 'font-family' },
  { key: 'label-transform', type: 'keyword' },
  { key: 'lift-x', type: 'length' },
  { key: 'lift-y', type: 'length' },
  { key: 'link-offset', type: 'length' },
  { key: 'link-offset-hover', type: 'length' },
  { key: 'link-skip-ink', type: 'keyword' },
  { key: 'link-thickness', type: 'length' },
  { key: 'media-filter', type: 'keyword' },
  { key: 'media-filter-hover', type: 'keyword' },
  { key: 'media-zoom', type: 'number' },
  { key: 'paint-button', type: 'paint' },
  { key: 'paint-chip', type: 'paint' },
  { key: 'paint-page-decor', type: 'paint' },
  { key: 'paint-panel', type: 'paint' },
  { key: 'prose-leading', type: 'number' },
  { key: 'prose-size', type: 'length' },
  { key: 'quote-align', type: 'keyword' },
  { key: 'quote-mark', type: 'keyword' },
  { key: 'quote-pad', type: 'box' },
  { key: 'quote-style', type: 'keyword' },
  { key: 'quote-transform', type: 'keyword' },
  { key: 'radius-avatar', type: 'length' },
  { key: 'radius-large', type: 'length' },
  { key: 'radius-media', type: 'length' },
  { key: 'radius-medium', type: 'length' },
  { key: 'radius-pill', type: 'length' },
  { key: 'radius-small', type: 'length' },
  { key: 'row-pad', type: 'length' },
  { key: 'shadow-avatar-ring', type: 'shadow' },
  { key: 'shadow-button', type: 'shadow' },
  { key: 'shadow-card', type: 'shadow' },
  { key: 'shadow-card-hover', type: 'shadow' },
  { key: 'shadow-dialog', type: 'shadow' },
  { key: 'space-1', type: 'length' },
  { key: 'space-2', type: 'length' },
  { key: 'space-3', type: 'length' },
  { key: 'space-4', type: 'length' },
  { key: 'space-6', type: 'length' },
  { key: 'space-8', type: 'length' },
  { key: 'title-transform', type: 'keyword' },
  { key: 'tracking-display', type: 'length' },
  { key: 'tracking-label', type: 'length' },
  { key: 'tracking-title', type: 'length' },
  { key: 'weight-display', type: 'font-weight' },
  { key: 'weight-normal', type: 'font-weight' },
  { key: 'weight-strong', type: 'font-weight' },
  { key: 'weight-title', type: 'font-weight' },
  { key: 'weight-ui', type: 'font-weight' },
]);

/**
 * The schema admits only unquoted, plain font-family names, so the starter
 * stacks differ from `gala-base`'s quoted ones.
 *
 * @type {Readonly<Record<string, string>>}
 */
const STARTER_FONT_STACKS = Object.freeze({
  'font-body': 'ui-sans-serif, system-ui, Segoe UI, Roboto, Arial, sans-serif',
  'font-display':
    'ui-sans-serif, system-ui, Segoe UI, Roboto, Arial, sans-serif',
  'font-label': 'ui-sans-serif, system-ui, Segoe UI, Roboto, Arial, sans-serif',
  'font-ui': 'ui-sans-serif, system-ui, Segoe UI, Roboto, Arial, sans-serif',
  'font-mono': 'ui-monospace, Menlo, Consolas, monospace',
});

/** @type {Readonly<Record<string, {light: string, dark: string}>>} */
export const STARTER_VALUES = Object.freeze(
  Object.fromEntries(
    Object.entries(GALA_BASE_DEFAULT_TOKENS).map(([key, value]) => {
      const stack = STARTER_FONT_STACKS[key];
      if (stack) return [key, { light: stack, dark: stack }];
      return [
        key,
        typeof value === 'string'
          ? { light: value, dark: value }
          : { light: value[0], dark: value[1] ?? value[0] },
      ];
    }),
  ),
);

/**
 * @returns {string} `tokens.css`: every catalog token declared as a
 *   `--gala-<key>` custom property, scoped only to
 *   {@link RESOLVED_PALETTE_SELECTORS} (never a bare `:root`) so the
 *   server-rendered light default (no script required) already resolves
 *   every `var(--gala-…)` reference a theme's own `components.css` makes.
 */
function buildTokensCss() {
  const lightDeclarations = THEME_TOKEN_CATALOG.map(
    ({ key }) => `    --gala-${key}: ${STARTER_VALUES[key].light};`,
  ).join('\n');
  const darkDeclarations = THEME_TOKEN_CATALOG.map(
    ({ key }) => `    --gala-${key}: ${STARTER_VALUES[key].dark};`,
  ).join('\n');
  return (
    `@layer gala-tokens {\n` +
    `  ${RESOLVED_PALETTE_SELECTORS.light} {\n${lightDeclarations}\n  }\n` +
    `  ${RESOLVED_PALETTE_SELECTORS.dark} {\n${darkDeclarations}\n  }\n` +
    `}\n`
  );
}

const COMPONENTS_CSS = '@layer gala-components {\n}\n';
const PRINT_CSS = '@layer gala-print {\n}\n';

/**
 * @param {object} options
 * @param {string} options.destinationDirectory an absolute, empty (or
 *   overwritable) directory to write the theme package skeleton into
 * @param {string} [options.themeId] one of {@link ADMITTED_THEME_IDS};
 *   defaults to `'default'`
 * @param {string} [options.packageVersion] the theme package's own exact
 *   published version, canonical `major.minor.patch`; defaults to `'0.1.0'`
 * @returns {Promise<{files: string[]}>} the published-relative paths written
 */
export async function scaffoldTheme({
  destinationDirectory,
  themeId = 'default',
  packageVersion = '0.1.0',
}) {
  if (!ADMITTED_THEME_IDS.includes(themeId)) {
    throw new Error(
      `themeId must be one of ${ADMITTED_THEME_IDS.join(', ')}, got: ${themeId}`,
    );
  }

  await mkdir(destinationDirectory, { recursive: true });

  const tokensCss = buildTokensCss();
  const stylesheetFiles = [
    { path: 'tokens.css', text: tokensCss },
    { path: 'components.css', text: COMPONENTS_CSS },
    { path: 'print.css', text: PRINT_CSS },
  ];
  for (const file of stylesheetFiles) {
    await writeFile(path.join(destinationDirectory, file.path), file.text);
  }

  const publishedContract = buildTemplateStylingContract();
  const placeholderDigest = (fill) => `sha256:${fill.repeat(64)}`;

  const themeJson = {
    schemaId: 'urn:gala:schema:theme-contract:2.0.0',
    schemaVersion: '2.0.0',
    themeId,
    package: `@rathnasgala2/theme-${themeId}@${packageVersion}`,
    contractVersion: publishedContract.contractVersion,
    templateRange: `^${TEMPLATE_STYLING_CONTRACT_TEMPLATE_VERSION}`,
    stylesheets: ['tokens.css', 'components.css', 'print.css'],
    cssLayers: ['gala-tokens', 'gala-components', 'gala-print'],
    slotHooks: ['landmark-header'],
    tokens: THEME_TOKEN_CATALOG.map(({ key, type }) => ({
      key,
      type,
      light: STARTER_VALUES[key].light,
      dark: STARTER_VALUES[key].dark,
    })),
    modes: ['dark', 'light', 'system'],
    assets: stylesheetFiles.map((file) => ({
      path: file.path,
      mediaType: 'text/css',
      byteLength: String(Buffer.byteLength(file.text, 'utf8')),
      sha256: digestBytes(Buffer.from(file.text, 'utf8')),
      license: 'MIT',
    })),
    fixtures: ['fixture-1'],
    browserPolicyRef: 'gala-theme-css-v2-20211224',
    // Placeholders: this template does not verify `integrity`,
    // `fixtureDigest` or `evidenceDigest` at consume time (only
    // `stylingContractDigest` and the per-asset `sha256` rows are
    // load-bearing here) — a real theme package's own release pipeline is
    // responsible for computing and verifying these against its actual
    // release evidence before publishing.
    integrity: placeholderDigest('0'),
    budgets: {
      maximumFileBytes: '262144',
      maximumTotalBytes: '1048576',
      maximumFiles: 16,
    },
    fixtureDigest: placeholderDigest('1'),
    evidenceDigest: placeholderDigest('2'),
    stylingContractDigest: publishedContract.catalogDigest,
  };

  const validation = validateGalaDocument(
    'urn:gala:schema:theme-contract:2.0.0',
    themeJson,
  );
  if (!validation.valid) {
    throw new Error(
      `scaffolded theme.json failed its own schema validation ` +
        `(${validation.diagnostics.length} diagnostic(s)): ` +
        JSON.stringify(validation.diagnostics),
    );
  }

  await writeFile(
    path.join(destinationDirectory, 'theme.json'),
    `${JSON.stringify(themeJson, null, 2)}\n`,
  );

  return {
    files: ['theme.json', ...stylesheetFiles.map((file) => file.path)],
  };
}

runIfMain(import.meta, async () => {
  const destinationDirectory = process.argv[2];
  if (!destinationDirectory) {
    throw new Error(
      'usage: node scripts/scaffold-theme.mjs <destination-directory> [themeId] [packageVersion]',
    );
  }
  const themeId = process.argv[3];
  const packageVersion = process.argv[4];
  const { files } = await scaffoldTheme({
    destinationDirectory: path.resolve(destinationDirectory),
    ...(themeId ? { themeId } : {}),
    ...(packageVersion ? { packageVersion } : {}),
  });
  console.log(
    `Scaffolded a conformant theme skeleton in ${destinationDirectory}:\n` +
      files.map((file) => `  ${file}`).join('\n'),
  );
});
