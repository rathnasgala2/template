/**
 * TPL-H2/TPL-H3 follow-up acceptance test: `gala-base`'s `:focus-visible`
 * rule (`internal/appearance/base-layer.js`) is the sole source of
 * `outline-style` for a `<select>` and an `<a>` under the published
 * `theme-fixture-full` theme, and stays so even against a hypothetical
 * theme rule with far higher selector specificity that sets the other
 * outline longhands — because CSS cascade-layer precedence resolves each
 * *property*, not each rule: a later layer only overrides a property it
 * actually declares, regardless of the specificity of either side's
 * selector. This is the mechanism the module documentation in
 * `base-layer.js` describes; this test proves it against real rendered
 * output rather than asserting it by reading the comment.
 *
 * No real theme repository (`theme-default`, `theme-amaze`, ...) declares
 * an `outline-*` longhand today (verified by inspection, read-only, not
 * asserted here since this repository does not depend on those sibling
 * repositories) — so this template's own `gala-base` ring is, in practice,
 * every shipped theme's only focus indicator. This test guards the
 * mechanism that stays true if and when a theme ever does declare one.
 *
 * This is a small, purpose-built cascade resolver, not a general CSS engine
 * (this repository has no browser/DOM-rendering dependency to compute real
 * `getComputedStyle` values against `@layer`-aware CSS). It only needs to
 * resolve `outline-*` declarations against `:focus-visible` rules for two
 * known element types, which is exactly what the closed hook catalog and
 * gala-base's own fixed selectors admit.
 */

import { strict as assert } from 'node:assert';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import { GALA_BASE_STYLESHEET_SOURCE } from '../src/core/internal/appearance/base-layer.js';
import { ORDERED_LAYERS } from '../src/core/internal/appearance/styling-contract.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { loadCanonicalBuildInput } from './helpers/schema-fixtures.js';

/**
 * Split a stylesheet into its top-level `@layer <name> { ... }` blocks,
 * keyed by layer name, using brace-balance (not a regex `{[^}]*}`, since
 * `base-layer.js`'s own gala-base block contains nested `@media` braces).
 *
 * @param {string} cssText
 * @returns {Map<string, string>} layer name to its block's inner text
 */
function splitLayerBlocks(cssText) {
  const blocks = new Map();
  const pattern = /@layer\s+([\w-]+)\s*\{/g;
  let match;
  while ((match = pattern.exec(cssText))) {
    const layerName = match[1];
    let depth = 1;
    let index = pattern.lastIndex;
    const start = index;
    while (depth > 0 && index < cssText.length) {
      if (cssText[index] === '{') depth += 1;
      else if (cssText[index] === '}') depth -= 1;
      index += 1;
    }
    blocks.set(layerName, cssText.slice(start, index - 1));
    pattern.lastIndex = index;
  }
  return blocks;
}

/**
 * Extract every depth-0 `selector { prop: value; ... }` rule directly inside
 * a layer block (an `@media`/`@supports` nested block is skipped — brace
 * balance still walks past it correctly — since none of this repository's
 * `:focus-visible` rules live inside one).
 *
 * @param {string} blockText one `splitLayerBlocks` value
 * @returns {{selector: string, declarations: Record<string, string>}[]}
 */
function extractDepthZeroRules(blockText) {
  const rules = [];
  let cursor = 0;
  while (cursor < blockText.length) {
    const braceIndex = blockText.indexOf('{', cursor);
    if (braceIndex === -1) break;
    const selector = blockText.slice(cursor, braceIndex).trim();
    let depth = 1;
    let index = braceIndex + 1;
    while (depth > 0 && index < blockText.length) {
      if (blockText[index] === '{') depth += 1;
      else if (blockText[index] === '}') depth -= 1;
      index += 1;
    }
    const body = blockText.slice(braceIndex + 1, index - 1);
    if (!selector.startsWith('@')) {
      const declarations = {};
      for (const statement of body.split(';')) {
        const colonIndex = statement.indexOf(':');
        if (colonIndex === -1) continue;
        const prop = statement.slice(0, colonIndex).trim();
        const value = statement.slice(colonIndex + 1).trim();
        if (prop) declarations[prop] = value;
      }
      rules.push({ selector, declarations });
    }
    cursor = index;
  }
  return rules;
}

/**
 * Whether a rule's selector list matches `tagName` in the `:focus-visible`
 * state: any comma-separated complex selector whose rightmost compound
 * (after the last combinator) is exactly `:focus-visible` (universal — every
 * element, including `tagName`) or exactly `${tagName}:focus-visible`.
 *
 * @param {string} selectorList
 * @param {string} tagName
 * @returns {boolean}
 */
function matchesFocusVisible(selectorList, tagName) {
  return selectorList.split(',').some((complexSelector) => {
    const compounds = complexSelector.trim().split(/\s+|(?=[>+~])|(?<=[>+~])/);
    const last = compounds[compounds.length - 1].trim();
    return last === ':focus-visible' || last === `${tagName}:focus-visible`;
  });
}

/**
 * Resolve the winning `:focus-visible` declarations for `tagName` across
 * every layer in `ORDERED_LAYERS`' fixed order: a later layer's declared
 * property always overrides an earlier layer's for the same property (true
 * CSS cascade-layer semantics — specificity is never consulted between
 * layers), and a property no later layer declares keeps falling through to
 * the nearest earlier layer that does.
 *
 * @param {Map<string, string>} layerBlocks from {@link splitLayerBlocks},
 *   merged across every stylesheet under consideration
 * @param {string} tagName `'select'` or `'a'`
 * @returns {{value: Record<string, string>, source: Record<string, string>}}
 *   the winning value and its source layer name, per CSS property
 */
function resolveFocusVisibleDeclarations(layerBlocks, tagName) {
  const value = {};
  const source = {};
  for (const layerName of ORDERED_LAYERS) {
    const blockText = layerBlocks.get(layerName);
    if (!blockText) continue;
    for (const rule of extractDepthZeroRules(blockText)) {
      if (!matchesFocusVisible(rule.selector, tagName)) continue;
      for (const [prop, propValue] of Object.entries(rule.declarations)) {
        value[prop] = propValue;
        source[prop] = layerName;
      }
    }
  }
  return { value, source };
}

test("gala-base's :focus-visible rule is the sole outline-style source for <select> and <a> under theme-fixture-full", async () => {
  const buildInput = await loadCanonicalBuildInput();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { readFile } = await import('node:fs/promises');
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      themeDirectory: path.join(
        import.meta.dirname,
        'fixtures/theme-fixture-full',
      ),
      provenance: testProvenance(),
    });

    const componentsAsset = manifest.assets.find((asset) =>
      asset.path.endsWith('assets/theme/components.css'),
    );
    const tokensAsset = manifest.assets.find((asset) =>
      asset.path.endsWith('assets/theme/tokens.css'),
    );
    assert.ok(
      componentsAsset,
      'the theme components.css manifest row must exist',
    );
    assert.ok(tokensAsset, 'the theme tokens.css manifest row must exist');
    const themeComponentsCss = await readFile(
      path.join(outputDirectory, componentsAsset.path),
      'utf8',
    );
    const themeTokensCss = await readFile(
      path.join(outputDirectory, tokensAsset.path),
      'utf8',
    );

    const layerBlocks = new Map([
      ...splitLayerBlocks(GALA_BASE_STYLESHEET_SOURCE),
      // A later `Map` entry for the same key overwrites the earlier one;
      // merge each stylesheet's own layer block in, since a real theme's
      // `tokens.css`/`components.css` each declare their own single layer.
      ...splitLayerBlocks(themeTokensCss),
      ...splitLayerBlocks(themeComponentsCss),
    ]);

    for (const tagName of ['select', 'a']) {
      const { value, source } = resolveFocusVisibleDeclarations(
        layerBlocks,
        tagName,
      );
      assert.equal(
        value['outline-style'],
        'solid',
        `<${tagName}>:focus-visible must resolve a real, paintable outline-style`,
      );
      assert.equal(
        source['outline-style'],
        'gala-base',
        `<${tagName}>:focus-visible's outline-style must be sourced from gala-base ` +
          `(theme-fixture-full's own components.css declares no focus/outline rule)`,
      );
    }
  } finally {
    await cleanup();
  }
});

test("gala-base's outline-style wins for a theme rule that sets only the other outline longhands, no matter how specific that theme selector is", () => {
  // A synthetic, deliberately high-specificity theme rule — the kind
  // `outline-color`/`outline-width` tokens are meant to be consumed
  // through — that never sets `outline-style` itself, exactly the pattern
  // `base-layer.js`'s own module documentation describes as safe.
  const syntheticThemeComponentsCss = `
    @layer gala-components {
      [data-gala-publication-root] select:focus-visible,
      [data-gala-publication-root] a:focus-visible {
        outline-color: red;
        outline-width: 5px;
      }
    }
  `;
  const layerBlocks = new Map([
    ...splitLayerBlocks(GALA_BASE_STYLESHEET_SOURCE),
    ...splitLayerBlocks(syntheticThemeComponentsCss),
  ]);

  for (const tagName of ['select', 'a']) {
    const { value, source } = resolveFocusVisibleDeclarations(
      layerBlocks,
      tagName,
    );
    // The theme's own, later, higher-specificity rule wins for the
    // properties it actually declares...
    assert.equal(value['outline-color'], 'red');
    assert.equal(source['outline-color'], 'gala-components');
    assert.equal(value['outline-width'], '5px');
    assert.equal(source['outline-width'], 'gala-components');
    // ...but gala-base still wins outline-style, because gala-components
    // never declares it here: cascade-layer precedence is resolved per
    // property, and specificity is never consulted between layers at all.
    assert.equal(value['outline-style'], 'solid');
    assert.equal(source['outline-style'], 'gala-base');
  }
});
