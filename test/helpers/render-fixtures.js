/**
 * Shared test scaffolding for the renderer adapter tests: a valid
 * `provenance` bundle (see `src/core/manifest.js` for why the renderer
 * cannot derive these fields from `build-input` alone) and temporary
 * output/work directory management.
 */

import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * A schema-valid, deterministic placeholder `provenance` bundle, matching
 * the S2 schema fixture corpus's own placeholder-digest conventions
 * (`sha256:00...0N`). These are not truthful release facts; a real caller
 * (`publish-kernel`/`publish-action`) supplies its own verified values.
 *
 * @returns {import('../../types/index.d.ts').RenderProvenance} a fresh
 *   provenance bundle
 */
export function testProvenance() {
  const digest = (n) => `sha256:${'0'.repeat(64 - String(n).length)}${n}`;
  return {
    builder: {
      package: '@rathnasgala2/publish-action',
      version: '2.0.0',
      integrity: digest(1),
      registry: 'https://fixture-1.example.com/',
    },
    repositoryCoordinate: 'fixture-owner/fixture-repository',
    workflowIdentity: digest(1),
    buildToolVersions: [
      { kind: 'runtime', name: 'node', version: '24.18.0', digest: digest(1) },
      { kind: 'runtime', name: 'npm', version: '11.16.0', digest: digest(2) },
      {
        kind: 'package',
        package: '@rathnasgala2/schemas',
        version: '2.0.0',
        digest: digest(3),
      },
      {
        kind: 'package',
        package: '@rathnasgala2/template',
        version: '2.0.0',
        digest: digest(4),
      },
      {
        kind: 'package',
        package: '@rathnasgala2/theme-default',
        version: '2.0.0',
        digest: digest(5),
      },
      {
        kind: 'package',
        package: '@rathnasgala2/publish-action',
        version: '2.0.0',
        digest: digest(6),
      },
      {
        kind: 'package',
        package: '@rathnasgala2/publish-kernel',
        version: '2.0.0',
        digest: digest(7),
      },
      {
        kind: 'package',
        package: '@rathnasgala2/adapter-protocol',
        version: '2.0.0',
        digest: digest(8),
      },
      {
        kind: 'package',
        package: '@rathnasgala2/adapter-local-directory',
        version: '2.0.0',
        digest: digest(9),
      },
    ],
  };
}

/**
 * Create a fresh, empty, uniquely named output/work/source directory triple
 * under the OS temp directory, and return a cleanup function.
 * `sourceDirectory` (S2-T05) is created empty; tests exercising the media
 * pipeline populate it themselves with fixture bytes matching their own
 * `build-input`'s declared `sourceDigest`s.
 *
 * @returns {Promise<{outputDirectory: string, workDirectory: string, sourceDirectory: string, cleanup: () => Promise<void>}>}
 *   the three directories and a cleanup callback
 */
export async function createRenderDirectories() {
  const root = await mkdtemp(path.join(tmpdir(), 'gala-template-render-'));
  const outputDirectory = path.join(root, 'output');
  const workDirectory = path.join(root, 'work');
  const sourceDirectory = path.join(root, 'source');
  await mkdir(sourceDirectory, { recursive: true });
  return {
    outputDirectory,
    workDirectory,
    sourceDirectory,
    cleanup: () => rm(root, { recursive: true, force: true }),
  };
}
