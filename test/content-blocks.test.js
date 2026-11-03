/**
 * Content blocks and galleries on a built site: video, bookmark and file
 * cards drawn from the stored fences, PDFs emitted content-hashed, the
 * click-to-play script only where a video card is, galleries wrapped at render
 * time, and the Recommendations section and well-known file. Plus the unit
 * facts of the render-time forms.
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import {
  BuildInputValidationError,
  MediaPipelineError,
  RenderPolicyViolationError,
} from '../src/core/index.js';
import {
  decorateBlocks,
  formatFileSize,
  leanBlocks,
  wrapGalleries,
} from '../src/core/internal/content-blocks.js';
import { normalizeAuthoredMarkdown } from '../src/core/internal/content-security.js';
import {
  cardMediaOf,
  firstBodyImage,
} from '../src/core/internal/first-body-image.js';
import { CATALOGS } from '../src/core/internal/messages/registry.js';
import {
  render,
  renderExpectingRejection,
  setBody,
} from './helpers/body-render.js';
import { buildTestPng } from './helpers/media-fixtures.js';

const FIRST = 'fixture-1/first-article/index.html';
const SECOND = 'fixture-1/second-article/index.html';
const ABOUT = 'fixture-1/about/index.html';
const WELL_KNOWN = 'fixture-1/.well-known/recommendations.json';

const PDF = Buffer.concat([
  Buffer.from('%PDF-1.4\n'),
  Buffer.alloc(2048, 0x20),
  Buffer.from('%%EOF\n'),
]);
const PDF_HASH8 = createHash('sha256').update(PDF).digest('hex').slice(0, 8);
const PNG = buildTestPng(600, 300);

const MARKDOWN = [
  'Intro.',
  '```video\nprovider: youtube\nid: dQw4w9WgXcQ\ntitle: A talk\nposter: assets/poster.png\n```',
  '```bookmark\nurl: https://www.example.com/read?a=1&b=2\ntitle: Worth reading\ndescription: A good page\n```',
  '```file\npath: docs/Annual Report.pdf\ntitle: The report\ndescription: Everything\n```',
  '![One](assets/one.png)',
  '![Two](assets/two.png)',
  'Outro.',
].join('\n\n');

/** The inventory of the first article in the cases below. */
const FILES = [
  { path: 'assets/poster.png', bytes: PNG },
  { path: 'assets/one.png', bytes: PNG },
  { path: 'assets/two.png', bytes: buildTestPng(300, 300) },
  { path: 'docs/Annual Report.pdf', bytes: PDF, mediaType: 'application/pdf' },
];

/**
 * @param {string} markdown the first article's body
 * @param {typeof FILES} [files] its inventory
 * @returns {(buildInput: any, source: string) => Promise<void>} a render preparer
 */
const withBody =
  (markdown, files = FILES) =>
  (buildInput, source) =>
    setBody(buildInput, source, 0, markdown, files);

test('the cards, the gallery and the click-to-play script on the page that holds them', async () => {
  const site = await render(withBody(MARKDOWN));
  try {
    const page = await site.read(FIRST);
    // Video: a link card to the watch page, the poster through the media
    // pipeline, the page language's sentences, the play icon.
    assert.match(
      page,
      /<figure class="g-video" data-gala-block="video" data-gala-video="youtube:dQw4w9WgXcQ"><a class="g-block g-block--video" href="https:\/\/www\.youtube\.com\/watch\?v=dQw4w9WgXcQ" rel="noopener noreferrer"><span class="g-block__media"><img src="[^"]*assets\/media\/[^"]*"[^>]*><span class="g-block__play" aria-hidden="true"><svg/,
    );
    assert.match(page, /<span class="g-sr">Play video <\/span>A talk/);
    assert.match(page, /<span class="g-block__meta">Watch on YouTube<\/span>/);
    // Bookmark.
    assert.match(
      page,
      /<figure class="g-bookmark" data-gala-block="bookmark"><a class="g-block g-block--bookmark" href="https:\/\/www\.example\.com\/read\?a=1&amp;b=2" rel="noopener noreferrer">/,
    );
    assert.match(page, /<span class="g-block__desc">A good page<\/span>/);
    assert.match(page, /Read on example\.com<\/span>/);
    // File: the emitted, content-hashed path, a download card with the size.
    const filePath = `fixture-1/assets/files/annual-report.${PDF_HASH8}.pdf`;
    assert.match(
      page,
      new RegExp(
        `<a class="g-block g-block--file" href="/${filePath.replace(/\./g, '\\.')}" download>`,
      ),
    );
    assert.match(page, /Download PDF \(2 KB\)<\/span>/);
    assert.ok(!page.includes('docs/Annual'), 'the repository path is gone');
    // Gallery.
    assert.match(
      page,
      /<div class="g-gallery" data-count="2"><p><img [^>]*><\/p>\s*<p><img [^>]*><\/p><\/div>/,
    );
    // The script rides on this page only.
    assert.match(
      page,
      /<script src="\/fixture-1\/assets\/gala-video-v1\.js" defer data-gala-video-script><\/script>/,
    );
    for (const other of [SECOND, 'fixture-1/index.html']) {
      assert.ok(
        !(await site.read(other)).includes('gala-video'),
        `${other} has no video script`,
      );
    }
    // The manifest: the PDF and the script, each once, with their facts.
    const asset = (/** @type {string} */ p) =>
      site.manifest.assets.find((/** @type {any} */ a) => a.path === p);
    const file = asset(filePath);
    assert.equal(file.byteLength, String(PDF.byteLength));
    assert.equal(file.immutable, true);
    assert.equal(file.mediaType, 'application/octet-stream');
    assert.equal(
      file.sha256,
      `sha256:${createHash('sha256').update(PDF).digest('hex')}`,
    );
    assert.equal(asset('fixture-1/assets/gala-video-v1.js').immutable, false);
    assert.deepEqual(
      await readFile(path.join(site.outputDirectory, filePath)),
      PDF,
    );
    const script = await readFile(
      path.join(site.outputDirectory, 'fixture-1/assets/gala-video-v1.js'),
      'utf8',
    );
    assert.match(script, /youtube-nocookie\.com\/embed\//);
    // The CSP of every page lets a frame in from the two video hosts only.
    assert.match(
      page,
      /frame-src https:\/\/player\.vimeo\.com https:\/\/www\.youtube-nocookie\.com; /,
    );
    // The feed form is lean: no cards, no gallery, the file link absolute.
    const feed = (
      await Promise.all(
        site.manifest.routes
          .filter((/** @type {any} */ r) => r.routeClass === 'feed')
          .map((/** @type {any} */ r) => site.read(r.path)),
      )
    ).join('\n');
    assert.ok(feed.includes(`/${filePath}`), 'the feed links the emitted file');
    assert.ok(!feed.includes('g-gallery'));
    assert.ok(!feed.includes('g-block'));
    assert.ok(!feed.includes('docs/Annual'));
  } finally {
    await site.cleanup();
  }
});

test('no video card, no click-to-play script and no extra asset', async () => {
  const site = await render(
    withBody(
      'Just text.\n\n![One](assets/one.png)\n\n![Two](assets/two.png)\n',
    ),
  );
  try {
    assert.ok(!(await site.read(FIRST)).includes('gala-video'));
    assert.ok(
      !site.manifest.assets.some((/** @type {any} */ a) =>
        a.path.includes('gala-video'),
      ),
    );
    assert.ok(
      !site.manifest.assets.some((/** @type {any} */ a) =>
        a.path.includes('/files/'),
      ),
    );
    assert.match(
      await site.read(FIRST),
      /<div class="g-gallery" data-count="2">/,
    );
  } finally {
    await site.cleanup();
  }
});

test('a gallery changes neither the first-body-image choice, nor the stored body, nor llms and search text', async () => {
  const markdown =
    'Intro.\n\n![One](assets/one.png)\n\n![Two](assets/two.png)\n';
  const site = await render(withBody(markdown));
  try {
    const stored = normalizeAuthoredMarkdown(markdown).html;
    assert.ok(!stored.includes('g-gallery'));
    assert.equal(firstBodyImage(stored)?.path, 'assets/one.png');
    assert.ok(
      !(await site.read('fixture-1/llms-full.txt')).includes('gallery'),
    );
    assert.ok(
      !(await site.read('fixture-1/search-index.json')).includes('gallery'),
    );
    const page = await site.read(FIRST);
    // The card/OG picture is still the first image (its derivative, not the second).
    const ogImage = /<meta property="og:image" content="([^"]+)"/.exec(
      page,
    )?.[1];
    assert.ok(ogImage, 'the page has an og:image');
    const record = {
      body: stored,
      media: [
        {
          path: 'assets/one.png',
          sourceDigest: 'sha256:' + '1'.repeat(64),
          mediaType: 'image/png',
          byteLength: 1,
        },
      ],
      frontmatter: {},
    };
    assert.equal(
      /** @type {any} */ (cardMediaOf(/** @type {any} */ (record)))?.file.path,
      'assets/one.png',
    );
  } finally {
    await site.cleanup();
  }
});

test('a file block that names no inventoried PDF fails closed before anything is written', async () => {
  const { error, outputExists } = await renderExpectingRejection(
    withBody(MARKDOWN, FILES.slice(0, 3)),
  );
  assert.ok(error instanceof BuildInputValidationError);
  const [diagnostic] = /** @type {any} */ (error).diagnostics;
  assert.equal(diagnostic.code, 'MEDIA_REFERENCE_UNRESOLVED');
  assert.equal(diagnostic.rule, 'template:content-file-reference');
  assert.match(diagnostic.remediation, /docs\/Annual%20Report\.pdf/);
  assert.equal(outputExists, false);
});

test('a PDF entry the template checks itself is refused when malformed, and a PDF that is not one is refused', async () => {
  const pdfFile = (/** @type {Buffer} */ bytes) => [
    ...FILES.slice(0, 3),
    {
      path: 'docs/Annual Report.pdf',
      bytes,
      mediaType: 'application/pdf',
    },
  ];
  const notPdf = await renderExpectingRejection(
    withBody(MARKDOWN, pdfFile(Buffer.from('<html>not a pdf</html>'))),
  );
  assert.ok(notPdf.error instanceof MediaPipelineError);
  assert.equal(
    /** @type {any} */ (notPdf.error).reasonCode,
    'MEDIA_FORMAT_INVALID',
  );
  assert.equal(notPdf.outputExists, false);

  const tooBig = await renderExpectingRejection(
    withBody(
      MARKDOWN,
      pdfFile(
        Buffer.concat([Buffer.from('%PDF-'), Buffer.alloc(10 * 1024 * 1024)]),
      ),
    ),
  );
  assert.ok(tooBig.error instanceof BuildInputValidationError);
  assert.equal(
    /** @type {any} */ (tooBig.error).diagnostics[0].rule,
    'template:content-file-entry',
  );

  const mismatch = await renderExpectingRejection(
    async (buildInput, source) => {
      await setBody(buildInput, source, 0, MARKDOWN, FILES);
      const entry = buildInput.content[0].media.find(
        (/** @type {any} */ m) => m.mediaType === 'application/pdf',
      );
      entry.sourceDigest = `sha256:${'0'.repeat(64)}`;
    },
  );
  assert.ok(mismatch.error instanceof MediaPipelineError);
  assert.equal(
    /** @type {any} */ (mismatch.error).reasonCode,
    'MEDIA_SOURCE_DIGEST_MISMATCH',
  );
  assert.equal(mismatch.outputExists, false);
});

test('Recommendations: the About page section and /.well-known/recommendations.json in Ghost shape', async () => {
  let title = '';
  const site = await render(async (buildInput) => {
    title = buildInput.publication.title;
    buildInput.publication.recommendations = [
      {
        url: 'https://other.example/',
        title: 'Other <site>',
        description: 'Worth a read',
        addedOn: '2026-01-02',
      },
      { url: 'https://www.third.example/blog', title: 'Third' },
    ];
  });
  try {
    const about = await site.read(ABOUT);
    assert.match(
      about,
      new RegExp(
        `<section class="g-wrap g-recommendations" aria-labelledby="recommendations-title"><h2 id="recommendations-title" class="g-recommendations__title">Recommended by ${title}</h2>`,
      ),
    );
    assert.match(
      about,
      /<h3 class="g-recommendation__title"><a href="https:\/\/other\.example\/" rel="noopener noreferrer">Other &lt;site&gt;<\/a><\/h3><p class="g-recommendation__desc">Worth a read<\/p><p class="g-recommendation__meta"><span>other\.example<\/span><span class="g-recommendation__visit" aria-hidden="true">Visit<svg/,
    );
    assert.match(about, /<span>third\.example<\/span>/);
    assert.ok(!(await site.read(FIRST)).includes('g-recommendations'));

    const raw = await site.read(WELL_KNOWN);
    const list = JSON.parse(raw);
    assert.ok(Array.isArray(list), 'a bare array');
    assert.deepEqual(list[0], {
      url: 'https://other.example/',
      created_at: '2026-01-02T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
    });
    assert.deepEqual(Object.keys(list[1]), ['url', 'created_at', 'updated_at']);
    assert.match(
      list[1].created_at,
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
    assert.equal(list[1].created_at, list[1].updated_at);
    // The manifest accepts the dot-directory path (it validates the manifest
    // itself before returning) and says what the file is.
    const route = site.manifest.routes.find(
      (/** @type {any} */ r) => r.path === WELL_KNOWN,
    );
    assert.equal(route.routeClass, 'asset');
    assert.equal(route.mediaType, 'application/json; charset=utf-8');
    assert.equal(route.interactionBearing, false);
    const written = await readdir(
      path.join(site.outputDirectory, 'fixture-1/.well-known'),
    );
    assert.deepEqual(written, ['recommendations.json']);
  } finally {
    await site.cleanup();
  }
});

test('without recommendations there is no section and no well-known file', async () => {
  const site = await render(async () => {});
  try {
    assert.ok(!(await site.read(ABOUT)).includes('g-recommendations'));
    assert.ok(
      !site.manifest.routes.some((/** @type {any} */ r) =>
        r.path.includes('.well-known'),
      ),
    );
  } finally {
    await site.cleanup();
  }
});

test('recommendations the template does not admit fail the build, whatever the schema pin', async () => {
  const entry = { url: 'https://other.example/', title: 'Other' };
  const cases = /** @type {[string, any, RegExp][]} */ ([
    [
      'http address',
      [{ ...entry, url: 'http://other.example/' }],
      /https address/,
    ],
    [
      'credentials',
      [{ ...entry, url: 'https://u:p@other.example/' }],
      /https address/,
    ],
    ['no title', [{ url: entry.url }], /title/],
    ['unknown key', [{ ...entry, clicks: 3 }], /not allowed/],
    ['bad day', [{ ...entry, addedOn: '2026-02-30' }], /YYYY-MM-DD/],
    ['duplicate', [entry, { ...entry, title: 'Again' }], /duplicated/],
    [
      'too many',
      Array.from({ length: 25 }, (_, i) => ({
        url: `https://s${i}.example/`,
        title: `S${i}`,
      })),
      /at most 24/,
    ],
    ['not an array', { entry }, /array/],
  ]);
  for (const [label, value, pattern] of cases) {
    const { error, outputExists } = await renderExpectingRejection(
      async (buildInput) => {
        buildInput.publication.recommendations = value;
      },
    );
    assert.ok(error instanceof RenderPolicyViolationError, label);
    assert.match(/** @type {Error} */ (error).message, pattern, label);
    assert.equal(outputExists, false, label);
  }
});

test('galleries: runs of image-only paragraphs, counted by image, and nothing else', () => {
  const p = (/** @type {string} */ n) =>
    `<p><img src="${n}.png" alt="${n}" /></p>`;
  assert.equal(wrapGalleries(p('a')), p('a'), 'one image is not a gallery');
  assert.equal(
    wrapGalleries(`${p('a')}\n${p('b')}`),
    `<div class="g-gallery" data-count="2">${p('a')}\n${p('b')}</div>`,
  );
  assert.equal(
    wrapGalleries(
      `<p>t</p>\n${p('a')}\n${p('b')}\n${p('c')}\n<p>t</p>\n${p('d')}`,
    ),
    `<p>t</p>\n<div class="g-gallery" data-count="3">${p('a')}\n${p('b')}\n${p('c')}</div>\n<p>t</p>\n${p('d')}`,
  );
  assert.match(
    wrapGalleries(
      `<p><img src="a.png" alt="" /> <img src="b.png" alt="" /></p>\n${p('c')}`,
    ),
    /data-count="3"/,
  );
  const mixed = `${p('a')}\n<p>text <img src="b.png" alt="" /></p>\n${p('c')}`;
  assert.equal(
    wrapGalleries(mixed),
    mixed,
    'a paragraph with text breaks the run',
  );
  const linked = `<p><a href="x"><img src="a.png" alt="" /></a></p>\n${p('b')}`;
  assert.equal(
    wrapGalleries(linked),
    linked,
    'a linked image is not image-only',
  );
  const code = '<pre><code>&lt;p&gt;&lt;img&gt;&lt;/p&gt;\n</code></pre>';
  assert.equal(wrapGalleries(code), code);
});

test('block forms: page cards in the given language, lean feed form, unrecognised markup untouched', () => {
  const body = normalizeAuthoredMarkdown(MARKDOWN).html;
  const resolveFile = (/** @type {string} */ href) =>
    href === 'docs/Annual%20Report.pdf'
      ? { url: '/site/assets/files/x.pdf', bytes: 340 * 1024 }
      : undefined;
  const german = decorateBlocks(body, { messages: CATALOGS.de, resolveFile });
  assert.match(german, /Video abspielen /);
  assert.match(german, /Auf YouTube ansehen/);
  assert.match(german, /Auf example\.com lesen/);
  assert.match(german, /PDF herunterladen \(340 KB\)/);
  assert.match(german, /href="\/site\/assets\/files\/x\.pdf" download/);
  const unresolved = decorateBlocks(body, {
    messages: CATALOGS.en,
    resolveFile: () => undefined,
  });
  assert.match(unresolved, /href="docs\/Annual%20Report\.pdf" download/);
  assert.match(
    unresolved,
    /<span class="g-block__meta"><svg[^>]*>.*<\/svg>PDF<\/span>/,
  );
  const lean = leanBlocks(body, resolveFile);
  assert.ok(lean.includes('<a href="/site/assets/files/x.pdf">'));
  assert.ok(lean.includes('<figure class="g-video"'));
  assert.ok(!lean.includes('g-block'));
  const plain =
    '<p>Hello</p>\n<figure class="g-file" data-gala-block="file">x</figure>';
  assert.equal(
    decorateBlocks(plain, { messages: CATALOGS.en, resolveFile }),
    plain,
  );
  assert.equal(leanBlocks(plain, resolveFile), plain);
});

test('file sizes read as B, KB or MB', () => {
  assert.equal(formatFileSize(812), '812 B');
  assert.equal(formatFileSize(1024), '1 KB');
  assert.equal(formatFileSize(340 * 1024 + 100), '340 KB');
  assert.equal(formatFileSize(1.2 * 1024 * 1024), '1.2 MB');
  assert.equal(formatFileSize(2 * 1024 * 1024), '2 MB');
});
