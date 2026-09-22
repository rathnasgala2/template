/**
 * Collect the distinct source records this renderer actually consumed from
 * a validated `build-input:2.0.0` instance, as
 * `manifestIncludedSource[]` rows (DEC-097 section 6: "`includedSources` has
 * set equality with the distinct source records placed in the
 * verified-input carrier ... a file used by multiple records appears once
 * and the role is the earliest value in the enum order").
 */

/** @type {readonly string[]} */
const ROLE_PRIORITY = Object.freeze([
  'publication',
  'author',
  'content',
  'navigation',
  'appearance',
  'asset',
]);

/**
 * @param {string} role a `manifestIncludedSource.role` value
 * @returns {number} its position in the enum priority order
 */
function rolePriority(role) {
  const index = ROLE_PRIORITY.indexOf(role);
  return index === -1 ? ROLE_PRIORITY.length : index;
}

/**
 * Collect every distinct `{path, sha256, sourceRevision, role}` row this
 * renderer read out of `buildInput`, deduplicated by path with the
 * earliest-enum role kept on collision.
 *
 * @param {import('../../../types/index.d.ts').NormalizedBuildInput} buildInput
 *   the validated build input
 * @returns {import('../../../types/index.d.ts').ManifestIncludedSourceEntry[]}
 *   the unique-by-path row set, sorted by UTF-8 path bytes
 */
export function collectIncludedSources(buildInput) {
  /** @type {Map<string, import('../../../types/index.d.ts').ManifestIncludedSourceEntry>} */
  const byPath = new Map();

  /**
   * @param {string | undefined} path repository-relative path
   * @param {string | undefined} sha256 tagged digest
   * @param {import('../../../types/index.d.ts').ManifestIncludedSourceEntry['role']} role
   *   manifestIncludedSource role
   * @param {string} sourceRevision the record's own source revision, when
   *   known; falls back to the root `sourceRevision`
   * @returns {void}
   */
  const record = (path, sha256, role, sourceRevision) => {
    if (!path || !sha256) return;
    const existing = byPath.get(path);
    if (existing && rolePriority(existing.role) <= rolePriority(role)) return;
    byPath.set(path, { path, sha256, sourceRevision, role });
  };

  const rootRevision = buildInput.sourceRevision;

  record(
    buildInput.publication.sourcePath,
    buildInput.publication.sourceDigest,
    'publication',
    rootRevision,
  );
  recordResolvedFile(record, buildInput.publication.defaultImage, rootRevision);

  for (const author of buildInput.authors) {
    record(author.sourcePath, author.sourceDigest, 'author', rootRevision);
    recordResolvedFile(record, author.avatar, rootRevision);
  }

  for (const contentRecord of buildInput.content) {
    record(
      contentRecord.sourcePath,
      contentRecord.sourceDigest,
      'content',
      contentRecord.sourceRevision,
    );
    if (contentRecord.frontmatter.hero) {
      recordResolvedFile(
        record,
        contentRecord.frontmatter.hero.file,
        contentRecord.sourceRevision,
      );
    }
    recordResolvedFile(
      record,
      contentRecord.frontmatter.socialImage,
      contentRecord.sourceRevision,
    );
  }

  if (buildInput.navigation.source.kind === 'authored') {
    record(
      buildInput.navigation.source.sourcePath,
      buildInput.navigation.source.sourceDigest,
      'navigation',
      rootRevision,
    );
  }

  if (buildInput.appearance.source.kind === 'authored') {
    record(
      buildInput.appearance.source.sourcePath,
      buildInput.appearance.source.sourceDigest,
      'appearance',
      rootRevision,
    );
  }
  recordResolvedFile(record, buildInput.appearance.brandMark, rootRevision);
  recordResolvedFile(record, buildInput.appearance.wordmark, rootRevision);
  for (const fontAsset of buildInput.appearance.fontAssets ?? []) {
    recordResolvedFile(record, fontAsset, rootRevision);
  }

  return [...byPath.values()].sort((a, b) => compareUtf8Bytes(a.path, b.path));
}

/**
 * @param {(path: string | undefined, sha256: string | undefined, role: import('../../../types/index.d.ts').ManifestIncludedSourceEntry['role'], sourceRevision: string) => void} record
 *   the accumulator closure from {@link collectIncludedSources}
 * @param {{path?: string, sourceDigest?: string} | undefined} resolvedFile
 *   a `resolvedFile`-shaped reference, if present
 * @param {string} sourceRevision the owning record's source revision
 * @returns {void}
 */
function recordResolvedFile(record, resolvedFile, sourceRevision) {
  if (!resolvedFile) return;
  record(resolvedFile.path, resolvedFile.sourceDigest, 'asset', sourceRevision);
}

/**
 * Compare two strings by their UTF-8 byte sequence, ascending.
 *
 * @param {string} a first path
 * @param {string} b second path
 * @returns {number} negative, zero or positive per `Array#sort` contract
 */
export function compareUtf8Bytes(a, b) {
  const bytesA = Buffer.from(a, 'utf8');
  const bytesB = Buffer.from(b, 'utf8');
  return Buffer.compare(bytesA, bytesB);
}
