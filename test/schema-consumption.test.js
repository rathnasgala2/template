import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

test('package.json consumes @rathnasgala2/schemas per LOCAL-1', async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
  );
  assert.equal(
    packageJson.dependencies['@rathnasgala2/schemas'],
    'file:../../local-packages/rathnasgala2-schemas-2.8.0.tgz',
  );
});

test('package-lock.json pins @rathnasgala2/schemas version and integrity', async () => {
  const lock = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package-lock.json'), 'utf8'),
  );
  const entry = lock.packages['node_modules/@rathnasgala2/schemas'];
  assert.ok(entry, '@rathnasgala2/schemas must be present in the lockfile');
  assert.equal(entry.version, '2.8.0');
  assert.ok(
    typeof entry.integrity === 'string' && entry.integrity.length > 0,
    'the lockfile must record a resolved integrity hash for the tarball',
  );
});

test('@rathnasgala2/schemas resolves under Node 24 ESM and exposes its public API', async () => {
  const schemas = await import('@rathnasgala2/schemas');
  assert.ok(Array.isArray(schemas.GALA_SCHEMA_IDS));
  assert.ok(schemas.GALA_SCHEMA_IDS.length > 0);
  assert.equal(typeof schemas.validateGalaDocument, 'function');
});
