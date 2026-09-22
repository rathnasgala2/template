import { createHash } from 'node:crypto';

/**
 * Fixed timestamp substituted for `metadata.timestamp` so the committed SBOM
 * does not change on every `sbom:generate` run. `cyclonedx-npm` derives every
 * other field deterministically from `package.json` and `package-lock.json`;
 * only `serialNumber` (a fresh random UUID per run) and `metadata.timestamp`
 * (wall-clock generation time) are non-deterministic, and both are pure
 * generation metadata rather than a fact about the described dependency
 * graph.
 *
 * @type {string}
 */
export const SBOM_FIXED_TIMESTAMP = '2000-01-01T00:00:00Z';

/**
 * Derive a stable, syntactically valid `urn:uuid:` serial number from the
 * package identity so repeated generations of the same
 * `package.json`/`package-lock.json` pair produce the same SBOM bytes.
 *
 * @param {string} name package name
 * @param {string} version package version
 * @returns {string} a `urn:uuid:`-prefixed deterministic identifier
 */
export function deterministicSerialNumber(name, version) {
  const hash = createHash('sha256')
    .update(`gala-sbom-serial-number-v1\0${name}@${version}`, 'utf8')
    .digest('hex');
  const uuid = [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `a${hash.slice(17, 20)}`,
    hash.slice(20, 32),
  ].join('-');
  return `urn:uuid:${uuid}`;
}

/**
 * Replace the two non-deterministic fields of a CycloneDX document
 * (`serialNumber` and `metadata.timestamp`) with values derived only from
 * the document's own package identity, leaving every other field untouched.
 *
 * @param {Record<string, unknown>} document parsed `sbom.cdx.json` content
 * @param {{name: string, version: string}} packageIdentity the described
 *   root package's name and version
 * @returns {Record<string, unknown>} a new object with normalized fields
 */
export function normalizeSbomDocument(document, packageIdentity) {
  const normalized = { ...document };
  normalized.serialNumber = deterministicSerialNumber(
    packageIdentity.name,
    packageIdentity.version,
  );
  const metadata = document.metadata;
  if (metadata && typeof metadata === 'object') {
    normalized.metadata = {
      ...metadata,
      timestamp: SBOM_FIXED_TIMESTAMP,
    };
  }
  return normalized;
}

/**
 * Serialize a normalized SBOM document exactly as `cyclonedx-npm` does: two
 * -space indentation and no trailing newline.
 *
 * @param {Record<string, unknown>} document normalized document
 * @returns {string} canonical file content
 */
export function serializeSbomDocument(document) {
  return JSON.stringify(document, null, 2);
}
