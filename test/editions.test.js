/**
 * Editions: a `kind: "edition"` document restates one article at another
 * depth. It renders beside the article with the article as its canonical URL
 * and `noindex, follow`, never enters a listing, feed, sitemap, search index or
 * `llms` document, and the article and each edition offer one accessible
 * selector in the `edition-selector` slot. An edition that cannot be placed
 * fails the build before anything is written. Every assertion is a fact about
 * the rendered output.
 */

import { strict as assert } from 'node:assert';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { JSDOM } from 'jsdom';

import {
  BuildInputValidationError,
  renderPublication,
} from '../src/core/index.js';
import { getMessages } from '../src/core/internal/messages.js';
import {
  executableScriptCount,
  ldGraph,
  metaContents,
} from './helpers/html-facts.js';
import { buildTestPng, sha256Of } from './helpers/media-fixtures.js';
import {
  addEditions,
  buildRichFixture,
  editionRecord,
  stableId,
} from './helpers/page-kind-fixtures.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';

const ARTICLE = 'fixture-1/first-article/index.html';
const EDITION_PATHS = {
  QUICK_READ: 'fixture-1/first-article/quick-read/index.html',
  STANDARD: 'fixture-1/first-article/standard/index.html',
  DEEP_DIVE: 'fixture-1/first-article/deep-dive/index.html',
};
const NOTICE =
  'Generated edition, reviewed by the author; the original is the reference';

/**
 * Render the rich fixture after `prepare` has changed it, and read every
 * route's text.
 *
 * @param {(buildInput: any, dirs: {sourceDirectory: string}) => Promise<void>} [prepare]
 *   changes the build input before the render
 * @returns {Promise<{manifest: any, files: Map<string, string>}>} the
 *   manifest and each route's UTF-8 text
 */
async function render(prepare = async () => {}) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const dirs = await createRenderDirectories();
  try {
    await prepare(buildInput, dirs);
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
    return { manifest, files };
  } finally {
    await dirs.cleanup();
  }
}

/**
 * Add one edition of each depth to the first article.
 *
 * @param {any} buildInput the build input
 * @param {Record<string, {frontmatter?: Record<string, unknown>, body?: string}>} [overrides]
 *   per-kind overrides
 * @returns {Promise<void>}
 */
async function addAllEditions(buildInput, overrides = {}) {
  const [article] = buildInput.content;
  await addEditions(
    buildInput,
    ['QUICK_READ', 'STANDARD', 'DEEP_DIVE'].map((kind) =>
      editionRecord(article, /** @type {any} */ (kind), overrides[kind]),
    ),
  );
}

/**
 * @param {string} html a rendered page
 * @returns {Document} its DOM (scripts are not run)
 */
function dom(html) {
  return new JSDOM(html).window.document;
}

/**
 * @param {Document} document a rendered page
 * @returns {{text: string, href: string | null, current: string | null}[]}
 *   the selector's links in order
 */
function selectorLinks(document) {
  return [
    ...document.querySelectorAll(
      '[data-gala-slot="edition-selector"] nav[aria-label="Editions"] a',
    ),
  ].map((link) => ({
    text: link.textContent ?? '',
    href: link.getAttribute('href'),
    current: link.getAttribute('aria-current'),
  }));
}

test('an edition renders beside its article, canonical to the article and not indexed', async () => {
  const { manifest, files } = await render((buildInput) =>
    addAllEditions(buildInput),
  );
  const article = /** @type {string} */ (files.get(ARTICLE));
  const articleUrl = 'https://fixture-1.example.com/fixture-1/first-article';
  assert.match(
    article,
    new RegExp(`<link rel="canonical" href="${articleUrl}">`),
  );
  assert.equal(metaContents(article, 'robots').length, 0, 'article is indexed');

  const labels = {
    QUICK_READ: 'Quick read',
    STANDARD: 'Standard',
    DEEP_DIVE: 'Deep dive',
  };
  for (const [kind, file] of Object.entries(EDITION_PATHS)) {
    const html = /** @type {string} */ (files.get(file));
    assert.ok(html, `${kind} is a manifest route`);
    const route = manifest.routes.find(
      (/** @type {any} */ r) => r.path === file,
    );
    assert.equal(route.routeClass, 'html');
    assert.equal(route.mediaType, 'text/html; charset=utf-8');
    assert.equal(route.interactionBearing, false);
    assert.match(
      html,
      new RegExp(`<link rel="canonical" href="${articleUrl}">`),
    );
    assert.deepEqual(metaContents(html, 'og:url'), [articleUrl]);
    assert.deepEqual(metaContents(html, 'robots'), ['noindex, follow']);
    assert.match(html, /<body data-gala-page-kind="article">/);
    assert.match(
      html,
      new RegExp(
        `<title>First article \\(${labels[/** @type {keyof typeof labels} */ (kind)]}\\) \\| fixture-1</title>`,
      ),
    );
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    // The breadcrumb walks back to the article and ends at the edition.
    assert.match(
      html,
      new RegExp(
        `<li><a href="/fixture-1/first-article">First article</a></li><li aria-current="page">${labels[/** @type {keyof typeof labels} */ (kind)]}</li></ol>`,
      ),
    );
    // Structured data describes a page, not a second copy of the article.
    const graph = ldGraph(html);
    assert.ok(graph.some((node) => node['@type'] === 'WebPage'));
    assert.ok(!graph.some((node) => node['@type'] === 'BlogPosting'));
    // Comments and reactions belong to the article.
    assert.ok(!html.includes('data-gala-interactions'));
  }
  // The edition's own body, not the article's.
  const quick = /** @type {string} */ (files.get(EDITION_PATHS.QUICK_READ));
  assert.ok(quick.includes('<p>The quick-read edition.</p>'));
  assert.ok(!quick.includes('first article body'));
});

test('editions leave every listing, feed, sitemap, search index and llms document untouched', async () => {
  const baseline = await render();
  const withEditions = await render((buildInput) =>
    addAllEditions(buildInput, {
      QUICK_READ: {
        frontmatter: {
          title: 'MARKERQUICK title',
          description: 'MARKERQUICK description',
          // A later year than any article, so a leak into the copyright line,
          // the archive or the sitemap would show.
          publishedAt: '2030-05-05T09:00:00.000Z',
          tags: ['markertag'],
          series: 'markerseries',
          seriesOrder: 1,
        },
        body: '<p>MARKERQUICK body</p>',
      },
    }),
  );

  const editionFiles = new Set(Object.values(EDITION_PATHS));
  const added = [...withEditions.files.keys()].filter(
    (file) => !baseline.files.has(file),
  );
  assert.deepEqual(added.sort(), [...editionFiles].sort());
  assert.deepEqual(
    [...baseline.files.keys()].filter((file) => !withEditions.files.has(file)),
    [],
  );
  // Everything else is byte for byte what it was, except the article, which
  // gained its selector.
  for (const [file, text] of baseline.files) {
    if (file === ARTICLE) {
      assert.notEqual(withEditions.files.get(file), text);
      continue;
    }
    assert.equal(withEditions.files.get(file), text, `${file} is unchanged`);
  }
  // And the marker text appears on the edition's own page alone.
  for (const [file, text] of withEditions.files) {
    assert.equal(
      text.includes('MARKERQUICK'),
      file === EDITION_PATHS.QUICK_READ,
      file,
    );
  }
  for (const file of [
    'fixture-1/sitemap.xml',
    'fixture-1/search-index.json',
    'fixture-1/llms.txt',
    'fixture-1/llms-full.txt',
    'fixture-1/feed/atom.xml',
    'fixture-1/feed/rss.xml',
  ]) {
    const text = /** @type {string} */ (withEditions.files.get(file));
    assert.ok(text, file);
    assert.ok(!/quick-read|standard|deep-dive/.test(text), file);
  }
  // No tag or series page was made for the edition's own labels.
  assert.ok(
    ![...withEditions.files.keys()].some((f) =>
      /markertag|markerseries/.test(f),
    ),
  );
});

test('the article and each edition offer the same accessible selector in the edition-selector slot', async () => {
  const { files } = await render((buildInput) => addAllEditions(buildInput));
  const expected = [
    ['Original', '/fixture-1/first-article'],
    ['Quick read', '/fixture-1/first-article/quick-read'],
    ['Standard', '/fixture-1/first-article/standard'],
    ['Deep dive', '/fixture-1/first-article/deep-dive'],
  ];
  /** @type {[string, number][]} */
  const pages = [
    [ARTICLE, 0],
    [EDITION_PATHS.QUICK_READ, 1],
    [EDITION_PATHS.STANDARD, 2],
    [EDITION_PATHS.DEEP_DIVE, 3],
  ];
  for (const [file, currentIndex] of pages) {
    const html = /** @type {string} */ (files.get(file));
    const document = dom(html);
    const links = selectorLinks(document);
    assert.deepEqual(
      links.map((link) => [link.text, link.href]),
      expected,
      file,
    );
    assert.deepEqual(
      links.map((link) => link.current),
      expected.map((_, index) => (index === currentIndex ? 'page' : null)),
      `${file}: only the page being read is current`,
    );
    // One slot, in the article head, never in the footer.
    assert.equal(
      document.querySelectorAll('[data-gala-slot="edition-selector"]').length,
      1,
    );
    assert.ok(
      document.querySelector(
        '.g-article-head [data-gala-slot="edition-selector"] > nav',
      ),
      'at the top of the article',
    );
    assert.equal(
      document.querySelector('footer [data-gala-slot="edition-selector"]'),
      null,
    );
    // The label belongs to edition pages.
    const label = document.querySelector(
      '[data-gala-slot="edition-selector"] > p',
    );
    if (currentIndex === 0) {
      assert.equal(label, null, 'the original carries no label');
    } else {
      assert.equal(label?.textContent, NOTICE);
    }
    // Plain links: nothing needs JavaScript.
    assert.equal(executableScriptCount(html), 1, file);
    assert.equal(
      document.querySelectorAll(
        '[data-gala-slot="edition-selector"] :is(button, script, form, input)',
      ).length,
      0,
    );
  }
});

test('the selector lists only the kinds that exist, and a page with no edition has none', async () => {
  const { files } = await render(async (buildInput) => {
    const [article] = buildInput.content;
    await addEditions(buildInput, [editionRecord(article, 'STANDARD')]);
  });
  assert.deepEqual(
    selectorLinks(dom(/** @type {string} */ (files.get(ARTICLE)))).map(
      (link) => link.text,
    ),
    ['Original', 'Standard'],
  );
  assert.deepEqual(
    selectorLinks(
      dom(/** @type {string} */ (files.get(EDITION_PATHS.STANDARD))),
    ).map((link) => link.text),
    ['Original', 'Standard'],
  );
  for (const file of [
    'fixture-1/second-article/index.html',
    'fixture-1/contact/index.html',
    'fixture-1/index.html',
  ]) {
    const html = /** @type {string} */ (files.get(file));
    assert.ok(!html.includes('data-gala-slot="edition-selector"'), file);
    assert.ok(!html.includes('aria-label="Editions"'), file);
  }
});

test('an unlisted edition is reachable but is not advertised', async () => {
  const { files } = await render((buildInput) =>
    addAllEditions(buildInput, {
      QUICK_READ: { frontmatter: { status: 'unlisted' } },
    }),
  );
  const names = (/** @type {string} */ file) =>
    selectorLinks(dom(/** @type {string} */ (files.get(file)))).map(
      (link) => link.text,
    );
  assert.deepEqual(names(ARTICLE), ['Original', 'Standard', 'Deep dive']);
  assert.deepEqual(names(EDITION_PATHS.STANDARD), [
    'Original',
    'Standard',
    'Deep dive',
  ]);
  // Read at its own address, the unlisted edition still shows where it sits.
  assert.deepEqual(names(EDITION_PATHS.QUICK_READ), [
    'Original',
    'Quick read',
    'Standard',
    'Deep dive',
  ]);
});

test("an edition with no cover of its own wears its article's cover", async () => {
  const png = buildTestPng(640, 360);
  const { files } = await render(async (buildInput, dirs) => {
    const ref = { path: 'assets/hero.png', sourceDigest: sha256Of(png) };
    buildInput.content[0].frontmatter.hero = {
      file: ref,
      alt: 'A red square',
      role: 'informative',
    };
    await mkdir(path.join(dirs.sourceDirectory, 'assets'), { recursive: true });
    await writeFile(path.join(dirs.sourceDirectory, 'assets/hero.png'), png);
    await addAllEditions(buildInput);
  });
  const cover = (/** @type {string} */ file) =>
    /<figure class="g-wrap g-article-cover">(<img [^>]*>)<\/figure>/.exec(
      /** @type {string} */ (files.get(file)),
    )?.[1];
  assert.ok(cover(ARTICLE));
  assert.equal(cover(EDITION_PATHS.QUICK_READ), cover(ARTICLE));
  assert.deepEqual(
    metaContents(
      /** @type {string} */ (files.get(EDITION_PATHS.QUICK_READ)),
      'og:image',
    ),
    metaContents(/** @type {string} */ (files.get(ARTICLE)), 'og:image'),
  );
});

test('with the interactions module on, only the article carries the conversation', async () => {
  const { manifest, files } = await render(async (buildInput) => {
    buildInput.modules = {
      interactions: {
        config: {
          schemaId: 'urn:gala:schema:interactions-config:2.0.0',
          schemaVersion: '2.0.0',
          reactions: { enabled: true, definitions: [] },
          comments: { enabled: true, allowReplies: true, maxDepth: 3 },
          publicCounts: { reactions: true, comments: true },
        },
        apiOrigin: 'https://api.galascribe.com',
        appOrigin: 'https://app.galascribe.com',
      },
    };
    await addAllEditions(buildInput);
  });
  const bearing = (/** @type {string} */ file) =>
    manifest.routes.find((/** @type {any} */ r) => r.path === file)
      .interactionBearing;
  assert.equal(bearing(ARTICLE), true);
  assert.ok(
    /** @type {string} */ (files.get(ARTICLE)).includes(
      'data-gala-interactions',
    ),
  );
  for (const file of Object.values(EDITION_PATHS)) {
    assert.equal(bearing(file), false, file);
    const html = /** @type {string} */ (files.get(file));
    assert.ok(!html.includes('data-gala-interactions'), file);
    assert.ok(!html.includes('gala-interactions-v1.js'), file);
  }
});

test("an edition's authored redirect leads to the edition", async () => {
  const { manifest, files } = await render((buildInput) =>
    addAllEditions(buildInput, {
      QUICK_READ: { frontmatter: { redirects: ['/quick'] } },
    }),
  );
  assert.deepEqual(
    manifest.redirects.map((/** @type {any} */ r) => [
      r.sourceRoute,
      r.targetRoute,
    ]),
    [['/fixture-1/quick', '/fixture-1/first-article/quick-read']],
  );
  assert.ok(
    /** @type {string} */ (files.get('fixture-1/quick/index.html')).includes(
      'url=/fixture-1/first-article/quick-read"',
    ),
  );
});

/**
 * Render a build input that must be rejected, and check nothing was written.
 *
 * @param {(buildInput: any) => Promise<void>} prepare adds the faulty edition
 * @returns {Promise<Record<string, any>[]>} the error's diagnostics
 */
async function rejected(prepare) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  await prepare(buildInput);
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
    for (const directory of [dirs.outputDirectory, dirs.workDirectory]) {
      await assert.rejects(stat(directory), { code: 'ENOENT' });
    }
    return failure.diagnostics;
  } finally {
    await dirs.cleanup();
  }
}

test('an edition that names no article of the build fails the build before anything is written', async () => {
  for (const of of ['no-such-article', 'contact']) {
    const diagnostics = await rejected(async (buildInput) => {
      const [article] = buildInput.content;
      await addEditions(buildInput, [
        editionRecord(article, 'QUICK_READ', {
          frontmatter: {
            edition: {
              of,
              kind: 'QUICK_READ',
              sourceDigest: `sha256:${'ab'.repeat(32)}`,
              generation: {
                provider: 'anthropic',
                model: 'claude-sonnet-5-5',
                generationId: stableId(401),
              },
              approvedAt: '2026-10-09T10:00:00.000Z',
            },
          },
        }),
      ]);
    });
    assert.equal(diagnostics.length, 1, of);
    assert.equal(diagnostics[0].code, 'EDITION_ORIGINAL_UNRESOLVED');
    assert.equal(diagnostics[0].instancePointer, '/content/4');
    assert.equal(
      diagnostics[0].sourcePath,
      'content/first-article.edition.quick-read.md',
    );
    assert.match(diagnostics[0].remediation, new RegExp(`"${of}"`));
  }
});

test("two editions of one depth, or an edition on another document's route, fail the build", async () => {
  const duplicate = await rejected(async (buildInput) => {
    const [article] = buildInput.content;
    await addEditions(buildInput, [
      editionRecord(article, 'QUICK_READ'),
      editionRecord(article, 'QUICK_READ', {
        frontmatter: { id: stableId(350), slug: 'first-article-quick-again' },
      }),
    ]);
    buildInput.content[5].sourcePath = 'content/first-article.edition.again.md';
  });
  assert.deepEqual(
    duplicate.map((d) => [d.code, d.instancePointer]),
    [['EDITION_DUPLICATE', '/content/5']],
  );

  const conflict = await rejected(async (buildInput) => {
    const [article] = buildInput.content;
    // The contact page takes the quick read's route.
    buildInput.content[3].frontmatter.route = '/first-article/quick-read';
    await addEditions(buildInput, [editionRecord(article, 'QUICK_READ')]);
  });
  assert.deepEqual(
    conflict.map((d) => [d.code, d.instancePointer]),
    [['EDITION_ROUTE_CONFLICT', '/content/4']],
  );
});

test('the selector and notice come from the message catalog; the footer says Made with Galascribe', () => {
  const messages = getMessages('en');
  assert.equal(messages.editionsNavigationLabel, 'Editions');
  assert.equal(messages.editionOriginalLabel, 'Original');
  assert.equal(messages.editionQuickReadLabel, 'Quick read');
  assert.equal(messages.editionStandardLabel, 'Standard');
  assert.equal(messages.editionDeepDiveLabel, 'Deep dive');
  assert.equal(messages.editionNoticeLabel, NOTICE);
  assert.equal(messages.footerAttributionLabel, 'Made with Galascribe');
});
