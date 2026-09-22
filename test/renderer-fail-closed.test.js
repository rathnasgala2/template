import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  BuildInputValidationError,
  RenderOptionsError,
  renderPublication,
} from '../src/core/index.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import {
  applyCurrentRenderPolicy,
  loadCanonicalBuildInput,
  loadS2FixtureFamily,
} from './helpers/schema-fixtures.js';

test('C. module absence: every empty-modules-placements S2 fixture case behaves exactly as its expectedDiagnostics say', async () => {
  const family = await loadS2FixtureFamily('empty-modules-placements');
  assert.equal(family.cases.length, 3);

  for (const fixtureCase of family.cases) {
    if (fixtureCase.schemaId !== 'urn:gala:schema:build-input:2.0.0') continue;
    const shouldBeValid = fixtureCase.expectedDiagnostics.length === 0;
    const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
      await createRenderDirectories();
    try {
      if (shouldBeValid) {
        // These placeholder fixtures declare a content redirect equal to
        // their own default canonical route (see
        // `loadCanonicalBuildInput`'s documentation for why); strip it so
        // rendering does not fail on an unrelated self-redirect collision.
        // They also carry the same schema-shape-filler `appearance.fontAssets`
        // entry `loadCanonicalBuildInput` documents and clears; this fixture
        // is read directly from the S2 family file, not through that loader,
        // so it is cleared here too.
        for (const record of fixtureCase.instance.content ?? []) {
          record.frontmatter.redirects = [];
        }
        if (fixtureCase.instance.appearance) {
          fixtureCase.instance.appearance.fontAssets = [];
        }
        await applyCurrentRenderPolicy(fixtureCase.instance);
        await assert.doesNotReject(
          () =>
            renderPublication(fixtureCase.instance, {
              outputDirectory,
              workDirectory,
              sourceDirectory,
              provenance: testProvenance(),
            }),
          `${fixtureCase.caseId}: expected no schema-validation rejection`,
        );
      } else {
        await assert.rejects(
          () =>
            renderPublication(fixtureCase.instance, {
              outputDirectory,
              workDirectory,
              sourceDirectory,
              provenance: testProvenance(),
            }),
          BuildInputValidationError,
          `${fixtureCase.caseId}: expected rejection before any render`,
        );
      }
    } finally {
      await cleanup();
    }
  }
});

test('an invalid build-input is rejected before any file is written (fails closed)', async () => {
  const family = await loadS2FixtureFamily('empty-modules-placements');
  const rejectedCase = family.cases.find(
    (fixtureCase) =>
      fixtureCase.caseId === 'build-input-rejects-nonempty-modules',
  );
  assert.ok(rejectedCase, 'fixture corpus must carry this case');

  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    let caught;
    try {
      await renderPublication(rejectedCase.instance, {
        outputDirectory,
        workDirectory,
        sourceDirectory,
        provenance: testProvenance(),
      });
    } catch (error) {
      caught = error;
    }
    assert.ok(caught instanceof BuildInputValidationError);
    assert.ok(caught.diagnostics.length > 0);
    assert.ok(
      caught.diagnostics.some(
        (diagnostic) => diagnostic.instancePointer === '/modules',
      ),
    );

    // Schema validation runs before the output directory is even created,
    // so it must still be exactly the empty directory `createRenderDirectories`
    // made (not yet the renderer's own `outputDirectory`, which is created
    // lazily on first successful validation).
    const { readdir } = await import('node:fs/promises');
    await assert.rejects(() => readdir(outputDirectory), { code: 'ENOENT' });
  } finally {
    await cleanup();
  }
});

test('renderPublication throws RenderOptionsError, not BuildInputValidationError, for malformed options', async () => {
  const buildInput = await loadCanonicalBuildInput();

  await assert.rejects(
    () => renderPublication(buildInput, /** @type {any} */ (undefined)),
    RenderOptionsError,
  );

  await assert.rejects(
    () =>
      renderPublication(buildInput, {
        outputDirectory: 'relative/path',
        workDirectory: '/tmp/gala-template-test-work',
        provenance: testProvenance(),
      }),
    RenderOptionsError,
    'a relative outputDirectory must be rejected',
  );

  const { outputDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    await assert.rejects(
      () =>
        renderPublication(buildInput, {
          outputDirectory,
          workDirectory: outputDirectory,
          sourceDirectory,
          provenance: testProvenance(),
        }),
      RenderOptionsError,
      'identical output/work directories must be rejected',
    );
  } finally {
    await cleanup();
  }
});

test('renderPublication rejects an incomplete provenance bundle before rendering', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const provenance = testProvenance();
    delete provenance.workflowIdentity;
    await assert.rejects(
      () =>
        renderPublication(buildInput, {
          outputDirectory,
          workDirectory,
          sourceDirectory,
          provenance,
        }),
      RenderOptionsError,
    );

    // An incomplete provenance bundle must fail closed before any
    // directory is created, exactly like an invalid build-input does.
    const { readdir } = await import('node:fs/promises');
    await assert.rejects(() => readdir(outputDirectory), { code: 'ENOENT' });
  } finally {
    await cleanup();
  }
});
