/**
 * `build-input.modules.analytics` validation (the renderer fails closed on its
 * own, whatever the schema admits) and the closed provider catalog.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  analyticsActive,
  validateAnalyticsModule,
} from '../src/core/internal/analytics/module.js';
import { ANALYTICS_PROVIDERS } from '../src/core/internal/analytics/providers.js';

/** @returns {any} a valid module selection (fresh each call) */
function moduleSelection() {
  return {
    config: {
      schemaId: 'urn:gala:schema:analytics-config:2.0.0',
      schemaVersion: '2.0.0',
      provider: { kind: 'google-analytics-4', measurementId: 'G-ABC123XYZ' },
      consent: { policy: 'opt-in' },
    },
  };
}

test('a valid analytics module is accepted and active', () => {
  const module = validateAnalyticsModule(moduleSelection());
  assert.equal(module.config.provider.measurementId, 'G-ABC123XYZ');
  assert.equal(analyticsActive(module), true);
  assert.equal(analyticsActive(undefined), false);
});

test('shape violations are rejected with RenderPolicyViolationError', () => {
  /** @type {[string, (value: any) => void][]} */
  const cases = [
    ['not an object', () => 'x'],
    ['extra module key', (v) => (v.extra = 1)],
    ['missing config', (v) => delete v.config],
    ['extra config key', (v) => (v.config.extra = 1)],
    ['wrong schemaId', (v) => (v.config.schemaId = 'urn:gala:schema:x:2.0.0')],
    ['wrong schemaVersion', (v) => (v.config.schemaVersion = '1.0.0')],
    ['unknown provider kind', (v) => (v.config.provider.kind = 'plausible')],
    [
      'inherited provider kind',
      (v) => (v.config.provider.kind = 'constructor'),
    ],
    [
      'lowercase measurement id',
      (v) => (v.config.provider.measurementId = 'G-abc123'),
    ],
    ['short measurement id', (v) => (v.config.provider.measurementId = 'G-AB')],
    [
      'long measurement id',
      (v) => (v.config.provider.measurementId = 'G-ABCDEFGHIJKLM'),
    ],
    ['non-string measurement id', (v) => (v.config.provider.measurementId = 5)],
    ['unknown consent policy', (v) => (v.config.consent.policy = 'opt-out')],
    ['extra consent key', (v) => (v.config.consent.extra = true)],
  ];
  for (const [label, mutate] of cases) {
    const candidate = moduleSelection();
    const replaced =
      label === 'not an object'
        ? mutate(candidate)
        : (mutate(candidate), candidate);
    assert.throws(
      () => validateAnalyticsModule(replaced),
      (error) =>
        error instanceof Error &&
        error.name === 'RenderPolicyViolationError' &&
        error.message.includes('build-input.modules.analytics'),
      label,
    );
  }
});

test('the GA4 catalog entry names exactly the documented sources', () => {
  const ga4 = ANALYTICS_PROVIDERS['google-analytics-4'];
  assert.deepEqual(ga4.scriptSources, ['https://www.googletagmanager.com']);
  assert.deepEqual(ga4.connectSources, [
    'https://*.analytics.google.com',
    'https://*.google-analytics.com',
    'https://*.googletagmanager.com',
  ]);
  assert.deepEqual(ga4.imageSources, [
    'https://*.google-analytics.com',
    'https://*.googletagmanager.com',
  ]);
  assert.equal(
    ga4.loaderUrl('G-ABC123XYZ'),
    'https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ',
  );
  assert.equal(ga4.name, 'Google Analytics 4 (Google LLC)');
});
