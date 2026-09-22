import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { runIfMain } from './run-if-main.mjs';

const PACKAGE_LOCK_PATH = path.resolve('package-lock.json');
const OUTPUT_PATH = path.resolve('THIRD_PARTY_LICENSES.json');

/**
 * One required ordinary JSON object.
 *
 * @param {unknown} value candidate value
 * @param {string} message failure message
 * @returns {Record<string, unknown>} object
 */
function requireObject(value, message) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(message);
  }
  return /** @type {Record<string, unknown>} */ (value);
}

/**
 * Project `package-lock.json`'s `packages` map into a sorted third-party
 * license inventory, excluding this package's own root entry.
 *
 * @param {string} lockSource `package-lock.json` file contents
 * @returns {{ name: string, version: string, license: string }[]} inventory,
 *   sorted by package name then version
 */
export function createLicenseInventory(lockSource) {
  const lock = requireObject(JSON.parse(lockSource), 'package-lock is invalid');
  const packages = requireObject(
    lock.packages,
    'package-lock has no packages map',
  );

  /** @type {{ name: string, version: string, license: string }[]} */
  const inventory = [];
  for (const [key, raw] of Object.entries(packages)) {
    if (key === '') continue; // the workspace root itself
    const entry = requireObject(raw, `${key}: package-lock entry is invalid`);
    const name =
      typeof entry.name === 'string'
        ? entry.name
        : key.replace(/^.*node_modules\//, '');
    const version =
      typeof entry.version === 'string' ? entry.version : 'unknown';
    const license =
      typeof entry.license === 'string'
        ? entry.license
        : Array.isArray(entry.licenses)
          ? entry.licenses.join(' OR ')
          : 'UNKNOWN';
    inventory.push({ name, version, license });
  }

  inventory.sort((a, b) => {
    if (a.name !== b.name) return a.name < b.name ? -1 : 1;
    return a.version < b.version ? -1 : a.version > b.version ? 1 : 0;
  });
  return inventory;
}

/**
 * Regenerate or check `THIRD_PARTY_LICENSES.json` from the committed lockfile.
 *
 * @returns {Promise<void>} resolves once complete
 */
async function main() {
  const check = process.argv.includes('--check');
  const lockSource = await readFile(PACKAGE_LOCK_PATH, 'utf8');
  const inventory = createLicenseInventory(lockSource);
  const rendered = `${JSON.stringify(inventory, null, 2)}\n`;

  if (check) {
    let existing;
    try {
      existing = await readFile(OUTPUT_PATH, 'utf8');
    } catch {
      throw new Error(`${OUTPUT_PATH}: missing; run licenses:generate`);
    }
    if (existing !== rendered) {
      throw new Error(
        `${OUTPUT_PATH}: not byte-identical to a fresh emit; run licenses:generate`,
      );
    }
    return;
  }

  await writeFile(OUTPUT_PATH, rendered, 'utf8');
}

runIfMain(import.meta, main);
