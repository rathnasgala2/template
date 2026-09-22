/**
 * Task packet S2-T06: a landmarks/heading-order structural test that parses
 * every generated page kind's HTML with `parse5` (pinned exact dev
 * dependency, integrity-locked in `package-lock.json`) instead of matching
 * against raw text/regex, so a landmark-order or heading-nesting regression
 * is caught even if it does not change the literal byte sequence a regex
 * happens to look for.
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { parse } from 'parse5';

import { renderPublication } from '../src/core/index.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';

/**
 * @typedef {{nodeName: string, tagName?: string, attrs?: {name: string, value: string}[], childNodes?: Parse5Node[]}} Parse5Node
 */

/**
 * Depth-first walk collecting every element node.
 *
 * @param {Parse5Node} node a parse5 document/element node
 * @param {Parse5Node[]} out accumulator
 * @returns {Parse5Node[]} `out`
 */
function collectElements(node, out = []) {
  if (node.tagName) out.push(node);
  for (const child of node.childNodes ?? []) collectElements(child, out);
  return out;
}

/**
 * @param {Parse5Node} element a parse5 element node
 * @param {string} name an attribute name
 * @returns {string | undefined} the attribute's value, if present
 */
function attr(element, name) {
  return element.attrs?.find((a) => a.name === name)?.value;
}

/**
 * @param {Parse5Node} element the element to read text content from
 * @returns {string} the concatenated text of every descendant text node
 */
function textContent(element) {
  let text = '';
  for (const child of element.childNodes ?? []) {
    if (child.nodeName === '#text') {
      text += /** @type {any} */ (child).value;
    } else {
      text += textContent(child);
    }
  }
  return text;
}

/**
 * Assert one page's complete landmark/heading structure.
 *
 * @param {string} html the page's rendered bytes
 * @param {string} routePath for assertion messages
 * @returns {void}
 */
function assertSkeletonStructure(html, routePath) {
  const document = /** @type {Parse5Node} */ (parse(html));
  const htmlElement = collectElements(document).find(
    (element) => element.tagName === 'html',
  );
  assert.ok(htmlElement, `${routePath}: <html> element must exist`);
  assert.ok(attr(htmlElement, 'lang'), `${routePath}: <html> must carry lang`);
  assert.match(
    /** @type {string} */ (attr(htmlElement, 'dir')),
    /^(ltr|rtl)$/,
    `${routePath}: <html dir> must be ltr or rtl`,
  );

  const body = collectElements(document).find((e) => e.tagName === 'body');
  assert.ok(body, `${routePath}: <body> must exist`);
  const bodyChildren = (body.childNodes ?? []).filter((n) => n.tagName);

  // First focusable element is the skip link.
  const skipLink = bodyChildren[0];
  assert.equal(
    skipLink.tagName,
    'a',
    `${routePath}: first element must be <a>`,
  );
  assert.equal(attr(skipLink, 'href'), '#main-content', routePath);

  const headers = collectElements(document).filter(
    (e) => e.tagName === 'header',
  );
  assert.equal(headers.length, 1, `${routePath}: exactly one <header>`);

  const mains = collectElements(document).filter((e) => e.tagName === 'main');
  assert.equal(mains.length, 1, `${routePath}: exactly one <main>`);
  assert.equal(attr(mains[0], 'id'), 'main-content', routePath);

  const footers = collectElements(document).filter(
    (e) => e.tagName === 'footer',
  );
  assert.equal(footers.length, 1, `${routePath}: exactly one <footer>`);

  // Exactly one primary <nav aria-label="Primary">, direct child of <body>.
  const primaryNavs = collectElements(document).filter(
    (e) => e.tagName === 'nav' && attr(e, 'aria-label') === 'Primary',
  );
  assert.equal(primaryNavs.length, 1, routePath);

  // Landmark order: header, then primary nav, then main, then footer.
  const landmarkTags = bodyChildren.filter((e) =>
    ['header', 'nav', 'main', 'footer'].includes(
      /** @type {string} */ (e.tagName),
    ),
  );
  const order = landmarkTags.map((e) => e.tagName);
  assert.equal(order[0], 'header', routePath);
  assert.equal(order[1], 'nav', routePath);
  assert.ok(order.includes('main'), routePath);
  assert.equal(order[order.length - 1], 'footer', routePath);
  assert.ok(
    order.indexOf('main') > order.indexOf('nav') &&
      order.indexOf('main') < order.indexOf('footer'),
    `${routePath}: main must sit between the primary nav and the footer`,
  );

  // Exactly one <h1> for the whole document, and it lives inside <main>.
  const headings = collectElements(document).filter((e) =>
    /^h[1-6]$/.test(/** @type {string} */ (e.tagName)),
  );
  const h1s = headings.filter((e) => e.tagName === 'h1');
  assert.equal(h1s.length, 1, `${routePath}: exactly one <h1>`);
  const mainDescendants = collectElements(mains[0]);
  assert.ok(
    mainDescendants.includes(h1s[0]),
    `${routePath}: the single <h1> must be inside <main>`,
  );
  assert.ok(textContent(h1s[0]).trim().length > 0, routePath);

  // No heading level is skipped going deeper than h1 (h1 -> h2 -> ..., never
  // h1 -> h3).
  let previousLevel = 0;
  for (const heading of headings) {
    const level = Number(/** @type {string} */ (heading.tagName).slice(1));
    if (previousLevel > 0 && level > previousLevel) {
      assert.equal(
        level,
        previousLevel + 1,
        `${routePath}: heading level jumped from h${previousLevel} to h${level}`,
      );
    }
    previousLevel = level;
  }
}

test('S2-T06 structural test: one golden page per kind has correct landmarks and heading order (parse5)', async (t) => {
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

  /** @type {Record<string, string>} one representative route per page kind */
  const goldenRouteByKind = {
    profile: 'fixture-1/about/index.html',
    author: 'fixture-1/authors/019c0000-0000-7000-8000-000000000002/index.html',
    article: 'fixture-1/first-article/index.html',
    page: 'fixture-1/contact/index.html',
    index: 'fixture-1/index.html',
    'tag-root': 'fixture-1/tags/index.html',
    'tag-leaf': 'fixture-1/tags/alpha-8ed3f6ad68/index.html',
    'series-root': 'fixture-1/series/index.html',
    'series-leaf': 'fixture-1/series/story-c478361e68/index.html',
    'archive-root': 'fixture-1/archive/index.html',
    'archive-leaf': 'fixture-1/archive/2025/index.html',
  };

  const routePaths = new Set(manifest.routes.map((route) => route.path));
  for (const [kind, routePath] of Object.entries(goldenRouteByKind)) {
    await t.test(`${kind} page kind: ${routePath}`, async () => {
      assert.ok(
        routePaths.has(routePath),
        `expected route ${routePath} to exist`,
      );
      const html = await readFile(
        path.join(outputDirectory, routePath),
        'utf8',
      );
      assertSkeletonStructure(html, routePath);
    });
  }
});
