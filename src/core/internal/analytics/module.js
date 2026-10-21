/**
 * Analytics, render side: validation of `build-input.modules.analytics`.
 * Consent and analytics are a core privacy setting (like the attribution
 * switch), not a module boundary; this file only checks the input's shape. The
 * enums and the measurement id pattern are re-checked here because this
 * renderer fails closed on its own.
 */

import { RenderPolicyViolationError } from '../../errors.js';
import { exactObject } from '../module-shape.js';

/** @type {string} */
const CONFIG_SCHEMA_ID = 'urn:gala:schema:analytics-config:2.0.0';
/** @type {readonly string[]} */
const PROVIDER_KINDS = Object.freeze(['google-analytics-4']);
/** @type {readonly string[]} */
const CONSENT_POLICIES = Object.freeze(['opt-in']);
const MEASUREMENT_ID = /^G-[A-Z0-9]{4,12}$/;

/**
 * Validate `build-input.modules.analytics`.
 *
 * @param {unknown} candidate the module selection value
 * @returns {import('../../../../types/index.d.ts').AnalyticsModule} the
 *   validated module
 */
export function validateAnalyticsModule(candidate) {
  const where = 'build-input.modules.analytics';
  const module = exactObject(candidate, ['config'], where);
  const config = exactObject(
    module.config,
    ['schemaId', 'schemaVersion', 'provider', 'consent'],
    `${where}.config`,
  );
  if (
    config.schemaId !== CONFIG_SCHEMA_ID ||
    config.schemaVersion !== '2.0.0'
  ) {
    throw new RenderPolicyViolationError(
      `${where}.config.schemaId must be ${CONFIG_SCHEMA_ID} with schemaVersion 2.0.0`,
    );
  }
  const provider = exactObject(
    config.provider,
    ['kind', 'measurementId'],
    `${where}.config.provider`,
  );
  if (
    typeof provider.kind !== 'string' ||
    !PROVIDER_KINDS.includes(provider.kind)
  ) {
    throw new RenderPolicyViolationError(
      `${where}.config.provider.kind must be one of ${PROVIDER_KINDS.join(', ')}`,
    );
  }
  if (
    typeof provider.measurementId !== 'string' ||
    !MEASUREMENT_ID.test(provider.measurementId)
  ) {
    throw new RenderPolicyViolationError(
      `${where}.config.provider.measurementId must match ${MEASUREMENT_ID.source}`,
    );
  }
  const consent = exactObject(
    config.consent,
    ['policy'],
    `${where}.config.consent`,
  );
  if (
    typeof consent.policy !== 'string' ||
    !CONSENT_POLICIES.includes(consent.policy)
  ) {
    throw new RenderPolicyViolationError(
      `${where}.config.consent.policy must be one of ${CONSENT_POLICIES.join(', ')}`,
    );
  }
  return /** @type {import('../../../../types/index.d.ts').AnalyticsModule} */ (
    /** @type {unknown} */ ({ config })
  );
}

/**
 * Whether the site carries consent and analytics: the module is present.
 *
 * @param {import('../../../../types/index.d.ts').AnalyticsModule | undefined} module
 *   the validated module, if any
 * @returns {boolean} whether the banner, footer button and script render
 */
export function analyticsActive(module) {
  return module !== undefined;
}
