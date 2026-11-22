/**
 * The interactive preview simulates the poll read and the vote like its other
 * writes: nothing reaches the network, the vote is kept for the session, and
 * the page's own script receives the answer shape it expects.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { JSDOM } from 'jsdom';

import { PREVIEW_RUNTIME_SOURCE } from '../src/core/internal/preview-runtime-source.js';

const API = 'https://api.galascribe.com';
const BASE = `${API}/v2/public/publications/p1/contents/c1/polls`;

/**
 * @returns {JSDOM} a page with the runtime booted over a failing real fetch
 */
function boot() {
  const data = JSON.stringify({
    apiOrigin: API,
    siteBase: 'https://blog.example/',
    messages: { notSaved: 'Preview only' },
    cache: {},
  });
  const dom = new JSDOM(
    `<!doctype html><script type="application/json" data-gala-preview-data>${data}</script>`,
    { url: 'https://blog.example/', runScripts: 'outside-only' },
  );
  const real = /** @type {string[]} */ ([]);
  dom.window.fetch = /** @type {any} */ (
    (/** @type {string} */ url) => {
      real.push(String(url));
      return Promise.reject(new Error('the network is not reachable'));
    }
  );
  /** @type {any} */ (dom.window).Response = Response;
  dom.window.eval(PREVIEW_RUNTIME_SOURCE);
  /** @type {any} */ (dom.window).real = real;
  return dom;
}

test('the poll read and the vote are simulated: no network, the vote kept for the session', async () => {
  const dom = boot();
  const w = /** @type {any} */ (dom.window);
  const first = await w.fetch(BASE);
  assert.deepEqual(await first.json(), { polls: [] });
  const voted = await w.fetch(`${BASE}/best-day/vote`, {
    method: 'PUT',
    body: JSON.stringify({ option: 2 }),
  });
  assert.equal(voted.status, 200);
  assert.deepEqual(await voted.json(), {
    pollId: 'best-day',
    total: 1,
    options: [{ index: 2, count: 1 }],
    myOption: 2,
  });
  const again = await w.fetch(BASE);
  assert.deepEqual((await again.json()).polls, [
    {
      pollId: 'best-day',
      total: 1,
      options: [{ index: 2, count: 1 }],
      myOption: 2,
    },
  ]);
  const bad = await w.fetch(`${BASE}/best-day/vote`, {
    method: 'PUT',
    body: JSON.stringify({ option: 9 }),
  });
  assert.equal(bad.status, 400);
  assert.deepEqual(w.real, [], 'nothing was sent to the network');
});
