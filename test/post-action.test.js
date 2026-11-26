/**
 * The end-of-post action block (schemas 3.56.0): the resolution and
 * availability rules, the markup of each kind (hostile text escaped, no new
 * class), and, once the installed schemas accept the members, the built page:
 * where the block sits, the newsletter panel moving rather than repeating, the
 * pages that never carry it, the `POST_ACTION_UNAVAILABLE` warning, the email
 * fragment's closing link, and the outputs that must not mention it.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  POST_ACTION_UNAVAILABLE_FINDING,
  postActionAvailable,
  postActionFindings,
  renderEmailAction,
  renderNewsletterAction,
  renderPostAction,
  resolvePostAction,
} from '../src/core/internal/post-action.js';
import { buildEmailFragments } from '../src/core/internal/email-fragment.js';
import { buildArticleMarkdown } from '../src/core/internal/static-outputs.js';
import { escapeHtml } from '../src/core/internal/skeleton.js';
import { selectPublishedArticles } from '../src/core/internal/page-kinds.js';
import {
  ACTIONS,
  FIRST_ARTICLE,
  HEADING,
  LABEL,
  SKIP_REASON,
  TEXT,
  actionBlocks,
  postActionInput,
  schemaAcceptsPostAction,
} from './helpers/post-action-fixtures.js';
import { renderSite } from './helpers/render-fixtures.js';

/**
 * @param {import('node:test').TestContext} t the test
 * @param {Parameters<typeof postActionInput>[0]} options the input's settings
 * @returns {Promise<Awaited<ReturnType<typeof renderSite>> & {input: any}>}
 *   the built site, cleaned up after the test
 */
async function build(t, options) {
  const input = await postActionInput(options);
  const site = await renderSite(input);
  t.after(site.cleanup);
  return { ...site, input };
}

/**
 * @param {import('node:test').TestContext} t the test
 * @returns {Promise<boolean>} true (after skipping the test) when the
 *   installed schemas do not accept the new members yet
 */
async function skipped(t) {
  if (await schemaAcceptsPostAction()) return false;
  t.skip(SKIP_REASON);
  return true;
}

test('resolution: the post decides, none hides, absent falls back to the site', () => {
  const site = ACTIONS.follow;
  const own = ACTIONS.link;
  assert.equal(resolvePostAction({ siteAction: site, postAction: own }), own);
  assert.equal(
    resolvePostAction({ siteAction: site, postAction: { kind: 'none' } }),
    undefined,
  );
  assert.equal(
    resolvePostAction({ siteAction: site, postAction: undefined }),
    site,
  );
  assert.equal(
    resolvePostAction({ siteAction: undefined, postAction: undefined }),
    undefined,
  );
  assert.equal(
    resolvePostAction({ siteAction: undefined, postAction: { kind: 'none' } }),
    undefined,
  );
});

test('availability: follow needs follows and an author, newsletter needs a newsletter, link always shows', () => {
  const on = { followsOn: true, hasAuthor: true, hasNewsletter: true };
  const show = (/** @type {any} */ action, /** @type {any} */ over = {}) =>
    postActionAvailable({ action, ...on, ...over });
  assert.equal(show(ACTIONS.follow), true);
  assert.equal(show(ACTIONS.follow, { followsOn: false }), false);
  assert.equal(show(ACTIONS.follow, { hasAuthor: false }), false);
  assert.equal(show(ACTIONS.newsletter), true);
  assert.equal(show(ACTIONS.newsletter, { hasNewsletter: false }), false);
  assert.equal(
    show(ACTIONS.link, {
      followsOn: false,
      hasAuthor: false,
      hasNewsletter: false,
    }),
    true,
  );
});

test('markup: a follow block names the author, takes the control as given and adds no class', () => {
  const html = renderPostAction({
    action: { kind: 'follow', text: TEXT },
    followHeading: 'Follow <Ana>',
    followControl: '<span data-control></span>',
    sitePath: (p) => p,
  });
  assert.equal(
    html,
    `<aside aria-labelledby="g-post-action-title" data-gala-action="follow">` +
      `<h2 id="g-post-action-title">Follow &lt;Ana&gt;</h2>` +
      `<p>${escapeHtml(TEXT)}</p><span data-control></span></aside>`,
  );
  const own = renderPostAction({
    action: { kind: 'follow', heading: HEADING },
    followHeading: 'Follow Ana',
    followControl: '',
    sitePath: (p) => p,
  });
  assert.ok(own.includes(`>${escapeHtml(HEADING)}</h2>`));
  assert.ok(!own.includes('<p>'));
  assert.ok(!/class="[^"]*post-action/.test(html + own));
});

test('markup: a link block escapes everything, marks an external link noopener and leaves a site path to the site', () => {
  const external = renderPostAction({
    action: {
      kind: 'link',
      heading: HEADING,
      text: TEXT,
      label: LABEL,
      url: 'https://example.com/book?a=1&b=2',
    },
    followHeading: '',
    followControl: '',
    sitePath: () => assert.fail('an external URL is not a site path'),
  });
  assert.ok(external.includes('href="https://example.com/book?a=1&amp;b=2"'));
  assert.ok(external.includes(' rel="noopener"'));
  assert.ok(external.includes(`${escapeHtml(LABEL)}<svg`));
  assert.ok(external.includes('aria-labelledby="g-post-action-title"'));
  assert.ok(!external.includes('<b>') && !external.includes('<here>'));
  const path = renderPostAction({
    action: { kind: 'link', label: 'Guide', url: '/guide/' },
    followHeading: '',
    followControl: '',
    sitePath: (p) => `/blog${p}`,
  });
  assert.ok(path.includes('href="/blog/guide/"'));
  assert.ok(!path.includes('rel='));
  // With no heading the block is named by its link.
  assert.ok(path.includes('aria-label="Guide"'));
  assert.ok(!path.includes('<h2'));
});

test('markup: the newsletter kind wraps the panel and the email carries only a link', () => {
  const wrapped = renderNewsletterAction('<section>panel</section>');
  assert.equal(
    wrapped,
    '<aside aria-labelledby="newsletter-title" data-gala-action="newsletter"><section>panel</section></aside>',
  );
  const absolute = (/** @type {string} */ route) =>
    `https://blog.example/notes${route}`;
  assert.equal(renderEmailAction(ACTIONS.follow, absolute), '');
  assert.equal(renderEmailAction(ACTIONS.newsletter, absolute), '');
  assert.equal(renderEmailAction(undefined, absolute), '');
  const external = renderEmailAction(ACTIONS.link, absolute);
  assert.ok(external.includes('href="https://example.com/book?a=1&amp;b=2"'));
  assert.ok(external.includes(`>${escapeHtml(LABEL)}</a>`));
  assert.ok(!external.includes('class='));
  assert.ok(external.includes('style="'));
  const path = renderEmailAction(ACTIONS.path, absolute);
  assert.ok(path.includes('href="https://blog.example/notes/guide/"'));
});

test('findings: one warning per setting that cannot show, none when it can', async () => {
  const input = await postActionInput({
    action: ACTIONS.follow,
    follows: false,
    own: { 'second-article': ACTIONS.newsletter },
    newsletter: false,
  });
  const articles = selectPublishedArticles(input.content);
  const found = postActionFindings(input, articles);
  const second = input.content.findIndex(
    (/** @type {any} */ r) => r.frontmatter.slug === 'second-article',
  );
  assert.deepEqual(
    found.map((f) => f.pointer).sort(),
    ['/publication/postAction', `/content/${second}/frontmatter/action`].sort(),
  );
  for (const finding of found) {
    assert.equal(finding.code, 'POST_ACTION_UNAVAILABLE');
    assert.equal(finding.severity, 'warning');
    assert.equal(finding.messageKey, 'post-action-unavailable');
  }
  assert.equal(
    POST_ACTION_UNAVAILABLE_FINDING.pointer,
    '/publication/postAction',
  );
  const fine = await postActionInput({ action: ACTIONS.follow });
  assert.deepEqual(
    postActionFindings(fine, selectPublishedArticles(fine.content)),
    [],
  );
  const noAction = await postActionInput({});
  assert.deepEqual(
    postActionFindings(noAction, selectPublishedArticles(noAction.content)),
    [],
  );
  // A post that hides the block cannot be unavailable.
  const hidden = await postActionInput({
    action: ACTIONS.follow,
    follows: false,
    own: {
      'first-article': { kind: 'none' },
      'second-article': { kind: 'none' },
    },
  });
  assert.deepEqual(
    postActionFindings(hidden, selectPublishedArticles(hidden.content)),
    [],
  );
});

test('findings: a post with no author cannot follow its author', async () => {
  const input = await postActionInput({ action: ACTIONS.follow });
  const first = input.content.find(
    (/** @type {any} */ r) => r.frontmatter.slug === 'first-article',
  );
  first.frontmatter.authorIds = [];
  const found = postActionFindings(
    input,
    selectPublishedArticles(input.content),
  );
  assert.equal(found.length, 1);
  assert.ok(found[0].pointer.endsWith('/frontmatter/authorIds'));
});

test('no site setting and no post setting: the page has no block and is byte for byte the page without the feature', async (t) => {
  if (await skipped(t)) return;
  const plain = await build(t, {});
  assert.equal(actionBlocks(await plain.htmlOf(FIRST_ARTICLE)), 0);
  assert.deepEqual(plain.manifest.findings, []);
  assert.equal(plain.manifest.policyResult, 'pass');
});

test('follow: after the body and before the tags, for the first author, on articles only', async (t) => {
  if (await skipped(t)) return;
  const site = await build(t, { action: { ...ACTIONS.follow, text: TEXT } });
  const html = await site.htmlOf(FIRST_ARTICLE);
  assert.equal(actionBlocks(html), 1);
  const at = html.indexOf('data-gala-action="follow"');
  assert.ok(html.lastIndexOf('<aside', at) > html.indexOf('class="g-prose"'));
  assert.ok(at < html.indexOf('class="g-tags"'), 'before the tags');
  assert.ok(at < html.indexOf('g-article-foot'), 'before the closing blocks');
  assert.match(html, /<h2 id="g-post-action-title">Follow fixture-1<\/h2>/);
  assert.ok(html.includes(`<p>${escapeHtml(TEXT)}</p>`));
  const author = site.input.authors[0];
  const block = html.slice(at, html.indexOf('</aside>', at));
  assert.ok(block.includes(`data-author-id="${author.id}"`));
  assert.ok(block.includes('data-follow-count-public') === false);
  // Never on the pages that are not articles.
  for (const route of site.manifest.routes) {
    if (!route.path.endsWith('.html') || route.path === FIRST_ARTICLE) continue;
    const other = await site.htmlOf(route.path);
    if (route.path.includes('_gala/')) continue;
    if (/-article\/index\.html$/.test(route.path)) {
      assert.equal(actionBlocks(other), 1, route.path);
    } else {
      assert.equal(actionBlocks(other), 0, route.path);
    }
  }
});

test('link: an external URL and a site path, hostile text escaped', async (t) => {
  if (await skipped(t)) return;
  const external = await build(t, {
    action: { ...ACTIONS.link, heading: HEADING, text: TEXT },
  });
  const html = await external.htmlOf(FIRST_ARTICLE);
  assert.equal(actionBlocks(html), 1);
  assert.ok(
    html.includes('href="https://example.com/book?a=1&amp;b=2" rel="noopener"'),
  );
  assert.ok(html.includes(escapeHtml(LABEL)));
  assert.ok(html.includes(escapeHtml(HEADING)));
  assert.ok(!html.includes('<here>'));
  assert.ok(!html.includes('Read the <b>'));
  const path = await build(t, { action: ACTIONS.path });
  const local = await path.htmlOf(FIRST_ARTICLE);
  assert.match(
    local,
    /<a class="g-btn" href="\/fixture-1\/guide\/">Read the guide/,
  );
});

test('newsletter: the panel moves into the block and is not repeated; home keeps its own', async (t) => {
  if (await skipped(t)) return;
  const site = await build(t, {
    action: { kind: 'newsletter', heading: HEADING, text: TEXT },
  });
  const html = await site.htmlOf(FIRST_ARTICLE);
  assert.equal(actionBlocks(html), 1);
  assert.equal(html.split('id="newsletter-title"').length - 1, 1);
  assert.equal(html.split('data-gala-audience="newsletter"').length - 1, 1);
  const at = html.indexOf('data-gala-action="newsletter"');
  assert.ok(at < html.indexOf('class="g-tags"'), 'where the block sits');
  assert.ok(at < html.indexOf('g-article-foot'));
  assert.ok(
    html.includes(`<h2 id="newsletter-title">${escapeHtml(HEADING)}</h2>`),
  );
  assert.ok(html.includes(`<p>${escapeHtml(TEXT)}</p>`));
  assert.ok(
    !html.includes('Letters from the desk'),
    'the override replaced the title',
  );
  const without = await build(t, { action: ACTIONS.newsletter });
  const plain = await without.htmlOf(FIRST_ARTICLE);
  assert.ok(plain.includes('Letters from the desk'));
  assert.equal(plain.split('id="newsletter-title"').length - 1, 1);
  // Home: the panel stays where it was and no block appears.
  const home = await without.htmlOf('fixture-1/index.html');
  assert.equal(actionBlocks(home), 0);
  assert.equal(home.split('id="newsletter-title"').length - 1, 1);
  // A post that picks another kind keeps the panel at the end of its page.
  const other = await build(t, {
    action: ACTIONS.newsletter,
    own: { 'first-article': ACTIONS.link },
  });
  const moved = await other.htmlOf(FIRST_ARTICLE);
  assert.equal(moved.split('id="newsletter-title"').length - 1, 1);
  assert.ok(
    moved.indexOf('data-gala-action="link"') <
      moved.indexOf('id="newsletter-title"'),
  );
  assert.ok(!moved.includes('data-gala-action="newsletter"'));
});

test('a post overrides the site, and none hides the block', async (t) => {
  if (await skipped(t)) return;
  const site = await build(t, {
    action: ACTIONS.follow,
    own: {
      'first-article': { kind: 'none' },
      'second-article': ACTIONS.link,
    },
  });
  assert.equal(actionBlocks(await site.htmlOf(FIRST_ARTICLE)), 0);
  const second = await site.htmlOf('fixture-1/second-article/index.html');
  assert.equal(actionBlocks(second), 1);
  assert.ok(second.includes('data-gala-action="link"'));
  assert.deepEqual(site.manifest.findings, []);
  assert.equal(site.manifest.policyResult, 'pass');
});

test('a kind that cannot show renders nothing and warns once, without failing the build', async (t) => {
  if (await skipped(t)) return;
  for (const [label, options] of /** @type {const} */ ([
    ['follow with follows off', { action: ACTIONS.follow, follows: false }],
    ['newsletter with none', { action: ACTIONS.newsletter, newsletter: false }],
  ])) {
    const site = await build(t, options);
    assert.equal(actionBlocks(await site.htmlOf(FIRST_ARTICLE)), 0, label);
    assert.deepEqual(
      site.manifest.findings,
      [
        {
          code: 'POST_ACTION_UNAVAILABLE',
          severity: 'warning',
          pointer: '/publication/postAction',
          messageKey: 'post-action-unavailable',
        },
      ],
      label,
    );
    assert.equal(site.manifest.policyResult, 'pass-with-warnings', label);
    assert.equal(site.manifest.validation.findingCount, 1, label);
  }
});

test('the newsletter email ends with a link-kind action and carries no other kind', async (t) => {
  if (await skipped(t)) return;
  const fragment = async (/** @type {any} */ action) => {
    const input = await postActionInput({
      action,
      newsletter: true,
    });
    input.publication.newsletter = {
      ...input.publication.newsletter,
      emailContent: 'full',
    };
    const site = await renderSite(input);
    t.after(site.cleanup);
    const first = input.content.find(
      (/** @type {any} */ r) => r.frontmatter.slug === 'first-article',
    );
    return (
      await site.read(`fixture-1/_gala/email/${first.frontmatter.id}.html`)
    ).toString('utf8');
  };
  const link = await fragment(ACTIONS.link);
  assert.ok(
    link.includes(`>${escapeHtml(LABEL)}</a></p></div>`),
    'last in the body',
  );
  assert.ok(link.includes('href="https://example.com/book?a=1&amp;b=2"'));
  assert.ok(!link.includes('data-gala-action') && !link.includes('class='));
  const local = await fragment(ACTIONS.path);
  assert.ok(local.includes('Read the guide</a></p></div>'));
  assert.match(local, /href="https:\/\/[^"]+\/fixture-1\/guide\/"/);
  for (const kind of ['follow', 'newsletter']) {
    const mail = await fragment(ACTIONS[kind]);
    assert.ok(!mail.includes('data-gala-action'), kind);
    assert.ok(!mail.includes('Follow'), kind);
    assert.ok(!mail.includes('<aside'), kind);
  }
});

test('the action is site chrome: no feed, llms file, search index, post list or Markdown mentions it', async (t) => {
  if (await skipped(t)) return;
  const site = await build(t, {
    action: { ...ACTIONS.link, heading: HEADING, text: TEXT },
    own: { 'second-article': { ...ACTIONS.link, label: 'UNIQUE-OWN-LABEL' } },
  });
  const outputs = [
    'fixture-1/feed/atom.xml',
    'fixture-1/feed/rss.xml',
    'fixture-1/llms.txt',
    'fixture-1/llms-full.txt',
    'fixture-1/posts.json',
    'fixture-1/search-index.json',
    'fixture-1/sitemap.xml',
  ];
  for (const file of outputs) {
    const text = (await site.read(file)).toString('utf8');
    assert.ok(text.length > 0, file);
    assert.ok(!text.includes('data-gala-action'), file);
    assert.ok(!text.includes('example.com/book'), file);
    assert.ok(!text.includes('UNIQUE-OWN-LABEL'), file);
    assert.ok(!text.includes(escapeHtml(LABEL)), file);
    assert.ok(!text.includes(HEADING), file);
  }
  // Per-article Markdown is the author's body behind a small header.
  const record = site.input.content[0];
  record.frontmatter.action = ACTIONS.link;
  const markdown = buildArticleMarkdown(
    record,
    'https://blog.example/first-article/',
    'The body.\n',
  );
  assert.ok(!markdown.includes('example.com/book'));
  assert.ok(!markdown.includes('action'));
  // Every email fragment of a site with full-post mail: only the link kind.
  const input = site.input;
  input.publication.newsletter = {
    ...input.publication.newsletter,
    emailContent: 'full',
  };
  const fragments = buildEmailFragments(input, {
    emailBody: (body) => body,
    absoluteUrl: (route) => `https://blog.example${route}`,
  });
  assert.ok(fragments.length >= 2);
  for (const fragment of fragments) {
    assert.ok(!fragment.content.includes('data-gala-action'));
  }
});

test('the follower count is public only when the site opts in', async (t) => {
  if (await skipped(t)) return;
  const on = await build(t, { action: ACTIONS.follow, publicCount: true });
  const html = await on.htmlOf(FIRST_ARTICLE);
  // The byline control and the author card control and the block's own.
  const controls = html.split('data-gala-audience="follow"').length - 1;
  assert.ok(controls >= 2);
  assert.equal(html.split('data-follow-count-public').length - 1, controls);
  assert.ok(!html.includes('Only your site&#39;s team sees this'));
  for (const publicCount of [false, undefined]) {
    const off = await build(t, { action: ACTIONS.follow, publicCount });
    const page = await off.htmlOf(FIRST_ARTICLE);
    assert.equal(page.includes('data-follow-count-public'), false);
    assert.ok(page.includes('Only your site&#39;s team sees this'));
  }
});
