import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  normalizeSbomDocument,
  serializeSbomDocument,
} from './sbom-normalize.mjs';
import { runIfMain } from './run-if-main.mjs';

const execFileAsync = promisify(execFile);

const SBOM_PATH = path.resolve('sbom.cdx.json');
const PACKAGE_JSON_PATH = path.resolve('package.json');

/**
 * Confirm the committed `sbom.cdx.json` is byte-identical to a fresh
 * `cyclonedx-npm` generation over the current `package.json` and
 * `package-lock.json`, once both are normalized through
 * {@link normalizeSbomDocument}. `cyclonedx-npm` itself emits a fresh random
 * `serialNumber` and wall-clock `metadata.timestamp` on every run; without
 * normalizing those two fields first, this check could never pass twice in a
 * row and would not actually prove the described dependency graph is
 * current. Every other field is derived deterministically from the
 * committed lockfile, so this is a real drift check, not a no-op presence
 * check.
 *
 * @returns {Promise<void>} resolves once the check passes
 */
async function main() {
  let committedText;
  try {
    committedText = await readFile(SBOM_PATH, 'utf8');
  } catch {
    throw new Error(`${SBOM_PATH}: missing; run sbom:generate first`);
  }

  const workDir = await mkdtemp(path.join(tmpdir(), 'gala-template-sbom-'));
  try {
    const freshPath = path.join(workDir, 'sbom.cdx.json');
    await execFileAsync(
      'npx',
      [
        'cyclonedx-npm',
        '--output-file',
        freshPath,
        '--output-format',
        'JSON',
        '--spec-version',
        '1.6',
      ],
      { cwd: process.cwd() },
    );

    const [freshText, packageJsonText] = await Promise.all([
      readFile(freshPath, 'utf8'),
      readFile(PACKAGE_JSON_PATH, 'utf8'),
    ]);
    const packageJson = JSON.parse(packageJsonText);
    const normalizedFresh = serializeSbomDocument(
      normalizeSbomDocument(JSON.parse(freshText), {
        name: packageJson.name,
        version: packageJson.version,
      }),
    );

    if (normalizedFresh !== committedText) {
      throw new Error(
        `${SBOM_PATH}: stale; a fresh normalized sbom:generate run produced ` +
          'different bytes than the committed file. Run `npm run sbom:generate`.',
      );
    }
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

runIfMain(import.meta, main);
