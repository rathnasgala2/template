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

/** @type {{key: string, type: 'length' | 'color' | 'font-family' | 'font-weight'}[]}
 * the closed 35-entry token catalog `urn:gala:schema:theme-contract:2.0.0`'s
 * `tokens` prefix schema requires, in the exact key order the schema fixes.
 * This is the one place this repository lists the catalog as data (the
 * renderer itself never reads individual token semantics — it only copies
 * theme CSS bytes through); the schema package remains the source of truth,
 * and `test/scaffold-theme.test.js` proves this list stays conformant by
 * validating a scaffolded theme against it. */
export const THEME_TOKEN_CATALOG = Object.freeze([
  { key: 'border-width', type: 'length' },
  { key: 'color-accent', type: 'color' },
  { key: 'color-border', type: 'color' },
  { key: 'color-canvas', type: 'color' },
  { key: 'color-code-canvas', type: 'color' },
  { key: 'color-code-text', type: 'color' },
  { key: 'color-danger', type: 'color' },
  { key: 'color-focus', type: 'color' },
  { key: 'color-link', type: 'color' },
  { key: 'color-link-visited', type: 'color' },
  { key: 'color-on-accent', type: 'color' },
  { key: 'color-selection', type: 'color' },
  { key: 'color-success', type: 'color' },
  { key: 'color-surface', type: 'color' },
  { key: 'color-surface-raised', type: 'color' },
  { key: 'color-text', type: 'color' },
  { key: 'color-text-muted', type: 'color' },
  { key: 'color-warning', type: 'color' },
  { key: 'content-measure', type: 'length' },
  { key: 'focus-width', type: 'length' },
  { key: 'font-body', type: 'font-family' },
  { key: 'font-heading', type: 'font-family' },
  { key: 'font-mono', type: 'font-family' },
  { key: 'radius-medium', type: 'length' },
  { key: 'radius-small', type: 'length' },
  { key: 'space-1', type: 'length' },
  { key: 'space-2', type: 'length' },
  { key: 'space-3', type: 'length' },
  { key: 'space-4', type: 'length' },
  { key: 'space-6', type: 'length' },
  { key: 'space-8', type: 'length' },
  { key: 'weight-heading', type: 'font-weight' },
  { key: 'weight-medium', type: 'font-weight' },
  { key: 'weight-normal', type: 'font-weight' },
  { key: 'weight-strong', type: 'font-weight' },
]);

/** @type {Readonly<Record<string, {light: string, dark: string}>>} a
 * generic, legible starter palette a real theme is expected to replace —
 * every color is a plain hex value so a scaffolded theme renders with visible
 * contrast in both palettes before any authoring happens. */
const STARTER_VALUES = Object.freeze({
  'border-width': { light: '0.0625rem', dark: '0.0625rem' },
  'color-accent': { light: '#2454ff', dark: '#7fa2ff' },
  'color-border': { light: '#d0d5dd', dark: '#3a3f47' },
  'color-canvas': { light: '#ffffff', dark: '#0b0b0c' },
  'color-code-canvas': { light: '#f5f5f7', dark: '#161618' },
  'color-code-text': { light: '#1a1a1a', dark: '#e5e5e5' },
  'color-danger': { light: '#b3261e', dark: '#ff8a80' },
  'color-focus': { light: '#2454ff', dark: '#7fa2ff' },
  'color-link': { light: '#2454ff', dark: '#7fa2ff' },
  'color-link-visited': { light: '#7a3fc9', dark: '#c8a6ff' },
  'color-on-accent': { light: '#ffffff', dark: '#0b0b0c' },
  'color-selection': { light: '#cfe0ff', dark: '#33415e' },
  'color-success': { light: '#1a7f37', dark: '#8fd19e' },
  'color-surface': { light: '#f8f8fa', dark: '#151516' },
  'color-surface-raised': { light: '#ffffff', dark: '#1c1c1e' },
  'color-text': { light: '#1a1a1a', dark: '#e5e5e5' },
  'color-text-muted': { light: '#5b6270', dark: '#9aa2af' },
  'color-warning': { light: '#8a5b00', dark: '#e2b34d' },
  'content-measure': { light: '40rem', dark: '40rem' },
  'focus-width': { light: '0.125rem', dark: '0.125rem' },
  'font-body': {
    light: 'system-ui, sans-serif',
    dark: 'system-ui, sans-serif',
  },
  'font-heading': {
    light: 'system-ui, sans-serif',
    dark: 'system-ui, sans-serif',
  },
  'font-mono': {
    light: 'ui-monospace, monospace',
    dark: 'ui-monospace, monospace',
  },
  'radius-medium': { light: '0.5rem', dark: '0.5rem' },
  'radius-small': { light: '0.25rem', dark: '0.25rem' },
  'space-1': { light: '0.25rem', dark: '0.25rem' },
  'space-2': { light: '0.5rem', dark: '0.5rem' },
  'space-3': { light: '0.75rem', dark: '0.75rem' },
  'space-4': { light: '1rem', dark: '1rem' },
  'space-6': { light: '1.5rem', dark: '1.5rem' },
  'space-8': { light: '2rem', dark: '2rem' },
  'weight-heading': { light: '600', dark: '600' },
  'weight-medium': { light: '500', dark: '500' },
  'weight-normal': { light: '400', dark: '400' },
  'weight-strong': { light: '700', dark: '700' },
});

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
