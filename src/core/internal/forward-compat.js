/**
 * Members the pinned schemas may not know yet.
 *
 * `@rathnasgala2/schemas` 3.32.0 adds three things this renderer reads: a
 * `application/pdf` entry in a document's `media[]`, `publication.
 * recommendations` and `modules.interactions.config.comments.likes`. The
 * renderer is released before that schema is pinned, and a closed schema
 * rejects what it does not know, so the schema validation sees the input
 * without them and the renderer validates them itself (the file entries here,
 * the other two where they are read: `recommendations.js`, `interactions.js`).
 * When the pin reaches 3.32.0 this step changes nothing a valid input can see.
 */

import { BuildInputValidationError } from '../errors.js';
import { FILE_MEDIA_TYPE } from './media/content-files.js';
import { MAX_CONTENT_FILE_BYTES } from './media/files.js';
import { readRecommendations } from './recommendations.js';

/**
 * @param {unknown} value any value
 * @returns {value is Record<string, any>} whether it is a plain object
 */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * @param {Record<string, any>} entry one `media[]` entry
 * @returns {boolean} whether it is a well-formed PDF entry
 */
function validPdfEntry(entry) {
  const keys = Object.keys(entry).sort().join(',');
  return (
    keys === 'byteLength,mediaType,path,sourceDigest' &&
    typeof entry.path === 'string' &&
    entry.path.length > 0 &&
    entry.path.length <= 512 &&
    !entry.path.startsWith('/') &&
    !entry.path.includes('\\') &&
    !entry.path.includes('\u0000') &&
    /\.pdf$/i.test(entry.path) &&
    typeof entry.sourceDigest === 'string' &&
    /^sha256:[0-9a-f]{64}$/.test(entry.sourceDigest) &&
    Number.isInteger(entry.byteLength) &&
    entry.byteLength >= 1 &&
    entry.byteLength <= MAX_CONTENT_FILE_BYTES
  );
}

/**
 * Remove the members above from a candidate build input for schema
 * validation, after checking them. The input itself is never changed.
 *
 * @param {unknown} buildInput the candidate `build-input:2.0.0`
 * @returns {unknown} the value to validate against the schema (the same
 *   object when there is nothing to remove)
 * @throws {BuildInputValidationError} for an invalid PDF entry
 * @throws {import('../errors.js').RenderPolicyViolationError} for invalid
 *   recommendations
 */
export function withoutForwardMembers(buildInput) {
  if (!isRecord(buildInput)) return buildInput;
  let result = buildInput;
  /** @type {Record<string, string>[]} */
  const diagnostics = [];

  if (Array.isArray(buildInput.content)) {
    let changed = false;
    const content = buildInput.content.map((record, index) => {
      if (!isRecord(record) || !Array.isArray(record.media)) return record;
      const kept = record.media.filter(
        (entry) => !(isRecord(entry) && entry.mediaType === FILE_MEDIA_TYPE),
      );
      if (kept.length === record.media.length) return record;
      for (const entry of record.media) {
        if (
          isRecord(entry) &&
          entry.mediaType === FILE_MEDIA_TYPE &&
          !validPdfEntry(entry)
        ) {
          diagnostics.push({
            code: 'MEDIA_FORMAT_INVALID',
            severity: 'ERROR',
            instancePointer: `/content/${index}/media`,
            actualValueClass: 'object',
            rule: 'template:content-file-entry',
            remediation: `A PDF entry (${String(entry.path)}) needs a repository path ending in .pdf, a sha256 sourceDigest and a byteLength from 1 to ${MAX_CONTENT_FILE_BYTES}.`,
          });
        }
      }
      changed = true;
      return { ...record, media: kept };
    });
    if (changed) result = { ...result, content };
  }
  if (diagnostics.length > 0) throw new BuildInputValidationError(diagnostics);

  const publication = buildInput.publication;
  if (isRecord(publication) && 'recommendations' in publication) {
    readRecommendations(publication.recommendations);
    const rest = { ...publication };
    delete rest.recommendations;
    result = { ...result, publication: rest };
  }

  const config = buildInput.modules?.interactions?.config;
  if (
    isRecord(config) &&
    isRecord(config.comments) &&
    'likes' in config.comments
  ) {
    const comments = { ...config.comments };
    delete comments.likes;
    result = {
      ...result,
      modules: {
        ...buildInput.modules,
        interactions: {
          ...buildInput.modules.interactions,
          config: { ...config, comments },
        },
      },
    };
  }
  return result;
}
