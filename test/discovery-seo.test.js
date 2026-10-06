/**
 * Search and assistant discovery facts for every generated site: JSON-LD,
 * robots.txt, llms.txt, article meta, image dimensions, titles and
 * descriptions, feed content, visible updated dates, author slugs, card
 * links, the single-h1 rule and the minified script. Each test asserts
 * facts about real rendered output.
 */

import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import { APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE } from '../src/core/internal/appearance/bootstrap-script.js';
import { minifyScript } from '../src/core/internal/appearance/minify-script.js';
import { homeDocumentTitle } from '../src/core/internal/page-kinds.js';
import { htmlToText } from '../src/core/internal/llms.js';
import {
  AI_CRAWLER_USER_AGENTS,
  buildRobotsTxt,
  readAiCrawlerPolicy,
} from '../src/core/internal/robots.js';
import { deriveAuthorSlugs } from '../src/core/internal/route-labels.js';
import { serializeJsonLd } from '../src/core/internal/structured-data.js';
import { truncateAtWord } from '../src/core/internal/seo.js';
import {
  executableScriptCount,
  ldGraph,
  ldJsonBlocks,
  metaContents,
} from './helpers/html-facts.js';
import { buildTestPng, sha256Of } from './helpers/media-fixtures.js';
import { buildRichFixture, stableId } from './helpers/page-kind-fixtures.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { applyCurrentRenderPolicy } from './helpers/schema-fixtures.js';

/**
 * Render the rich fixture with a hero image, a brand mark, a default image,
 * an updated article and a recognisable publication title and description.
 *
 * @returns {Promise<{files: Map<string, string>, manifest: any, cleanup: () => Promise<void>}>}
 *   every text file the render wrote, by output path
 */
async function renderSite() {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const png = buildTestPng(640, 360);
  const ref = { path: 'assets/hero.png', sourceDigest: sha256Of(png) };
  buildInput.publication.title = 'Quiet Notes';
  buildInput.publication.description =
    'Essays on slow, careful software and the people who keep it running.';
  buildInput.publication.defaultImage = ref;
  buildInput.appearance.brandMark = ref;
  const [first, second] = buildInput.content;
  first.frontmatter.hero = {
    file: ref,
    alt: 'A red square',
    role: 'informative',
  };
  second.frontmatter.hero = {
    file: ref,
    alt: 'A second cover',
    role: 'informative',
  };
  first.frontmatter.updatedAt = '2025-03-01T09:00:00.000Z';
  first.frontmatter.description = 'The first article.';
  second.frontmatter.description = 'The second article.';
  second.body =
    '<p>Second &amp; <a href="/fixture-1/first-article">first</a> body.</p><h2 id="x">Part</h2><p>More.</p>';
  await applyCurrentRenderPolicy(buildInput);
  const dirs = await createRenderDirectories();
  await mkdir(path.join(dirs.sourceDirectory, 'assets'), { recursive: true });
  await writeFile(path.join(dirs.sourceDirectory, 'assets/hero.png'), png);
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
  return { files, manifest, cleanup: dirs.cleanup };
}

const site = await renderSite();
const { files } = site;
const htmlPages = [...files].filter(([file]) => file.endsWith('.html'));
const page = (/** @type {string} */ file) =>
  /** @type {string} */ (files.get(file));
const titleOf = (/** @type {string} */ html) =>
  /<title>([^<]*)<\/title>/.exec(html)?.[1];
const descriptionOf = (/** @type {string} */ html) =>
  metaContents(html, 'description')[0];
const typesOf = (/** @type {string} */ html) =>
  ldGraph(html).map((node) => node['@type']);

test.after(() => site.cleanup());

test('JSON-LD: one parseable block per page; types per page kind', () => {
  for (const [file, html] of htmlPages) {
    if (file.endsWith('404.html')) continue;
    assert.equal(ldJsonBlocks(html).length, 1, `${file}: one JSON-LD block`);
    assert.doesNotThrow(() => JSON.parse(ldJsonBlocks(html)[0]), file);
  }
  assert.deepEqual(typesOf(page('fixture-1/index.html')), [
    'WebSite',
    'Blog',
    'Organization',
  ]);
  assert.deepEqual(typesOf(page('fixture-1/first-article/index.html')), [
    'BlogPosting',
    'BreadcrumbList',
  ]);
  for (const file of [
    'fixture-1/tags/alpha-8ed3f6ad68/index.html',
    'fixture-1/series/story-c478361e68/index.html',
    'fixture-1/archive/2025/index.html',
    'fixture-1/archive/index.html',
  ]) {
    assert.deepEqual(typesOf(page(file)), ['CollectionPage', 'BreadcrumbList']);
  }
  const author = ldGraph(page('fixture-1/authors/fixture-author-2/index.html'));
  assert.equal(author[0]['@type'], 'ProfilePage');
  const person = /** @type {any} */ (author[0]).mainEntity;
  assert.equal(person['@type'], 'Person');
  assert.equal(person.name, 'fixture-author-2');
  assert.deepEqual(person.sameAs, ['https://github.com/fixture-author-2']);
});

test('JSON-LD: the home page names the site and omits SearchAction', () => {
  const html = page('fixture-1/index.html');
  const [webSite, blog] = /** @type {any[]} */ (ldGraph(html));
  assert.equal(webSite.name, 'Quiet Notes');
  assert.equal(webSite.inLanguage, 'en-US');
  assert.equal(blog.name, 'Quiet Notes');
  assert.ok(!html.includes('SearchAction'));
  assert.ok(blog.blogPost.length >= 2);
});

test('JSON-LD: BlogPosting carries every required field', () => {
  const graph = /** @type {any[]} */ (
    ldGraph(page('fixture-1/first-article/index.html'))
  );
  const post = graph[0];
  assert.equal(post.headline, 'First article');
  assert.equal(post.description, 'The first article.');
  assert.equal(post.datePublished, '2025-01-10T09:00:00.000Z');
  assert.equal(post.dateModified, '2025-03-01T09:00:00.000Z');
  assert.deepEqual(
    { width: post.image.width, height: post.image.height },
    { width: 640, height: 360 },
  );
  assert.match(
    post.image.url,
    /^https:\/\/fixture-1\.example\.com\/.*original\./,
  );
  assert.equal(post.author['@type'], 'Person');
  assert.equal(post.author.name, 'fixture-1');
  assert.equal(
    post.author.url,
    'https://fixture-1.example.com/fixture-1/authors/fixture-1',
  );
  assert.ok(Array.isArray(post.author.sameAs));
  assert.equal(post.publisher['@type'], 'Organization');
  assert.equal(post.publisher.name, 'Quiet Notes');
  assert.equal(post.publisher.logo.width, 640);
  assert.equal(
    post.mainEntityOfPage['@id'],
    'https://fixture-1.example.com/fixture-1/first-article',
  );
  assert.equal(post.keywords, 'alpha');
  assert.equal(post.isPartOf.name, 'story');
  assert.equal(graph[1]['@type'], 'BreadcrumbList');
  assert.deepEqual(
    graph[1].itemListElement.map((/** @type {any} */ item) => item.position),
    [1, 2, 3],
  );
});

test('JSON-LD serialization escapes markup-significant characters', () => {
  const value = '</script><!-- & \u2028 \u2029 >';
  const text = serializeJsonLd({ a: value });
  assert.ok(!/[<>&\u2028\u2029]/.test(text));
  assert.deepEqual(JSON.parse(text), { a: value });
});

test('every page has exactly one executable script, apart from its JSON-LD data block', () => {
  for (const [file, html] of htmlPages) {
    assert.equal(executableScriptCount(html), 1, file);
    assert.equal(
      (html.match(/<script type="application\/ld\+json">/g) ?? []).length,
      file.endsWith('404.html') ? 0 : 1,
      file,
    );
  }
});

test('robots.txt: allows everyone, names the sitemap, allows AI crawlers by default', () => {
  const robots = page('robots.txt');
  assert.match(robots, /^User-agent: \*\nAllow: \/\n/);
  assert.match(
    robots,
    /\nSitemap: https:\/\/fixture-1\.example\.com\/fixture-1\/sitemap\.xml\n$/,
  );
  for (const agent of AI_CRAWLER_USER_AGENTS) {
    assert.ok(!robots.includes(agent), agent);
  }
  assert.equal(
    site.manifest.routes.find((/** @type {any} */ r) => r.path === 'robots.txt')
      .mediaType,
    'text/plain; charset=utf-8',
  );
});

test('robots.txt: the block policy disallows every AI crawler; absent or unknown means allow', () => {
  assert.equal(readAiCrawlerPolicy({}), 'allow');
  assert.equal(readAiCrawlerPolicy({ crawlers: { ai: 'allow' } }), 'allow');
  assert.equal(readAiCrawlerPolicy({ crawlers: { ai: 'block' } }), 'block');
  const robots = buildRobotsTxt({
    aiPolicy: 'block',
    sitemapUrl: 'https://example.com/sitemap.xml',
  });
  assert.equal(AI_CRAWLER_USER_AGENTS.length, 15);
  for (const agent of [
    'GPTBot',
    'ChatGPT-User',
    'OAI-SearchBot',
    'ClaudeBot',
    'Claude-User',
    'Claude-SearchBot',
    'anthropic-ai',
    'Google-Extended',
    'PerplexityBot',
    'Perplexity-User',
    'CCBot',
    'Applebot-Extended',
    'Bytespider',
    'Meta-ExternalAgent',
    'Amazonbot',
  ]) {
    assert.ok(robots.includes(`User-agent: ${agent}\nDisallow: /\n`), agent);
  }
  assert.ok(robots.startsWith('User-agent: *\nAllow: /\n'));
  assert.ok(robots.endsWith('Sitemap: https://example.com/sitemap.xml\n'));
});

test('robots.txt end to end: crawlers.ai "block" disallows every AI crawler; the newsletter panel renders when set', async (t) => {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  buildInput.publication.crawlers = { ai: 'block' };
  buildInput.publication.newsletter = {
    url: 'https://example.test/subscribe',
    title: 'Stay in touch',
    text: 'One email a month.',
  };
  await applyCurrentRenderPolicy(buildInput);
  const dirs = await createRenderDirectories();
  t.after(dirs.cleanup);
  await renderPublication(buildInput, {
    outputDirectory: dirs.outputDirectory,
    workDirectory: dirs.workDirectory,
    sourceDirectory: dirs.sourceDirectory,
    provenance: testProvenance(),
  });
  const robots = await readFile(
    path.join(dirs.outputDirectory, 'robots.txt'),
    'utf8',
  );
  for (const agent of AI_CRAWLER_USER_AGENTS) {
    assert.ok(robots.includes(`User-agent: ${agent}\nDisallow: /\n`), agent);
  }
  assert.ok(robots.startsWith('User-agent: *\nAllow: /\n'));
  const home = await readFile(
    path.join(dirs.outputDirectory, 'fixture-1/index.html'),
    'utf8',
  );
  assert.match(home, /<section class="g-wrap g-newsletter"/);
  assert.match(home, /href="https:\/\/example\.test\/subscribe"/);
  assert.match(home, /<h2 id="newsletter-title">Stay in touch<\/h2>/);
});

test('llms.txt follows the llmstxt.org structure and omits unlisted content', () => {
  const llms = page('fixture-1/llms.txt');
  const lines = llms.split('\n');
  assert.equal(lines[0], '# Quiet Notes');
  assert.equal(
    lines[2],
    '> Essays on slow, careful software and the people who keep it running.',
  );
  assert.ok(lines.indexOf('## Articles') > 2);
  assert.ok(lines.includes('## Series'));
  assert.ok(lines.includes('## Optional'));
  assert.ok(
    lines.includes(
      '- [Second article](https://fixture-1.example.com/fixture-1/second-article): The second article.',
    ),
  );
  assert.ok(
    lines.some((line) =>
      /^- \[story\]\(https:\/\/fixture-1\.example\.com\/fixture-1\/series\/story-/.test(
        line,
      ),
    ),
  );
  for (const needle of [
    '/archive',
    '/feed/rss.xml',
    '/feed/atom.xml',
    '/sitemap.xml',
    '/search-index.json',
    '/llms-full.txt',
  ]) {
    assert.ok(llms.includes(needle), needle);
  }
  assert.ok(!llms.includes('Unlisted article'));
  assert.ok(!llms.includes('unlisted-article'));
});

test('llms-full.txt carries each published article in full as plain text', () => {
  const full = page('fixture-1/llms-full.txt');
  assert.ok(full.startsWith('# Quiet Notes\n'));
  assert.ok(full.includes('# Second article\n'));
  assert.ok(
    full.includes(
      'URL: https://fixture-1.example.com/fixture-1/second-article',
    ),
  );
  assert.ok(full.includes('Published: 2025-06-01T09:00:00.000Z'));
  assert.ok(full.includes('Updated: 2025-03-01T09:00:00.000Z'));
  assert.ok(full.includes('Author: fixture-author-2'));
  assert.ok(full.includes('Tags: alpha, beta'));
  assert.ok(full.includes('Second & first body.'));
  assert.ok(full.includes('## Part'));
  assert.ok(!/<\/?(?:p|a|h2)\b/.test(full));
  assert.ok(!full.includes('Unlisted article'));
  assert.ok(!full.includes('unlisted article body'));
});

test('htmlToText strips markup without turning escaped text back into tags', () => {
  assert.equal(
    htmlToText('<p>a &lt;b&gt; &amp; c</p><ul><li>one</li><li>two</li></ul>'),
    'a <b> & c\n\n- one\n- two',
  );
  assert.equal(htmlToText('<h2 id="x">T</h2><p>x<br>y</p>'), '## T\n\nx\ny');
});

test('article meta: published, modified, author, tags and image facts', () => {
  const html = page('fixture-1/first-article/index.html');
  assert.deepEqual(metaContents(html, 'article:published_time'), [
    '2025-01-10T09:00:00.000Z',
  ]);
  assert.deepEqual(metaContents(html, 'article:modified_time'), [
    '2025-03-01T09:00:00.000Z',
  ]);
  assert.deepEqual(metaContents(html, 'article:author'), [
    'https://fixture-1.example.com/fixture-1/authors/fixture-1',
  ]);
  assert.deepEqual(metaContents(html, 'article:tag'), ['alpha']);
  assert.deepEqual(metaContents(html, 'og:image:width'), ['640']);
  assert.deepEqual(metaContents(html, 'og:image:height'), ['360']);
  assert.deepEqual(metaContents(html, 'og:image:alt'), ['A red square']);
  assert.deepEqual(metaContents(html, 'twitter:image:alt'), ['A red square']);
  const second = page('fixture-1/second-article/index.html');
  assert.deepEqual(metaContents(second, 'article:modified_time'), []);
  assert.deepEqual(metaContents(second, 'article:tag'), ['alpha', 'beta']);
});

test('home and listing pages fall back to the publication default image', () => {
  for (const file of [
    'fixture-1/index.html',
    'fixture-1/tags/index.html',
    'fixture-1/archive/index.html',
  ]) {
    const html = page(file);
    assert.match(metaContents(html, 'og:image')[0], /\/original\./, file);
    assert.deepEqual(metaContents(html, 'og:image:width'), ['640'], file);
    assert.deepEqual(metaContents(html, 'og:image:alt'), ['Quiet Notes'], file);
  }
});

test('every <img> carries width and height; loading hints follow the image role', () => {
  let seen = 0;
  for (const [file, html] of htmlPages) {
    for (const match of html.matchAll(/<img\b[^>]*>/g)) {
      seen += 1;
      const tag = match[0];
      assert.match(tag, /\swidth="\d+"/, `${file}: ${tag}`);
      assert.match(tag, /\sheight="\d+"/, `${file}: ${tag}`);
      assert.match(tag, /\salt="/, `${file}: ${tag}`);
      if (tag.includes('fetchpriority="high"')) {
        assert.ok(!tag.includes('loading='), `${file}: priority is never lazy`);
      } else if (!tag.includes('g-avatar')) {
        assert.match(tag, /decoding="async"/, file);
      }
    }
  }
  assert.ok(seen > 5);
  const article = page('fixture-1/first-article/index.html');
  assert.match(
    article,
    /<figure class="g-wrap g-article-cover"><img [^>]*width="640" height="360" fetchpriority="high"/,
  );
  assert.match(
    article,
    /<span class="g-mark" aria-hidden="true"><img src="[^"]+" alt="" width="640" height="360" decoding="async"><\/span>/,
  );
  assert.match(
    page('fixture-1/index.html'),
    /class="g-hero-media"><img [^>]*fetchpriority="high"/,
  );
  assert.match(
    page('fixture-1/index.html'),
    /<figure class="g-card-media"><img [^>]*loading="lazy" decoding="async"/,
  );
});

test('titles: home is "<Publication> - <tagline>" within 60 chars; every other page is "<Page> | <Publication>"', () => {
  const home = titleOf(page('fixture-1/index.html')) ?? '';
  assert.ok(home.startsWith('Quiet Notes – Essays on slow'), home);
  assert.ok(Array.from(home).length <= 60, home);
  assert.ok(home.endsWith('…'), home);
  assert.equal(
    titleOf(page('fixture-1/first-article/index.html')),
    'First article | Quiet Notes',
  );
  assert.equal(
    titleOf(page('fixture-1/tags/alpha-8ed3f6ad68/index.html')),
    'Posts tagged “alpha” | Quiet Notes',
  );
  assert.equal(
    titleOf(page('fixture-1/series/story-c478361e68/index.html')),
    'story | Quiet Notes',
  );
  assert.equal(
    titleOf(page('fixture-1/archive/2025/index.html')),
    'Archive 2025 | Quiet Notes',
  );
  assert.equal(
    titleOf(page('fixture-1/authors/fixture-author-2/index.html')),
    'fixture-author-2 | Quiet Notes',
  );
  assert.equal(
    titleOf(page('fixture-1/404.html')),
    'Page not found | Quiet Notes',
  );
  assert.equal(homeDocumentTitle('Blog', ''), 'Blog');
  assert.equal(homeDocumentTitle('Blog', 'Short line'), 'Blog – Short line');
  assert.equal(
    homeDocumentTitle('A'.repeat(55), 'a tagline that cannot fit'),
    'A'.repeat(55),
  );
  const titles = htmlPages.map(([, html]) => titleOf(html));
  assert.equal(
    new Set(titles).size,
    titles.length,
    'no two pages share a title',
  );
});

test('meta descriptions exist on every indexable page and are generated per kind', () => {
  for (const [file, html] of htmlPages) {
    if (file.endsWith('404.html')) continue;
    const description = descriptionOf(html);
    assert.ok(description && description.length > 5, file);
    assert.ok(Array.from(description).length <= 160, `${file}: ${description}`);
  }
  assert.equal(
    descriptionOf(page('fixture-1/tags/alpha-8ed3f6ad68/index.html')),
    '2 articles tagged alpha on Quiet Notes.',
  );
  assert.equal(
    descriptionOf(page('fixture-1/series/story-c478361e68/index.html')),
    'story, a series of 2 parts on Quiet Notes.',
  );
  assert.equal(
    descriptionOf(page('fixture-1/archive/2025/index.html')),
    '2 articles published in 2025 on Quiet Notes.',
  );
  assert.equal(
    descriptionOf(page('fixture-1/authors/fixture-author-2/index.html')),
    'A second fixture author.',
  );
  assert.ok(descriptionOf(page('fixture-1/contact/index.html')));
  assert.equal(truncateAtWord('one two three four', 12), 'one two…');
  assert.equal(truncateAtWord('short', 12), 'short');
});

test('RSS carries the full sanitized body, authors and categories; Atom carries content and categories', () => {
  const rss = page('fixture-1/feed/rss.xml');
  assert.match(
    rss,
    /<content:encoded><!\[CDATA\[<p>Second &amp; <a href="https:\/\/fixture-1\.example\.com\/fixture-1\/first-article">first<\/a> body\.<\/p>/,
  );
  assert.match(rss, /<dc:creator>fixture-author-2<\/dc:creator>/);
  assert.match(rss, /<category>alpha<\/category><category>beta<\/category>/);
  const atom = page('fixture-1/feed/atom.xml');
  assert.match(
    atom,
    /<content type="html">&lt;p&gt;Second &amp;amp; &lt;a href=&quot;https:\/\/fixture-1\.example\.com\/fixture-1\/first-article&quot;&gt;first/,
  );
  assert.match(atom, /<category term="alpha"\/><category term="beta"\/>/);
  assert.match(
    atom,
    /<author><name>fixture-author-2<\/name><uri>https:\/\/fixture-1\.example\.com\/fixture-1\/authors\/fixture-author-2<\/uri><\/author>/,
  );
});

test('an article shows its updated date only when it differs from the published date', () => {
  assert.match(
    page('fixture-1/first-article/index.html'),
    /<time datetime="2025-03-01T09:00:00.000Z">Updated Mar 1, 2025<\/time>/,
  );
  assert.ok(!page('fixture-1/second-article/index.html').includes('Updated '));
});

test('author URLs use a slug of the display name; collisions fall back to the id', () => {
  const slugs = deriveAuthorSlugs([
    { id: stableId(2), displayName: 'Ada Lovelace' },
    { id: stableId(1), displayName: 'ada lovelace' },
    { id: stableId(3), displayName: '漢字' },
  ]);
  assert.equal(slugs.get(stableId(1)), 'ada-lovelace');
  assert.equal(slugs.get(stableId(2)), stableId(2));
  assert.equal(slugs.get(stableId(3)), stableId(3));
  assert.equal(new Set(slugs.values()).size, 3);
  assert.ok(files.has('fixture-1/authors/fixture-author-2/index.html'));
  assert.ok(!page('fixture-1/sitemap.xml').includes(stableId(2)));
  assert.ok(
    page('fixture-1/sitemap.xml').includes(
      '<loc>https://fixture-1.example.com/fixture-1/authors/fixture-author-2</loc>',
    ),
  );
});

test('cards link through a titled anchor; the hero has one title link and no image link', () => {
  for (const [file, html] of htmlPages) {
    for (const match of html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)) {
      assert.ok(
        match[1].replace(/<[^>]*>/g, '').trim() !== '' ||
          /aria-label="[^"]+"/.test(match[0]),
        `${file}: link without a name: ${match[0]}`,
      );
    }
    for (const card of html.matchAll(
      /<article class="g-card[^"]*">([\s\S]*?)<\/article>/g,
    )) {
      assert.match(
        card[1],
        /<h[23]><a class="g-card-link" href="[^"]+">[^<]+<\/a><\/h[23]>/,
        file,
      );
    }
  }
  const home = page('fixture-1/index.html');
  assert.ok(!home.includes('<a class="g-hero-media"'));
  const hero =
    /<section class="g-wrap g-hero"[\s\S]*?<\/section>/.exec(home)?.[0] ?? '';
  assert.equal((hero.match(/<h2 id="hero-title"><a href=/g) ?? []).length, 1);
});

test('exactly one h1 per page; the home h1 is the publication name, screen-reader only', () => {
  for (const [file, html] of htmlPages) {
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, file);
  }
  assert.match(
    page('fixture-1/index.html'),
    /<main id="main-content" class="g-main" tabindex="-1"><h1 class="g-sr">Quiet Notes<\/h1>/,
  );
});

test('the shipped site script is minified: no comments, smaller, still parseable', () => {
  const script = APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE;
  assert.doesNotThrow(() => new Function(script));
  assert.ok(!/^\s*\/\//m.test(script));
  assert.ok(!script.includes('/*'));
  assert.ok(!/^[ \t]/m.test(script));
  assert.ok(
    Buffer.byteLength(script) < 18000,
    String(Buffer.byteLength(script)),
  );
  assert.ok(script.includes("'http://www.w3.org/2000/svg'"));
  assert.ok(script.includes('/^https?:/'));
});

test('minifyScript keeps strings and regular expressions and drops comments', () => {
  const source = [
    '// header',
    'var a = "x // y"; /* block */',
    '  var re = /a\\/\\/b[/]c/g; // trailing',
    '',
    '  var n = 4 / 2;',
  ].join('\n');
  assert.equal(
    minifyScript(source),
    'var a = "x // y";\nvar re = /a\\/\\/b[/]c/g;\nvar n = 4 / 2;\n',
  );
});
