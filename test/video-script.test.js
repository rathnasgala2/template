/**
 * The click-to-play video script (`gala-video.js`): the shipped source runs in
 * JSDOM against a rendered video card. A plain tap swaps the card for one
 * iframe from the provider's privacy-respecting host; a modified click, a
 * malformed reference and a link outside a video card change nothing.
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { JSDOM } from 'jsdom';

import { decorateBlocks } from '../src/core/internal/content-blocks.js';
import { normalizeAuthoredMarkdown } from '../src/core/internal/content-security.js';
import { CATALOGS } from '../src/core/internal/messages/registry.js';

const SOURCE = await readFile(
  path.resolve(
    import.meta.dirname,
    '../src/modules/interactions/browser/gala-video.js',
  ),
  'utf8',
);

/**
 * @param {string} fence the video block's lines
 * @returns {string} the rendered card
 */
function card(fence) {
  return decorateBlocks(
    normalizeAuthoredMarkdown('```video\n' + fence + '\n```\n').html,
    { messages: CATALOGS.en, resolveFile: () => undefined },
  );
}

/**
 * @param {string} html the page body
 * @returns {JSDOM} the booted page
 */
function boot(html) {
  const dom = new JSDOM(
    `<!doctype html><body>${html}<a id="out" href="https://x.test/">out</a></body>`,
    {
      url: 'https://blog.example/post/',
      runScripts: 'outside-only',
    },
  );
  dom.window.eval(SOURCE);
  return dom;
}

/**
 * @param {JSDOM} dom the page
 * @param {string} selector the target
 * @param {Record<string, unknown>} [init] mouse event options
 * @returns {boolean} whether the click was left to the browser
 */
function click(dom, selector, init = {}) {
  const target = /** @type {HTMLElement} */ (
    dom.window.document.querySelector(selector)
  );
  return target.dispatchEvent(
    new dom.window.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0,
      ...init,
    }),
  );
}

const YOUTUBE = 'provider: youtube\nid: dQw4w9WgXcQ\ntitle: A talk';

test('a tap replaces the card with one lazy YouTube privacy-mode iframe', () => {
  const dom = boot(card(YOUTUBE));
  const document = dom.window.document;
  assert.equal(
    click(dom, '.g-block__title'),
    false,
    'the link is not followed',
  );
  const frames = document.querySelectorAll('iframe');
  assert.equal(frames.length, 1);
  const frame = frames[0];
  assert.equal(
    frame.getAttribute('src'),
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1',
  );
  assert.equal(frame.getAttribute('title'), 'A talk');
  assert.equal(frame.getAttribute('loading'), 'lazy');
  assert.equal(
    frame.getAttribute('referrerpolicy'),
    'strict-origin-when-cross-origin',
  );
  assert.ok(frame.hasAttribute('allowfullscreen'));
  assert.match(frame.getAttribute('allow') ?? '', /fullscreen/);
  assert.equal(document.querySelector('figure a'), null, 'the card is gone');
  assert.equal(document.querySelector('.g-video__frame iframe'), frame);
  assert.equal(document.activeElement, frame);
});

test('Vimeo uses its player host', () => {
  const dom = boot(card('provider: vimeo\nid: 76979871\ntitle: Short'));
  click(dom, '.g-block');
  assert.equal(
    dom.window.document.querySelector('iframe')?.getAttribute('src'),
    'https://player.vimeo.com/video/76979871?autoplay=1',
  );
});

test('before a tap nothing third-party is in the page: a link, no frame', () => {
  const html = card(YOUTUBE);
  assert.ok(!html.includes('<iframe'));
  const dom = boot(html);
  assert.equal(dom.window.document.querySelectorAll('iframe').length, 0);
  assert.equal(
    dom.window.document.querySelector('a.g-block')?.getAttribute('href'),
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  );
});

test('a modified click, a middle click and a link outside a card keep the link', () => {
  const dom = boot(card(YOUTUBE));
  for (const init of [
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
  ]) {
    assert.equal(click(dom, 'a.g-block', init), true, JSON.stringify(init));
  }
  assert.equal(click(dom, '#out'), true);
  assert.equal(dom.window.document.querySelectorAll('iframe').length, 0);
});

test('a reference that is not provider:id is never framed', () => {
  for (const reference of [
    'youtube:short',
    'vimeo:12ab',
    'dailymotion:abc',
    'youtube:dQw4w9WgXcQ/../x',
    'constructor:dQw4w9WgXcQ',
    '__proto__:1',
    'youtube',
    '',
  ]) {
    const dom = boot(
      `<figure data-gala-video="${reference}"><a href="https://x.test/"><span class="g-block__title">T</span></a></figure>`,
    );
    assert.equal(click(dom, 'a'), true, reference);
    assert.equal(dom.window.document.querySelectorAll('iframe').length, 0);
  }
});

test('the script holds no innerHTML, eval, request or popup', () => {
  assert.ok(
    !/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(SOURCE),
  );
  assert.ok(
    !/\beval\b|new Function|fetch\(|XMLHttpRequest|sendBeacon|window\.open|postMessage/.test(
      SOURCE,
    ),
  );
  assert.ok(SOURCE.length < 6 * 1024);
});
