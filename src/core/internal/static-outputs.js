/**
 * The site's small machine-readable outputs, all built from the repository
 * and the build input alone (nothing is stored on Galascribe, nothing is
 * fetched at run time):
 *
 * - `<route>index.md`: a live article's Markdown, as the author wrote it,
 *   behind a short front matter ({@link buildArticleMarkdown});
 * - `/posts.json`: every live article, one object each ({@link buildPostsJson});
 * - `/version.json` and the `/version/` page: what built the site
 *   ({@link buildVersionInfo}).
 *
 * The build input carries each article's body as rendered HTML, not as
 * Markdown. The Markdown is read from the author's repository file
 * (`record.sourcePath` under `options.sourceDirectory`, the same tree the media
 * pipeline reads) and used only when its bytes hash to the record's
 * `sourceDigest`; a missing or changed file simply yields no `index.md` for
 * that article, never a wrong one.
 */

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { plainTextExcerpt } from './search-index.js';
import { compareUtf8Bytes } from './source-inventory.js';
import {
  contentLastModified,
  contentRoute,
  isSeoNoindex,
  selectPublishedArticles,
} from './page-kinds.js';

/**
 * @typedef {import('../../../types/index.d.ts').ContentBuildRecord} ContentBuildRecord
 */

/**
 * The route of an article's Markdown twin.
 *
 * @param {string} route the article's un-joined route
 * @param {import('./route.js').RouteNormalizationProfile} profile
 * @returns {string} `<route>/index.md` under `directory-index`, else
 *   `<route>.md`; `/index.md` for the site root
 */
export function markdownRoute(route, profile) {
  const bare = route.replace(/\/+$/, '');
  return profile === 'directory-index' ? `${bare}/index.md` : `${bare}.md`;
}

/**
 * The text after a document's closing front matter fence, exactly as the
 * publish step splits it (`---` on the first line, the next `---` line closes;
 * leading blank lines of the body dropped).
 *
 * @param {string} text a whole document
 * @returns {string | undefined} the Markdown body, or `undefined` when the
 *   document has no front matter fence
 */
export function markdownBodyOf(text) {
  const lines = text.split('\n');
  if (lines[0] !== '---') return undefined;
  const closing = lines.indexOf('---', 1);
  if (closing === -1) return undefined;
  return lines
    .slice(closing + 1)
    .join('\n')
    .replace(/^\n+/u, '');
}

/**
 * Read an article's Markdown body from the repository tree.
 *
 * @param {string} sourceDirectory the caller-mounted repository root
 * @param {ContentBuildRecord} record an article
 * @returns {Promise<string | undefined>} the body, or `undefined` when the
 *   file is missing, outside the tree, not the file the build input digested,
 *   or has no front matter fence
 */
export async function readMarkdownBody(sourceDirectory, record) {
  const root = path.resolve(sourceDirectory) + path.sep;
  const resolved = path.resolve(sourceDirectory, record.sourcePath);
  if (!resolved.startsWith(root)) return undefined;
  let bytes;
  try {
    bytes = await readFile(resolved);
  } catch {
    return undefined;
  }
  const digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
  if (digest !== record.sourceDigest) return undefined;
  return markdownBodyOf(bytes.toString('utf8'));
}

/**
 * @param {ContentBuildRecord} record an article
 * @param {string} canonicalUrl its absolute canonical URL
 * @param {string} body the author's Markdown body
 * @returns {string} the `index.md` text: a small front matter, then the body
 */
export function buildArticleMarkdown(record, canonicalUrl, body) {
  const { frontmatter } = record;
  const fields = [
    `title: ${JSON.stringify(frontmatter.title)}`,
    `date: ${JSON.stringify(frontmatter.publishedAt)}`,
    ...(frontmatter.updatedAt
      ? [`updated: ${JSON.stringify(frontmatter.updatedAt)}`]
      : []),
    `language: ${JSON.stringify(frontmatter.language)}`,
    ...(frontmatter.tags.length > 0
      ? [`tags: ${JSON.stringify(frontmatter.tags)}`]
      : []),
    `canonical: ${JSON.stringify(canonicalUrl)}`,
  ];
  return `---\n${fields.join('\n')}\n---\n\n${body}${body.endsWith('\n') ? '' : '\n'}`;
}

/**
 * `posts.json`: every live, indexable article, newest first. `markdownUrl`
 * is present only for an article that has an `index.md`.
 *
 * @param {readonly ContentBuildRecord[]} content the live records
 * @param {object} options
 * @param {(route: string) => string} options.absoluteUrl a route's absolute URL
 * @param {ReadonlySet<ContentBuildRecord>} options.withMarkdown articles that
 *   have an `index.md`
 * @param {import('./route.js').RouteNormalizationProfile} options.routeProfile
 * @param {string} options.buildEpoch
 * @returns {string} the exact `posts.json` text
 */
export function buildPostsJson(
  content,
  { absoluteUrl, withMarkdown, routeProfile, buildEpoch },
) {
  const posts = selectPublishedArticles(content)
    .filter((record) => !isSeoNoindex(record.frontmatter))
    .map((record) => {
      const { frontmatter } = record;
      const route = contentRoute(frontmatter);
      return {
        slug: frontmatter.slug,
        title: frontmatter.title,
        url: absoluteUrl(route),
        ...(withMarkdown.has(record)
          ? { markdownUrl: absoluteUrl(markdownRoute(route, routeProfile)) }
          : {}),
        date: frontmatter.publishedAt,
        updated: contentLastModified(frontmatter),
        language: frontmatter.language,
        ...(frontmatter.translationOf
          ? { translationOf: frontmatter.translationOf }
          : {}),
        tags: [...frontmatter.tags],
        summary: frontmatter.description || plainTextExcerpt(record.body),
      };
    })
    .sort((a, b) =>
      a.date !== b.date
        ? a.date < b.date
          ? 1
          : -1
        : compareUtf8Bytes(a.url, b.url),
    );
  return `${JSON.stringify({ schemaVersion: '1', generatedAt: buildEpoch, posts })}\n`;
}

/**
 * What built the site, from values the build really knows. A value the build
 * input does not carry is left out.
 *
 * @param {import('../../../types/index.d.ts').NormalizedBuildInput} input
 * @param {string} templateVersion this renderer's version
 * @returns {{schemaVersion: '1', template: {package: string, version: string}, schemas?: {package: string, version: string}, theme?: {package: string, version: string}, toolchain: {package: string, version: string}[], sourceCommit?: string, builtAt: string}}
 */
export function buildVersionInfo(input, templateVersion) {
  /** @type {any} */
  const packages = input.packages ?? {};
  /**
   * @param {any} identity
   * @returns {{package: string, version: string} | undefined}
   */
  const identify = (identity) =>
    identity &&
    typeof identity.package === 'string' &&
    typeof identity.version === 'string'
      ? { package: identity.package, version: identity.version }
      : undefined;
  const schemas = identify(packages.schemas);
  const theme = identify(packages.theme);
  const toolchain = (
    Array.isArray(packages.publisher) ? packages.publisher : []
  )
    .map(identify)
    .filter(Boolean);
  const commit =
    typeof input.sourceRevision === 'string'
      ? input.sourceRevision.replace(/^sha(?:1|256):/u, '')
      : undefined;
  return {
    schemaVersion: '1',
    template: { package: '@rathnasgala2/template', version: templateVersion },
    ...(schemas ? { schemas } : {}),
    ...(theme ? { theme } : {}),
    toolchain,
    ...(commit ? { sourceCommit: commit } : {}),
    builtAt: input.buildEpoch,
  };
}
