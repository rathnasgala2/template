import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

test('package.json pins the registry schemas release as a ^3.12.0 peer, installed from the peer range', async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
  );
  assert.equal(
    packageJson.devDependencies?.['@rathnasgala2/schemas'],
    undefined,
  );
  assert.equal(
    packageJson.peerDependencies['@rathnasgala2/schemas'],
    '^3.12.0',
  );
});

test('package-lock.json resolves schemas from the registry', async () => {
  const lock = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package-lock.json'), 'utf8'),
  );
  const entry = lock.packages['node_modules/@rathnasgala2/schemas'];
  assert.ok(entry, '@rathnasgala2/schemas must be present in the lockfile');
  assert.equal(entry.version, '3.12.0');
  assert.equal(
    entry.resolved,
    'https://registry.npmjs.org/@rathnasgala2/schemas/-/schemas-3.12.0.tgz',
  );
  assert.equal(entry.link, undefined);
  assert.match(entry.integrity, /^sha512-/u);
});

test('@rathnasgala2/schemas resolves under Node 24 ESM and exposes its public API', async () => {
  const schemas = await import('@rathnasgala2/schemas');
  assert.ok(Array.isArray(schemas.GALA_SCHEMA_IDS));
  assert.ok(schemas.GALA_SCHEMA_IDS.length > 0);
  assert.equal(typeof schemas.validateGalaDocument, 'function');
});
