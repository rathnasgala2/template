/**
 * `routeSegmentForLabel` unit test requested by the S2-T06 reviewer (task
 * packet S2-T08's own instructions): two labels whose ASCII-stripped
 * prefixes collide must still produce distinct, stable route segments.
 * `"Alpha!"` and `"Alpha?"` both strip to the same readable prefix
 * (`"alpha"` — `!` and `?` are both non-`[a-z0-9]` separators
 * `asciiReadablePrefix` collapses identically), so only the appended content
 * hash can tell them apart.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { routeSegmentForLabel } from '../src/core/internal/route-labels.js';

test('routeSegmentForLabel: two labels with colliding ASCII-stripped prefixes produce distinct, stable segments', () => {
  const alphaBang = routeSegmentForLabel('Alpha!');
  const alphaQuestion = routeSegmentForLabel('Alpha?');

  assert.notEqual(
    alphaBang,
    alphaQuestion,
    '"Alpha!" and "Alpha?" must not collide on the same generated route',
  );
  assert.match(alphaBang, /^alpha-[0-9a-f]{10}$/);
  assert.match(alphaQuestion, /^alpha-[0-9a-f]{10}$/);

  // Stable: calling twice with the same label reproduces the same segment
  // (a content-hash function, not a stateful counter).
  assert.equal(routeSegmentForLabel('Alpha!'), alphaBang);
  assert.equal(routeSegmentForLabel('Alpha?'), alphaQuestion);
});

test('routeSegmentForLabel: two labels that strip to the same empty ASCII prefix also produce distinct segments', () => {
  const first = routeSegmentForLabel('!!!');
  const second = routeSegmentForLabel('???');
  assert.notEqual(first, second);
  assert.match(first, /^[0-9a-f]{10}$/);
  assert.match(second, /^[0-9a-f]{10}$/);
});
