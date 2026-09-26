/**
 * TPL-H1 acceptance tests: a consumed theme package's own `theme.json` is
 * schema-validated against `urn:gala:schema:theme-contract:2.0.0`, and its
 * digest chain / version negotiation is load-bearing, not parsed and
 * ignored.
 */

import { strict as assert } from 'node:assert';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { ThemeAssetError } from '../src/core/errors.js';
import { loadThemeAssets } from '../src/core/internal/theme-assets.js';
import { satisfiesTemplateRange } from '../src/core/internal/semver-range.js';
import { buildValidThemeJson } from './helpers/theme-contract-fixtures.js';

const STYLESHEET_FILES = [
  { path: 'tokens.css', text: '@layer gala-tokens {\n}\n' },
  { path: 'components.css', text: '@layer gala-components {\n}\n' },
  { path: 'print.css', text: '@layer gala-print {\n}\n' },
];

/**
 * @param {Record<string, unknown>} overrides applied to the otherwise-valid
 *   `theme.json` this builds
 * @returns {Promise<string>} a fresh theme directory
 */
async function buildThemeDirectory(overrides) {
  const dir = await mkdtemp(path.join(tmpdir(), 'gala-theme-integrity-'));
  for (const file of STYLESHEET_FILES) {
    await writeFile(path.join(dir, file.path), file.text);
  }
  const themeJson = buildValidThemeJson({
    stylesheets: STYLESHEET_FILES.map((f) => f.path),
    cssLayers: ['gala-tokens', 'gala-components', 'gala-print'],
    files: STYLESHEET_FILES.map((f) => ({
      path: f.path,
      mediaType: 'text/css',
      bytes: Buffer.from(f.text, 'utf8'),
    })),
    overrides,
  });
  await writeFile(path.join(dir, 'theme.json'), JSON.stringify(themeJson));
  return dir;
}

/**
 * @param {string} dir
 * @param {string} reasonCode
 * @returns {Promise<void>}
 */
async function assertRejectsWithReason(dir, reasonCode) {
  try {
    await assert.rejects(
      () => loadThemeAssets({ themeDirectory: dir, basePath: '/' }),
      (error) =>
        error instanceof ThemeAssetError && error.reasonCode === reasonCode,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test('theme.json failing urn:gala:schema:theme-contract:2.0.0 validation is rejected', async () => {
  const dir = await buildThemeDirectory({
    browserPolicyRef: 'not-the-fixed-value',
  });
  await assertRejectsWithReason(dir, 'THEME_CONTRACT_SCHEMA_INVALID');
});

test('a contractVersion that does not match the published styling contract is rejected', async () => {
  const dir = await buildThemeDirectory({ contractVersion: '9.9.9' });
  await assertRejectsWithReason(dir, 'THEME_CONTRACT_VERSION_MISMATCH');
});

test('a stylingContractDigest that does not match the published catalogDigest is rejected', async () => {
  const dir = await buildThemeDirectory({
    stylingContractDigest: `sha256:${'f'.repeat(64)}`,
  });
  await assertRejectsWithReason(dir, 'THEME_CONTRACT_VERSION_MISMATCH');
});

test("a templateRange that does not admit this renderer's own version is rejected", async () => {
  const dir = await buildThemeDirectory({ templateRange: '^3.0.0' });
  await assertRejectsWithReason(dir, 'THEME_CONTRACT_VERSION_MISMATCH');
});

test('a well-formed but unsupported templateRange syntax is rejected, not silently admitted', async () => {
  const dir = await buildThemeDirectory({ templateRange: '>=2.0.0 <3.0.0' });
  await assertRejectsWithReason(dir, 'THEME_CONTRACT_VERSION_MISMATCH');
});

test('a fully valid, digest-consistent theme.json is accepted', async () => {
  const dir = await buildThemeDirectory({});
  try {
    const result = await loadThemeAssets({
      themeDirectory: dir,
      basePath: '/',
    });
    assert.equal(result.files.length, 3);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// --- satisfiesTemplateRange unit coverage ---

test('satisfiesTemplateRange: an exact version range matches only that version', () => {
  assert.equal(satisfiesTemplateRange('2.0.0', '2.0.0'), true);
  assert.equal(satisfiesTemplateRange('2.0.1', '2.0.0'), false);
});

test('satisfiesTemplateRange: a caret range admits the same major, >= the given version', () => {
  assert.equal(satisfiesTemplateRange('2.0.0', '^2.0.0'), true);
  assert.equal(satisfiesTemplateRange('2.5.3', '^2.0.0'), true);
  assert.equal(satisfiesTemplateRange('1.9.9', '^2.0.0'), false);
  assert.equal(satisfiesTemplateRange('3.0.0', '^2.0.0'), false);
});

test('satisfiesTemplateRange: an unsupported range syntax throws rather than silently admitting', () => {
  assert.throws(() => satisfiesTemplateRange('2.0.0', '>=2.0.0 <3.0.0'));
  assert.throws(() => satisfiesTemplateRange('2.0.0', '*'));
});
