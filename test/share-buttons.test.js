/**
 * Article share group (`publication.sharing.targets`): default and explicit
 * target lists, ordering, the no-JavaScript link markup and its intent URLs,
 * the empty list, the native target, localized names, and the shipped site
 * script's reveal logic (executed in JSDOM, never mirrored).
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { JSDOM } from 'jsdom';

import { APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE } from '../src/core/internal/appearance/bootstrap-script.js';
import { ICONS, icon } from '../src/core/internal/icons.js';
import { getMessages } from '../src/core/internal/messages.js';
import { buildGeneratedPages } from '../src/core/internal/page-kinds.js';
import {
  DEFAULT_SHARE_TARGETS,
  SHARE_TARGETS,
  renderShareGroup,
  resolveShareTargets,
} from '../src/core/internal/share.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import { renderSite } from './helpers/render-fixtures.js';

const GROUP = /<div class="g-share"[^>]*>[\s\S]*?<\/div>/;
const TITLE = 'First article';
const URL_ = 'https://fixture-1.example.com/fixture-1/first-article/';
const ENCODED_URL = encodeURIComponent(URL_);

/**
 * The share group the first article of the rich fixture renders with.
 *
 * @param {Record<string, unknown> | undefined} sharing `publication.sharing`
 * @param {(buildInput: any) => void} [adjust] further fixture changes
 * @returns {Promise<string>} the `<div class="g-share">` element
 */
async function articleShare(sharing, adjust) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  if (sharing !== undefined) buildInput.publication.sharing = sharing;
  adjust?.(buildInput);
  const pages = buildGeneratedPages(buildInput, { pageBody: (body) => body });
  const article = pages.find(
    (page) => page.kind === 'article' && page.title === TITLE,
  );
  assert.ok(article, 'the fixture article renders');
  const match = article.bodyHtml.match(GROUP);
  assert.ok(match, 'the article renders a share group');
  return match[0];
}

/** The group every site rendered before `sharing` existed, byte for byte. */
const LEGACY_GROUP =
  `<div class="g-share" role="group" aria-label="Share" hidden>` +
  `<button class="g-icon-btn" type="button" data-action="copy-link" aria-label="Copy link to this article" title="Copy link to this article">${icon('link')}</button>` +
  `<button class="g-icon-btn" type="button" data-action="bookmark" aria-pressed="false" aria-label="Save for later" title="Save for later">${icon('bookmark')}</button>` +
  `</div>`;

/**
 * @param {string} html a group
 * @returns {string[]} its `data-share` / `data-action` keys in document order
 */
function order(html) {
  return [...html.matchAll(/ data-(?:share|action)="([a-z-]+)"/g)].map(
    (match) => match[1],
  );
}

test('no sharing: the group is byte-identical to the one before the setting existed', async () => {
  assert.equal(await articleShare(undefined), LEGACY_GROUP);
  assert.deepEqual([...DEFAULT_SHARE_TARGETS], ['copy-link']);
});

test('sharing.targets of ["copy-link"] is the same group as no sharing', async () => {
  assert.equal(await articleShare({ targets: ['copy-link'] }), LEGACY_GROUP);
});

test('four targets render in the author order, Bookmark last, as links that need no JavaScript', async () => {
  const html = await articleShare({
    targets: ['x', 'bluesky', 'copy-link', 'email'],
  });
  assert.deepEqual(order(html), [
    'x',
    'bluesky',
    'copy-link',
    'email',
    'bookmark',
  ]);
  // Links are visible before any script; the script-only buttons wait.
  assert.match(html, /^<div class="g-share" role="group" aria-label="Share">/);
  assert.match(
    html,
    /<button [^>]*data-action="copy-link"[^>]* hidden>/,
    'copy link is hidden until the script runs',
  );
  assert.match(
    html,
    /<button [^>]*data-action="bookmark"[^>]* hidden>/,
    'bookmark is hidden until the script runs',
  );
  const links = [...html.matchAll(/<a [^>]*>/g)].map((match) => match[0]);
  assert.equal(links.length, 3);
  for (const link of links) {
    assert.match(link, /^<a class="g-icon-btn" href="[^"]+"/);
    // A `mailto:` link opens no tab (a new tab for it is left blank once the
    // mail client takes over); every network link does.
    if (link.includes('data-share="email"')) {
      assert.ok(!/ target=/.test(link), 'email: no target');
      assert.ok(!/ rel=/.test(link), 'email: no rel');
    } else {
      assert.match(link, / target="_blank" rel="noopener noreferrer"/);
    }
    assert.match(link, / aria-label="[^"]+" title="[^"]+"/);
  }
  assert.match(html, /aria-label="Share on X"/);
  assert.match(html, /aria-label="Share on Bluesky"/);
  assert.match(html, /aria-label="Share by email"/);
  assert.ok(!/<script/i.test(html));
  assert.ok(
    !/<a [^>]*data-action/.test(html),
    'no link depends on a script handler',
  );
});

test('an empty target list leaves only Bookmark, waiting for the script', async () => {
  const html = await articleShare({ targets: [] });
  assert.deepEqual(order(html), ['bookmark']);
  assert.match(
    html,
    /^<div class="g-share" role="group" aria-label="Share" hidden>/,
  );
  assert.ok(!/<a /.test(html));
  assert.ok(!html.includes('copy-link'));
});

test('every network is an anchor on its documented intent URL with the title and canonical URL encoded', () => {
  const messages = getMessages('en');
  const title = 'Fish & chips: "100%" <great>';
  const url = 'https://example.test/a b/?x=1&y=2#top';
  const text = `${title} ${url}`;
  const t = encodeURIComponent(title);
  const u = encodeURIComponent(url);
  const x = encodeURIComponent(text);
  const expected = {
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    bluesky: `https://bsky.app/intent/compose?text=${x}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    'hacker-news': `https://news.ycombinator.com/submitlink?u=${u}&t=${t}`,
    whatsapp: `https://wa.me/?text=${x}`,
    telegram: `https://t.me/share/url?url=${u}&text=${t}`,
    reddit: `https://www.reddit.com/submit?url=${u}&title=${t}`,
    email: `mailto:?subject=${t}&body=${x}`,
  };
  const html = renderShareGroup({
    sharing: { targets: Object.keys(expected) },
    title,
    url,
    messages,
  });
  for (const [target, href] of Object.entries(expected)) {
    const link = html.match(
      new RegExp(
        `<a class="g-icon-btn" href="([^"]*)"[^>]* data-share="${target}"`,
      ),
    );
    assert.ok(link, `${target} renders a link`);
    assert.equal(
      link[1].replaceAll('&amp;', '&'),
      href,
      `${target} intent URL`,
    );
    // The raw title never reaches the markup unescaped.
    assert.ok(!link[1].includes('<great>'));
  }
  assert.ok(!html.includes('<great>'));
});

test('accessible names: "Share on <network>", per language', () => {
  const targets = [
    'x',
    'bluesky',
    'linkedin',
    'facebook',
    'hacker-news',
    'whatsapp',
    'telegram',
    'reddit',
  ];
  const names = [
    'X',
    'Bluesky',
    'LinkedIn',
    'Facebook',
    'Hacker News',
    'WhatsApp',
    'Telegram',
    'Reddit',
  ];
  const html = renderShareGroup({
    sharing: { targets },
    title: TITLE,
    url: URL_,
    messages: getMessages('en'),
  });
  for (const name of names) {
    assert.ok(
      html.includes(`aria-label="Share on ${name}" title="Share on ${name}"`),
      name,
    );
  }
  const tamil = renderShareGroup({
    sharing: { targets: ['x', 'email', 'native'] },
    title: TITLE,
    url: URL_,
    messages: getMessages('ta'),
  });
  assert.ok(tamil.includes('aria-label="X இல் பகிர்"'));
  assert.ok(tamil.includes('aria-label="மின்னஞ்சலில் பகிர்"'));
  assert.ok(tamil.includes('aria-label="இந்தக் கட்டுரையைப் பகிர்"'));
});

test('native: a button hidden by default, carrying the title and URL for the script', () => {
  const html = renderShareGroup({
    sharing: { targets: ['native', 'x'] },
    title: 'A "quoted" title',
    url: URL_,
    messages: getMessages('en'),
  });
  assert.match(
    html,
    /<button class="g-icon-btn" type="button" data-action="native-share" data-share-title="A &quot;quoted&quot; title" data-share-url="https:\/\/fixture-1\.example\.com\/fixture-1\/first-article\/" aria-label="Share this article" title="Share this article" hidden>/,
  );
  // Native alone leaves no link, so the whole group waits for the script too.
  const alone = renderShareGroup({
    sharing: { targets: ['native'] },
    title: TITLE,
    url: URL_,
    messages: getMessages('en'),
  });
  assert.match(
    alone,
    /^<div class="g-share" role="group" aria-label="Share" hidden>/,
  );
  assert.match(alone, /data-action="native-share"[^>]* hidden>/);
});

test('the share URL is the page canonical URL, including a seo.canonicalUrl override', async () => {
  const html = await articleShare({ targets: ['linkedin'] });
  assert.ok(html.includes(`?url=${ENCODED_URL}"`));
  const overridden = await articleShare({ targets: ['linkedin'] }, (input) => {
    const record = input.content.find(
      (/** @type {any} */ item) => item.frontmatter.title === TITLE,
    );
    record.frontmatter.seo = { canonicalUrl: 'https://elsewhere.example/post' };
  });
  assert.ok(
    overridden.includes(
      `?url=${encodeURIComponent('https://elsewhere.example/post')}"`,
    ),
  );
});

test('duplicates collapse, an unknown target fails loudly, the list is the schema list', () => {
  assert.deepEqual(resolveShareTargets({ targets: ['x', 'x', 'email'] }), [
    'x',
    'email',
  ]);
  assert.deepEqual(resolveShareTargets(undefined), ['copy-link']);
  assert.deepEqual(resolveShareTargets({ targets: [] }), []);
  assert.throws(
    () => resolveShareTargets({ targets: ['mastodon'] }),
    /unknown share target "mastodon"/,
  );
  assert.equal(SHARE_TARGETS.length, 11);
  // Every network target has an icon in the fixed set.
  for (const target of SHARE_TARGETS) {
    if (target === 'copy-link' || target === 'native' || target === 'email')
      continue;
    assert.ok(ICONS[target], `${target} icon`);
    assert.match(icon(target), /<path fill="currentColor" stroke="none" d="/);
  }
});

test('a page without an article share group renders none (pages and listings are unchanged)', async () => {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  buildInput.publication.sharing = { targets: ['x'] };
  const pages = buildGeneratedPages(buildInput, { pageBody: (body) => body });
  for (const page of pages.filter(
    (candidate) => candidate.kind !== 'article',
  )) {
    assert.ok(!page.bodyHtml.includes('g-share'), `${page.kind} ${page.route}`);
  }
});

test('full render: the schemas validate publication.sharing and the built article carries the group', async (t) => {
  const input = /** @type {any} */ (await buildRichFixture());
  input.publication.sharing = { targets: ['x', 'bluesky', 'email'] };
  const site = await renderSite(input);
  t.after(site.cleanup);
  const html = await site.htmlOf('fixture-1/first-article/index.html');
  const group = html.match(GROUP);
  assert.ok(group, 'the built article renders a share group');
  assert.deepEqual(order(group[0]), ['x', 'bluesky', 'email', 'bookmark']);
  assert.match(group[0], /aria-label="Share on X"/);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  assert.ok(canonical, 'the built article names its canonical URL');
  assert.ok(
    group[0].includes(encodeURIComponent(canonical[1])),
    'the share links carry the page canonical URL',
  );
});

// --- the shipped site script ---

/**
 * Run the real site script over a share group.
 *
 * @param {string} group the group markup
 * @param {{share?: (data: unknown) => Promise<void>}} [options] a Web Share
 *   API stand-in; absent means the browser has none
 * @returns {import('jsdom').DOMWindow} the window after the script ran
 */
function run(group, options = {}) {
  const dom = new JSDOM(
    `<!doctype html><html><head></head><body>${group}</body></html>`,
    { runScripts: 'dangerously', url: 'https://fixture.example.test/post/' },
  );
  if (options.share) {
    Object.defineProperty(dom.window.navigator, 'share', {
      value: options.share,
      configurable: true,
    });
  }
  dom.window.eval(APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  return dom.window;
}

/**
 * @param {import('jsdom').DOMWindow} window
 * @param {string} action
 * @returns {boolean | undefined} the button's `hidden`, undefined when absent
 */
function hiddenOf(window, action) {
  return /** @type {HTMLElement | null} */ (
    window.document.querySelector(`[data-action="${action}"]`)
  )?.hidden;
}

test('script: the original group is revealed, copy link and bookmark included', () => {
  const window = run(LEGACY_GROUP);
  assert.equal(
    window.document.querySelector('.g-share')?.hasAttribute('hidden'),
    false,
  );
  assert.equal(hiddenOf(window, 'copy-link'), false);
  assert.equal(hiddenOf(window, 'bookmark'), false);
});

test('script: a link group reveals copy link and bookmark; native only where navigator.share exists', () => {
  const group = renderShareGroup({
    sharing: { targets: ['x', 'native', 'copy-link'] },
    title: TITLE,
    url: URL_,
    messages: getMessages('en'),
  });
  const without = run(group);
  assert.equal(hiddenOf(without, 'copy-link'), false);
  assert.equal(hiddenOf(without, 'bookmark'), false);
  assert.equal(
    hiddenOf(without, 'native-share'),
    true,
    'no share sheet, no button',
  );

  /** @type {unknown[]} */
  const shared = [];
  const withShare = run(group, {
    share: async (data) => {
      shared.push(data);
    },
  });
  assert.equal(hiddenOf(withShare, 'native-share'), false);
  /** @type {HTMLElement} */ (
    withShare.document.querySelector('[data-action="native-share"]')
  ).click();
  // The object comes from the window's realm: compare by value.
  assert.equal(
    JSON.stringify(shared),
    JSON.stringify([{ title: TITLE, url: URL_ }]),
  );
});

test('script: a dismissed or failing share sheet never throws', async () => {
  const group = renderShareGroup({
    sharing: { targets: ['native'] },
    title: TITLE,
    url: URL_,
    messages: getMessages('en'),
  });
  for (const share of [
    () => Promise.reject(new Error('AbortError')),
    () => {
      throw new TypeError('not allowed');
    },
  ]) {
    const window = run(group, { share: /** @type {any} */ (share) });
    const button = /** @type {HTMLElement} */ (
      window.document.querySelector('[data-action="native-share"]')
    );
    assert.doesNotThrow(() => button.click());
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
});

test('script: the empty-list group is revealed with Bookmark only', () => {
  const group = renderShareGroup({
    sharing: { targets: [] },
    title: TITLE,
    url: URL_,
    messages: getMessages('en'),
  });
  const window = run(group);
  assert.equal(
    window.document.querySelector('.g-share')?.hasAttribute('hidden'),
    false,
  );
  assert.equal(hiddenOf(window, 'bookmark'), false);
  assert.equal(hiddenOf(window, 'copy-link'), undefined);
});
