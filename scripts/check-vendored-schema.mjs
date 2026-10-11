#!/usr/bin/env node
/**
 * Fail-closed integrity and provenance verification for the schema package
 * vendored for source-only Template development.
 */
import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

import { runIfMain } from './run-if-main.mjs';

const PACKAGE_NAME = '@rathnasgala2/schemas';
const PACKAGE_VERSION = '3.8.0';
const ARCHIVE_PATH = 'vendor/rathnasgala2-schemas-3.8.0.tgz';
const PACKAGE_SPECIFIER = `file:${ARCHIVE_PATH}`;
const MANIFEST_KEYS = Object.freeze([
  'archive',
  'byteLength',
  'integrity',
  'packageName',
  'schemaVersion',
  'sha256',
  'version',
]);

/**
 * @param {unknown} value candidate JSON value
 * @returns {value is Record<string, unknown>} whether the value is an object
 */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Validate all checked-in and installed representations of the vendored
 * schema dependency. Returning every diagnostic makes a corrupt checkout
 * actionable without weakening any individual check.
 *
 * @param {{
 *   manifest: unknown,
 *   packageJson: unknown,
 *   packageLock: unknown,
 *   archive: Uint8Array,
 *   installedPackage: unknown,
 *   installedRealPath: string,
 *   expectedInstallPath: string,
 * }} state verification inputs
 * @returns {string[]} integrity and provenance diagnostics
 */
export function collectVendoredSchemaDiagnostics(state) {
  /** @type {string[]} */
  const diagnostics = [];
  if (!isObject(state.manifest)) {
    return ['vendor/schema-manifest.json: root must be a JSON object.'];
  }
  if (!isObject(state.packageJson)) {
    return ['package.json: root must be a JSON object.'];
  }
  if (!isObject(state.packageLock)) {
    return ['package-lock.json: root must be a JSON object.'];
  }
  if (!isObject(state.installedPackage)) {
    return [
      'node_modules/@rathnasgala2/schemas/package.json: root must be a JSON object.',
    ];
  }

  const manifestKeys = Object.keys(state.manifest).sort();
  if (JSON.stringify(manifestKeys) !== JSON.stringify(MANIFEST_KEYS)) {
    diagnostics.push(
      'vendor/schema-manifest.json: fields must be exactly ' +
        MANIFEST_KEYS.join(', ') +
        '.',
    );
  }

  const sha256 = createHash('sha256').update(state.archive).digest('hex');
  const integrity =
    'sha512-' + createHash('sha512').update(state.archive).digest('base64');
  const expectedManifest = {
    archive: ARCHIVE_PATH,
    byteLength: state.archive.byteLength,
    integrity,
    packageName: PACKAGE_NAME,
    schemaVersion: 1,
    sha256,
    version: PACKAGE_VERSION,
  };
  for (const [key, expected] of Object.entries(expectedManifest)) {
    if (state.manifest[key] !== expected) {
      diagnostics.push(
        `vendor/schema-manifest.json: ${key} must be ${JSON.stringify(expected)}.`,
      );
    }
  }

  const dependencies = isObject(state.packageJson.devDependencies)
    ? state.packageJson.devDependencies
    : {};
  const peers = isObject(state.packageJson.peerDependencies)
    ? state.packageJson.peerDependencies
    : {};
  if (dependencies[PACKAGE_NAME] !== PACKAGE_SPECIFIER) {
    diagnostics.push(
      `package.json: ${PACKAGE_NAME} must be ${PACKAGE_SPECIFIER}.`,
    );
  }
  if (peers[PACKAGE_NAME] !== PACKAGE_VERSION) {
    diagnostics.push(
      `package.json: ${PACKAGE_NAME} peer must be exactly ${PACKAGE_VERSION}.`,
    );
  }

  const lockPackages = isObject(state.packageLock.packages)
    ? state.packageLock.packages
    : {};
  const lockRoot = isObject(lockPackages['']) ? lockPackages[''] : {};
  const lockDevDependencies = isObject(lockRoot.devDependencies)
    ? lockRoot.devDependencies
    : {};
  const lockPeers = isObject(lockRoot.peerDependencies)
    ? lockRoot.peerDependencies
    : {};
  const lockEntry = isObject(lockPackages[`node_modules/${PACKAGE_NAME}`])
    ? lockPackages[`node_modules/${PACKAGE_NAME}`]
    : {};
  const expectedLockValues = {
    'root devDependency': lockDevDependencies[PACKAGE_NAME],
    'root peerDependency': lockPeers[PACKAGE_NAME],
    version: lockEntry.version,
    resolved: lockEntry.resolved,
    integrity: lockEntry.integrity,
  };
  const requiredLockValues = {
    'root devDependency': PACKAGE_SPECIFIER,
    'root peerDependency': PACKAGE_VERSION,
    version: PACKAGE_VERSION,
    resolved: PACKAGE_SPECIFIER,
    integrity,
  };
  for (const [key, actual] of Object.entries(expectedLockValues)) {
    const expected = requiredLockValues[key];
    if (actual !== expected) {
      diagnostics.push(
        `package-lock.json: schema ${key} must be ${JSON.stringify(expected)}.`,
      );
    }
  }
  if (lockEntry.link !== undefined) {
    diagnostics.push(
      'package-lock.json: schema package must be archive-backed, not linked.',
    );
  }

  if (state.installedPackage.name !== PACKAGE_NAME) {
    diagnostics.push(`installed schema package name must be ${PACKAGE_NAME}.`);
  }
  if (state.installedPackage.version !== PACKAGE_VERSION) {
    diagnostics.push(
      `installed schema package version must be ${PACKAGE_VERSION}.`,
    );
  }
  if (state.installedRealPath !== state.expectedInstallPath) {
    diagnostics.push(
      `installed schema package must reside at ${state.expectedInstallPath}; resolved ${state.installedRealPath}.`,
    );
  }
  return diagnostics;
}

/**
 * @returns {Promise<void>} resolves after every vendor check passes
 */
async function main() {
  const repositoryRoot = path.resolve(import.meta.dirname, '..');
  const manifestPath = path.join(repositoryRoot, 'vendor/schema-manifest.json');
  const archivePath = path.join(repositoryRoot, ARCHIVE_PATH);
  const installedPath = path.join(
    repositoryRoot,
    'node_modules/@rathnasgala2/schemas',
  );
  const [manifestSource, packageSource, lockSource, archive, installedSource] =
    await Promise.all([
      readFile(manifestPath, 'utf8'),
      readFile(path.join(repositoryRoot, 'package.json'), 'utf8'),
      readFile(path.join(repositoryRoot, 'package-lock.json'), 'utf8'),
      readFile(archivePath),
      readFile(path.join(installedPath, 'package.json'), 'utf8'),
    ]);
  const diagnostics = collectVendoredSchemaDiagnostics({
    manifest: JSON.parse(manifestSource),
    packageJson: JSON.parse(packageSource),
    packageLock: JSON.parse(lockSource),
    archive,
    installedPackage: JSON.parse(installedSource),
    installedRealPath: await realpath(installedPath),
    expectedInstallPath: installedPath,
  });
  if (diagnostics.length > 0) {
    throw new Error(diagnostics.join('\n'));
  }
  console.log(
    `${PACKAGE_NAME}@${PACKAGE_VERSION} vendor archive, lock integrity, and installed provenance verified.`,
  );
}

runIfMain(import.meta, main);
