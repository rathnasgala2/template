/**
 * Public counts on post cards, the home cover story and article headers: the
 * server-rendered slots (only when interactions are on and the matching
 * `publicCounts` switch is true), the counts script asset and its tag, and the
 * shipped browser script (`gala-counts.js`) executed in JSDOM against a
 * scripted fake API: one batched request per page, the `PublicCount` display,
 * and silence on every kind of failure.
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { JSDOM } from 'jsdom';

import { renderPublication } from '../src/core/index.js';
import {
  COUNTS_SCRIPT_PATH,
  countKinds,
  renderCountSlot,
} from '../src/core/internal/interactions.js';
import { buildGeneratedPages } from '../src/core/internal/page-kinds.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';

const SCRIPT_PATH = path.resolve(
  import.meta.dirname,
  '../src/modules/interactions/browser/gala-counts.js',
);
const SOURCE = await readFile(SCRIPT_PATH, 'utf8');

const API = 'https://api.galascribe.com';
const PUBLICATION = '0190b1f0-0000-7000-8000-000000000001';
const BOTH = { reactions: true, comments: true };

/**
 * A valid interactions module selection.
 *
 * @param {Partial<Record<'reactions' | 'comments' | 'countReactions' | 'countComments', boolean>>} [flags]
 *   which interactions are enabled and which counts are public (all true)
 * @returns {any} the module
 */
function moduleWith(flags = {}) {
  const { reactions = true, comments = true } = flags;
  const { countReactions = true, countComments = true } = flags;
  return {
    config: {
      schemaId: 'urn:gala:schema:interactions-config:2.0.0',
      schemaVersion: '2.0.0',
      reactions: { enabled: reactions, definitions: [] },
      comments: { enabled: comments, allowReplies: true, maxDepth: 3 },
      publicCounts: { reactions: countReactions, comments: countComments },
    },
    apiOrigin: API,
    appOrigin: 'https://app.galascribe.com',
  };
}

/**
 * The rich fixture's pages, rendered with the given interactions module.
 *
 * @param {any} [interactions] the module, or undefined for none
 * @returns {Promise<Map<string, string>>} body HTML by `kind route`
 */
async function pagesWith(interactions) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const pages = buildGeneratedPages(buildInput, {
    pageBody: (body) => body,
    interactions,
  });
  return new Map(
    pages.map((page) => [`${page.kind} ${page.route}`, page.bodyHtml]),
  );
}

/**
 * @param {string} html
 * @returns {string[]} each card's markup
 */
function cardsOf(html) {
  return html
    .split('<article class="g-card')
    .slice(1)
    .map((card) => card.slice(0, card.indexOf('</article>')));
}

/**
 * @param {string} html
 * @param {RegExp} pattern a global pattern
 * @returns {number} its match count
 */
const countOf = (html, pattern) => (html.match(pattern) ?? []).length;

const SLOT = /<span class="g-counts" data-gala-counts /g;

// --- which kinds a site shows ---

test('countKinds: a kind shows only when that interaction is on and its publicCounts switch is true', () => {
  assert.deepEqual(countKinds(moduleWith()), BOTH);
  assert.deepEqual(countKinds(moduleWith({ countComments: false })), {
    reactions: true,
    comments: false,
  });
  assert.deepEqual(
    countKinds(moduleWith({ reactions: false })),
    { reactions: false, comments: true },
    'reaction counts need reactions on',
  );
  assert.deepEqual(
    countKinds(moduleWith({ comments: false, countReactions: false })),
    undefined,
  );
  assert.equal(
    countKinds(moduleWith({ countReactions: false, countComments: false })),
    undefined,
  );
  assert.equal(
    countKinds(moduleWith({ reactions: false, comments: false })),
    undefined,
    'no interaction on: no module at all',
  );
  assert.equal(countKinds(undefined), undefined);
});

// --- server-rendered slots ---

test('a slot is empty and hidden: no text, no space, one icon per kind', () => {
  const slot = renderCountSlot({ kinds: BOTH, contentId: 'id-1&"<' });
  assert.match(
    slot,
    /^<span class="g-counts" data-gala-counts data-content-id="id-1&amp;&quot;&lt;" hidden>/,
  );
  assert.equal(
    countOf(
      slot,
      /<span class="g-count" data-gala-count-kind="(reactions|comments)" hidden>/g,
    ),
    2,
  );
  assert.equal(countOf(slot, /<span data-gala-count-value><\/span>/g), 2);
  assert.ok(slot.indexOf('"reactions"') < slot.indexOf('"comments"'));
  assert.equal(countOf(slot, /<svg /g), 2);
  assert.ok(!/>\s*[^<\s][^<]*</.test(slot.replace(/<svg.*?<\/svg>/gs, '')));
  const reactionsOnly = renderCountSlot({
    kinds: { reactions: true, comments: false },
    contentId: 'a',
  });
  assert.ok(!reactionsOnly.includes('"comments"'));
});

test('counts on: every card on home, tag, archive, series and author pages has one slot, the cover story and article header too', async () => {
  const pages = await pagesWith(moduleWith());
  let cards = 0;
  for (const [key, html] of pages) {
    const kind = key.split(' ')[0];
    const own = cardsOf(html);
    cards += own.length;
    for (const card of own) {
      assert.equal(countOf(card, SLOT), 1, `${key}: one slot per card`);
      // The top row already has a line's height, so filling the slot moves
      // nothing; the foot (date, reading time, arrow) is not touched.
      const top = /<div class="g-card-top">(.*?)<\/div><h[23]>/s.exec(card);
      assert.ok(top, `${key}: card top row`);
      assert.match(
        top[1],
        /<span class="g-counts" data-gala-counts data-content-id="[^"]+" hidden>.*<\/span>$/s,
        `${key}: the slot ends the card top row`,
      );
      assert.ok(!/<div class="g-card-foot">.*g-counts/s.test(card), key);
    }
    if (kind === 'article') {
      const labels = /<div class="g-article-labels">(.*?)<\/div><h1>/s.exec(
        html,
      );
      assert.ok(labels, `${key}: article label row`);
      assert.equal(countOf(labels[1], SLOT), 1, `${key}: header slot`);
      assert.ok(
        !/<div class="g-article-meta">.*g-counts.*<div class="g-share"/s.test(
          html,
        ),
        `${key}: none beside the byline and share group`,
      );
    } else if (!/^(index|tag|series|archive|author) /.test(key)) {
      assert.equal(countOf(html, SLOT), 0, `${key}: no slot`);
    }
  }
  assert.ok(cards >= 8, 'the fixture lists many cards');
  const home = /** @type {string} */ (pages.get('index /'));
  const hero = /<section class="g-wrap g-hero".*?<\/section>/s.exec(home);
  assert.ok(hero);
  assert.equal(countOf(hero[0], SLOT), 1, 'the cover story has one');
  assert.match(
    hero[0],
    /<p class="g-eyebrow">.*<span class="g-counts" data-gala-counts [^>]*hidden>.*?<\/span><\/p><h2/s,
    'at the end of the eyebrow row',
  );
});

test('a slot carries the post id of its card, article header and cover story', async () => {
  const pages = await pagesWith(moduleWith());
  const article = /** @type {string} */ (pages.get('article /first-article'));
  const header =
    /<div class="g-article-labels">.*?data-content-id="([^"]+)"/s.exec(article);
  assert.equal(header?.[1], '019c0000-0000-7000-8000-000000000001');
  const home = /** @type {string} */ (pages.get('index /'));
  const ids = [
    ...home.matchAll(/data-gala-counts data-content-id="([^"]+)"/g),
  ].map((match) => match[1]);
  assert.ok(ids.length >= 2);
  assert.ok(ids.every((id) => /^019c0000-0000-7000-8000-\d{12}$/.test(id)));
});

test('only the kinds a site shows: reactions only, comments only', async () => {
  const reactionsOnly = await pagesWith(moduleWith({ countComments: false }));
  const commentsOnly = await pagesWith(moduleWith({ reactions: false }));
  for (const html of reactionsOnly.values()) {
    assert.ok(!html.includes('data-gala-count-kind="comments"'));
  }
  for (const html of commentsOnly.values()) {
    assert.ok(!html.includes('data-gala-count-kind="reactions"'));
  }
  const home = /** @type {string} */ (reactionsOnly.get('index /'));
  assert.ok(home.includes('data-gala-count-kind="reactions"'));
  assert.ok(
    /** @type {string} */ (commentsOnly.get('index /')).includes(
      'data-gala-count-kind="comments"',
    ),
  );
});

test('flags off or no interactions: no slot anywhere, and listing pages are byte-identical to a site without the module', async () => {
  const bare = await pagesWith(undefined);
  const flagsOff = await pagesWith(
    moduleWith({ countReactions: false, countComments: false }),
  );
  const noInteractionOn = await pagesWith(
    moduleWith({ reactions: false, comments: false }),
  );
  for (const pages of [bare, flagsOff, noInteractionOn]) {
    for (const [key, html] of pages) {
      assert.ok(!html.includes('g-counts'), `${key}: no slot`);
      assert.ok(!html.includes('data-gala-counts'), `${key}: no marker`);
    }
  }
  for (const [key, html] of bare) {
    // Article pages keep their interactions section, and the policy pages
    // gain the module's sentence; the listings must not change at all.
    if (!/^(index|tag|series|archive|author) /.test(key)) continue;
    assert.equal(flagsOff.get(key), html, `${key}: unchanged`);
    assert.equal(noInteractionOn.get(key), html, `${key}: unchanged`);
  }
  // The article keeps its interactions section; only its header slot is gone.
  assert.ok(
    /** @type {string} */ (flagsOff.get('article /first-article')).includes(
      'data-gala-interactions',
    ),
  );
});

// --- the asset and its tag, end to end ---

/**
 * Render the rich fixture through the whole renderer.
 *
 * @param {any} interactions the interactions module, or undefined
 * @returns {Promise<{manifest: any, html: Map<string, string>, bytes: (p: string) => Promise<Buffer>}>}
 */
async function renderWith(interactions) {
  const input = /** @type {any} */ (await buildRichFixture());
  input.modules = interactions ? { interactions } : {};
  const dirs = await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(input, {
      outputDirectory: dirs.outputDirectory,
      workDirectory: dirs.workDirectory,
      sourceDirectory: dirs.sourceDirectory,
      provenance: testProvenance(),
    });
    /** @type {Map<string, string>} */
    const html = new Map();
    for (const route of manifest.routes) {
      if (route.routeClass !== 'html' && route.routeClass !== 'error') continue;
      html.set(
        route.path,
        await readFile(path.join(dirs.outputDirectory, route.path), 'utf8'),
      );
    }
    const scriptEntry = manifest.assets.find((/** @type {any} */ asset) =>
      asset.path.endsWith(COUNTS_SCRIPT_PATH),
    );
    const script = scriptEntry
      ? await readFile(path.join(dirs.outputDirectory, scriptEntry.path))
      : undefined;
    return {
      manifest,
      html,
      bytes: async () => /** @type {Buffer} */ (script),
    };
  } finally {
    await dirs.cleanup();
  }
}

test('counts on: the script is a manifest asset, and exactly the pages with a slot load it, configured from its own tag', async () => {
  const { manifest, html, bytes } = await renderWith(moduleWith());
  const entry = manifest.assets.find((/** @type {any} */ asset) =>
    asset.path.endsWith(COUNTS_SCRIPT_PATH),
  );
  assert.ok(entry, 'the counts script is an asset');
  const source = await readFile(SCRIPT_PATH);
  assert.equal(
    entry.sha256,
    `sha256:${createHash('sha256').update(source).digest('hex')}`,
  );
  assert.equal(entry.mediaType, 'application/javascript; charset=utf-8');
  assert.deepEqual(await bytes(entry.path), source);

  let withScript = 0;
  let withoutScript = 0;
  for (const [route, page] of html) {
    const slots = countOf(page, SLOT);
    const tags =
      page.match(/<script src="[^"]*gala-counts-v1\.js"[^>]*>/g) ?? [];
    if (slots === 0) {
      assert.equal(tags.length, 0, `${route}: no slot, no script`);
      withoutScript += 1;
      continue;
    }
    withScript += 1;
    assert.equal(tags.length, 1, `${route}: one script tag`);
    assert.match(
      tags[0],
      new RegExp(
        `^<script src="[^"]*/assets/gala-counts-v1\\.js" defer data-api-origin="${API}" data-publication-id="[^"]+">$`,
      ),
    );
    assert.ok(page.indexOf('gala-counts-v1.js') < page.indexOf('<body'));
  }
  assert.ok(withScript >= 6, 'listing and article pages load it');
  assert.ok(withoutScript >= 3, 'pages without a slot do not');
  // Listing pages are not interaction-bearing; only the article pages are.
  for (const route of manifest.routes) {
    if (route.routeClass !== 'html') continue;
    const page = /** @type {string} */ (html.get(route.path));
    assert.equal(
      route.interactionBearing,
      page.includes('data-gala-interactions'),
      route.path,
    );
  }
});

test('counts off: no asset, no script tag, no slot', async () => {
  const { manifest, html } = await renderWith(
    moduleWith({ countReactions: false, countComments: false }),
  );
  assert.ok(
    !manifest.assets.some((/** @type {any} */ asset) =>
      asset.path.endsWith(COUNTS_SCRIPT_PATH),
    ),
  );
  for (const [route, page] of html) {
    assert.ok(!page.includes('gala-counts-v1'), route);
    assert.ok(!page.includes('g-counts'), route);
  }
});

// --- the browser script ---

const ID_A = '0190b1f0-0000-7000-8000-00000000000a';
const ID_B = '0190b1f0-0000-7000-8000-00000000000b';
const ID_C = '0190b1f0-0000-7000-8000-00000000000c';

/**
 * Boot the script in a page of slots.
 *
 * @param {object} options
 * @param {string[]} options.ids the post id of each slot, in order
 * @param {(call: {url: string, init: any}) => unknown} [options.respond]
 *   the fake API: a `{status, body}` (or `{status, text}`) answer, a thrown
 *   error to fail the request, or `'hang'` to never answer
 * @param {string} [options.tag] the script tag's attributes (default: valid)
 * @param {boolean} [options.shrinkTimeout] shorten the 15 s request timeout
 * @returns {Promise<{window: import('jsdom').DOMWindow, calls: {url: string, init: any}[], settle: () => Promise<void>, slots: () => HTMLElement[]}>}
 */
async function boot({ ids, respond, tag, shrinkTimeout }) {
  const attrs =
    tag ?? `data-api-origin="${API}/" data-publication-id="${PUBLICATION}"`;
  const slots = ids
    .map((id) => renderCountSlot({ kinds: BOTH, contentId: id }))
    .join('');
  const dom = new JSDOM(
    `<!doctype html><html><head><script src="/assets/gala-counts-v1.js" defer ${attrs}></script></head><body>${slots}</body></html>`,
    { url: 'https://blog.example/', runScripts: 'outside-only' },
  );
  const { window } = dom;
  /** @type {{url: string, init: any}[]} */
  const calls = [];
  /** @type {any} */ (window).fetch = (
    /** @type {string} */ url,
    /** @type {any} */ init,
  ) => {
    const call = { url: String(url), init };
    calls.push(call);
    const answer = respond
      ? respond(call)
      : { status: 200, body: { items: [] } };
    if (answer === 'hang') {
      return new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () =>
          reject(new window.DOMException('aborted', 'AbortError')),
        );
      });
    }
    if (answer instanceof Error) return Promise.reject(answer);
    const { status, body, text } = /** @type {any} */ (answer);
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: async () => {
        if (text !== undefined) return JSON.parse(text);
        return body;
      },
    });
  };
  if (shrinkTimeout) {
    const real = window.setTimeout.bind(window);
    window.setTimeout = /** @type {any} */ (
      (/** @type {() => void} */ fn, /** @type {number} */ ms) =>
        real(fn, ms === 15000 ? 15 : ms)
    );
  }
  window.eval(SOURCE);
  const settle = async () => {
    for (let i = 0; i < 20; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  };
  return {
    window,
    calls,
    settle,
    slots: () =>
      Array.from(window.document.querySelectorAll('[data-gala-counts]')),
  };
}

/**
 * @param {HTMLElement} slot
 * @param {string} kind
 * @returns {HTMLElement}
 */
const part = (slot, kind) =>
  /** @type {HTMLElement} */ (
    slot.querySelector(`[data-gala-count-kind="${kind}"]`)
  );

/**
 * A `PublicCount`.
 *
 * @param {number} n the lower bound
 * @param {string} [display] the display text (default: the number)
 * @param {string} [label] the accessible name (default: "<display> things")
 * @returns {{lowerBound: number, display: string, label: string}} the count
 */
function count(n, display = String(n), label = '') {
  return { lowerBound: n, display, label: label || `${display} things` };
}

test('script: one batched GET names every post once, public and credential-free', async () => {
  const harness = await boot({
    ids: [ID_A, ID_B, ID_A, ID_C],
    respond: () => ({ status: 200, body: { items: [] } }),
  });
  await harness.settle();
  assert.equal(harness.calls.length, 1);
  const [call] = harness.calls;
  assert.equal(
    call.url,
    `${API}/v2/public/publications/${PUBLICATION}/interaction-counts?contentIds=${ID_A},${ID_B},${ID_C}`,
  );
  assert.equal(call.init.method, 'GET');
  assert.equal(call.init.credentials, 'omit');
  assert.equal(call.init.mode, 'cors');
  assert.equal(call.init.body, undefined);
  assert.equal(call.init.headers.Accept, 'application/json');
  assert.equal(call.init.headers.Authorization, undefined);
  // Nothing was answered: every slot is still hidden and empty.
  for (const slot of harness.slots()) {
    assert.equal(slot.hidden, true);
    assert.equal(slot.textContent, '');
  }
});

test('script: figures and names come from the PublicCount; a null kind stays hidden; a post with neither stays hidden', async () => {
  const harness = await boot({
    ids: [ID_A, ID_B, ID_C, ID_A],
    respond: () => ({
      status: 200,
      body: {
        items: [
          {
            contentId: ID_A,
            reactions: count(1200, '1.2k', 'More than 1,200 reactions'),
            comments: null,
          },
          { contentId: ID_B, reactions: null, comments: count(3, '3') },
          { contentId: ID_C, reactions: null, comments: null },
        ],
      },
    }),
  });
  await harness.settle();
  const [a, b, c, aAgain] = harness.slots();
  assert.equal(a.hidden, false);
  assert.equal(part(a, 'reactions').hidden, false);
  assert.equal(
    part(a, 'reactions').querySelector('[data-gala-count-value]')?.textContent,
    '1.2k',
  );
  assert.equal(part(a, 'reactions').getAttribute('role'), 'img');
  assert.equal(
    part(a, 'reactions').getAttribute('aria-label'),
    'More than 1,200 reactions',
  );
  assert.equal(part(a, 'comments').hidden, true);
  assert.equal(b.hidden, false);
  assert.equal(part(b, 'reactions').hidden, true);
  assert.equal(
    part(b, 'comments').querySelector('[data-gala-count-value]')?.textContent,
    '3',
  );
  assert.equal(part(b, 'comments').getAttribute('aria-label'), '3 things');
  assert.equal(c.hidden, true, 'nothing to show: no space taken');
  assert.equal(aAgain.hidden, false, 'the same post twice is filled twice');
  assert.equal(
    part(aAgain, 'reactions').querySelector('[data-gala-count-value]')
      ?.textContent,
    '1.2k',
  );
});

test('script: a count without a label is named by its figure', async () => {
  const harness = await boot({
    ids: [ID_A],
    respond: () => ({
      status: 200,
      body: {
        items: [
          {
            contentId: ID_A,
            reactions: { lowerBound: 99, display: '99+' },
            comments: null,
          },
        ],
      },
    }),
  });
  await harness.settle();
  assert.equal(
    part(harness.slots()[0], 'reactions').getAttribute('aria-label'),
    '99+',
  );
});

test('script: more than 50 posts go in batches of at most 50', async () => {
  const ids = Array.from(
    { length: 120 },
    (_, index) => `0190b1f0-0000-7000-8000-${String(index).padStart(12, '0')}`,
  );
  const harness = await boot({ ids });
  await harness.settle();
  assert.equal(harness.calls.length, 3);
  const sizes = harness.calls.map(
    (call) => call.url.split('contentIds=')[1].split(',').length,
  );
  assert.deepEqual(sizes, [50, 50, 20]);
  assert.deepEqual(
    harness.calls.flatMap((call) =>
      call.url.split('contentIds=')[1].split(','),
    ),
    ids,
  );
});

test('script: exactly 50 posts is still one request', async () => {
  const ids = Array.from(
    { length: 50 },
    (_, index) => `0190b1f0-0000-7000-8000-${String(index).padStart(12, '0')}`,
  );
  const harness = await boot({ ids });
  await harness.settle();
  assert.equal(harness.calls.length, 1);
});

test('script: every failure leaves the slots empty, hidden and the page intact', async () => {
  /** @type {Record<string, (call: any) => unknown>} */
  const failures = {
    'network error': () => new TypeError('Failed to fetch'),
    'server error': () => ({ status: 500, body: { code: 'INTERNAL' } }),
    'not found (endpoint not deployed)': () => ({ status: 404, body: {} }),
    'rate limited': () => ({ status: 429, body: {} }),
    'body is not JSON': () => ({ status: 200, text: '<html>oops' }),
    'body is null': () => ({ status: 200, body: null }),
    'items is not an array': () => ({ status: 200, body: { items: 'no' } }),
    'items are junk': () => ({
      status: 200,
      body: {
        items: [null, 5, 'x', {}, { contentId: 7 }, { contentId: ID_A }],
      },
    }),
    'figures are not strings': () => ({
      status: 200,
      body: {
        items: [
          {
            contentId: ID_A,
            reactions: { display: 12 },
            comments: { display: '' },
          },
        ],
      },
    }),
  };
  for (const [name, respond] of Object.entries(failures)) {
    const harness = await boot({ ids: [ID_A, ID_B], respond });
    await harness.settle();
    assert.equal(harness.calls.length, 1, name);
    for (const slot of harness.slots()) {
      assert.equal(slot.hidden, true, `${name}: slot hidden`);
      assert.equal(slot.textContent, '', `${name}: slot empty`);
    }
    assert.equal(harness.window.document.body.children.length, 2, name);
  }
});

test('script: a request that never answers is abandoned after the timeout', async () => {
  const harness = await boot({
    ids: [ID_A],
    respond: () => 'hang',
    shrinkTimeout: true,
  });
  await harness.settle();
  assert.equal(harness.calls.length, 1);
  assert.equal(harness.calls[0].init.signal.aborted, true);
  assert.equal(harness.slots()[0].hidden, true);
});

test('script: one failed batch does not stop the others, and a bad item does not stop its neighbours', async () => {
  const ids = Array.from(
    { length: 60 },
    (_, index) => `0190b1f0-0000-7000-8000-${String(index).padStart(12, '0')}`,
  );
  const harness = await boot({
    ids,
    respond: (call) =>
      call.url.includes(`contentIds=${ids[0]}`)
        ? { status: 500, body: {} }
        : {
            status: 200,
            body: {
              items: [
                null,
                { contentId: ids[55], reactions: count(5), comments: null },
              ],
            },
          },
  });
  await harness.settle();
  const slots = harness.slots();
  assert.equal(slots[0].hidden, true, 'the failed batch stays hidden');
  assert.equal(slots[55].hidden, false, 'the good batch shows');
});

test('script: no config or no slots means no request, and no error', async () => {
  const noOrigin = await boot({
    ids: [ID_A],
    tag: `data-publication-id="${PUBLICATION}" data-api-origin=""`,
  });
  await noOrigin.settle();
  assert.equal(noOrigin.calls.length, 0);
  const noTag = await boot({ ids: [ID_A], tag: 'data-other="1"' });
  await noTag.settle();
  assert.equal(noTag.calls.length, 0);
  const noSlots = await boot({ ids: [] });
  await noSlots.settle();
  assert.equal(noSlots.calls.length, 0);
});

test('script source: text only through textContent, no innerHTML, eval, popup, cookie or storage', () => {
  for (const pattern of [
    /innerHTML/,
    /outerHTML/,
    /insertAdjacentHTML/,
    /document\.write/,
    /\beval\(/,
    /new Function/,
    /window\.open/,
    /document\.cookie/,
    /localStorage|sessionStorage/,
    /postMessage/,
  ]) {
    assert.ok(
      !pattern.test(SOURCE.replace(/\/\*[\s\S]*?\*\//g, '')),
      `${pattern}`,
    );
  }
});
