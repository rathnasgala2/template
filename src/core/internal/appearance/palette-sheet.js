/**
 * The publication palette stylesheet for a build: `palette-derive.js`'s pure
 * derivation plus the schema-validator-backed check that every derived value
 * stays inside the theme-contract token grammar. Everything else (the bytes,
 * the file name, the contrast checks) is `palette-derive.js`; the browser
 * article preview uses that module directly, without the validator.
 */

import { validateGalaDocument } from '@rathnasgala2/schemas';

import { ThemeAssetError } from '../../errors.js';
import {
  PALETTE_STYLESHEET_DIRECTORY,
  PALETTE_STYLESHEET_MAXIMUM_BYTES,
  PALETTE_STYLESHEET_MEDIA_TYPE,
  PALETTE_STYLESHEET_PREFIX,
  assertThemePalette,
  derivePaletteSheet,
} from './palette-derive.js';

export {
  PALETTE_STYLESHEET_DIRECTORY,
  PALETTE_STYLESHEET_MAXIMUM_BYTES,
  PALETTE_STYLESHEET_MEDIA_TYPE,
  PALETTE_STYLESHEET_PREFIX,
  assertThemePalette,
};

const THEME_CONTRACT_SCHEMA_ID = 'urn:gala:schema:theme-contract:2.0.0';

/**
 * Derive, check and serialise the palette sheet for one build, including the
 * token-grammar check.
 *
 * @param {Record<string, unknown>} themeJson the admitted `theme.json`
 * @param {unknown} appearanceTokens `appearance.tokens` (`{}` or absent for
 *   the theme's default palette)
 * @returns {ReturnType<typeof derivePaletteSheet>} the sheet
 * @throws {ThemeAssetError} as {@link derivePaletteSheet}
 */
export function buildPaletteStylesheet(themeJson, appearanceTokens) {
  return derivePaletteSheet(themeJson, appearanceTokens, {
    assertTokenGrammar(finalTokens) {
      const validation = validateGalaDocument(THEME_CONTRACT_SCHEMA_ID, {
        ...themeJson,
        tokens: finalTokens,
      });
      if (!validation.valid) {
        throw new ThemeAssetError(
          'APPEARANCE_PALETTE_INVALID',
          `a derived palette value is outside the token grammar ` +
            `(${validation.diagnostics.length} diagnostic(s)): ` +
            JSON.stringify(validation.diagnostics),
        );
      }
    },
  });
}
