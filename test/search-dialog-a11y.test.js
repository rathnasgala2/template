/**
 * Search dialog accessibility: the combobox/listbox result items must not
 * nest a focusable element inside an interactive role (axe
 * `nested-interactive`), and aria-activedescendant must reference the element
 * that carries role="option" and aria-selected.
 */
import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { JSDOM } from 'jsdom';

import { APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE } from '../src/core/internal/appearance/bootstrap-script.js';

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';
const INTERACTIVE =
  '[role="option"], [role="button"], [role="link"], [role="menuitem"], a[href], button, [tabindex]';

async function openSearch() {
  const dom = new JSDOM(
    '<!doctype html><html><body><button data-action="search" data-search-index="/s.json" hidden></button></body></html>',
    { runScripts: 'dangerously', url: 'https://fixture.example.test/' },
  );
  const { window } = dom;
  window.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });
  window.HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  window.HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
  window.Element.prototype.scrollIntoView = () => {};
  window.fetch = async () => ({
    ok: true,
    json: async () => ({
      documents: [
        { title: 'Alpha', route: '/alpha/', tags: ['x'], description: 'first' },
        { title: 'Beta', route: '/beta/', publishedAt: '2020-01-01' },
      ],
    }),
  });
  window.eval(APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  window.document.querySelector('[data-action="search"]').click();
  await new Promise((resolve) => setTimeout(resolve, 20));
  return window;
}

test('search results: no interactive element contains another focusable element', async () => {
  const { document } = await openSearch();
  const items = document.querySelectorAll('.g-search-results > li');
  assert.ok(items.length >= 2, 'results are rendered');
  for (const item of items) {
    for (const node of [item, ...item.querySelectorAll('*')]) {
      if (!node.matches(INTERACTIVE)) continue;
      assert.equal(
        node.querySelectorAll(FOCUSABLE).length,
        0,
        `<${node.localName}> is interactive and must not contain focusable descendants`,
      );
    }
  }
});

test('search results: aria-activedescendant references the element carrying role=option and aria-selected', async () => {
  const { document } = await openSearch();
  const input = document.querySelector('.g-search-input');
  const active = document.getElementById(
    input.getAttribute('aria-activedescendant'),
  );
  assert.ok(active, 'activedescendant resolves');
  assert.equal(active.getAttribute('role'), 'option');
  assert.equal(active.getAttribute('aria-selected'), 'true');
  assert.equal(active.getAttribute('href') !== null, true);
  for (const li of document.querySelectorAll('.g-search-results > li')) {
    assert.equal(li.getAttribute('role'), 'presentation');
    assert.equal(li.hasAttribute('aria-selected'), false);
  }
});

test('search results: arrow keys move aria-selected and Enter opens the active hit', async () => {
  const window = await openSearch();
  const { document } = window;
  const input = document.querySelector('.g-search-input');
  input.dispatchEvent(
    new window.KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    }),
  );
  const options = [...document.querySelectorAll('[role="option"]')];
  assert.deepEqual(
    options.map((o) => o.getAttribute('aria-selected')),
    ['false', 'true'],
  );
  assert.equal(input.getAttribute('aria-activedescendant'), options[1].id);
  const event = new window.KeyboardEvent('keydown', {
    key: 'Enter',
    bubbles: true,
    cancelable: true,
  });
  input.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
});
