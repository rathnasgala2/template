/**
 * TPL-M6 acceptance test: `scripts/scaffold-theme.mjs` writes a theme
 * package skeleton that passes this template's own conformance checks —
 * schema validation and `loadThemeAssets`'s full consume-time integrity
 * chain — with no further authoring required.
 */

import { strict as assert } from 'node:assert';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

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
    assert.equal(result.files.length, 3, 'one file per declared stylesheet');
    assert.match(
      result.linkTagsHtml,
      /tokens\.css/,
      'the scaffolded tokens.css is linked',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scaffoldTheme declares every token in the closed 35-entry catalog, each with a light and dark value', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'gala-theme-scaffold-'));
  try {
    await scaffoldTheme({ destinationDirectory: dir });
    const { readFile } = await import('node:fs/promises');
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
