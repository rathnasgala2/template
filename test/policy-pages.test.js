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
    const urls = file.endsWith('.json')
      ? jsonStrings(JSON.parse(text))
      : file.endsWith('.xml')
        ? [
            ...text.matchAll(/<(?:link|id|guid)[^>]*>([^<]*)</g),
            ...text.matchAll(/<link[^>]*href="([^"]*)"/g),
          ].map((match) => match[1])
        : [...text.matchAll(/https?:\/\/[^\s)<>"]+|\]\(([^)\s]+)\)/g)].map(
            (match) => match[1] ?? match[0],
          );
    assert.ok(urls.length > 0, `${file} lists URLs`);
    for (const url of urls) {
      assert.ok(!isPolicyRoute(url), `${file} lists ${url}`);
    }
  }
});

/**
 * @param {unknown} value parsed JSON
 * @returns {string[]} every string inside it
 */
function jsonStrings(value) {
  if (typeof value === 'string') return [value];
  if (value === null || typeof value !== 'object') return [];
  return Object.values(value).flatMap(jsonStrings);
}

/**
 * @param {string} value a URL or route
 * @returns {boolean} whether its path ends in the Terms or Privacy route
 */
function isPolicyRoute(value) {
  const route = value.replace(/^https?:\/\/[^/]*/, '').replace(/\/$/, '');
  return /(^|\/)(terms|privacy)$/.test(route);
}

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

/**
 * @param {string[]} redirects redirect routes for the first document
 * @returns {Promise<any>} the build failure
 */
async function redirectFailure(redirects) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  buildInput.content[0].frontmatter.redirects = redirects;
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
    return failure;
  } finally {
    await dirs.cleanup();
  }
}

test('a redirect from /privacy fails the build closed', async () => {
  const failure = await redirectFailure(['/privacy']);
  assert.deepEqual(
    failure.diagnostics.map((/** @type {any} */ d) => d.code),
    ['POLICY_ROUTE_CONFLICT'],
  );
});

test('trailing-slash and upper-case spellings of a policy route conflict too', async () => {
  // The route format admits both a trailing slash and upper-case letters.
  for (const route of ['/terms/', '/Terms', '/PRIVACY/']) {
    const failure = await redirectFailure([route]);
    assert.deepEqual(
      failure.diagnostics.map((/** @type {any} */ d) => d.code),
      ['POLICY_ROUTE_CONFLICT'],
      route,
    );
  }
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
