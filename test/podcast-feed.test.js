/**
 * The podcast feed (`/feed/podcast.xml`): with Listen on, `listen.podcast`
 * enabled and at least one published, indexable article with audio, an RSS 2.0
 * feed with the iTunes namespace lists those articles newest first. It is
 * absent otherwise; the cover is held to the artwork rule before anything is
 * written; the member is validated by the template and kept out of the schema
 * validation (`internal/forward-compat.js`).
 *
 * These tests build whole sites, so they need `@rathnasgala2/schemas` 3.26.0 or
 * later (`publication.listen` and a post's `listen`).
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import { encodePng } from '../src/core/internal/media/png-codec.js';
import { withoutForwardMembers } from '../src/core/internal/forward-compat.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';

const HOME = 'fixture-1/index.html';
const FEED = 'fixture-1/feed/podcast.xml';
const ORIGIN = 'https://fixture-1.example.com/fixture-1';

/** @type {Map<number, Buffer>} */
const covers = new Map();

/**
 * @param {number} width
 * @param {number} height
 * @returns {Buffer} a PNG of that size
 */
function cover(width, height) {
  const key = width * 100000 + height;
  if (!covers.has(key)) {
    covers.set(
      key,
      encodePng({ width, height, rgba: Buffer.alloc(width * height * 4, 200) }),
    );
  }
  return /** @type {Buffer} */ (covers.get(key));
}

/**
 * @param {string} sourceDirectory
 * @param {string} relativePath
 * @param {Buffer} bytes
 * @returns {Promise<{path: string, sourceDigest: string}>}
 */
async function stage(sourceDirectory, relativePath, bytes) {
  const absolute = path.join(sourceDirectory, relativePath);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, bytes);
  return {
    path: relativePath,
    sourceDigest: `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
  };
}

/**
 * @param {any} input
 * @param {string} slug
 * @returns {any} the content record
 */
const recordOf = (input, slug) =>
  input.content.find((/** @type {any} */ r) => r.frontmatter.slug === slug);

/**
 * The rich fixture with Listen on, a third published article, audio on the
 * first (mp3), second (m4a) and third articles, and the podcast feed on.
 *
 * @param {string} sourceDirectory
 * @param {{size?: [number, number], podcast?: any, listen?: boolean}} [options]
 * @returns {Promise<any>}
 */
async function podcastInput(
  sourceDirectory,
  { size = [1400, 1400], podcast, listen = true } = {},
) {
  const input = /** @type {any} */ (await buildRichFixture());
  const third = JSON.parse(JSON.stringify(recordOf(input, 'second-article')));
  third.frontmatter.id = '019c0000-0000-7000-8000-000000000009';
  third.frontmatter.slug = 'third-article';
  third.frontmatter.title = 'Third article';
  third.frontmatter.publishedAt = '2025-09-01T09:00:00.000Z';
  third.frontmatter.createdAt = '2025-09-01T09:00:00.000Z';
  input.content.push(third);
  for (const [slug, file, type, seed, seconds] of [
    ['first-article', 'assets/listen/first.mp3', 'audio/mpeg', 'a', 424],
    ['second-article', 'assets/listen/second.m4a', 'audio/mp4', 'b', 600],
    ['third-article', 'assets/listen/third.mp3', 'audio/mpeg', 'c', 3700],
  ]) {
    const bytes = Buffer.concat([
      Buffer.from('ID3'),
      Buffer.alloc(1497, String(seed).charCodeAt(0)),
    ]);
    const staged = await stage(sourceDirectory, String(file), bytes);
    recordOf(input, String(slug)).frontmatter.listen = {
      audio: {
        sourcePath: staged.path,
        mediaType: type,
        bytes: bytes.byteLength,
        sha256: staged.sourceDigest,
      },
      durationSeconds: seconds,
      format: 'conversation',
    };
  }
  const coverRef = await stage(
    sourceDirectory,
    'assets/cover.png',
    cover(size[0], size[1]),
  );
  input.publication.listen = {
    enabled: listen,
    podcast: podcast ?? {
      enabled: true,
      category: 'Technology',
      explicit: false,
      cover: coverRef,
      description: 'Posts, read aloud.',
      ownerEmail: 'owner@example.com',
    },
  };
  return input;
}

/**
 * @param {(sourceDirectory: string) => Promise<any>} makeInput
 * @returns {Promise<any>} the built site
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
      dirs,
      html: (/** @type {string} */ file) =>
        readFile(path.join(dirs.outputDirectory, file), 'utf8'),
      exists: (/** @type {string} */ file) =>
        existsSync(path.join(dirs.outputDirectory, file)),
      cleanup: dirs.cleanup,
    };
  } catch (error) {
    await dirs.cleanup();
    throw error;
  }
}

test('live: the feed lists the articles with audio, newest first, with the iTunes channel and item tags', async () => {
  const site = await build((dir) => podcastInput(dir));
  try {
    const xml = await site.html(FEED);
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<rss '));
    assert.match(
      xml,
      /xmlns:itunes="http:\/\/www\.itunes\.com\/dtds\/podcast-1\.0\.dtd"/,
    );
    // Channel.
    const channel = xml.slice(0, xml.indexOf('<item>'));
    assert.match(channel, /<title>[^<]+<\/title>/);
    assert.match(
      channel,
      /<link>https:\/\/fixture-1\.example\.com\/fixture-1\/<\/link>/,
    );
    assert.match(channel, /<description>Posts, read aloud\.<\/description>/);
    assert.match(channel, /<language>[a-z-]+<\/language>/i);
    assert.match(
      channel,
      new RegExp(
        `<atom:link href="${ORIGIN}/feed/podcast\\.xml" rel="self" type="application/rss\\+xml"/>`,
      ),
    );
    assert.match(channel, /<itunes:author>[^<]+<\/itunes:author>/);
    assert.match(
      channel,
      /<itunes:owner><itunes:name>[^<]+<\/itunes:name><itunes:email>owner@example\.com<\/itunes:email><\/itunes:owner>/,
    );
    assert.match(channel, /<itunes:category text="Technology"\/>/);
    assert.match(channel, /<itunes:explicit>false<\/itunes:explicit>/);
    const image = /<itunes:image href="([^"]+)"\/>/.exec(channel)?.[1] ?? '';
    assert.match(
      image,
      new RegExp(`^${ORIGIN}/assets/media/[0-9a-f]{64}/original\\.png$`),
    );
    const coverFile = image.slice(ORIGIN.length + 1);
    assert.ok(site.exists(`fixture-1/${coverFile}`), 'the cover is emitted');
    // Items: newest first.
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    assert.equal(items.length, 3);
    const titles = items.map((i) => /<title>([^<]+)</.exec(i)?.[1]);
    assert.deepEqual(titles, ['Third article', ...titles.slice(1)]);
    assert.ok(titles.every((t) => t !== undefined));
    const third = items[0];
    assert.match(
      third,
      /<link>https:\/\/fixture-1\.example\.com\/fixture-1\/third-article\/<\/link>/,
    );
    assert.match(
      third,
      /<guid isPermaLink="true">https:\/\/fixture-1\.example\.com\/fixture-1\/third-article\/<\/guid>/,
    );
    assert.match(
      third,
      /<pubDate>[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} 2025 09:00:00 GMT<\/pubDate>/,
    );
    assert.match(third, /<description>[^<]+<\/description>/);
    assert.match(
      third,
      new RegExp(
        `<enclosure url="${ORIGIN}/assets/listen/third-article\\.[0-9a-f]{8}\\.mp3" length="1500" type="audio/mpeg"/>`,
      ),
    );
    assert.match(third, /<itunes:duration>3700<\/itunes:duration>/);
    // The m4a article is an Apple-accepted type.
    assert.ok(
      items.some((i) => /length="1500" type="audio\/x-m4a"\/>/.test(i)),
    );
    // Every audio URL in the feed is an emitted file.
    for (const url of xml.match(/enclosure url="([^"]+)"/g) ?? []) {
      const file = url.slice('enclosure url="'.length + ORIGIN.length + 1, -1);
      assert.ok(site.exists(`fixture-1/${file}`), file);
    }
  } finally {
    await site.cleanup();
  }
});

test('live: the manifest lists the feed as a feed, and every page links it next to the other feeds', async () => {
  const site = await build((dir) => podcastInput(dir));
  try {
    const row = site.manifest.routes.find(
      (/** @type {any} */ r) => r.path === FEED,
    );
    assert.equal(row.routeClass, 'feed');
    assert.equal(row.mediaType, 'application/rss+xml; charset=utf-8');
    const home = await site.html(HOME);
    assert.equal(
      home.match(
        new RegExp(
          `<link rel="alternate" type="application/rss\\+xml" href="${ORIGIN}/feed/podcast\\.xml" title="[^"]+">`,
          'g',
        ),
      )?.length,
      1,
    );
    assert.ok(home.includes(`href="${ORIGIN}/feed/rss.xml"`));
  } finally {
    await site.cleanup();
  }
});

test('absent: switched off, Listen off, no article with audio', async () => {
  for (const [label, make] of /** @type {const} */ ([
    [
      'podcast off',
      async (/** @type {string} */ dir) => {
        const input = await podcastInput(dir);
        input.publication.listen.podcast.enabled = false;
        return input;
      },
    ],
    [
      'listen off',
      (/** @type {string} */ dir) => podcastInput(dir, { listen: false }),
    ],
    [
      'no audio',
      async (/** @type {string} */ dir) => {
        const input = await podcastInput(dir);
        for (const record of input.content) delete record.frontmatter.listen;
        return input;
      },
    ],
  ])) {
    const site = await build(make);
    try {
      assert.ok(!site.exists(FEED), `${label}: no feed`);
      assert.ok(
        !(await site.html(HOME)).includes('podcast.xml'),
        `${label}: no link`,
      );
      assert.ok(
        !site.manifest.routes.some((/** @type {any} */ r) =>
          r.path.includes('podcast'),
        ),
        label,
      );
    } finally {
      await site.cleanup();
    }
  }
});

test('posts that are unlisted or noindex stay out, and one remaining article still makes a feed', async () => {
  const site = await build(async (dir) => {
    const input = await podcastInput(dir);
    recordOf(input, 'third-article').frontmatter.seo = { noindex: true };
    recordOf(input, 'second-article').frontmatter.status = 'unlisted';
    return input;
  });
  try {
    const xml = await site.html(FEED);
    assert.equal(xml.match(/<item>/g)?.length, 1);
    assert.ok(!xml.includes('third-article'));
    assert.ok(!xml.includes('second-article'));
    assert.ok(xml.includes('first-article'));
  } finally {
    await site.cleanup();
  }
});

test('the description is the site description when the podcast has none, and no owner is written without an address', async () => {
  const site = await build(async (dir) => {
    const input = await podcastInput(dir);
    delete input.publication.listen.podcast.description;
    delete input.publication.listen.podcast.ownerEmail;
    input.publication.listen.podcast.explicit = true;
    return input;
  });
  try {
    const xml = await site.html(FEED);
    assert.ok(
      xml.includes(
        `<description>${
          /<description>([^<]*)<\/description>/.exec(xml)?.[1]
        }</description>`,
      ),
    );
    assert.ok(!xml.includes('itunes:owner'));
    assert.match(xml, /<itunes:explicit>true<\/itunes:explicit>/);
  } finally {
    await site.cleanup();
  }
});

test('a base path is joined in the feed address, the audio and the cover', async () => {
  const site = await build(async (dir) => {
    const input = await podcastInput(dir);
    input.baseUrl = 'https://example.github.io/g9/';
    input.basePath = '/';
    return input;
  });
  try {
    const feedFile = site.manifest.routes.find((/** @type {any} */ r) =>
      r.path.endsWith('feed/podcast.xml'),
    ).path;
    const xml = await site.html(feedFile);
    assert.match(xml, /rel="self"/);
    for (const url of xml.match(/(?:href|url)="https:[^"]+"/g) ?? []) {
      assert.ok(
        url.includes('https://example.github.io/g9/'),
        `${url} carries the base path`,
      );
    }
    assert.match(
      xml,
      /href="https:\/\/example\.github\.io\/g9\/[^"]*feed\/podcast\.xml"/,
    );
    for (const url of xml.match(/enclosure url="[^"]+"/g) ?? []) {
      assert.ok(url.includes('/g9/'), url);
    }
  } finally {
    await site.cleanup();
  }
});

test('a cover that is missing, not a square of 1400 to 3000 pixels, or not an image fails the build before anything is written', async () => {
  const cases = /** @type {const} */ ([
    ['too small', { size: [1000, 1000] }, /1400 to 3000 pixels square/],
    ['too large', { size: [3200, 3200] }, /1400 to 3000 pixels square/],
    ['not square', { size: [1400, 1500] }, /must be square/],
  ]);
  for (const [label, options, pattern] of cases) {
    const dirs = await createRenderDirectories();
    try {
      const input = await podcastInput(dirs.sourceDirectory, {
        size: /** @type {[number, number]} */ (options.size),
      });
      await assert.rejects(
        () =>
          renderPublication(input, {
            outputDirectory: dirs.outputDirectory,
            workDirectory: dirs.workDirectory,
            sourceDirectory: dirs.sourceDirectory,
            provenance: testProvenance(),
          }),
        (/** @type {any} */ error) => {
          assert.equal(error.name, 'MediaPipelineError', label);
          assert.equal(error.reasonCode, 'MEDIA_FORMAT_INVALID');
          assert.match(error.message, pattern, label);
          return true;
        },
      );
      assert.ok(!existsSync(dirs.outputDirectory), `${label}: nothing written`);
    } finally {
      await dirs.cleanup();
    }
  }
  // A cover file that is not in the source tree.
  const dirs = await createRenderDirectories();
  try {
    const input = await podcastInput(dirs.sourceDirectory);
    input.publication.listen.podcast.cover = {
      path: 'assets/absent.png',
      sourceDigest: `sha256:${'a'.repeat(64)}`,
    };
    await assert.rejects(
      () =>
        renderPublication(input, {
          outputDirectory: dirs.outputDirectory,
          workDirectory: dirs.workDirectory,
          sourceDirectory: dirs.sourceDirectory,
          provenance: testProvenance(),
        }),
      /MEDIA_FORMAT_INVALID/,
    );
    assert.deepEqual(await readdir(dirs.outputDirectory).catch(() => []), []);
  } finally {
    await dirs.cleanup();
  }
});

test('the member is validated by the template and left out of the schema validation', () => {
  const good = {
    enabled: true,
    category: 'News',
    explicit: false,
    cover: { path: 'c.png', sourceDigest: `sha256:${'b'.repeat(64)}` },
  };
  const input = { publication: { listen: { enabled: true, podcast: good } } };
  const stripped = /** @type {any} */ (withoutForwardMembers(input));
  assert.deepEqual(stripped.publication.listen, { enabled: true });
  assert.ok('podcast' in input.publication.listen, 'the input is not changed');
  for (const bad of [
    null,
    { ...good, enabled: 'yes' },
    { ...good, extra: 1 },
    { ...good, category: '' },
    { ...good, explicit: undefined },
    {
      ...good,
      cover: { path: '/abs.png', sourceDigest: good.cover.sourceDigest },
    },
    { ...good, cover: { path: 'c.png', sourceDigest: 'sha256:1' } },
    { ...good, ownerEmail: 'not an address' },
    { ...good, description: 'x'.repeat(4001) },
  ]) {
    assert.throws(
      () =>
        withoutForwardMembers({
          publication: { listen: { enabled: true, podcast: bad } },
        }),
      (/** @type {any} */ error) =>
        error.name === 'BuildInputValidationError' &&
        error.diagnostics[0].code === 'LISTEN_PODCAST_INVALID',
      JSON.stringify(bad),
    );
  }
});

test('hostile text in titles, descriptions and settings is escaped: the feed parses and the values round-trip', async () => {
  const { JSDOM } = await import('jsdom');
  const nasty = `A & B <i>"x"</i> ]]> 'q' 😀`;
  const site = await build(async (dir) => {
    const input = await podcastInput(dir);
    input.publication.title = nasty;
    input.publication.listen.podcast.category = nasty;
    input.publication.listen.podcast.description = nasty;
    for (const record of input.content) {
      record.frontmatter.title = nasty;
      record.frontmatter.description = nasty;
    }
    return input;
  });
  try {
    const xml = await site.html(FEED);
    const dom = new JSDOM(xml, { contentType: 'application/xml' });
    const doc = dom.window.document;
    assert.equal(doc.querySelector('parsererror'), null, 'well-formed XML');
    assert.equal(doc.querySelector('channel > title')?.textContent, nasty);
    assert.equal(
      doc.querySelector('channel > description')?.textContent,
      nasty,
    );
    assert.equal(
      doc.querySelector('itunes\\:category, category')?.getAttribute('text'),
      nasty,
    );
    for (const node of Array.from(doc.querySelectorAll('item > title'))) {
      assert.equal(node.textContent, nasty);
    }
    for (const node of Array.from(doc.querySelectorAll('item > description'))) {
      assert.equal(node.textContent, nasty);
    }
  } finally {
    await site.cleanup();
  }
});
