/**
 * Whether a document is still on the site at the build's moment.
 *
 * One predicate decides it for the whole build: a document is live unless its
 * `deleteDate` has come. `deleteDate` is a calendar day (`YYYY-MM-DD`), read
 * the way `publishAfter` is: whole days, no time of day. Galascribe reads that
 * day in the publication's staggered-release timezone, a platform setting the
 * build input does not carry, so the renderer compares it with the UTC day of
 * `buildEpoch`: a document whose `deleteDate` is today or earlier (UTC) is
 * removed. The platform republishes at the start of that day in the author's
 * timezone, so for an author west of UTC the build already sits on the
 * `deleteDate` day in UTC; for one east of UTC the removal lands with the first
 * build once the UTC day arrives.
 *
 * {@link splitLiveContent} runs once, before anything is rendered, and hands
 * every later step only the live records. A removed record therefore cannot
 * reach a listing, feed, sitemap, search index, `llms` file, `posts.json`,
 * related/series/tag/author/language section; its own route renders a
 * removed-post notice instead (`internal/tombstone.js`). Each translation obeys
 * its own `deleteDate`, so removing the article in the default language does
 * not remove its translations.
 */

/**
 * @typedef {import('../../../types/index.d.ts').ContentBuildRecord} ContentBuildRecord
 */

/**
 * @param {string} buildEpoch the build input's RFC 3339 `buildEpoch`
 * @returns {string} the UTC calendar day of the build, `YYYY-MM-DD`
 */
export function buildDay(buildEpoch) {
  return new Date(buildEpoch).toISOString().slice(0, 10);
}

/**
 * The one "is this document still live" predicate.
 *
 * @param {{deleteDate?: string}} frontmatter a record's front matter
 * @param {string} day the build's UTC day ({@link buildDay})
 * @returns {boolean} false once the record's `deleteDate` has come
 */
export function isLive(frontmatter, day) {
  return frontmatter.deleteDate === undefined || frontmatter.deleteDate > day;
}

/**
 * @typedef {object} LiveSplit
 * @property {ContentBuildRecord[]} live the records still on the site
 * @property {ContentBuildRecord[]} removed the articles and pages whose
 *   `deleteDate` has come: each renders a removed-post notice
 * @property {ContentBuildRecord[]} removedRoots the removed articles that are
 *   not translations; a live translation of one still resolves its group
 */

/**
 * @param {readonly ContentBuildRecord[]} content the build input's `content[]`
 * @param {string} buildEpoch the build input's `buildEpoch`
 * @returns {LiveSplit} the live records and the removed ones. An edition of a
 *   removed article is dropped with it (it has no page of its own to show).
 */
export function splitLiveContent(content, buildEpoch) {
  const day = buildDay(buildEpoch);
  /** @type {ContentBuildRecord[]} */
  const live = [];
  /** @type {ContentBuildRecord[]} */
  const removed = [];
  /** @type {ContentBuildRecord[]} */
  const dropped = [];
  for (const record of content) {
    if (isLive(record.frontmatter, day)) live.push(record);
    else if (record.frontmatter.kind === 'edition') dropped.push(record);
    else removed.push(record);
  }
  if (removed.length === 0 && dropped.length === 0) {
    return { live, removed, removedRoots: [] };
  }
  const removedSlugs = new Set(
    removed
      .filter((record) => record.frontmatter.kind === 'article')
      .map((record) => record.frontmatter.slug),
  );
  const kept = live.filter(
    (record) =>
      record.frontmatter.kind !== 'edition' ||
      !removedSlugs.has(record.frontmatter.edition?.of ?? ''),
  );
  return {
    live: kept,
    removed,
    removedRoots: removed.filter(
      (record) =>
        record.frontmatter.kind === 'article' &&
        !record.frontmatter.translationOf,
    ),
  };
}
