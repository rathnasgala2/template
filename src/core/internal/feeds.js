/**
 * RSS 2.0 and Atom 1.0 feed generation.
 *
 * Both feeds are built from the exact same {@link selectPublishedArticles}
 * selection and ordering `internal/page-kinds.js`'s `index` page kind
 * paginates (most recently published first, `publishedAt` descending, tied
 * broken by ascending `id`), so a feed's item order can never drift from the
 * site's own index listing. Every URL is an absolute `https://` URL resolved
 * against `buildInput.baseUrl` — always the build input's public origin,
 * never a relative path — since a feed reader has no notion of the
 * publication's own base path to resolve a relative URL against.
 *
 * Item count: this renderer's build input carries no maximum feed item
 * count. This module bounds it at {@link FEED_ITEM_LIMIT} — a conservative,
 * deterministic default with no author-facing configuration surface,
 * matching this renderer's own established style for an unspecified
 * numeric bound (see `internal/page-kinds.js`'s `LISTING_PAGE_SIZE` and the
 * media pipeline scope decisions in the package README).
 */

import { escapeHtml, unescapeHtml } from './skeleton.js';
import { derivePublicBasePath, joinPublicRoute } from './route.js';
import { deriveAuthorSlugs } from './route-labels.js';
import {
  contentLastModified,
  contentRoute,
  selectPublishedArticles,
} from './page-kinds.js';

/** @type {number} */
export const FEED_ITEM_LIMIT = 50;

/** @type {string} the un-joined route the Atom feed is published at. */
export const ATOM_FEED_ROUTE = '/feed/atom.xml';
/** @type {string} the un-joined route the RSS feed is published at. */
export const RSS_FEED_ROUTE = '/feed/rss.xml';

/**
 * Format an `rfc3339` (`YYYY-MM-DDTHH:mm:ss.000Z`) timestamp as RFC 822/1123
 * text, the pubDate grammar RSS 2.0 requires. `Date#toUTCString()` always
 * emits the fixed-width, zero-padded, `GMT`-suffixed form this needs,
 * deterministically, from a deterministic input.
 *
 * @param {string} rfc3339 a validated `rfc3339` timestamp
 * @returns {string} an RFC 822/1123 date-time string
 */
function toRfc822(rfc3339) {
  return new Date(rfc3339).toUTCString();
}

/**
 * Make every `href`/`src` in an article body absolute against the article's
 * own URL: a feed reader renders the body away from the site, so a relative
 * link or image would otherwise point nowhere.
 *
 * @param {string} bodyHtml sanitized body HTML
 * @param {string} pageUrl the article's absolute URL
 * @returns {string} the body with absolute links and image sources
 */
export function absolutizeBodyLinks(bodyHtml, pageUrl) {
  return bodyHtml.replace(
    /\b(href|src)="([^"]*)"/g,
    (match, attribute, value) => {
      try {
        return `${attribute}="${escapeHtml(new URL(unescapeHtml(value), pageUrl).toString())}"`;
      } catch {
        return match;
      }
    },
  );
}

/**
 * Wrap text in a CDATA section, splitting any `]]>` it contains so the
 * section can never be closed early.
 *
 * @param {string} text
 * @returns {string}
 */
function cdata(text) {
  return `<![CDATA[${text.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
}

/**
 * Build the deterministic Atom 1.0 and RSS 2.0 feed documents for one
 * validated `build-input:2.0.0` instance.
 *
 * @param {import('../../../types/index.d.ts').NormalizedBuildInput} validatedInput
 * @param {object} options feed options
 * @param {(body: string) => string} options.feedBody turns an article body
 *   into its feed form (every image naming its media derivative)
 * @returns {{atomXml: string, rssXml: string, atomSelfUrl: string, rssSelfUrl: string}}
 *   both feed documents' exact UTF-8 text, plus each feed's own absolute
 *   self URL (for the shared layout's feed-discovery `<link>` tags)
 */
export function buildFeeds(validatedInput, { feedBody }) {
  const { publication, authors, content, basePath, baseUrl } = validatedInput;
  const authorsById = new Map(authors.map((author) => [author.id, author]));
  const authorSlugs = deriveAuthorSlugs(authors);
  const articles = selectPublishedArticles(content).slice(0, FEED_ITEM_LIMIT);

  /**
   * @param {string} route an un-joined route
   * @returns {string} the absolute `https://` URL
   */
  const absoluteUrl = (route) =>
    new URL(
      joinPublicRoute(derivePublicBasePath(baseUrl, basePath), route),
      baseUrl,
    ).toString();

  const siteUrl = absoluteUrl('/');
  const atomSelfUrl = absoluteUrl(ATOM_FEED_ROUTE);
  const rssSelfUrl = absoluteUrl(RSS_FEED_ROUTE);

  const feedUpdated =
    articles.length > 0
      ? contentLastModified(articles[0].frontmatter)
      : validatedInput.buildEpoch;

  const atomEntries = articles
    .map((record) => {
      const { frontmatter } = record;
      const entryUrl = absoluteUrl(contentRoute(frontmatter));
      const authorsXml = frontmatter.authorIds
        .map((id) => {
          const author = authorsById.get(id);
          const uri = author
            ? `<uri>${escapeHtml(absoluteUrl(`/authors/${authorSlugs.get(id) ?? id}`))}</uri>`
            : '';
          return `<author><name>${escapeHtml(author?.displayName ?? '')}</name>${uri}</author>`;
        })
        .join('');
      const categoriesXml = frontmatter.tags
        .map((tag) => `<category term="${escapeHtml(tag)}"/>`)
        .join('');
      const contentXml = `<content type="html">${escapeHtml(absolutizeBodyLinks(feedBody(record.body), entryUrl))}</content>`;
      const summaryXml = frontmatter.description
        ? `<summary>${escapeHtml(frontmatter.description)}</summary>`
        : '';
      return (
        `<entry>` +
        `<id>${escapeHtml(entryUrl)}</id>` +
        `<title>${escapeHtml(frontmatter.title)}</title>` +
        `<updated>${escapeHtml(contentLastModified(frontmatter))}</updated>` +
        `<published>${escapeHtml(frontmatter.publishedAt)}</published>` +
        `<link href="${escapeHtml(entryUrl)}" rel="alternate"/>` +
        authorsXml +
        categoriesXml +
        summaryXml +
        contentXml +
        `</entry>`
      );
    })
    .join('');

  const atomXml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<feed xmlns="http://www.w3.org/2005/Atom">' +
    `<id>${escapeHtml(siteUrl)}</id>` +
    `<title>${escapeHtml(publication.title)}</title>` +
    `<subtitle>${escapeHtml(publication.description)}</subtitle>` +
    `<updated>${escapeHtml(feedUpdated)}</updated>` +
    `<link href="${escapeHtml(atomSelfUrl)}" rel="self"/>` +
    `<link href="${escapeHtml(siteUrl)}" rel="alternate"/>` +
    atomEntries +
    '</feed>\n';

  const rssItems = articles
    .map((record) => {
      const { frontmatter } = record;
      const itemUrl = absoluteUrl(contentRoute(frontmatter));
      const descriptionXml = frontmatter.description
        ? `<description>${escapeHtml(frontmatter.description)}</description>`
        : '';
      const creatorsXml = frontmatter.authorIds
        .map((id) => authorsById.get(id)?.displayName)
        .filter(Boolean)
        .map((name) => `<dc:creator>${escapeHtml(String(name))}</dc:creator>`)
        .join('');
      const categoriesXml = frontmatter.tags
        .map((tag) => `<category>${escapeHtml(tag)}</category>`)
        .join('');
      return (
        `<item>` +
        `<title>${escapeHtml(frontmatter.title)}</title>` +
        `<link>${escapeHtml(itemUrl)}</link>` +
        `<guid isPermaLink="true">${escapeHtml(itemUrl)}</guid>` +
        `<pubDate>${escapeHtml(toRfc822(frontmatter.publishedAt))}</pubDate>` +
        creatorsXml +
        categoriesXml +
        descriptionXml +
        `<content:encoded>${cdata(absolutizeBodyLinks(feedBody(record.body), itemUrl))}</content:encoded>` +
        `</item>`
      );
    })
    .join('');

  // `atom:link rel="self"` is RSS 2.0's own de-facto self-discovery
  // convention (no equivalent element exists in the bare RSS 2.0
  // vocabulary itself), requiring the `atom` namespace declaration on the
  // root `<rss>` element — the same self-discovery guarantee the Atom feed
  // above already gets from its native `<link rel="self">` (independent
  // review request).
  const rssXml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">' +
    '<channel>' +
    `<title>${escapeHtml(publication.title)}</title>` +
    `<link>${escapeHtml(siteUrl)}</link>` +
    `<description>${escapeHtml(publication.description)}</description>` +
    `<lastBuildDate>${escapeHtml(toRfc822(feedUpdated))}</lastBuildDate>` +
    `<atom:link href="${escapeHtml(rssSelfUrl)}" rel="self" type="application/rss+xml"/>` +
    rssItems +
    '</channel>' +
    '</rss>\n';

  return { atomXml, rssXml, rssSelfUrl, atomSelfUrl };
}
