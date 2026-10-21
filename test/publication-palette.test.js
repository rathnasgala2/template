/**
 * Template 4.1.0: every build that supplies a theme renders through the
 * publication palette. Covers theme admission (`THEME_PALETTE_MISSING`,
 * `THEME_PALETTE_INVALID`), the default palette (`{}`), presets from the
 * schemas package's golden vectors, the stress corpus's recorded failures
 * (`APPEARANCE_PALETTE_CONTRAST`), the sheet's name, SRI link and manifest
 * row, and the published styling contract's version and digest (pinned in the
 * final test).
 *
 * All palette mathematics is the schemas package's own
 * (`@rathnasgala2/schemas/palette`); these tests only assert what the
 * template does with its results.
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { ThemeAssetError } from '../src/core/errors.js';
import { renderPublication } from '../src/core/index.js';
import { buildTemplateStylingContract } from '../src/core/internal/appearance/styling-contract.js';
import { loadThemeAssets } from '../src/core/internal/theme-assets.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { loadCanonicalBuildInput } from './helpers/schema-fixtures.js';

const FIXTURE_THEME = fileURLToPath(
  new URL('./fixtures/theme-fixture-full', import.meta.url),
);
const SCHEMAS_PALETTE_DIRECTORY = path.join(
  path.dirname(
    fileURLToPath(import.meta.resolve('@rathnasgala2/schemas/package.json')),
  ),
  'parity',
  'palette',
);

/**
 * @param {string} name file in the schemas package's palette parity directory
 * @returns {Promise<any>} the parsed JSON
 */
async function readPaletteJson(name) {
  return JSON.parse(
    await readFile(path.join(SCHEMAS_PALETTE_DIRECTORY, name), 'utf8'),
  );
}

/**
 * @param {(theme: Record<string, any>) => void} mutate edits the parsed theme.json
 * @returns {Promise<string>} a fresh copy of the fixture theme, edited
 */
async function themeCopy(mutate) {
  const dir = await mkdtemp(path.join(tmpdir(), 'gala-palette-theme-'));
  await cp(FIXTURE_THEME, dir, { recursive: true });
  const file = path.join(dir, 'theme.json');
  const theme = JSON.parse(await readFile(file, 'utf8'));
  mutate(theme);
  await writeFile(file, JSON.stringify(theme));
  return dir;
}

/**
 * @param {string} css the palette sheet
 * @param {'light' | 'dark'} mode which resolved block
 * @returns {Record<string, string>} `--gala-` declarations of that block
 */
function resolvedBlock(css, mode) {
  const opening = `[data-gala-publication-root][data-gala-resolved-color-mode="${mode}"] {`;
  const start = css.indexOf(opening);
  assert.ok(start >= 0, `the ${mode} resolved block exists`);
  const end = css.indexOf('}', start);
  return Object.fromEntries(
    [
      ...css
        .slice(start + opening.length, end)
        .matchAll(/--gala-([a-z0-9-]+): ([^;]+);/g),
    ].map((match) => [match[1], match[2]]),
  );
}

/**
 * @param {Record<string, unknown>} tokens `appearance.tokens`
 * @returns {Promise<string>} the palette sheet text for the fixture theme
 */
async function sheetFor(tokens) {
  const result = await loadThemeAssets({
    themeDirectory: FIXTURE_THEME,
    basePath: '/',
    appearanceTokens: tokens,
  });
  const file = result.files.find((candidate) =>
    /gala-palette-[0-9a-f]{12}\.css$/.test(candidate.path),
  );
  assert.ok(file, 'a palette sheet is written');
  return file.bytes.toString('utf8');
}

/**
 * @param {Promise<unknown>} promise expected to be refused
 * @returns {Promise<ThemeAssetError>} the refusal
 */
async function refusal(promise) {
  try {
    await promise;
  } catch (error) {
    assert.ok(error instanceof ThemeAssetError, String(error));
    return error;
  }
  assert.fail('expected a ThemeAssetError');
}

test('a theme whose theme.json has no palette is refused with THEME_PALETTE_MISSING', async () => {
  const dir = await themeCopy((theme) => {
    delete theme.palette;
  });
  try {
    const error = await refusal(
      loadThemeAssets({ themeDirectory: dir, basePath: '/' }),
    );
    assert.equal(error.reasonCode, 'THEME_PALETTE_MISSING');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a theme with a malformed palette block is refused with THEME_PALETTE_INVALID', async () => {
  const wrongLength = await themeCopy((theme) => {
    theme.palette.follow[1].light = ['accent', 'accent', 'accent'];
  });
  const unknownKey = await themeCopy((theme) => {
    theme.palette.follow[0].key = 'color-danger';
  });
  try {
    for (const dir of [wrongLength, unknownKey]) {
      const error = await refusal(
        loadThemeAssets({ themeDirectory: dir, basePath: '/' }),
      );
      assert.equal(error.reasonCode, 'THEME_PALETTE_INVALID');
    }
  } finally {
    await rm(wrongLength, { recursive: true, force: true });
    await rm(unknownKey, { recursive: true, force: true });
  }
});

test('a malformed appearance.tokens is refused with APPEARANCE_PALETTE_INVALID', async () => {
  const error = await refusal(
    sheetFor({ accent: { light: '#FF0000', dark: '#ff6655' } }),
  );
  assert.equal(error.reasonCode, 'APPEARANCE_PALETTE_INVALID');
});

test('the default palette ({} or absent) writes the theme literals for every bound token', async () => {
  const fixture = await readPaletteJson('theme-default.fixture.json');
  const bound = fixture.palette.follow.map((entry) => entry.key);
  const literal = (/** @type {string} */ key) =>
    fixture.tokens.find((row) => row.key === key);
  const sheet = await sheetFor({});
  const light = resolvedBlock(sheet, 'light');
  const dark = resolvedBlock(sheet, 'dark');
  assert.deepEqual(Object.keys(light).sort(), [...bound].sort());
  for (const key of bound) {
    assert.equal(light[key], literal(key).light, `${key} light`);
    assert.equal(dark[key], literal(key).dark, `${key} dark`);
  }
  assert.equal(await sheetFor(undefined), sheet, 'absent tokens equal {}');
  // Four blocks inside the tokens layer; tokens the palette does not drive
  // are never declared.
  assert.ok(sheet.startsWith('@layer gala-tokens {\n'));
  assert.equal(
    sheet.match(/\{\n/g)?.length,
    6,
    'layer, four blocks and the media wrapper',
  );
  assert.ok(sheet.includes('@media (prefers-color-scheme: dark)'));
  assert.ok(!sheet.includes('--gala-color-danger'));
});

test('golden vectors: presets build to the derived values; recorded failures are refused with their pair', async () => {
  const golden = await readPaletteJson('golden-vectors.json');
  assert.ok(golden.cases.length >= 10);
  for (const vector of golden.cases) {
    const { light, dark } = vector.expected.failures;
    if (light.length === 0 && dark.length === 0) {
      const sheet = await sheetFor(vector.tokens);
      const sheetLight = resolvedBlock(sheet, 'light');
      const sheetDark = resolvedBlock(sheet, 'dark');
      for (const [key, pair] of Object.entries(vector.expected.bound)) {
        assert.equal(sheetLight[key], pair.light, `${vector.id} ${key} light`);
        assert.equal(sheetDark[key], pair.dark, `${vector.id} ${key} dark`);
      }
    } else {
      const error = await refusal(sheetFor(vector.tokens));
      assert.equal(error.reasonCode, 'APPEARANCE_PALETTE_CONTRAST', vector.id);
      const mode = light.length > 0 ? 'light' : 'dark';
      assert.equal(error.detail?.mode, mode);
      assert.equal(error.detail?.pair, (light.length > 0 ? light : dark)[0]);
    }
  }
});

test('stress corpus: every recorded failure is refused naming the recorded pair and mode', async () => {
  const corpus = await readPaletteJson('stress-corpus.json');
  let refused = 0;
  for (const palette of corpus.palettes) {
    const { light, dark } = palette.expectedFailures;
    if (light.length === 0 && dark.length === 0) {
      await sheetFor(palette.tokens);
      continue;
    }
    const error = await refusal(sheetFor(palette.tokens));
    refused += 1;
    assert.equal(error.reasonCode, 'APPEARANCE_PALETTE_CONTRAST', palette.id);
    const mode = light.length > 0 ? 'light' : 'dark';
    const expected = mode === 'light' ? light : dark;
    assert.equal(error.detail?.mode, mode, palette.id);
    assert.deepEqual(
      /** @type {{pair: string}[]} */ (error.detail?.['failures'] ?? [])
        .map((failure) => failure.pair)
        .sort(),
      [...expected].sort(),
      palette.id,
    );
    assert.ok(error.message.includes(String(error.detail?.pair)));
    assert.ok(error.message.includes(`${mode} mode`));
  }
  assert.ok(refused > 0, 'the corpus records at least one failure');
});

test('the build links the palette sheet once, after the theme links, with SRI, and lists it in the manifest', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const picks = (await readPaletteJson('golden-vectors.json')).cases.find(
    (/** @type {{id: string}} */ vector) => vector.id === 'midnight',
  );
  buildInput.appearance.tokens = picks.tokens;
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      themeDirectory: FIXTURE_THEME,
      provenance: testProvenance(),
    });
    const sheetRows = manifest.assets.filter((asset) =>
      /(^|\/)assets\/gala-palette-[0-9a-f]{12}\.css$/.test(asset.path),
    );
    assert.equal(sheetRows.length, 1, 'one palette sheet in the manifest');
    const row = sheetRows[0];
    const bytes = await readFile(path.join(outputDirectory, row.path));
    const hex = createHash('sha256').update(bytes).digest('hex');
    assert.ok(row.path.endsWith(`assets/gala-palette-${hex.slice(0, 12)}.css`));
    assert.equal(row.sha256, `sha256:${hex}`);
    assert.equal(row.byteLength, String(bytes.byteLength));
    assert.equal(row.mediaType, 'text/css; charset=utf-8');
    assert.ok(bytes.byteLength <= 16384);

    const integrity = `sha256-${createHash('sha256').update(bytes).digest('base64')}`;
    for (const route of manifest.routes.filter(
      (candidate) =>
        candidate.routeClass === 'html' || candidate.routeClass === 'error',
    )) {
      const html = await readFile(
        path.join(outputDirectory, route.path),
        'utf8',
      );
      const links = [...html.matchAll(/<link rel="stylesheet"[^>]*>/g)].map(
        (match) => match[0],
      );
      const palette = links.filter((link) => link.includes('gala-palette-'));
      assert.equal(
        palette.length,
        1,
        `${route.path}: exactly one palette link`,
      );
      assert.ok(palette[0].includes(`href="/${row.path}"`));
      assert.ok(palette[0].includes(`integrity="${integrity}"`));
      assert.ok(palette[0].includes('crossorigin="anonymous"'));
      assert.equal(
        links.at(-1),
        palette[0],
        `${route.path}: the palette link follows every theme stylesheet`,
      );
      assert.ok(!/<style[\s>]/.test(html), 'no inline style (CSP)');
    }
    // The picked colours reach the sheet.
    const sheet = bytes.toString('utf8');
    assert.equal(
      resolvedBlock(sheet, 'light')['color-accent'],
      picks.tokens.accent.light,
    );
    assert.equal(
      resolvedBlock(sheet, 'dark')['color-canvas'],
      picks.tokens.canvas.dark,
    );
  } finally {
    await cleanup();
  }
});

test('sites on the same theme and palette share identical palette sheet bytes', async () => {
  assert.equal(await sheetFor({}), await sheetFor({}));
  assert.notEqual(
    await sheetFor({}),
    await sheetFor({ accent: { light: '#1f4fd1', dark: '#7b97ff' } }),
  );
});

test('the published styling contract is 4.1.0 at template 4.4.0, with its pinned digest', () => {
  const contract = buildTemplateStylingContract();
  assert.equal(contract.contractVersion, '4.1.0');
  assert.equal(contract.templateVersion, '4.4.0');
  assert.equal(
    contract.catalogDigest,
    'sha256:4afdcb555d21fc205ab332a9e8996a09e1eb607053353c399eb070d0f0525f29',
  );
});
