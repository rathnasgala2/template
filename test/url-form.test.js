/**
 * Public URL form (D1): under the `directory-index` route profile every
 * emitted page URL ends with exactly one `/` (the site root stays `/`);
 * under `explicit-file` none does. Fixed files (feeds, sitemap, assets) are
 * never changed, and manifest paths / physical output paths are untouched.
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import { buildFeeds } from '../src/core/internal/feeds.js';
import { buildLlmsDocuments } from '../src/core/internal/llms.js';
import { buildGeneratedPages } from '../src/core/internal/page-kinds.js';
import {
  escapeRedirectTarget,
  isFixedFileRoute,
  joinPublicRoute,
  projectRouteToFilePath,
  publicRouteForm,
} from '../src/core/internal/route.js';
import { buildSearchIndex } from '../src/core/internal/search-index.js';
import { buildSitemap } from '../src/core/internal/sitemap.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';

const ORIGIN = 'https://fixture-1.example.com';

test('publicRouteForm: directory-index gives every page route except / exactly one trailing slash', () => {
  assert.equal(publicRouteForm('/', 'directory-index'), '/');
  assert.equal(publicRouteForm('/about', 'directory-index'), '/about/');
  assert.equal(publicRouteForm('/about/', 'directory-index'), '/about/');
  assert.equal(publicRouteForm('/about//', 'directory-index'), '/about/');
  assert.equal(
    publicRouteForm('/archive/2026', 'directory-index'),
    '/archive/2026/',
  );
  assert.equal(publicRouteForm('/page/2', 'directory-index'), '/page/2/');
  assert.equal(
    publicRouteForm('/v1.2-notes', 'directory-index'),
    '/v1.2-notes/',
  );
});

test('publicRouteForm: explicit-file returns every route unchanged', () => {
  for (const route of ['/', '/about', '/about/', '/archive/2026', '/a.xml']) {
    assert.equal(publicRouteForm(route, 'explicit-file'), route);
  }
});

test('publicRouteForm: fixed-file routes are never changed under either profile', () => {
  const fixed = [
    '/sitemap.xml',
    '/feed/rss.xml',
    '/feed/atom.xml',
    '/search-index.json',
    '/llms.txt',
    '/llms-full.txt',
    '/robots.txt',
    '/404.html',
    '/assets/gala-base-v1.css',
    '/assets/media/abc/original.png',
    '/assets/theme/print.css',
    '/assets/anything-without-extension',
  ];
  for (const route of fixed) {
    assert.ok(isFixedFileRoute(route), route);
    assert.equal(publicRouteForm(route, 'directory-index'), route);
    assert.equal(publicRouteForm(route, 'explicit-file'), route);
  }
  assert.ok(!isFixedFileRoute('/about'));
  assert.ok(!isFixedFileRoute('/'));
});

test('joinPublicRoute applies the public form after joining the public base path', () => {
  assert.equal(joinPublicRoute('/', '/', 'directory-index'), '/');
  assert.equal(joinPublicRoute('/', '/about', 'directory-index'), '/about/');
  assert.equal(joinPublicRoute('/', '/about', 'explicit-file'), '/about');
  assert.equal(joinPublicRoute('/site/', '/', 'directory-index'), '/site/');
  assert.equal(joinPublicRoute('/site/', '/', 'explicit-file'), '/site/');
  assert.equal(
    joinPublicRoute('/site/', '/archive/2026', 'directory-index'),
    '/site/archive/2026/',
  );
  assert.equal(joinPublicRoute('/blog', '/', 'directory-index'), '/blog/');
  assert.equal(
    joinPublicRoute('/site/', '/feed/rss.xml', 'directory-index'),
    '/site/feed/rss.xml',
  );
  assert.equal(
    joinPublicRoute('/site/', '/sitemap.xml', 'explicit-file'),
    '/site/sitemap.xml',
  );
});

test('physical output paths are unchanged by the public form', () => {
  assert.equal(
    projectRouteToFilePath('/fixture-1/about', 'directory-index'),
    'fixture-1/about/index.html',
  );
  assert.equal(
    projectRouteToFilePath('/fixture-1/about', 'explicit-file'),
    'fixture-1/about',
  );
  assert.equal(escapeRedirectTarget('/a/b/'), '/a/b/');
});

/**
 * Every `https://fixture-1.example.com/...` URL in a text whose path is a
 * page URL (not a fixed file), as `{url, pathname}`.
 *
 * @param {string} text
 * @returns {{url: string, pathname: string}[]}
 */
function pageUrlsIn(text) {
  const urls = [];
  for (const match of text.matchAll(
    /https:\/\/fixture-1\.example\.com[^"'<>\s)\\#?&]*/g,
  )) {
    const pathname = new URL(match[0]).pathname;
    if (!isFixedFileRoute(pathname)) urls.push({ url: match[0], pathname });
  }
  return urls;
}

/**
 * Root-relative `href="/..."` page links in an HTML document.
 *
 * @param {string} html
 * @returns {string[]}
 */
function internalHrefsIn(html) {
  return [...html.matchAll(/\bhref="(\/[^"#]*)"/g)]
    .map((match) => match[1])
    .filter((href) => !href.startsWith('//') && !isFixedFileRoute(href));
}

/**
 * @param {string} text the text to scan
 * @param {string} label where it came from
 * @param {'directory-index' | 'explicit-file'} profile
 * @param {{count: number}} counter incremented per URL checked
 */
function assertForm(text, label, profile, counter) {
  const urls = pageUrlsIn(text).map(({ url, pathname }) => ({ url, pathname }));
  for (const href of internalHrefsIn(text)) {
    urls.push({ url: href, pathname: href });
  }
  for (const { url, pathname } of urls) {
    counter.count += 1;
    if (pathname === '/') continue;
    if (profile === 'directory-index') {
      assert.ok(
        pathname.endsWith('/'),
        `${label}: ${url} lacks a trailing slash`,
      );
    } else {
      assert.ok(
        !pathname.endsWith('/'),
        `${label}: ${url} has a trailing slash`,
      );
    }
  }
}

/**
 * The JSON-LD blocks of an HTML page, as text.
 *
 * @param {string} html
 * @returns {string[]}
 */
function jsonLdBlocks(html) {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ].map((match) => match[1]);
}

/**
 * @returns {Promise<any>} a fresh rich fixture with one navigation item
 */
async function fixtureWithNavigation() {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  buildInput.navigation.items = [
    { type: 'internal', label: 'Contact', route: '/contact', children: [] },
  ];
  return buildInput;
}

test('directory-index build: no page URL in canonical, og:url, sitemap, feeds, llms, JSON-LD, search index or any internal href lacks a trailing slash', async (t) => {
  const buildInput = await fixtureWithNavigation();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  t.after(cleanup);
  const { manifest } = await renderPublication(buildInput, {
    outputDirectory,
    workDirectory,
    sourceDirectory,
    provenance: testProvenance(),
    routeNormalizationProfile: 'directory-index',
  });
  const counter = { count: 0 };
  const read = (/** @type {string} */ file) =>
    readFile(path.join(outputDirectory, file), 'utf8');

  const htmlRoutes = manifest.routes.filter((r) => r.routeClass === 'html');
  assert.ok(htmlRoutes.length > 5);
  let canonicals = 0;
  let ogUrls = 0;
  let jsonLd = 0;
  for (const route of htmlRoutes) {
    assert.ok(
      route.path.endsWith('index.html') || route.path.endsWith('404.html'),
    );
    const html = await read(route.path);
    assertForm(html, route.path, 'directory-index', counter);
    canonicals += [...html.matchAll(/<link rel="canonical" href="/g)].length;
    ogUrls += [...html.matchAll(/<meta property="og:url" content="/g)].length;
    jsonLd += jsonLdBlocks(html).length;
  }
  assert.ok(canonicals > 5, 'canonical links were scanned');
  assert.ok(ogUrls > 5, 'og:url tags were scanned');
  assert.ok(jsonLd > 5, 'JSON-LD blocks were scanned');

  const sitemap = await read('fixture-1/sitemap.xml');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length > 5);
  for (const loc of locs) {
    assert.ok(loc.endsWith('/'), `sitemap ${loc}`);
  }
  for (const file of [
    'fixture-1/feed/atom.xml',
    'fixture-1/feed/rss.xml',
    'fixture-1/llms.txt',
    'fixture-1/llms-full.txt',
    'fixture-1/search-index.json',
  ]) {
    assertForm(await read(file), file, 'directory-index', counter);
  }
  const searchIndex = JSON.parse(await read('fixture-1/search-index.json'));
  assert.ok(searchIndex.documents.length > 0);
  for (const doc of searchIndex.documents) {
    assert.ok(doc.route.endsWith('/'), doc.route);
  }
  assert.ok(counter.count > 50, `checked ${counter.count} URLs`);

  // Fixed files and physical paths are untouched.
  assert.ok(sitemap.includes(`${ORIGIN}/fixture-1/`));
  assert.ok(
    manifest.routes.some(
      (r) => r.path === 'fixture-1/first-article/index.html',
    ),
  );
  assert.ok(manifest.routes.some((r) => r.path === 'fixture-1/feed/rss.xml'));
});

test('explicit-file emitters: no page URL in sitemap, feeds, llms, search index, JSON-LD or any internal href has a trailing slash', async () => {
  const buildInput = await fixtureWithNavigation();
  const routeProfile = 'explicit-file';
  const generatedPages = buildGeneratedPages(buildInput, {
    pageBody: (body) => body,
    routeProfile,
  });
  const counter = { count: 0 };

  for (const page of generatedPages) {
    assertForm(
      page.bodyHtml,
      `${page.kind} ${page.route}`,
      routeProfile,
      counter,
    );
    assertForm(
      page.jsonLd ?? '',
      `${page.route} JSON-LD`,
      routeProfile,
      counter,
    );
  }
  const sitemap = buildSitemap({
    generatedPages,
    basePath: '/fixture-1',
    baseUrl: `${ORIGIN}/`,
    routeProfile,
  });
  assertForm(sitemap, 'sitemap', routeProfile, counter);
  const feeds = buildFeeds(buildInput, {
    feedBody: (body) => body,
    routeProfile,
  });
  assertForm(feeds.atomXml, 'atom', routeProfile, counter);
  assertForm(feeds.rssXml, 'rss', routeProfile, counter);
  const llms = buildLlmsDocuments(buildInput, {
    rss: feeds.rssSelfUrl,
    atom: feeds.atomSelfUrl,
    sitemap: `${ORIGIN}/fixture-1/sitemap.xml`,
    searchIndex: `${ORIGIN}/fixture-1/search-index.json`,
    full: `${ORIGIN}/fixture-1/llms-full.txt`,
    routeProfile,
  });
  assertForm(llms.llmsTxt, 'llms.txt', routeProfile, counter);
  assertForm(llms.llmsFullTxt, 'llms-full.txt', routeProfile, counter);
  assertForm(
    buildSearchIndex(buildInput, routeProfile),
    'search index',
    routeProfile,
    counter,
  );
  assert.ok(counter.count > 30, `checked ${counter.count} URLs`);
});

test('the same emitters under directory-index produce slashed forms for the same inputs', async () => {
  const buildInput = await fixtureWithNavigation();
  const generatedPages = buildGeneratedPages(buildInput, {
    pageBody: (body) => body,
    routeProfile: 'directory-index',
  });
  const counter = { count: 0 };
  for (const page of generatedPages) {
    assertForm(page.bodyHtml, page.route, 'directory-index', counter);
    assertForm(
      page.jsonLd ?? '',
      `${page.route} JSON-LD`,
      'directory-index',
      counter,
    );
  }
  const sitemap = buildSitemap({
    generatedPages,
    basePath: '/fixture-1',
    baseUrl: `${ORIGIN}/`,
    routeProfile: 'directory-index',
  });
  assertForm(sitemap, 'sitemap', 'directory-index', counter);
  assert.ok(counter.count > 30);
});
