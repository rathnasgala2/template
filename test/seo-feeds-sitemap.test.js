/**
 * Task packet S2-T08 acceptance tests: feeds (RSS/Atom), sitemap, the
 * static search index, SEO/localization `<head>` metadata, the generated
 * `404.html` error page and the print CSS hookup.
 *
 * Redirect documents themselves are S2-T03's own deliverable
 * (`internal/route.js#renderRedirectDocument`, exercised byte-for-byte by
 * `test/renderer-manifest.test.js`'s "every manifestRedirect byte-equals
 * its backing route file" test); this task packet's own scope note is
 * "documentation of the redirect documents S2-T03 emits" — see this
 * package's README, "Redirect documents" section — rather than a second
 * copy of that byte-exact test.
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { buildRichFixture, stableId } from './helpers/page-kind-fixtures.js';
import { assertWellFormedXml } from './helpers/xml-well-formed.js';

/**
 * @param {string} outputDirectory a rendered candidate output directory
 * @param {string} routePath a manifest route path
 * @returns {Promise<string>} the route's rendered UTF-8 text
 */
function readRoute(outputDirectory, routePath) {
  return readFile(path.join(outputDirectory, routePath), 'utf8');
}

/**
 * @param {readonly {path: string, routeClass: string, mediaType: string}[]} routes
 * @param {string} routePath
 * @returns {{path: string, routeClass: string, mediaType: string}}
 */
function requireRoute(routes, routePath) {
  const route = routes.find((candidate) => candidate.path === routePath);
  assert.ok(route, `expected manifest route ${routePath} to exist`);
  return /** @type {{path: string, routeClass: string, mediaType: string}} */ (
    route
  );
}

test('S2-T08 acceptance: feeds, sitemap, search index, 404 and print CSS are generated with the right manifest classification', async (t) => {
  const buildInput = await buildRichFixture();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  t.after(cleanup);

  const { manifest } = await renderPublication(buildInput, {
    outputDirectory,
    workDirectory,
    sourceDirectory,
    provenance: testProvenance(),
  });

  await t.test('manifest classifies every S2-T08 route correctly', () => {
    const atom = requireRoute(manifest.routes, 'fixture-1/feed/atom.xml');
    assert.equal(atom.routeClass, 'feed');
    assert.equal(atom.mediaType, 'application/atom+xml; charset=utf-8');

    const rss = requireRoute(manifest.routes, 'fixture-1/feed/rss.xml');
    assert.equal(rss.routeClass, 'feed');
    assert.equal(rss.mediaType, 'application/rss+xml; charset=utf-8');

    const sitemap = requireRoute(manifest.routes, 'fixture-1/sitemap.xml');
    assert.equal(sitemap.routeClass, 'sitemap');
    assert.equal(sitemap.mediaType, 'application/xml; charset=utf-8');

    const searchIndex = requireRoute(
      manifest.routes,
      'fixture-1/search-index.json',
    );
    assert.equal(searchIndex.routeClass, 'asset');
    assert.equal(searchIndex.mediaType, 'application/json; charset=utf-8');

    const error = requireRoute(manifest.routes, 'fixture-1/404.html');
    assert.equal(error.routeClass, 'error');
    assert.equal(error.mediaType, 'text/html; charset=utf-8');
  });

  await t.test(
    'Atom feed is well-formed XML, absolute-URLed, most-recent-first, excludes unlisted and page-kind records',
    async () => {
      const xml = await readRoute(outputDirectory, 'fixture-1/feed/atom.xml');
      assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n/);
      assertWellFormedXml(xml);
      assert.match(xml, /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom">/);

      const secondIndex = xml.indexOf('Second article');
      const firstIndex = xml.indexOf('First article');
      assert.ok(secondIndex >= 0 && firstIndex >= 0);
      assert.ok(
        secondIndex < firstIndex,
        'the more recently published article must appear first',
      );
      assert.ok(
        !xml.includes('Unlisted article'),
        'an unlisted record must never appear in a feed',
      );
      assert.ok(
        !xml.includes('Contact'),
        'a page-kind record must never appear in a feed (articles only)',
      );
      assert.match(
        xml,
        /<id>https:\/\/fixture-1\.example\.com\/fixture-1\/second-article<\/id>/,
        'every entry id/link must be an absolute https:// URL',
      );
    },
  );

  await t.test(
    'RSS feed is well-formed XML, absolute-URLed, most-recent-first',
    async () => {
      const xml = await readRoute(outputDirectory, 'fixture-1/feed/rss.xml');
      assertWellFormedXml(xml);
      assert.match(
        xml,
        /<rss version="2\.0" xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom">/,
      );
      assert.match(
        xml,
        /<atom:link href="https:\/\/fixture-1\.example\.com\/fixture-1\/feed\/rss\.xml" rel="self" type="application\/rss\+xml"\/>/,
      );
      const secondIndex = xml.indexOf('Second article');
      const firstIndex = xml.indexOf('First article');
      assert.ok(secondIndex >= 0 && firstIndex >= 0);
      assert.ok(secondIndex < firstIndex);
      assert.match(
        xml,
        /<link>https:\/\/fixture-1\.example\.com\/fixture-1\/second-article<\/link>/,
      );
    },
  );

  await t.test(
    'sitemap is well-formed XML, published routes only, lastmod from content timestamps',
    async () => {
      const xml = await readRoute(outputDirectory, 'fixture-1/sitemap.xml');
      assertWellFormedXml(xml);
      assert.match(
        xml,
        /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/,
      );
      assert.match(
        xml,
        /<loc>https:\/\/fixture-1\.example\.com\/fixture-1\/first-article<\/loc><lastmod>2025-01-10T09:00:00\.000Z<\/lastmod>/,
      );
      assert.ok(
        !xml.includes('/fixture-1/unlisted-article'),
        'an unlisted route must never appear in the sitemap',
      );
      // Deterministic order: entries are sorted by their own absolute URL's
      // UTF-8 bytes, not build-input array order — the contact page
      // ("/fixture-1/contact") sorts before the first-article entry.
      assert.ok(
        xml.indexOf('/fixture-1/contact') <
          xml.indexOf('/fixture-1/first-article'),
      );
    },
  );

  await t.test(
    'static search index is a deterministic JSON document indexing only published article/page content, no runtime script accompanies it',
    async () => {
      const json = await readRoute(
        outputDirectory,
        'fixture-1/search-index.json',
      );
      const document = JSON.parse(json);
      assert.equal(document.generatedAt, buildInput.buildEpoch);
      assert.equal(document.publication.title, 'fixture-1');
      const routes = document.documents.map((doc) => doc.route);
      assert.ok(
        routes.includes(
          'https://fixture-1.example.com/fixture-1/first-article',
        ),
      );
      assert.ok(
        routes.includes('https://fixture-1.example.com/fixture-1/contact'),
        'a page-kind record must be indexed too (unlike the feeds)',
      );
      assert.ok(
        !routes.some((route) => route.includes('unlisted-article')),
        'an unlisted record must never appear in the search index',
      );
      // No accompanying script: only this one JSON file is generated for
      // search (acceptance test C: the appearance controller is the only
      // browser bootstrap in all of S2).
      assert.ok(
        !manifest.routes.some((route) => route.path.endsWith('.js')),
        'no runtime search JavaScript may be emitted',
      );
    },
  );

  await t.test(
    '404.html uses the S2-T06 error page kind, is noindex and carries the shared chrome',
    async () => {
      const html = await readRoute(outputDirectory, 'fixture-1/404.html');
      assert.match(html, /<meta name="robots" content="noindex, follow">/);
      assert.match(html, /<h1>Page not found<\/h1>/);
      assert.match(html, /<a href="\/fixture-1">Return to the home page<\/a>/);
      assert.equal((html.match(/<header>/g) ?? []).length, 1);
      assert.equal((html.match(/<footer>/g) ?? []).length, 1);
      assert.ok(!html.includes('rel="canonical"'));
    },
  );

  await t.test(
    'every page carries the print stylesheet hookup and feed discovery links',
    async () => {
      const html = await readRoute(
        outputDirectory,
        'fixture-1/first-article/index.html',
      );
      assert.match(
        html,
        /<link rel="stylesheet" href="\/fixture-1\/assets\/theme\/print\.css" media="print">/,
      );
      assert.match(
        html,
        /<link rel="alternate" type="application\/atom\+xml" href="https:\/\/fixture-1\.example\.com\/fixture-1\/feed\/atom\.xml"/,
      );
      assert.match(
        html,
        /<link rel="alternate" type="application\/rss\+xml" href="https:\/\/fixture-1\.example\.com\/fixture-1\/feed\/rss\.xml"/,
      );
    },
  );

  await t.test(
    'SEO metadata: canonical, Open Graph and Twitter tags on an ordinary content page; robots noindex on the unlisted one',
    async () => {
      const html = await readRoute(
        outputDirectory,
        'fixture-1/first-article/index.html',
      );
      assert.match(
        html,
        /<link rel="canonical" href="https:\/\/fixture-1\.example\.com\/fixture-1\/first-article">/,
      );
      assert.match(
        html,
        /<meta property="og:url" content="https:\/\/fixture-1\.example\.com\/fixture-1\/first-article">/,
      );
      assert.match(html, /<meta property="og:type" content="article">/);
      assert.match(html, /<meta property="og:title" content="First article">/);
      assert.match(html, /<meta name="twitter:card" content="summary">/);
      assert.ok(!html.includes('name="robots"'));

      const unlisted = await readRoute(
        outputDirectory,
        'fixture-1/unlisted-article/index.html',
      );
      assert.match(unlisted, /<meta name="robots" content="noindex, follow">/);
    },
  );
});

test('S2-T08 determinism: two clean builds produce byte-identical feeds, sitemap and search index', async (t) => {
  const buildInput = await buildRichFixture();
  const provenance = testProvenance();
  const first = await createRenderDirectories();
  const second = await createRenderDirectories();
  t.after(async () => {
    await first.cleanup();
    await second.cleanup();
  });

  await renderPublication(buildInput, {
    outputDirectory: first.outputDirectory,
    workDirectory: first.workDirectory,
    sourceDirectory: first.sourceDirectory,
    provenance,
  });
  await renderPublication(buildInput, {
    outputDirectory: second.outputDirectory,
    workDirectory: second.workDirectory,
    sourceDirectory: second.sourceDirectory,
    provenance,
  });

  for (const routePath of [
    'fixture-1/feed/atom.xml',
    'fixture-1/feed/rss.xml',
    'fixture-1/sitemap.xml',
    'fixture-1/search-index.json',
    'fixture-1/404.html',
  ]) {
    const bytesA = await readRoute(first.outputDirectory, routePath);
    const bytesB = await readRoute(second.outputDirectory, routePath);
    assert.equal(
      bytesA,
      bytesB,
      `${routePath} must be byte-identical across two clean builds`,
    );
  }
});

test('S2-T08: routeSegmentForLabel keeps distinct tag routes in the rich fixture with no collisions', async (t) => {
  // Reproduces the exact route this fixture's own "alpha" tag resolves to,
  // proving the manifest actually contains it (a light cross-check on top
  // of `test/route-labels.test.js`'s own unit-level collision test).
  const buildInput = await buildRichFixture();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  t.after(cleanup);
  const { manifest } = await renderPublication(buildInput, {
    outputDirectory,
    workDirectory,
    sourceDirectory,
    provenance: testProvenance(),
  });
  assert.ok(
    manifest.routes.some(
      (route) => route.path === 'fixture-1/tags/alpha-8ed3f6ad68/index.html',
    ),
  );
  assert.equal(stableId(1), '019c0000-0000-7000-8000-000000000001');
});
