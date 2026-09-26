/**
 * TPL-C2 acceptance tests: theme-declared passive assets are sniffed,
 * allowlisted, budget-capped and digest-verified before they are copied into
 * a published artifact, and a theme SVG is admitted only after it survives
 * the closed sanitization grammar (TPL-H6's iconography mechanism).
 */

import { strict as assert } from 'node:assert';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { ThemeAssetError } from '../src/core/errors.js';
import { loadThemeAssets } from '../src/core/internal/theme-assets.js';
import { digestBytes } from '../src/core/internal/canonical-jcs.js';
import { sanitizeThemeSvg } from '../src/core/internal/media/theme-svg-sanitizer.js';
import { buildValidThemeJson } from './helpers/theme-contract-fixtures.js';

const STYLESHEET_FILES = [
  {
    path: 'tokens.css',
    mediaType: 'text/css',
    text: '@layer gala-tokens {\n}\n',
  },
  {
    path: 'components.css',
    mediaType: 'text/css',
    text: '@layer gala-components {\n}\n',
  },
  {
    path: 'print.css',
    mediaType: 'text/css',
    text: '@layer gala-print {\n}\n',
  },
];

/**
 * @returns {Promise<string>} a fresh minimal theme directory (three
 *   stylesheets, no `utilities.css`), with no `theme.json` written yet
 */
async function buildThemeDirectory() {
  const dir = await mkdtemp(path.join(tmpdir(), 'gala-theme-passive-'));
  for (const file of STYLESHEET_FILES) {
    await writeFile(path.join(dir, file.path), file.text);
  }
  return dir;
}

/**
 * Write a fully `theme-contract:2.0.0`-conformant `theme.json` (TPL-H1),
 * whose passive-asset rows are exactly the caller-supplied ones (verbatim,
 * so a deliberately wrong `byteLength`/`sha256`/`mediaType` reaches this
 * module's own TPL-C2 checks rather than being computed away).
 *
 * @param {string} dir the theme directory (from {@link buildThemeDirectory})
 * @param {readonly {path: string, mediaType: string, byteLength?: string, sha256?: string, license?: string}[]} assetsField
 *   the declared passive-asset rows, verbatim
 * @param {Record<string, unknown>} [budgets]
 * @returns {Promise<void>}
 */
async function writeThemeJson(dir, assetsField, budgets) {
  const themeJson = buildValidThemeJson({
    stylesheets: STYLESHEET_FILES.map((f) => f.path),
    cssLayers: ['gala-tokens', 'gala-components', 'gala-print'],
    files: STYLESHEET_FILES.map((f) => ({
      path: f.path,
      mediaType: f.mediaType,
      bytes: Buffer.from(f.text, 'utf8'),
    })),
  });
  themeJson.assets = [
    ...themeJson.assets,
    ...assetsField.map((asset) => ({ license: 'MIT', ...asset })),
  ];
  if (budgets) themeJson.budgets = budgets;
  await writeFile(path.join(dir, 'theme.json'), JSON.stringify(themeJson));
}

const PNG_1X1 = Buffer.from(
  '89504e470d0a1a0a0000000d494844520000000100000001080600000' +
    '01f15c4890000000a49444154789c6360000002000105ed10ac0000000049454e44ae426082',
  'hex',
);

test('a passive asset with a mismatched declared sha256 is rejected', async () => {
  const dir = await buildThemeDirectory();
  try {
    await mkdir(path.join(dir, 'assets'), { recursive: true });
    await writeFile(path.join(dir, 'assets', 'mark.png'), PNG_1X1);
    await writeThemeJson(dir, [
      {
        path: 'assets/mark.png',
        mediaType: 'image/png',
        byteLength: String(PNG_1X1.byteLength),
        sha256: `sha256:${'0'.repeat(64)}`,
      },
    ]);
    await assert.rejects(
      () => loadThemeAssets({ themeDirectory: dir, basePath: '/' }),
      (error) =>
        error instanceof ThemeAssetError &&
        error.reasonCode === 'THEME_ASSET_DIGEST_MISMATCH',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a passive asset with a mismatched declared byteLength is rejected', async () => {
  const dir = await buildThemeDirectory();
  try {
    await mkdir(path.join(dir, 'assets'), { recursive: true });
    await writeFile(path.join(dir, 'assets', 'mark.png'), PNG_1X1);
    await writeThemeJson(dir, [
      {
        path: 'assets/mark.png',
        mediaType: 'image/png',
        byteLength: '1',
        sha256: digestBytes(PNG_1X1),
      },
    ]);
    await assert.rejects(
      () => loadThemeAssets({ themeDirectory: dir, basePath: '/' }),
      (error) =>
        error instanceof ThemeAssetError &&
        error.reasonCode === 'THEME_ASSET_DIGEST_MISMATCH',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a passive asset whose bytes do not sniff as an admitted format is rejected regardless of its declared mediaType', async () => {
  const dir = await buildThemeDirectory();
  try {
    const bytes = Buffer.from('not actually an image', 'utf8');
    await mkdir(path.join(dir, 'assets'), { recursive: true });
    await writeFile(path.join(dir, 'assets', 'mark.png'), bytes);
    await writeThemeJson(dir, [
      {
        path: 'assets/mark.png',
        mediaType: 'image/png',
        byteLength: String(bytes.byteLength),
        sha256: digestBytes(bytes),
      },
    ]);
    await assert.rejects(
      () => loadThemeAssets({ themeDirectory: dir, basePath: '/' }),
      (error) =>
        error instanceof ThemeAssetError &&
        error.reasonCode === 'THEME_ASSET_FORMAT_INVALID',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a passive asset exceeding budgets.maximumFileBytes is rejected', async () => {
  const dir = await buildThemeDirectory();
  try {
    await mkdir(path.join(dir, 'assets'), { recursive: true });
    await writeFile(path.join(dir, 'assets', 'mark.png'), PNG_1X1);
    await writeThemeJson(
      dir,
      [
        {
          path: 'assets/mark.png',
          mediaType: 'image/png',
          byteLength: String(PNG_1X1.byteLength),
          sha256: digestBytes(PNG_1X1),
        },
      ],
      { maximumFileBytes: '4', maximumTotalBytes: '4096', maximumFiles: 8 },
    );
    await assert.rejects(
      () => loadThemeAssets({ themeDirectory: dir, basePath: '/' }),
      (error) =>
        error instanceof ThemeAssetError &&
        error.reasonCode === 'THEME_ASSET_BUDGET_EXCEEDED',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('declaring more passive assets than budgets.maximumFiles is rejected', async () => {
  const dir = await buildThemeDirectory();
  try {
    await mkdir(path.join(dir, 'assets'), { recursive: true });
    await writeFile(path.join(dir, 'assets', 'mark.png'), PNG_1X1);
    await writeFile(path.join(dir, 'assets', 'mark-2.png'), PNG_1X1);
    await writeThemeJson(
      dir,
      [
        {
          path: 'assets/mark.png',
          mediaType: 'image/png',
          byteLength: String(PNG_1X1.byteLength),
          sha256: digestBytes(PNG_1X1),
        },
        {
          path: 'assets/mark-2.png',
          mediaType: 'image/png',
          byteLength: String(PNG_1X1.byteLength),
          sha256: digestBytes(PNG_1X1),
        },
      ],
      // budgets.maximumFiles has a schema-enforced minimum of 1; this test
      // exercises this module's own enforcement by declaring two passive
      // assets against a budget of one, not by declaring an out-of-range
      // budget value (a separate, schema-level rejection).
      { maximumFileBytes: '4096', maximumTotalBytes: '4096', maximumFiles: 1 },
    );
    await assert.rejects(
      () => loadThemeAssets({ themeDirectory: dir, basePath: '/' }),
      (error) =>
        error instanceof ThemeAssetError &&
        error.reasonCode === 'THEME_ASSET_BUDGET_EXCEEDED',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a valid passive PNG is admitted with its sniffed mediaType, independent of a wrong declared mediaType', async () => {
  const dir = await buildThemeDirectory();
  try {
    await mkdir(path.join(dir, 'assets'), { recursive: true });
    await writeFile(path.join(dir, 'assets', 'mark.png'), PNG_1X1);
    await writeThemeJson(dir, [
      {
        path: 'assets/mark.png',
        mediaType: 'image/svg+xml',
        byteLength: String(PNG_1X1.byteLength),
        sha256: digestBytes(PNG_1X1),
      },
    ]);
    const result = await loadThemeAssets({
      themeDirectory: dir,
      basePath: '/',
    });
    const asset = result.assets.find((a) => a.path.endsWith('mark.png'));
    assert.ok(asset);
    assert.equal(asset.mediaType, 'image/png');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// --- sanitizeThemeSvg unit coverage ---

test('a clean icon SVG survives sanitization unchanged in structure', () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
    '<path d="M0 0h16v16H0z" fill="currentColor"/></svg>';
  const sanitized = sanitizeThemeSvg(Buffer.from(svg, 'utf8')).toString('utf8');
  assert.match(sanitized, /<svg[^>]*>/);
  assert.match(sanitized, /<path/);
});

test('an SVG carrying a <script> element is rejected', () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
  assert.throws(
    () => sanitizeThemeSvg(Buffer.from(svg, 'utf8')),
    (error) => error instanceof ThemeAssetError,
  );
});

test('an SVG carrying an onload event-handler attribute is rejected', () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>';
  assert.throws(
    () => sanitizeThemeSvg(Buffer.from(svg, 'utf8')),
    (error) => error instanceof ThemeAssetError,
  );
});

test('an SVG <use> referencing an external URL is rejected', () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg">' +
    '<use href="https://evil.example/sprite.svg#icon"/></svg>';
  assert.throws(
    () => sanitizeThemeSvg(Buffer.from(svg, 'utf8')),
    (error) => error instanceof ThemeAssetError,
  );
});

test('an SVG <use> referencing a same-document fragment is admitted', () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg">' +
    '<defs><symbol id="icon"><path d="M0 0h1v1H0z"/></symbol></defs>' +
    '<use href="#icon"/></svg>';
  const sanitized = sanitizeThemeSvg(Buffer.from(svg, 'utf8')).toString('utf8');
  assert.match(sanitized, /href="#icon"/);
});

test('an SVG carrying a <foreignObject> is rejected', () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg">' +
    '<foreignObject><div>x</div></foreignObject></svg>';
  assert.throws(
    () => sanitizeThemeSvg(Buffer.from(svg, 'utf8')),
    (error) => error instanceof ThemeAssetError,
  );
});
