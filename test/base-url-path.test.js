/**
 * Production defect regression (rathnastest/g9): a `baseUrl` that carries a
 * path (a GitHub project site, `https://owner.github.io/g9/`) must prefix
 * every emitted URL with that path, while candidate-directory output file
 * paths stay unchanged (the artifact deploys at the hosting site root).
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import { derivePublicBasePath } from '../src/core/internal/route.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import { applyCurrentRenderPolicy } from './helpers/schema-fixtures.js';

/**
 * @param {string | undefined} baseUrl a `baseUrl` override, or `undefined`
 *   to keep the fixture's own origin-only value
 * @returns {Promise<{html: string, files: Record<string, string>, paths: string[], baseUrl: string}>}
 *   rendered HTML pages concatenated, selected generated files and every
 *   manifest route path
 */
async function render(baseUrl) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  buildInput.basePath = '/';
  for (const record of buildInput.content) {
    record.frontmatter.route = `/${record.frontmatter.slug ?? 'fixture-1'}`;
  }
  if (baseUrl) buildInput.baseUrl = baseUrl;
  await applyCurrentRenderPolicy(buildInput);
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    });
    const paths = manifest.routes.map(
      (/** @type {{path: string}} */ r) => r.path,
    );
    let html = '';
    /** @type {Record<string, string>} */
    const files = {};
    for (const route of manifest.routes) {
      const text = await readFile(
        path.join(outputDirectory, route.path),
        'utf8',
      );
      if (route.routeClass === 'html') html += `${text}\n`;
      files[route.path] = text;
    }
    return { html, files, paths, baseUrl: buildInput.baseUrl };
  } finally {
    await cleanup();
  }
}

test('derivePublicBasePath normalises the baseUrl path and basePath with no double slashes', () => {
  assert.equal(derivePublicBasePath('https://example.test', '/'), '/');
  assert.equal(derivePublicBasePath('https://example.test/', '/'), '/');
  assert.equal(
    derivePublicBasePath('https://example.test/site/', '/'),
    '/site/',
  );
  assert.equal(
    derivePublicBasePath('https://example.test/site', '/'),
    '/site/',
  );
  assert.equal(derivePublicBasePath('https://example.test', '/blog'), '/blog');
  assert.equal(
    derivePublicBasePath('https://example.test/site/', '/blog'),
    '/site/blog/',
  );
});

test('baseUrl with a path: stylesheet, script and internal hrefs, canonical, feed, sitemap and search URLs all carry the base path', async () => {
  const { html, files, paths } = await render('https://example.test/site/');

  const refs = [...html.matchAll(/\b(?:href|src)="([^"#][^"]*)"/g)].map(
    (m) => m[1],
  );
  const rooted = refs.filter((ref) => ref.startsWith('/'));
  assert.ok(rooted.length > 0, 'expected root-relative references');
  for (const ref of rooted) {
    assert.ok(ref.startsWith('/site/'), `${ref} must start with /site/`);
  }
  assert.ok(
    html.includes(
      '<script src="/site/assets/gala-appearance-bootstrap-v1.js">',
    ),
  );
  assert.ok(html.includes('href="/site/assets/gala-base-v1.css"'));
  assert.match(html, /href="\/site\/assets\/theme\/print\.css"/);
  assert.ok(
    html.includes('<a href="/site/about"') || html.includes('href="/site/"'),
  );

  const canonicals = [
    ...html.matchAll(/<link rel="canonical" href="([^"]+)"/g),
  ];
  assert.ok(canonicals.length > 0);
  for (const [, href] of canonicals) {
    assert.ok(
      href.startsWith('https://example.test/site/'),
      `canonical ${href} must include /site/`,
    );
  }
  for (const m of html.matchAll(
    /type="application\/(?:atom|rss)\+xml" href="([^"]+)"/g,
  )) {
    assert.ok(m[1].startsWith('https://example.test/site/feed/'), m[1]);
  }

  for (const [file, text] of Object.entries(files)) {
    if (/\.(xml|json)$/.test(file)) {
      for (const url of text.match(/https:\/\/example\.test\/[^"<\s]*/g) ??
        []) {
        assert.ok(
          url.startsWith('https://example.test/site/'),
          `${file}: ${url} must include /site/`,
        );
      }
    }
  }
  assert.ok(
    Object.keys(files).some((f) => f.endsWith('sitemap.xml')),
    'sitemap.xml generated',
  );
  // Output file paths are unchanged: nothing is nested under `site/`.
  for (const p of paths) {
    assert.ok(!p.startsWith('site/'), `${p} must not be nested under site/`);
  }
});

test('origin-only baseUrl regression: root-relative shapes are unchanged', async () => {
  const { html } = await render(undefined);
  assert.ok(
    html.includes('<script src="/assets/gala-appearance-bootstrap-v1.js">'),
  );
  assert.ok(html.includes('href="/assets/gala-base-v1.css"'));
  assert.ok(!html.includes('/site/'));
  for (const m of html.matchAll(/<link rel="canonical" href="([^"]+)"/g)) {
    assert.equal(new URL(m[1]).pathname.startsWith('//'), false);
  }
});
