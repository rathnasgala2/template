/**
 * `llms.txt` and `llms-full.txt` generation (the llmstxt.org format): a
 * Markdown index of the publication for language-model assistants, and one
 * plain-text file carrying every article in full.
 *
 * Only `status: "published"` content is listed. Unlisted content is
 * reachable by direct link and marked `noindex`; it is never advertised
 * here either.
 */

import { derivePublicBasePath, joinPublicRoute } from './route.js';
import { routeSegmentForLabel } from './route-labels.js';
import { compareUtf8Bytes } from './source-inventory.js';
import {
  contentLastModified,
  contentRoute,
  selectPublishedArticles,
} from './page-kinds.js';
import { getMessages } from './messages.js';

/** @type {Readonly<Record<string, string>>} */
const NAMED_ENTITIES = Object.freeze({
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
});

/**
 * Convert a sanitized HTML fragment to readable plain text. Tags are removed
 * first and entities decoded afterwards, so escaped markup in the source
 * stays literal text and can never be turned back into a tag.
 *
 * @param {string} html a render-policy-conformant HTML fragment
 * @returns {string} plain text with paragraph breaks, `#` headings and `-`
 *   list items
 */
export function htmlToText(html) {
  const stripped = html
    .replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(
      /<h([1-6])\b[^>]*>/gi,
      (_match, level) => `\n\n${'#'.repeat(Number(level))} `,
    )
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(
      /<\/(?:p|div|h[1-6]|pre|blockquote|ul|ol|table|tr|figure|section)\s*>/gi,
      '\n\n',
    )
    .replace(/<[^>]*>/g, '');
  return stripped
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body) => {
      if (body[0] === '#') {
        const code =
          body[1] === 'x' || body[1] === 'X'
            ? Number.parseInt(body.slice(2), 16)
            : Number.parseInt(body.slice(1), 10);
        return Number.isInteger(code) && code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : '';
      }
      return NAMED_ENTITIES[body.toLowerCase()] ?? match;
    })
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Build both documents.
 *
 * @param {import('../../../types/index.d.ts').NormalizedBuildInput} validatedInput
 * @param {object} urls absolute URLs of the sibling documents
 * @param {string} urls.rss
 * @param {string} urls.atom
 * @param {string} urls.sitemap
 * @param {string} urls.searchIndex
 * @param {string} urls.full this file's `llms-full.txt` sibling
 * @returns {{llmsTxt: string, llmsFullTxt: string}} the exact UTF-8 texts
 */
export function buildLlmsDocuments(validatedInput, urls) {
  const { publication, authors, content, basePath, baseUrl } = validatedInput;
  const messages = getMessages(publication.defaultLanguage);
  const authorsById = new Map(authors.map((author) => [author.id, author]));
  /**
   * @param {string} route an un-joined route
   * @returns {string} the absolute URL
   */
  const absoluteUrl = (route) =>
    new URL(
      joinPublicRoute(derivePublicBasePath(baseUrl, basePath), route),
      baseUrl,
    ).toString();
  const oneLine = (/** @type {string} */ value) =>
    value.replace(/\s+/g, ' ').trim();

  const articles = selectPublishedArticles(content);
  const pages = content
    .filter(
      (record) =>
        record.frontmatter.kind === 'page' &&
        record.frontmatter.status === 'published',
    )
    .sort((a, b) =>
      compareUtf8Bytes(
        contentRoute(a.frontmatter),
        contentRoute(b.frontmatter),
      ),
    );

  /**
   * @param {{title: string, url: string, description?: string}} item
   * @returns {string} one list line
   */
  const link = ({ title, url, description }) =>
    `- [${oneLine(title).replace(/[[\]]/g, '')}](${url})` +
    (description ? `: ${oneLine(description)}` : '');

  /** @type {Map<string, number>} */
  const seriesCounts = new Map();
  for (const record of [...articles, ...pages]) {
    const series = record.frontmatter.series;
    if (series) seriesCounts.set(series, (seriesCounts.get(series) ?? 0) + 1);
  }

  const authorNames = authors.map((author) => author.displayName);
  const intro =
    `${articles.length === 1 ? '1 article' : `${articles.length} articles`}` +
    (authorNames.length > 0 ? ` by ${authorNames.join(', ')}` : '') +
    `. Each article is a standalone page; the full text of every article is in llms-full.txt.`;

  /** @type {string[]} */
  const lines = [
    `# ${oneLine(publication.title)}`,
    '',
    `> ${oneLine(publication.description)}`,
    '',
    intro,
    '',
    '## Articles',
    '',
    ...articles.map((record) =>
      link({
        title: record.frontmatter.title,
        url: absoluteUrl(contentRoute(record.frontmatter)),
        description: record.frontmatter.description,
      }),
    ),
  ];
  if (pages.length > 0) {
    lines.push(
      '',
      '## Pages',
      '',
      ...pages.map((record) =>
        link({
          title: record.frontmatter.title,
          url: absoluteUrl(contentRoute(record.frontmatter)),
          description: record.frontmatter.description,
        }),
      ),
    );
  }
  if (seriesCounts.size > 0) {
    lines.push(
      '',
      '## Series',
      '',
      ...[...seriesCounts.keys()].sort().map((name) =>
        link({
          title: name,
          url: absoluteUrl(`/series/${routeSegmentForLabel(name)}`),
          description:
            /** @type {(c: string, n: string, p: string) => string} */ (
              messages.seriesPageDescription
            )(String(seriesCounts.get(name)), name, publication.title),
        }),
      ),
    );
  }
  lines.push(
    '',
    '## Optional',
    '',
    ...(articles.length > 0
      ? [
          link({
            title: 'Archive',
            url: absoluteUrl('/archive'),
            description: 'Every article by year',
          }),
        ]
      : []),
    link({
      title: 'Full text of every article',
      url: urls.full,
      description: 'Plain text',
    }),
    link({ title: 'RSS feed', url: urls.rss }),
    link({ title: 'Atom feed', url: urls.atom }),
    link({ title: 'Sitemap', url: urls.sitemap }),
    link({
      title: 'Search index',
      url: urls.searchIndex,
      description: 'JSON',
    }),
  );

  const fullSections = articles.map((record) => {
    const { frontmatter } = record;
    const names = frontmatter.authorIds
      .map((id) => authorsById.get(id)?.displayName)
      .filter(Boolean);
    return [
      `# ${oneLine(frontmatter.title)}`,
      '',
      `URL: ${absoluteUrl(contentRoute(frontmatter))}`,
      `Published: ${frontmatter.publishedAt}`,
      ...(frontmatter.updatedAt
        ? [`Updated: ${contentLastModified(frontmatter)}`]
        : []),
      ...(names.length > 0 ? [`Author: ${names.join(', ')}`] : []),
      ...(frontmatter.tags.length > 0
        ? [`Tags: ${frontmatter.tags.join(', ')}`]
        : []),
      ...(frontmatter.description
        ? ['', `> ${oneLine(frontmatter.description)}`]
        : []),
      '',
      htmlToText(record.body),
    ].join('\n');
  });
  const llmsFullTxt =
    [
      `# ${oneLine(publication.title)}`,
      '',
      `> ${oneLine(publication.description)}`,
      ...fullSections.flatMap((section) => ['', '---', '', section]),
    ].join('\n') + '\n';

  return { llmsTxt: `${lines.join('\n')}\n`, llmsFullTxt };
}
