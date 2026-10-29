/**
 * The v1-parity round: `deleteDate` removal with a notice page, the
 * `listing.pageSize` setting, `aiRights` (robots.txt, `noai` meta, license.xml,
 * llms.txt), per-article Markdown, `posts.json`, `version.json` and the
 * `/version/` page, and `nofollow` on edition links.
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import { getMessages } from '../src/core/internal/messages.js';
import { nofollowLinks } from '../src/core/internal/editions.js';
import {
  buildRobotsTxt,
  readAiPolicy,
  withTrainingOptOut,
} from '../src/core/internal/robots.js';
import { markdownBodyOf } from '../src/core/internal/static-outputs.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import {
  addEditions,
  buildRichFixture,
  editionRecord,
  stableId,
} from './helpers/page-kind-fixtures.js';
import { assertWellFormedXml } from './helpers/xml-well-formed.js';

const BASE = 'https://fixture-1.example.com/fixture-1';

/**
 * @param {any} input a build input
 * @param {(sourceDirectory: string) => Promise<void>} [prepare] stages source
 *   files before the render
 * @returns {Promise<{read: (route: string) => Promise<string>, exists: (route: string) => Promise<boolean>, paths: string[], cleanup: () => Promise<void>}>}
 */
async function render(input, prepare) {
  const dirs = await createRenderDirectories();
  if (prepare) await prepare(dirs.sourceDirectory);
  const { manifest } = await renderPublication(input, {
    outputDirectory: dirs.outputDirectory,
    workDirectory: dirs.workDirectory,
    sourceDirectory: dirs.sourceDirectory,
    provenance: testProvenance(),
  });
  return {
    read: (route) => readFile(path.join(dirs.outputDirectory, route), 'utf8'),
    exists: (route) =>
      readFile(path.join(dirs.outputDirectory, route)).then(
        () => true,
        () => false,
      ),
    paths: manifest.routes.map((/** @type {any} */ r) => r.path),
    cleanup: dirs.cleanup,
  };
}

/**
 * @param {any} original a record to clone
 * @param {number} n id number
 * @param {Record<string, unknown>} frontmatter overrides
 * @returns {any} the clone
 */
function cloneRecord(original, n, frontmatter) {
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
  record.sourcePath = `content/${frontmatter.slug}.md`;
  delete record.media;
  return record;
}

test('deleteDate: a removed article leaves everything and its route is a notice', async (t) => {
  const input = /** @type {any} */ (await buildRichFixture());
  const second = input.content.find(
    (/** @type {any} */ r) => r.frontmatter.slug === 'second-article',
  );
  second.frontmatter.deleteDate = '2026-09-13';
  const site = await render(input);
  t.after(site.cleanup);

  await t.test('the route renders a noindex notice with no body', async () => {
    const html = await site.read('fixture-1/second-article/index.html');
    assert.match(html, /<meta name="robots" content="noindex, follow">/);
    assert.ok(html.includes('This post was removed'));
    assert.ok(html.includes('It was removed on Sep 13, 2026.'));
    assert.ok(html.includes('Go to the home page'));
    assert.ok(!html.includes('second article body'));
    assert.ok(!html.includes('Second article'));
  });

  await t.test(
    'no listing, feed, sitemap, search, llms or posts.json',
    async () => {
      const home = await site.read('fixture-1/index.html');
      assert.ok(!home.includes('Second article'));
      assert.ok(!home.includes('/second-article/'));
      for (const file of [
        'fixture-1/archive/2025/index.html',
        'fixture-1/tags/beta/index.html',
        'fixture-1/feed/atom.xml',
        'fixture-1/feed/rss.xml',
        'fixture-1/sitemap.xml',
        'fixture-1/search-index.json',
        'fixture-1/llms.txt',
        'fixture-1/llms-full.txt',
        'fixture-1/posts.json',
      ]) {
        if (!(await site.exists(file))) continue;
        const text = await site.read(file);
        assert.ok(!text.includes('second-article'), `${file} names the post`);
        assert.ok(!text.includes('Second article'), `${file} names the post`);
      }
      assert.ok(!(await site.exists('fixture-1/tags/beta/index.html')));
    },
  );
});

test('deleteDate: a future day keeps the article, a past day removes it, UTC day of buildEpoch decides', async (t) => {
  const future = /** @type {any} */ (await buildRichFixture());
  future.content[0].frontmatter.deleteDate = '2026-09-14';
  const a = await render(future);
  t.after(a.cleanup);
  assert.ok(
    (await a.read('fixture-1/first-article/index.html')).includes(
      'first article body',
    ),
  );
  const past = /** @type {any} */ (await buildRichFixture());
  past.content[0].frontmatter.deleteDate = '2026-01-01';
  const b = await render(past);
  t.after(b.cleanup);
  assert.ok(
    (await b.read('fixture-1/first-article/index.html')).includes(
      'This post was removed',
    ),
  );
});

test('deleteDate: each translation obeys its own date; editions of a removed article go with it', async (t) => {
  const input = /** @type {any} */ (await buildRichFixture());
  const first = input.content.find(
    (/** @type {any} */ r) => r.frontmatter.slug === 'first-article',
  );
  await addEditions(input, [
    cloneRecord(first, 601, {
      title: 'முதல் கட்டுரை',
      slug: 'first-article-ta',
      language: 'ta',
      translationOf: 'first-article',
      publishedAt: '2025-01-11T09:00:00.000Z',
      createdAt: '2025-01-11T09:00:00.000Z',
    }),
    editionRecord(first, 'QUICK_READ'),
  ]);
  first.frontmatter.deleteDate = '2026-09-01';
  const site = await render(input);
  t.after(site.cleanup);
  assert.ok(
    (await site.read('fixture-1/first-article/index.html')).includes(
      'This post was removed',
    ),
  );
  const ta = await site.read('fixture-1/ta/first-article/index.html');
  assert.ok(ta.includes('முதல் கட்டுரை'), 'the translation stays');
  assert.ok(!ta.includes('This post was removed'));
  assert.ok(
    !site.paths.includes('fixture-1/first-article/quick-read/index.html'),
  );
});

test('deleteDate: a removed translation speaks its own language on its notice', async (t) => {
  const input = /** @type {any} */ (await buildRichFixture());
  const first = input.content.find(
    (/** @type {any} */ r) => r.frontmatter.slug === 'first-article',
  );
  await addEditions(input, [
    cloneRecord(first, 602, {
      title: 'தனி கட்டுரை',
      slug: 'solo-ta',
      language: 'ta',
      translationOf: 'first-article',
      publishedAt: '2025-03-01T09:00:00.000Z',
      createdAt: '2025-03-01T09:00:00.000Z',
      deleteDate: '2026-01-01',
    }),
    cloneRecord(first, 603, {
      title: 'இன்னொரு கட்டுரை',
      slug: 'other-ta',
      language: 'ta',
      translationOf: 'second-article',
      publishedAt: '2025-03-02T09:00:00.000Z',
      createdAt: '2025-03-02T09:00:00.000Z',
    }),
  ]);
  const site = await render(input);
  t.after(site.cleanup);
  const html = await site.read('fixture-1/ta/first-article/index.html');
  assert.match(html, /<html[^>]*lang="ta"/);
  assert.ok(html.includes(getMessages('ta').postRemovedHeading));
  assert.ok(!html.includes('This post was removed'));
  assert.ok(!html.includes('தனி கட்டுரை'));
  assert.match(html, /noindex/);
});

test('listing.pageSize paginates every listing', async (t) => {
  const make = async (/** @type {number | undefined} */ pageSize) => {
    const input = /** @type {any} */ (await buildRichFixture());
    const [first] = input.content;
    await addEditions(
      input,
      Array.from({ length: 10 }, (_, index) =>
        cloneRecord(first, 700 + index, {
          title: `Extra ${index}`,
          slug: `extra-${index}`,
          tags: [],
          publishedAt: `2024-0${(index % 9) + 1}-01T09:00:00.000Z`,
          createdAt: `2024-0${(index % 9) + 1}-01T09:00:00.000Z`,
        }),
      ),
    );
    if (pageSize) input.publication.listing = { pageSize };
    return render(input);
  };
  const small = await make(2);
  t.after(small.cleanup);
  const plain = await make(undefined);
  t.after(plain.cleanup);
  assert.ok(small.paths.includes('fixture-1/page/2/index.html'));
  assert.ok(small.paths.includes('fixture-1/page/3/index.html'));
  assert.ok(!plain.paths.includes('fixture-1/page/2/index.html'));
});

test('aiRights: robots.txt groups, noai meta, license.xml, llms.txt', async (t) => {
  await t.test(
    'absent: robots.txt is the single-switch file, no extras',
    async () => {
      const site = await render(await buildRichFixture());
      t.after(site.cleanup);
      const robots = await site.read('robots.txt');
      assert.ok(!robots.includes('License:'));
      assert.ok(!(await site.exists('fixture-1/license.xml')));
      assert.ok(!(await site.read('fixture-1/index.html')).includes('noai'));
      assert.ok(!(await site.read('fixture-1/llms.txt')).includes('## AI use'));
    },
  );

  await t.test('crawlers.ai block keeps the legacy 15 agents exactly', () => {
    const text = buildRobotsTxt({
      aiPolicy: 'block',
      sitemapUrl: 'https://x.example/sitemap.xml',
    });
    assert.equal(text.split('\n\n').length, 1 + 15 + 1);
    assert.ok(!text.includes('cohere-ai'));
  });

  await t.test('search blocked, training allowed', () => {
    const text = buildRobotsTxt({
      aiPolicy: 'allow',
      sitemapUrl: 'https://x.example/sitemap.xml',
      rights: readAiPolicy({
        aiRights: { search: 'block', training: 'allow' },
      }),
      licenseFileUrl: 'https://x.example/license.xml',
    });
    assert.match(text, /User-agent: OAI-SearchBot\nUser-agent: ChatGPT-User/);
    assert.ok(!text.includes('User-agent: GPTBot'));
    assert.ok(text.includes('User-agent: Google-Extended\nDisallow: /'));
    assert.ok(text.endsWith('License: https://x.example/license.xml\n'));
  });

  await t.test('training blocked: crawlers, meta, license, llms', async () => {
    const input = /** @type {any} */ (await buildRichFixture());
    input.publication.aiRights = {
      search: 'allow',
      training: 'block',
      licenseUrl: 'https://fixture-1.example.com/licensing',
    };
    const site = await render(input);
    t.after(site.cleanup);
    const robots = await site.read('robots.txt');
    assert.ok(robots.includes('User-agent: GPTBot'));
    assert.ok(robots.includes('User-agent: cohere-ai'));
    assert.ok(robots.includes('User-agent: Meta-ExternalAgent'));
    assert.ok(!robots.includes('User-agent: OAI-SearchBot'));
    assert.ok(robots.includes(`License: ${BASE}/license.xml`));
    const home = await site.read('fixture-1/index.html');
    assert.match(home, /<meta name="robots" content="[^"]*noai, noimageai">/);
    const four = await site.read('fixture-1/404.html');
    assert.match(four, /content="noindex, follow, noai, noimageai"/);
    const license = await site.read('fixture-1/license.xml');
    assertWellFormedXml(license);
    assert.ok(
      license.includes(
        '<permits type="usage">search ai-input ai-index</permits>',
      ),
    );
    assert.ok(license.includes('<prohibits type="usage">ai-train</prohibits>'));
    assert.ok(
      license.includes(
        '<custom>https://fixture-1.example.com/licensing</custom>',
      ),
    );
    const llms = await site.read('fixture-1/llms.txt');
    assert.ok(llms.includes('- Model training: not allowed'));
    assert.ok(llms.includes('- AI search and answer bots: allowed'));
    assert.ok(llms.includes(`${BASE}/license.xml`));
    assert.ok(llms.includes('https://fixture-1.example.com/licensing'));
    assert.ok(site.paths.includes('fixture-1/license.xml'));
  });

  await t.test('robots meta merging', () => {
    assert.equal(withTrainingOptOut('index, follow', false), 'index, follow');
    assert.equal(withTrainingOptOut(undefined, true), 'noai, noimageai');
    assert.equal(
      withTrainingOptOut('noindex, follow, noai', true),
      'noindex, follow, noai, noimageai',
    );
  });
});

test('posts.json, version.json and /version/', async (t) => {
  const site = await render(await buildRichFixture());
  t.after(site.cleanup);
  const posts = JSON.parse(await site.read('fixture-1/posts.json'));
  assert.deepEqual(
    posts.posts.map((/** @type {any} */ p) => p.slug),
    ['second-article', 'first-article'],
  );
  assert.equal(posts.posts[0].url, `${BASE}/second-article/`);
  assert.equal(posts.posts[0].markdownUrl, undefined);
  assert.ok(
    (await site.read('fixture-1/llms.txt')).includes(`${BASE}/posts.json`),
  );
  const version = JSON.parse(await site.read('fixture-1/version.json'));
  assert.equal(version.template.package, '@rathnasgala2/template');
  assert.ok(version.schemas.version);
  assert.ok(version.builtAt);
  assert.ok(!/^sha/.test(version.sourceCommit));
  const page = await site.read('fixture-1/version/index.html');
  assert.match(page, /<meta name="robots" content="noindex, follow">/);
  assert.ok(page.includes('Site version'));
  assert.ok(page.includes('Source commit'));
  assert.ok(!site.paths.some((p) => p.endsWith('.md')));
});

test('index.md: the author Markdown behind a small front matter, only when the file matches', async (t) => {
  const markdown = [
    '---',
    'title: First article',
    'status: published',
    '---',
    '',
    '# First article',
    '',
    "The **author's** words, as written.",
    '',
  ].join('\n');
  const input = /** @type {any} */ (await buildRichFixture());
  const first = input.content.find(
    (/** @type {any} */ r) => r.frontmatter.slug === 'first-article',
  );
  first.sourcePath = 'content/first-article.md';
  first.sourceDigest = `sha256:${createHash('sha256').update(markdown).digest('hex')}`;
  const second = input.content.find(
    (/** @type {any} */ r) => r.frontmatter.slug === 'second-article',
  );
  second.sourcePath = 'content/second-article.md';
  const site = await render(input, async (source) => {
    await mkdir(path.join(source, 'content'), { recursive: true });
    await writeFile(path.join(source, 'content/first-article.md'), markdown);
    // Changed since the build input digested it: no twin.
    await writeFile(
      path.join(source, 'content/second-article.md'),
      '---\nx: 1\n---\nother\n',
    );
  });
  t.after(site.cleanup);
  const md = await site.read('fixture-1/first-article/index.md');
  assert.ok(
    md.startsWith(
      '---\ntitle: "First article"\ndate: "2025-01-10T09:00:00.000Z"\n',
    ),
  );
  assert.ok(md.includes(`canonical: "${BASE}/first-article/"`));
  assert.ok(md.includes('language: "en-US"'));
  assert.ok(md.includes('tags: ["alpha"]'));
  assert.ok(
    md.endsWith(
      "---\n\n# First article\n\nThe **author's** words, as written.\n",
    ),
  );
  assert.ok(!site.paths.includes('fixture-1/second-article/index.md'));
  const posts = JSON.parse(await site.read('fixture-1/posts.json'));
  const firstPost = posts.posts.find(
    (/** @type {any} */ p) => p.slug === 'first-article',
  );
  assert.equal(firstPost.markdownUrl, `${BASE}/first-article/index.md`);
  assert.equal(
    posts.posts.find((/** @type {any} */ p) => p.slug === 'second-article')
      .markdownUrl,
    undefined,
  );
  assert.equal(markdownBodyOf('no fence'), undefined);
});

test('editions: links get rel nofollow merged with existing rel', async (t) => {
  assert.equal(
    nofollowLinks(
      '<p><a href="https://a.example/">x</a> <a href="/b" rel="noopener">y</a> <a name="z">n</a></p>',
    ),
    '<p><a href="https://a.example/" rel="nofollow">x</a> <a href="/b" rel="noopener nofollow">y</a> <a name="z">n</a></p>',
  );
  const input = /** @type {any} */ (await buildRichFixture());
  const first = input.content.find(
    (/** @type {any} */ r) => r.frontmatter.slug === 'first-article',
  );
  await addEditions(input, [
    editionRecord(first, 'QUICK_READ', {
      body: '<p>See <a href="https://elsewhere.example/" rel="noopener noreferrer">there</a>.</p>',
    }),
  ]);
  const site = await render(input);
  t.after(site.cleanup);
  const edition = await site.read(
    'fixture-1/first-article/quick-read/index.html',
  );
  assert.ok(
    edition.includes(
      '<a href="https://elsewhere.example/" rel="noopener noreferrer nofollow">there</a>',
    ),
  );
  const article = await site.read('fixture-1/first-article/index.html');
  assert.ok(!article.includes('rel="nofollow"'));
});
