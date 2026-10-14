/**
 * Advanced SEO management (template 4.3.0): the per-post `seo` object, the
 * fallback description and leading-heading rules, the home title, site
 * icons and theme colour, Organization `sameAs`, author last-modified, the
 * readable tag/series routes and the public-root JSON-LD ids.
 */

import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import { buildSitemap } from '../src/core/internal/sitemap.js';
import { loadThemeAssets } from '../src/core/internal/theme-assets.js';
import {
  buildGeneratedPages,
  homeDocumentTitle,
} from '../src/core/internal/page-kinds.js';
import {
  deriveLabelSegments,
  deriveSeriesSegments,
  deriveTagSegments,
  routeSegmentForLabel,
} from '../src/core/internal/route-labels.js';
import { ldGraph, metaContents } from './helpers/html-facts.js';
import { buildTestPng, sha256Of } from './helpers/media-fixtures.js';
import {
  addEditions,
  buildRichFixture,
  editionRecord,
} from './helpers/page-kind-fixtures.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { applyCurrentRenderPolicy } from './helpers/schema-fixtures.js';

/**
 * Render the rich fixture after a mutation.
 *
 * @param {(buildInput: any) => void | Promise<void>} mutate edits the build input
 * @param {{png?: Buffer, }} [options] a source image to write under `assets/`
 * @returns {Promise<{files: Map<string, string>, cleanup: () => Promise<void>}>}
 */
async function renderSite(mutate, options = {}) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  await mutate(buildInput);
  await applyCurrentRenderPolicy(buildInput);
  const dirs = await createRenderDirectories();
  if (options.png) {
    await mkdir(path.join(dirs.sourceDirectory, 'assets'), { recursive: true });
    await writeFile(
      path.join(dirs.sourceDirectory, 'assets/mark.png'),
      options.png,
    );
  }
  const { manifest } = await renderPublication(buildInput, {
    outputDirectory: dirs.outputDirectory,
    workDirectory: dirs.workDirectory,
    sourceDirectory: dirs.sourceDirectory,
    provenance: testProvenance(),
  });
  /** @type {Map<string, string>} */
  const files = new Map();
  for (const route of manifest.routes) {
    files.set(
      route.path,
      await readFile(path.join(dirs.outputDirectory, route.path), 'utf8'),
    );
  }
  return { files, cleanup: dirs.cleanup };
}

const titleOf = (/** @type {string} */ html) =>
  /<title>([^<]*)<\/title>/.exec(html)?.[1];
const canonicalOf = (/** @type {string} */ html) =>
  /<link rel="canonical" href="([^"]*)">/.exec(html)?.[1];
const ORIGIN = 'https://fixture-1.example.com';

test('seo fields: title, description, canonicalUrl and noindex reach the head, JSON-LD, sitemap, feeds, llms and the search index', async (t) => {
  const { files, cleanup } = await renderSite((buildInput) => {
    const [first, second, , contact] = buildInput.content;
    first.frontmatter.description = 'Subtitle of the first article.';
    first.frontmatter.seo = {
      title: 'Custom SEO title',
      description: 'Custom SEO description.',
    };
    second.frontmatter.seo = { noindex: true };
    contact.frontmatter.seo = {
      canonicalUrl: 'https://elsewhere.example.com/contact',
    };
  });
  t.after(cleanup);
  const read = (/** @type {string} */ file) =>
    /** @type {string} */ (files.get(file));

  // Title / description overrides.
  const first = read('fixture-1/first-article/index.html');
  assert.equal(titleOf(first), 'Custom SEO title | fixture-1');
  assert.deepEqual(metaContents(first, 'og:title'), ['Custom SEO title']);
  assert.deepEqual(metaContents(first, 'twitter:title'), ['Custom SEO title']);
  assert.deepEqual(metaContents(first, 'description'), [
    'Custom SEO description.',
  ]);
  assert.deepEqual(metaContents(first, 'og:description'), [
    'Custom SEO description.',
  ]);
  assert.deepEqual(metaContents(first, 'twitter:description'), [
    'Custom SEO description.',
  ]);
  const post = /** @type {any} */ (
    ldGraph(first).find((node) => node['@type'] === 'BlogPosting')
  );
  assert.equal(post.headline, 'First article', 'headline stays the real title');
  assert.equal(post.description, 'Custom SEO description.');
  assert.equal(
    canonicalOf(first),
    `${ORIGIN}/fixture-1/first-article/`,
    'no canonical override: own URL',
  );
  // The visible subtitle is untouched.
  assert.ok(first.includes('Subtitle of the first article.'));

  // Canonical override.
  const contact = read('fixture-1/contact/index.html');
  assert.equal(canonicalOf(contact), 'https://elsewhere.example.com/contact');
  assert.deepEqual(metaContents(contact, 'og:url'), [
    'https://elsewhere.example.com/contact',
  ]);

  // noindex: robots meta, still listed on the site.
  const second = read('fixture-1/second-article/index.html');
  assert.deepEqual(metaContents(second, 'robots'), ['noindex, follow']);
  assert.ok(
    read('fixture-1/index.html').includes('/fixture-1/second-article/'),
  );
  assert.ok(
    read('fixture-1/tags/beta/index.html').includes(
      '/fixture-1/second-article/',
    ),
  );
  assert.ok(
    metaContents(first, 'robots').length === 0,
    'an ordinary post has no robots meta',
  );

  // Sitemap: neither noindex nor canonical-override pages; others stay.
  const sitemap = read('fixture-1/sitemap.xml');
  assert.ok(!sitemap.includes('/second-article/'));
  assert.ok(!sitemap.includes('/fixture-1/contact/'));
  assert.ok(sitemap.includes('/fixture-1/first-article/'));

  // Feeds: noindex excluded; the canonical-override page is not an article.
  for (const feed of ['fixture-1/feed/atom.xml', 'fixture-1/feed/rss.xml']) {
    assert.ok(!read(feed).includes('/second-article/'), feed);
    assert.ok(read(feed).includes('/first-article/'), feed);
  }

  // llms: noindex excluded; the canonical-override page keeps its own URL.
  for (const file of ['fixture-1/llms.txt', 'fixture-1/llms-full.txt']) {
    assert.ok(!read(file).includes('/second-article/'), file);
    assert.ok(read(file).includes('/first-article/'), file);
  }
  assert.ok(
    read('fixture-1/llms.txt').includes(`${ORIGIN}/fixture-1/contact/`),
  );

  // Search index.
  const routes = JSON.parse(read('fixture-1/search-index.json')).documents.map(
    (/** @type {{route: string}} */ doc) => doc.route,
  );
  assert.ok(!routes.some((/** @type {string} */ r) => r.includes('second')));
  assert.ok(routes.some((/** @type {string} */ r) => r.includes('first')));
});

test('fallback description skips heading text; a leading body h1 equal to the title is dropped', async (t) => {
  const { files, cleanup } = await renderSite((buildInput) => {
    const [first, second] = buildInput.content;
    delete first.frontmatter.description;
    first.body =
      '<h1>First  ARTICLE</h1><h2 id="intro">Heading words</h2><p>Opening sentence of prose.</p>';
    delete second.frontmatter.description;
    second.body = '<h1>A different heading</h1><p>Second prose.</p>';
  });
  t.after(cleanup);
  const first = /** @type {string} */ (
    files.get('fixture-1/first-article/index.html')
  );
  assert.deepEqual(metaContents(first, 'description'), [
    'Opening sentence of prose.',
  ]);
  assert.equal(first.match(/<h1[\s>]/g)?.length, 1, 'only the head h1 remains');
  assert.ok(first.includes('Opening sentence of prose.'));
  assert.ok(first.includes('Heading words'), 'the h2 stays in the body');

  const second = /** @type {string} */ (
    files.get('fixture-1/second-article/index.html')
  );
  assert.equal(second.match(/<h1[\s>]/g)?.length, 2, 'a different h1 stays');
  assert.deepEqual(metaContents(second, 'description'), ['Second prose.']);
});

test('homeDocumentTitle: a tagline equal to the name (trim, whitespace, case) gives the name alone', () => {
  assert.equal(
    homeDocumentTitle('Quiet Notes', '  quiet   NOTES '),
    'Quiet Notes',
  );
  assert.equal(homeDocumentTitle('Quiet Notes', 'Quiet Notes'), 'Quiet Notes');
  assert.equal(
    homeDocumentTitle('Quiet Notes', 'Slow software'),
    'Quiet Notes – Slow software',
  );
});

test('icons and theme colour: a brand mark gives icon links; theme-color is on every page', async (t) => {
  const png = buildTestPng(64, 64);
  const ref = { path: 'assets/mark.png', sourceDigest: sha256Of(png) };
  const withMark = await renderSite(
    (buildInput) => {
      buildInput.appearance.brandMark = ref;
    },
    { png },
  );
  t.after(withMark.cleanup);
  const without = await renderSite(() => {});
  t.after(without.cleanup);

  const html = /** @type {string} */ (
    withMark.files.get('fixture-1/index.html')
  );
  const icon = /<link rel="icon" href="([^"]+)" type="image\/png">/.exec(
    html,
  )?.[1];
  assert.match(
    /** @type {string} */ (icon),
    /^\/fixture-1\/assets\/media\/[0-9a-f]{64}\/original\.png$/,
  );
  assert.match(
    html,
    new RegExp(`<link rel="apple-touch-icon" href="${icon}">`),
  );
  const colors = [
    ...html.matchAll(/<meta name="theme-color" content="([^"]+)"([^>]*)>/g),
  ];
  assert.equal(colors.length, 2, 'light and dark');
  assert.match(colors[0][1], /^#[0-9a-f]{6}$/i);
  assert.equal(colors[0][2], '');
  assert.match(colors[1][1], /^#[0-9a-f]{6}$/i);
  assert.equal(colors[1][2], ' media="(prefers-color-scheme: dark)"');
  assert.ok(
    withMark.files.get('fixture-1/404.html')?.includes('rel="icon"'),
    'the error page carries the icon too',
  );

  for (const [file, page] of without.files) {
    if (!file.endsWith('.html')) continue;
    assert.ok(!page.includes('rel="icon"'), file);
    assert.ok(!page.includes('apple-touch-icon'), file);
    const tags = [...page.matchAll(/<meta name="theme-color"[^>]*>/g)];
    assert.equal(tags.length, 2, `${file}: theme-color without a brand mark`);
    assert.ok(tags[1][0].includes('media="(prefers-color-scheme: dark)"'));
  }
});

test('Organization JSON-LD: sameAs lists the socialLinks URIs and is omitted when empty', async (t) => {
  const withLinks = await renderSite((buildInput) => {
    buildInput.publication.socialLinks = [
      { type: 'github', uri: 'https://github.com/quiet-notes' },
      { type: 'mastodon', uri: 'https://example.social/@quiet' },
    ];
  });
  t.after(withLinks.cleanup);
  const without = await renderSite((buildInput) => {
    buildInput.publication.socialLinks = [];
  });
  t.after(without.cleanup);
  const organization = (/** @type {Map<string, string>} */ files) =>
    /** @type {any} */ (
      ldGraph(/** @type {string} */ (files.get('fixture-1/index.html'))).find(
        (node) => node['@type'] === 'Organization',
      )
    );
  assert.deepEqual(organization(withLinks.files).sameAs, [
    'https://github.com/quiet-notes',
    'https://example.social/@quiet',
  ]);
  assert.ok(!('sameAs' in organization(without.files)));
});

test('author pages carry lastModified: the latest updatedAt ?? publishedAt of their published articles', async () => {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  buildInput.content[0].frontmatter.updatedAt = '2026-03-03T09:00:00.000Z';
  const pages = buildGeneratedPages(buildInput, {
    pageBody: (body) => body,
    routeProfile: 'directory-index',
  });
  const authors = pages.filter((page) => page.kind === 'author');
  assert.equal(authors.length, 2);
  const byTitle = new Map(authors.map((page) => [page.title, page]));
  assert.equal(
    byTitle.get('fixture-author-2')?.lastModified,
    '2025-06-01T09:00:00.000Z',
  );
  assert.equal(
    authors.find((page) => page.title !== 'fixture-author-2')?.lastModified,
    '2026-03-03T09:00:00.000Z',
  );
});

test('deriveLabelSegments: readable prefix alone when unique, digest suffix on collision or empty prefix, order independent', () => {
  const labels = ['Alpha', 'alpha', 'Beta', '!!!', 'Gamma!', 'Gamma?', 'Delta'];
  const segments = deriveLabelSegments(labels);
  assert.equal(segments.get('Beta'), 'beta');
  assert.equal(segments.get('Delta'), 'delta');
  for (const label of ['Alpha', 'alpha', '!!!', 'Gamma!', 'Gamma?']) {
    assert.equal(segments.get(label), routeSegmentForLabel(label), label);
  }
  assert.match(
    /** @type {string} */ (segments.get('Alpha')),
    /^alpha-[0-9a-f]{10}$/,
  );
  assert.notEqual(segments.get('Alpha'), segments.get('alpha'));
  assert.match(/** @type {string} */ (segments.get('!!!')), /^[0-9a-f]{10}$/);
  // Order and duplicates never change a decision.
  const reversed = deriveLabelSegments([...labels].reverse().concat(labels));
  assert.deepEqual([...reversed].sort(), [...segments].sort());
  // A label set change moves only the labels it touches.
  const grown = deriveLabelSegments([...labels, 'Epsilon']);
  assert.equal(grown.get('Beta'), 'beta');
  assert.equal(grown.get('Epsilon'), 'epsilon');
});

test('tag and series routes in a built site use the readable segment, and every link agrees', async (t) => {
  const { files, cleanup } = await renderSite((buildInput) => {
    buildInput.content[1].frontmatter.tags = ['alpha', 'Beta'];
    buildInput.content[0].frontmatter.tags = ['Alpha', 'alpha'];
    buildInput.content[2].frontmatter.tags = ['Beta'];
  });
  t.after(cleanup);
  const tagPages = [...files.keys()].filter((file) =>
    /^fixture-1\/tags\/[^/]+\/index\.html$/.test(file),
  );
  assert.ok(tagPages.includes('fixture-1/series/story/index.html') === false);
  assert.ok(tagPages.includes('fixture-1/tags/beta/index.html'));
  assert.ok(files.has('fixture-1/series/story/index.html'));
  // Two tags differing only by case keep their digests.
  const hashed = tagPages.filter((file) => /-[0-9a-f]{10}\//.test(file));
  assert.equal(hashed.length, 2, hashed.join(', '));
  // Every tag link in the site resolves to a written page.
  for (const [file, html] of files) {
    if (!file.endsWith('.html')) continue;
    for (const match of html.matchAll(
      /href="\/fixture-1\/(tags|series)\/([^/"]+)\/"/g,
    )) {
      assert.ok(
        files.has(`fixture-1/${match[1]}/${match[2]}/index.html`),
        `${file} links ${match[0]}`,
      );
    }
  }
});

test('deriveTagSegments / deriveSeriesSegments cover exactly the published labels', async () => {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const tags = deriveTagSegments(buildInput.content);
  assert.deepEqual([...tags.keys()].sort(), ['alpha', 'beta']);
  assert.deepEqual([...tags.values()].sort(), ['alpha', 'beta']);
  assert.deepEqual(
    [...deriveSeriesSegments(buildInput.content)],
    [['story', 'story']],
  );
});

test('JSON-LD ids and urls use the public site root when baseUrl carries a path', async (t) => {
  const { files, cleanup } = await renderSite((buildInput) => {
    buildInput.baseUrl = 'https://fixture-1.example.com/blog/';
    buildInput.basePath = '/';
    for (const record of buildInput.content) {
      record.frontmatter.route = `/${record.frontmatter.slug}`;
    }
  });
  t.after(cleanup);
  const home = /** @type {string} */ (files.get('index.html'));
  const graph = /** @type {any[]} */ (ldGraph(home));
  const organization = graph.find((node) => node['@type'] === 'Organization');
  const site = graph.find((node) => node['@type'] === 'WebSite');
  const blog = graph.find((node) => node['@type'] === 'Blog');
  assert.equal(organization['@id'], `${ORIGIN}/blog/#organization`);
  assert.equal(organization.url, `${ORIGIN}/blog/`);
  assert.equal(site['@id'], `${ORIGIN}/blog/#website`);
  assert.equal(site.url, `${ORIGIN}/blog/`);
  assert.equal(site.publisher['@id'], `${ORIGIN}/blog/#organization`);
  assert.equal(blog['@id'], `${ORIGIN}/blog/#blog`);
  const article = /** @type {string} */ (files.get('tags/alpha/index.html'));
  assert.ok(article.includes(`${ORIGIN}/blog/#website`));
  assert.ok(!article.includes(`${ORIGIN}/#website`));
});

test("theme colour with a theme: the canvas is the palette sheet's resolved colour per mode", async () => {
  const result = await loadThemeAssets({
    themeDirectory: fileURLToPath(
      new URL('./fixtures/theme-fixture-full', import.meta.url),
    ),
    basePath: '/',
    appearanceTokens: {},
  });
  const sheet = /** @type {{bytes: Buffer}} */ (
    result.files.find((file) =>
      /gala-palette-[0-9a-f]{12}\.css$/.test(file.path),
    )
  ).bytes.toString('utf8');
  const canvasIn = (/** @type {'light' | 'dark'} */ mode) => {
    const start = sheet.indexOf(
      `[data-gala-publication-root][data-gala-resolved-color-mode="${mode}"] {`,
    );
    return /--gala-color-canvas: ([^;]+);/.exec(sheet.slice(start))?.[1];
  };
  assert.ok(result.canvas, 'the fixture theme resolves an opaque canvas');
  assert.equal(result.canvas.light, canvasIn('light'));
  assert.equal(result.canvas.dark, canvasIn('dark'));
});

test('JSON-LD names the seo.canonicalUrl for the article and page url, @id and mainEntityOfPage; breadcrumbs keep the own URL', async (t) => {
  const { files, cleanup } = await renderSite((buildInput) => {
    buildInput.content[0].frontmatter.seo = {
      canonicalUrl: 'https://elsewhere.example.com/first',
    };
    buildInput.content[3].frontmatter.seo = {
      canonicalUrl: 'https://elsewhere.example.com/contact',
    };
  });
  t.after(cleanup);
  const graph = (/** @type {string} */ file) =>
    /** @type {any[]} */ (ldGraph(/** @type {string} */ (files.get(file))));
  const post = graph('fixture-1/first-article/index.html').find(
    (node) => node['@type'] === 'BlogPosting',
  );
  assert.equal(post.url, 'https://elsewhere.example.com/first');
  assert.equal(post['@id'], 'https://elsewhere.example.com/first#article');
  assert.equal(
    post.mainEntityOfPage['@id'],
    'https://elsewhere.example.com/first',
  );
  const crumbs = graph('fixture-1/first-article/index.html').find(
    (node) => node['@type'] === 'BreadcrumbList',
  );
  assert.equal(
    crumbs.itemListElement.at(-1).item,
    `${ORIGIN}/fixture-1/first-article/`,
  );
  const page = graph('fixture-1/contact/index.html').find(
    (node) => node['@type'] === 'WebPage',
  );
  assert.equal(page.url, 'https://elsewhere.example.com/contact');
  assert.equal(page['@id'], 'https://elsewhere.example.com/contact#page');
});

test('description fallback: heading-only body uses its text, an empty body the publication description', async (t) => {
  const { files, cleanup } = await renderSite((buildInput) => {
    const [first, second] = buildInput.content;
    delete first.frontmatter.description;
    first.body = '<h2>Only a heading</h2>';
    delete second.frontmatter.description;
    second.body = '';
    buildInput.publication.description = 'The site description.';
  });
  t.after(cleanup);
  const first = /** @type {string} */ (
    files.get('fixture-1/first-article/index.html')
  );
  assert.deepEqual(metaContents(first, 'description'), ['Only a heading']);
  const second = /** @type {string} */ (
    files.get('fixture-1/second-article/index.html')
  );
  assert.deepEqual(metaContents(second, 'description'), [
    'The site description.',
  ]);
});

test('apple-touch-icon needs a square PNG or JPEG; a non-square mark gets rel=icon with its type only', async (t) => {
  const png = buildTestPng(96, 48);
  const ref = { path: 'assets/mark.png', sourceDigest: sha256Of(png) };
  const { files, cleanup } = await renderSite(
    (buildInput) => {
      buildInput.appearance.brandMark = ref;
    },
    { png },
  );
  t.after(cleanup);
  const html = /** @type {string} */ (files.get('fixture-1/index.html'));
  assert.match(html, /<link rel="icon" href="[^"]+" type="image\/png">/);
  assert.ok(!html.includes('apple-touch-icon'));
});

test('editions ignore seo.title and seo.canonicalUrl but keep seo.description', async (t) => {
  const { files, cleanup } = await renderSite(async (buildInput) => {
    const article = buildInput.content[0];
    await addEditions(buildInput, [
      editionRecord(article, 'STANDARD', {
        frontmatter: {
          seo: {
            title: 'Edition SEO title',
            canonicalUrl: 'https://elsewhere.example.com/edition',
            description: 'Edition SEO description.',
          },
        },
      }),
    ]);
  });
  t.after(cleanup);
  const edition = /** @type {string} */ (
    files.get('fixture-1/first-article/standard/index.html')
  );
  assert.ok(!titleOf(edition)?.includes('Edition SEO title'));
  assert.deepEqual(metaContents(edition, 'og:title'), [
    metaContents(edition, 'twitter:title')[0],
  ]);
  assert.ok(!edition.includes('Edition SEO title'));
  assert.equal(canonicalOf(edition), `${ORIGIN}/fixture-1/first-article/`);
  assert.ok(!edition.includes('elsewhere.example.com'));
  assert.deepEqual(metaContents(edition, 'description'), [
    'Edition SEO description.',
  ]);
});

test('a tag only unlisted posts carry is plain text, never a dead link', async (t) => {
  const { files, cleanup } = await renderSite((buildInput) => {
    buildInput.content[2].frontmatter.tags = ['solo'];
  });
  t.after(cleanup);
  const unlisted = /** @type {string} */ (
    files.get('fixture-1/unlisted-article/index.html')
  );
  assert.ok(unlisted.includes('<span class="g-tag">'));
  assert.ok(unlisted.includes('solo'));
  assert.ok(!unlisted.includes('/tags/solo'));
  assert.ok(!unlisted.includes('/tags/solo-'));
  assert.ok(!files.has('fixture-1/tags/solo/index.html'));
  for (const [file, html] of files) {
    if (!file.endsWith('.html')) continue;
    for (const match of html.matchAll(
      /href="\/fixture-1\/tags\/([^/"]+)\/"/g,
    )) {
      assert.ok(files.has(`fixture-1/tags/${match[1]}/index.html`), file);
    }
  }
});

test('seo.noindex on a page; unlisted plus noindex; seo on explicit-file', async (t) => {
  const { files, cleanup } = await renderSite((buildInput) => {
    buildInput.content[3].frontmatter.seo = { noindex: true };
    buildInput.content[2].frontmatter.seo = { noindex: true };
    buildInput.content[0].frontmatter.seo = {
      title: 'Explicit title',
      canonicalUrl: 'https://elsewhere.example.com/x',
    };
  });
  t.after(cleanup);
  const contact = /** @type {string} */ (
    files.get('fixture-1/contact/index.html')
  );
  assert.deepEqual(metaContents(contact, 'robots'), ['noindex, follow']);
  const sitemap = /** @type {string} */ (files.get('fixture-1/sitemap.xml'));
  assert.ok(!sitemap.includes('/contact/'));
  assert.ok(!sitemap.includes('/unlisted-article/'));
  for (const file of ['fixture-1/llms.txt', 'fixture-1/search-index.json']) {
    const text = /** @type {string} */ (files.get(file));
    assert.ok(!text.includes('/contact/'), file);
    assert.ok(!text.includes('unlisted-article'), file);
  }
  // Unlisted stays off the listings; the noindex page is not in the home grid
  // either way, but the unlisted article never appears in archive or tags.
  assert.ok(
    !(
      /** @type {string} */ (
        files.get('fixture-1/tags/beta/index.html')
      ).includes('unlisted-article')
    ),
  );

  // explicit-file output cannot be written by Eleventy (extension-less
  // routes), so the profile is checked at the generated-page level.
  const buildInput = /** @type {any} */ (await buildRichFixture());
  buildInput.content[0].frontmatter.seo = {
    title: 'Explicit title',
    canonicalUrl: 'https://elsewhere.example.com/x',
  };
  buildInput.content[1].frontmatter.seo = { noindex: true };
  const generatedPages = buildGeneratedPages(buildInput, {
    pageBody: (body) => body,
    routeProfile: 'explicit-file',
  });
  const first = /** @type {any} */ (
    generatedPages.find((page) => page.route === '/first-article')
  );
  assert.equal(first.documentTitle, 'Explicit title | fixture-1');
  assert.equal(first.canonicalUrl, 'https://elsewhere.example.com/x');
  const map = buildSitemap({
    generatedPages,
    basePath: '/fixture-1',
    baseUrl: `${ORIGIN}/`,
    routeProfile: 'explicit-file',
  });
  assert.ok(!map.includes('second-article'));
  assert.ok(!map.includes('first-article'));
  assert.ok(map.includes('/fixture-1/contact<'));
});

test('leading h1 drop: id and inline markup, blockquote, second h1, h1-only body', async () => {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const bodies = [
    '<h1 id="t">First <em>article</em></h1><p>kept</p>',
    '<blockquote><h1>First article</h1></blockquote><p>kept</p>',
    '<h1>First article</h1><p>kept</p><h1>First article</h1>',
    '<h1>First article</h1>',
  ];
  const results = [];
  for (const body of bodies) {
    buildInput.content[0].body = body;
    const pages = buildGeneratedPages(buildInput, {
      pageBody: (b) => b,
      routeProfile: 'directory-index',
    });
    const page = /** @type {any} */ (
      pages.find((candidate) => candidate.route === '/first-article')
    );
    const html = /** @type {string} */ (page.bodyHtml);
    results.push({
      h1s: html.match(/<h1[\s>]/g)?.length ?? 0,
      prose: html.slice(html.indexOf('g-prose')),
    });
  }
  // Head h1 is always present; inline markup and an id do not stop the drop.
  assert.equal(results[0].h1s, 1);
  assert.ok(results[0].prose.includes('kept'));
  assert.ok(!results[0].prose.includes('<h1'));
  // A heading inside a blockquote is not leading: it stays.
  assert.equal(results[1].h1s, 2);
  // Only the first, leading h1 is dropped.
  assert.equal(results[2].h1s, 2);
  // An h1-only body leaves an empty prose container, not a crash.
  assert.equal(results[3].h1s, 1);
});

test('tag collisions in a built site: Foo and foo keep digests; a tag and a series with one name each keep their readable route', async (t) => {
  const { files, cleanup } = await renderSite((buildInput) => {
    buildInput.content[0].frontmatter.tags = ['Foo', 'story'];
    buildInput.content[1].frontmatter.tags = ['foo'];
  });
  t.after(cleanup);
  const tagPages = [...files.keys()].filter((file) =>
    /^fixture-1\/tags\/[^/]+\/index\.html$/.test(file),
  );
  assert.ok(!tagPages.includes('fixture-1/tags/foo/index.html'));
  assert.equal(
    tagPages.filter((file) => /foo-[0-9a-f]{10}/.test(file)).length,
    2,
  );
  assert.ok(files.has('fixture-1/tags/story/index.html'));
  assert.ok(files.has('fixture-1/series/story/index.html'));
});

test('theme-color follows the allowed colour modes: light-only and dark-only give one tag', async (t) => {
  for (const mode of /** @type {const} */ (['light', 'dark'])) {
    const { files, cleanup } = await renderSite((buildInput) => {
      buildInput.appearance.colorMode = { default: mode, allowed: [mode] };
    });
    t.after(cleanup);
    const html = /** @type {string} */ (files.get('fixture-1/index.html'));
    const tags = [...html.matchAll(/<meta name="theme-color"[^>]*>/g)];
    assert.equal(tags.length, 1, mode);
    assert.ok(!tags[0][0].includes('media='), mode);
    const expected = mode === 'light' ? '#f7f8fa' : '#0b0d11';
    assert.ok(tags[0][0].includes(expected), `${mode} ${tags[0][0]}`);
  }
});

test('a path-bearing baseUrl keeps fixed files without a trailing slash while pages end in one', async (t) => {
  const { files, cleanup } = await renderSite((buildInput) => {
    buildInput.baseUrl = 'https://fixture-1.example.com/blog/';
    buildInput.basePath = '/';
    for (const record of buildInput.content) {
      record.frontmatter.route = `/${record.frontmatter.slug}`;
    }
  });
  t.after(cleanup);
  const home = /** @type {string} */ (files.get('index.html'));
  assert.ok(home.includes(`href="${ORIGIN}/blog/feed/rss.xml"`));
  assert.equal(canonicalOf(home), `${ORIGIN}/blog/`);
  const sitemap = /** @type {string} */ (files.get('sitemap.xml'));
  assert.ok(sitemap.includes(`<loc>${ORIGIN}/blog/first-article/</loc>`));
  assert.ok(!sitemap.includes('.xml/'));
});

test('an empty seo.title or canonicalUrl falls back to the real title and own URL', async () => {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  buildInput.content[0].frontmatter.seo = { title: '', canonicalUrl: '' };
  const pages = buildGeneratedPages(buildInput, {
    pageBody: (body) => body,
    routeProfile: 'directory-index',
  });
  const page = /** @type {any} */ (
    pages.find((candidate) => candidate.route === '/first-article')
  );
  assert.equal(page.documentTitle, 'First article | fixture-1');
  assert.equal(page.socialTitle, undefined);
  assert.equal(page.canonicalUrl, undefined);
});
