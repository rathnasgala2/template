import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  normalizeSbomDocument,
  serializeSbomDocument,
} from './sbom-normalize.mjs';
import { runIfMain } from './run-if-main.mjs';

const SBOM_PATH = path.resolve('sbom.cdx.json');
const PACKAGE_JSON_PATH = path.resolve('package.json');

/**
 * Rewrite `sbom.cdx.json` in place with `serialNumber` and
 * `metadata.timestamp` replaced by deterministic values, so that
 * `sbom:generate` produces byte-identical output across repeated runs of an
 * unchanged dependency graph. Run immediately after `cyclonedx-npm`.
 *
 * @returns {Promise<void>} resolves once the file is rewritten
 */
async function main() {
  const [sbomText, packageJsonText] = await Promise.all([
    readFile(SBOM_PATH, 'utf8'),
    readFile(PACKAGE_JSON_PATH, 'utf8'),
  ]);
  const document = JSON.parse(sbomText);
  const packageJson = JSON.parse(packageJsonText);
  const normalized = normalizeSbomDocument(document, {
    name: packageJson.name,
    version: packageJson.version,
  });
  await writeFile(SBOM_PATH, serializeSbomDocument(normalized), 'utf8');
}

runIfMain(import.meta, main);
