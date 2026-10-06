/**
 * Server-rendered site markup (contract 3.0.0): header, home, article,
 * listing pages, footer, cards, icons, reading time, related selection,
 * contents-list threshold, the optional newsletter panel and no-JavaScript
 * readability. Every assertion is a fact about the rendered HTML.
 */

import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import {
  WORDS_PER_MINUTE,
  extractH2Headings,
  monogram,
  plainText,
  readingMinutes,
  renderNewsletterPanel,
} from '../src/core/internal/components.js';
import { ICONS, icon } from '../src/core/internal/icons.js';
import { getMessages } from '../src/core/internal/messages.js';
import {
  CONTENTS_MIN_HEADINGS,
  LATEST_CARD_COUNT,
  RELATED_COUNT,
  selectRelatedArticles,
} from '../src/core/internal/page-kinds.js';
import { normalizeAuthoredMarkdown } from '../src/core/internal/content-security.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { buildRichFixture, stableId } from './helpers/page-kind-fixtures.js';
import { applyCurrentRenderPolicy } from './helpers/schema-fixtures.js';
import { executableScriptCount } from './helpers/html-facts.js';
import { buildTestPng, sha256Of } from './helpers/media-fixtures.js';

/**
 * Render a fixture and read back every HTML route.
 *
 * @param {Record<string, unknown>} buildInput the build input
 * @param {(sourceDirectory: string) => Promise<void>} [prepare] stages
 *   files before the render
 * @returns {Promise<{pages: Map<string, string>, cleanup: () => Promise<void>}>}
 *   route path to rendered HTML
 */
async function renderPages(buildInput, prepare) {
  const dirs = await createRenderDirectories();
  if (prepare) await prepare(dirs.sourceDirectory);
  const { manifest } = await renderPublication(buildInput, {
    outputDirectory: dirs.outputDirectory,
    workDirectory: dirs.workDirectory,
    sourceDirectory: dirs.sourceDirectory,
    provenance: testProvenance(),
  });
  /** @type {Map<string, string>} */
  const pages = new Map();
  for (const route of manifest.routes) {
    if (route.routeClass !== 'html' && route.routeClass !== 'error') continue;
    pages.set(
      route.path,
      await readFile(path.join(dirs.outputDirectory, route.path), 'utf8'),
    );
  }
  return { pages, cleanup: dirs.cleanup };
}

/**
 * @param {string} html
 * @param {RegExp} pattern a global pattern
 * @returns {number} its match count
 */
function count(html, pattern) {
  return (html.match(pattern) ?? []).length;
}

/**
 * @param {number} words how many words of body text
 * @returns {string} a paragraph with that many words
 */
function words(words) {
  return `<p>${Array.from({ length: words }, () => 'word').join(' ')}</p>`;
}

test('reading time: 230 words per minute, rounded up, never below one minute', () => {
  assert.equal(WORDS_PER_MINUTE, 230);
  assert.equal(readingMinutes(''), 1);
  assert.equal(readingMinutes('<p>just a few words</p>'), 1);
  assert.equal(readingMinutes(words(230)), 1);
  assert.equal(readingMinutes(words(231)), 2);
  assert.equal(readingMinutes(words(460)), 2);
  assert.equal(readingMinutes(words(461)), 3);
  // Tags and entities do not count as words.
  assert.equal(
    readingMinutes(`<h2 id="a">${'x '.repeat(10)}</h2>&nbsp;&amp;`),
    1,
  );
  assert.equal(plainText('<p>a <strong>b</strong>&amp; c</p>'), 'a b c');
});

test('contents list: h2 headings are extracted with their ids in order', () => {
  const body = normalizeAuthoredMarkdown(
    '## One\n\ntext\n\n### Sub\n\n## Two *em*\n',
  ).html;
  assert.deepEqual(extractH2Headings(body), [
    { id: 'one', text: 'One' },
    { id: 'two-em', text: 'Two em' },
  ]);
  assert.equal(CONTENTS_MIN_HEADINGS, 2);
});

test('monogram: up to two initials, uppercased', () => {
  assert.equal(monogram('fixture one'), 'FO');
  assert.equal(monogram('galascribe'), 'G');
  assert.equal(monogram(''), '?');
});

test('related selection: shared tags first, then recency, at most three, never the article itself', () => {
  /**
   * @param {string} id
   * @param {string[]} tags
   * @returns {any}
   */
  const record = (id, tags) => ({ frontmatter: { id, tags } });
  const current = record('cur', ['a', 'b']);
  const published = [
    record('n1', []), // newest, no shared tag
    record('n2', ['a']), // one shared
    current,
    record('n3', ['a', 'b']), // two shared
    record('n4', ['b']), // one shared, older than n2
    record('n5', []),
  ];
  const related = selectRelatedArticles(current, published).map(
    (r) => r.frontmatter.id,
  );
  assert.equal(RELATED_COUNT, 3);
  assert.deepEqual(related, ['n3', 'n2', 'n4']);
  // No tag overlap anywhere: falls back to pure recency.
  assert.deepEqual(
    selectRelatedArticles(record('x', ['z']), published).map(
      (r) => r.frontmatter.id,
    ),
    ['n1', 'n2', 'cur'],
  );
});

test('icons: a fixed inline set, decorative, with no external reference', () => {
  assert.ok(Object.keys(ICONS).length > 10);
  for (const name of Object.keys(ICONS)) {
    const svg = icon(name);
    assert.match(
      svg,
      /^<svg class="g-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">/,
    );
    assert.ok(!/<use|href=|xlink|<image|<script|on[a-z]+=/i.test(svg), name);
  }
  assert.equal(icon('no-such-icon'), '');
});

test('newsletter panel: a link to the configured https sign-up URL, nothing when unset or unsafe', () => {
  const messages = getMessages('en');
  assert.equal(renderNewsletterPanel({ newsletter: undefined, messages }), '');
  assert.equal(renderNewsletterPanel({ newsletter: null, messages }), '');
  assert.equal(renderNewsletterPanel({ newsletter: {}, messages }), '');
  assert.equal(
    renderNewsletterPanel({
      newsletter: { url: 'javascript:alert(1)', title: 'x', text: 'y' },
      messages,
    }),
    '',
  );
  const html = renderNewsletterPanel({
    newsletter: {
      url: 'https://example.test/subscribe?a=1&b=2',
      title: 'Join <us>',
      text: 'Monthly.',
    },
    messages,
  });
  assert.match(html, /^<section class="g-wrap g-newsletter"/);
  assert.match(html, /<h2 id="newsletter-title">Join &lt;us&gt;<\/h2>/);
  assert.match(
    html,
    /<a class="g-btn" href="https:\/\/example\.test\/subscribe\?a=1&amp;b=2" rel="noopener">Subscribe/,
  );
  assert.ok(!html.includes('<form'));
  assert.ok(!html.includes('<input'));
});

test('header, home, article, listings and footer render the redesigned structure', async (t) => {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  buildInput.publication.socialLinks = [
    { type: 'github', uri: 'https://github.com/fixture', label: 'GitHub' },
    { type: 'email', uri: 'mailto:hi@example.test' },
  ];
  const { pages, cleanup } = await renderPages(buildInput);
  t.after(cleanup);
  const home = /** @type {string} */ (pages.get('fixture-1/index.html'));
  const article = /** @type {string} */ (
    pages.get('fixture-1/first-article/index.html')
  );

  await t.test(
    'header: monogram brand, tagline, hidden search, details menu',
    () => {
      for (const html of pages.values()) {
        assert.equal(count(html, /<header class="g-header">/g), 1);
        assert.match(
          html,
          /<span class="g-mark" aria-hidden="true">F<\/span><span class="g-brand-text"><span class="g-brand-name">fixture-1<\/span><span class="g-brand-tag">fixture-1<\/span>/,
        );
        assert.match(
          html,
          /<button class="g-search-btn" type="button" hidden data-action="search" data-search-index="\/fixture-1\/search-index\.json" aria-label="Search articles">/,
        );
        assert.match(html, /<details class="g-menu"><summary>/);
        assert.match(
          html,
          /<button class="g-icon-btn" id="gala-appearance-color-mode" type="button" hidden data-action="mode"/,
        );
        assert.match(html, /<div class="g-toast" role="status"/);
      }
    },
  );

  await t.test('home: featured is the newest published article', () => {
    assert.match(
      home,
      /<h2 id="hero-title"><a href="\/fixture-1\/second-article">Second article<\/a><\/h2>/,
    );
    assert.match(home, /Read the essay/);
    assert.match(
      home,
      /<time datetime="2025-06-01T09:00:00\.000Z">Jun 1, 2025<\/time>/,
    );
    assert.match(home, /1 min read/);
    // Only the one other published article is a latest card; the unlisted
    // article never appears.
    assert.equal(count(home, /<article class="g-card/g), 1);
    assert.ok(!home.includes('Unlisted article'));
    assert.ok(LATEST_CARD_COUNT >= 1);
  });

  await t.test('home: tag pills carry counts and real tag links', () => {
    assert.match(
      home,
      /<a class="g-pill" href="\/fixture-1\/tags\/alpha-8ed3f6ad68"><svg[^>]*>.*?<\/svg><span>alpha<\/span><span class="g-pill-count">2<\/span><\/a>/,
    );
    assert.match(
      home,
      /<span>beta<\/span><span class="g-pill-count">1<\/span>/,
    );
  });

  await t.test(
    'home: series card lists parts in series order with a start link',
    () => {
      assert.match(home, /<div class="g-series-card">/);
      assert.match(home, /2 parts/);
      assert.match(
        home,
        /<ol class="g-series-list"><li><a href="\/fixture-1\/second-article"><span class="g-series-n">1<\/span>/,
      );
      assert.match(
        home,
        /<a class="g-btn" href="\/fixture-1\/second-article">Start with part 1/,
      );
    },
  );

  await t.test(
    'home: no newsletter panel when publication.newsletter is unset',
    () => {
      for (const html of pages.values()) {
        assert.ok(!html.includes('g-newsletter'));
      }
    },
  );

  await t.test(
    'card without a hero uses the placeholder element, not an image',
    () => {
      assert.match(home, /<div class="g-card-placeholder" aria-hidden="true">/);
      assert.equal(count(home, /<figure class="g-card-media">/g), 0);
    },
  );

  await t.test(
    'article: series label, byline, share group, tags, author card, series box',
    () => {
      assert.match(
        article,
        /<a class="g-series-tag" href="\/fixture-1\/series\/story-c478361e68"><svg[^>]*>.*?<\/svg>Part 2 of 2<span class="g-dot" aria-hidden="true"><\/span>story<\/a>/,
      );
      assert.match(article, /<h1>First article<\/h1>/);
      assert.match(
        article,
        /<div class="g-byline"><span class="g-avatar" aria-hidden="true">F<\/span>/,
      );
      assert.match(
        article,
        /<a href="\/fixture-1\/authors\/fixture-1">fixture-1<\/a>/,
      );
      assert.match(
        article,
        /<div class="g-share" role="group" aria-label="Share" hidden>/,
      );
      assert.match(
        article,
        /<ul class="g-tags" aria-label="Tags"><li><a class="g-tag" href="\/fixture-1\/tags\/alpha-8ed3f6ad68">/,
      );
      assert.match(article, /<section class="g-author-card"/);
      assert.match(
        article,
        /<li aria-current="true"><a href="\/fixture-1\/first-article"><span class="g-series-n">2<\/span><span>First article<\/span><span class="g-series-here">You are here<\/span>/,
      );
    },
  );

  await t.test(
    'article: newer and older links, keep reading excludes itself',
    () => {
      // First article is the older of the two published articles.
      assert.match(
        article,
        /<a class="g-pager-link" rel="prev" href="\/fixture-1\/second-article">/,
      );
      assert.ok(!article.includes('g-pager-next'));
      const reading = article.slice(article.indexOf('id="related-title"'));
      assert.match(reading, /Keep reading/);
      assert.match(reading, /href="\/fixture-1\/second-article"/);
      assert.ok(!reading.includes('href="/fixture-1/first-article"'));
    },
  );

  await t.test('article: no contents list below two h2 headings', () => {
    assert.ok(!article.includes('g-toc'));
  });

  await t.test(
    'tag, series, archive and author pages: header block plus row cards',
    () => {
      const tag = /** @type {string} */ (
        pages.get('fixture-1/tags/alpha-8ed3f6ad68/index.html')
      );
      assert.match(
        tag,
        /<section class="g-wrap g-topic-hero"><nav class="g-crumbs"/,
      );
      assert.match(
        tag,
        /<p class="g-label">Tag<span class="g-dot" aria-hidden="true"><\/span>2 articles<\/p><h1>alpha<\/h1>/,
      );
      assert.match(tag, /<a class="g-pill" href="[^"]+" aria-current="page">/);
      assert.equal(count(tag, /<article class="g-card g-card-row">/g), 2);
      const series = /** @type {string} */ (
        pages.get('fixture-1/series/story-c478361e68/index.html')
      );
      assert.match(series, /<h1>story<\/h1>/);
      assert.equal(count(series, /<article class="g-card g-card-row">/g), 2);
      const archive = /** @type {string} */ (
        pages.get('fixture-1/archive/2025/index.html')
      );
      assert.match(archive, /<h1>2025<\/h1>/);
      assert.equal(count(archive, /<article class="g-card g-card-row">/g), 2);
    },
  );

  await t.test(
    'footer: brand, description, social icons, RSS, columns, author, base line',
    () => {
      assert.equal(count(home, /<footer class="g-footer">/g), 1);
      assert.match(home, /<p class="g-footer-about">fixture-1<\/p>/);
      assert.match(
        home,
        /<ul class="g-social"><li><a class="g-icon-btn" href="https:\/\/github\.com\/fixture" aria-label="GitHub" title="GitHub"><svg/,
      );
      assert.match(home, /href="mailto:hi@example\.test" aria-label="email"/);
      assert.match(
        home,
        /href="\/fixture-1\/feed\/rss\.xml" aria-label="RSS feed"/,
      );
      assert.match(home, /<nav class="g-footer-col" aria-label="Explore">/);
      assert.match(home, /<nav class="g-footer-col" aria-label="Footer">/);
      assert.match(
        home,
        /<p class="g-label">Written by<\/p><div class="g-byline">/,
      );
      assert.match(
        home,
        /<div class="g-wrap g-footer-base"><span>© 2026 fixture-1<\/span>/,
      );
    },
  );

  await t.test(
    'no-JS readability: every link is a real href, scripts are only the one bootstrap, hidden controls stay hidden',
    () => {
      for (const [route, html] of pages) {
        for (const match of html.matchAll(/<a\b([^>]*)>/g)) {
          const href = /\bhref="([^"]*)"/.exec(match[1]);
          assert.ok(
            href && href[1] !== '' && href[1] !== '#',
            `${route}: <a ${match[1]}>`,
          );
          assert.ok(!/^javascript:/i.test(href[1]));
        }
        assert.equal(executableScriptCount(html), 1, route);
        assert.ok(!/\son[a-z]+=/i.test(html), `${route}: no inline handler`);
        for (const match of html.matchAll(/<button\b([^>]*)>/g)) {
          assert.match(match[1], /\btype="button"/, route);
          assert.match(match[1], /\baria-label="/, route);
        }
      }
      // The script-only controls are hidden until the script reveals them.
      assert.match(article, /g-share" role="group" aria-label="Share" hidden/);
      assert.match(home, /class="g-search-btn" type="button" hidden/);
    },
  );
});

test('article with two or more h2 headings renders the desktop and mobile contents lists', async (t) => {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const { html } = normalizeAuthoredMarkdown(
    '## Alpha heading\n\ntext\n\n## Beta heading\n\ntext\n',
  );
  buildInput.content[0].body = html;
  await applyCurrentRenderPolicy(buildInput);
  const { pages, cleanup } = await renderPages(buildInput);
  t.after(cleanup);
  const article = /** @type {string} */ (
    pages.get('fixture-1/first-article/index.html')
  );
  assert.match(
    article,
    /<nav class="g-toc" aria-label="On this page"><p class="g-label">.*?On this page<\/p><ol class="g-toc-list"><li><a href="#alpha-heading" data-toc="alpha-heading">Alpha heading<\/a><\/li><li><a href="#beta-heading" data-toc="beta-heading">Beta heading<\/a><\/li><\/ol><\/nav>/,
  );
  assert.match(
    article,
    /<details class="g-toc-mobile"><summary>.*?On this page<\/summary><ol class="g-toc-list">/,
  );
  // Every contents link targets a heading id present in the body.
  for (const match of article.matchAll(/data-toc="([^"]+)"/g)) {
    assert.ok(article.includes(`<h2 id="${match[1]}">`));
  }
});

test('hero images: cover figure with alt on the article, media on cards; decorative hero has empty alt', async (t) => {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const png = buildTestPng(640, 360);
  const ref = { path: 'assets/hero.png', sourceDigest: sha256Of(png) };
  buildInput.content[0].frontmatter.hero = {
    file: ref,
    alt: 'A red square',
    role: 'informative',
  };
  buildInput.content[1].frontmatter.hero = {
    file: ref,
    alt: '',
    role: 'decorative',
  };
  await applyCurrentRenderPolicy(buildInput);
  const { pages, cleanup } = await renderPages(buildInput, async (source) => {
    await mkdir(path.join(source, 'assets'), { recursive: true });
    await writeFile(path.join(source, 'assets/hero.png'), png);
  });
  t.after(cleanup);
  const first = /** @type {string} */ (
    pages.get('fixture-1/first-article/index.html')
  );
  const hex = ref.sourceDigest.replace('sha256:', '');
  assert.match(
    first,
    new RegExp(
      `<figure class="g-wrap g-article-cover"><img src="/fixture-1/assets/media/${hex}/original\\.[a-z]+" alt="A red square" width="640" height="360" fetchpriority="high" decoding="async"></figure>`,
    ),
  );
  const second = /** @type {string} */ (
    pages.get('fixture-1/second-article/index.html')
  );
  assert.match(
    second,
    /<figure class="g-wrap g-article-cover"><img [^>]*alt=""[^>]*><\/figure>/,
  );
  // Cards for those articles use the image, not the placeholder.
  assert.match(
    second,
    /<figure class="g-card-media"><img src="\/fixture-1\/assets\/media\/[0-9a-f]+\/original\.[a-z]+" alt="A red square" width="640" height="360" loading="lazy" decoding="async"><\/figure>/,
  );
  assert.ok(stableId(1));
});
