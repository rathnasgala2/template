import { strict as assert } from 'node:assert';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

/**
 * Recursively list every file path under `root`, relative to `root`.
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

test('src/ contains no src/modules/ directory', async () => {
  await assert.rejects(() => stat(path.join(REPO_ROOT, 'src', 'modules')), {
    code: 'ENOENT',
  });
});

test('src/ has exactly one source root, src/core/', async () => {
  const srcEntries = await readdir(path.join(REPO_ROOT, 'src'), {
    withFileTypes: true,
  });
  const directories = srcEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  assert.deepEqual(directories, ['core']);
});

test('no file under src/ or package.json mentions a module-tree path', async () => {
  const files = await listFiles(path.join(REPO_ROOT, 'src'));
  for (const relativePath of files) {
    assert.ok(
      !/[\\/]modules[\\/]/.test(relativePath) &&
        !relativePath.startsWith('modules/'),
      `${relativePath}: looks like it belongs to an admitted module tree`,
    );
  }
});

test('package.json declares no interactions/whitelabel/newsletter/prism module package', async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
  );
  const forbidden = ['interactions', 'whitelabel', 'newsletter', 'prism'];
  const declared = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  for (const name of Object.keys(declared)) {
    for (const term of forbidden) {
      assert.ok(
        !name.toLowerCase().includes(term),
        `${name}: forbidden MVP-deferred module boundary declared (brief S2 section 1)`,
      );
    }
  }
});
