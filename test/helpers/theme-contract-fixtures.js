/**
 * Shared builder for a fully schema-conformant `theme-contract:2.0.0`
 * `theme.json` document (TPL-H1), used by every test that needs
 * `loadThemeAssets`'s consumed `theme.json` to actually pass
 * `validateGalaDocument`/the digest-chain checks, rather than the
 * deliberately-non-conformant minimal shapes this repository's fixtures used
 * before TPL-H1 (schema validation at consume time was not yet load-bearing).
 */

import {
  STARTER_VALUES,
  THEME_TOKEN_CATALOG,
} from '../../scripts/scaffold-theme.mjs';
import { digestBytes } from '../../src/core/internal/canonical-jcs.js';
import { buildTemplateStylingContract } from '../../src/core/internal/appearance/styling-contract.js';

/** @returns {{key: string, type: string, light: string, dark: string}[]} the
 *   required, exactly-116-row (contract 3) `tokens` array, in the schema's own
 *   key order, with the scaffold's starter values. */
export function buildValidThemeTokens() {
  return THEME_TOKEN_CATALOG.map(({ key, type }) => ({
    key,
    type,
    light: STARTER_VALUES[key].light,
    dark: STARTER_VALUES[key].dark,
  }));
}

/**
 * Build a fully `theme-contract:2.0.0`-conformant `theme.json` object whose
 * digest chain is internally consistent (`stylingContractDigest` byte-equals
 * the template's own published `catalogDigest`, so this fixture is *accepted*
 * by TPL-H1's consume-time checks unless a test deliberately mutates it
 * afterwards).
 *
 * @param {object} options
 * @param {readonly string[]} options.stylesheets the stylesheet filename list
 * @param {readonly string[]} options.cssLayers the matching `cssLayers`
 *   projection
 * @param {readonly {path: string, mediaType: string, bytes: Buffer, license?: string}[]} options.files
 *   every file this theme package declares in `assets[]` (stylesheets and
 *   passive assets alike), with its actual bytes so `byteLength`/`sha256`
 *   are always correct
 * @param {Record<string, unknown>} [options.overrides] shallow overrides
 *   applied last, for negative-path tests
 * @returns {Record<string, unknown>} a complete, internally-consistent
 *   `theme-contract:2.0.0` candidate instance
 */
export function buildValidThemeJson({
  stylesheets,
  cssLayers,
  files,
  overrides = {},
}) {
  const publishedContract = buildTemplateStylingContract();
  return {
    schemaId: 'urn:gala:schema:theme-contract:2.0.0',
    schemaVersion: '2.0.0',
    themeId: 'default',
    package: '@rathnasgala2/theme-default@2.0.0',
    contractVersion: publishedContract.contractVersion,
    templateRange: '^3.0.0',
    stylesheets: [...stylesheets],
    cssLayers: [...cssLayers],
    slotHooks: ['landmark-header'],
    tokens: buildValidThemeTokens(),
    modes: ['dark', 'light', 'system'],
    assets: files.map((file) => ({
      path: file.path,
      mediaType: file.mediaType,
      byteLength: String(file.bytes.byteLength),
      sha256: digestBytes(file.bytes),
      license: file.license ?? 'MIT',
    })),
    fixtures: ['fixture-1'],
    browserPolicyRef: 'gala-theme-css-v2-20211224',
    integrity: `sha256:${'0'.repeat(64)}`,
    budgets: {
      maximumFileBytes: '262144',
      maximumTotalBytes: '1048576',
      maximumFiles: 16,
    },
    fixtureDigest: `sha256:${'1'.repeat(64)}`,
    evidenceDigest: `sha256:${'2'.repeat(64)}`,
    stylingContractDigest: publishedContract.catalogDigest,
    ...overrides,
  };
}
