/**
 * The generated Terms and Privacy pages, the legal footer navigation's
 * referral link and the `POLICY_ROUTE_CONFLICT` failure.
 */

import { strict as assert } from 'node:assert';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import {
  BuildInputValidationError,
  renderPublication,
} from '../src/core/index.js';
import { madeWithGalascribeHref } from '../src/core/internal/chrome.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import { applyCurrentRenderPolicy } from './helpers/schema-fixtures.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';

/**
 * @param {(buildInput: any) => Promise<void>} [prepare] changes the build input
 * @returns {Promise<Map<string, string>>} each route's UTF-8 text
 */
async function render(prepare = async () => {}) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  await prepare(buildInput);
  const dirs = await createRenderDirectories();
  try {
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
    return files;
  } finally {
    await dirs.cleanup();
  }
}

test('both policy pages render with titles, robots, breadcrumb and prose', async () => {
  const files = await render();
  for (const [file, title, text] of [
    ['fixture-1/terms/index.html', 'Terms', 'Terms of Service</a>'],
    [
      'fixture-1/privacy/index.html',
      'Privacy',
      'No advertising or analytics tracking is loaded by default.',
    ],
  ]) {
    const html = /** @type {string} */ (files.get(file));
    assert.ok(html, file);
    assert.match(html, new RegExp(`<title>${title} \\| `));
    assert.match(html, /<meta name="robots" content="index, follow">/);
    assert.match(html, /data-gala-page-kind="policy"/);
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    assert.match(html, new RegExp(`<h1>${title}</h1>`));
    assert.ok(html.includes(text), file);
    assert.match(
      html,
      /<nav[^>]*aria-label="Breadcrumb"[\s\S]*?Home[\s\S]*?<\/nav>/,
    );
  }
});

test('policy pages are in the sitemap and absent from search, feeds and llms', async () => {
  const files = await render();
  const sitemap = /** @type {string} */ (files.get('fixture-1/sitemap.xml'));
  assert.match(sitemap, /<loc>[^<]*\/terms\/<\/loc>/);
  assert.match(sitemap, /<loc>[^<]*\/privacy\/<\/loc>/);
  for (const file of [
    'fixture-1/search-index.json',
    'fixture-1/llms.txt',
    'fixture-1/llms-full.txt',
    'fixture-1/feed/atom.xml',
    'fixture-1/feed/rss.xml',
  ]) {
    const text = /** @type {string} */ (files.get(file));
    assert.ok(text, file);
    assert.ok(!/\/terms|\/privacy/.test(text), file);
  }
});

test('an authored page on /terms fails the build closed', async () => {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const page = buildInput.content.find(
    (/** @type {any} */ record) => record.frontmatter.kind === 'page',
  );
  page.frontmatter.slug = 'terms';
  page.frontmatter.route = undefined;
  await applyCurrentRenderPolicy(buildInput);
  const dirs = await createRenderDirectories();
  try {
    /** @type {any} */
    let failure;
    await assert.rejects(
      renderPublication(buildInput, {
        outputDirectory: dirs.outputDirectory,
        workDirectory: dirs.workDirectory,
        sourceDirectory: dirs.sourceDirectory,
        provenance: testProvenance(),
      }),
      (error) => {
        failure = error;
        return error instanceof BuildInputValidationError;
      },
    );
    assert.deepEqual(
      failure.diagnostics.map((/** @type {any} */ d) => d.code),
      ['POLICY_ROUTE_CONFLICT'],
    );
    await assert.rejects(stat(dirs.outputDirectory), { code: 'ENOENT' });
  } finally {
    await dirs.cleanup();
  }
});

test('a redirect from /privacy fails the build closed', async () => {
  await assert.rejects(
    render(async (buildInput) => {
      buildInput.content[0].frontmatter.redirects = ['/privacy'];
    }),
    BuildInputValidationError,
  );
});

test('madeWithGalascribeHref names the percent-encoded host', () => {
  const tail =
    '&utm_medium=referral&utm_campaign=made-with-galascribe&utm_content=footer';
  assert.equal(
    madeWithGalascribeHref('https://my-notes.example.com/blog/'),
    `https://galascribe.com/?utm_source=my-notes.example.com${tail}`,
  );
  assert.equal(
    madeWithGalascribeHref('https://münchen.example/'),
    `https://galascribe.com/?utm_source=xn--mnchen-3ya.example${tail}`,
  );
});
