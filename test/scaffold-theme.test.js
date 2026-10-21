/**
 * TPL-M6 acceptance test: `scripts/scaffold-theme.mjs` writes a theme
 * package skeleton that passes this template's own conformance checks —
 * schema validation and `loadThemeAssets`'s full consume-time integrity
 * chain — with no further authoring required.
 */

import { strict as assert } from 'node:assert';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { TEMPLATE_STYLING_CONTRACT_TEMPLATE_VERSION } from '../src/core/internal/appearance/styling-contract.js';
import { loadThemeAssets } from '../src/core/internal/theme-assets.js';
import {
  ADMITTED_THEME_IDS,
  THEME_TOKEN_CATALOG,
  scaffoldTheme,
} from '../scripts/scaffold-theme.mjs';

test('scaffoldTheme writes a theme.json/tokens.css/components.css/print.css set that loadThemeAssets accepts', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'gala-theme-scaffold-'));
  try {
    const { files } = await scaffoldTheme({ destinationDirectory: dir });
    assert.deepEqual(
      new Set(files),
      new Set(['theme.json', 'tokens.css', 'components.css', 'print.css']),
    );

    const result = await loadThemeAssets({
      themeDirectory: dir,
      basePath: '/',
    });
    assert.equal(
      result.files.length,
      4,
      'one file per declared stylesheet plus the palette sheet',
    );
    assert.match(
      result.linkTagsHtml,
      /tokens\.css/,
      'the scaffolded tokens.css is linked',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scaffoldTheme declares every token in the closed 116-entry catalog, each with a light and dark value', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'gala-theme-scaffold-'));
  try {
    await scaffoldTheme({ destinationDirectory: dir });
    const themeJson = JSON.parse(
      await readFile(path.join(dir, 'theme.json'), 'utf8'),
    );
    assert.equal(themeJson.tokens.length, THEME_TOKEN_CATALOG.length);
    for (const { key } of THEME_TOKEN_CATALOG) {
      const row = themeJson.tokens.find((candidate) => candidate.key === key);
      assert.ok(row, `token ${key} is declared`);
      assert.equal(typeof row.light, 'string');
      assert.equal(typeof row.dark, 'string');
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scaffoldTheme rejects a themeId outside the schema-admitted set', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'gala-theme-scaffold-'));
  try {
    await assert.rejects(() =>
      scaffoldTheme({ destinationDirectory: dir, themeId: 'not-admitted' }),
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('every schema-admitted themeId scaffolds a conformant theme', async () => {
  for (const themeId of ADMITTED_THEME_IDS) {
    const dir = await mkdtemp(path.join(tmpdir(), 'gala-theme-scaffold-'));
    try {
      await scaffoldTheme({ destinationDirectory: dir, themeId });
      await loadThemeAssets({ themeDirectory: dir, basePath: '/' });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
});

test('a patch release of the renderer leaves the scaffolded templateRange at the contract-introducing version and still admitted', async () => {
  const root = path.resolve(import.meta.dirname, '..');
  const dir = await mkdtemp(path.join(tmpdir(), 'gala-theme-scaffold-'));
  try {
    // A fresh process whose renderer version is a hypothetical 4.4.1 (see
    // `test/helpers/renderer-version-override.mjs`): the scaffold and the
    // consume-time `templateRange` admission both run unmodified.
    const script = `
      const root = ${JSON.stringify(pathToFileURL(root).href + '/')};
      const { TEMPLATE_RENDERER_VERSION } = await import(root + 'src/core/internal/package-version.js');
      const { scaffoldTheme } = await import(root + 'scripts/scaffold-theme.mjs');
      const { loadThemeAssets } = await import(root + 'src/core/internal/theme-assets.js');
      const directory = process.env.GALA_SCAFFOLD_DIRECTORY;
      await scaffoldTheme({ destinationDirectory: directory });
      await loadThemeAssets({ themeDirectory: directory, basePath: '/' });
      process.stdout.write(TEMPLATE_RENDERER_VERSION);
    `;
    const { stdout } = await promisify(execFile)(
      process.execPath,
      [
        '--import',
        pathToFileURL(
          path.join(root, 'test/helpers/renderer-version-override.mjs'),
        ).href,
        '--input-type=module',
        '--eval',
        script,
      ],
      {
        env: {
          ...process.env,
          GALA_TEST_RENDERER_VERSION: '4.4.1',
          GALA_SCAFFOLD_DIRECTORY: dir,
        },
      },
    );
    assert.equal(stdout, '4.4.1', 'the child ran as renderer 4.4.1');
    const themeJson = JSON.parse(
      await readFile(path.join(dir, 'theme.json'), 'utf8'),
    );
    assert.equal(
      themeJson.templateRange,
      `^${TEMPLATE_STYLING_CONTRACT_TEMPLATE_VERSION}`,
    );
    assert.equal(themeJson.templateRange, '^4.4.0');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
