/**
 * Repository-tooling re-export of the renderer's own RFC 8785 canonicalizer.
 *
 * The implementation lives at `src/core/internal/canonical-jcs.js` so the
 * renderer adapter and these scripts share exactly one
 * canonicalization implementation. `src/` may not import `scripts/`
 * (`.dependency-cruiser.cjs`'s `runtime-does-not-import-repository-tooling`
 * rule), so the dependency runs the other way: this file re-exports from
 * `src/core/`.
 */

export { canonicalizeJcs } from '../src/core/internal/canonical-jcs.js';
