import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { MediaPipelineError, renderPublication } from '../src/core/index.js';
import { listFilesSortedByUtf8Bytes } from '../src/core/internal/fs-walk.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { loadCanonicalBuildInput } from './helpers/schema-fixtures.js';
import {
  buildOversizedDimensionPng,
  buildPngDecompressionBomb,
  buildTestJpeg,
  buildTestPng,
  buildTestWoff2,
  sha256Of,
  TEST_SVG_BYTES,
} from './helpers/media-fixtures.js';

/**
 * Stage one file under a render's `sourceDirectory` and return a
 * `resolvedFile`-shaped reference for it.
 *
 * @param {string} sourceDirectory the render's source directory
 * @param {string} relativePath the repository-relative path to stage at
 * @param {Buffer} bytes the file's bytes
 * @returns {Promise<{path: string, sourceDigest: string}>} the reference
 */
async function stage(sourceDirectory, relativePath, bytes) {
  const absolute = path.join(sourceDirectory, relativePath);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, bytes);
  return { path: relativePath, sourceDigest: sha256Of(bytes) };
}

/**
 * Stage a build input's media reference(s) under a fresh directory triple,
 * render it, and assert the render rejects with a {@link MediaPipelineError}
 * of exactly `expectedReasonCode`. Shared by every S2-T05 negative
 * acceptance test below, so the stage/render/assert/cleanup shape exists
 * exactly once.
 *
 * @param {(sourceDirectory: string, buildInput: Record<string, unknown>) => Promise<void>} stageReferences
 *   mutate `buildInput` in place with reference(s) staged under
 *   `sourceDirectory`
 * @param {string} expectedReasonCode the expected `MediaPipelineError.reasonCode`
 * @returns {Promise<void>} resolves once the rejection is asserted
 */
async function expectMediaRejection(stageReferences, expectedReasonCode) {
  const buildInput = await loadCanonicalBuildInput();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    await stageReferences(sourceDirectory, buildInput);
    await assert.rejects(
      () =>
        renderPublication(buildInput, {
          outputDirectory,
          workDirectory,
          sourceDirectory,
          provenance: testProvenance(),
        }),
      (error) =>
        error instanceof MediaPipelineError &&
        error.reasonCode === expectedReasonCode,
    );
  } finally {
    await cleanup();
  }
}

test('S2-T05 acceptance: a PNG default image produces a canonical asset plus every responsive derivative below its width', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const pngBytes = buildTestPng(400, 200);
    buildInput.publication.defaultImage = await stage(
      sourceDirectory,
      'assets/default.png',
      pngBytes,
    );

    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    });

    // Widths below 400 in this pipeline's fixed policy: 320. Plus one more
    // asset row every build always carries: S2-T07's appearance bootstrap
    // script (see `appearance-controller.test.js`).
    assert.equal(
      manifest.assets.length,
      3,
      'original + one 320w derivative + the appearance bootstrap script',
    );
    const original = manifest.assets.find((a) =>
      a.path.endsWith('/original.png'),
    );
    const derivative = manifest.assets.find((a) =>
      a.path.endsWith('/320w.png'),
    );
    assert.ok(original, 'original asset must be present');
    assert.ok(derivative, '320w derivative asset must be present');
    assert.equal(original.mediaType, 'image/png');
    assert.equal(original.immutable, true);

    for (const asset of manifest.assets) {
      const bytes = await readFile(path.join(outputDirectory, asset.path));
      assert.equal(String(bytes.byteLength), asset.byteLength);
      assert.equal(sha256Of(bytes), asset.sha256);
    }

    // Assets must never be counted as HTML routes.
    for (const route of manifest.routes) {
      assert.ok(!route.path.includes('assets/media/'));
    }
    const outputFiles = await listFilesSortedByUtf8Bytes(outputDirectory);
    // basePath fix (S2-T12 independent-review finding B2): the physical
    // file is written at the `basePath`-joined path (this fixture's
    // `basePath` is `/fixture-1`), matching every manifest asset row above.
    assert.ok(
      outputFiles.some((file) => file.includes('assets/media/')),
      'derivative files must actually be written under the candidate output directory',
    );
    assert.ok(
      manifest.assets.every((asset) => asset.path.startsWith('fixture-1/')),
      'every asset path must be basePath-joined',
    );
  } finally {
    await cleanup();
  }
});

test('S2-T05 acceptance: a JPEG hero image applies its EXIF orientation before deriving anything', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    // Orientation 6 = rotate 90deg CW; source 10x4 becomes 4x10 once applied.
    const jpegBytes = buildTestJpeg(10, 4, 6);
    buildInput.content[0].frontmatter.hero = {
      file: await stage(sourceDirectory, 'assets/hero.jpg', jpegBytes),
      alt: 'A test hero image',
      role: 'informative',
    };

    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    });

    const original = manifest.assets.find((a) =>
      a.path.endsWith('/original.jpg'),
    );
    assert.ok(original);
    // The oriented raster is 4x10; every configured derivative width (320+)
    // exceeds 4, so only the canonical original is emitted, plus the S2-T07
    // appearance bootstrap script every build always carries.
    assert.equal(manifest.assets.length, 2);
  } finally {
    await cleanup();
  }
});

test('S2-T05 acceptance: font policy admits a bounded WOFF2 font asset', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const fontBytes = buildTestWoff2(128);
    buildInput.appearance.fontAssets = [
      await stage(sourceDirectory, 'assets/fonts/body.woff2', fontBytes),
    ];

    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    });

    // The font asset, plus the S2-T07 appearance bootstrap script every
    // build always carries.
    assert.equal(manifest.assets.length, 2);
    const fontAsset = manifest.assets.find(
      (asset) => asset.mediaType === 'font/woff2',
    );
    assert.ok(fontAsset, 'a font/woff2 asset must be present');
    const bytes = await readFile(path.join(outputDirectory, fontAsset.path));
    assert.ok(bytes.equals(fontBytes));
  } finally {
    await cleanup();
  }
});

test('S2-T05 acceptance: SVG is unconditionally rejected as author media', async () => {
  await expectMediaRejection(async (sourceDirectory, buildInput) => {
    buildInput.publication.defaultImage = await stage(
      sourceDirectory,
      'assets/logo.svg',
      TEST_SVG_BYTES,
    );
  }, 'MEDIA_SVG_REJECTED');
});

test('S2-T05 acceptance: a source byte mismatch against build-input.sourceDigest fails closed', async () => {
  await expectMediaRejection(async (sourceDirectory, buildInput) => {
    const reference = await stage(
      sourceDirectory,
      'assets/default.png',
      buildTestPng(4, 4),
    );
    // Corrupt the declared digest so it no longer matches the staged bytes.
    reference.sourceDigest =
      'sha256:0000000000000000000000000000000000000000000000000000000000000099';
    buildInput.publication.defaultImage = reference;
  }, 'MEDIA_SOURCE_DIGEST_MISMATCH');
});

test('S2-T05 acceptance: a decompression-bomb PNG is rejected, never partially processed', async () => {
  await expectMediaRejection(async (sourceDirectory, buildInput) => {
    buildInput.publication.defaultImage = await stage(
      sourceDirectory,
      'assets/bomb.png',
      buildPngDecompressionBomb(),
    );
  }, 'MEDIA_RESOURCE_EXCEEDED');
});

test('S2-T05 acceptance: declared dimensions above the decode ceiling are rejected', async () => {
  await expectMediaRejection(async (sourceDirectory, buildInput) => {
    buildInput.publication.defaultImage = await stage(
      sourceDirectory,
      'assets/huge.png',
      buildOversizedDimensionPng(),
    );
  }, 'MEDIA_RESOURCE_EXCEEDED');
});

test('S2-T05 acceptance: an oversized font source is rejected', async () => {
  await expectMediaRejection(async (sourceDirectory, buildInput) => {
    buildInput.appearance.fontAssets = [
      await stage(
        sourceDirectory,
        'assets/fonts/oversized.woff2',
        buildTestWoff2(4_194_305),
      ),
    ];
  }, 'MEDIA_RESOURCE_EXCEEDED');
});

test('S2-T05 acceptance: a non-WOFF2 font is rejected', async () => {
  await expectMediaRejection(async (sourceDirectory, buildInput) => {
    buildInput.appearance.fontAssets = [
      await stage(
        sourceDirectory,
        'assets/fonts/not-a-font.ttf',
        Buffer.from('not a font'),
      ),
    ];
  }, 'MEDIA_FONT_FORMAT_INVALID');
});

test('S2-T05 acceptance: an unrecognized image format is rejected', async () => {
  await expectMediaRejection(async (sourceDirectory, buildInput) => {
    buildInput.publication.defaultImage = await stage(
      sourceDirectory,
      'assets/not-an-image.bin',
      Buffer.from('this is not any admitted image format at all'),
    );
  }, 'MEDIA_FORMAT_INVALID');
});

test('S2-T05 determinism: two clean builds of the same publication with a real image produce byte-identical derivative assets', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const provenance = testProvenance();
  const first = await createRenderDirectories();
  const second = await createRenderDirectories();
  try {
    const pngBytes = buildTestPng(640, 360);
    const referenceA = await stage(
      first.sourceDirectory,
      'assets/default.png',
      pngBytes,
    );
    const referenceB = await stage(
      second.sourceDirectory,
      'assets/default.png',
      pngBytes,
    );
    buildInput.publication.defaultImage = referenceA;
    const resultA = await renderPublication(buildInput, {
      outputDirectory: first.outputDirectory,
      workDirectory: first.workDirectory,
      sourceDirectory: first.sourceDirectory,
      provenance,
    });
    buildInput.publication.defaultImage = referenceB;
    const resultB = await renderPublication(buildInput, {
      outputDirectory: second.outputDirectory,
      workDirectory: second.workDirectory,
      sourceDirectory: second.sourceDirectory,
      provenance,
    });

    assert.deepEqual(resultA.manifest.assets, resultB.manifest.assets);
    assert.ok(resultA.manifest.assets.length > 0);

    for (const asset of resultA.manifest.assets) {
      const bytesA = await readFile(
        path.join(first.outputDirectory, asset.path),
      );
      const bytesB = await readFile(
        path.join(second.outputDirectory, asset.path),
      );
      assert.ok(
        bytesA.equals(bytesB),
        `${asset.path}: derivative bytes differ between two clean builds`,
      );
    }
  } finally {
    await first.cleanup();
    await second.cleanup();
  }
});
