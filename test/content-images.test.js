/**
 * Content images: every `<img>` a body carries resolves to an image asset the
 * build input inventories for that document (`content[].media[]`), runs
 * through the media pipeline, and renders as responsive markup naming only
 * the pipeline's output files; an unresolvable one fails closed before
 * anything is written. Every assertion is a fact about the rendered output.
 */

import { strict as assert } from 'node:assert';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import {
  BuildInputValidationError,
  MediaPipelineError,
  renderPublication,
} from '../src/core/index.js';
import { normalizeAuthoredMarkdown } from '../src/core/internal/content-security.js';
import { listFilesSortedByUtf8Bytes } from '../src/core/internal/fs-walk.js';
import { repositoryPathOfImageSource } from '../src/core/internal/media/content-images.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import { applyCurrentRenderPolicy } from './helpers/schema-fixtures.js';
import {
  buildTestGif,
  buildTestPng,
  sha256Of,
  TEST_SVG_BYTES,
} from './helpers/media-fixtures.js';

const SIZES = 'sizes="(max-width: 960px) 100vw, 960px"';
const FIRST_ARTICLE = 'fixture-1/first-article/index.html';
const SECOND_ARTICLE = 'fixture-1/second-article/index.html';

/**
 * @typedef {{path: string, bytes: Buffer, mediaType?: string}} StagedFile
 */

/**
 * Give one content record a Markdown body and a `media[]` inventory, staging
 * each inventoried file's bytes under the render's source directory.
 *
 * @param {any} buildInput the build input, mutated in place
 * @param {string} sourceDirectory the render's source directory
 * @param {number} index the content record to change
 * @param {string} markdown the record's authored Markdown body
 * @param {StagedFile[]} files the record's inventory
 * @returns {Promise<void>}
 */
async function setBody(buildInput, sourceDirectory, index, markdown, files) {
  const record = buildInput.content[index];
  record.body = normalizeAuthoredMarkdown(markdown).html;
  record.media = [];
  for (const file of files) {
    const absolute = path.join(sourceDirectory, file.path);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, file.bytes);
    record.media.push({
      path: file.path,
      sourceDigest: sha256Of(file.bytes),
      mediaType: file.mediaType ?? 'image/png',
      byteLength: file.bytes.byteLength,
    });
  }
}

/**
 * Render a rich fixture after `prepare` has set bodies and inventories.
 *
 * @param {(buildInput: any, sourceDirectory: string) => Promise<void>} prepare
 * @returns {Promise<{manifest: any, outputDirectory: string, read: (file: string) => Promise<string>, cleanup: () => Promise<void>}>}
 */
async function render(prepare) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const dirs = await createRenderDirectories();
  await prepare(buildInput, dirs.sourceDirectory);
  await applyCurrentRenderPolicy(buildInput);
  const { manifest } = await renderPublication(buildInput, {
    outputDirectory: dirs.outputDirectory,
    workDirectory: dirs.workDirectory,
    sourceDirectory: dirs.sourceDirectory,
    provenance: testProvenance(),
  });
  return {
    manifest,
    outputDirectory: dirs.outputDirectory,
    read: (file) => readFile(path.join(dirs.outputDirectory, file), 'utf8'),
    cleanup: dirs.cleanup,
  };
}

/**
 * Render a rich fixture that is expected to fail, returning the rejection
 * and whether the output directory exists afterwards.
 *
 * @param {(buildInput: any, sourceDirectory: string) => Promise<void>} prepare
 * @returns {Promise<{error: unknown, outputExists: boolean}>}
 */
async function renderExpectingRejection(prepare) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const dirs = await createRenderDirectories();
  try {
    await prepare(buildInput, dirs.sourceDirectory);
    await applyCurrentRenderPolicy(buildInput);
    let error;
    try {
      await renderPublication(buildInput, {
        outputDirectory: dirs.outputDirectory,
        workDirectory: dirs.workDirectory,
        sourceDirectory: dirs.sourceDirectory,
        provenance: testProvenance(),
      });
    } catch (caught) {
      error = caught;
    }
    const outputExists = await readdir(dirs.outputDirectory).then(
      () => true,
      () => false,
    );
    return { error, outputExists };
  } finally {
    await dirs.cleanup();
  }
}

test('a body image renders its largest output within 960px as src, every output in srcset, lazily', async (t) => {
  const wide = buildTestPng(1000, 500);
  const narrow = buildTestPng(500, 250);
  const { manifest, outputDirectory, read, cleanup } = await render(
    async (buildInput, source) => {
      await setBody(
        buildInput,
        source,
        0,
        'Intro.\n\n![A wide photo](assets/content/first-article/wide.png)\n\n' +
          '![](/assets/content/first-article/narrow.png)\n',
        [
          { path: 'assets/content/first-article/wide.png', bytes: wide },
          { path: 'assets/content/first-article/narrow.png', bytes: narrow },
        ],
      );
      const [{ path: heroPath, sourceDigest }] = buildInput.content[0].media;
      buildInput.content[0].frontmatter.hero = {
        file: { path: heroPath, sourceDigest },
        alt: '',
        role: 'decorative',
      };
    },
  );
  t.after(cleanup);
  const page = await read(FIRST_ARTICLE);
  const wideBase = `/fixture-1/assets/media/${sha256Of(wide).slice(7)}`;
  const narrowBase = `/fixture-1/assets/media/${sha256Of(narrow).slice(7)}`;

  assert.ok(
    page.includes(
      `<img src="${wideBase}/960w.png" srcset="${wideBase}/320w.png 320w, ${wideBase}/640w.png 640w, ` +
        `${wideBase}/960w.png 960w, ${wideBase}/original.png 1000w" ${SIZES} alt="A wide photo" ` +
        `width="960" height="480" loading="lazy" decoding="async">`,
    ),
    'the wide image: 960w as src, every output in ascending srcset',
  );
  assert.ok(
    page.includes(
      `<img src="${narrowBase}/original.png" srcset="${narrowBase}/320w.png 320w, ${narrowBase}/original.png 500w" ` +
        `${SIZES} alt="" width="500" height="250" loading="lazy" decoding="async">`,
    ),
    'an image no wider than the slot uses its original as src',
  );
  assert.ok(!page.includes('assets/content/'), 'no raw source path survives');

  // The decorative hero renders as the cover figure, above the body.
  const cover = page.indexOf(
    `<figure class="g-wrap g-article-cover"><img src="${wideBase}/original.png" alt=""`,
  );
  assert.ok(cover > 0, 'the hero renders as the cover figure');
  assert.ok(cover < page.indexOf('<div class="g-prose">'), 'above the body');

  // Every srcset file is written and recorded; the sources never are.
  const assetPaths = new Set(
    manifest.assets.map((/** @type {{path: string}} */ asset) => asset.path),
  );
  for (const match of page.matchAll(/ srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(', ')) {
      const file = candidate.split(' ')[0].slice(1);
      assert.ok(assetPaths.has(file), `${file} is a manifest asset`);
      await readFile(path.join(outputDirectory, file));
    }
  }
  assert.equal(assetPaths.size, manifest.assets.length, 'no duplicate asset');
  const written = await listFilesSortedByUtf8Bytes(outputDirectory);
  assert.ok(
    !written.some((file) => file.includes('assets/content/')),
    'no source file is copied',
  );

  // Feeds carry one absolute derivative src per image, no srcset.
  const rss = await read('fixture-1/feed/rss.xml');
  assert.match(
    rss,
    new RegExp(
      `<img src="https://[^"]+${wideBase}/960w\\.png" alt="A wide photo" width="960" height="480">`,
    ),
  );
  const atom = await read('fixture-1/feed/atom.xml');
  assert.match(
    atom,
    new RegExp(`&lt;img src=&quot;https://[^&]+${wideBase}/960w\\.png&quot;`),
  );
  assert.ok(!rss.includes('srcset') && !atom.includes('srcset'), 'no srcset');
});

test('a GIF passes through unmodified as its only output', async (t) => {
  const gif = buildTestGif(1200, 10, 3);
  const { manifest, outputDirectory, read, cleanup } = await render(
    async (buildInput, source) => {
      await setBody(
        buildInput,
        source,
        0,
        '![An animation](assets/content/first-article/loop.gif)\n',
        [
          {
            path: 'assets/content/first-article/loop.gif',
            bytes: gif,
            mediaType: 'image/gif',
          },
        ],
      );
    },
  );
  t.after(cleanup);
  const hex = sha256Of(gif).slice(7);
  const url = `/fixture-1/assets/media/${hex}/original.gif`;
  assert.ok(
    (await read(FIRST_ARTICLE)).includes(
      `<img src="${url}" srcset="${url} 1200w" ${SIZES} alt="An animation" width="1200" height="10" loading="lazy" decoding="async">`,
    ),
  );
  const gifAssets = manifest.assets.filter(
    (/** @type {{path: string}} */ asset) => asset.path.includes(hex),
  );
  assert.deepEqual(
    gifAssets.map((/** @type {any} */ asset) => [asset.path, asset.mediaType]),
    [[url.slice(1), 'image/gif']],
  );
  assert.ok(
    (await readFile(path.join(outputDirectory, url.slice(1)))).equals(gif),
    'byte-identical to the source',
  );
});

test('identical image bytes under two paths are processed and written once', async (t) => {
  const png = buildTestPng(400, 200);
  const { manifest, read, cleanup } = await render(
    async (buildInput, source) => {
      await setBody(buildInput, source, 0, '![one](assets/a/one.png)\n', [
        { path: 'assets/a/one.png', bytes: png },
      ]);
      await setBody(buildInput, source, 1, '![two](assets/b/two.png)\n', [
        { path: 'assets/b/two.png', bytes: png },
      ]);
    },
  );
  t.after(cleanup);
  const hex = sha256Of(png).slice(7);
  assert.deepEqual(
    manifest.assets
      .map((/** @type {{path: string}} */ asset) => asset.path)
      .filter((/** @type {string} */ file) => file.includes(hex)),
    [
      `fixture-1/assets/media/${hex}/320w.png`,
      `fixture-1/assets/media/${hex}/original.png`,
    ],
  );
  for (const [file, alt] of [
    [FIRST_ARTICLE, 'one'],
    [SECOND_ARTICLE, 'two'],
  ]) {
    assert.ok(
      (await read(file)).includes(
        `<img src="/fixture-1/assets/media/${hex}/original.png" srcset=`,
      ),
      `${file} (${alt})`,
    );
  }
});

test('every unresolvable body image fails closed with MEDIA_REFERENCE_UNRESOLVED before anything is written', async () => {
  const png = buildTestPng(4, 4);
  const { error, outputExists } = await renderExpectingRejection(
    async (buildInput, source) => {
      await setBody(
        buildInput,
        source,
        0,
        '![a](assets/missing.png) ![b](https://example.test/remote.png) ' +
          '![c](assets/other.png) ![d](assets/clip.mp3) ![e](../outside.png) ' +
          '![ok](assets/fine.png)\n',
        [
          { path: 'assets/fine.png', bytes: png },
          { path: 'assets/clip.mp3', bytes: png, mediaType: 'audio/mpeg' },
        ],
      );
      // Inventoried for a different document only.
      await setBody(buildInput, source, 1, 'No images.\n', [
        { path: 'assets/other.png', bytes: png },
      ]);
    },
  );
  assert.ok(error instanceof BuildInputValidationError, String(error));
  assert.deepEqual(
    error.diagnostics.map((diagnostic) => [
      diagnostic.code,
      diagnostic.instancePointer,
      diagnostic.reference,
    ]),
    [
      ['MEDIA_REFERENCE_UNRESOLVED', '/content/0/body', 'assets/missing.png'],
      ['MEDIA_REFERENCE_UNRESOLVED', '/content/0/body', ''],
      ['MEDIA_REFERENCE_UNRESOLVED', '/content/0/body', 'assets/other.png'],
      ['MEDIA_REFERENCE_UNRESOLVED', '/content/0/body', 'assets/clip.mp3'],
      ['MEDIA_REFERENCE_UNRESOLVED', '/content/0/body', '../outside.png'],
    ],
  );
  for (const diagnostic of error.diagnostics) {
    assert.equal(diagnostic.severity, 'ERROR');
    assert.match(String(diagnostic.remediation), /content\//);
  }
  assert.equal(outputExists, false, 'nothing is written');
});

test('an image in the profile or an enabled footer card has no inventory and fails closed; a disabled card is not rendered', async () => {
  const image = normalizeAuthoredMarkdown('![me](assets/me.png)\n').html;
  /** @type {(buildInput: any, enabled: boolean) => void} */
  const withImages = (buildInput, enabled) => {
    buildInput.publication.profile.body.body = image;
    buildInput.publication.footerCard = {
      enabled,
      heading: 'About',
      body: { ...buildInput.publication.profile.body, body: image },
      authorIds: [buildInput.authors[0].id],
    };
  };
  const { error } = await renderExpectingRejection(async (buildInput) =>
    withImages(buildInput, true),
  );
  assert.ok(error instanceof BuildInputValidationError, String(error));
  assert.deepEqual(
    error.diagnostics.map((diagnostic) => diagnostic.instancePointer),
    ['/publication/profile/body/body', '/publication/footerCard/body/body'],
  );
  const disabled = await renderExpectingRejection(async (buildInput) =>
    withImages(buildInput, false),
  );
  assert.ok(disabled.error instanceof BuildInputValidationError);
  assert.deepEqual(
    disabled.error.diagnostics.map((diagnostic) => diagnostic.instancePointer),
    ['/publication/profile/body/body'],
  );
});

test('an inventoried body image that fails validation rejects with the pipeline code before anything is written', async () => {
  const { error, outputExists } = await renderExpectingRejection(
    async (buildInput, source) => {
      await setBody(buildInput, source, 0, '![x](assets/vector.png)\n', [
        { path: 'assets/vector.png', bytes: TEST_SVG_BYTES },
      ]);
    },
  );
  assert.ok(error instanceof MediaPipelineError, String(error));
  assert.equal(error.reasonCode, 'MEDIA_SVG_REJECTED');
  assert.equal(outputExists, false, 'nothing is written');
});

test('the resolution rule: repository-root-relative, decoded, no scheme, query, fragment or dot segment', () => {
  for (const [source, expected] of [
    ['assets/x.png', 'assets/x.png'],
    ['/assets/x.png', 'assets/x.png'],
    ['./assets/x.png', 'assets/x.png'],
    ['assets/my%20pic.png', 'assets/my pic.png'],
    ['assets/caf%C3%A9.png', 'assets/café.png'],
    ['assets/cafe%CC%81.png', 'assets/café.png'],
    ['assets/a&amp;b.png', 'assets/a&b.png'],
    ['https://example.test/x.png', undefined],
    ['HTTP:x.png', undefined],
    ['//example.test/x.png', undefined],
    ['assets/x.png?v=1', undefined],
    ['assets/x.png#top', undefined],
    ['../x.png', undefined],
    ['assets/../x.png', undefined],
    ['assets/%2e%2e/x.png', undefined],
    ['assets//x.png', undefined],
    ['assets/%E0%A4%A.png', undefined],
    ['', undefined],
    [undefined, undefined],
  ]) {
    assert.equal(repositoryPathOfImageSource(source), expected, String(source));
  }
});
