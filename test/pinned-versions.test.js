import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

const EXACT_PINS = {
  '@11ty/eleventy': '3.1.6',
  '@11ty/eleventy-plugin-syntaxhighlight': '5.0.2',
  'markdown-it': '14.3.1',
  'sanitize-html': '2.17.7',
  // S2-T05's media pipeline decoder/encoder, pinned per its own module
  // documentation (src/core/internal/media/jpeg-codec.js): a
  // dependency-free, pure-JavaScript baseline JPEG codec, no native addon
  // or WebAssembly.
  'jpeg-js': '0.4.4',
};

test('package.json pins the exact S2 dependency versions', async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
  );
  for (const [name, version] of Object.entries(EXACT_PINS)) {
    assert.equal(
      packageJson.dependencies[name],
      version,
      `${name} must be pinned to exactly ${version}`,
    );
  }
});

test('package.json pins the exact Node and npm toolchain', async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
  );
  assert.equal(packageJson.engines.node, '24.18.0');
  assert.equal(packageJson.engines.npm, '11.16.0');
});

test('package-lock.json is lockfile v3 and resolves the exact pinned versions', async () => {
  const lock = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package-lock.json'), 'utf8'),
  );
  assert.equal(lock.lockfileVersion, 3);
  const rootDependencies = lock.packages[''].dependencies;
  for (const [name, version] of Object.entries(EXACT_PINS)) {
    assert.equal(rootDependencies[name], version);
  }
  const installedEleventy = lock.packages['node_modules/@11ty/eleventy'];
  assert.ok(installedEleventy, 'Eleventy must be present in the lockfile');
  assert.equal(installedEleventy.version, EXACT_PINS['@11ty/eleventy']);
});

test('package.json declares no bin named gala', async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
  );
  assert.equal(packageJson.bin, undefined);
});

test('package.json declares only the documented default-free entry point', async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
  );
  assert.equal(packageJson.exports['.'].import, './src/core/index.js');
  assert.equal(packageJson.type, 'module');
});
