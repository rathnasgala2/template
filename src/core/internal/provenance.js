/**
 * Shared validation for the caller-supplied `options.provenance` bundle
 * (see `src/core/manifest.js` module documentation for what it is and why
 * `build-input` alone cannot supply it).
 *
 * This check must run from `renderPublication`'s `assertOptions` before any
 * directory is created or Eleventy ever runs, so an incomplete provenance
 * bundle fails closed exactly like an invalid `build-input` does — nothing
 * is written. `src/core/manifest.js` also calls it directly as a defensive
 * second check at the point it actually consumes `provenance`, since it is
 * cheap and it is the module that most directly depends on the invariant.
 */

import { RenderOptionsError } from '../errors.js';

/**
 * Validate the caller-supplied provenance bundle is structurally present.
 * This is a shallow presence check, not schema validation: the assembled
 * manifest is itself schema-validated by `renderPublication` before being
 * returned, which is the authoritative check on the values' final shape.
 *
 * @param {import('../../../types/index.d.ts').RenderProvenance} provenance
 *   caller-supplied provenance bundle
 * @returns {void}
 */
export function assertProvenance(provenance) {
  if (!provenance || typeof provenance !== 'object') {
    throw new RenderOptionsError('options.provenance is required');
  }
  const required = /** @type {const} */ ([
    'builder',
    'repositoryCoordinate',
    'workflowIdentity',
    'buildToolVersions',
  ]);
  for (const field of required) {
    if (provenance[field] === undefined) {
      throw new RenderOptionsError(`options.provenance.${field} is required`);
    }
  }
  if (
    !Array.isArray(provenance.buildToolVersions) ||
    provenance.buildToolVersions.length < 9
  ) {
    throw new RenderOptionsError(
      'options.provenance.buildToolVersions must have at least 9 entries (build-tool-identity:2.0.0)',
    );
  }
}
