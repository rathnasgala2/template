/**
 * Email fragments (`/_gala/email/<content id>.html`): when they exist, what a
 * fragment holds (email-safe markup, absolute addresses, the largest image,
 * `noindex`), that they are in no sitemap, feed, search index or llms file,
 * and a full render of everything the audience features add to a site.
 */

import { strict as assert } from 'node:assert';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import { createContentImage } from '../src/core/internal/components.js';
import { normalizeAuthoredMarkdown } from '../src/core/internal/content-security.js';
import {
  EMAIL_FRAGMENT_DIRECTORY,
  buildEmailFragments,
  emailFragmentRoute,
  emailFragmentsOn,
  renderEmailFragment,
  toEmailSafeHtml,
} from '../src/core/internal/email-fragment.js';
import { buildFeeds } from '../src/core/internal/feeds.js';
import { buildLlmsDocuments } from '../src/core/internal/llms.js';
import { buildGeneratedPages } from '../src/core/internal/page-kinds.js';
import { buildSearchIndex } from '../src/core/internal/search-index.js';
import { buildSitemap } from '../src/core/internal/sitemap.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { buildTestPng, sha256Of } from './helpers/media-fixtures.js';
import { applyCurrentRenderPolicy } from './helpers/schema-fixtures.js';

const PAGE_URL = 'https://blog.example/notes/first-article/';
const GALASCRIBE_FULL = Object.freeze({
  mode: /** @type {const} */ ('galascribe'),
  title: 'The Weekly',
  text: 'One email a week.',
  emailContent: /** @type {const} */ ('full'),
  replyToOwner: true,
});

test('fragments exist only for a Galascribe newsletter that mails full posts', () => {
  const publication = (/** @type {any} */ newsletter) =>
    /** @type {any} */ ({ newsletter });
  assert.equal(emailFragmentsOn(publication(undefined)), false);
  assert.equal(
    emailFragmentsOn(
      publication({ url: 'https://n.example', title: 't', text: 't' }),
    ),
    false,
    'link mode',
  );
  assert.equal(
    emailFragmentsOn(publication({ ...GALASCRIBE_FULL, emailContent: 'card' })),
    false,
    'card',
  );
  assert.equal(emailFragmentsOn(publication(GALASCRIBE_FULL)), true);
  assert.equal(
    emailFragmentRoute('019c0000-0000-7000-8000-000000000001'),
    '/_gala/email/019c0000-0000-7000-8000-000000000001.html',
  );
  assert.equal(EMAIL_FRAGMENT_DIRECTORY, '/_gala/email');
});

const MARKDOWN = [
  '# First article',
  '',
  'Read [the other post](../other-post/), [the part](#part), [the web](https://example.com/a?b=1&c=2) or [mail me](mailto:ana@example.com).',
  '',
  '## Part',
  '',
  '> A quote.',
  '',
  '| a | b |',
  '|---|---|',
  '| 1 | 2 |',
  '',
  '---',
  '',
  '```js',
  'const html = \'<div class="box" id="x"><span>hi</span></div>\';',
  '```',
  '',
  'Inline `code`, and prose that says class="shown" and href="/shown".',
  '',
  '![A chart](chart.png)',
].join('\n');

test('toEmailSafeHtml: only stylesheet hooks and scripts-adjacent attributes go; addresses become absolute; text is never touched', () => {
  // Sanitizer output, plus the highlighter's markup the site renders.
  const source =
    normalizeAuthoredMarkdown(MARKDOWN).html +
    '<pre class="language-js"><code class="language-js"><span class="token keyword">const</span> a</code></pre>';
  const html = toEmailSafeHtml(source, PAGE_URL);

  // Nothing a stylesheet or a script could use.
  assert.ok(!/<span\b|<\/span>/i.test(html), 'no span wrappers');
  assert.ok(
    !/<[a-z][^>]*\s(?:class|id)="/i.test(html),
    'no class or id attribute on any tag',
  );
  assert.ok(
    !/<(?:script|form|iframe|input|button|style|link|object|embed)\b/i.test(
      html,
    ),
  );
  assert.ok(!/<[a-z][^>]*\son[a-z]+=/i.test(html), 'no event attribute');

  // Addresses are absolute against the post's URL.
  assert.ok(html.includes('href="https://blog.example/notes/other-post/"'));
  assert.ok(
    html.includes('href="https://blog.example/notes/first-article/#part"'),
  );
  assert.ok(html.includes('href="https://example.com/a?b=1&amp;c=2"'));
  assert.ok(html.includes('href="mailto:ana@example.com"'));
  assert.ok(
    html.includes('src="https://blog.example/notes/first-article/chart.png"'),
  );

  // Inline styles only where a mail client would draw the element bare.
  assert.match(html, /<pre style="[^"]*font-family:Menlo/);
  assert.match(html, /<pre style="[^"]*"><code style="[^"]*monospace/);
  assert.match(html, /<blockquote style="[^"]*border-left:4px/);
  assert.match(html, /<table style="[^"]*border-collapse:collapse/);
  assert.match(html, /<th style="[^"]*border:1px/);
  assert.match(html, /<td style="[^"]*border:1px/);
  assert.match(html, /<hr style="[^"]*"\s?\/?>/);
  assert.ok(
    !/<(?:p|h[1-6]|ul|ol|li|strong|em)\s+style=/.test(html),
    'no style on plain text elements',
  );

  // The code sample and the prose that merely mention attributes keep every
  // character of their text.
  assert.ok(
    html.includes('&lt;div class="box" id="x"&gt;'),
    'the code sample keeps its markup text',
  );
  const shown = source.match(/says (.*?) and (.*?)\./);
  assert.ok(shown);
  assert.ok(
    html.includes(shown[1]) && html.includes(shown[2]),
    'prose text kept',
  );
  assert.equal(
    html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' '),
    source.replace(/<[^>]*>/g, '').replace(/\s+/g, ' '),
    'the visible text is exactly the source text',
  );
});

test('toEmailSafeHtml leaves a bad address as written and keeps self-closing tags self-closing', () => {
  const html = toEmailSafeHtml(
    '<p>a<br />b <a href="http://[bad" rel="noopener">x</a></p><hr />',
    PAGE_URL,
  );
  assert.ok(html.includes('<br />'));
  assert.ok(html.includes('href="http://[bad"'));
  assert.ok(html.includes('rel="noopener"'));
  assert.match(html, /<hr style="[^"]*" \/>$/);
});

test('the fragment document: noindex head, one wrapper carrying language and direction, escaped title', () => {
  const html = renderEmailFragment({
    title: 'A <b>"quoted"</b> title',
    language: 'ar-EG',
    bodyHtml: '<p>hello</p>',
  });
  assert.equal(
    html,
    '<!doctype html>\n<html lang="ar-EG" dir="rtl"><head><meta charset="utf-8">' +
      '<meta name="robots" content="noindex"><title>A &lt;b&gt;&quot;quoted&quot;&lt;/b&gt; title</title></head>' +
      '<body><div data-gala-email-body lang="ar-EG" dir="rtl"><p>hello</p></div></body></html>\n',
  );
});

test('the email image form is the largest output file, with a style that fits a mail column', () => {
  const files = [
    { path: 'assets/media/d/w480.png', width: 480, height: 240 },
    { path: 'assets/media/d/w960.png', width: 960, height: 480 },
    { path: 'assets/media/d/w1920.png', width: 1920, height: 960 },
  ];
  const image = createContentImage({
    mediaVariants: { d: files },
    publicBasePath: '/notes',
  });
  const reference = { path: 'chart.png', sourceDigest: 'd' };
  const email = image.email(reference, 'A &quot;chart&quot;');
  assert.equal(
    email,
    '<img src="/notes/assets/media/d/w1920.png" alt="A &quot;chart&quot;" width="1920" height="960" style="display:block;max-width:100%;height:auto;border:0">',
  );
  assert.match(
    image.page(reference, ''),
    /src="\/notes\/assets\/media\/d\/w960\.png"/,
  );
  assert.throws(
    () =>
      createContentImage({ mediaVariants: {}, publicBasePath: '/' }).email(
        reference,
        '',
      ),
    /no media pipeline output/,
  );
});

/**
 * @param {Record<string, unknown> | undefined} newsletter
 * @returns {Promise<any>} the rich fixture with that newsletter
 */
async function inputWith(newsletter) {
  const input = /** @type {any} */ (await buildRichFixture());
  input.content = input.content.filter(
    (record) => record.frontmatter.slug !== 'contact',
  );
  if (newsletter) input.publication.newsletter = newsletter;
  return input;
}

test('one fragment per published post: unlisted posts and pages have none, each is in its own language and without its repeated title', async () => {
  const input = await inputWith(GALASCRIBE_FULL);
  const [first, second] = input.content;
  first.body = '<h1>First article</h1><p>See <a href="../next/">next</a>.</p>';
  second.body = '<p>Second.</p>';
  second.frontmatter.language = 'ar';
  /** @type {string[]} */
  const seen = [];
  const fragments = buildEmailFragments(input, {
    emailBody: (body) => {
      seen.push(body);
      return body;
    },
    absoluteUrl: (route) => `https://blog.example/notes${route}/`,
  });
  const published = input.content.filter(
    (record) =>
      record.frontmatter.kind === 'article' &&
      record.frontmatter.status === 'published',
  );
  assert.equal(published.length, 2);
  assert.deepEqual(
    fragments.map((fragment) => fragment.contentId).sort(),
    published.map((record) => record.frontmatter.id).sort(),
  );
  assert.ok(
    !fragments.some((f) => f.contentId === input.content[2].frontmatter.id),
  );
  for (const fragment of fragments) {
    assert.equal(fragment.route, emailFragmentRoute(fragment.contentId));
    assert.match(
      fragment.content,
      /^<!doctype html>\n<html lang="[^"]+" dir="(?:ltr|rtl)"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>/,
    );
  }
  const forFirst = fragments.find((f) => f.contentId === first.frontmatter.id);
  assert.ok(forFirst);
  assert.ok(!forFirst.content.includes('<h1'), 'the title is not repeated');
  assert.ok(
    seen.includes('<p>See <a href="../next/">next</a>.</p>'),
    'emailBody saw the body without it',
  );
  assert.ok(
    forFirst.content.includes(
      'href="https://blog.example/notes/first-article/../next/"',
    ) === false,
  );
  assert.ok(
    forFirst.content.includes('href="https://blog.example/notes/next/"'),
  );
  const forSecond = fragments.find(
    (f) => f.contentId === second.frontmatter.id,
  );
  assert.match(forSecond?.content ?? '', /<html lang="ar" dir="rtl">/);
});

test('fragments are no pages: sitemap, feeds, search index and llms files never name them', async () => {
  const input = await inputWith(GALASCRIBE_FULL);
  const pages = buildGeneratedPages(input, { pageBody: (body) => body });
  const sitemap = buildSitemap({
    generatedPages: pages,
    basePath: '/fixture-1',
    baseUrl: input.baseUrl,
    routeProfile: 'directory-index',
  });
  const feeds = buildFeeds(input, {
    feedBody: (body) => body,
    routeProfile: 'directory-index',
  });
  const llms = buildLlmsDocuments(input, {
    rss: feeds.rssSelfUrl,
    atom: feeds.atomSelfUrl,
    sitemap: `${input.baseUrl}sitemap.xml`,
    searchIndex: `${input.baseUrl}search-index.json`,
    full: `${input.baseUrl}llms-full.txt`,
    routeProfile: 'directory-index',
  });
  for (const [label, text] of [
    ['sitemap', sitemap],
    ['atom', feeds.atomXml],
    ['rss', feeds.rssXml],
    ['search index', buildSearchIndex(input, 'directory-index')],
    ['llms.txt', llms.llmsTxt],
    ['llms-full.txt', llms.llmsFullTxt],
  ]) {
    assert.ok(!text.includes('_gala'), `${label} does not name a fragment`);
  }
  for (const page of pages) {
    assert.notEqual(page.kind, 'email');
    assert.ok(!page.route.startsWith('/_gala'), page.route);
  }
});

// -------------------------------------------------------------- full render --

/**
 * Render the rich fixture after `prepare`, with a staged PNG in the first
 * post's body.
 *
 * @param {(input: any) => void} prepare
 * @returns {Promise<{manifest: any, outputDirectory: string, read: (file: string) => Promise<string>, cleanup: () => Promise<void>, input: any}>}
 */
async function render(prepare) {
  const input = await inputWith(undefined);
  const dirs = await createRenderDirectories();
  const png = buildTestPng(1000, 500);
  await mkdir(path.join(dirs.sourceDirectory, 'assets'), { recursive: true });
  await writeFile(path.join(dirs.sourceDirectory, 'assets/chart.png'), png);
  const [first] = input.content;
  first.body = normalizeAuthoredMarkdown(
    '# First article\n\nSee [home](/) and [next](../second-article/).\n\n![A chart](assets/chart.png)\n\n```js\nconst a = 1;\n```\n',
  ).html;
  first.media = [
    {
      path: 'assets/chart.png',
      sourceDigest: sha256Of(png),
      mediaType: 'image/png',
      byteLength: png.byteLength,
    },
  ];
  prepare(input);
  await applyCurrentRenderPolicy(input);
  const { manifest } = await renderPublication(input, {
    outputDirectory: dirs.outputDirectory,
    workDirectory: dirs.workDirectory,
    sourceDirectory: dirs.sourceDirectory,
    provenance: testProvenance(),
  });
  return {
    manifest,
    outputDirectory: dirs.outputDirectory,
    read: (file) => readFile(path.join(dirs.outputDirectory, file), 'utf8'),
    cleanup: dirs.cleanup,
    input,
  };
}

const exists = (/** @type {string} */ directory) =>
  readdir(directory).then(
    (names) => names.sort(),
    () => undefined,
  );

test('a site with none of the audience features renders no script, no fragment and no new route', async (t) => {
  const site = await render(() => {});
  t.after(site.cleanup);
  assert.equal(
    await exists(path.join(site.outputDirectory, 'fixture-1/_gala')),
    undefined,
  );
  const paths = [
    ...site.manifest.routes.map((/** @type {any} */ route) => route.path),
    ...site.manifest.assets.map((/** @type {any} */ asset) => asset.path),
  ];
  assert.ok(!paths.some((p) => p.includes('_gala') || p.includes('audience')));
  assert.ok(!paths.includes('fixture-1/contact/index.html'));
  const article = await site.read('fixture-1/first-article/index.html');
  assert.ok(!article.includes('gala-audience'));
  assert.ok(!article.includes('data-gala-audience'));
});

const FEATURES = (/** @type {any} */ input, /** @type {string} */ content) => {
  input.publication.newsletter = { ...GALASCRIBE_FULL, emailContent: content };
  input.publication.contactForm = {
    enabled: true,
    fields: { website: true, phone: false },
  };
  input.modules.interactions = {
    config: {
      schemaId: 'urn:gala:schema:interactions-config:2.0.0',
      schemaVersion: '2.0.0',
      reactions: { enabled: false, definitions: [] },
      comments: { enabled: false, allowReplies: false, maxDepth: 1 },
      publicCounts: { reactions: false, comments: false },
      follows: { enabled: true },
    },
    apiOrigin: 'https://api.galascribe.com',
    appOrigin: 'https://app.galascribe.com',
  };
};

test('full render with every audience feature on: fragments, script, pages and manifest rows', async (t) => {
  const site = await render((input) => FEATURES(input, 'full'));
  t.after(site.cleanup);
  const [first, second] = site.input.content;
  const directory = 'fixture-1/_gala/email';
  assert.deepEqual(
    await exists(path.join(site.outputDirectory, directory)),
    [`${first.frontmatter.id}.html`, `${second.frontmatter.id}.html`].sort(),
  );

  // The manifest lists them like other outputs.
  const row = site.manifest.routes.find(
    (/** @type {any} */ route) =>
      route.path === `${directory}/${first.frontmatter.id}.html`,
  );
  assert.deepEqual(
    { ...row, byteLength: undefined, sha256: undefined },
    {
      path: `${directory}/${first.frontmatter.id}.html`,
      mediaType: 'text/html; charset=utf-8',
      byteLength: undefined,
      sha256: undefined,
      routeClass: 'asset',
      interactionBearing: false,
    },
  );

  // What a fragment holds.
  const html = await site.read(`${directory}/${first.frontmatter.id}.html`);
  assert.match(
    html,
    /^<!doctype html>\n<html lang="[^"]+" dir="ltr"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>First article<\/title><\/head><body><div data-gala-email-body /,
  );
  assert.ok(!html.includes('<h1'), 'the repeated title is gone');
  assert.ok(
    html.includes('href="https://fixture-1.example.com/"'),
    'a root-relative link resolves exactly as it does on the site',
  );
  assert.ok(
    html.includes(
      'href="https://fixture-1.example.com/fixture-1/second-article/"',
    ),
  );
  assert.match(
    html,
    /<pre style="[^"]*"><code style="[^"]*">const a = 1;\n?<\/code><\/pre>/,
  );
  assert.ok(!/<(?:script|form|iframe|link|style)\b/i.test(html));
  const image = html.match(
    /<img src="(https:\/\/[^"]+)" alt="A chart" width="(\d+)" height="(\d+)" style="/,
  );
  assert.ok(image, 'the image is absolute with its size and a style');
  assert.ok(
    image[1].startsWith(
      'https://fixture-1.example.com/fixture-1/assets/media/',
    ),
  );
  // The staged 1000 x 500 source: its largest output file is the original.
  assert.deepEqual([image[2], image[3]], ['1000', '500']);
  // The file it names is part of the build.
  await readFile(
    path.join(
      site.outputDirectory,
      image[1].replace('https://fixture-1.example.com/', ''),
    ),
  );

  // Excluded everywhere a crawler or a reader looks.
  for (const file of [
    'fixture-1/sitemap.xml',
    'fixture-1/feed/atom.xml',
    'fixture-1/feed/rss.xml',
    'fixture-1/search-index.json',
    'fixture-1/llms.txt',
    'fixture-1/llms-full.txt',
    'fixture-1/index.html',
    'fixture-1/first-article/index.html',
  ]) {
    assert.ok(!(await site.read(file)).includes('_gala'), file);
  }
  const sitemap = await site.read('fixture-1/sitemap.xml');
  assert.ok(
    sitemap.includes(
      '<loc>https://fixture-1.example.com/fixture-1/contact/</loc>',
    ),
  );

  // The script, its sentences and its asset.
  const article = await site.read('fixture-1/first-article/index.html');
  assert.match(
    article,
    /<script type="application\/json" data-gala-audience-messages>\{[^<]*\}<\/script><script src="\/fixture-1\/assets\/gala-audience-v1\.js" defer data-gala-audience-script data-api-origin="https:\/\/api\.galascribe\.com" data-app-origin="https:\/\/app\.galascribe\.com" data-publication-id="[^"]+" data-canonical-url="https:\/\/fixture-1\.example\.com\/fixture-1\/first-article\/"><\/script>/,
  );
  assert.ok(
    site.manifest.assets.some(
      (/** @type {any} */ asset) =>
        asset.path === 'fixture-1/assets/gala-audience-v1.js',
    ),
  );
  await readFile(
    path.join(site.outputDirectory, 'fixture-1/assets/gala-audience-v1.js'),
  );
  const contact = await site.read('fixture-1/contact/index.html');
  assert.ok(contact.includes('data-gala-contact-form'));
  assert.ok(contact.includes('data-gala-audience-script'));
  assert.ok(
    contact.includes(
      '<link rel="canonical" href="https://fixture-1.example.com/fixture-1/contact/">',
    ),
  );
  assert.ok(
    contact.includes('<a href="/fixture-1/contact/">Contact</a>'),
    'footer link',
  );
  const home = await site.read('fixture-1/index.html');
  assert.ok(home.includes('data-gala-newsletter-form'));
  const author = site.input.authors[0];
  assert.ok(
    (await site.read('fixture-1/first-article/index.html')).includes(
      `data-author-id="${author.id}"`,
    ),
  );
});

test('full render, card mode: the contact page and script are there, no fragment is', async (t) => {
  const site = await render((input) => FEATURES(input, 'card'));
  t.after(site.cleanup);
  assert.equal(
    await exists(path.join(site.outputDirectory, 'fixture-1/_gala')),
    undefined,
  );
  assert.ok(
    site.manifest.routes.some(
      (/** @type {any} */ route) =>
        route.path === 'fixture-1/contact/index.html',
    ),
  );
});

test('full render: a document on /contact fails the build closed while the form is on', async () => {
  await assert.rejects(
    render((input) => {
      FEATURES(input, 'card');
      input.content[1].frontmatter.route = '/contact';
    }),
    (/** @type {any} */ error) =>
      error.diagnostics?.some(
        (/** @type {any} */ d) => d.code === 'POLICY_ROUTE_CONFLICT',
      ),
  );
});
