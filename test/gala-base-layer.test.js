/**
 * TPL-H2/TPL-H3/TPL-M7 acceptance tests: contract 2.1.0 publishes a closed
 * pseudo-class catalog, and every rendered page carries a template-owned
 * `gala-base` stylesheet, linked before any theme stylesheet, whose own
 * first line declares the fixed cascade-layer order.
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import {
  FUNCTIONAL_PSEUDO_KEYWORD_ARGUMENTS,
  ORDERED_LAYERS,
  PSEUDO_CLASSES,
  buildTemplateStylingContract,
} from '../src/core/internal/appearance/styling-contract.js';
import {
  GALA_BASE_STYLESHEET_PATH,
  GALA_BASE_STYLESHEET_SOURCE,
} from '../src/core/internal/appearance/base-layer.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { loadCanonicalBuildInput } from './helpers/schema-fixtures.js';

test('contract 2.1.0 publishes the closed five-member pseudo-class catalog', () => {
  const contract = buildTemplateStylingContract();
  assert.deepEqual(contract.pseudoClasses, [...PSEUDO_CLASSES]);
  assert.deepEqual(
    [...PSEUDO_CLASSES].sort(),
    ['active', 'disabled', 'focus-visible', 'hover', 'visited'].sort(),
  );
  assert.deepEqual(contract.composition.functionalPseudoKeywordArguments, [
    ...FUNCTIONAL_PSEUDO_KEYWORD_ARGUMENTS,
  ]);
  assert.equal(contract.contractVersion, '2.1.0');
});

test('the gala-base stylesheet source declares the fixed layer order as its own first line', () => {
  assert.equal(
    GALA_BASE_STYLESHEET_SOURCE.startsWith(
      `@layer ${ORDERED_LAYERS.join(', ')};`,
    ),
    true,
  );
  assert.equal(ORDERED_LAYERS[0], 'gala-base');
});

test('every rendered page links the gala-base stylesheet before any theme stylesheet, and the file exists', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      themeDirectory: path.resolve(
        import.meta.dirname,
        'fixtures/theme-fixture-full',
      ),
      provenance: testProvenance(),
    });
    const route = manifest.routes.find((r) => r.routeClass === 'html');
    const html = await readFile(path.join(outputDirectory, route.path), 'utf8');

    const baseIndex = html.indexOf('gala-base-v1.css');
    const themeIndex = html.indexOf('assets/theme/tokens.css');
    assert.ok(baseIndex !== -1, 'gala-base stylesheet link must be present');
    assert.ok(themeIndex !== -1, 'theme stylesheet link must be present');
    assert.ok(
      baseIndex < themeIndex,
      'gala-base <link> must precede every theme <link>',
    );

    const baseAsset = manifest.assets.find((a) =>
      a.path.endsWith(GALA_BASE_STYLESHEET_PATH),
    );
    assert.ok(baseAsset, 'gala-base manifest asset row must exist');
    const bytes = await readFile(path.join(outputDirectory, baseAsset.path));
    assert.equal(bytes.toString('utf8'), GALA_BASE_STYLESHEET_SOURCE);
  } finally {
    await cleanup();
  }
});

test('the gala-base stylesheet sets a real, paintable focus ring (outline-style, not just color/width)', () => {
  assert.match(
    GALA_BASE_STYLESHEET_SOURCE,
    /:focus-visible\s*\{[^}]*outline-style:\s*solid/,
  );
});
