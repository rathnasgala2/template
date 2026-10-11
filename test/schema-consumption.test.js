import { strict as assert } from 'node:assert';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { collectVendoredSchemaDiagnostics } from '../scripts/check-vendored-schema.mjs';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const SCHEMA_INSTALL_PATH = path.join(
  REPO_ROOT,
  'node_modules/@rathnasgala2/schemas',
);

/**
 * @returns {Promise<Parameters<typeof collectVendoredSchemaDiagnostics>[0]>}
 *   current checked-in and installed vendor state
 */
async function readVendorState() {
  const [manifest, packageJson, packageLock, archive, installedPackage] =
    await Promise.all([
      readFile(path.join(REPO_ROOT, 'vendor/schema-manifest.json'), 'utf8'),
      readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
      readFile(path.join(REPO_ROOT, 'package-lock.json'), 'utf8'),
      readFile(path.join(REPO_ROOT, 'vendor/rathnasgala2-schemas-3.8.0.tgz')),
      readFile(path.join(SCHEMA_INSTALL_PATH, 'package.json'), 'utf8'),
    ]);
  return {
    manifest: JSON.parse(manifest),
    packageJson: JSON.parse(packageJson),
    packageLock: JSON.parse(packageLock),
    archive,
    installedPackage: JSON.parse(installedPackage),
    installedRealPath: await realpath(SCHEMA_INSTALL_PATH),
    expectedInstallPath: SCHEMA_INSTALL_PATH,
  };
}

test('package.json publishes an exact schemas peer and develops against its vendored archive', async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
  );
  assert.equal(
    packageJson.devDependencies['@rathnasgala2/schemas'],
    'file:vendor/rathnasgala2-schemas-3.8.0.tgz',
  );
  assert.equal(packageJson.peerDependencies['@rathnasgala2/schemas'], '3.8.0');
});

test('package-lock.json pins the declared schemas source and resolved version', async () => {
  const [packageJson, lock] = await Promise.all(
    ['package.json', 'package-lock.json'].map(async (file) =>
      JSON.parse(await readFile(path.join(REPO_ROOT, file), 'utf8')),
    ),
  );
  const entry = lock.packages['node_modules/@rathnasgala2/schemas'];
  assert.ok(entry, '@rathnasgala2/schemas must be present in the lockfile');
  assert.equal(entry.version, '3.8.0');
  assert.equal(
    entry.resolved,
    packageJson.devDependencies['@rathnasgala2/schemas'],
  );
  assert.equal(entry.link, undefined);
  assert.equal(
    entry.integrity,
    'sha512-opSg97hyJiFnGVOwCXbdSahgeFytQoKATVcyZvN9WfYLJ+snoQL1cKg/JzqZRsRHBnX+7/Ed/gwtvonofSV09Q==',
  );
  assert.equal(
    lock.packages[''].peerDependencies['@rathnasgala2/schemas'],
    packageJson.peerDependencies['@rathnasgala2/schemas'],
  );
});

test('@rathnasgala2/schemas resolves under Node 24 ESM and exposes its public API', async () => {
  const schemas = await import('@rathnasgala2/schemas');
  assert.ok(Array.isArray(schemas.GALA_SCHEMA_IDS));
  assert.ok(schemas.GALA_SCHEMA_IDS.length > 0);
  assert.equal(typeof schemas.validateGalaDocument, 'function');
});

test('vendored schema manifest binds archive bytes, lock integrity, and installed provenance', async () => {
  const state = await readVendorState();
  assert.deepEqual(collectVendoredSchemaDiagnostics(state), []);
});

test('vendored schema check fails closed on archive or source drift', async () => {
  const state = await readVendorState();
  const corruptArchive = Buffer.concat([state.archive, Buffer.from([0])]);
  const archiveDiagnostics = collectVendoredSchemaDiagnostics({
    ...state,
    archive: corruptArchive,
  });
  assert.ok(
    archiveDiagnostics.some((message) =>
      message.includes('vendor/schema-manifest.json: sha256'),
    ),
  );
  assert.ok(
    archiveDiagnostics.some((message) =>
      message.includes('package-lock.json: schema integrity'),
    ),
  );

  const nonVendoredPackage = structuredClone(state.packageJson);
  nonVendoredPackage.devDependencies['@rathnasgala2/schemas'] =
    'file:../schema';
  assert.ok(
    collectVendoredSchemaDiagnostics({
      ...state,
      packageJson: nonVendoredPackage,
    }).some((message) => message.includes('package.json:')),
  );

  assert.ok(
    collectVendoredSchemaDiagnostics({
      ...state,
      installedRealPath: path.resolve(REPO_ROOT, '../schema'),
    }).some((message) =>
      message.includes('installed schema package must reside'),
    ),
  );
});
