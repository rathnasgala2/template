/**
 * Task packet S2-T06 acceptance tests: page kinds (profile, author, article,
 * page, index, tag, series, archive, error) and the navigation renderer
 * (`internal/skeleton.js`, `internal/page-kinds.js`).
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import { getMessages } from '../src/core/internal/messages.js';
import {
  LISTING_PAGE_SIZE,
  renderErrorPageBody,
} from '../src/core/internal/page-kinds.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { buildRichFixture, stableId } from './helpers/page-kind-fixtures.js';
import { applyCurrentRenderPolicy } from './helpers/schema-fixtures.js';

/**
 * @param {string} outputDirectory a rendered candidate output directory
 * @param {string} routePath a manifest route path
 * @returns {Promise<string>} the route's rendered UTF-8 text
 */
function readRoute(outputDirectory, routePath) {
  return readFile(path.join(outputDirectory, routePath), 'utf8');
}

test('S2-T06 acceptance: every admitted page kind is generated with correct landmarks, breadcrumbs and listings', async (t) => {
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
  const routePaths = new Set(manifest.routes.map((route) => route.path));
  // S2-T08 adds non-HTML routes (the generated `404.html`, feeds, sitemap,
  // search index) to `manifest.routes`; this S2-T06 test's own "every
  // generated page carries ..." assertion below only makes sense for the
  // `routeClass: 'html'` subset.
  const htmlRoutePaths = manifest.routes
    .filter((route) => route.routeClass === 'html')
    .map((route) => route.path);

  await t.test(
    'profile page kind: no breadcrumb, publication body verbatim',
    async () => {
      const html = await readRoute(
        outputDirectory,
        'fixture-1/about/index.html',
      );
      assert.match(
        html,
        /<main id="main-content"><h1>fixture-1<\/h1><p>About this publication\.<\/p><\/main>/,
      );
      assert.ok(!html.includes('aria-label="Breadcrumb"'));
    },
  );

  await t.test(
    'author page kind: one page per author, with breadcrumb and profile fields',
    async () => {
      assert.ok(routePaths.has(`fixture-1/authors/${stableId(1)}/index.html`));
      const html = await readRoute(
        outputDirectory,
        `fixture-1/authors/${stableId(2)}/index.html`,
      );
      assert.match(html, /<h1>About fixture-author-2<\/h1>/);
      assert.match(html, /<p>they\/them<\/p>/);
      assert.match(html, /<p>A second fixture author\.<\/p>/);
      assert.match(
        html,
        /<a href="https:\/\/github\.com\/fixture-author-2">https:\/\/github\.com\/fixture-author-2<\/a>/,
      );
      assert.match(
        html,
        /aria-label="Breadcrumb"><ol><li><a href="\/fixture-1">Home<\/a><\/li><li>Authors<\/li><li aria-current="page">fixture-author-2<\/li>/,
      );
    },
  );

  await t.test(
    'article page kind: breadcrumb includes the index, exactly one h1',
    async () => {
      const html = await readRoute(
        outputDirectory,
        'fixture-1/first-article/index.html',
      );
      assert.match(
        html,
        /<li><a href="\/fixture-1">All articles<\/a><\/li><li aria-current="page">First article<\/li>/,
      );
      assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    },
  );

  await t.test(
    'page kind (custom page): breadcrumb has no index step',
    async () => {
      const html = await readRoute(
        outputDirectory,
        'fixture-1/contact/index.html',
      );
      assert.match(
        html,
        /aria-label="Breadcrumb"><ol><li><a href="\/fixture-1">Home<\/a><\/li><li aria-current="page">Contact<\/li><\/ol>/,
      );
    },
  );

  await t.test(
    'index page kind: lists only published articles, excludes the unlisted one',
    async () => {
      const html = await readRoute(outputDirectory, 'fixture-1/index.html');
      assert.match(html, /First article/);
      assert.match(html, /Second article/);
      assert.ok(!html.includes('Unlisted article'));
      assert.ok(!html.includes('Contact'));
    },
  );

  await t.test(
    'tag page kind: root lists both tags, leaf pages filter correctly',
    async () => {
      const root = await readRoute(
        outputDirectory,
        'fixture-1/tags/index.html',
      );
      assert.match(root, /alpha/);
      assert.match(root, /beta/);

      const alpha = await readRoute(
        outputDirectory,
        'fixture-1/tags/alpha-8ed3f6ad68/index.html',
      );
      assert.match(alpha, /First article/);
      assert.match(alpha, /Second article/);

      const beta = await readRoute(
        outputDirectory,
        'fixture-1/tags/beta-f44e64e75f/index.html',
      );
      assert.match(beta, /Second article/);
      assert.ok(!beta.includes('First article'));
      assert.ok(
        !beta.includes('Unlisted article'),
        'an unlisted record must never appear in a generated tag listing',
      );
    },
  );

  await t.test(
    'series page kind: leaf page orders by seriesOrder ascending',
    async () => {
      const html = await readRoute(
        outputDirectory,
        'fixture-1/series/story-c478361e68/index.html',
      );
      const secondIndex = html.indexOf('Second article');
      const firstIndex = html.indexOf('First article');
      assert.ok(secondIndex >= 0 && firstIndex >= 0);
      assert.ok(
        secondIndex < firstIndex,
        'seriesOrder 1 (Second article) must render before seriesOrder 2 (First article)',
      );
    },
  );

  await t.test(
    'archive page kind: grouped by UTC year, excludes the unlisted record',
    async () => {
      assert.ok(routePaths.has('fixture-1/archive/2025/index.html'));
      assert.ok(
        !routePaths.has('fixture-1/archive/2026/index.html'),
        'the only 2026 record is unlisted and must not generate an archive year page',
      );
      const html = await readRoute(
        outputDirectory,
        'fixture-1/archive/2025/index.html',
      );
      assert.match(html, /First article/);
      assert.match(html, /Second article/);
    },
  );

  await t.test(
    'every generated page carries the skip link, one header, one primary nav and one footer',
    async () => {
      for (const routePath of htmlRoutePaths) {
        const html = await readRoute(outputDirectory, routePath);
        assert.match(
          html,
          // S2-T07 adds the `data-gala-publication-root` presence attribute
          // after `dir`, hence the trailing `[^>]*` rather than an exact `>`.
          /^<!doctype html>\n<html lang="[^"]+" dir="(ltr|rtl)"[^>]*>/,
        );
        assert.equal(
          (html.match(/<a href="#main-content">/g) ?? []).length,
          1,
          `${routePath} must carry exactly one skip link`,
        );
        assert.equal((html.match(/<header>/g) ?? []).length, 1, routePath);
        assert.equal(
          (html.match(/<nav aria-label="Primary">/g) ?? []).length,
          1,
          routePath,
        );
        assert.equal((html.match(/<footer>/g) ?? []).length, 1, routePath);
        assert.equal(
          (html.match(/<main id="main-content">/g) ?? []).length,
          1,
          routePath,
        );
      }
    },
  );
});

test('S2-T06 acceptance: index pagination crosses the page-size boundary with correct controls', async (t) => {
  const buildInput = await buildRichFixture();
  // Replace content with LISTING_PAGE_SIZE + 1 published articles so the
  // index kind must paginate into exactly two pages.
  const [template] = buildInput.content;
  buildInput.content = Array.from({ length: LISTING_PAGE_SIZE + 1 }, (_, i) => {
    const clone = JSON.parse(JSON.stringify(template));
    clone.frontmatter.id = stableId(100 + i);
    clone.frontmatter.kind = 'article';
    clone.frontmatter.status = 'published';
    clone.frontmatter.slug = `article-${i}`;
    delete clone.frontmatter.route;
    clone.frontmatter.tags = [];
    delete clone.frontmatter.series;
    delete clone.frontmatter.seriesOrder;
    clone.frontmatter.publishedAt = `2025-01-${String(i + 1).padStart(2, '0')}T09:00:00.000Z`;
    clone.frontmatter.createdAt = clone.frontmatter.publishedAt;
    clone.resolvedAuthorIds = clone.frontmatter.authorIds;
    return clone;
  });
  await applyCurrentRenderPolicy(buildInput);

  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  t.after(cleanup);
  const { manifest } = await renderPublication(buildInput, {
    outputDirectory,
    workDirectory,
    sourceDirectory,
    provenance: testProvenance(),
  });
  const routePaths = new Set(manifest.routes.map((route) => route.path));
  assert.ok(routePaths.has('fixture-1/index.html'));
  assert.ok(routePaths.has('fixture-1/page/2/index.html'));
  assert.ok(!routePaths.has('fixture-1/page/3/index.html'));

  const pageOne = await readRoute(outputDirectory, 'fixture-1/index.html');
  assert.match(pageOne, /<span>Previous<\/span>/);
  assert.match(pageOne, /<a rel="next" href="\/fixture-1\/page\/2">Next<\/a>/);
  assert.match(pageOne, /Page 1 of 2/);

  const pageTwo = await readRoute(
    outputDirectory,
    'fixture-1/page/2/index.html',
  );
  assert.match(pageTwo, /<a rel="prev" href="\/fixture-1">Previous<\/a>/);
  assert.match(pageTwo, /<span>Next<\/span>/);
  assert.match(pageTwo, /Page 2 of 2/);
});

test('S2-T06 acceptance: the error page kind is a pure function with exactly one h1 and a link home', () => {
  const messages = getMessages('en');
  const body = renderErrorPageBody({ messages, homeRoute: '/fixture-1' });
  assert.equal((body.match(/<h1>/g) ?? []).length, 1);
  assert.match(body, /Page not found/);
  assert.match(body, /<a href="\/fixture-1">Return to the home page<\/a>/);
});

test('S2-T06: every chrome string comes from the message catalog, not an inline literal', () => {
  const messages = getMessages('en');
  assert.equal(messages.skipToContent, 'Skip to content');
  assert.equal(typeof messages.pageStatusLabel, 'function');
  assert.equal(
    /** @type {(current: string, total: string) => string} */ (
      messages.pageStatusLabel
    )('1', '2'),
    'Page 1 of 2',
  );
  // A tag with no dedicated catalog falls back to the default (`en`) catalog
  // rather than throwing or returning an empty catalog.
  const fallback = getMessages('xx-Zzzz');
  assert.equal(fallback.skipToContent, 'Skip to content');
});

test('S2-T06 determinism: two clean builds of the rich multi-content-kind fixture are byte-identical', async (t) => {
  const buildInput = await buildRichFixture();
  const provenance = testProvenance();

  const first = await createRenderDirectories();
  const second = await createRenderDirectories();
  t.after(async () => {
    await first.cleanup();
    await second.cleanup();
  });

  const firstResult = await renderPublication(buildInput, {
    outputDirectory: first.outputDirectory,
    workDirectory: first.workDirectory,
    sourceDirectory: first.sourceDirectory,
    provenance,
  });
  const secondResult = await renderPublication(buildInput, {
    outputDirectory: second.outputDirectory,
    workDirectory: second.workDirectory,
    sourceDirectory: second.sourceDirectory,
    provenance,
  });

  for (const route of firstResult.manifest.routes) {
    const firstBytes = await readRoute(first.outputDirectory, route.path);
    const secondBytes = await readRoute(second.outputDirectory, route.path);
    assert.equal(
      firstBytes,
      secondBytes,
      `route ${route.path} must be byte-identical across two clean builds`,
    );
  }
  assert.equal(
    firstResult.manifest.artifactDigest,
    secondResult.manifest.artifactDigest,
  );
});
