/**
 * Listen (audio versions of posts), build side: when a build is live, the
 * audio each published post carries is copied as-is with a manifest row, and
 * every page gets the top-bar button, the config and message blobs, the UI
 * template and the script; an article with audio gets its track and the home
 * page gets the playlist. A build that is not live renders nothing of it.
 *
 * These tests build whole sites, so they need `@rathnasgala2/schemas` 3.26.0
 * (`publication.listen` and a post's `listen`).
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import {
  LISTEN_AUDIO_DIRECTORY,
  LISTEN_MESSAGE_KEYS,
  LISTEN_SCRIPT_PATH,
  audioDigestHex,
  formatListenDuration,
  listenAudioPath,
  loadListenScript,
  renderListenUi,
  resolveListen,
  serializeListenMessages,
} from '../src/core/internal/listen.js';
import { getMessages } from '../src/core/internal/messages.js';
import {
  buildGeneratedPages,
  selectPublishedArticles,
} from '../src/core/internal/page-kinds.js';
import { SUPPORTED_COMPOSITIONS } from '../src/core/internal/template-composition.js';
import { CATALOGS } from '../src/core/internal/messages/registry.js';
import { GALA_BASE_STYLESHEET_SOURCE } from '../src/core/internal/appearance/base-layer.js';
import {
  MAX_LISTEN_AUDIO_BYTES,
  processListenAudio,
} from '../src/core/internal/media/audio.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';

/** The most bytes the shipped Listen script may have (it loads on every page). */
const LISTEN_SCRIPT_MAX_BYTES = 40 * 1024;

const FIRST = 'fixture-1/first-article/index.html';
const SECOND = 'fixture-1/second-article/index.html';
const THIRD = 'fixture-1/third-article/index.html';
const UNLISTED = 'fixture-1/unlisted-article/index.html';
const HOME = 'fixture-1/index.html';
const NOT_FOUND = 'fixture-1/404.html';

/**
 * @param {string} seed a short label
 * @param {number} length how many bytes
 * @returns {Buffer} deterministic bytes that start like an MP3 with an ID3 tag
 */
function audioBytes(seed, length) {
  return Buffer.concat([
    Buffer.from('ID3'),
    Buffer.alloc(length - 3, seed.charCodeAt(0)),
  ]);
}

/**
 * Stage an audio file in the source tree and describe it as intake does.
 *
 * @param {string} sourceDirectory the render's source directory
 * @param {string} relativePath the repository path
 * @param {Buffer} bytes the file
 * @param {'audio/mpeg' | 'audio/mp4'} [mediaType]
 * @returns {Promise<{sourcePath: string, mediaType: string, bytes: number, sha256: string}>}
 */
async function stageAudio(
  sourceDirectory,
  relativePath,
  bytes,
  mediaType = 'audio/mpeg',
) {
  const absolute = path.join(sourceDirectory, relativePath);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, bytes);
  return {
    sourcePath: relativePath,
    mediaType,
    bytes: bytes.byteLength,
    sha256: `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
  };
}

/**
 * @param {any} input a build input
 * @param {string} slug a published article's slug
 * @returns {any} its content record
 */
const recordOf = (input, slug) =>
  input.content.find((/** @type {any} */ r) => r.frontmatter.slug === slug);

/**
 * The rich fixture with a third published article (the newest), Listen on, and
 * audio on the first, second and third articles, in that order of age:
 * first 424 s, second 600 s, third 3700 s.
 *
 * @param {string} sourceDirectory
 * @returns {Promise<any>}
 */
async function liveInput(sourceDirectory) {
  const input = /** @type {any} */ (await buildRichFixture());
  const third = JSON.parse(JSON.stringify(recordOf(input, 'second-article')));
  third.frontmatter.id = '019c0000-0000-7000-8000-000000000009';
  third.frontmatter.slug = 'third-article';
  third.frontmatter.title = 'Third article';
  third.frontmatter.publishedAt = '2025-09-01T09:00:00.000Z';
  third.frontmatter.createdAt = '2025-09-01T09:00:00.000Z';
  input.content.push(third);
  input.publication.listen = { enabled: true };
  const given = [
    ['first-article', 'assets/listen/first.mp3', 'a', 424, 'conversation'],
    ['second-article', 'assets/listen/second.m4a', 'b', 600, 'narration'],
    ['third-article', 'assets/listen/third.mp3', 'c', 3700, 'debate'],
  ];
  for (const [slug, file, seed, durationSeconds, format] of given) {
    const mediaType = String(file).endsWith('.m4a')
      ? 'audio/mp4'
      : 'audio/mpeg';
    recordOf(input, String(slug)).frontmatter.listen = {
      audio: await stageAudio(
        sourceDirectory,
        String(file),
        audioBytes(String(seed), 1500),
        /** @type {'audio/mpeg' | 'audio/mp4'} */ (mediaType),
      ),
      durationSeconds,
      format,
    };
  }
  return input;
}

/**
 * Render a build input into fresh directories.
 *
 * @param {(sourceDirectory: string) => Promise<any>} makeInput
 * @returns {Promise<{manifest: any, html: (file: string) => Promise<string>, read: (file: string) => Promise<Buffer>, exists: (file: string) => boolean, dirs: any, cleanup: () => Promise<void>}>}
 */
async function build(makeInput) {
  const dirs = await createRenderDirectories();
  try {
    const input = await makeInput(dirs.sourceDirectory);
    const { manifest } = await renderPublication(input, {
      outputDirectory: dirs.outputDirectory,
      workDirectory: dirs.workDirectory,
      sourceDirectory: dirs.sourceDirectory,
      provenance: testProvenance(),
    });
    return {
      manifest,
      html: async (file) =>
        readFile(path.join(dirs.outputDirectory, file), 'utf8'),
      read: (file) => readFile(path.join(dirs.outputDirectory, file)),
      exists: (file) => existsSync(path.join(dirs.outputDirectory, file)),
      dirs,
      cleanup: dirs.cleanup,
    };
  } catch (error) {
    await dirs.cleanup();
    throw error;
  }
}

/**
 * @param {string} html a page
 * @param {string} name `config`, `messages`, `current` or `tracks`
 * @returns {any} the parsed JSON blob, or `undefined` when absent
 */
function blob(html, name) {
  const match = new RegExp(
    `<script type="application/json" data-gala-listen-${name}>([\\s\\S]*?)</script>`,
  ).exec(html);
  return match ? JSON.parse(match[1]) : undefined;
}

const count = (/** @type {string} */ html, /** @type {string} */ needle) =>
  html.split(needle).length - 1;

/** What a build with Listen off or not live must not contain. */
const LISTEN_TRACES = [
  'g-listen',
  'gala-listen',
  'data-gala-listen',
  'assets/listen/',
];

/**
 * @param {Awaited<ReturnType<typeof build>>} site
 * @returns {Promise<void>}
 */
async function assertNothingOfListen(site) {
  const routes = site.manifest.routes.filter(
    (/** @type {any} */ route) =>
      route.routeClass === 'html' || route.routeClass === 'error',
  );
  assert.ok(routes.length > 5);
  for (const route of routes) {
    const html = await site.html(route.path);
    for (const trace of LISTEN_TRACES) {
      assert.ok(!html.includes(trace), `${route.path} carries ${trace}`);
    }
  }
  for (const asset of site.manifest.assets) {
    assert.ok(!/listen/.test(asset.path), `asset ${asset.path}`);
    assert.ok(!/^audio\//.test(asset.mediaType), `asset ${asset.path}`);
  }
}

test('not live: no switch, a switch off, no post with audio, or audio only on an unlisted post renders and emits nothing', async () => {
  /** @type {[string, (input: any, stage: (slug: string) => Promise<void>) => Promise<void>][]} */
  const cases = [
    [
      'no publication.listen',
      async (input, stage) => {
        await stage('first-article');
        delete input.publication.listen;
      },
    ],
    [
      'listen switched off',
      async (input, stage) => {
        await stage('first-article');
        input.publication.listen = { enabled: false };
      },
    ],
    [
      'on, but no post has audio',
      async (input) => {
        input.publication.listen = { enabled: true };
      },
    ],
    [
      'on, audio only on an unlisted post',
      async (input, stage) => {
        input.publication.listen = { enabled: true };
        await stage('unlisted-article');
      },
    ],
  ];
  for (const [label, arrange] of cases) {
    const site = await build(async () => {
      const input = /** @type {any} */ (await buildRichFixture());
      await arrange(input, async (slug) => {
        // The file need not exist: a build that is not live never reads it.
        recordOf(input, slug).frontmatter.listen = {
          audio: {
            sourcePath: 'assets/listen/missing.mp3',
            mediaType: 'audio/mpeg',
            bytes: 1500,
            sha256: `sha256:${'0'.repeat(64)}`,
          },
          durationSeconds: 424,
          format: 'conversation',
        };
      });
      return input;
    });
    try {
      await assertNothingOfListen(site);
    } catch (error) {
      assert.fail(`${label}: ${/** @type {Error} */ (error).message}`);
    } finally {
      await site.cleanup();
    }
  }
});

test('live: each published post audio is copied as-is to assets/listen/<slug>.<hash8>.<ext> with a manifest row of its media type, and an unlisted post audio is not emitted', async () => {
  const site = await build(async (sourceDirectory) => {
    const input = await liveInput(sourceDirectory);
    // Audio on an unlisted post stays unread and unemitted.
    recordOf(input, 'unlisted-article').frontmatter.listen = {
      audio: {
        sourcePath: 'assets/listen/unlisted.mp3',
        mediaType: 'audio/mpeg',
        bytes: 1500,
        sha256: `sha256:${'1'.repeat(64)}`,
      },
      durationSeconds: 90,
      format: 'skit',
    };
    return input;
  });
  try {
    for (const [slug, source, extension, mediaType, seed] of [
      ['first-article', 'first.mp3', 'mp3', 'audio/mpeg', 'a'],
      ['second-article', 'second.m4a', 'm4a', 'audio/mp4', 'b'],
      ['third-article', 'third.mp3', 'mp3', 'audio/mpeg', 'c'],
    ]) {
      const bytes = audioBytes(seed, 1500);
      const hex = createHash('sha256').update(bytes).digest('hex');
      const emitted = `fixture-1/${LISTEN_AUDIO_DIRECTORY}/${slug}.${hex.slice(0, 8)}.${extension}`;
      assert.deepEqual(await site.read(emitted), bytes, `${slug} as-is`);
      const row = site.manifest.assets.find(
        (/** @type {any} */ asset) => asset.path === emitted,
      );
      assert.ok(row, `${slug} has a manifest row`);
      assert.equal(row.mediaType, mediaType);
      assert.equal(row.byteLength, '1500');
      assert.equal(row.sha256, `sha256:${hex}`);
      assert.equal(row.immutable, true);
      assert.ok(
        site.manifest.includedSources.some(
          (/** @type {any} */ source_) =>
            source_.path === `assets/listen/${source}` &&
            source_.role === 'asset' &&
            source_.sha256 === `sha256:${hex}`,
        ),
        `${slug} source is an included source`,
      );
    }
    const audioRows = site.manifest.assets.filter((/** @type {any} */ a) =>
      a.mediaType.startsWith('audio/'),
    );
    assert.equal(audioRows.length, 3, 'only published posts audio');
    assert.ok(
      !site.manifest.assets.some((/** @type {any} */ a) =>
        a.path.includes('unlisted'),
      ),
    );
    // Manifest assets stay sorted by path.
    const paths = site.manifest.assets.map((/** @type {any} */ a) => a.path);
    assert.deepEqual(paths, [...paths].sort());
  } finally {
    await site.cleanup();
  }
});

test('audio that is missing, the wrong size or the wrong digest fails the build before anything is written', async () => {
  for (const [label, damage, reason] of /** @type {const} */ ([
    [
      'missing',
      (/** @type {any} */ listen) => {
        listen.audio.sourcePath = 'assets/listen/gone.mp3';
      },
      'MEDIA_FORMAT_INVALID',
    ],
    [
      'digest',
      (/** @type {any} */ listen) => {
        listen.audio.sha256 = `sha256:${'f'.repeat(64)}`;
      },
      'MEDIA_SOURCE_DIGEST_MISMATCH',
    ],
    [
      'size',
      (/** @type {any} */ listen) => {
        listen.audio.bytes += 1;
      },
      'MEDIA_SOURCE_DIGEST_MISMATCH',
    ],
  ])) {
    const dirs = await createRenderDirectories();
    try {
      const input = await liveInput(dirs.sourceDirectory);
      damage(recordOf(input, 'first-article').frontmatter.listen);
      await assert.rejects(
        renderPublication(input, {
          outputDirectory: dirs.outputDirectory,
          workDirectory: dirs.workDirectory,
          sourceDirectory: dirs.sourceDirectory,
          provenance: testProvenance(),
        }),
        (error) =>
          /** @type {any} */ (error).name === 'MediaPipelineError' &&
          /** @type {any} */ (error).reasonCode === reason,
        label,
      );
      assert.ok(!existsSync(dirs.outputDirectory), `${label}: nothing written`);
    } finally {
      await dirs.cleanup();
    }
  }
});

test('the audio step refuses a path that leaves the source tree and a file over the ceiling', async () => {
  const dirs = await createRenderDirectories();
  try {
    const audio = await stageAudio(
      dirs.sourceDirectory,
      'assets/listen/ok.mp3',
      audioBytes('o', 200),
    );
    /**
     * @param {Record<string, unknown>} change
     * @returns {Record<string, unknown>}
     */
    const entry = (change) => ({
      path: 'assets/listen/x.12345678.mp3',
      listen: {
        audio: { ...audio, ...change },
        durationSeconds: 5,
        format: 'skit',
      },
      record: /** @type {any} */ ({}),
      href: '/assets/listen/x.12345678.mp3',
    });
    const options = { sourceDirectory: dirs.sourceDirectory };
    const ok = await processListenAudio(
      [/** @type {any} */ (entry({}))],
      options,
    );
    assert.equal(ok.assets.length, 1);
    await assert.rejects(
      processListenAudio(
        [/** @type {any} */ (entry({ sourcePath: '../outside.mp3' }))],
        options,
      ),
      (error) =>
        /** @type {any} */ (error).reasonCode === 'MEDIA_FORMAT_INVALID',
    );
    const big = await stageAudio(
      dirs.sourceDirectory,
      'assets/listen/big.mp3',
      Buffer.alloc(MAX_LISTEN_AUDIO_BYTES + 1, 1),
    );
    await assert.rejects(
      processListenAudio([/** @type {any} */ (entry(big))], options),
      (error) =>
        /** @type {any} */ (error).reasonCode === 'MEDIA_RESOURCE_EXCEEDED',
    );
  } finally {
    await dirs.cleanup();
  }
});

test('live: every HTML page loads the script, a notice page too, and the script asset is the shipped file', async () => {
  const site = await build(liveInput);
  try {
    const htmlRoutes = site.manifest.routes.filter(
      (/** @type {any} */ r) =>
        r.routeClass === 'html' || r.routeClass === 'error',
    );
    assert.ok(htmlRoutes.length > 8);
    for (const route of htmlRoutes) {
      const html = await site.html(route.path);
      assert.equal(
        count(
          html,
          '<script src="/fixture-1/assets/gala-listen-v1.js" defer data-gala-listen-script></script>',
        ),
        1,
        route.path,
      );
      assert.equal(count(html, 'data-gala-listen-config'), 1, route.path);
      assert.equal(count(html, 'data-gala-listen-messages'), 1, route.path);
      assert.equal(
        count(html, '<template data-gala-listen-ui>'),
        1,
        route.path,
      );
      assert.equal(count(html, 'class="g-listen-nav"'), 1, route.path);
      // The script rides in the head, before the page content.
      assert.ok(
        html.indexOf('gala-listen-v1.js') < html.indexOf('<body'),
        route.path,
      );
    }
    const source = await loadListenScript();
    const emitted = await site.read(`fixture-1/${LISTEN_SCRIPT_PATH}`);
    assert.deepEqual(emitted, source);
    const row = site.manifest.assets.find(
      (/** @type {any} */ a) => a.path === `fixture-1/${LISTEN_SCRIPT_PATH}`,
    );
    assert.equal(row.mediaType, 'application/javascript; charset=utf-8');
    assert.equal(row.byteLength, String(source.byteLength));
    assert.equal(
      row.sha256,
      `sha256:${createHash('sha256').update(source).digest('hex')}`,
    );
  } finally {
    await site.cleanup();
  }
});

test('the Listen script is read from its module file and stays within its byte cap', async () => {
  const fromDisk = await readFile(
    path.resolve(
      import.meta.dirname,
      '../src/modules/interactions/browser/gala-listen.js',
    ),
  );
  assert.deepEqual(await loadListenScript(), fromDisk);
  assert.ok(
    fromDisk.byteLength < LISTEN_SCRIPT_MAX_BYTES,
    `gala-listen.js is ${fromDisk.byteLength} bytes; the cap is ${LISTEN_SCRIPT_MAX_BYTES}`,
  );
});

test('the top-bar button: a button opening this post on an article with audio, a link to the playlist everywhere else, after the search button', async () => {
  const site = await build(liveInput);
  try {
    const button = (/** @type {string} */ html) =>
      /<button type="button" class="g-listen-nav" data-gala-listen-open="current" aria-label="Listen to this post"><svg [^>]*>.*?<\/svg><span class="g-listen-nav__label">Listen<\/span><\/button>/.exec(
        html,
      );
    const link = (/** @type {string} */ html) =>
      /<a class="g-listen-nav" href="\/fixture-1\/#listen" data-gala-listen-open="playlist"><svg [^>]*>.*?<\/svg><span class="g-listen-nav__label">Listen<\/span><\/a>/.exec(
        html,
      );
    for (const file of [FIRST, SECOND, THIRD]) {
      const html = await site.html(file);
      assert.ok(button(html), `${file}: button`);
      assert.ok(!link(html), `${file}: no link`);
    }
    // An unlisted article (no audio), the home page, a page and a notice: the link.
    for (const file of [
      UNLISTED,
      HOME,
      NOT_FOUND,
      'fixture-1/about/index.html',
    ]) {
      const html = await site.html(file);
      assert.ok(link(html), `${file}: link`);
      assert.ok(!button(html), `${file}: no button`);
    }
    const html = await site.html(FIRST);
    const actions = html.slice(html.indexOf('<div class="g-actions">'));
    assert.ok(
      actions.indexOf('g-search-btn') < actions.indexOf('g-listen-nav') &&
        actions.indexOf('g-listen-nav') <
          actions.indexOf('data-gala-slot="header-actions"'),
      'search, Listen, then the appearance slot',
    );
    assert.equal(count(html, 'data-gala-listen-open'), 1);
    // The button is in the header landmark.
    const header = html.slice(
      html.indexOf('<header'),
      html.indexOf('</header>'),
    );
    assert.ok(header.includes('g-listen-nav'));
  } finally {
    await site.cleanup();
  }
});

test('the home page playlist: after the intro and before the post list, newest first, a plain list of links with the controls hidden', async () => {
  const site = await build(liveInput);
  try {
    const html = await site.html(HOME);
    assert.equal(count(html, 'data-gala-listen-list'), 1);
    const section =
      /<section id="listen" class="g-listen-list" aria-labelledby="g-listen-list-title" data-gala-listen-list>[\s\S]*?<\/section>/.exec(
        html,
      );
    assert.ok(section, 'the section');
    const at = section.index;
    assert.ok(html.indexOf('id="hero-title"') < at, 'after the intro');
    assert.ok(at < html.indexOf('id="latest-title"'), 'before the post list');
    const markup = section[0];
    assert.match(
      markup,
      /<h2 id="g-listen-list-title">Listen to this blog<\/h2>/,
    );
    assert.match(
      markup,
      /<p class="g-listen-list__summary">3 episodes · 1 h 19 min<\/p>/,
    );
    assert.match(
      markup,
      /<div class="g-listen-list__controls" data-gala-listen-controls hidden>/,
    );
    assert.match(
      markup,
      /<button type="button" data-gala-listen-act="play-all">/,
    );
    assert.match(
      markup,
      /<button type="button" data-gala-listen-act="shuffle">/,
    );
    assert.match(markup, /<label for="g-listen-order">Order<\/label>/);
    assert.match(
      markup,
      /<select id="g-listen-order" data-gala-listen-order><option value="newest">Newest first<\/option><option value="oldest">Oldest first<\/option><\/select>/,
    );
    assert.match(
      markup,
      /<ol class="g-listen-list__tracks" data-gala-listen-tracklist>/,
    );
    assert.match(
      markup,
      /<button type="button" data-gala-listen-act="show-all" hidden>Show all 3<\/button>/,
    );
    // Rows, newest first; each play button is hidden and named after its post.
    const rows = [
      ...markup.matchAll(/<li data-gala-listen-track="([^"]+)">(.*?)<\/li>/g),
    ];
    assert.deepEqual(
      rows.map((row) => row[1]),
      [
        '019c0000-0000-7000-8000-000000000009',
        '019c0000-0000-7000-8000-000000000003',
        '019c0000-0000-7000-8000-000000000001',
      ],
    );
    assert.match(
      rows[0][2],
      /^<button type="button" data-gala-listen-act="play-track" data-gala-listen-track-id="019c0000-0000-7000-8000-000000000009" aria-label="Play Third article" hidden><svg [^>]*>.*?<\/svg><\/button><a href="\/fixture-1\/third-article\/">Third article<\/a> <span class="g-listen-list__len">1 h 2 min<\/span> <time datetime="2025-09-01T09:00:00.000Z">Sep 1, 2025<\/time>$/,
    );
    assert.match(rows[1][2], /<span class="g-listen-list__len">10 min<\/span>/);
    assert.match(rows[2][2], /<span class="g-listen-list__len">7 min<\/span>/);
    // The tracks blob: the same episodes, newest first, with the contract's members.
    const tracks = blob(html, 'tracks');
    assert.deepEqual(
      tracks.map((/** @type {any} */ t) => t.slug),
      ['third-article', 'second-article', 'first-article'],
    );
    assert.deepEqual(Object.keys(tracks[0]), [
      'id',
      'slug',
      'title',
      'url',
      'audio',
      'durationSeconds',
      'format',
      'publishedAt',
    ]);
    const hexOf = async (/** @type {string} */ file) =>
      createHash('sha256')
        .update(await readFile(path.join(site.dirs.sourceDirectory, file)))
        .digest('hex')
        .slice(0, 8);
    assert.deepEqual(tracks[2], {
      id: '019c0000-0000-7000-8000-000000000001',
      slug: 'first-article',
      title: 'First article',
      url: '/fixture-1/first-article/',
      audio: `/fixture-1/assets/listen/first-article.${await hexOf('assets/listen/first.mp3')}.mp3`,
      durationSeconds: 424,
      format: 'conversation',
      publishedAt: '2025-01-10T09:00:00.000Z',
    });
    assert.equal(tracks[1].format, 'narration');
    assert.ok(tracks[1].audio.endsWith('.m4a'));
    // Only the home page carries the list; the tracks blob is nowhere else.
    for (const file of [
      FIRST,
      SECOND,
      UNLISTED,
      'fixture-1/archive/index.html',
      NOT_FOUND,
    ]) {
      const other = await site.html(file);
      assert.ok(!other.includes('data-gala-listen-list'), file);
      assert.ok(!other.includes('data-gala-listen-tracks'), file);
    }
  } finally {
    await site.cleanup();
  }
});

test('the playlist comes before the post list in each of the five compositions, once, on the first home page only', async () => {
  const dirs = await createRenderDirectories();
  try {
    const input = await liveInput(dirs.sourceDirectory);
    const articles = selectPublishedArticles(input.content);
    const listen = resolveListen({
      publication: input.publication,
      articles,
      hrefOf: (filePath) => `/fixture-1/${filePath}`,
    });
    assert.equal(listen.live, true);
    assert.equal(SUPPORTED_COMPOSITIONS.length, 5);
    for (const composition of SUPPORTED_COMPOSITIONS) {
      const pages = buildGeneratedPages(input, {
        pageBody: (/** @type {string} */ body) => body,
        composition: { ...composition },
        listen,
      });
      const home = pages.find(
        (page) => page.kind === 'index' && page.route === '/',
      );
      assert.ok(home, composition.profile);
      const list = home.bodyHtml.indexOf('<section id="listen"');
      assert.ok(list >= 0, `${composition.profile}: playlist`);
      assert.equal(count(home.bodyHtml, 'id="listen"'), 1, composition.profile);
      assert.ok(
        list < home.bodyHtml.indexOf('id="latest-title"'),
        `${composition.profile}: before the post list`,
      );
      // No other page carries it, and only an article with audio has a track.
      for (const page of pages.filter((p) => p !== home)) {
        assert.ok(!page.bodyHtml.includes('data-gala-listen'), page.route);
      }
      assert.deepEqual(
        pages.filter((page) => page.listenTrack).map((page) => page.route),
        ['/first-article', '/second-article', '/third-article'],
      );
    }
  } finally {
    await dirs.cleanup();
  }
});

test('a single post still gets a playlist, with the singular summary', async () => {
  const site = await build(async (sourceDirectory) => {
    const input = await liveInput(sourceDirectory);
    input.content = input.content.filter(
      (/** @type {any} */ r) => r.frontmatter.slug === 'first-article',
    );
    return input;
  });
  try {
    const html = await site.html(HOME);
    assert.match(
      html,
      /<p class="g-listen-list__summary">1 episode · 7 min<\/p>/,
    );
    assert.match(
      html,
      /<button [^>]*data-gala-listen-act="show-all" hidden>Show all 1<\/button>/,
    );
    assert.equal(blob(html, 'tracks').length, 1);
  } finally {
    await site.cleanup();
  }
});

test('an article with audio carries its own track; one without carries none', async () => {
  const site = await build(liveInput);
  try {
    const first = await site.html(FIRST);
    assert.equal(count(first, 'data-gala-listen-current'), 1);
    assert.deepEqual(blob(first, 'current'), {
      id: '019c0000-0000-7000-8000-000000000001',
      slug: 'first-article',
      title: 'First article',
      url: '/fixture-1/first-article/',
      audio: blob(await site.html(HOME), 'tracks')[2].audio,
      durationSeconds: 424,
      format: 'conversation',
      publishedAt: '2025-01-10T09:00:00.000Z',
    });
    assert.equal(blob(await site.html(THIRD), 'current').durationSeconds, 3700);
    for (const file of [
      UNLISTED,
      HOME,
      NOT_FOUND,
      'fixture-1/about/index.html',
    ]) {
      assert.equal(blob(await site.html(file), 'current'), undefined, file);
    }
    // The config is the same on every page, with absolute paths.
    const config = blob(first, 'config');
    assert.deepEqual(config, {
      siteTitle: 'fixture-1',
      playlistUrl: '/fixture-1/#listen',
      artwork: null,
    });
    assert.deepEqual(blob(await site.html(HOME), 'config'), config);
  } finally {
    await site.cleanup();
  }
});

test('the UI template carries the invitation and the player of the DOM contract', async () => {
  const site = await build(liveInput);
  try {
    const html = await site.html(FIRST);
    const template =
      /<template data-gala-listen-ui>([\s\S]*?)<\/template>/.exec(html)?.[1];
    assert.ok(template);
    assert.equal(
      template,
      renderListenUi(getMessages('en')).replace(
        /^<template data-gala-listen-ui>|<\/template>$/g,
        '',
      ),
    );
    assert.match(
      template,
      /^<aside class="g-listen" aria-labelledby="g-listen-title">/,
    );
    assert.match(
      template,
      /<p class="g-listen__title" id="g-listen-title">Hands busy\? Listen instead\.<\/p>/,
    );
    assert.match(
      template,
      /<p class="g-listen__body" data-gala-listen-slot="invite-body"><\/p>/,
    );
    assert.match(
      template,
      /<p class="g-listen__note">AI voices, adapted from this post\.<\/p>/,
    );
    assert.match(
      template,
      /<div class="g-listen__player" role="region" aria-label="Audio player" hidden>/,
    );
    assert.match(
      template,
      /<input class="g-listen__seek" id="g-listen-seek" type="range" min="0" step="1" value="0" aria-label="Position">/,
    );
    assert.match(
      template,
      /<a class="g-listen__name" data-gala-listen-slot="name" href=""><\/a>/,
    );
    assert.match(
      template,
      /<p class="g-listen__status" data-gala-listen-slot="status" aria-live="polite"><\/p>/,
    );
    assert.match(template, /<audio preload="none"><\/audio><\/aside>$/);
    const acts = [
      ...template.matchAll(/data-gala-listen-act="([a-z-]+)"/g),
    ].map((m) => m[1]);
    assert.deepEqual(acts, [
      'yes',
      'no',
      'later',
      'prev',
      'back',
      'toggle',
      'next',
      'speed',
      'stop',
    ]);
    // Previous and next start hidden; the toggle holds both icons, play hidden.
    assert.match(
      template,
      /data-gala-listen-act="prev" aria-label="Previous episode" hidden>/,
    );
    assert.match(
      template,
      /data-gala-listen-act="next" aria-label="Next episode" hidden>/,
    );
    assert.match(
      template,
      /data-gala-listen-act="toggle" aria-label="Pause"><svg class="g-icon i-pause"[^>]*><rect[^>]*\/><rect[^>]*\/><\/svg><svg class="g-icon i-play"[^>]* hidden>/,
    );
    assert.equal(count(template, '<g class="g-bars"'), 2);
    assert.equal(count(template, '<rect x="3" y="6"'), 2);
    assert.match(template, /data-gala-listen-act="speed">1×<\/button>/);
    assert.ok(!/ on[a-z]+=|javascript:/.test(template), 'no inline handler');
    // Every control has an accessible name.
    for (const button of template.matchAll(/<button [^>]*>.*?<\/button>/g)) {
      const named =
        /aria-label="[^"]+"/.test(button[0]) ||
        />[^<]*[A-Za-z0-9×][^<]*<\/button>/.test(button[0]) ||
        /<\/svg>[^<]+<\/button>/.test(button[0]);
      assert.ok(named, button[0]);
    }
  } finally {
    await site.cleanup();
  }
});

test('the messages blob has every key of the design, with placeholders, in the page language', async () => {
  const site = await build(liveInput);
  try {
    const messages = blob(await site.html(FIRST), 'messages');
    assert.deepEqual(
      Object.keys(messages),
      LISTEN_MESSAGE_KEYS.map(([key]) => key),
    );
    assert.equal(Object.keys(messages).length, 35);
    assert.deepEqual(messages, {
      'nav.label': 'Listen',
      'nav.current': 'Listen to this post',
      'invite.title': 'Hands busy? Listen instead.',
      'invite.body.conversation':
        'This post is also a {minutes}-minute conversation. Good for a drive, a workout or the dishes.',
      'invite.body.narration':
        'This post is also a {minutes}-minute narration. Good for a drive, a workout or the dishes.',
      'invite.body.debate':
        'This post is also a {minutes}-minute debate. Good for a drive, a workout or the dishes.',
      'invite.body.skit':
        'This post is also a {minutes}-minute skit. Good for a drive, a workout or the dishes.',
      'invite.play': 'Play it',
      'invite.decline': 'No thanks',
      'invite.note': 'AI voices, adapted from this post.',
      'invite.close': 'Close for now',
      'player.region': 'Audio player',
      'player.nowPlaying': 'Now playing',
      'player.position': '{index} of {count}',
      'player.play': 'Play',
      'player.pause': 'Pause',
      'player.back': 'Back 15 seconds',
      'player.previous': 'Previous episode',
      'player.next': 'Next episode',
      'player.speed': 'Playback speed {rate} times',
      'player.seek': 'Position',
      'player.time': '{elapsed} of {total}',
      'player.close': 'Stop and close',
      'player.playing': 'Playing: {title}',
      'list.heading': 'Listen to this blog',
      'list.summary': '{count} episodes · {duration}',
      'list.playAll': 'Play all',
      'list.shuffle': 'Shuffle',
      'list.order': 'Order',
      'list.newest': 'Newest first',
      'list.oldest': 'Oldest first',
      'list.showAll': 'Show all {count}',
      'list.playTrack': 'Play {title}',
      'duration.minutes': '{minutes} min',
      'duration.hoursMinutes': '{hours} h {minutes} min',
    });
  } finally {
    await site.cleanup();
  }
});

test('every locale answers every Listen key with its placeholders, so no page can show a raw key', () => {
  const tags = Object.keys(CATALOGS);
  assert.equal(tags.length, 58);
  for (const tag of tags) {
    const messages = JSON.parse(serializeListenMessages(CATALOGS[tag]));
    assert.deepEqual(
      Object.keys(messages),
      LISTEN_MESSAGE_KEYS.map(([key]) => key),
      tag,
    );
    for (const [key, , params = []] of LISTEN_MESSAGE_KEYS) {
      const value = messages[key];
      assert.equal(typeof value, 'string', `${tag}.${key}`);
      assert.ok(
        value.trim() !== '' && !value.includes('undefined'),
        `${tag}.${key}`,
      );
      for (const param of params) {
        assert.ok(
          value.includes(`{${param}}`),
          `${tag}.${key} keeps {${param}}`,
        );
      }
      // No stray placeholder, and no unfilled template syntax.
      for (const found of value.matchAll(/\{(\w+)\}/g)) {
        assert.ok(params.includes(found[1]), `${tag}.${key}: {${found[1]}}`);
      }
      assert.ok(!value.includes('${'), `${tag}.${key}`);
    }
  }
});

test('the plural form follows the repository: two forms where the language has them, a label with the number elsewhere', () => {
  const summary = (/** @type {string} */ tag, /** @type {string} */ count) =>
    /** @type {(c: string, d: string) => string} */ (
      CATALOGS[tag].listenListSummary
    )(count, '7 min');
  assert.equal(summary('en', '1'), '1 episode · 7 min');
  assert.equal(summary('en', '2'), '2 episodes · 7 min');
  assert.equal(summary('de', '1'), '1 Folge · 7 min');
  assert.equal(summary('de', '5'), '5 Folgen · 7 min');
  assert.equal(summary('fr', '1'), '1 épisode · 7 min');
  assert.equal(summary('he', '1'), 'פרק אחד · 7 min');
  // Complex plurals use the label form, like `articleCountLabel`.
  assert.equal(summary('ru', '1'), 'Выпусков: 1 · 7 min');
  assert.equal(summary('pl', '5'), 'Odcinków: 5 · 7 min');
  assert.equal(summary('ar', '3'), 'عدد الحلقات: 3 · 7 min');
  // No plural at all.
  assert.equal(summary('ja', '1'), '1エピソード · 7 min');
  assert.equal(summary('vi', '9'), '9 tập · 7 min');
});

test('a site in another language gets the Listen strings in that language', async () => {
  const site = await build(async (sourceDirectory) => {
    const input = await liveInput(sourceDirectory);
    input.publication.defaultLanguage = 'de';
    return input;
  });
  try {
    const article = await site.html(FIRST);
    const messages = blob(article, 'messages');
    assert.equal(messages['nav.label'], 'Anhören');
    assert.equal(messages['list.summary'], '{count} Folgen · {duration}');
    assert.match(
      article,
      /aria-label="Diesen Beitrag anhören"><svg [^>]*>.*?<\/svg><span class="g-listen-nav__label">Anhören<\/span>/,
    );
    assert.ok(article.includes('Nein, danke'));
    const home = await site.html(HOME);
    assert.match(
      home,
      /<h2 id="g-listen-list-title">Diesen Blog anhören<\/h2>/,
    );
    assert.match(
      home,
      /<p class="g-listen-list__summary">3 Folgen · 1 Std\. 19 Min\.<\/p>/,
    );
    assert.match(
      home,
      /aria-label="Third article abspielen" hidden|aria-label="Third article abspielen"/,
    );
  } finally {
    await site.cleanup();
  }
});

test('a post title cannot break out of a JSON blob or the markup', async () => {
  const hostile =
    'Echo </script><img src=x onerror=alert(1)> & "quotes" \u2028';
  const site = await build(async (sourceDirectory) => {
    const input = await liveInput(sourceDirectory);
    recordOf(input, 'first-article').frontmatter.title = hostile;
    return input;
  });
  try {
    for (const file of [FIRST, HOME]) {
      const html = await site.html(file);
      const blobs = [
        ...html.matchAll(
          /<script type="application\/json" data-gala-listen-[a-z]+>([\s\S]*?)<\/script>/g,
        ),
      ];
      assert.ok(blobs.length >= 3, file);
      for (const [, body] of blobs) {
        assert.ok(!/[<>&\u2028]/.test(body), `${file}: escaped`);
        JSON.parse(body);
      }
    }
    const tracks = blob(await site.html(HOME), 'tracks');
    assert.equal(
      tracks.find((/** @type {any} */ t) => t.slug === 'first-article').title,
      hostile,
    );
    const home = await site.html(HOME);
    assert.ok(!home.includes('<img src=x onerror'), 'escaped in the list rows');
    assert.ok(
      home.includes(
        'Echo &lt;/script&gt;&lt;img src=x onerror=alert(1)&gt; &amp; &quot;quotes&quot;',
      ),
    );
  } finally {
    await site.cleanup();
  }
});

test('a build with a brand mark names it as the artwork, an absolute URL', async () => {
  const site = await build(async (sourceDirectory) => {
    const input = await liveInput(sourceDirectory);
    // A tiny valid PNG as the brand mark.
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64',
    );
    await mkdir(path.join(sourceDirectory, 'assets'), { recursive: true });
    await writeFile(path.join(sourceDirectory, 'assets/mark.png'), png);
    input.appearance.brandMark = {
      path: 'assets/mark.png',
      sourceDigest: `sha256:${createHash('sha256').update(png).digest('hex')}`,
    };
    return input;
  });
  try {
    const config = blob(await site.html(FIRST), 'config');
    assert.match(
      config.artwork,
      /^https:\/\/fixture-1\.example\.com\/fixture-1\/assets\/media\/[0-9a-f]{64}\/original\.png$/,
    );
  } finally {
    await site.cleanup();
  }
});

test('helpers: the audio path, the digest forms and the minutes shown', () => {
  const hex = 'ab12cd34'.padEnd(64, 'e');
  assert.equal(audioDigestHex(`sha256:${hex}`), hex);
  assert.equal(audioDigestHex(hex), hex);
  assert.equal(audioDigestHex('sha256:nope'), undefined);
  assert.equal(
    listenAudioPath('my-post', {
      sourcePath: 'assets/listen/a.mp3',
      mediaType: 'audio/mpeg',
      bytes: 5,
      sha256: `sha256:${hex}`,
    }),
    'assets/listen/my-post.ab12cd34.mp3',
  );
  assert.equal(
    listenAudioPath('my-post', {
      sourcePath: 'assets/listen/a.m4a',
      mediaType: 'audio/mp4',
      bytes: 5,
      sha256: hex,
    }),
    'assets/listen/my-post.ab12cd34.m4a',
  );
  const en = getMessages('en');
  // max(1, round(seconds / 60)); an hour and over reads as hours and minutes.
  assert.equal(formatListenDuration(10, en), '1 min');
  assert.equal(formatListenDuration(89, en), '1 min');
  assert.equal(formatListenDuration(90, en), '2 min');
  assert.equal(formatListenDuration(424, en), '7 min');
  assert.equal(formatListenDuration(3570, en), '1 h 0 min');
  assert.equal(formatListenDuration(3700, en), '1 h 2 min');
  assert.equal(formatListenDuration(10800, en), '3 h 0 min');
});

test('the base layer styles the card, the button and the list with tokens, above the page and below the consent banner', () => {
  const css = GALA_BASE_STYLESHEET_SOURCE;
  const rule = (/** @type {string} */ selector) => {
    const start = css.indexOf(`\n${selector} {`);
    assert.ok(start >= 0, selector);
    return css.slice(start, css.indexOf('}', start));
  };
  assert.match(rule('.g-listen'), /position: fixed; z-index: 55;/);
  assert.match(rule('.g-listen'), /env\(safe-area-inset-right, 0px\)/);
  assert.match(rule('.g-listen'), /env\(safe-area-inset-bottom, 0px\)/);
  assert.match(rule('.g-listen'), /box-shadow: var\(--gala-shadow-dialog\)/);
  assert.match(
    rule('.g-listen'),
    /animation: g-listen-in 460ms var\(--gala-ease-spring\) both/,
  );
  assert.match(
    rule('.g-listen[data-leaving]'),
    /200ms var\(--gala-ease-standard\)/,
  );
  assert.match(
    css,
    /@media \(max-width: 480px\) \{\n\.g-listen \{ left: calc\(12px \+ env\(safe-area-inset-left, 0px\)\)/,
  );
  // The consent banner and the toast stay above the card.
  assert.match(css, /\.g-consent \{[^}]*z-index: 60;/);
  assert.match(css, /\.g-toast \{[^}]*z-index: 60;/);
  // Reduced motion: opacity only, bars still, outranking the blanket rule.
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\) \{\n\[data-gala-publication-root\] \.g-listen \{ animation: g-listen-fade 160ms linear both !important; \}/,
  );
  assert.match(css, /\.g-bars rect \{ animation: none !important; \}/);
  // The nav label shows from 600px and is visually hidden, not removed, below.
  assert.match(
    css,
    /\.g-listen-nav__label \{ position: absolute; width: 1px; height: 1px;/,
  );
  assert.match(css, /@media \(min-width: 600px\) \{\n\.g-listen-nav \{/);
  assert.ok(!/\.g-listen-nav__label \{[^}]*display: none/.test(css));
  // A disabled control (next on the last episode) is muted, not just unclickable.
  assert.match(
    css,
    /\.g-listen :is\(\.g-listen__round, [^)]*\):disabled \{\nbackground: var\(--gala-color-surface-raised\); background-image: none; color: var\(--gala-color-text-faint\);\nborder: var\(--gala-border-width\) dashed var\(--gala-color-border\);[^}]*opacity: \.6; cursor: not-allowed;/,
  );
  // The playlist is a card like the series card.
  assert.match(
    rule('.g-listen-list'),
    /background: var\(--gala-color-surface\); border: var\(--gala-border-card\)/,
  );
});
