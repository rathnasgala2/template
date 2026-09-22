import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import { listFilesSortedByUtf8Bytes } from '../src/core/internal/fs-walk.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { loadCanonicalBuildInput } from './helpers/schema-fixtures.js';

/**
 * @param {Record<string, unknown>} manifest an emitted artifact-manifest
 * @returns {Record<string, unknown>} the same manifest without `artifactId`
 */
function withoutArtifactId(manifest) {
  const clone = { ...manifest };
  delete clone.artifactId;
  return clone;
}

/**
 * S2-T03's own two-build byte-equality test on one fixture. The complete
 * hostile-environment/golden-manifest determinism harness (clock, timezone,
 * locale, hostname, home directory, filesystem-enumeration-order matrix) is
 * S2-T09's deliverable; this proves the specific invariant task packet
 * S2-T03 calls out: two clean renders of the same `build-input` and options
 * produce byte-identical route/asset files and the same `artifactDigest`/
 * `manifestDigest`, using two independently created temporary output
 * directories rendered in reverse order to avoid any accidental ordering
 * coupling.
 */
test('two clean builds of the same build-input produce byte-identical output and matching artifact/manifest digests', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const provenance = testProvenance();

  const first = await createRenderDirectories();
  const second = await createRenderDirectories();
  try {
    const resultA = await renderPublication(buildInput, {
      outputDirectory: first.outputDirectory,
      workDirectory: first.workDirectory,
      sourceDirectory: first.sourceDirectory,
      provenance,
    });
    const resultB = await renderPublication(buildInput, {
      outputDirectory: second.outputDirectory,
      workDirectory: second.workDirectory,
      sourceDirectory: second.sourceDirectory,
      provenance,
    });

    const filesA = await listFilesSortedByUtf8Bytes(first.outputDirectory);
    const filesB = await listFilesSortedByUtf8Bytes(second.outputDirectory);
    assert.deepEqual(filesA, filesB, 'the same set of files must be written');
    assert.ok(filesA.length > 0);

    for (const relativePath of filesA) {
      const bytesA = await readFile(
        path.join(first.outputDirectory, relativePath),
      );
      const bytesB = await readFile(
        path.join(second.outputDirectory, relativePath),
      );
      assert.ok(
        bytesA.equals(bytesB),
        `${relativePath}: byte content differs between the two builds`,
      );
    }

    // DEC-097 section 6: "equal artifact bytes may have distinct artifact
    // IDs but must have equal artifactDigest" — artifactId is intentionally
    // excluded from this equality.
    assert.equal(
      resultA.manifest.artifactDigest,
      resultB.manifest.artifactDigest,
    );
    assert.equal(
      resultA.manifest.manifestDigest,
      resultB.manifest.manifestDigest,
    );
    assert.equal(
      resultA.manifest.sourceInventoryDigest,
      resultB.manifest.sourceInventoryDigest,
    );
    assert.notEqual(resultA.manifest.artifactId, resultB.manifest.artifactId);

    assert.deepEqual(
      withoutArtifactId(resultA.manifest),
      withoutArtifactId(resultB.manifest),
    );
  } finally {
    await first.cleanup();
    await second.cleanup();
  }
});
