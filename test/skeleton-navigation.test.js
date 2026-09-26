/**
 * TPL-M3 acceptance test: `renderPrimaryNavigation`'s documented return
 * value matches its actual behaviour — it always renders a `<nav>` landmark,
 * even with no authored items.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { renderPrimaryNavigation } from '../src/core/internal/skeleton.js';
import { getMessages } from '../src/core/internal/messages.js';

test('renderPrimaryNavigation renders a labelled, empty <nav> landmark when there are no authored items', () => {
  const html = renderPrimaryNavigation({
    items: [],
    currentRoute: undefined,
    messages: getMessages('en'),
  });
  assert.notEqual(html, '');
  assert.match(html, /^<nav aria-label="[^"]+"><ul><\/ul><\/nav>$/);
});
