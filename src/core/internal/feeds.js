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
import { PODCAST_FEED_ROUTE } from './podcast.js';
import {
  contentLastModified,
  contentRoute,
  isSeoNoindex,
  selectPublishedArticles,
} from './page-kinds.js';

/**
 * @typedef {object} LanguageFeed
 * @property {string} language the language's BCP-47 tag
 * @property {string} atomRoute un-joined route of the Atom feed
 * @property {string} rssRoute un-joined route of the RSS feed
 * @property {string} atomXml
 * @property {string} rssXml
 * @property {string} atomSelfUrl
 * @property {string} rssSelfUrl
 */

/** @type {number} */
export const FEED_ITEM_LIMIT = 50;

/** @type {string} the un-joined route the Atom feed is published at. */
export const ATOM_FEED_ROUTE = '/feed/atom.xml';
/** @type {string} the un-joined route the podcast feed is published at. */
export { PODCAST_FEED_ROUTE };
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
 * @param {import('./route.js').RouteNormalizationProfile} options.routeProfile
 *   the route normalization profile deciding each link's and id's public form
 * @param {import('./translations.js').TranslationResolution} [options.translations]
 *   the language-variant resolution: the default feeds then list a group of
 *   variants once (its primary), and each non-default language gets its own
 *   pair of feeds
 * @param {{config: import('./podcast.js').PodcastConfig, entries: readonly import('./listen.js').ListenEntry[], coverUrl?: string}} [options.podcast]
 *   the podcast feed: its settings, every published article with Listen audio
 *   (newest first) and the cover's absolute URL (not needed without entries)
 * @param {boolean} [options.selfUrlsOnly] build the feeds without entries: the
 *   self URLs (and so every page's feed-discovery links) are the same, the
 *   documents are not wanted (the article preview)
 * @returns {{atomXml: string, rssXml: string, atomSelfUrl: string, rssSelfUrl: string, podcastXml?: string, podcastSelfUrl?: string, languageFeeds: LanguageFeed[]}}
 *   both feed documents' exact UTF-8 text, plus each feed's own absolute
 *   self URL (for the shared layout's feed-discovery `<link>` tags), plus one
 *   {@link LanguageFeed} per non-default language (empty without
 *   translations)
 */
export function buildFeeds(
  validatedInput,
  { feedBody, routeProfile, translations, podcast, selfUrlsOnly = false },
) {
  const { publication, authors, content, basePath, baseUrl } = validatedInput;
  const authorsById = new Map(authors.map((author) => [author.id, author]));
  const authorSlugs = deriveAuthorSlugs(authors);
  // `seo.noindex` articles stay on the site but out of the feeds.
  const feedable = selectPublishedArticles(content).filter(
    (record) => !isSeoNoindex(record.frontmatter),
  );
  const articles = feedable
    .filter((record) => translations?.isListed(record) ?? true)
    .slice(0, FEED_ITEM_LIMIT);

  /**
   * @param {string} route an un-joined route
   * @returns {string} the absolute `https://` URL
   */
  const absoluteUrl = (route) =>
    new URL(
      joinPublicRoute(
        derivePublicBasePath(baseUrl, basePath),
        route,
        routeProfile,
      ),
      baseUrl,
    ).toString();

  /**
   * @param {typeof articles} articles the feed's entries, newest first
   * @param {string} atomRoute
   * @param {string} rssRoute
   * @param {string} [language] the feed's language, when it has one of its own
   * @returns {{atomXml: string, rssXml: string, atomSelfUrl: string, rssSelfUrl: string}}
   */
  const buildPair = (articles, atomRoute, rssRoute, language) => {
    const shown = selfUrlsOnly ? [] : articles;
    const siteUrl = absoluteUrl(language ? `/${language.toLowerCase()}` : '/');
    const atomSelfUrl = absoluteUrl(atomRoute);
    const rssSelfUrl = absoluteUrl(rssRoute);

    const feedUpdated =
      shown.length > 0
        ? contentLastModified(shown[0].frontmatter)
        : validatedInput.buildEpoch;

    const atomEntries = shown
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
      `<feed xmlns="http://www.w3.org/2005/Atom"${language ? ` xml:lang="${escapeHtml(language)}"` : ''}>` +
      `<id>${escapeHtml(siteUrl)}</id>` +
      `<title>${escapeHtml(publication.title)}</title>` +
      `<subtitle>${escapeHtml(publication.description)}</subtitle>` +
      `<updated>${escapeHtml(feedUpdated)}</updated>` +
      `<link href="${escapeHtml(atomSelfUrl)}" rel="self"/>` +
      `<link href="${escapeHtml(siteUrl)}" rel="alternate"/>` +
      atomEntries +
      '</feed>\n';

    const rssItems = shown
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
      (language ? `<language>${escapeHtml(language)}</language>` : '') +
      `<lastBuildDate>${escapeHtml(toRfc822(feedUpdated))}</lastBuildDate>` +
      `<atom:link href="${escapeHtml(rssSelfUrl)}" rel="self" type="application/rss+xml"/>` +
      rssItems +
      '</channel>' +
      '</rss>\n';

    return { atomXml, rssXml, rssSelfUrl, atomSelfUrl };
  };

  const main = buildPair(articles, ATOM_FEED_ROUTE, RSS_FEED_ROUTE);
  const podcastFeed = podcast
    ? buildPodcastFeed({
        podcast,
        validatedInput,
        authorsById,
        absoluteUrl,
        translations,
        selfUrlsOnly,
      })
    : undefined;
  /** @type {LanguageFeed[]} */
  const languageFeeds = (translations?.sections ?? []).map((section) => {
    const atomRoute = languageFeedRoute(section.segment, 'atom');
    const rssRoute = languageFeedRoute(section.segment, 'rss');
    return {
      language: section.language,
      atomRoute,
      rssRoute,
      ...buildPair(
        feedable
          .filter(
            (record) =>
              record.frontmatter.language.toLowerCase() === section.segment,
          )
          .slice(0, FEED_ITEM_LIMIT),
        atomRoute,
        rssRoute,
        section.language,
      ),
    };
  });
  return { ...main, ...podcastFeed, languageFeeds };
}

/**
 * @param {string} segment a language's URL segment
 * @param {'atom' | 'rss'} format
 * @returns {string} the un-joined route of that language's feed
 */
export function languageFeedRoute(segment, format) {
  return `/feed/${segment}/${format}.xml`;
}

/** @type {Readonly<Record<string, string>>} Listen media type -> the type Apple Podcasts accepts in an enclosure */
const PODCAST_ENCLOSURE_TYPES = Object.freeze({
  'audio/mpeg': 'audio/mpeg',
  'audio/mp4': 'audio/x-m4a',
});

/**
 * The podcast feed: RSS 2.0 with the iTunes namespace, one item per published,
 * indexable article that has Listen audio (newest first, at most
 * {@link FEED_ITEM_LIMIT}). It exists only with at least one such article.
 * Required tags are Apple Podcasts' (channel: title, description, language,
 * `itunes:image`, `itunes:category`, `itunes:explicit`; item: title,
 * `enclosure`, `guid`), with the recommended ones Apple names (`itunes:author`,
 * `link`, `pubDate`, `description`, `itunes:duration`).
 *
 * @param {object} options
 * @param {NonNullable<Parameters<typeof buildFeeds>[1]['podcast']>} options.podcast
 * @param {import('../../../types/index.d.ts').NormalizedBuildInput} options.validatedInput
 * @param {Map<string, {displayName: string}>} options.authorsById
 * @param {(route: string) => string} options.absoluteUrl
 * @param {import('./translations.js').TranslationResolution} [options.translations]
 * @param {boolean} options.selfUrlsOnly
 * @returns {{podcastXml: string, podcastSelfUrl: string} | undefined}
 */
function buildPodcastFeed({
  podcast,
  validatedInput,
  authorsById,
  absoluteUrl,
  translations,
  selfUrlsOnly,
}) {
  const { publication, baseUrl } = validatedInput;
  const { config } = podcast;
  const eligible = podcast.entries
    .filter(
      (entry) =>
        !isSeoNoindex(entry.record.frontmatter) &&
        (translations?.isListed(entry.record) ?? true),
    )
    .slice(0, FEED_ITEM_LIMIT);
  if (eligible.length === 0) return undefined;
  const podcastSelfUrl = absoluteUrl(PODCAST_FEED_ROUTE);
  if (selfUrlsOnly) return { podcastXml: '', podcastSelfUrl };
  const siteUrl = absoluteUrl('/');
  const author =
    publication.authorIds
      .map((id) => authorsById.get(id)?.displayName)
      .filter(Boolean)
      .join(', ') || publication.title;
  const coverUrl = escapeHtml(podcast.coverUrl ?? '');
  const items = eligible
    .map((entry) => {
      const { frontmatter } = entry.record;
      const itemUrl = absoluteUrl(contentRoute(frontmatter));
      const { audio, durationSeconds } = entry.listen;
      return (
        `<item>` +
        `<title>${escapeHtml(frontmatter.title)}</title>` +
        `<link>${escapeHtml(itemUrl)}</link>` +
        `<guid isPermaLink="true">${escapeHtml(itemUrl)}</guid>` +
        `<pubDate>${escapeHtml(toRfc822(frontmatter.publishedAt))}</pubDate>` +
        `<description>${escapeHtml(frontmatter.description ?? frontmatter.title)}</description>` +
        `<enclosure url="${escapeHtml(new URL(entry.href, baseUrl).toString())}" length="${audio.bytes}" type="${PODCAST_ENCLOSURE_TYPES[audio.mediaType]}"/>` +
        `<itunes:duration>${durationSeconds}</itunes:duration>` +
        `</item>`
      );
    })
    .join('');
  const podcastXml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">' +
    '<channel>' +
    `<title>${escapeHtml(publication.title)}</title>` +
    `<link>${escapeHtml(siteUrl)}</link>` +
    `<description>${escapeHtml(config.description ?? publication.description)}</description>` +
    `<language>${escapeHtml(publication.defaultLanguage)}</language>` +
    `<lastBuildDate>${escapeHtml(toRfc822(contentLastModified(eligible[0].record.frontmatter)))}</lastBuildDate>` +
    `<atom:link href="${escapeHtml(podcastSelfUrl)}" rel="self" type="application/rss+xml"/>` +
    `<itunes:author>${escapeHtml(author)}</itunes:author>` +
    (config.ownerEmail
      ? `<itunes:owner><itunes:name>${escapeHtml(author)}</itunes:name><itunes:email>${escapeHtml(config.ownerEmail)}</itunes:email></itunes:owner>`
      : '') +
    `<itunes:category text="${escapeHtml(config.category)}"/>` +
    `<itunes:explicit>${config.explicit ? 'true' : 'false'}</itunes:explicit>` +
    `<itunes:image href="${coverUrl}"/>` +
    `<image><url>${coverUrl}</url><title>${escapeHtml(publication.title)}</title><link>${escapeHtml(siteUrl)}</link></image>` +
    items +
    '</channel>' +
    '</rss>\n';
  return { podcastXml, podcastSelfUrl };
}
