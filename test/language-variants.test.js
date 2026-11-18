/**
 * Language variants: a bilingual pair (en-US primary + `ta` translation named
 * by `translationOf`) and a standalone `ta` article render with language
 * chips, hreflang pairs, a `/ta/` section, per-language feeds, sitemap
 * alternates and Tamil chrome; a language-segment collision fails the build.
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
import {
  addEditions,
  buildRichFixture,
  stableId,
} from './helpers/page-kind-fixtures.js';
import { assertWellFormedXml } from './helpers/xml-well-formed.js';

/**
 * @param {Record<string, unknown>} original the record to clone
 * @param {number} n the clone's id number
 * @param {Record<string, unknown>} frontmatter overrides
 * @param {string} body the clone's body HTML
 * @returns {Record<string, unknown>}
 */
function cloneRecord(original, n, frontmatter, body) {
  const record = JSON.parse(JSON.stringify(original));
  record.frontmatter = {
    ...record.frontmatter,
    id: stableId(n),
    series: undefined,
    seriesOrder: undefined,
    route: undefined,
    hero: undefined,
    socialImage: undefined,
    redirects: [],
    ...frontmatter,
  };
  record.body = body;
  delete record.media;
  return record;
}

/**
 * @param {object} buildInput a rich fixture
 * @returns {Promise<object>} the fixture with the bilingual pair and a
 *   standalone Tamil article added
 */
async function bilingualFixture(buildInput) {
  const [first] = buildInput.content;
  return addEditions(buildInput, [
    cloneRecord(
      first,
      601,
      {
        title: 'முதல் கட்டுரை',
        slug: 'first-article-ta',
        language: 'ta',
        translationOf: 'first-article',
        tags: ['alpha'],
        publishedAt: '2025-01-11T09:00:00.000Z',
        createdAt: '2025-01-11T09:00:00.000Z',
      },
      '<p>தமிழ் உள்ளடக்கம்</p>',
    ),
    cloneRecord(
      first,
      602,
      {
        title: 'தனி கட்டுரை',
        slug: 'solo-ta',
        language: 'ta',
        tags: [],
        publishedAt: '2025-03-01T09:00:00.000Z',
        createdAt: '2025-03-01T09:00:00.000Z',
      },
      '<p>தனிக் கட்டுரை</p>',
    ),
  ]);
}

/**
 * @param {string} directory
 * @param {string} route
 * @returns {Promise<string>}
 */
const read = (directory, route) =>
  readFile(path.join(directory, route), 'utf8');

test('language variants: a bilingual pair and a standalone Tamil article', async (t) => {
  const buildInput = await bilingualFixture(await buildRichFixture());
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  t.after(cleanup);
  const { manifest } = await renderPublication(buildInput, {
    outputDirectory,
    workDirectory,
    sourceDirectory,
    provenance: testProvenance(),
  });
  const paths = manifest.routes.map((route) => route.path);
  const base = 'https://fixture-1.example.com/fixture-1';

  await t.test(
    'routes: the primary keeps /<slug>/, the translation is under /ta/',
    () => {
      assert.ok(paths.includes('fixture-1/first-article/index.html'));
      assert.ok(paths.includes('fixture-1/ta/first-article/index.html'));
      assert.ok(paths.includes('fixture-1/solo-ta/index.html'));
      assert.ok(paths.includes('fixture-1/ta/index.html'));
    },
  );

  await t.test('article pages carry chips and hreflang pairs', async () => {
    const en = await read(
      outputDirectory,
      'fixture-1/first-article/index.html',
    );
    const ta = await read(
      outputDirectory,
      'fixture-1/ta/first-article/index.html',
    );
    for (const html of [en, ta]) {
      assert.match(html, /class="g-chip g-lang-chip"/);
      assert.ok(
        html.includes(
          `<link rel="alternate" hreflang="en-US" href="${base}/first-article/">`,
        ),
      );
      assert.ok(
        html.includes(
          `<link rel="alternate" hreflang="ta" href="${base}/ta/first-article/">`,
        ),
      );
      assert.ok(
        html.includes(
          `<link rel="alternate" hreflang="x-default" href="${base}/first-article/">`,
        ),
      );
    }
    // The current variant is a marked span, the other a link.
    assert.match(
      en,
      /<span class="g-chip g-lang-chip" lang="en-US" aria-current="true">English<\/span>/,
    );
    assert.match(
      en,
      /<a class="g-chip g-lang-chip" lang="ta" hreflang="ta" href="[^"]*\/ta\/first-article\/">தமிழ்<\/a>/,
    );
    assert.match(
      ta,
      /<span class="g-chip g-lang-chip" lang="ta" aria-current="true">தமிழ்<\/span>/,
    );
    // A standalone article has no alternates.
    const solo = await read(outputDirectory, 'fixture-1/solo-ta/index.html');
    assert.ok(!solo.includes('hreflang="x-default"'));
  });

  await t.test('Tamil chrome and date on the Tamil page', async () => {
    const ta = await read(
      outputDirectory,
      'fixture-1/ta/first-article/index.html',
    );
    assert.match(ta, /<html[^>]*lang="ta"/);
    assert.ok(ta.includes('உள்ளடக்கத்திற்குச் செல்'));
    assert.ok(ta.includes('11 ஜன., 2025'));
    assert.match(ta, /நிமிட வாசிப்பு/);
    const en = await read(
      outputDirectory,
      'fixture-1/first-article/index.html',
    );
    assert.ok(en.includes('Skip to content'));
    assert.ok(en.includes('Jan 10, 2025'));
  });

  await t.test(
    'listings show the group once, by its primary, with chips',
    async () => {
      const home = await read(outputDirectory, 'fixture-1/index.html');
      assert.ok(home.includes('First article'));
      assert.ok(!home.includes('முதல் கட்டுரை'));
      assert.match(home, /g-lang-chip/);
      const archive = await read(
        outputDirectory,
        'fixture-1/archive/2025/index.html',
      );
      assert.equal(archive.split('First article').length - 1 >= 1, true);
      assert.ok(!archive.includes('முதல் கட்டுரை'));
    },
  );

  await t.test(
    '/ta/ lists the language newest first, in Tamil chrome',
    async () => {
      const index = await read(outputDirectory, 'fixture-1/ta/index.html');
      assert.ok(index.indexOf('தனி கட்டுரை') < index.indexOf('முதல் கட்டுரை'));
      assert.ok(index.includes('மொழி'));
      assert.ok(!index.includes('First article'));
    },
  );

  await t.test('language switcher: header and footer, only here', async () => {
    const home = await read(outputDirectory, 'fixture-1/index.html');
    assert.equal(home.split('class="g-lang-switch"').length - 1, 2);
    assert.match(home, /href="[^"]*\/ta\/"[^>]*>தமிழ்/);
  });

  await t.test(
    'feeds: primaries only by default, a feed per language, advertised',
    async () => {
      const atom = await read(outputDirectory, 'fixture-1/feed/atom.xml');
      assertWellFormedXml(atom);
      assert.ok(!atom.includes('முதல் கட்டுரை'));
      assert.ok(atom.includes('First article'));
      const taAtom = await read(outputDirectory, 'fixture-1/feed/ta/atom.xml');
      assertWellFormedXml(taAtom);
      assert.ok(taAtom.includes('xml:lang="ta"'));
      assert.ok(
        taAtom.includes('முதல் கட்டுரை') && taAtom.includes('தனி கட்டுரை'),
      );
      assertWellFormedXml(
        await read(outputDirectory, 'fixture-1/feed/ta/rss.xml'),
      );
      const feedRoute = manifest.routes.find(
        (r) => r.path === 'fixture-1/feed/ta/rss.xml',
      );
      assert.equal(feedRoute?.routeClass, 'feed');
      const home = await read(outputDirectory, 'fixture-1/index.html');
      assert.ok(
        home.includes(
          `type="application/atom+xml" hreflang="ta" href="${base}/feed/ta/atom.xml"`,
        ),
      );
    },
  );

  await t.test('sitemap: alternates for group members only', async () => {
    const sitemap = await read(outputDirectory, 'fixture-1/sitemap.xml');
    assertWellFormedXml(sitemap);
    assert.ok(sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'));
    assert.ok(
      sitemap.includes(
        `<xhtml:link rel="alternate" hreflang="ta" href="${base}/ta/first-article/"/>`,
      ),
    );
    assert.ok(
      sitemap.includes(
        `<xhtml:link rel="alternate" hreflang="x-default" href="${base}/first-article/"/>`,
      ),
    );
    assert.ok(sitemap.includes(`<loc>${base}/ta/</loc>`));
    const solo =
      sitemap.match(/<url><loc>[^<]*\/solo-ta\/<\/loc>.*?<\/url>/)?.[0] ?? '';
    assert.ok(solo && !solo.includes('xhtml:link'));
  });

  await t.test("search index carries each entry's language", async () => {
    const index = JSON.parse(
      await read(outputDirectory, 'fixture-1/search-index.json'),
    );
    const ta = index.documents.filter((d) => d.language === 'ta');
    assert.equal(ta.length, 2);
  });
});

test('language variants: an article slugged like a language segment fails the build', async (t) => {
  const buildInput = await bilingualFixture(await buildRichFixture());
  buildInput.content[1].frontmatter.slug = 'ta';
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  t.after(cleanup);
  await assert.rejects(
    renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    }),
    (error) =>
      JSON.stringify(error.diagnostics ?? error).includes(
        'LANGUAGE_SEGMENT_CONFLICT',
      ),
  );
});

test('language variants: an unresolved translationOf renders as a standalone article', async (t) => {
  const buildInput = await bilingualFixture(await buildRichFixture());
  buildInput.content[4].frontmatter.translationOf = 'no-such-article';
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  t.after(cleanup);
  await renderPublication(buildInput, {
    outputDirectory,
    workDirectory,
    sourceDirectory,
    provenance: testProvenance(),
  });
  const html = await read(
    outputDirectory,
    'fixture-1/ta/no-such-article/index.html',
  );
  assert.ok(!html.includes('hreflang="x-default"'));
});

/**
 * @param {object} buildInput
 * @param {import('node:test').TestContext} t
 * @returns {Promise<{outputDirectory: string, manifest: any}>}
 */
async function renderFixture(buildInput, t) {
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  t.after(cleanup);
  const { manifest } = await renderPublication(buildInput, {
    outputDirectory,
    workDirectory,
    sourceDirectory,
    provenance: testProvenance(),
  });
  return { outputDirectory, manifest };
}

/**
 * @param {Promise<unknown>} promise
 * @param {string} code
 * @returns {Promise<void>}
 */
const rejectsWith = (promise, code) =>
  assert.rejects(promise, (error) =>
    JSON.stringify(error.diagnostics ?? error).includes(code),
  );

/**
 * @param {object} buildInput
 * @param {number} n
 * @param {Record<string, unknown>} frontmatter
 * @returns {Promise<object>}
 */
function addTamil(buildInput, n, frontmatter) {
  return addEditions(buildInput, [
    cloneRecord(
      buildInput.content[0],
      n,
      {
        title: `Tamil ${n}`,
        slug: `tamil-${n}`,
        language: 'ta',
        tags: [],
        publishedAt: `2025-02-${String(n - 700).padStart(2, '0')}T09:00:00.000Z`,
        createdAt: '2025-02-01T09:00:00.000Z',
        ...frontmatter,
      },
      '<p>Tamil body</p>',
    ),
  ]);
}

test('language variants: a ta article without translations keeps English chrome and no switcher', async (t) => {
  const input = await addTamil(await buildRichFixture(), 701, {});
  const { outputDirectory, manifest } = await renderFixture(input, t);
  const html = await read(outputDirectory, 'fixture-1/tamil-701/index.html');
  assert.ok(html.includes('Skip to content'));
  assert.ok(!html.includes('g-lang-switch'));
  assert.ok(!manifest.routes.some((r) => r.path === 'fixture-1/ta/index.html'));
});

test('language variants: a ta default-language site renders Tamil chrome', async (t) => {
  const input = await buildRichFixture();
  input.publication.defaultLanguage = 'ta';
  const { outputDirectory } = await renderFixture(input, t);
  const html = await read(outputDirectory, 'fixture-1/index.html');
  assert.ok(html.includes('உள்ளடக்கத்திற்குச் செல்'));
});

test('language variants: two members in one language fail the build', async (t) => {
  const input = await addTamil(
    await bilingualFixture(await buildRichFixture()),
    703,
    {
      translationOf: 'first-article',
    },
  );
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  t.after(cleanup);
  await rejectsWith(
    renderPublication(input, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    }),
    'LANGUAGE_VARIANT_DUPLICATE',
  );
});

test('language variants: a redirect under a language segment fails the build', async (t) => {
  const input = await bilingualFixture(await buildRichFixture());
  input.content[1].frontmatter.redirects = ['/ta/first-article'];
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  t.after(cleanup);
  await rejectsWith(
    renderPublication(input, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    }),
    'LANGUAGE_SEGMENT_CONFLICT',
  );
});

test('language variants: ta and ta-IN are two languages with two sections', async (t) => {
  const input = await addTamil(
    await bilingualFixture(await buildRichFixture()),
    704,
    {
      language: 'ta-IN',
    },
  );
  const { manifest } = await renderFixture(input, t);
  const paths = manifest.routes.map((r) => r.path);
  assert.ok(paths.includes('fixture-1/ta/index.html'));
  assert.ok(paths.includes('fixture-1/ta-in/index.html'));
});

test('language variants: a long language section paginates with its own canonical', async (t) => {
  let input = await bilingualFixture(await buildRichFixture());
  for (let n = 705; n < 728; n += 1) input = await addTamil(input, n, {});
  const { outputDirectory } = await renderFixture(input, t);
  const html = await read(outputDirectory, 'fixture-1/ta/page/2/index.html');
  assert.match(html, /<link rel="canonical" href="[^"]*\/ta\/page\/2\/">/);
});

test('language variants: an unpublished primary lists its first published variant', async (t) => {
  const input = await bilingualFixture(await buildRichFixture());
  input.content[0].frontmatter.status = 'unlisted';
  const { outputDirectory } = await renderFixture(input, t);
  const home = await read(outputDirectory, 'fixture-1/index.html');
  assert.ok(home.includes('முதல் கட்டுரை'));
});

test('language variants: a translation of a series part gets the series box', async (t) => {
  const input = await bilingualFixture(await buildRichFixture());
  Object.assign(input.content[4].frontmatter, {
    series: 'story',
    seriesOrder: 2,
  });
  const { outputDirectory } = await renderFixture(input, t);
  const html = await read(
    outputDirectory,
    'fixture-1/ta/first-article/index.html',
  );
  assert.match(html, /class="g-series-box"/);
});

test('language variants: a tag only on the translation lists the group once', async (t) => {
  const input = await bilingualFixture(await buildRichFixture());
  input.content[4].frontmatter.tags = ['gamma'];
  const { outputDirectory } = await renderFixture(input, t);
  const html = await read(outputDirectory, 'fixture-1/tags/gamma/index.html');
  assert.equal(html.split('class="g-card-link"').length - 1, 1);
  assert.ok(html.includes('First article'));
});

test('language variants: a noindex variant is left out of every alternate', async (t) => {
  const input = await bilingualFixture(await buildRichFixture());
  input.content[4].frontmatter.seo = { noindex: true };
  const { outputDirectory } = await renderFixture(input, t);
  for (const route of [
    'fixture-1/first-article/index.html',
    'fixture-1/ta/first-article/index.html',
  ]) {
    const html = await read(outputDirectory, route);
    assert.ok(!html.includes('<link rel="alternate" hreflang='));
  }
  const sitemap = await read(outputDirectory, 'fixture-1/sitemap.xml');
  // Only the mirrored listing pages carry alternates, no article page.
  const articleEntries =
    sitemap.match(/<url><loc>[^<]*\/first-article\/<\/loc>.*?<\/url>/g) ?? [];
  assert.equal(articleEntries.length, 1);
  for (const entry of articleEntries) assert.ok(!entry.includes('xhtml:link'));
});

test('language variants: cards carry language chips and the Tamil feed entry carries its body', async (t) => {
  const input = await bilingualFixture(await buildRichFixture());
  const { outputDirectory } = await renderFixture(input, t);
  const archive = await read(
    outputDirectory,
    'fixture-1/archive/2025/index.html',
  );
  assert.match(archive, /<div class="g-card-top">[^]*?g-chip g-lang-chip/);
  const atom = await read(outputDirectory, 'fixture-1/feed/ta/atom.xml');
  assert.ok(atom.includes('&lt;p&gt;தமிழ் உள்ளடக்கம்&lt;/p&gt;'));
  const rss = await read(outputDirectory, 'fixture-1/feed/ta/rss.xml');
  assert.ok(rss.includes('<language>ta</language>'));
});

test('language variants: labels are primary-subtag names unless the site shares the subtag', async (t) => {
  const plain = await bilingualFixture(await buildRichFixture());
  const { outputDirectory } = await renderFixture(plain, t);
  const html = await read(
    outputDirectory,
    'fixture-1/first-article/index.html',
  );
  assert.ok(html.includes('>English</span>'));
  assert.ok(!html.includes('American English'));
  assert.match(html, /<nav class="g-lang-switch"[^>]*>[^]*?English[^]*?தமிழ்/);
  assert.match(html, /lang="en-US"/);

  const dialects = await addTamil(
    await bilingualFixture(await buildRichFixture()),
    720,
    { language: 'en-GB', title: 'British piece' },
  );
  const out = await renderFixture(dialects, t);
  const home = await read(out.outputDirectory, 'fixture-1/index.html');
  assert.ok(home.includes('American English'));
  assert.ok(home.includes('British English'));
});

const LOCAL_NAME = 'நீலாம்பூர்';

/**
 * @param {object} input
 * @returns {object} the same input with the first author localized to Tamil
 */
function withLocalizedAuthor(input) {
  input.authors[0].localized = [
    { language: 'ta', displayName: LOCAL_NAME, biography: 'தமிழ் சுயவிவரம்' },
  ];
  return input;
}

test('language variants: a Tamil page shows the localized author, the English page the canonical one', async (t) => {
  const input = withLocalizedAuthor(
    await bilingualFixture(await buildRichFixture()),
  );
  const canonical = input.authors[0].displayName;
  const { outputDirectory } = await renderFixture(input, t);
  const en = await read(outputDirectory, 'fixture-1/first-article/index.html');
  const ta = await read(
    outputDirectory,
    'fixture-1/ta/first-article/index.html',
  );
  assert.ok(ta.includes(`>${LOCAL_NAME}</a>`));
  assert.ok(ta.includes(`"name":"${LOCAL_NAME}"`));
  assert.ok(!en.includes(LOCAL_NAME));
  assert.ok(en.includes(`>${canonical}</a>`));
  const href = (html) =>
    html.match(/<div class="g-byline-text"><span><a href="([^"]*)"/)?.[1];
  assert.ok(href(en));
  // The Tamil page's author link goes to the Tamil author page.
  assert.equal(href(ta), href(en).replace('/authors/', '/ta/authors/'));
  const section = await read(outputDirectory, 'fixture-1/ta/index.html');
  assert.ok(section.includes(LOCAL_NAME));
});

test('language variants: without translationOf a localized author is ignored', async (t) => {
  const input = withLocalizedAuthor(
    await addTamil(await buildRichFixture(), 721, {}),
  );
  const { outputDirectory } = await renderFixture(input, t);
  const html = await read(outputDirectory, 'fixture-1/tamil-721/index.html');
  assert.ok(!html.includes(LOCAL_NAME));
  assert.ok(html.includes(`>${input.authors[0].displayName}</a>`));
});

const NAV = [
  { type: 'internal', label: 'Home', route: '/fixture-1', children: [] },
  {
    type: 'internal',
    label: 'Journal',
    route: '/fixture-1/archive',
    children: [],
  },
  { type: 'internal', label: 'About', route: '/fixture-1/about', children: [] },
  {
    type: 'internal',
    label: 'Essays',
    route: '/fixture-1/essays',
    children: [],
  },
  {
    type: 'external',
    label: 'Elsewhere',
    url: 'https://x.example/',
    children: [],
  },
];

/** @returns {Promise<object>} the bilingual fixture with a primary navigation */
async function bilingualWithNav() {
  const input = await bilingualFixture(await buildRichFixture());
  input.navigation = { ...input.navigation, items: NAV, footerItems: NAV };
  return input;
}

/**
 * @param {string} html
 * @returns {string[]} the document's internal hrefs
 */
const hrefsOf = (html) =>
  [...html.matchAll(/ href="(\/fixture-1\/[^"#]*)"/g)].map((m) => m[1]);

test('language variants: the language section is a full mirror of the site', async (t) => {
  const input = await bilingualWithNav();
  const { outputDirectory, manifest } = await renderFixture(input, t);
  const paths = manifest.routes.map((r) => r.path);
  const base = 'https://fixture-1.example.com/fixture-1';

  await t.test(
    '/ta/ is a home: wrapper, featured, tag pills, latest',
    async () => {
      const html = await read(outputDirectory, 'fixture-1/ta/index.html');
      assert.match(html, /data-gala-home-layout="/);
      assert.match(html, /class="g-wrap g-hero"/);
      assert.match(html, /class="g-wrap g-topic-strip"/);
      assert.match(html, /id="latest-title"/);
      assert.ok(html.includes('/fixture-1/ta/tags/alpha/'));
      assert.ok(!html.includes('First article'));
      assert.match(html, /<html[^>]*lang="ta"/);
      assert.ok(html.includes(`<link rel="canonical" href="${base}/ta/">`));
    },
  );

  await t.test(
    'tag, tags index and archive pages exist with Tamil articles only',
    async () => {
      for (const route of [
        'fixture-1/ta/tags/alpha/index.html',
        'fixture-1/ta/tags/index.html',
        'fixture-1/ta/archive/index.html',
        'fixture-1/ta/archive/2025/index.html',
        'fixture-1/ta/authors/fixture-1/index.html',
      ]) {
        assert.ok(paths.includes(route), route);
      }
      const tag = await read(
        outputDirectory,
        'fixture-1/ta/tags/alpha/index.html',
      );
      assert.ok(tag.includes('முதல் கட்டுரை'));
      assert.ok(
        !tag.includes('Second article') && !tag.includes('First article'),
      );
      assert.match(tag, /<html[^>]*lang="ta"/);
      assert.ok(
        tag.includes(`<link rel="canonical" href="${base}/ta/tags/alpha/">`),
      );
      const archive = await read(
        outputDirectory,
        'fixture-1/ta/archive/2025/index.html',
      );
      assert.ok(
        archive.includes('தனி கட்டுரை') && !archive.includes('Second article'),
      );
      assert.ok(tag.includes('"@type":"BreadcrumbList"'));
      assert.ok(tag.includes(`${base}/ta/tags/alpha/`));
    },
  );

  await t.test(
    'a tag with no Tamil article has no page and the switcher falls back',
    async () => {
      assert.ok(!paths.includes('fixture-1/ta/tags/beta/index.html'));
      const beta = await read(
        outputDirectory,
        'fixture-1/tags/beta/index.html',
      );
      assert.match(beta, /hreflang="ta" href="\/fixture-1\/ta\/">தமிழ்/);
      assert.ok(
        !beta.includes(
          'hreflang="ta" href="https://fixture-1.example.com/fixture-1/ta/tags',
        ),
      );
    },
  );

  await t.test(
    'a Tamil article links to the Tamil listings, the English one does not',
    async () => {
      const ta = await read(
        outputDirectory,
        'fixture-1/ta/first-article/index.html',
      );
      assert.match(ta, /class="g-tag" href="\/fixture-1\/ta\/tags\/alpha\/"/);
      assert.ok(ta.includes('class="g-brand" href="/fixture-1/ta/"'));
      assert.ok(!ta.includes('href="/fixture-1/tags/'));
      const en = await read(
        outputDirectory,
        'fixture-1/first-article/index.html',
      );
      assert.match(en, /class="g-tag" href="\/fixture-1\/tags\/alpha\/"/);
      assert.ok(!en.includes('href="/fixture-1/ta/tags/'));
    },
  );

  await t.test(
    'navigation: catalog labels and section routes on Tamil pages only',
    async () => {
      const ta = await read(outputDirectory, 'fixture-1/ta/archive/index.html');
      const nav = ta.match(/<nav class="g-nav"[^]*?<\/nav>/)?.[0] ?? '';
      assert.ok(nav.includes('<a href="/fixture-1/ta/">முகப்பு</a>'));
      assert.ok(
        nav.includes('<a href="/fixture-1/ta/archive/" aria-current="page">'),
      );
      assert.ok(nav.includes('>பற்றி</a>'));
      // No Tamil counterpart of /about: the default route, the catalog label.
      assert.ok(nav.includes('<a href="/fixture-1/about/">பற்றி</a>'));
      // A non-system and an external item keep the author's label.
      assert.ok(nav.includes('>Essays</a>') && nav.includes('>Elsewhere</a>'));
      assert.ok(!nav.includes('>Home</a>') && !nav.includes('>Journal</a>'));
      const en = await read(outputDirectory, 'fixture-1/archive/index.html');
      const enNav = en.match(/<nav class="g-nav"[^]*?<\/nav>/)?.[0] ?? '';
      assert.ok(enNav.includes('>Home</a>') && enNav.includes('>Journal</a>'));
      assert.ok(
        enNav.includes('href="/fixture-1/archive/" aria-current="page"'),
      );
      assert.ok(ta.includes('<a href="/fixture-1/ta/">முகப்பு</a>'));
    },
  );

  await t.test('switcher: the same page in the other language', async () => {
    const tag = await read(outputDirectory, 'fixture-1/tags/alpha/index.html');
    assert.match(
      tag,
      /hreflang="ta" href="\/fixture-1\/ta\/tags\/alpha\/">தமிழ்/,
    );
    const taTag = await read(
      outputDirectory,
      'fixture-1/ta/tags/alpha/index.html',
    );
    assert.match(
      taTag,
      /hreflang="en-US" href="\/fixture-1\/tags\/alpha\/">English/,
    );
    const archive = await read(outputDirectory, 'fixture-1/archive/index.html');
    assert.match(archive, /hreflang="ta" href="\/fixture-1\/ta\/archive\/">/);
    const home = await read(outputDirectory, 'fixture-1/index.html');
    assert.match(home, /hreflang="ta" href="\/fixture-1\/ta\/">/);
    const taHome = await read(outputDirectory, 'fixture-1/ta/index.html');
    assert.match(taHome, /hreflang="en-US" href="\/fixture-1\/">/);
  });

  await t.test(
    'hreflang pairs and x-default on both twins, mirrored in the sitemap',
    async () => {
      for (const route of [
        'fixture-1/tags/alpha/index.html',
        'fixture-1/ta/tags/alpha/index.html',
      ]) {
        const html = await read(outputDirectory, route);
        assert.ok(
          html.includes(
            `<link rel="alternate" hreflang="en-US" href="${base}/tags/alpha/">`,
          ),
        );
        assert.ok(
          html.includes(
            `<link rel="alternate" hreflang="ta" href="${base}/ta/tags/alpha/">`,
          ),
        );
        assert.ok(
          html.includes(
            `<link rel="alternate" hreflang="x-default" href="${base}/tags/alpha/">`,
          ),
        );
      }
      const beta = await read(
        outputDirectory,
        'fixture-1/tags/beta/index.html',
      );
      assert.ok(!beta.includes('<link rel="alternate" hreflang="'));
      const sitemap = await read(outputDirectory, 'fixture-1/sitemap.xml');
      assert.ok(sitemap.includes(`<loc>${base}/ta/tags/alpha/</loc>`));
      assert.ok(
        sitemap.includes(
          `<xhtml:link rel="alternate" hreflang="ta" href="${base}/ta/tags/alpha/"/>`,
        ),
      );
      assert.ok(
        sitemap.includes(
          `<xhtml:link rel="alternate" hreflang="x-default" href="${base}/ta/"/>`,
        ) === false,
      );
      assert.ok(
        sitemap.includes(
          `<xhtml:link rel="alternate" hreflang="x-default" href="${base}/archive/"/>`,
        ),
      );
    },
  );

  await t.test(
    'every internal link on a Tamil page resolves to a generated page',
    async () => {
      const known = new Set(
        paths.map((p) => `/${p.replace(/index\.html$/, '')}`),
      );
      for (const route of paths.filter(
        (p) => p.startsWith('fixture-1/ta/') && p.endsWith('index.html'),
      )) {
        const html = await read(outputDirectory, route);
        for (const href of hrefsOf(html)) {
          if (!href.startsWith('/fixture-1/ta/')) continue;
          assert.ok(known.has(href), `${route} links to missing ${href}`);
        }
      }
    },
  );
});

test('language variants: a translation landing on a mirrored route fails the build', async (t) => {
  const input = await bilingualFixture(await buildRichFixture());
  input.content[0].frontmatter.slug = 'tags';
  input.content[0].frontmatter.route = '/elsewhere';
  input.content[4].frontmatter.translationOf = 'tags';
  const dir = await createRenderDirectories();
  t.after(dir.cleanup);
  await assert.rejects(
    renderPublication(input, {
      outputDirectory: dir.outputDirectory,
      workDirectory: dir.workDirectory,
      sourceDirectory: dir.sourceDirectory,
      provenance: testProvenance(),
    }),
    (error) =>
      JSON.stringify(error.diagnostics ?? error).includes(
        'LANGUAGE_SEGMENT_CONFLICT',
      ),
  );
});
