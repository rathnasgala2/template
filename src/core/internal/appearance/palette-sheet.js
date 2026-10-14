/**
 * The publication palette stylesheet: every build that supplies a theme
 * package derives the theme's palette-driven tokens from the author's
 * `appearance.tokens` (`{}` or absent selects the theme's own default
 * palette), checks them, and writes them as one content-addressed
 * `assets/gala-palette-<12 hex>.css` file linked after the theme's own
 * stylesheets.
 *
 * All colour mathematics lives in `@rathnasgala2/schemas/palette`
 * (`derivePalette`, `checkPalette`); this module never re-implements any of
 * it. It only
 *
 * 1. derives the final token values,
 * 2. re-checks every derived value against the theme-contract token grammar
 *    (the same closed schema every theme token already passes),
 * 3. checks every contrast pair in both modes, and
 * 4. serialises the bound tokens into four blocks inside
 *    `@layer gala-tokens`: the bare root (light), the
 *    `prefers-color-scheme: dark` root, and the two resolved-mode selectors,
 *    exactly the four blocks a theme's own `tokens.css` uses. The sheet is an
 *    external same-origin file, so the CSP stays free of inline styles.
 *
 * The bytes are a pure function of the theme's palette-relevant data and the
 * author's picks, so sites on the same theme default share identical bytes.
 */

import { createHash } from 'node:crypto';

import { validateGalaDocument } from '@rathnasgala2/schemas';
import {
  checkPalette,
  derivePalette,
  PaletteError,
} from '@rathnasgala2/schemas/palette';

import { ThemeAssetError } from '../../errors.js';
import {
  APPEARANCE_RESOLVED_MODE_ATTRIBUTE,
  APPEARANCE_ROOT_ATTRIBUTE,
} from './contract.js';

/** @type {string} */
export const PALETTE_STYLESHEET_DIRECTORY = 'assets';
/** @type {string} */
export const PALETTE_STYLESHEET_PREFIX = 'gala-palette-';
/** @type {string} */
export const PALETTE_STYLESHEET_MEDIA_TYPE = 'text/css; charset=utf-8';
/** @type {number} the palette sheet's size ceiling (design D4). */
export const PALETTE_STYLESHEET_MAXIMUM_BYTES = 16384;

const THEME_CONTRACT_SCHEMA_ID = 'urn:gala:schema:theme-contract:2.0.0';

/**
 * @param {Record<string, string>} declarations `--gala-<key>` -> value
 * @param {string} indent line indent
 * @returns {string} the declaration lines
 */
function declarationLines(declarations, indent) {
  return Object.entries(declarations)
    .map(([key, value]) => `${indent}--gala-${key}: ${value};\n`)
    .join('');
}

/**
 * Serialise the bound tokens into the four-block sheet.
 *
 * @param {Record<string, {light: string, dark: string}>} tokens derived tokens
 * @param {readonly string[]} bound the bound keys, in the theme's order
 * @returns {string} the stylesheet text
 */
function serialisePaletteSheet(tokens, bound) {
  const keys = [...bound].sort((a, b) =>
    Buffer.compare(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8')),
  );
  /** @type {Record<string, string>} */
  const light = {};
  /** @type {Record<string, string>} */
  const dark = {};
  for (const key of keys) {
    light[key] = /** @type {{light: string, dark: string}} */ (
      tokens[key]
    ).light;
    dark[key] = /** @type {{light: string, dark: string}} */ (tokens[key]).dark;
  }
  const root = `[${APPEARANCE_ROOT_ATTRIBUTE}]`;
  const resolved = (/** @type {string} */ mode) =>
    `[${APPEARANCE_ROOT_ATTRIBUTE}][${APPEARANCE_RESOLVED_MODE_ATTRIBUTE}="${mode}"]`;
  return (
    `@layer gala-tokens {\n` +
    `  ${root} {\n${declarationLines(light, '    ')}  }\n` +
    `  @media (prefers-color-scheme: dark) {\n` +
    `    ${root} {\n${declarationLines(dark, '      ')}    }\n` +
    `  }\n` +
    `  ${resolved('light')} {\n${declarationLines(light, '    ')}  }\n` +
    `  ${resolved('dark')} {\n${declarationLines(dark, '    ')}  }\n` +
    `}\n`
  );
}

/**
 * Map a schemas `PaletteError` to the template's refusal shape.
 *
 * @param {unknown} error the thrown value
 * @returns {never} always throws
 */
function rethrowPaletteError(error) {
  if (error instanceof PaletteError) {
    throw new ThemeAssetError(error.code, error.detail);
  }
  throw error;
}

/**
 * Admit a theme's `palette` block: the theme must declare one and it must be
 * well formed. There is no fallback for a theme without it.
 *
 * @param {Record<string, unknown>} themeJson the parsed `theme.json`
 * @returns {void}
 * @throws {ThemeAssetError} `THEME_PALETTE_MISSING` or `THEME_PALETTE_INVALID`
 */
export function assertThemePalette(themeJson) {
  try {
    derivePalette(
      /** @type {Parameters<typeof derivePalette>[0]} */ (themeJson),
      {},
    );
  } catch (error) {
    rethrowPaletteError(error);
  }
}

/**
 * Derive, check and serialise the palette sheet for one build.
 *
 * @param {Record<string, unknown>} themeJson the admitted `theme.json`
 * @param {unknown} appearanceTokens `appearance.tokens` (`{}` or absent for
 *   the theme's default palette)
 * @returns {{
 *   text: string,
 *   bytes: Buffer,
 *   fileName: string,
 *   canvas: {light: string, dark: string} | undefined,
 * }} the sheet, its content-addressed file name and the resolved page canvas
 *   colour per mode (`undefined` unless both are opaque `#rrggbb`)
 * @throws {ThemeAssetError} `APPEARANCE_PALETTE_INVALID` (malformed picks or
 *   a derived value outside the token grammar), `APPEARANCE_PALETTE_CONTRAST`
 *   (a pair below its minimum; the message names the pair, mode and ratio)
 */
export function buildPaletteStylesheet(themeJson, appearanceTokens) {
  const theme = /** @type {Parameters<typeof derivePalette>[0]} */ (themeJson);
  /** @type {ReturnType<typeof derivePalette>} */
  let derived;
  try {
    derived = derivePalette(
      theme,
      /** @type {Parameters<typeof derivePalette>[1]} */ (
        appearanceTokens ?? {}
      ),
    );
  } catch (error) {
    return rethrowPaletteError(error);
  }

  // Every derived value passes the closed token grammar: the theme-contract
  // schema validates each token's value against its type, so substitute the
  // derived values into the theme's own token rows and validate.
  const finalTokens =
    /** @type {{key: string, light: string, dark: string}[]} */ (
      themeJson.tokens
    ).map((row) => ({
      ...row,
      light: derived.tokens[row.key]?.light ?? row.light,
      dark: derived.tokens[row.key]?.dark ?? row.dark,
    }));
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

  for (const mode of /** @type {const} */ (['light', 'dark'])) {
    const check = checkPalette(derived, mode);
    const failure = check.failures[0];
    if (failure) {
      const ratio =
        failure.ratio === null
          ? (failure.reason ?? 'unmeasurable')
          : `${failure.ratio.toFixed(2)}:1`;
      throw new ThemeAssetError(
        'APPEARANCE_PALETTE_CONTRAST',
        `${failure.pair} in ${mode} mode is ${ratio}, below ${failure.minimum}:1 ` +
          `(${check.failures.length} failing pair(s) in ${mode} mode)`,
        { pair: failure.pair, mode, failures: check.failures },
      );
    }
  }

  const text = serialisePaletteSheet(derived.tokens, derived.bound);
  const bytes = Buffer.from(text, 'utf8');
  if (bytes.byteLength > PALETTE_STYLESHEET_MAXIMUM_BYTES) {
    throw new ThemeAssetError(
      'APPEARANCE_PALETTE_INVALID',
      `the palette stylesheet is ${bytes.byteLength} bytes, over ${PALETTE_STYLESHEET_MAXIMUM_BYTES}`,
    );
  }
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
  const canvas = derived.tokens['color-canvas'];
  const opaque = /^#[0-9a-f]{6}$/i;
  return {
    text,
    bytes,
    fileName: `${PALETTE_STYLESHEET_PREFIX}${hash}.css`,
    canvas:
      canvas && opaque.test(canvas.light) && opaque.test(canvas.dark)
        ? { light: canvas.light, dark: canvas.dark }
        : undefined,
  };
}
