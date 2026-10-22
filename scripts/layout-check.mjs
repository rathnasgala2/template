/**
 * Layout guard: build the repository's own rich test fixture site with the
 * base layer, open it in Chromium and print one PASS/FAIL fact per measured
 * layout rule, at 1440x900 and 390x844, in light and dark. Exits non-zero on
 * any failure. Prints facts only, never screenshots.
 *
 * Usage: `npm run layout:check` (needs `npx playwright install chromium` once).
 */

/* global document, window, getComputedStyle */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

import { chromium } from 'playwright';

import { renderPublication } from '../src/core/index.js';
import { buildRichFixture } from '../test/helpers/page-kind-fixtures.js';
import {
  createRenderDirectories,
  testProvenance,
} from '../test/helpers/render-fixtures.js';
import { applyCurrentRenderPolicy } from '../test/helpers/schema-fixtures.js';
import { runIfMain } from './run-if-main.mjs';

const TOLERANCE = 0.75;
const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '960x800', width: 960, height: 800 },
  { name: '800x900', width: 800, height: 900 },
  { name: '390x844', width: 390, height: 844 },
];
/** The widest viewport at which the primary navigation is in the menu. */
const MENU_MAX_WIDTH = 960;
const SCHEMES = ['light', 'dark'];
const CONTENT_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json'],
  ['.svg', 'image/svg+xml'],
  ['.xml', 'application/xml'],
]);

/**
 * The rich fixture, adjusted so that it holds a one-part series and one
 * article with enough headings to carry the Contents rail.
 *
 * @returns {Promise<Record<string, any>>} the build input
 */
async function buildLayoutFixture() {
  const input = /** @type {Record<string, any>} */ (await buildRichFixture());
  const articles = input.content.filter(
    (/** @type {any} */ r) =>
      r.frontmatter.kind === 'article' && r.frontmatter.status !== 'unlisted',
  );
  for (const record of input.content) {
    if (record.frontmatter.series === 'story') {
      record.frontmatter.series = undefined;
      record.frontmatter.seriesOrder = undefined;
    }
  }
  articles[1].frontmatter.series = 'story';
  articles[1].frontmatter.seriesOrder = 1;
  // The first article carries the Contents rail; the second has none.
  articles[0].body = [
    '<p>Opening paragraph of the contents article.</p>',
    '<h2 id="first-heading">First heading</h2>',
    '<p>Paragraph one.</p>',
    '<h2 id="second-heading">Second heading</h2>',
    '<p>Paragraph two.</p>',
    '<h2 id="third-heading">Third heading</h2>',
    '<p>Paragraph three.</p>',
  ].join('');
  articles[1].body = '<p>Plain paragraph of the article without a rail.</p>';
  await applyCurrentRenderPolicy(input);
  return input;
}

/**
 * @param {string} root the rendered output directory
 * @returns {import('node:http').Server} a static file server
 */
function serve(root) {
  return createServer(async (request, response) => {
    try {
      let pathname = decodeURIComponent(
        new URL(request.url ?? '/', 'http://localhost').pathname,
      );
      let file = path.join(root, `.${pathname}`);
      if (!file.startsWith(root)) throw new Error('outside root');
      if ((await stat(file)).isDirectory())
        file = path.join(file, 'index.html');
      response.writeHead(200, {
        'content-type':
          CONTENT_TYPES.get(path.extname(file)) ?? 'application/octet-stream',
      });
      createReadStream(file).pipe(response);
    } catch {
      response.writeHead(404).end('not found');
    }
  });
}

/**
 * Measured in the page; returns plain numbers and strings only.
 *
 * @returns {Record<string, any>} the measured facts
 */
function measure() {
  /**
   * @param {string} selector element selector
   * @param {ParentNode} [root] search root
   * @returns {Record<string, any> | null} its box
   */
  const box = (selector, root = document) => {
    const el = root.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      left: r.left,
      right: r.right,
      top: r.top,
      bottom: r.bottom,
      display: getComputedStyle(el).display,
    };
  };
  /**
   * @param {Element} el the element
   * @returns {{left: number, right: number}} its content-box edges
   */
  const content = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      left: r.left + parseFloat(s.paddingLeft) + parseFloat(s.borderLeftWidth),
      right:
        r.right - parseFloat(s.paddingRight) - parseFloat(s.borderRightWidth),
    };
  };
  const out = {
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    wide: [...document.body.querySelectorAll('*')]
      .filter(
        (el) => el.getBoundingClientRect().right > window.innerWidth + 0.5,
      )
      .slice(0, 3)
      .map((el) => el.tagName.toLowerCase() + '.' + el.className),
    header: null,
    footer: null,
    article: null,
    series: null,
  };
  const row = document.querySelector('.g-header-row');
  if (row) {
    out.header = {
      content: content(row),
      rowTop: row.getBoundingClientRect().top,
      rowBottom: row.getBoundingClientRect().bottom,
      brand: box('.g-header-row > .g-brand'),
      nav: box('.g-header-row > .g-nav'),
      actions: box('.g-header-row > .g-actions'),
      menu: box('.g-header-row .g-menu'),
    };
  }
  const base = document.querySelector('.g-footer-base');
  if (base) {
    const r = base.getBoundingClientRect();
    const before = getComputedStyle(base, '::before');
    const grid = document.querySelector('.g-footer-grid');
    const tracks = grid
      ? getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean)
          .length
      : 0;
    out.footer = {
      content: content(base),
      borderLeft: r.left + parseFloat(before.left),
      borderRight: r.left + parseFloat(before.left) + parseFloat(before.width),
      ownBorderTop: getComputedStyle(base).borderTopWidth,
      tracks,
      columns: grid
        ? [...grid.children].filter(
            (c) => getComputedStyle(c).display !== 'none',
          ).length
        : 0,
    };
  }
  const head = document.querySelector('.g-article-head');
  const prose = document.querySelector('.g-article-grid .g-prose p');
  if (head && prose) {
    out.article = {
      proseLeft: prose.getBoundingClientRect().left,
      toc: document.querySelector('.g-toc') !== null,
      edges: [...head.children].map((c) => ({
        name: c.tagName.toLowerCase() + (c.className ? '.' + c.className : ''),
        left: c.getBoundingClientRect().left,
      })),
      h1Left: head.querySelector('h1')?.getBoundingClientRect().left ?? null,
    };
  }
  const label = document.querySelector('.g-series-card .g-label');
  if (label) out.series = label.textContent ?? '';
  return out;
}

/**
 * @param {number} a
 * @param {number} b
 * @returns {boolean} whether the two edges coincide
 */
const same = (a, b) => Math.abs(a - b) <= TOLERANCE;

/**
 * Footer variants: the same site with fewer footer columns.
 *
 * @type {readonly {label: string, onlyHome: boolean, hasNav: boolean, widen?: boolean, mutate: (input: Record<string, any>) => void}[]}
 */
const VARIANTS = [
  { label: '', onlyHome: false, hasNav: true, mutate: () => {} },
  {
    label: 'long brand, 7-item nav',
    onlyHome: true,
    hasNav: true,
    // Wider text than any one platform's fonts, so every OS catches overflow.
    widen: true,
    mutate: (input) => {
      input.publication.title = 'A Very Long Publication Name Of Forty';
      input.navigation.items = [
        'Archive',
        'Tags',
        'Series',
        'About',
        'Authors',
        'Contact',
        'Elsewhere',
      ].map((label) => ({
        type: 'internal',
        label,
        route: `/${label.toLowerCase()}`,
        children: [],
      }));
    },
  },
  {
    label: '3-column footer',
    onlyHome: true,
    hasNav: true,
    mutate: (input) => {
      input.navigation.footerItems = [];
    },
  },
  {
    label: '2-column footer',
    onlyHome: true,
    hasNav: false,
    mutate: (input) => {
      input.navigation.footerItems = [];
      input.navigation.items = [];
    },
  },
];

/**
 * Build one variant of the fixture site, serve it and measure it.
 *
 * @param {import('playwright').Browser} browser the shared browser
 * @param {(typeof VARIANTS)[number]} variant the site variant
 * @param {(ok: boolean, name: string, detail: string) => void} report records a fact
 * @returns {Promise<void>}
 */
async function checkSite(browser, variant, report) {
  const dirs = await createRenderDirectories();
  const input = await buildLayoutFixture();
  variant.mutate(input);
  const { manifest } = await renderPublication(input, {
    outputDirectory: dirs.outputDirectory,
    workDirectory: dirs.workDirectory,
    sourceDirectory: dirs.sourceDirectory,
    provenance: testProvenance(),
  });
  // Routes are files under the output directory, `basePath` included; the
  // static server below serves that directory at its root.
  const siteDir = String(input.basePath).replace(/^\/+|\/+$/g, '');
  const pages = new Set();
  for (const route of manifest.routes) {
    if (route.routeClass !== 'html') continue;
    pages.add(route.path);
  }
  /**
   * @param {string} slug the route under the site's base path ('' is home)
   * @returns {string | undefined} the page's file path when it was built
   */
  const find = (slug) => {
    const file = `${siteDir ? `${siteDir}/` : ''}${slug}${slug ? '/' : ''}index.html`;
    return pages.has(file) ? file : undefined;
  };
  const allTargets = [
    { name: 'home', file: find(''), home: true },
    { name: 'article-with-contents', file: find('first-article') },
    { name: 'article-without-contents', file: find('second-article') },
  ];
  const targets = variant.onlyHome ? allTargets.slice(0, 1) : allTargets;
  const server = serve(dirs.outputDirectory);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = /** @type {import('node:net').AddressInfo} */ (
    server.address()
  );
  try {
    for (const viewport of VIEWPORTS) {
      for (const scheme of SCHEMES) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          colorScheme: /** @type {'light' | 'dark'} */ (scheme),
          // The injected widening style is the check's own, not the site's.
          bypassCSP: Boolean(variant.widen),
        });
        for (const target of targets) {
          const tag = `${viewport.name} ${scheme} ${target.name}${variant.label ? ` (${variant.label})` : ''}`;
          if (!target.file) {
            report(false, `${tag} page exists`, 'page not found in the build');
            continue;
          }
          const page = await context.newPage();
          const url = `http://127.0.0.1:${port}/${target.file.replace(/index\.html$/, '')}`;
          await page.goto(url, { waitUntil: 'load' });
          if (variant.widen)
            await page.addStyleTag({
              content:
                '[data-gala-publication-root] * { letter-spacing: .06em !important; }',
            });
          const m = await page.evaluate(measure);
          await page.close();
          report(
            m.overflow <= 0,
            `${tag} no horizontal overflow`,
            `scrollWidth-innerWidth=${m.overflow}${m.overflow > 0 ? ` past-edge=${m.wide.join(' ')}` : ''}`,
          );
          const h = m.header;
          if (!h || !h.brand || !h.actions) {
            report(false, `${tag} header present`, 'missing brand or actions');
          } else {
            const edgeL = same(h.brand.left, h.content.left);
            const edgeR = same(h.actions.right, h.content.right);
            report(
              edgeL,
              `${tag} brand.left == content-left`,
              `${h.brand.left.toFixed(1)} vs ${h.content.left.toFixed(1)}`,
            );
            report(
              edgeR,
              `${tag} actions.right == content-right`,
              `${h.actions.right.toFixed(1)} vs ${h.content.right.toFixed(1)}`,
            );
            const oneRow = [
              h.brand,
              h.actions,
              ...(h.nav && h.nav.display !== 'none' ? [h.nav] : []),
            ].every(
              (b) =>
                b.top < h.rowBottom &&
                b.bottom > h.rowTop &&
                Math.abs(
                  (b.top + b.bottom) / 2 - (h.brand.top + h.brand.bottom) / 2,
                ) < 8,
            );
            report(
              oneRow,
              `${tag} header on one row`,
              `row ${h.rowTop.toFixed(0)}..${h.rowBottom.toFixed(0)}`,
            );
            if (!variant.hasNav) {
              // No primary navigation in this variant: nothing to order or move.
            } else if (viewport.width > MENU_MAX_WIDTH) {
              const nav = h.nav;
              const order =
                nav !== null &&
                nav.display !== 'none' &&
                h.brand.right <= nav.left &&
                nav.right <= h.actions.left;
              report(
                order,
                `${tag} brand < nav < actions`,
                nav
                  ? `${h.brand.left.toFixed(0)} < ${nav.left.toFixed(0)} < ${h.actions.left.toFixed(0)}`
                  : 'no nav',
              );
              if (nav)
                report(
                  nav.left - h.brand.right < 80,
                  `${tag} nav follows the brand`,
                  `gap=${(nav.left - h.brand.right).toFixed(0)}px`,
                );
            } else {
              const navHidden = !h.nav || h.nav.display === 'none';
              report(
                navHidden && h.menu !== null && h.menu.display !== 'none',
                `${tag} nav moved into menu`,
                `nav=${h.nav?.display ?? 'none'} menu=${h.menu?.display ?? 'none'}`,
              );
            }
          }
          const f = m.footer;
          if (!f) {
            report(false, `${tag} footer present`, 'missing .g-footer-base');
          } else {
            report(
              same(f.borderLeft, f.content.left) &&
                same(f.borderRight, f.content.right) &&
                f.ownBorderTop === '0px',
              `${tag} footer-base border == content box`,
              `${f.borderLeft.toFixed(1)}..${f.borderRight.toFixed(1)} vs ${f.content.left.toFixed(1)}..${f.content.right.toFixed(1)}`,
            );
            if (viewport.width > MENU_MAX_WIDTH)
              report(
                f.tracks === f.columns,
                `${tag} footer tracks == rendered columns`,
                `tracks=${f.tracks} columns=${f.columns}`,
              );
            else {
              const expected =
                viewport.width > 640 ? Math.min(2, f.columns) : 1;
              report(
                f.tracks === expected,
                `${tag} footer stacks to ${expected} track(s)`,
                `tracks=${f.tracks}`,
              );
            }
          }
          if (target.name.startsWith('article')) {
            const a = m.article;
            if (!a) {
              report(
                false,
                `${tag} article head present`,
                'missing head or prose',
              );
            } else {
              const expectRail = target.name === 'article-with-contents';
              const railOk =
                viewport.width >= 1200 ? a.toc === expectRail : true;
              report(
                railOk,
                `${tag} contents rail as expected`,
                `rail=${a.toc}`,
              );
              const bad = a.edges.filter((e) => !same(e.left, a.proseLeft));
              report(
                a.h1Left !== null &&
                  same(a.h1Left, a.proseLeft) &&
                  bad.length === 0,
                `${tag} heading block == body left edge`,
                `h1=${a.h1Left?.toFixed(1)} body=${a.proseLeft.toFixed(1)} off=${bad.map((e) => e.name).join(',') || 'none'}`,
              );
            }
          }
          if (target.home) {
            report(
              typeof m.series === 'string' &&
                /(^|\D)1 part(?!s)/.test(m.series) &&
                !/1 parts/.test(m.series),
              `${tag} one-part series label`,
              JSON.stringify(m.series),
            );
          }
        }
        await context.close();
      }
    }
  } finally {
    server.close();
    await dirs.cleanup();
  }
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  /** @type {string[]} */
  const failures = [];
  /**
   * @param {boolean} ok whether the fact holds
   * @param {string} name the fact
   * @param {string} detail the measured values
   */
  const report = (ok, name, detail) => {
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${detail}`);
    if (!ok) failures.push(name);
  };
  const browser = await chromium.launch();
  try {
    for (const variant of VARIANTS) await checkSite(browser, variant, report);
  } finally {
    await browser.close();
  }
  console.log(
    failures.length === 0
      ? 'layout:check passed'
      : `layout:check FAILED (${failures.length})`,
  );
  if (failures.length > 0) process.exitCode = 1;
}

runIfMain(import.meta, main);
