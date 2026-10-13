#!/usr/bin/env node
/**
 * Schema-source guard: development and the packed peer contract both use the
 * exact registry release of @rathnasgala2/schemas; no local or vendored
 * archive may stand in for it.
 */
import { readFile } from 'node:fs/promises';

import { runIfMain } from './run-if-main.mjs';

const FORBIDDEN = [
  /file:\.\.\/schema/u,
  /file:.*local-packages/u,
  /local-packages\/rathnasgala2-schemas-/u,
  /https?:\/\/[^\s"']*rathnasgala2-schemas/u,
];
const FILES = ['package.json', 'package-lock.json'];
const REGISTRY_TARBALL =
  'https://registry.npmjs.org/@rathnasgala2/schemas/-/schemas-3.10.0.tgz';

/**
 * @param {string} path the file to scan
 * @returns {Promise<string[]>} one diagnostic per forbidden match found
 */
async function checkFile(path) {
  /** @type {string[]} */
  const diagnostics = [];
  const text = await readFile(path, 'utf8');
  for (const pattern of FORBIDDEN) {
    if (pattern.test(text)) {
      diagnostics.push(
        `${path}: found a forbidden schema source (${pattern}). ` +
          '@rathnasgala2/schemas must resolve only from the npm registry.',
      );
    }
  }
  return diagnostics;
}

/**
 * @returns {Promise<void>} resolves when no forbidden reference is found
 */
async function main() {
  const diagnostics = (await Promise.all(FILES.map(checkFile))).flat();
  const manifest = JSON.parse(await readFile('package.json', 'utf8'));
  const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
  if (manifest.peerDependencies?.['@rathnasgala2/schemas'] !== '^3.10.0') {
    diagnostics.push(
      'package.json: @rathnasgala2/schemas must be the ^3.10.0 peer for portable source-only installation.',
    );
  }
  if (
    lock.packages?.['']?.peerDependencies?.['@rathnasgala2/schemas'] !==
    '^3.10.0'
  ) {
    diagnostics.push(
      'package-lock.json: @rathnasgala2/schemas must be the ^3.10.0 peer.',
    );
  }
  const schemaLock = lock.packages?.['node_modules/@rathnasgala2/schemas'];
  if (schemaLock?.version !== '3.10.0') {
    diagnostics.push(
      'package-lock.json: the installed @rathnasgala2/schemas entry must be version 3.10.0.',
    );
  }
  if (schemaLock?.resolved !== REGISTRY_TARBALL) {
    diagnostics.push(
      `package-lock.json: the installed @rathnasgala2/schemas entry must resolve from ${REGISTRY_TARBALL}.`,
    );
  }
  if (schemaLock?.link !== undefined) {
    diagnostics.push(
      'package-lock.json: @rathnasgala2/schemas must be a registry install, not a filesystem link.',
    );
  }
  if (diagnostics.length > 0) {
    throw new Error(diagnostics.join('\n'));
  }
  console.log(
    'schema is a caret-range registry peer (installed 3.10.0 pinned by the lock).',
  );
}

runIfMain(import.meta, main);
