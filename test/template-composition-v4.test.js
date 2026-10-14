import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import { GALA_BASE_STYLESHEET_SOURCE } from '../src/core/internal/appearance/base-layer.js';
import { renderFooter, renderHeader } from '../src/core/internal/chrome.js';
import { getMessages } from '../src/core/internal/messages.js';
import { buildGeneratedPages } from '../src/core/internal/page-kinds.js';
import {
  assertSupportedComposition,
  EDITORIAL_COMPOSITION,
  NEWSLETTER_COMPOSITION,
  PERSONAL_COMPOSITION,
  SUPPORTED_COMPOSITIONS,
  TEMPLATE_COMPOSITION_SCHEMA_ID,
  VISUAL_COMPOSITION,
} from '../src/core/internal/template-composition.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';

test('generation-4 compositions are complete, immutable and canonical', () => {
  assert.equal(
    TEMPLATE_COMPOSITION_SCHEMA_ID,
    'urn:gala:schema:template-composition:2.0.0',
  );
  assert.deepEqual(
    SUPPORTED_COMPOSITIONS.map((composition) => composition.profile),
    ['editorial', 'newsletter', 'visual', 'personal', 'developer'],
  );
  for (const composition of SUPPORTED_COMPOSITIONS) {
    assert.equal(assertSupportedComposition({ ...composition }), composition);
    assert.equal(Object.isFrozen(composition), true);
  }
});

test('generation-4 composition rejects missing and unsupported layout decisions', () => {
  const missing = { ...EDITORIAL_COMPOSITION };
  delete missing.authorLayout;
  assert.throws(() => assertSupportedComposition(missing), /complete|exactly/);

  assert.throws(
    () =>
      assertSupportedComposition({
        ...EDITORIAL_COMPOSITION,
        homeLayout: 'chronological',
      }),
    /not implemented/,
  );
  assert.throws(
    () =>
      assertSupportedComposition({
        ...NEWSLETTER_COMPOSITION,
        homeLayout: VISUAL_COMPOSITION.homeLayout,
      }),
    /not implemented/,
  );
  assert.throws(
    () =>
      assertSupportedComposition({
        ...PERSONAL_COMPOSITION,
        option: 'unsupported',
      }),
    /exactly/,
  );
});

test('all generation-4 profiles produce distinct home, article, author and listing structures', async () => {
  const input = /** @type {any} */ (await buildRichFixture());
  const visualArticle = input.content.find(
    (record) => record.frontmatter.title === 'Second article',
  );
  assert.ok(visualArticle);
  visualArticle.frontmatter.hero = {
    file: {
      path: 'assets/visual-cover.png',
      sourceDigest: `sha256:${'ab'.repeat(32)}`,
    },
    alt: 'Visual composition cover',
    role: 'informative',
  };
  const rendered = new Map(
    SUPPORTED_COMPOSITIONS.map((composition) => {
      const pages = buildGeneratedPages(input, {
        pageBody: (body) => body,
        composition,
        mediaAssets: [
          {
            path: `assets/media/${'ab'.repeat(32)}/original.png`,
            mediaType: 'image/png',
          },
        ],
      });
      const home = pages.find(
        (page) => page.kind === 'index' && page.route === '/',
      );
      const article = pages.find(
        (page) => page.kind === 'article' && page.title === 'Second article',
      );
      const author = pages.find(
        (page) => page.kind === 'author' && page.title === 'fixture-author-2',
      );
      const listing = pages.find(
        (page) => page.kind === 'tag' && page.route.startsWith('/tags/'),
      );
      assert.ok(home && article && author && listing);
      return [
        composition.profile,
        {
          home: home.bodyHtml,
          article: article.bodyHtml,
          author: author.bodyHtml,
          listing: listing.bodyHtml,
        },
      ];
    }),
  );

  const editorial = rendered.get('editorial');
  const newsletter = rendered.get('newsletter');
  const visual = rendered.get('visual');
  const personal = rendered.get('personal');
  const developer = rendered.get('developer');
  assert.ok(editorial && newsletter && visual && personal && developer);

  assert.ok(
    editorial.home.indexOf('g-hero') < editorial.home.indexOf('g-topic-strip'),
  );
  assert.ok(
    newsletter.home.indexOf('g-topic-strip') <
      newsletter.home.indexOf('g-hero'),
  );
  assert.ok(
    visual.home.indexOf('g-series-card') < visual.home.indexOf('g-topic-strip'),
  );
  assert.ok(
    personal.home.indexOf('latest-title') < personal.home.indexOf('g-hero'),
  );
  assert.ok(
    developer.home.indexOf('g-topic-strip') <
      developer.home.indexOf('latest-title'),
  );

  assert.match(editorial.article, /<div class="g-wrap g-article-grid">/);
  assert.match(
    newsletter.article,
    /<section><div class="g-wrap g-article-head">/,
  );
  assert.match(
    visual.article,
    /data-gala-article-layout="full-bleed"><div class="g-progress"[^>]*><\/div><div>/,
  );
  assert.match(
    visual.article,
    /<figure class="g-article-cover g-article-cover-full-bleed"><img /,
  );
  assert.doesNotMatch(
    visual.article,
    /<figure class="g-wrap g-article-cover[^>]*><img /,
  );
  assert.match(
    GALA_BASE_STYLESHEET_SOURCE,
    /\.g-article-cover-full-bleed img[^}]*aspect-ratio:\s*16\s*\/\s*9/u,
  );
  assert.match(
    GALA_BASE_STYLESHEET_SOURCE,
    /\[data-gala-media-ratio="mixed"\] \.g-hero-media[^}]*aspect-ratio:\s*3\s*\/\s*2/u,
  );
  assert.match(
    GALA_BASE_STYLESHEET_SOURCE,
    /\[data-gala-media-ratio="mixed"\] \.g-grid > \.g-card:nth-child\(3n \+ 1\)[^}]*aspect-ratio:\s*4\s*\/\s*5/u,
  );
  assert.match(
    personal.article,
    /data-gala-article-layout="prose"><div class="g-progress"[^>]*><\/div><section>/,
  );
  assert.match(
    developer.article,
    /data-gala-article-layout="technical"><div class="g-progress"[^>]*><\/div><div>/,
  );

  assert.match(
    editorial.author,
    /data-gala-author-layout="portrait"><section class="g-wrap g-topic-hero">/,
  );
  assert.match(
    newsletter.author,
    /data-gala-author-layout="profile"><section>/,
  );
  assert.match(visual.author, /data-gala-author-layout="portfolio"><div>/);
  assert.match(
    personal.author,
    /data-gala-author-layout="biography"><section>/,
  );
  assert.match(developer.author, /data-gala-author-layout="biography"><div>/);

  assert.match(
    newsletter.listing,
    /data-gala-listing-layout="issues"><div class="g-list"><article class="g-card"/,
  );
  assert.match(
    visual.listing,
    /data-gala-listing-layout="image-grid"><div class="g-grid">/,
  );
  assert.match(
    personal.listing,
    /data-gala-listing-layout="dated-rows"><div class="g-list g-dated-list"><div class="g-dated-row"><time class="g-date-stamp"/,
  );
  assert.doesNotMatch(personal.listing, /class="g-date-stamp"[^>]*aria-hidden/);
  assert.match(
    developer.listing,
    /<div class="g-wrap g-section" data-gala-listing-layout="rows">/,
  );
  assert.doesNotMatch(developer.listing, /g-dated-(?:list|row)|g-date-stamp/);
  assert.notEqual(personal.listing, developer.listing);
  assert.match(
    GALA_BASE_STYLESHEET_SOURCE,
    /\.g-dated-row[^}]*grid-template-columns/u,
  );
  assert.match(
    GALA_BASE_STYLESHEET_SOURCE,
    /\.g-dated-row \.g-card-foot \.g-meta > time:first-child, \.g-dated-row \.g-card-foot \.g-meta > time:first-child \+ \.g-dot\s*\{\s*display:\s*none/u,
  );
});

test('all generation-4 profiles compose header and footer chrome distinctly without dropping content', () => {
  const messages = getMessages('en');
  const chrome = SUPPORTED_COMPOSITIONS.map((composition) => {
    const header = renderHeader({
      homeRoute: '/',
      publicationName: 'Publication',
      tagline: 'Tagline',
      brandMark: undefined,
      navHtml: '<nav>Navigation</nav>',
      navItems: [],
      currentRoute: '/',
      urlPrefix: '/',
      searchIndexHref: '/search.json',
      appearanceControlHtml: '<button>Appearance</button>',
      messages,
      profile: composition.profile,
      headerLayout: composition.headerLayout,
    });
    const footer = renderFooter({
      homeRoute: '/',
      publicationName: 'Publication',
      description: 'Description',
      brandMark: undefined,
      socialLinks: [],
      rssHref: '/rss.xml',
      primaryItems: [
        { type: 'internal', label: 'Primary', route: '/primary', children: [] },
      ],
      footerItems: [
        {
          type: 'internal',
          label: 'Secondary',
          route: '/secondary',
          children: [],
        },
      ],
      urlPrefix: '/',
      authorHtml: '<span>Author</span>',
      footerProfileHtml: '<span>Profile</span>',
      copyrightText: 'Copyright',
      showAttribution: true,
      messages,
      profile: composition.profile,
      footerLayout: composition.footerLayout,
    });
    for (const text of ['Publication', 'Navigation', 'Appearance']) {
      assert.ok(header.includes(text));
    }
    for (const text of ['Publication', 'Primary', 'Secondary', 'Author']) {
      assert.ok(footer.includes(text));
    }
    return `${header}\n${footer}`;
  });
  assert.equal(new Set(chrome).size, SUPPORTED_COMPOSITIONS.length);
});

test('Editorial composition renders distinct Home, Article and Author structures', async (t) => {
  const buildInput = await buildRichFixture();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  t.after(cleanup);

  await renderPublication(buildInput, {
    outputDirectory,
    workDirectory,
    sourceDirectory,
    provenance: testProvenance(),
  });

  const [home, article, author] = await Promise.all([
    readFile(path.join(outputDirectory, 'fixture-1/index.html'), 'utf8'),
    readFile(
      path.join(outputDirectory, 'fixture-1/second-article/index.html'),
      'utf8',
    ),
    readFile(
      path.join(
        outputDirectory,
        'fixture-1/authors/fixture-author-2/index.html',
      ),
      'utf8',
    ),
  ]);

  for (const html of [home, article, author]) {
    assert.match(html, /data-gala-profile="editorial"/);
    assert.match(html, /data-gala-header-layout="masthead"/);
    assert.match(html, /data-gala-footer-layout="expanded"/);
    assert.match(html, /data-gala-media-ratio="landscape"/);
    assert.match(html, /data-gala-density="comfortable"/);
  }

  assert.match(home, /data-gala-home-layout="magazine"/);
  assert.match(
    home,
    /<h2 id="hero-title"><a href="\/fixture-1\/second-article\/">Second article<\/a><\/h2>/,
  );
  assert.match(article, /data-gala-article-layout="editorial"/);
  assert.match(article, /<article class="g-article"/);
  assert.match(author, /data-gala-author-layout="portrait"/);
  assert.match(author, /data-gala-listing-layout="rows"/);
  assert.match(author, /Second article/);
  assert.doesNotMatch(author, /First article/);
});
