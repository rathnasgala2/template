import { strict as assert } from 'node:assert';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

/**
 * Recursively list every file path under `root`, relative to the repo root.
 *
 * @param {string} root directory to walk
 * @returns {Promise<string[]>} relative file paths, order not significant
 */
async function listFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(root, entry.name);
      if (entry.isDirectory()) return listFiles(entryPath);
      return [path.relative(REPO_ROOT, entryPath)];
    }),
  );
  return files.flat();
}

test('src/core and src/modules/interactions are the only source roots', async () => {
  const srcEntries = await readdir(path.join(REPO_ROOT, 'src'), {
    withFileTypes: true,
  });
  assert.deepEqual(
    srcEntries.filter((e) => e.isDirectory()).map((e) => e.name),
    ['core', 'modules'],
  );
  const moduleEntries = await readdir(path.join(REPO_ROOT, 'src', 'modules'), {
    withFileTypes: true,
  });
  assert.deepEqual(
    moduleEntries.map((e) => e.name),
    ['interactions'],
  );
  for (const entry of srcEntries.filter((e) => e.isFile())) {
    assert.fail(`src/${entry.name}: stray file outside a source root`);
  }
});

test('src/core never imports from src/modules', async () => {
  const files = await listFiles(path.join(REPO_ROOT, 'src', 'core'));
  const importsModules =
    /^\s*(?:import|export)\b[^;]*['"][^'"]*\/modules\/|\bimport\(\s*['"][^'"]*\/modules\//m;
  for (const relativePath of files.filter((f) => f.endsWith('.js'))) {
    const source = await readFile(path.join(REPO_ROOT, relativePath), 'utf8');
    assert.ok(
      !importsModules.test(source),
      `${relativePath}: imports from src/modules/ (the browser script is read as data only)`,
    );
  }
});

test('the dependency-cruiser and ESLint gates state the same rule', async () => {
  const cruiser = await readFile(
    path.join(REPO_ROOT, '.dependency-cruiser.cjs'),
    'utf8',
  );
  assert.match(cruiser, /only-core-and-interactions-are-source-roots/);
  assert.match(cruiser, /core-never-imports-modules/);
  const eslint = await readFile(
    path.join(REPO_ROOT, 'eslint.config.js'),
    'utf8',
  );
  assert.match(eslint, /files: \['src\/core\/\*\*\/\*\.js'\]/);
  assert.match(eslint, /no-restricted-imports/);
});

test('the published package ships src/modules and still declares no other module package', async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
  );
  assert.ok(packageJson.files.includes('src/modules/'));
  assert.ok(packageJson.files.includes('src/core/'));
  assert.match(packageJson.scripts.typecheck, /tsconfig\.modules\.json/);
  const forbidden = ['interactions', 'whitelabel', 'newsletter', 'prism'];
  const declared = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  for (const name of Object.keys(declared)) {
    for (const term of forbidden) {
      assert.ok(
        !name.toLowerCase().includes(term),
        `${name}: a module must not be a separate package`,
      );
    }
  }
});
