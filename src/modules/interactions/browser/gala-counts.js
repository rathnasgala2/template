/**
 * The public-counts browser script, emitted by the renderer as
 * `assets/gala-counts-v1.js` on pages that carry a count slot (post cards,
 * the home cover story and article headers) when the site shows reaction or
 * comment counts. A same-origin external file (CSP `script-src 'self'`),
 * loaded with `defer`. Plain ES2020, no dependencies, one IIFE.
 *
 * Configuration comes only from its own `<script>` tag: `data-api-origin` and
 * `data-publication-id`. It collects the `[data-gala-counts]` slots on the
 * page, asks the API once for all their posts (up to 50 per request; a page
 * never has more than a handful of requests):
 *
 *     GET {api}/v2/public/publications/{publicationId}/interaction-counts
 *         ?contentIds=<id>,<id>,...
 *     -> {items: [{contentId, reactions: PublicCount | null,
 *                  comments: PublicCount | null}]}
 *
 * and fills each slot with the figure the API returns, exactly as the article
 * page's own interactions script shows a `PublicCount`: `display` is the text
 * ("48", "1.2k", "99+" for a lower bound) and `label` the accessible name. A
 * `null` count shows nothing.
 *
 * Every slot is rendered `hidden` and stays hidden until filled, so it takes
 * no space and causes no layout shift; with JavaScript off, or on any failure
 * (network, timeout, a non-2xx status, a malformed body), the slots stay
 * hidden and the page is exactly as it was. Nothing here is required for
 * reading, and nothing throws out of the script.
 *
 * Security: API text reaches the DOM through `textContent` and
 * `setAttribute` only; no `innerHTML`, no cookies (`credentials: 'omit'`), no
 * third-party request.
 */

(function () {
  'use strict';

  const REQUEST_TIMEOUT_MS = 15000;
  /** The most posts one request may name. */
  const BATCH_LIMIT = 50;

  /**
   * @typedef {{lowerBound: number, display: string, label: string}} PublicCount
   * @typedef {{contentId: string, reactions?: PublicCount | null, comments?: PublicCount | null}} CountItem
   */

  const tag = /** @type {HTMLElement | null} */ (
    document.querySelector('script[data-api-origin][data-publication-id]')
  );
  if (!tag) return;
  const apiOrigin = String(tag.dataset.apiOrigin || '').replace(/\/+$/, '');
  const publicationId = tag.dataset.publicationId || '';
  if (!apiOrigin || !publicationId) return;

  /** @type {Map<string, HTMLElement[]>} slots by post id */
  const slotsById = new Map();
  for (const slot of Array.from(
    document.querySelectorAll('[data-gala-counts]'),
  )) {
    const id = slot.getAttribute('data-content-id');
    if (!id) continue;
    const list = slotsById.get(id);
    if (list) list.push(/** @type {HTMLElement} */ (slot));
    else slotsById.set(id, [/** @type {HTMLElement} */ (slot)]);
  }
  if (slotsById.size === 0) return;

  /**
   * One batched request. Any failure resolves to no items.
   *
   * @param {string[]} ids at most {@link BATCH_LIMIT} post ids
   * @returns {Promise<CountItem[]>} the items the API returned
   */
  async function fetchCounts(ids) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(
        apiOrigin +
          '/v2/public/publications/' +
          encodeURIComponent(publicationId) +
          '/interaction-counts?contentIds=' +
          ids.map(encodeURIComponent).join(','),
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
          mode: 'cors',
          credentials: 'omit',
          signal: controller.signal,
        },
      );
      if (!response.ok) return [];
      const body = await response.json();
      return body && Array.isArray(body.items) ? body.items : [];
    } catch {
      return [];
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Fill one kind's figure; hide it when the API has none to show.
   *
   * @param {HTMLElement} slot the post's count slot
   * @param {string} kind `reactions` or `comments`
   * @param {PublicCount | null | undefined} count
   * @returns {boolean} whether a figure is now showing
   */
  function fill(slot, kind, count) {
    const part = /** @type {HTMLElement | null} */ (
      slot.querySelector('[data-gala-count-kind="' + kind + '"]')
    );
    if (!part) return false;
    const value = part.querySelector('[data-gala-count-value]');
    if (
      !value ||
      !count ||
      typeof count.display !== 'string' ||
      count.display === ''
    ) {
      part.hidden = true;
      return false;
    }
    value.textContent = count.display;
    part.setAttribute('role', 'img');
    part.setAttribute(
      'aria-label',
      typeof count.label === 'string' && count.label
        ? count.label
        : count.display,
    );
    part.hidden = false;
    return true;
  }

  /** @param {CountItem} item */
  function apply(item) {
    if (!item || typeof item.contentId !== 'string') return;
    for (const slot of slotsById.get(item.contentId) || []) {
      const reactions = fill(slot, 'reactions', item.reactions);
      const comments = fill(slot, 'comments', item.comments);
      slot.hidden = !(reactions || comments);
    }
  }

  const ids = [...slotsById.keys()];
  for (let start = 0; start < ids.length; start += BATCH_LIMIT) {
    fetchCounts(ids.slice(start, start + BATCH_LIMIT)).then((items) => {
      for (const item of items) {
        try {
          apply(item);
        } catch {
          // One malformed item never blocks the others.
        }
      }
    });
  }
})();
