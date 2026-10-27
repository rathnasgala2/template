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
      /<span class="g-chip g-lang-chip" lang="en-US" aria-current="true">American English<\/span>/,
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
